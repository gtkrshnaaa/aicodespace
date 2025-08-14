// controllers/settingsController.js
const { settings, keys, writeJsonFileSync } = require('../config/appConfig');

/**
 * Merender halaman pengaturan dengan data yang ada saat ini.
 */
const renderSettings = (req, res) => {
    try {
        // Mengirim data settings dan keys ke view
        res.render('settings', {
            layout: 'layouts/main',
            settings: settings,
            keys: keys,
            page: 'settings' // Variabel untuk menandai halaman aktif di sidebar
        });
    } catch (error) {
        console.error("Error rendering settings page:", error);
        res.status(500).send("Gagal memuat halaman pengaturan.");
    }
};

/**
 * Menyimpan perubahan pada settings.json (personalisasi).
 */
const saveGeneralSettings = (req, res) => {
    try {
        const { user_name, ai_name, user_info, ai_info } = req.body;
        
        const newSettings = {
            ...settings,
            user_name: user_name || settings.user_name,
            ai_name: ai_name || settings.ai_name,
            saved_info: {
                user: user_info || settings.saved_info.user,
                ai: ai_info || settings.saved_info.ai
            }
        };

        // Tulis perubahan ke file settings.json
        writeJsonFileSync('settings.json', newSettings);
        
        res.redirect('/settings');
    } catch (error) {
        console.error("Error saving general settings:", error);
        res.status(500).send("Gagal menyimpan pengaturan umum.");
    }
};

/**
 * Mengelola API keys (menambah, menghapus, mengaktifkan).
 */
const manageApiKeys = (req, res) => {
    try {
        const { new_key, active_key, delete_key } = req.body;
        let currentKeys = { ...keys };

        // Tambah key baru jika ada
        if (new_key && !currentKeys.available_keys.includes(new_key)) {
            currentKeys.available_keys.push(new_key);
        }

        // Set key aktif baru
        if (active_key) {
            currentKeys.active_key = active_key;
        }

        // Hapus key
        if (delete_key) {
            currentKeys.available_keys = currentKeys.available_keys.filter(k => k !== delete_key);
            // Jika key yang dihapus adalah key aktif, kosongkan active_key
            if (currentKeys.active_key === delete_key) {
                currentKeys.active_key = '';
            }
        }
        
        // Tulis perubahan ke file keys.json
        writeJsonFileSync('keys.json', currentKeys);

        res.redirect('/settings');
    } catch (error) {
        console.error("Error managing API keys:", error);
        res.status(500).send("Gagal mengelola API Key.");
    }
};


module.exports = {
    renderSettings,
    saveGeneralSettings,
    manageApiKeys
};