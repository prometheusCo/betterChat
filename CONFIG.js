// Set to false when developing is done (it hides all debuging messages)
const developing = true;

const CONFIG = {

    endPointUrl: "https://api.openai.com/v1/responses",

    max_retry_attemps: 2,
    max_retry_attemps_info: "field above is used to limit APIs call retries",

    sentence_threshold_jump: 15,
    sentence_threshold_jump_info: `
    If a message from user has less words than the number above, we take option a bellow as max 
    words for response, otherwise well take option b. This measure is taken to limit output words when 
    users prompts are too short and LLMs tends to fill the gaps with extra words/ideas, causing 
    some deviation from original idea, and therefore hallucinations`,
    max_resume_words_a: 10,
    max_resume_words_b: 5,

    stream: true,
    stream_info: `Sets api behaviour regarding to return results in streaming or in a big chunk`


};