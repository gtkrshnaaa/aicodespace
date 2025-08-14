const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const chatController = require('./controllers/chatController');
const settingsController = require('./controllers/settingsController');
const sessionController = require('./controllers/sessionController');

const app = express();
const port = 41999;

app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', sessionController.createNewSession); 
app.get('/chat/:sessionId', sessionController.listSessions, chatController.renderChat);
app.post('/chat', chatController.handleChat);

app.get('/settings', settingsController.renderSettings);
app.post('/settings/general', settingsController.saveGeneralSettings);
app.post('/settings/keys', settingsController.manageApiKeys);

app.listen(port, () => {
    console.log(`AI Code Space server berjalan di http://localhost:${port}`);
});

module.exports = app;