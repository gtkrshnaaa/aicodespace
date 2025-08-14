const fs = require('fs/promises');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
let { settings, keys } = require('../config/appConfig');

const historyDir = path.join(__dirname, '..', 'chat_history');

let genAI;

function initializeGenAI() {
    keys = require('../config/appConfig').keys;
    settings = require('../config/appConfig').settings;
    const apiKey = keys.active_key || process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.warn("Peringatan: API Key Gemini tidak ditemukan.");
        genAI = null;
        return;
    }
    genAI = new GoogleGenerativeAI(apiKey);
}

initializeGenAI();

const getHistory = async (sessionId) => {
    const sessionFile = path.join(historyDir, `${sessionId}.json`);
    try {
        const data = await fs.readFile(sessionFile, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            await fs.writeFile(sessionFile, '[]', 'utf-8');
            return [];
        }
        console.error("Error reading history:", error);
        return [];
    }
};

const updateHistory = async (sessionId, userMessage, aiResponse) => {
    const sessionFile = path.join(historyDir, `${sessionId}.json`);
    try {
        const history = await getHistory(sessionId);
        history.push({ role: 'user', parts: [{ text: userMessage }] });
        history.push({ role: 'model', parts: [{ text: aiResponse }] });
        await fs.writeFile(sessionFile, JSON.stringify(history, null, 2));
    } catch (error) {
        console.error("Error updating history:", error);
    }
};

const generateResponse = async (sessionId, latestUserInput, codebase, modelName, responseStream) => {
    try {
        initializeGenAI();
        if (!genAI) throw new Error("Gemini AI tidak terinisialisasi.");

        const modelToUse = genAI.getGenerativeModel({ model: modelName || 'gemini-2.5-flash' });
        const chatHistory = await getHistory(sessionId);
        
        let systemInstructionText = `
ATURAN MUTLAK: Kamu adalah asisten AI di dalam aplikasi desktop. Semua responsmu akan di-render sebagai HTML. Oleh karena itu, SETIAP KATA yang kamu hasilkan HARUS dibungkus dalam tag HTML yang valid.
- Gunakan <p>...</p> untuk paragraf, sapaan, atau kalimat apa pun.
- Gunakan <strong>...</strong> untuk menekankan kata atau frasa kunci yang penting agar mudah dibaca.
- Gunakan <pre><code class="language-xxx">...</code></pre> untuk blok kode. Ganti 'xxx' dengan nama bahasa (contoh: 'javascript', 'python', 'java').
- JANGAN PERNAH menulis teks mentah tanpa tag HTML.
- JANGAN PERNAH menggunakan tag <html>, <head>, atau <body>.

Contoh SALAH:
Halo! Ini kode yang kamu minta:
<pre><code>...</code></pre>

Contoh BENAR:
<p>Tentu, Kiann! Berikut adalah <strong>implementasi iteratif</strong> dari deret Fibonacci menggunakan Java:</p><pre><code class="language-java">...</code></pre>
<p>Metode ini <strong>lebih efisien</strong> dari sisi memori dibandingkan rekursif.</p>

Konteks Personalisasi: ${JSON.stringify(settings)}
        `.trim();
        
        if (codebase && codebase.trim() !== '') {
            systemInstructionText += `\n\nBerikut adalah codebase yang relevan untuk pertanyaan saat ini. Anggap ini sebagai konteks utama:\n\`\`\`\n${codebase}\n\`\`\``;
        }

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
        
        await updateHistory(sessionId, latestUserInput, fullResponse);

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