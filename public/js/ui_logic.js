// public/js/ui_logic.js
document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.getElementById('chat-container');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');

    const sendMessage = async () => {
        const message = chatInput.value.trim();
        if (!message) return;

        // 1. Tampilkan pesan pengguna di UI
        appendMessage(message, 'user');
        chatInput.value = ''; // Kosongkan input
        chatInput.style.height = 'auto'; // Reset tinggi textarea

        // 2. Buat container untuk respons AI
        const aiMessageContainer = appendMessage('', 'ai');
        const aiTextElement = aiMessageContainer.querySelector('p');

        try {
            // 3. Kirim pesan ke backend dan proses respons stream
            const response = await fetch('/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message }),
            });

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
            }
        } catch (error) {
            console.error('Error fetching chat response:', error);
            aiTextElement.textContent = 'Maaf, terjadi kesalahan saat menghubungi AI.';
        }
    };

    // Fungsi untuk menambahkan pesan ke kontainer chat
    const appendMessage = (content, role) => {
        const messageWrapper = document.createElement('div');
        messageWrapper.className = `mb-4 flex ${role === 'user' ? 'justify-end' : 'justify-start'}`;
        
        const messageBubble = document.createElement('div');
        messageBubble.className = `max-w-3/4 rounded-lg p-3 ${role === 'user' ? 'bg-blue-600' : 'bg-gray-700'}`;

        const textElement = document.createElement('p');
        textElement.innerHTML = content; // Gunakan innerHTML untuk merender HTML dari AI

        messageBubble.appendChild(textElement);
        messageWrapper.appendChild(messageBubble);
        chatContainer.appendChild(messageWrapper);
        chatContainer.scrollTop = chatContainer.scrollHeight; // Auto-scroll ke bawah

        return messageBubble; // Kembalikan elemen bubble untuk di-update (khusus AI)
    };

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
});