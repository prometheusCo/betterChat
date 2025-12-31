
// For measurimg global exec time
const t0 = developing ? performance.now() : false;


// For use only in developing (gpt test key will be retired from open ai API dashboard after developement is done)
const testModelName = `gpt-4.1-mini`;
const gptTestKey = `${ENV.gptTestKey}`;// ENV obj is in a GIT ommited file so relax...

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
    log(error);
    throw new Error(error);
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
    body.stream = CONFIG.stream;

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

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

//
async function apiCall(prompt, instructions = "Be a helpful asistant", _responseFormat) {

    const input = [];

    const response = await fetch(CONFIG.endPointUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${keyUsed.trim()}`
        },
        body: JSON.stringify(makeJSON(prompt, instructions, _responseFormat))
    });

    if (!CONFIG.stream)
        return getRespFromJSON(await response.json());

    try { showSpinner(false); } catch (error) { }
    //
    //Handling streamed data


    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    let buffer = "";
    let fullText = "";

    while (true) {

        keep = true;
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop(); // línea incompleta

        for (const line of lines) {

            if (!line.startsWith("data: ")) continue;

            const payload = line.replace("data: ", "").trim();

            if (payload === "[DONE]") {
                time();
                return fullText;
            }

            const json = JSON.parse(payload);

            // estándar Responses API
            let delta =
                json.output_text ||
                json.delta ||
                json?.output?.[0]?.content?.[0]?.text;

            if (delta) {

                let _delta = delta.replace(/[{}]/g, "");

                fullText += delta;
                thinking.textContent += _delta;

                await delay(100);
                log(delta);

            }
        }
    }

    time();
    thinking.textContent += "\n \n";
    return fullText;

}

function processMessageSimple(msg) {
    promptCheck(msg);
    return apiCall(msg);
}


// Reduces hallucination when resuming tasks
const getWordsForResume = (msg) => msg.length > CONFIG.sentence_threshold_jump ?
    CONFIG.max_resume_words_a : max_resume_words_b;
