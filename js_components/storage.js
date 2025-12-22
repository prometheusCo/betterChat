//
// set

//
//
// Components vars
//
//

let config = {

    memory: localStorage.getItem('ai_memory') || '',
    model: localStorage.getItem('ai_model_name') || '',
    endpoint: localStorage.getItem('ai_endpoint') || '',
    apiKey: localStorage.getItem('ai_api_key') || ''
};

let chatHistory = JSON.parse(localStorage.getItem('chat_history')) || [];


// 
//
// Storage saving functions
//
function saveMessage(content, role) {
    chatHistory.push({ content, role });
    localStorage.setItem('chat_history', JSON.stringify(chatHistory));
}

function saveStorage() {

    // Save memory
    config.memory = document.getElementById('memory-input').value.trim();
    localStorage.setItem('ai_memory', config.memory);

    // Save dynamic fields
    settingsSchema.forEach(field => {
        const val = document.getElementById(field.id).value.trim();
        config[field.id] = val;
        console.log(config);
        localStorage.setItem(field.storageKey, val);
    });

    toggleSettings(false);
    showFeedback("Configuration updated");
}