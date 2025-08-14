// models/chatModel.js
const fs = require('fs/promises');
const { GoogleGenerativeAI } = require('@google/generative-ai');
let { settings, keys, historyFilePath } = require('../config/appConfig'); // <-- Jadikan let agar bisa di-reload

// --- Modifikasi: Fungsi untuk menginisialisasi ulang model ---
let genAI;
let model;

function initializeGenAI() {
    // Reload keys dari config setiap kali dipanggil, untuk memastikan key terbaru yg dipakai
    keys = require('../config/appConfig').keys;
    settings = require('../config/appConfig').settings;
    
    const apiKey = keys.active_key || process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.warn("Peringatan: API Key Gemini tidak ditemukan. Silakan atur di halaman Settings.");
        genAI = null;
        return;
    }
    genAI = new GoogleGenerativeAI(apiKey);
}
// -----------------------------------------------------------

initializeGenAI(); // Panggil saat pertama kali load

const getHistory = async () => { /* ... (fungsi ini tidak berubah) ... */ };
const updateHistory = async (userMessage, aiResponse) => { /* ... (fungsi ini tidak berubah) ... */ };

/**
 * Menghasilkan respons dari AI secara streaming.
 * @param {string} latestUserInput - Input terakhir dari pengguna.
 * @param {string} codebase - Konteks kode yang diinjeksi.
 * @param {string} modelName - Nama model yang akan digunakan.
 * @param {WritableStream} responseStream - Stream respons dari Express.
 */
const generateResponse = async (latestUserInput, codebase, modelName, responseStream) => {
    try {
        initializeGenAI(); // Pastikan AI diinisialisasi dengan key terbaru
        
        if (!genAI) {
            throw new Error("Gemini AI tidak terinisialisasi. Periksa API Key.");
        }

        const modelToUse = genAI.getGenerativeModel({ model: modelName || 'gemini-1.5-flash-latest' });

        const chatHistory = await getHistory();
        
        // --- Modifikasi: Bangun System Instruction Dinamis ---
        let systemInstructionText = `AI berada pada sebuah aplikasi coding assistant bernama AI Code Space. Aplikasi ini memiliki batasan teknis: ia hanya bisa merender konten dalam format HTML. Oleh karena itu, semua balasan HARUS berbentuk HTML yang valid. AI tidak diperkenankan untuk menyertakan tag <body>, <html>, atau <head>. Setiap kali AI menulis blok kode, ia harus membungkusnya dalam tag <pre><code class="language-js">...</code></pre> dan menyertakan nama bahasanya di atribut class. \nKonteks Personalisasi: ${JSON.stringify(settings)}`;

        if (codebase && codebase.trim() !== '') {
            systemInstructionText += `\n\nBerikut adalah codebase yang relevan untuk pertanyaan saat ini. Anggap ini sebagai konteks utama:\n\`\`\`\n${codebase}\n\`\`\``;
        }
        // ----------------------------------------------------

        const chat = modelToUse.startChat({
            history: chatHistory,
            generationConfig: { maxOutputTokens: 8192 },
            systemInstruction: {
                role: "system",
                parts: [{ text: systemInstructionText }]
            },
        });

        const result = await chat.sendMessageStream(latestUserInput);

        let fullResponse = '';
        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            fullResponse += chunkText;
            responseStream.write(chunkText);
        }
        
        await updateHistory(latestUserInput, fullResponse);

    } catch (error) {
        console.error('Error generating response from Gemini:', error);
        responseStream.write('<p class="text-red-500">Maaf, terjadi kesalahan saat menghubungi AI. Pastikan API Key valid dan aktif di halaman Pengaturan.</p>');
    } finally {
        responseStream.end();
    }
};

module.exports = {
    generateResponse,
};