// index.js
const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const chatController = require('./controllers/chatController');
const settingsController = require('./controllers/settingsController'); // <-- Impor controller baru

const app = express();
const port = 41999;

// Konfigurasi EJS sebagai template engine dengan layouts
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // <-- Tambahkan ini untuk parsing form data

// Routing
app.get('/', chatController.renderChat);
app.post('/chat', chatController.handleChat);

// --- Rute Baru untuk Settings ---
app.get('/settings', settingsController.renderSettings);
app.post('/settings/general', settingsController.saveGeneralSettings);
app.post('/settings/keys', settingsController.manageApiKeys);
// ------------------------------

app.listen(port, () => {
    console.log(`AI Code Space server berjalan di http://localhost:${port}`);
});

module.exports = app;