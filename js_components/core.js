
//
// Core Vars
//
//

// EndPoints list
var gptEndpoint = "https://api.openai.com/v1/responses";

var jsonTouse = {

    model: null,
    input: [
        {
            role: "instructions",
            content: null
        },
        {
            role: "user",
            content: null
        }
    ]
};


//
// 
// CONF ZONE
//
//



// Set to false when developing is done (it hides all debuging messages)
const developing = true;
// For measurimg global exec time
const t0 = developing ? performance.now() : false;


// For use only in developing (gpt test key will be retired from open ai API dashboard after developement is done)
const testModelName = `gpt-4.1-mini`;
const gptTestKey = `${ENV.gptTestKey}`;

// Getting auth data from storage logic if in production.
const keyUsed = developing ? gptTestKey : getFromStorage(`key`);
// Getting  model name
const modelNameUsed = developing ? testModelName : getFromStorage(`modelName`);

//
// Core functions
//

const log = (msg) => developing ? console.log(msg) : null;
const time = () => !!t0 ? log(`exec time: ${performance.now() - t0} ms`) : null;

function errorHandling(error) {
    log(error); throw new Error(error);
}

const isValid = v => v !== undefined && v !== null && v !== "";

function promptCheck(prompt) {

    if (isValid(prompt)) return true;

    errorHandling(`Prompt empty please provide one!`);
}

function makeJSON(prompt, instructions) {
    const input = [];

    isValid(instructions) ? input.push({ role: "system", content: instructions }) : null;
    input.push({ role: "user", content: prompt });

    return {
        model: modelNameUsed,
        input
    };
}

function getRespFromJSON(data = data.response) {

    let output = data.output[0].content[0].text || data.response?.output_text || false;

    if (!output) errorHandling(`bad response from API Server. \n Server full respose was: ${JSON.stringify(data)}`);
    return output;
}

async function apiCall(prompt, instructions = "Be a helpful asistant",) {

    const input = [];

    const response = await fetch(gptEndpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${keyUsed.trim()}`
        },
        body: JSON.stringify(makeJSON(prompt, instructions))
    });

    const data = await response.json(); time();
    return getRespFromJSON(data);
}

function processMessageSimple(msg) {
    promptCheck(msg);
    return apiCall(msg);
}

// Reduces hallucination when resuming tasks
// I know it has magik numbers...
// TO_DO_LIST: Remove magik numbers
const getWordsForResume = (msg) => msg.length > 15 ? 10 : 5;
