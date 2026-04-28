// ===============================
// Flow Orchestration 
// ===============================

describe("Flow Orchestration tests", () => {

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

        // FIX window methods existence
        window.getResumePrompt = window.getResumePrompt || function () { };
        window.planTaskPrompt = window.planTaskPrompt || function () { };
        window.completeTaskPrompt = window.completeTaskPrompt || function () { };
        window.gatherCriticalRequirementsPrompt = window.gatherCriticalRequirementsPrompt || function () { };
        window.askForMissingDetailsPrompt = window.askForMissingDetailsPrompt || function () { };
        window.createTagsprompts = window.createTagsprompts || function () { };
        window.showSpinner = window.showSpinner || function () { };
        window.saveResumesHistory = window.saveResumesHistory || function () { };
        window.clear = window.clear || function () { };
        window.log = window.log || function () { };
        window.wait = window.wait || function () { return Promise.resolve(); };
        window.errorHandling = window.errorHandling || function () { };
        window.loadFromStorage = window.loadFromStorage || function () { return Promise.resolve("GLOBAL"); };

        // FIX async leakage
        spyOn(window, 'setTimeout').and.callFake((fn) => fn());

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

    });

    afterEach(() => {
        window.CONFIG = originalConfig;
        // document.body.innerHTML = "";
    });

    // ===============================
    // tryTillOk
    // ===============================

    it("tryTillOk_retries_max_and_calls_errorHandling", async () => {

        const fn = jasmine.createSpy().and.rejectWith(new Error("500"));

        const res = await tryTillOk(fn);

        expect(fn).toHaveBeenCalledTimes(CONFIG.max_retry_attemps);
        expect(window.wait).toHaveBeenCalledTimes(CONFIG.max_retry_attemps);
        expect(window.errorHandling).toHaveBeenCalledTimes(1);
        expect(res).toBeUndefined();
    });

    it("tryTillOk_retries_on_invalid_json_and_fails", async () => {

        const fn = jasmine.createSpy().and.resolveTo("invalid-json");

        const res = await tryTillOk(fn);

        expect(fn).toHaveBeenCalledTimes(CONFIG.max_retry_attemps);
        expect(window.wait).toHaveBeenCalledTimes(CONFIG.max_retry_attemps);
        expect(window.errorHandling).toHaveBeenCalled();
        expect(res).toBeUndefined();
    });

    it("tryTillOk_returns_valid_json_first_try", async () => {

        const payload = JSON.stringify({ ok: true });
        const fn = jasmine.createSpy().and.resolveTo(payload);

        const res = await tryTillOk(fn);

        expect(fn).toHaveBeenCalledTimes(1);
        expect(window.wait).not.toHaveBeenCalled();
        expect(res).toBe(payload);
    });

    // ===============================
    // processMessage - failure safety
    // ===============================

    it("processMessage_handles_resume_failure_without_state_corruption", async () => {

        spyOn(window, 'apiCall').and.rejectWith(new Error("500"));

        const res = await processMessage("msg");

        expect(window.errorHandling).toHaveBeenCalled();
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
        expect(window.apiCall.calls.count()).toBe(2);
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

        expect(window.saveResumesHistory).toHaveBeenCalledTimes(1);
        expect(window.clear).toHaveBeenCalledTimes(1);

        const parsed = JSON.parse(res);
        expect(parsed.done).toBeTrue();
    });

    // ===============================
    // DOM-dependent logic
    // ===============================

    it("getLastInteractions_extracts_pairs_correctly", () => {

        const root = document.createElement("div");
        root.innerHTML = `
            <div class="user-msg">Hi</div>
            <div>AI1</div>
            <div class="user-msg">Hello</div>
            <div>AI2</div>
        `;

        document.body.appendChild(root);

        const result = getLastInteractions(0);

        expect(result.length).toBe(2);
        expect(result[0]).toEqual({ user: "Hi", ai: "AI1" });
        expect(result[1]).toEqual({ user: "Hello", ai: "AI2" });
    });

    it("buildContext_contains_expected_sections", () => {

        window.chat_resume = [["task", [0, 1]]];

        const root = document.createElement("div");
        root.innerHTML = `<div resume>RESULT</div>`;
        document.body.appendChild(root);

        const ctx = buildContext("msg", 0, "GLOBAL");

        expect(ctx).toContain("Previous Task Completed resume");
        expect(ctx).toContain("Last user message: msg");
        expect(ctx).toContain("GLOBAL");
    });

});