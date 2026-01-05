
function setEvents() {

    // Dark theme on/off toggle
    document.getElementById('theme-toggle').addEventListener('click', () => {
        const isLight = document.documentElement.classList.toggle('light-mode');
        document.getElementById('sun-icon').classList.toggle('hidden', !isLight);
        document.getElementById('moon-icon').classList.toggle('hidden', isLight);
    });

    // Settings Listeners
    document.getElementById('settings-btn').addEventListener('click', () => {

        renderSettings();
        toggleSettings(true);
    });

    document.getElementById('cancel-modal').addEventListener('click', () => toggleSettings(false));
    document.getElementById('history-modal').addEventListener('click', () => toggleHistory(false));

    document.getElementById('save-settings').addEventListener('click', () => {

        // Save dynamic fields
        settingsSchema.forEach(field => {

            const val = document.getElementById(field.id).value.trim();
            settingsSchema[field.id] = val;
            settingsSchema[field.storageKey] = val;

            saveStorage([field.id], val);

        });

        //
        // Save memory
        settingsSchema.memory = document.getElementById('memory-input').value.trim();
        saveStorage('ai_memory', settingsSchema.memory);

        toggleSettings(false);
        showFeedback("Configuration updated");

    });

    // Info/FAQ Listeners
    document.getElementById('info-btn').addEventListener('click', () => toggleInfo(true));
    document.getElementById('close-info').addEventListener('click', () => toggleInfo(false));
    document.getElementById('close-history').addEventListener('click', () => toggleHistory(false));
    document.getElementById('close-history').addEventListener('click', () => toggleHistory(false));
    document.getElementById('delete-modal').onclick = () => toggleDelete(false);

    document.getElementById('delete-storage-btn').onclick = () => toggleDelete(true);
    document.getElementById('cancel-delete').onclick = () => toggleDelete(false);

    document.getElementById('confirm-delete').onclick = () => {
        clearHistory();
        window.location.reload();
    };


    // Click outside to close modals
    window.addEventListener('click', (e) => {

        if (e.target.classList.contains('modal-overlay')) {
            toggleSettings(false);
            toggleInfo(false);
        }
    });

    input.addEventListener('input', function () {

        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
        sendBtn.disabled = this.value.trim().length === 0;
    });

    sendBtn.addEventListener('click', handleSend);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });

}

document.getElementById('history-button').onclick = () => {
    toggleHistory(true);
    renderHistoryResume();
};

