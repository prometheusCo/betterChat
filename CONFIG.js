const CONFIG = {


    max_retry_attemps: 2,
    max_retry_attemps_info: "field above is used to limit APIs call retries",

    sentence_threshold_jump: 15,
    sentence_threshold_jump_info: `
    If a message from user has less words than the number above, we take option a bellow,
    otherwise well take option b. This measure is taken to limit output words when 
    users prompts are too shorts and LLMs tends to fill the gaps with extra words/ideas`,
    max_resume_words_a: 10,
    max_resume_words_b: 5,




};