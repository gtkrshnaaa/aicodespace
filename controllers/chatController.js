// controllers/chatController.js
const fs = require('fs');
const path = require('path');

const renderChat = (req, res) => {
  try {
    // Untuk sekarang, kita hanya render halaman tanpa data dinamis
    res.render('chat/index');
  } catch (error) {
    console.error("Error rendering chat:", error);
    res.status(500).send("Gagal memuat halaman chat.");
  }
};

module.exports = {
  renderChat,
};