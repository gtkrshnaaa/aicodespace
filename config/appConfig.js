// config/appConfig.js
const fs = require('fs');
const path = require('path');

// Fungsi untuk menulis file JSON (tetap sama)
const writeJsonFileSync = (filePath, data) => {
    try {
        const fullPath = path.join(__dirname, filePath);
        const jsonString = JSON.stringify(data, null, 2);
        fs.writeFileSync(fullPath, jsonString, 'utf-8');
        // Reload konfigurasi setelah menulis
        if (filePath.includes('settings')) {
            module.exports.settings = data;
        }
        if (filePath.includes('keys')) {
            module.exports.keys = data;
        }
    } catch (error) {
        console.error(`Error writing to ${filePath}:`, error);
    }
};


// --- Modifikasi Fungsi Pembacaan File JSON ---
const readJsonFileSync = (filePath) => {
    const fullPath = path.join(__dirname, filePath);
    try {
        // Coba baca file seperti biasa
        const fileContent = fs.readFileSync(fullPath, 'utf-8');
        return JSON.parse(fileContent);
    } catch (error) {
        // Cek jika error-nya adalah "File Not Found"
        if (error.code === 'ENOENT') {
            console.log(`File ${filePath} tidak ditemukan. Membuat file default...`);
            
            let defaultData = null;

            // Tentukan struktur default berdasarkan nama file
            if (filePath.includes('settings.json')) {
                defaultData = {
                    user_name: "User",
                    ai_name: "Aicode",
                    saved_info: {
                        user: "Seorang developer yang antusias!",
                        ai: "Sebuah AI Assistant yang siap membantu."
                    }
                };
            } else if (filePath.includes('keys.json')) {
                defaultData = {
                    active_key: "",
                    available_keys: []
                };
            }

            // Jika ada struktur default, tulis file baru dan kembalikan datanya
            if (defaultData) {
                writeJsonFileSync(filePath, defaultData);
                return defaultData;
            }
        }
        
        // Jika error jenis lain, tampilkan di konsol
        console.error(`Error reading or parsing ${filePath}:`, error);
        return null; // Kembalikan null jika terjadi error yang tidak terduga
    }
};
// ------------------------------------------

const settings = readJsonFileSync('settings.json');
const keys = readJsonFileSync('keys.json');

const historyFilePath = path.join(__dirname, '..', 'chat_history', 'history.json');

// Cek dan buat folder chat_history jika belum ada
const historyDir = path.dirname(historyFilePath);
if (!fs.existsSync(historyDir)) {
    fs.mkdirSync(historyDir);
}

// Cek dan buat file history.json jika belum ada
if (!fs.existsSync(historyFilePath)) {
    fs.writeFileSync(historyFilePath, '[]', 'utf-8');
}


module.exports = {
    settings,
    keys,
    historyFilePath,
    writeJsonFileSync,
};