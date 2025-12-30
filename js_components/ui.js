//
// This should be improved so can be multilingual
//


//
// Faq info
const faqData = [

    {
        title: "What is BetterChat?",
        content: "BetterChat is a specialized frontend for GPT Large Language Models,  that enforces structured reasoning. It hardcodes Chain of Thought execution at  code level, ensuring the model follows instructions strictly and produces higher-quality reasoning than standard chat interfaces."
    },
    {
        title: "How does enforced Chain of Thought work?",
        content: "BetterChat injects and controls reasoning steps directly in the prompt and execution flow. This prevents the model from skipping instructions and reduces hallucination risks. Resulting in more consistent, logical, and reliable outputs compared to vanilla LLM usage."
    },
    {
        title: "Is my data secure?",
        content: "Yes. All sensitive data stored on your device—including API keys, endpoints, preferences, and memory—is encrypted locally. This information never leaves your device except when sent directly to your selected AI provider during a request. No intermediary servers are involved."
    },
    {
        title: "Can I use different models?",
        content: "BetterChat currently supports the  Open AI API. Support for additional APIs will be added in the future. Therefore all Open AI models are available."
    }
];


const settingsSchema = [
    { id: 'model', label: 'Model Name', placeholder: 'e.g. gpt-4o, gemini-pro', type: 'text', storageKey: 'ai_model_name' },
    { id: 'apiKey', label: 'API Key', placeholder: 'sk-...', type: 'password', storageKey: 'ai_api_key' }
];


const chat_resume = [
    "No goal defined yet - Prompt something to start"
];

//
// 
// Rendering functions
//
//

function renderSettings() {
    const wrapper = document.getElementById('dynamic-settings-wrapper');

    wrapper.innerHTML = settingsSchema.map(field => `
                <div class="space-y-1.5">
                    <label class="text-[11px] font-bold uppercase tracking-wider text-gray-500 ml-1" for="${field.id}">${field.label}</label>
                    <input id="${field.id}" type="${field.type}" class="setting-input" 
                           placeholder="${field.placeholder}" value="${config[field.id] || ''}">
                </div>
            `).join('');

    const memInput = document.getElementById('memory-input');
    if (memInput) memInput.value = config.memory;
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
    const list = document.getElementById('resume-list');
    if (!list) return;
    list.innerHTML = chat_resume.map(item => `
                <div class="history-item group block">
                    <div class="flex items-center space-x-3">
                        <div class="w-2 h-2 rounded-full bg-purple-500/50 group-hover:bg-purple-500 transition-colors"></div>
                        <div class="text-sm font-medium text-[var(--text-main)] line-clamp-1">${item}</div>
                    </div>
                </div>
            `).join('');
}


function appendToUI(content, role, animate = true) {

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
            text-green-200
            bg-green-900/30
            border border-green-500/30
            backdrop-blur
            text-center
            italic
            monologue
            
        `;
        message.id = `monologue-${document.querySelectorAll(".user-msg").length}]`;
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
            <div class="message-content text-[16px] text-[var(--text-main)] pt-1">${content}</div>
        `;
    }

    wrapper.appendChild(message);
    messageList.appendChild(wrapper);

    chatArea.scrollTo({
        top: chatArea.scrollHeight,
        behavior: animate ? 'smooth' : 'auto'
    });
}


function showFeedback(text) {
    const feedback = document.createElement('div');
    feedback.className = "fixed bottom-10 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-2 rounded-full text-sm shadow-lg fade-in-up z-50";
    feedback.textContent = text;
    document.body.appendChild(feedback);
    setTimeout(() => feedback.remove(), 2500);
}


function showSpinner(show = true) {

    if (!show) {
        const loader = document.getElementsByClassName("loader")[0];
        chatArea.style.filter = "blur(0px)";
        loader.remove();
        return;
    }

    const loader = document.createElement("div");
    loader.className = "loader";

    body.appendChild(loader);
    chatArea.style.filter = "blur(12px)";

}

async function handleSend() {

    showSpinner();

    const text = input.value.trim();
    if (!text) return;

    appendToUI(text, 'user');
    saveMessage(text, 'user');

    input.value = '';
    input.style.height = 'auto';
    sendBtn.disabled = true;

    setTimeout(async () => {

        appendToUI("Thinking... \n \n", 'monologue');
        thinking = document.getElementById(`monologue-${document.querySelectorAll(".user-msg").length}]`);

        const response = await processMessage(text);

        appendToUI(response, 'assistant');
        saveMessage(response, 'assistant');

    }, 600);
}

/**
 * 4. MODAL LOGIC
 */

const toggleSettings = (show) => document.getElementById('settings-modal').classList.toggle('hidden', !show);
const toggleInfo = (show) => document.getElementById('info-modal').classList.toggle('hidden', !show);
const toggleHistory = (show) => document.getElementById('history-modal').classList.toggle('hidden', !show);
const toggleDelete = (show) => document.getElementById('delete-modal').classList.toggle('hidden', !show);



function developTestMsg() {
    developing ? input.value = `Hazme una historia de terror` : null;
    sendBtn.disabled = false;
}


