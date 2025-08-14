// controllers/chatController.js
const chatModel = require('../models/chatModel');

const renderChat = (req, res) => {
    try {
        res.render('chat/index');
    } catch (error) {
        console.error("Error rendering chat:", error);
        res.status(500).send("Gagal memuat halaman chat.");
    }
};

const handleChat = async (req, res) => {
    try {
        // --- Modifikasi: Ambil data tambahan dari body ---
        const { message, codebase, modelName } = req.body;
        // ------------------------------------------------

        if (!message) {
            return res.status(400).json({ error: 'Pesan tidak boleh kosong.' });
        }

        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');

        // --- Modifikasi: Kirim data lengkap ke model ---
        await chatModel.generateResponse(message, codebase, modelName, res);
        // --------------------------------------------

    } catch (error) {
        console.error("Error in handleChat controller:", error);
        if (!res.headersSent) {
            res.status(500).send("Terjadi kesalahan di server.");
        } else {
            res.write('<p class="text-red-400">Terjadi kesalahan server yang tidak terduga.</p>');
            res.end();
        }
    }
};

module.exports = {
    renderChat,
    handleChat,
};