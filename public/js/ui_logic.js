// public/js/ui_logic.js
document.addEventListener('DOMContentLoaded', () => {
    // Variabel yang sudah ada...
    const welcomeScreen = document.getElementById('welcome-screen');
    const chatContainer = document.getElementById('chat-container');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    
    // Variabel baru untuk elemen UI
    const newChatBtn = document.querySelector('aside button.flex'); // Tombol "New Chat" lebih spesifik
    const modelSelectorBtn = document.getElementById('model-selector-btn');
    const modelDropdown = document.getElementById('model-dropdown');

    // --- Fungsionalitas Tombol ---

    // 1. Fungsikan tombol "New Chat"
    if (newChatBtn) {
        newChatBtn.addEventListener('click', () => {
            // Untuk saat ini, kita reload halaman untuk memulai chat baru
            window.location.reload();
        });
    }

    // 2. Fungsikan dropdown pemilih model
    if (modelSelectorBtn && modelDropdown) {
        modelSelectorBtn.addEventListener('click', (event) => {
            event.stopPropagation(); // Mencegah window.click dieksekusi
            modelDropdown.classList.toggle('hidden');
        });
    }
    
    // Sembunyikan dropdown jika klik di luar area
    window.addEventListener('click', () => {
        if (modelDropdown && !modelDropdown.classList.contains('hidden')) {
            modelDropdown.classList.add('hidden');
        }
    });

    const sendMessage = async () => {
        const message = chatInput.value.trim();
        if (!message) return;

        // Jika ini pesan pertama, sembunyikan welcome screen dan tampilkan chat
        if (!welcomeScreen.classList.contains('hidden')) {
            welcomeScreen.classList.add('hidden');
            chatContainer.classList.remove('hidden');
        }

        // 1. Tampilkan pesan pengguna di UI
        appendMessage(message, 'user');
        chatInput.value = ''; // Kosongkan input
        autoResizeTextarea(chatInput); // Reset tinggi textarea

        // 2. Buat container untuk respons AI
        const aiMessageContainer = appendMessage('', 'ai');
        const aiTextElement = aiMessageContainer.querySelector('.message-content');

        try {
            // 3. Kirim pesan ke backend dan proses respons stream
            const response = await fetch('/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let aiResponse = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value, { stream: true });
                aiResponse += chunk;
                
                // Render secara real-time
                aiTextElement.innerHTML = aiResponse; // Gunakan innerHTML karena responsnya HTML
                chatContainer.scrollTop = chatContainer.scrollHeight; // Auto-scroll
            }
        } catch (error) {
            console.error('Error fetching chat response:', error);
            aiTextElement.innerHTML = '<p class="text-red-500">Maaf, terjadi kesalahan saat menghubungi AI.</p>';
        }
    };

    // Fungsi untuk menambahkan pesan ke kontainer chat
    const appendMessage = (content, role) => {
        const messageWrapper = document.createElement('div');
        messageWrapper.className = `mb-6 flex ${role === 'user' ? 'justify-end' : 'justify-start'}`;
        
        const messageBubble = document.createElement('div');
        messageBubble.className = `max-w-2xl rounded-xl p-4 ${role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`;

        const textElement = document.createElement('div');
        textElement.className = 'message-content'; // Class baru untuk target update
        textElement.innerHTML = content; // Gunakan innerHTML untuk merender HTML dari AI

        messageBubble.appendChild(textElement);
        messageWrapper.appendChild(messageBubble);
        chatContainer.appendChild(messageWrapper);
        chatContainer.scrollTop = chatContainer.scrollHeight; // Auto-scroll ke bawah

        return messageBubble; // Kembalikan elemen bubble untuk di-update (khusus AI)
    };

    const autoResizeTextarea = (el) => {
        el.style.height = 'auto';
        el.style.height = (el.scrollHeight) + 'px';
    };

    sendBtn.addEventListener('click', sendMessage);

    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    chatInput.addEventListener('input', () => autoResizeTextarea(chatInput));
});