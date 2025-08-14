const chatModel = require('../models/chatModel');

const renderChat = (req, res) => {
    try {
        const { sessionId } = req.params;
        res.render('chat/index', {
            sessions: res.locals.sessions || [],
            activeSessionId: sessionId
        });
    } catch (error) {
        console.error("Error rendering chat:", error);
        res.status(500).send("Gagal memuat halaman chat.");
    }
};

const handleChat = async (req, res) => {
    try {
        const { message, codebase, modelName, sessionId } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Pesan tidak boleh kosong.' });
        }
        if (!sessionId) {
            return res.status(400).json({ error: 'ID Sesi tidak ditemukan.' });
        }

        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');

        await chatModel.generateResponse(sessionId, message, codebase, modelName, res);

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