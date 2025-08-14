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

/**
 * Menangani permintaan chat dari frontend dan melakukan streaming respons.
 */
const handleChat = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Pesan tidak boleh kosong.' });
        }

        // Set header untuk SSE (Server-Sent Events) atau streaming text biasa
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');

        // Panggil model untuk menghasilkan respons dan stream ke client
        await chatModel.generateResponse(message, res);

    } catch (error) {
        console.error("Error in handleChat controller:", error);
        if (!res.headersSent) {
            res.status(500).send("Terjadi kesalahan di server.");
        } else {
            // Jika header sudah terkirim, coba kirim pesan error terakhir sebelum menutup
            res.write('<p class="text-red-400">Terjadi kesalahan server yang tidak terduga.</p>');
            res.end();
        }
    }
};

module.exports = {
    renderChat,
    handleChat,
};