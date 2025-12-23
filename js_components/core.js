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

