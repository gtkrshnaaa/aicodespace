// config/appConfig.js
const fs = require('fs');
const path = require('path');

// Fungsi untuk membaca file JSON secara sinkron
const readJsonFileSync = (filePath) => {
    try {
        const fullPath = path.join(__dirname, filePath);
        const fileContent = fs.readFileSync(fullPath, 'utf-8');
        return JSON.parse(fileContent);
    } catch (error) {
        console.error(`Error reading or parsing ${filePath}:`, error);
        // Mengembalikan struktur default jika file tidak ada atau error
        if (filePath.includes('settings')) return { user_name: 'User', ai_name: 'AI', saved_info: {} };
        if (filePath.includes('keys')) return { active_key: '', available_keys: [] };
        return null;
    }
};

const settings = readJsonFileSync('settings.json');
const keys = readJsonFileSync('keys.json');

const historyFilePath = path.join(__dirname, '..', 'chat_history', 'history.json');

module.exports = {
    settings,
    keys,
    historyFilePath,
};