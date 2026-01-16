
let startIndex = 0;

//
async function resumeTask(msg) {

    const p = getResumePrompt(msg);
    return await apiCall(p[0], p[1], "resume_task");

}


//
//
async function gatherCriticalRequirement(task_planning, context, wudas) {

    showSpinner(true, thinking);
    const p = gatherCriticalRequirementsPrompt(task_planning, context, wudas);

    return await tryTillOk(() => apiCall(p[0], p[1], "critical_info"));

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
    const wudas = JSON.parse(_steps).what_user_didnt_asked_for;

    log(`wudas set to: ${wudas}`)
    const missing_info = [[], [], []];

    for (let i = 0; i < 3; i++) {

        if (!!prevMissing && prevMissing[i].length)
            continue;

        const result = JSON.parse(await gatherCriticalRequirement(steps[i], context, wudas));
        missing_info[i] = result.missing_critical;

        if (missingInfoDetected(result)) {

            log("Missing critical info detected. Early return.\n");
            return missing_info;
        }
    }

    log("No missing critical info in any step.\n");
    return [[], [], []];

}

//
//
async function planTask(resume) {

    showSpinner(true, thinking);
    const p = planTaskPrompt(resume);

    return await apiCall(p[0], p[1], "plan_task")
}


//
//
async function completeTask(_resume, plan, context) {

    if (!plan)
        plan = 'Answer user message, no complex planning needed.';

    const p = completeTaskPrompt(_resume, plan, context);

    saveResumesHistory(_resume, startIndex, getLastUserMsgIndex());
    clear();

    return await apiCall(p[0], p[1], "", false, true);

}


//
//
async function askForMissingDetail(missing_info) {

    const p = askForMissingDetailsPrompt(missing_info);

    return await apiCall(p[0], p[1], "", false)
}


//
//
async function createTags(_resume) {

    let p = createTagsprompts(_resume)

    return await apiCall(p[0], p[1], "cloud_tags", false);
}


//
//
async function tryTillOk(func, arg1, arg2 = null, arg3 = null) {

    let attempts = 0;
    let r;
    const max = CONFIG.max_retry_attemps;
    let httpErr = false;

    while (attempts < max) {

        try {
            console.log("tryTillOk attemp " + attempts);

            r = await func(arg1, arg2, arg3);
            JSON.parse(r);
            return r;

        } catch (e) {

            !httpErr ? httpErr = e : null;
            await wait(CONFIG.secs_to_wait_for_net_retry);
        }
        attempts++;
    }

    errorHandling(BAR, (!!httpErr ? httpErr : null));
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

    let prevTaskResume = chat_resume.at(-1)[0];
    let prevtaskResult = `No task has been completed yet`;

    try {
        prevtaskResult = document.querySelectorAll("div[resume]")[document.querySelectorAll("div[resume]").length - 1].innerText;
    } catch (error) { }

    const history = JSON.stringify(getLastInteractions(startIndex));

    return `
    \\\ Previous Task Completed resume: ${prevTaskResume}
    \\\ Previous task  Result:  ${prevtaskResult}
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
    related_tags = [];
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

        return await completeTask(JSON.parse(_resume).resume, false, context);
    }

    _plan = !currentPlan ? await tryTillOk(() => planTask(currenTask)) : currentPlan;
    currentPlan = _plan;

    _critical = await gatherCriticalRequirements(_plan, context, prevMissing)
    prevMissing = !prevMissing ? _critical : prevMissing;

    if (!hasMissing(_critical)) {
        showSpinner();
        return await completeTask(_resume, _plan, context);
    }

    return await askForMissingDetail(_critical);

}


//
//
//
function redoFlow(e) {

    let el = e.parentElement.parentElement; log(el);

    let taskToRepeat = el.getAttribute("resume");
    let taskToRepeatResult = el.innerText;

    let message = `
         Repeat current task so it gives a rigth outcome:
         
         > Objetive of task: {{ ${taskToRepeat} }}
         > Previous wrong result: {{${taskToRepeatResult}}}

         ** Outcome must be diferent **
         `;

    log(message);
    handleSend(message, false);

}
