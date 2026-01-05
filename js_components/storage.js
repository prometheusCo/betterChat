//
// set

//
//
// Components vars
//
//


let chatHistory = [];

// 
//
// Storage saving functions
//


//
// Cnryption/decryption fnc
//

async function encrypt(text) {

    const enc = new TextEncoder();

    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        enc.encode(getEncryptionSecret()),
        "PBKDF2",
        false,
        ["deriveKey"]
    );

    const key = await crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: enc.encode("salt"),
            iterations: 100000,
            hash: "SHA-256"
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt"]
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encrypted = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        enc.encode(text)
    );

    // iv + ciphertext → base64 string
    const buffer = new Uint8Array([...iv, ...new Uint8Array(encrypted)]);
    return btoa(String.fromCharCode(...buffer));
}

async function decrypt(cipherText) {

    const enc = new TextEncoder();
    const dec = new TextDecoder();

    // base64 → bytes
    const raw = Uint8Array.from(atob(cipherText), c => c.charCodeAt(0));

    // extract IV (first 12 bytes) + encrypted data
    const iv = raw.slice(0, 12);
    const data = raw.slice(12);

    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        enc.encode(getEncryptionSecret()),
        "PBKDF2",
        false,
        ["deriveKey"]
    );

    const key = await crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: enc.encode("salt"),
            iterations: 100000,
            hash: "SHA-256"
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["decrypt"]
    );

    const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        data
    );

    return dec.decode(decrypted);
}

//
// Encrypt/Decrypt end
//


function saveMessage(content, role) {

    chatHistory.push({ content, role });
    saveStorage('chat_history', JSON.stringify(chatHistory));

}

async function saveStorage(keyName, keyValue) {

    const encryptedValue = await encrypt(keyValue);
    localStorage.setItem(keyName, encryptedValue);

}

async function loadFromStorage(keyName) {

    const encryptedValue = localStorage.getItem(keyName);
    if (!encryptedValue) return null;

    return await decrypt(encryptedValue);

}

function clearHistory() {

    localStorage.removeItem('chat_history');
    localStorage.removeItem('chat_resume');
}


