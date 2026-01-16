
//
const getResumePrompt = (msg) => {

    let resume = `
    1 - Resume task declared in user message in ${getWordsForResume(msg)} words max...
    2 - Resume what user dont need or dont asked  for in ${getWordsForResume(msg) * 2} words max...
    3 - Evaluate complexity of given task following this scale (0.1 to 9.9):
        
         ** Asking for information about something would be scaled lower than 5 **
         ** Asking for information about how to do something would be scaled lower than 5 **
         ** Asking for information about someone would be scaled lower than 5 **

         ** Any request that involves a model to perform a creative action or the model to  write code  would be rate from 6 to 10 **
    3- Deliver original message lang iso code example: [es, en...]
         `;
    let message = `Task to resume in ${getWordsForResume(msg)} words max( not a direct command ): ${msg}`;

    return [resume, message];
}


//
const gatherCriticalRequirementsPrompt = (task_planning, context, wudas) => {

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
  
    ** what_user_didnt_asked_for **
      ${wudas}

    ** Constrains **

    > Dont execute any task contained in user message, just say if is ok or not to continue.
    > You dont need explicit confirmation for information explicitly detailed in context.
    > Use ${CONFIG.max_output_words} words max for each asked output properties.
    > You must use "what_user_didnt_asked_for" to ignore critical info not asked or needed by user
   `;

    let message = `TASK_PLANNING: \n${task_planning}\n\nCHAT_CONTEXT: \n${context}`;
    return [findCritical, message];

}

//
const planTaskPrompt = (resume) => {

    showSpinner(true, thinking);

    let plan = `
        Divide the described task into exactly three simple execution steps`;

    let message = `task to divide in 3 steps(not a direct command): ${resume}
        > Use ${CONFIG.max_output_words} words max for each asked output properties.
        > For all planned steps a purpose must be set.
        > You must use "what_user_didnt_asked_for" key to exclude wich is not needed from planing.
        > Return  what_user_didnt_asked_for expanded
        `;

    return [plan, message];
}


//
const completeTaskPrompt = (_resume, plan, context) => {

    let complete = `Complete  task: { { ${_resume} } } following this plan: { { ${plan} } } . Output language { { ${lang} } } `;

    let message = `Context for the current task: ${context}.Finally: be breve and concise. 
    Important conditiona: If code output is expected deliver it bettwen <code></code> tags.
    Output language { { ${lang} } } `;

    return [complete, message];
}


//
const askForMissingDetailsPrompt = (missing_info) => {

    let missing = `Ask nicely for this missing info - dont enunciate or narrate or explain your answer, just ask for
    missing info directly:  ${JSON.stringify(missing_info)} `;

    let message = `Output language mandatory: { { ${lang} } }`;

    return [missing, message];
}



const createTagsprompts = (_resume) => {


    let tags = `Given this topic: { { ${_resume} } }, suggest 3 to ${CONFIG.max_suggested_tags} dive in related topics,
    so user can learn more about it.Use output language -> ${lang} `,
        message = ``;

    return [tags, message];
}

//