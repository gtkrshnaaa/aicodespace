// index.js
const express = require('express');
const path = require('path');
const chatController = require('./controllers/chatController');

const app = express();
const port = 3000;

// Konfigurasi EJS sebagai template engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware untuk melayani file statis dari folder 'public'
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // Untuk parsing body JSON dari request

// Routing
app.get('/', chatController.renderChat);
app.post('/chat', chatController.handleChat);
// Nanti kita akan tambah route POST untuk chat di sini

app.listen(port, () => {
  console.log(`AI Code Space server berjalan di http://localhost:${port}`);
});