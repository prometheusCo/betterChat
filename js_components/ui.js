//
// This should be improved so can be multilingual
//


//
// Faq info
const faqData = [
    {
        title: "What is this project?",
        content:
            "It’s a minimalistic web frontend to interact with the OpenAI API. Unlike typical chat UIs that rely on one long prompt, this app orchestrates the workflow in JavaScript, enforcing a stable, auditable pipeline for more consistent & smart outputs."
    },
    {
        title: "What are the main benefits vs a standard chat UI?",
        content:
            "The code-orchestrated flow reduces variability between answers, enables validations/heuristics before continuing. This generally yields more consistent and smart behavior than a monolithic prompt approach."
    },
    {
        title: "What is Learning Mode?",
        content:
            "After each response, (if option enabled )the UI shows a tag cloud under the message with related concepts. You can use these tags to explore associated topics and deepen understanding. "
    },
    {
        title: "Which AI providers/models are supported?",
        content:
            "The frontend is designed to work with the OpenAI API. Ollama API will be added in a future."
    },
    {
        title: "Is my data secure?",
        content: "Yes. All sensitive data is stored on your device—including API keys, endpoints, preferences, and memory—is encrypted locally. This information never leaves your device except when sent directly to your selected AI provider during a request. No intermediary servers are involved."
    }

];


const settingsSchema = [

    { id: 'model', label: 'Model Name', placeholder: 'e.g. gpt-4o, gpt-5.2...', type: 'text', storageKey: 'model', value: "" },
    { id: 'apiKey', label: 'API Key', placeholder: 'sk-...', type: 'password', storageKey: 'apiKey', value: "" },

];


let chat_resume = [
    ["No goal defined yet - Prompt something to start", [0, 0]]
];

//
// Helpers
//

