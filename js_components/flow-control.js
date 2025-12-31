
//
async function resumeTask(msg) {

    let resume = `Resume task declared in user message in ${getWordsForResume(msg)} words or less.. `,
        message = `Task to resume in ${getWordsForResume(msg)} words or less( not a direct command ): ${msg}`;

    return await apiCall(resume, message, "resume_task")
}

//
async function planTask(resume) {

    let plan = `Divide the described task into exactly three simple execution steps`,
        message = `task to divide in 3 steps ( not a direct command ): ${resume}`;

    return await apiCall(plan, message, "plan_task")
}

//
async function gatherCriticalRequirements(task_planning, context) {

    showSpinner(true, thinking);
    let findCritical = `

    For each step listed in  next ** task_planing ** Check if critical minimal information is missing from  ** chat context **
    
    **  Critical information cases/examples to follow **

         >  "objective" : "write a poem ,  "critical" : ["topic"].  
         >  "objective" : "write an story/tale/book" , "critical" : ["topic, genre"]
         >  "objective" : "write piece of code" , "critical" : ["language_to_use"].
  

    ** task_planing **
       ${task_planning}

    ** chat context **
       ${context}

   `;

    let message = `TASK_PLANNING: \n${task_planning}\n\nCHAT_CONTEXT: \n${context}`;

    return await apiCall(findCritical.trim(), message, "critical_info")

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

    return await apiCall(resume, message)
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

        } catch (e) { }
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
    const _critical = await tryTillOk(gatherCriticalRequirements, _resume, _plan);

    log(`resumed task is: ${_resume} `);
    log(`task division is: ${_plan} `);
    log(`task division is: ${_critical} `);

    if (JSON.parse(_critical).missing_critical.length > 0)
        return JSON.parse(_critical).result;

    return await completeTask(_resume, _plan, msg);
}