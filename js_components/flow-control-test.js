
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


// this unit test are pro level ??? 



// ===============================
// Flow Orchestration - Senior Suite
// ===============================

describe("Flow Orchestration - Senior Level", () => {

    let originalConfig;

    beforeEach(() => {

        jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;

        // Preserve original CONFIG if exists
        originalConfig = window.CONFIG;

        // Fresh CONFIG
        window.CONFIG = {
            max_retry_attemps: 3,
            secs_to_wait_for_net_retry: 0,
            complexity_level_threshold: 5,
            base_deep: 1
        };

        // FULL state reset (critical)
        window.chat_resume = [["No goal defined yet - Prompt something to start", [0, 0]]];
        window.related_tags = [];
        window.lang = null;
        window.currenTask = false;
        window.currentPlan = false;
        window.prevMissing = false;
        window.startIndex = 0;

        // PROMPTS
        spyOn(window, 'getResumePrompt').and.returnValue(['a', 'b']);
        spyOn(window, 'planTaskPrompt').and.returnValue(['a', 'b']);
        spyOn(window, 'completeTaskPrompt').and.returnValue(['a', 'b']);
        spyOn(window, 'gatherCriticalRequirementsPrompt').and.returnValue(['a', 'b']);
        spyOn(window, 'askForMissingDetailsPrompt').and.returnValue(['a', 'b']);
        spyOn(window, 'createTagsprompts').and.returnValue(['a', 'b']);

        // SIDE EFFECTS
        spyOn(window, 'showSpinner');
        spyOn(window, 'saveResumesHistory');
        spyOn(window, 'clear').and.callThrough();
        spyOn(window, 'log');

        // ASYNC UTILS
        spyOn(window, 'wait').and.resolveTo();

        // ERROR HANDLING
        spyOn(window, 'errorHandling').and.stub();

        // STORAGE
        spyOn(window, 'loadFromStorage').and.resolveTo("GLOBAL");

        // DOM isolation
        document.body.innerHTML = "";

    });

    afterEach(() => {
        window.CONFIG = originalConfig;
    });

    // ===============================
    // tryTillOk
    // ===============================

    it("tryTillOk_retries_max_and_calls_errorHandling", async () => {

        const fn = jasmine.createSpy().and.rejectWith(new Error("500"));

        const res = await tryTillOk(fn);

        expect(fn).toHaveBeenCalledTimes(CONFIG.max_retry_attemps);
        expect(wait).toHaveBeenCalledTimes(CONFIG.max_retry_attemps);
        expect(errorHandling).toHaveBeenCalledTimes(1);
        expect(res).toBeUndefined();
    });

    it("tryTillOk_retries_on_invalid_json_and_fails", async () => {

        const fn = jasmine.createSpy().and.resolveTo("invalid-json");

        const res = await tryTillOk(fn);

        expect(fn).toHaveBeenCalledTimes(CONFIG.max_retry_attemps);
        expect(wait).toHaveBeenCalledTimes(CONFIG.max_retry_attemps);
        expect(errorHandling).toHaveBeenCalled();
        expect(res).toBeUndefined();
    });

    it("tryTillOk_returns_valid_json_first_try", async () => {

        const payload = JSON.stringify({ ok: true });
        const fn = jasmine.createSpy().and.resolveTo(payload);

        const res = await tryTillOk(fn);

        expect(fn).toHaveBeenCalledTimes(1);
        expect(wait).not.toHaveBeenCalled();
        expect(res).toBe(payload);
    });

    // ===============================
    // processMessage - failure safety
    // ===============================

    it("processMessage_handles_resume_failure_without_state_corruption", async () => {

        spyOn(window, 'apiCall').and.rejectWith(new Error("500"));

        const res = await processMessage("msg");

        expect(errorHandling).toHaveBeenCalled();
        expect(res).toBeUndefined();

        expect(currenTask).toBeFalsy();
        expect(currentPlan).toBeFalsy();
        expect(prevMissing).toBeFalsy();
    });

    // ===============================
    // processMessage - full flow
    // ===============================

    it("processMessage_executes_full_flow_correctly", async () => {

        const calls = [];

        spyOn(window, 'apiCall').and.callFake((a, b, c) => {

            calls.push(c);

            if (c === "resume_task") {
                return Promise.resolve(JSON.stringify({
                    resume: "task",
                    complexity_level_from_1_to_10: 8,
                    iso_code_user_message_lang: "en"
                }));
            }

            if (c === "plan_task") {
                return Promise.resolve(JSON.stringify({
                    steps: [1, 2, 3],
                    what_user_didnt_asked_for: []
                }));
            }

            if (c === "critical_info") {
                return Promise.resolve(JSON.stringify({
                    mode: "ok",
                    missing_critical: []
                }));
            }

            return Promise.resolve(JSON.stringify({ done: true }));
        });

        const res = await processMessage("msg");
        const parsed = JSON.parse(res);

        expect(parsed.done).toBeTrue();

        expect(calls).toEqual([
            "resume_task",
            "plan_task",
            "critical_info",
            "critical_info",
            "critical_info",
            ""
        ]);
    });

    // ===============================
    // missing info branch
    // ===============================

    it("processMessage_returns_missing_info_prompt", async () => {

        spyOn(window, 'apiCall').and.callFake((a, b, c) => {

            if (c === "resume_task") {
                return Promise.resolve(JSON.stringify({
                    resume: "task",
                    complexity_level_from_1_to_10: 8,
                    iso_code_user_message_lang: "en"
                }));
            }

            if (c === "plan_task") {
                return Promise.resolve(JSON.stringify({
                    steps: [1, 2, 3],
                    what_user_didnt_asked_for: []
                }));
            }

            if (c === "critical_info") {
                return Promise.resolve(JSON.stringify({
                    mode: "ask_for_missing_info",
                    missing_critical: ["field"]
                }));
            }

            return Promise.resolve(JSON.stringify({ ask: true }));
        });

        const res = await processMessage("msg");
        const parsed = JSON.parse(res);

        expect(parsed.ask).toBeTrue();
    });

    // ===============================
    // low complexity branch
    // ===============================

    it("processMessage_short_circuits_low_complexity", async () => {

        spyOn(window, 'apiCall').and.callFake((a, b, c) => {

            if (c === "resume_task") {
                return Promise.resolve(JSON.stringify({
                    resume: "simple",
                    complexity_level_from_1_to_10: 1,
                    iso_code_user_message_lang: "en"
                }));
            }

            return Promise.resolve(JSON.stringify({ done: true }));
        });

        const res = await processMessage("msg");
        const parsed = JSON.parse(res);

        expect(parsed.done).toBeTrue();
        expect(apiCall.calls.count()).toBe(2);
    });

    // ===============================
    // gatherCriticalRequirements
    // ===============================

    it("gatherCriticalRequirements_stops_on_first_missing", async () => {

        const apiSpy = spyOn(window, 'apiCall').and.callFake((a, b, c) => {

            if (c === "critical_info") {
                return Promise.resolve(JSON.stringify({
                    mode: "ask_for_missing_info",
                    missing_critical: ["x"]
                }));
            }

            return Promise.resolve("{}");
        });

        const plan = JSON.stringify({
            steps: [1, 2, 3],
            what_user_didnt_asked_for: []
        });

        const res = await gatherCriticalRequirements(plan, "ctx", null);

        expect(apiSpy).toHaveBeenCalledTimes(1);
        expect(res[0]).toEqual(["x"]);
    });

    it("gatherCriticalRequirements_skips_prevMissing_steps", async () => {

        const apiSpy = spyOn(window, 'apiCall').and.resolveTo(JSON.stringify({
            mode: "ok",
            missing_critical: []
        }));

        const plan = JSON.stringify({
            steps: [1, 2, 3],
            what_user_didnt_asked_for: []
        });

        const prevMissing = [["a"], [], []];

        await gatherCriticalRequirements(plan, "ctx", prevMissing);

        expect(apiSpy).toHaveBeenCalledTimes(2);
    });

    // ===============================
    // state reuse
    // ===============================

    it("processMessage_reuses_resume_between_calls", async () => {

        let resumeCalls = 0;

        spyOn(window, 'apiCall').and.callFake((a, b, c) => {

            if (c === "resume_task") {
                resumeCalls++;
                return Promise.resolve(JSON.stringify({
                    resume: "task",
                    complexity_level_from_1_to_10: 8,
                    iso_code_user_message_lang: "en"
                }));
            }

            if (c === "plan_task") {
                return Promise.resolve(JSON.stringify({
                    steps: [1, 2, 3],
                    what_user_didnt_asked_for: []
                }));
            }

            if (c === "critical_info") {
                return Promise.resolve(JSON.stringify({
                    mode: "ok",
                    missing_critical: []
                }));
            }

            return Promise.resolve(JSON.stringify({ done: true }));
        });

        await processMessage("msg1");
        await processMessage("msg2");

        expect(resumeCalls).toBe(1);
    });

    // ===============================
    // completeTask
    // ===============================

    it("completeTask_executes_side_effects_and_returns_raw_response", async () => {

        spyOn(window, 'apiCall').and.resolveTo(JSON.stringify({ done: true }));

        const res = await completeTask("res", "plan", "ctx");

        expect(saveResumesHistory).toHaveBeenCalledTimes(1);
        expect(clear).toHaveBeenCalledTimes(1);

        const parsed = JSON.parse(res);
        expect(parsed.done).toBeTrue();
    });

    // ===============================
    // DOM-dependent logic
    // ===============================

    it("getLastInteractions_extracts_pairs_correctly", () => {

        document.body.innerHTML = `
            <div class="user-msg">Hi</div>
            <div>AI1</div>
            <div class="user-msg">Hello</div>
            <div>AI2</div>
        `;

        const result = getLastInteractions(0);

        expect(result.length).toBe(2);
        expect(result[0]).toEqual({ user: "Hi", ai: "AI1" });
        expect(result[1]).toEqual({ user: "Hello", ai: "AI2" });
    });

    it("buildContext_contains_expected_sections", () => {

        window.chat_resume = [["task", [0, 1]]];

        document.body.innerHTML = `<div resume>RESULT</div>`;

        const ctx = buildContext("msg", 0, "GLOBAL");

        expect(ctx).toContain("Previous Task Completed resume");
        expect(ctx).toContain("Last user message: msg");
        expect(ctx).toContain("GLOBAL");
    });

});