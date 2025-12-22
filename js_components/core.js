function handleSend() {

    const text = input.value.trim();
    if (!text) return;

    appendToUI(text, 'user');
    saveMessage(text, 'user');

    input.value = '';
    input.style.height = 'auto';
    sendBtn.disabled = true;

    setTimeout(() => {
        const response = `BetterChat processed your request using ${config.model || 'Standard Engine'}.`;
        appendToUI(response, 'assistant');
        saveMessage(response, 'assistant');
    }, 600);
}

function appendToUI(content, role, animate = true) {

    if (!hero.classList.contains('hidden')) {
        hero.classList.add('hidden');
        messageList.classList.remove('hidden');
    }

    const wrapper = document.createElement('div');
    wrapper.className = `flex w-full ${animate ? 'fade-in-up' : ''} ${role === 'user' ? 'justify-end' : 'justify-start'}`;

    const message = document.createElement('div');
    if (role === 'user') {
        message.className = 'user-msg px-5 py-3 rounded-3xl text-[15px] max-w-[80%]';
        message.textContent = content;
    } else {
        message.className = 'flex space-x-4 w-full';
        message.innerHTML = `
                    <div class="shrink-0 mt-1">
                        <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center">
                            <svg class="text-white" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"/></svg>
                        </div>
                    </div>
                    <div class="message-content text-[16px] text-[var(--text-main)] pt-1">${content}</div>
                `;
    }

    wrapper.appendChild(message);
    messageList.appendChild(wrapper);
    chatArea.scrollTo({ top: chatArea.scrollHeight, behavior: animate ? 'smooth' : 'auto' });
}


function showFeedback(text) {
    const feedback = document.createElement('div');
    feedback.className = "fixed bottom-10 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-2 rounded-full text-sm shadow-lg fade-in-up z-50";
    feedback.textContent = text;
    document.body.appendChild(feedback);
    setTimeout(() => feedback.remove(), 2500);
}