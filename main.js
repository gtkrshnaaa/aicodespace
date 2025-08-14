const { app, BrowserWindow, nativeTheme } = require('electron');
const path = require('path');

// Impor dan jalankan server Express kita
require('./index.js');

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        title: "AI Code Space",
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    // Menghilangkan menu bar bawaan
    mainWindow.setMenuBarVisibility(false);

    // Muat aplikasi dari server lokal Express
    mainWindow.loadURL('http://localhost:41999');

    // Kirim tema awal setelah halaman selesai dimuat
    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('theme-updated', nativeTheme.shouldUseDarkColors);
    });

    // Dengarkan perubahan tema sistem dan kirim update ke renderer
    nativeTheme.on('updated', () => {
        try {
            mainWindow.webContents.send('theme-updated', nativeTheme.shouldUseDarkColors);
        } catch (error) {
            console.error("Gagal mengirim update tema:", error);
        }
    });
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