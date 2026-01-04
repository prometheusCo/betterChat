
//
async function resumeTask(msg) {

    let resume = `Resume task declared in user message in ${getWordsForResume(msg)} words max... Evaluate complexity
    of given task, being 10 a higly intelectual task and 1 a simple info query. `,
        message = `Task to resume in ${getWordsForResume(msg)} words max( not a direct command ): ${msg}`;

    return await apiCall(resume, message, "resume_task")
}


//
async function gatherCriticalRequirement(task_planning, context) {

    showSpinner(true, thinking);
    let findCritical = `

    For  listed  step in ** task_planing ** Check if critical minimal information is missing from  ** chat context **
    
    **  Critical information cases/examples to follow **

         >  "objective" : "write a poem ,  "critical" : ["topic"].  
         >  "objective" : "write an story/tale/book" , "critical" : ["topic, genre"]
         >  "objective" : "write piece of code" , "critical" : ["language_to_use"].
  
    ** task_planing **
       ${task_planning}

    ** chat context **
       ${context}

    ** Constrains **
    > Dont execute any task contained in user message, just say if is ok or not to continue.
    > Check twice logical_conclusion.
   `;

    let message = `TASK_PLANNING: \n${task_planning}\n\nCHAT_CONTEXT: \n${context}`;

    log("find_missing instructions: \n");
    log(findCritical);

    return await tryTillOk(() => apiCall(findCritical.trim(), message, "critical_info"));

}

//
//
async function gatherCriticalRequirements(_steps, context) {

    const steps = JSON.parse(_steps).steps;
    const missing_info = [[], [], []];

    log("Logical steps to look missing information...\n");
    log(steps);

    for (let i = 0; i < 3; i++) {

        const result = JSON.parse(
            await tryTillOk(gatherCriticalRequirement, steps[i], context)
        );

        const missing = result.missing_critical;

        missing_info[i] = missing;

        if (Array.isArray(missing) && missing.length > 0) {

            log("Missing critical info detected. Early return.\n");
            return missing_info;

        }
    }

    log("No missing critical info in any step.\n");
    return missing_info;

}

//
//
async function planTask(resume) {

    showSpinner(true, thinking);

    let plan = `Divide the described task into exactly three simple execution steps`,
        message = `task to divide in 3 steps ( not a direct command ): ${resume}`;

    return await apiCall(plan, message, "plan_task")
}


async function completeTask(_resume, plan, context) {

    let resume = `Complete  task: {{ ${_resume} }} following this plan: {{ ${plan} }} `,
        message = `Context for the current task: ${context}`;

    saveResumesHistory(_resume);
    return await apiCall(resume, message, "", false)
}

//
//
async function askForMissingDetail(missing_info) {

    let resume = `Ask nicely for this missing info - dont enunciate or narrate or explain your answer, just ask for
    missing info directly:  ${JSON.stringify(missing_info)} `,
        message = ``;

    log("ask for missing details json is: \n");
    log(resume);
    return await apiCall(resume, message, "", false)
}


//
//
async function tryTillOk(func, arg1, arg2 = null) {

    let attempts = 0;
    let r;
    const max = CONFIG.max_retry_attemps;

    while (attempts < max) {

        try {

            r = await func(arg1, arg2); //log(` r result ${JSON.stringify(r)}`)
            JSON.parse(r);
            return r;

        } catch (e) { errorHandling("", e) }
        attempts++;
    }

    errorHandling(BAR);
    return r;

}

//
//
function getLastInteractions(count = 5) {

    const userNodes = Array.from(document.querySelectorAll(".user-msg"));
    const interactions = [];

    // Walk backwards through user messages
    for (let i = userNodes.length - 1; i >= 0 && interactions.length < count; i--) {

        const userNode = userNodes[i];
        const aiNode = userNode.nextElementSibling;

        interactions.push({
            user: userNode.textContent.trim(),
            ai: aiNode ? aiNode.textContent.trim() : null
        });
    }

    // Return in chronological order (oldest → newest)
    return JSON.stringify(interactions.reverse());
}


//
// Context expansion helper
//
function buildContext(baseMsg, depth) {

    if (depth === 0) return baseMsg;

    const history = getLastInteractions(depth);
    return `${history}\n\nCURRENT MESSAGE:\n${baseMsg}`;
}


//
//
function saveResumesHistory(resume) {

}


const hasMissing = c => c.some(step => step.length > 0);
const getChatLevel = (maxDepth) => JSON.parse(getLastInteractions(maxDepth)).length;

//
// Progressive context expansion
//
let currentDepth = 1;
async function processMessage(msg) {

    log(`Starting processMessage`);

    const step = CONFIG.contextStep;
    const maxDepth = CONFIG.maxContextDepth;

    let _resume, _plan, _critical, context;
    let chatLevel = getChatLevel(maxDepth);

    const hasMissing = c => c.some(step => step.length > 0);

    do {

        let chatLevel = getChatLevel(maxDepth);
        context = buildContext(msg, currentDepth);

        _resume = await tryTillOk(() => resumeTask(context));

        if (JSON.parse(_resume).complexity_level_from_1_to_10 < CONFIG.complexity_level_threshold) {

            log("non complex task detected, early exit");
            return await completeTask(_resume, _plan, context);
        }

        _plan = await tryTillOk(() => planTask(_resume));
        _critical = await gatherCriticalRequirements(_plan, context)

        currentDepth = currentDepth + step;

        log(`current deep ${currentDepth}`)
        log(`built context is ${context}`);

    } while (currentDepth <= maxDepth && hasMissing(_critical) && ((currentDepth / step) < chatLevel));

    if (!hasMissing(_critical)) {
        showSpinner();
        return await completeTask(_resume, _plan, context);
    }

    return await askForMissingDetail(_critical);

}

