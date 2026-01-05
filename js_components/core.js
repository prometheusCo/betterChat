
// For measurimg global exec time
const t0 = developing ? performance.now() : false;
let modelNameUsed = null;
let related_tags;

//Model name is not critical info so it can be decrypted here
loadFromStorage(`model`).then((key) => modelNameUsed = key)

//
// Core functions
//

const updateThinking = () => thinking = document.getElementById(`monologue-${document.querySelectorAll(".user-msg").length}]`);
const updateLastUserMsg = () => lastUserMsg = document.getElementsByClassName("user_message")[document.getElementsByClassName("user_message").length - 1]

const scrollChatEnd = () => {

    let cth = 0;
    try {
        cth = document.querySelectorAll(`.tag-cloud`)[document.querySelectorAll(`.tag-cloud`).length - 1].scrollHeight;
    } catch (error) { }

    chatArea.scrollTo(0, chatArea.scrollHeight + (localStorage.getItem('learningMode') === "true" ? cth : 0))
};

const log = (msg) => developing ? console.log(msg) : null;
const time = () => !!t0 ? log(`exec time: ${performance.now() - t0} ms`) : null;


//
function errorHandling(errorCode, error = null) {

    try {

        let e = new errorCode();
        !!e.action ? e.action() : null

        throw e;

    } catch (e) {
        throw new Error(error);
    }
    return;

}

const isValid = v => v !== undefined && v !== null && v !== "";

//
function promptCheck(prompt) {

    if (isValid(prompt)) return true;

    errorHandling(EPG);
}

//
function makeJSON(prompt, instructions, _responseFormat = false) {

    let body = {}, input = [];

    isValid(instructions) ? input.push({ role: "system", content: instructions }) : null;
    input.push({ role: "user", content: prompt });

    body.input = input;
    body.model = modelNameUsed;
    body.stream = _responseFormat !== "cloud_tags" ? CONFIG.stream : false;

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

    if (!output) errorHandling();
    return output;
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

//
async function apiCall(prompt, instructions = "Be a helpful asistant", _responseFormat = "", showThinking = true) {

    const input = [];
    const _key = await loadFromStorage(`apiKey`);

    const response = await fetch(CONFIG.endPointUrl, {

        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${_key.trim()}`
        },
        temperature: 0.1,
        top_p: 1.0,
        presence_penalty: 0,
        frequency_penalty: 0,
        body: JSON.stringify(makeJSON(prompt, instructions, (_responseFormat === "" ? false : _responseFormat)))
    });

    if (!CONFIG.stream || _responseFormat === "cloud_tags")
        return getRespFromJSON(await response.json());

    try { showSpinner(false); } catch (error) { }
    //
    //Handling streamed data

    updateThinking();
    updateLastUserMsg();

    const isLight = document.querySelectorAll('.light-mode').length > 0;
    isLight ? thinking.classList.add('ligthText') : thinking.classList.remove('ligthText');

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
                showThinking ? thinking.textContent += _delta : lastUserMsg.textContent += delta;

                await delay(100);
                scrollChatEnd();

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
    CONFIG.max_resume_words_a : CONFIG.max_resume_words_b;


function setLearningMode() {

    const learningMode = localStorage.getItem(`learningMode`) ?? "false";

    if (learningMode !== "true")
        return;

    learningButton.classList.add("learning-active");

}