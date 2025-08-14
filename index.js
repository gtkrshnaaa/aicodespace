// index.js
const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const chatController = require('./controllers/chatController');

const app = express();
const port = 41999;

// Konfigurasi EJS sebagai template engine dengan layouts
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware untuk melayani file statis dari folder 'public'
app.use(express.static(path.join(__dirname, 'public')));
// Middleware untuk parsing body JSON dari request
app.use(express.json()); 

// Routing
app.get('/', chatController.renderChat);
app.post('/chat', chatController.handleChat);

app.listen(port, () => {
    console.log(`AI Code Space server berjalan di http://localhost:${port}`);
});

// Ekspor app agar bisa di-require oleh main.js jika diperlukan
module.exports = app;