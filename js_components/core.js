
//
// Core Vars
//
//

// EndPoints list
var gptEndpoint = "https://api.openai.com/v1/responses";


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

//
function errorHandling(error) {
    log(error); throw new Error(error);
}

const isValid = v => v !== undefined && v !== null && v !== "";

//
function promptCheck(prompt) {

    if (isValid(prompt)) return true;

    errorHandling(`Prompt empty please provide one!`);
}

//
function makeJSON(prompt, instructions, _responseFormat = false) {

    let body = {}, input = [];

    isValid(instructions) ? input.push({ role: "system", content: instructions }) : null;
    input.push({ role: "user", content: prompt });

    body.input = input;
    body.model = modelNameUsed;

    if (!_responseFormat) return body;

    body.text = {};
    body.text.format = textFormats[_responseFormat];
    return body;
}

//
function getRespFromJSON(data = data.response, out = false) {

    let output = null;

    try {

        (!out) ?
            output = data.output[0].content[0].text || data.response?.output_text || false :
            output = data[out];

    } catch (e) { output = data.response; }

    if (!output) errorHandling(`bad response from API Server. \n Server full respose was: ${JSON.stringify(data)}`);
    return output;
}

//
async function apiCall(prompt, instructions = "Be a helpful asistant", _responseFormat) {

    const input = [];

    const response = await fetch(gptEndpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${keyUsed.trim()}`
        },
        body: JSON.stringify(makeJSON(prompt, instructions, _responseFormat))
    });

    const data = await response.json(); time();
    return getRespFromJSON(data);
}

function processMessageSimple(msg) {
    promptCheck(msg);
    return apiCall(msg);
}


// Reduces hallucination when resuming tasks
const getWordsForResume = (msg) => msg.length > CONFIG.sentence_threshold_jump ?
    CONFIG.max_resume_words_a : max_resume_words_b;
