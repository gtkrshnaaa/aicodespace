// main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');

// Impor dan jalankan server Express kita
require('./index.js');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Kita akan buat file ini nanti jika perlu
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Muat aplikasi dari server lokal Express
  mainWindow.loadURL('http://localhost:3000');

  // Buka DevTools untuk debugging, bisa dihapus nanti
  mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});