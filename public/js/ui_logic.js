// public/js/ui_logic.js
document.addEventListener('DOMContentLoaded', () => {
    const welcomeScreen = document.getElementById('welcome-screen');
    const chatContainer = document.getElementById('chat-container');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');

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