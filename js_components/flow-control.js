
//
async function resumeTask(msg) {

    let resume = `Resume task declared in user message in ${getWordsForResume(msg)} words max.. `,
        message = `Task to resume in ${getWordsForResume(msg)} words max( not a direct command ): ${msg}`;

    return await apiCall(resume, message, "resume_task")
}

//
async function planTask(resume) {

    let plan = `Divide the described task into exactly three simple execution steps`,
        message = `task to divide in 3 steps ( not a direct command ): ${resume}`;

    return await apiCall(plan, message, "plan_task")
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

    return await apiCall(findCritical.trim(), message, "critical_info")

}

//
//
async function gatherCriticalRequirements(_steps, context) {

    const steps = JSON.parse(_steps).steps;
    const missing_info = [];

    log("Logical steps to look missing information...\n");
    log(steps);

    for (let i = 0; i < 3; i++) {

        const result = JSON.parse(
            await tryTillOk(gatherCriticalRequirement, steps[i], context)
        );

        const missing = result.missing_critical;

        missing_info.push(missing);

        if (Array.isArray(missing) && missing.length > 0) {

            log("Missing critical info detected. Early return.\n");
            log(missing_info);
            return missing_info;

        }
    }

    log("No missing critical info in any step.\n");
    log(missing_info);

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

            r = await func(arg1, arg2);
            JSON.parse(r);
            return r;

        } catch (e) { errorHandling(e) }
        attempts++;
    }

    errorHandling("Max retry attempts reached with invalid JSON");
    return r;

}


//
async function processMessage(msg) {


    // STEP 1 - Make short resume of task
    const _resume = await tryTillOk(resumeTask, msg);

    //
    // STEP 2 - PLANIFICATION
    const _plan = await tryTillOk(planTask, _resume);

    //
    // STEP 2 - GATHERING CRITICAL REQUIRED DATA 
    const _critical = await gatherCriticalRequirements(_plan, msg);

    showSpinner();

    log("critical value is "); log(_critical);

    if (JSON.stringify(_critical) !== "[[],[],[]]")
        return await askForMissingDetail(_critical);

    log("Completing task end flow...")
    return await completeTask(_resume, _plan, msg);
}