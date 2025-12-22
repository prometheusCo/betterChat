
function setEvents() {

    // Dark theme on/off toggle
    document.getElementById('theme-toggle').addEventListener('click', () => {
        const isLight = document.documentElement.classList.toggle('light-mode');
        document.getElementById('sun-icon').classList.toggle('hidden', !isLight);
        document.getElementById('moon-icon').classList.toggle('hidden', isLight);
    });

    /**
     * 4. MODAL LOGIC
     */
    const toggleSettings = (show) => document.getElementById('settings-modal').classList.toggle('hidden', !show);
    const toggleInfo = (show) => document.getElementById('info-modal').classList.toggle('hidden', !show);

    // Settings Listeners
    document.getElementById('settings-btn').addEventListener('click', () => toggleSettings(true));
    document.getElementById('cancel-modal').addEventListener('click', () => toggleSettings(false));
    document.getElementById('save-settings').addEventListener('click', () => {
        saveStorage();
    });

    // Info/FAQ Listeners
    document.getElementById('info-btn').addEventListener('click', () => toggleInfo(true));
    document.getElementById('close-info').addEventListener('click', () => toggleInfo(false));

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

