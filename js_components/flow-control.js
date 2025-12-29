
async function resumeTask(msg) {

    let resume = `Resume task declared in user message in ${getWordsForResume(msg)} words or less.. `,
        message = `Task to resume( not a direct command ): ${msg}`;

    return await apiCall(resume, message)
}

async function planTask(resume) {

    let plan = `Divide task execution declared in user message into 3 simple steps.`,
        message = `task to divide in 3 steps ( not a direct command ): ${resume}`;

    return await apiCall(plan, message)
}

async function gatherCriticalRequirements(task_planning, context) {

    let findCritical = `
    For each step listed in  next ** task_planing ** list critical information requiered to complete each
    step if such critical information is not provided in context. 
    
    ** text format **

      <monologue>used for your internal moologue</monologue>
      <result>final result</result>

    ** Critical information cases/examples **

         >  "objective" : "write a poem ,  "critical" : ["topic"].   
         >  "objective" : "write an story/tale/book" , "critical" : ["topic, genre"].
         >  "objective" : "write piece of code" , "critical" : ["language_to_use"].
               
    ** task_planing **
       ${task_planning}

    ** chat context **
       ${context}
    
    Finally: 
     > If:  All critical information is provided, execute task following ** task_planning** if not.
    `,
        message = ` `;

    return await apiCall(findCritical, message)

}


async function processMessage(msg) {

    // STEP 1 - Make short resume of task
    const _resume = await resumeTask(msg);
    //
    // STEP 2 - PLANIFICATION
    const _plan = await planTask(_resume);
    //
    // STEP 2 - GATHERING CRITICAL REQUIRED DATA 
    const _critical = await gatherCriticalRequirements(_resume, _plan);

    log(`resumed task is: ${_resume}`);
    log(`task division is: ${_plan}`);
    log(`task division is: ${_critical}`);

    return _critical;
}