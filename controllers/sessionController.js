const fs = require('fs');
const path = require('path');

const historyDir = path.join(__dirname, '..', 'chat_history');

const createNewSession = (req, res) => {
    try {
        const now = new Date();
        const timestampId = now.toISOString().replace(/[:.]/g, '-'); 
        const sessionId = `chat-${timestampId}`;
        const newFilePath = path.join(historyDir, `${sessionId}.json`);

        if (!fs.existsSync(historyDir)) {
            fs.mkdirSync(historyDir);
        }
        fs.writeFileSync(newFilePath, '[]', 'utf-8');

        res.redirect(`/chat/${sessionId}`);
    } catch (error) {
        console.error("Gagal membuat sesi baru:", error);
        res.status(500).send("Tidak dapat membuat sesi baru.");
    }
};

const listSessions = (req, res, next) => {
    fs.readdir(historyDir, (err, files) => {
        if (err) {
            console.error("Gagal membaca direktori history:", err);
            res.locals.sessions = [];
            return next();
        }

        const sessionFiles = files
            .filter(file => file.endsWith('.json') && file.startsWith('chat-'))
            .map(file => {
                const sessionId = file.replace('.json', '');
                let title = sessionId.replace('chat-', '').split('T')[0];
                return { id: sessionId, title: title };
            })
            .sort((a, b) => b.id.localeCompare(a.id)); 

        res.locals.sessions = sessionFiles;
        next();
    });
};

module.exports = { createNewSession, listSessions };