
let startIndex = 0;

//
async function resumeTask(msg) {

    let resume = `
    1 - Resume task declared in user message in ${getWordsForResume(msg)} words max... 
    2 - Evaluate complexity of given task following this scale (0.1 to 9.9):
        
         ** Asking for information about something would be scaled lower than 5 **
         ** Asking for information about someone would be scaled lower than 5 **

         ** Any request that involves creativity writing or coding  would be rate from 6 to 10 **
    3- Deliver original message lang iso code example: [es, en...]
         `

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
    > You dont need explicit confirmation for information explicitly detailed in context.
    > Use ${CONFIG.max_output_words} words max for each asked output properties.
   `;

    let message = `TASK_PLANNING: \n${task_planning}\n\nCHAT_CONTEXT: \n${context}`;
    return await tryTillOk(() => apiCall(findCritical.trim(), message, "critical_info"));

}

//
//
function missingInfoDetected(result) {

    let mode;
    try { mode = result.mode; } catch (e) { return false };

    if (mode === "ask_for_missing_info")
        return true;

    return false;

}

//
//
async function gatherCriticalRequirements(_steps, context, prevMissing) {

    const steps = JSON.parse(_steps).steps;
    const missing_info = [[], [], []];

    for (let i = 0; i < 3; i++) {

        if (!!prevMissing && prevMissing[i].length)
            continue;

        const result = JSON.parse(await tryTillOk(gatherCriticalRequirement, steps[i], context));
        missing_info[i] = result.missing_critical;

        if (missingInfoDetected(result)) {

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

    let plan = `
        Divide the described task into exactly three simple execution steps`,
        message = `task to divide in 3 steps(not a direct command): ${resume}
        > Use ${CONFIG.max_output_words} words max for each asked output properties.
        > For all planned steps a purpose must be set.
        `;

    return await apiCall(plan, message, "plan_task")
}


async function completeTask(_resume, plan, context) {

    let resume = `Complete  task: { { ${_resume} } } following this plan: { { ${plan} } } . Output language { { ${lang} } } `,
        message = `Context for the current task: ${context}.Finally: be breve and concise `;

    saveResumesHistory(_resume, startIndex, getLastUserMsgIndex());
    clear();
    return await apiCall(resume, message, "", false);

}

//
//
async function askForMissingDetail(missing_info) {

    let resume = `Ask nicely for this missing info - dont enunciate or narrate or explain your answer, just ask for
    missing info directly:  ${JSON.stringify(missing_info)} `,
        message = `Output language { { ${lang} } }`;

    return await apiCall(resume, message, "", false)
}

async function createTags(_resume) {

    let tags = `Given this topic: { { ${_resume} } }, suggest 3 to ${CONFIG.max_suggested_tags} dive in related topics,
    so user can learn more about it.Use output language -> ${lang} `,
        message = ``;

    return await apiCall(tags, message, "cloud_tags", false);
}

//
//
async function tryTillOk(func, arg1, arg2 = null) {

    let attempts = 0;
    let r;
    const max = CONFIG.max_retry_attemps;

    while (attempts < max) {

        try {

            r = await func(arg1, arg2); //log(` r result ${ JSON.stringify(r) } `)
            JSON.parse(r);
            return r;

        } catch (e) { errorHandling("", e) }
        attempts++;
    }

    errorHandling(BAR);
}

//
//
function getLastInteractions(startIndex = 0) {

    const userNodes = Array.from(document.querySelectorAll(".user-msg"));
    const interactions = [];

    // Walk backwards through user messages
    for (let i = startIndex; i < userNodes.length; i++) {

        const userNode = userNodes[i];
        const aiNode = userNode.nextElementSibling;

        interactions.push({
            user: userNode.textContent.trim(),
            ai: aiNode ? aiNode.textContent.trim() : null
        });
    }

    return interactions;
}


//
// Context expansion helper
//
function buildContext(baseMsg, startIndex, GLOBAL_CONTEXT) {

    prevTaskResume = chat_resume.at(-1)[0];

    const history = JSON.stringify(getLastInteractions(startIndex));

    return `
    \\\ Prev Task resume: ${prevTaskResume}
    \\\ Chat history: {{ ${history} }} 
    \\\ Last user message: ${baseMsg}
    ... Optional context that may be useful: ${GLOBAL_CONTEXT}... 
    Never reference to this context in your answer, just use it if applied, dont talk about.`;

}


//
//
function saveResumesHistory(resume, start = false, end = false) {

    if (chat_resume[0][0] === "No goal defined yet - Prompt something to start")
        chat_resume.shift();

    (!end) ?
        chat_resume.push([JSON.parse(resume).resume, [start, start]])
        : chat_resume.at(-1)[1][1] = end;

    saveStorage(`chat_resume`, JSON.stringify(chat_resume));
}


const hasMissing = c => c.some(step => step.length > 0);

//
//
// Main flow code...
//
//
let currentDepth = CONFIG.base_deep;
let currenTask = false;
let currentPlan = false;
let prevMissing = false;

function clear() {

    currenTask = false;
    currentPlan = false;
    prevMissing = false;
}


//
//
//
async function processMessage(msg) {

    try { startIndex = chat_resume.at(-1)[1][1] } catch (error) { }

    let _resume, _plan, _critical, context;
    let GLOBAL_CONTEXT = await loadFromStorage(`ai_memory`);

    context = buildContext(msg, startIndex, GLOBAL_CONTEXT);

    !currenTask ? _resume = await tryTillOk(() => resumeTask(context)) : _resume = currenTask;
    !currenTask ? saveResumesHistory(_resume, startIndex, false) : null;
    currenTask = _resume;

    lang = lang === null ?
        JSON.parse(_resume).iso_code_user_message_lang : lang;

    if (JSON.parse(_resume).complexity_level_from_1_to_10 < CONFIG.complexity_level_threshold) {

        showSpinner();
        log("non complex task detected, early exit");

        localStorage.getItem("learningMode") === "true" ?
            createTags(_resume).then((tags) => related_tags = tags) : null;

        return await completeTask(JSON.parse(_resume).resume, _plan, context);
    }

    _plan = !currentPlan ? await tryTillOk(() => planTask(JSON.parse(_resume).resume)) : currentPlan;
    currentPlan = _plan;

    _critical = await gatherCriticalRequirements(_plan, context, prevMissing)
    prevMissing = !prevMissing ? _critical : prevMissing;

    if (!hasMissing(_critical)) {
        showSpinner();
        return await completeTask(_resume, _plan, context);
    }

    return await askForMissingDetail(_critical);

}

