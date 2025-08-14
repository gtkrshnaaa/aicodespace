// models/chatModel.js
const fs = require('fs/promises');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { settings, keys, historyFilePath } = require('../config/appConfig');

// Inisialisasi model Generative AI
const genAI = new GoogleGenerativeAI(keys.active_key || process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flas-lite' });

/**
 * Membaca riwayat percakapan dari file history.json
 * @returns {Promise<Array>} Array berisi objek-objek percakapan
 */
const getHistory = async () => {
    try {
        const data = await fs.readFile(historyFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        // Jika file tidak ada, kembalikan array kosong
        if (error.code === 'ENOENT') {
            return [];
        }
        console.error('Error reading chat history:', error);
        return [];
    }
};

/**
 * Menyimpan pesan baru ke file history.json
 * @param {Object} userMessage - Pesan dari pengguna
 * @param {string} aiResponse - Respons dari AI
 */
const updateHistory = async (userMessage, aiResponse) => {
    try {
        const history = await getHistory();
        history.push({ role: 'user', parts: [{ text: userMessage }] });
        history.push({ role: 'model', parts: [{ text: aiResponse }] });
        await fs.writeFile(historyFilePath, JSON.stringify(history, null, 2));
    } catch (error) {
        console.error('Error updating chat history:', error);
    }
};

/**
 * Menghasilkan respons dari AI secara streaming.
 * @param {string} latestUserInput - Input terakhir dari pengguna.
 * @param {WritableStream} responseStream - Stream respons dari Express untuk menulis data.
 */
const generateResponse = async (latestUserInput, responseStream) => {
    try {
        const chatHistory = await getHistory();
        const systemInstruction = `AI berada pada sebuah aplikasi coding assistant bernama AI Code Space. Aplikasi ini memiliki batasan teknis: ia hanya bisa merender konten dalam format HTML. Oleh karena itu, semua balasan HARUS berbentuk HTML yang valid. AI tidak diperkenankan untuk menyertakan tag <body>, <html>, atau <head> dalam setiap responsnya. Setiap kali AI menulis blok kode, ia harus membungkusnya dalam tag <pre><code class="language-js">...</code></pre> dan menyertakan nama bahasanya di atribut class, contohnya <pre><code class="language-js">...</code></pre>. Konteks personalisasi: ${JSON.stringify(settings)}`;

        const chat = model.startChat({
            history: chatHistory,
            generationConfig: {
                maxOutputTokens: 8192,
            },
             systemInstruction: {
                role: "system",
                parts: [{ text: systemInstruction }]
            },
        });

        const result = await chat.sendMessageStream(latestUserInput);

        let fullResponse = '';
        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            fullResponse += chunkText;
            responseStream.write(chunkText); // Kirim chunk ke frontend
        }
        
        // Simpan percakapan lengkap setelah stream selesai
        await updateHistory(latestUserInput, fullResponse);

    } catch (error) {
        console.error('Error generating response from Gemini:', error);
        responseStream.write('<p class="text-red-400">Maaf, terjadi kesalahan saat menghubungi AI. Pastikan API Key valid dan aktif.</p>');
    } finally {
        responseStream.end(); // Akhiri stream
    }
};


module.exports = {
    generateResponse,
};