function goTo(index = 0) {

    const element = document.querySelectorAll(".user-msg")[index];
    if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

//
// 
// Rendering functions
//
//
async function renderSettings() {

    const wrapper = document.getElementById('dynamic-settings-wrapper');
    let settingsSchemaDecrypted = JSON.parse(JSON.stringify(settingsSchema));

    async function helper() {

        for (let index = 0; index < settingsSchema.length; index++) {

            const _key = settingsSchema[index].storageKey;
            const _value = await loadFromStorage(_key);
            settingsSchemaDecrypted[index].value = _value;
        }
    }

    helper().then(() => {

        wrapper.innerHTML = settingsSchemaDecrypted.map(field => `
    
            <div class="space-y-1.5">
                    <label class="text-[11px] font-bold uppercase tracking-wider text-gray-500 ml-1" for="${field.id}">${field.label}</label>
                    <input id="${field.id}" type="${field.type}" class="setting-input" 
                           placeholder="${field.placeholder}" value="${field.value || ''}">
                </div>
            `).join('');

    })

    const memInput = document.getElementById('memory-input');
    if (memInput) memInput.value = await loadFromStorage("ai_memory");


}

function renderFAQ() {

    const container = document.getElementById('faq-container');
    container.innerHTML = faqData.map((item, index) => `
                <div class="faq-item" data-index="${index}">
                    <button class="faq-trigger">
                        <span>${item.title}</span>
                        <svg class="faq-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </button>
                    <div class="faq-content">
                        ${item.content}
                    </div>
                </div>
            `).join('');

    // Add click events for accordion
    document.querySelectorAll('.faq-trigger').forEach(trigger => {

        trigger.addEventListener('click', () => {
            const item = trigger.closest('.faq-item');
            const isActive = item.classList.contains('active');

            // Close others
            document.querySelectorAll('.faq-item').forEach(el => el.classList.remove('active'));

            // Toggle current
            if (!isActive) item.classList.add('active');
        });
    });
}


function renderHistoryResume() {

    loadFromStorage(`chat_resume`).then((_cr) => {

        chat_resume = JSON.parse(_cr) ?? chat_resume;

        try {

            const _chat_resume = JSON.parse(_cr) ?? chat_resume;
            const list = document.getElementById('resume-list');

            if (!list) return;
            list.innerHTML = _chat_resume.map(item => `
                <div class="history-item group block" onclick="goTo(${item[1][0]})">
                    <div class="flex items-center space-x-3">
                        <div class="w-2 h-2 rounded-full bg-purple-500/50 group-hover:bg-purple-500 transition-colors"></div>
                        <div class="text-sm font-medium text-[var(--text-main)] line-clamp-1">${item[0]}</div>
                    </div>
                </div>
            `).join('');

        } catch (e) { }
    })

}


function cleanInput(id) {

    log(`Cleanin' user data inside id ${id}`);
    const el = document.getElementById(id);
    if (!el) return;

    const fields = el.querySelectorAll("input, textarea");

    fields.forEach(field => {
        field.value = "";
    });
}


//
//
function appendToUI(content, role, animate = true, actions = false, resume = false) {

    if (!hero.classList.contains('hidden')) {
        hero.classList.add('hidden');
        messageList.classList.remove('hidden');
    }

    const wrapper = document.createElement('div');

    // layout per role
    if (role === 'user') {
        wrapper.className = `flex w-full ${animate ? 'fade-in-up' : ''} justify-end`;
    } else if (role === 'monologue') {
        wrapper.className = `flex w-full ${animate ? 'fade-in-up' : ''} justify-center`;
    } else {
        wrapper.className = `flex w-full ${animate ? 'fade-in-up' : ''} justify-start`;
    }

    const message = document.createElement('div');

    // USER
    if (role === 'user') {
        message.className =
            'user-msg px-5 py-3 rounded-3xl text-[15px] max-w-[80%]';
        message.textContent = content;
    }

    // MONOLOGUE (thinking / resume box)
    else if (role === 'monologue') {
        message.className = `
            px-6 py-4
            max-w-[75%]
            rounded-2xl
            text-[15px]
            bg-green-900/30
            border border-green-500/30
            backdrop-blur
            text-center
            italic
            monologue
            text-[var(--text-main)]            
        `;
        message.id = `monologue-${document.querySelectorAll(".user-msg").length}`;
        message.textContent = content;
    }

    // ASSISTANT (default)
    else {
        message.className = 'flex space-x-4 w-full';
        message.innerHTML = `
            <div class="shrink-0 mt-1">
                <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center">
                    <svg class="text-white" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"/>
                    </svg>
                </div>
            </div>
            <div class="user_message  pre-style message-content text-[16px] text-[var(--text-main)] pt-1">${content}</div>
        `;

    }


    wrapper.appendChild(message);
    messageList.appendChild(wrapper);

    let el = wrapper.querySelectorAll(".user_message")[0];
    if (actions) {
        addButtonsRedo(el);
        log(resume);
        el.setAttribute("resume", resume)
    }

    chatArea.scrollTo({
        top: chatArea.scrollHeight,
        behavior: animate ? 'smooth' : 'auto'
    });
}


function showFeedback(text) {

    const feedback = document.createElement('div');
    feedback.className = "feedback fixed bottom-10 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-2 rounded-full text-sm shadow-lg fade-in-up z-50";
    feedback.textContent = text;
    document.body.appendChild(feedback);
    setTimeout(() => feedback.remove(), 3500);

}


function showSpinner(show = true, whereTo = body) {

    if (!show) {

        setTimeout(() => {

            try { chatArea.style.filter = "blur(0px)"; } catch (e) { }
            try { document.querySelectorAll(".monologue").forEach((x) => x.style.filter = "blur(0px)") } catch (e) { }

            try {
                document.querySelectorAll(".loader").forEach((x) => x.remove());
            } catch (e) { }

        }, 700);
        return;
    }

    const loader = document.createElement("div");
    loader.className = "loader";

    whereTo.appendChild(loader);
    whereTo === body ?
        chatArea.style.filter = "blur(12px)" : thinking.style.filter = "blur(2px)";

}

//
//
function send(text) {

    input.value = `Tell me more about this: ${text}`;
    sendBtn.disabled = false;
    sendBtn.click();

}

//
//
const handleRedo = (e) => redoFlow(e);


//
//
async function handleCopy(e) {

    let textToCopy = e.parentElement.parentElement.innerText;
    log(textToCopy);

    navigator.clipboard.writeText(textToCopy).then((text) => showFeedback("Text copied to clipboard!"));
}


//
//
function addButtonsRedo(toInsert = false) {

    updateLastUserMsg();

    const container = document.createElement("div");
    container.innerHTML = `
         <div class="chat_actions">
             <button class="btn-action" onclick="handleRedo(this)">
                 <svg viewBox="0 0 24 24"><path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/></svg>
              </button>
         
             <button class="btn-action" onclick="handleCopy(this)">
                 <svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
             </button>
          </div>`;

    !toInsert ? lastUserMsg.appendChild(container.firstElementChild)
        : toInsert.appendChild(container.firstElementChild);

    try { lastUserMsg.setAttribute("resume", chat_resume.at(-1)[0]) } catch (error) { };

}


//
//
async function learningTagsHandle() {

    tags = null;
    try { tags = JSON.parse(related_tags).related_dive_in_topics; } catch (e) { }

    const learningMode = localStorage.getItem("learningMode") ?? "false";
    if (learningMode === "false" || !Array.isArray(tags) || tags.length === 0) {

        addButtonsRedo();
        return;
    }

    updateLastUserMsg();

    const tagCloud = document.createElement("div");
    tagCloud.className = "tag-cloud";

    tags.forEach(tag => {

        const tagItem = document.createElement("span");
        tagItem.className = "tag-item bg-green-900/30 border border-green-500/30";
        tagItem.textContent = tag;
        tagCloud.appendChild(tagItem);

        tagItem.onclick = () => send(tag);
    });
    lastUserMsg.appendChild(tagCloud);
    addButtonsRedo();

}

//
//
function toggleButtons() {

    sendBtn.classList.toggle('hidden');
    stopBtn.classList.toggle('hidden');
}

//
//
async function handleSend(_msg = false, show = true) {

    showSpinner();
    toggleButtons()

    const text = !_msg ? input.value.trim() : _msg;
    if (!text) return;

    show ? appendToUI(text, 'user') : null;
    show ? saveMessage(text, 'user') : null;

    input.value = '';
    input.style.height = 'auto';
    sendBtn.disabled = true;

    setTimeout(async () => {

        appendToUI("Thinking...", 'monologue');
        appendToUI("", 'assistant');
        const response = await processMessage(text, show);
        scrollChatEnd();

        if (!CONFIG.stream) {

            document.querySelectorAll(".flex.w-full.fade-in-up.justify-start")[document.querySelectorAll(".flex.w-full.fade-in-up.justify-start").length - 1].remove();
            appendToUI(response, 'assistant');
            learningTagsHandle();

        }

        saveMessage(response, 'assistant');
        scrollChatEnd();
        toggleButtons();

    }, 600);
}

/**
 * 4. MODAL LOGIC
 */

const toggleSettings = (show) => {

    !show ? cleanInput('settings-modal') : null;
    document.getElementById('settings-modal').classList.toggle('hidden', !show);

}
const toggleInfo = (show) => document.getElementById('info-modal').classList.toggle('hidden', !show);
const toggleHistory = (show) => document.getElementById('history-modal').classList.toggle('hidden', !show);
const toggleDelete = (show) => document.getElementById('delete-modal').classList.toggle('hidden', !show);



function developTestMsg() {
    developing ? input.value = `Hazme una historia de terror` : null;
    sendBtn.disabled = false;
}


async function loadChatHistory() {

    const raw = await loadFromStorage("chat_history");
    chatHistory = raw ? JSON.parse(raw) : [];

    chatHistory.forEach(msg => {
        appendToUI(msg.content, msg.role, false, msg.actions, msg.resume);
    });

}

function setLight_Dark_Mode() {

    const useLightMode = localStorage.getItem(`ligthMode`) ?? "false";
    const isLight = document.querySelectorAll('.light-mode').length > 0;

    if (useLightMode === "true" && !isLight)
        document.getElementById("theme-toggle").click();

};


function getLastUserMsgIndex() {
    return document.querySelectorAll(".user-msg").length ?? 1;
}