document.addEventListener('DOMContentLoaded', () => {
    // Variabel untuk menyimpan codebase yang aktif
    let activeCodebase = '';

    // --- Selektor Elemen DOM ---
    const welcomeScreen = document.getElementById('welcome-screen');
    const chatContainer = document.getElementById('chat-container');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    
    // Elemen UI Sidebar & Header
    const newChatBtn = document.querySelector('aside button.flex');
    const modelSelectorBtn = document.getElementById('model-selector-btn');
    const modelDropdown = document.getElementById('model-dropdown');

    // Elemen Modal Codebase
    const codebaseBtn = document.getElementById('codebase-btn');
    const codebaseModal = document.getElementById('codebase-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const saveCodebaseBtn = document.getElementById('save-codebase-btn');
    const codebaseTextarea = document.getElementById('codebase-textarea');

    // --- Logika Event Listener ---

    // Fungsikan tombol "New Chat"
    if (newChatBtn) {
        newChatBtn.addEventListener('click', () => window.location.reload());
    }

    // Fungsikan dropdown pemilih model
    if (modelSelectorBtn && modelDropdown) {
        modelSelectorBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            modelDropdown.classList.toggle('hidden');
        });
    }
    
    // Sembunyikan dropdown jika klik di luar area
    window.addEventListener('click', () => {
        if (modelDropdown && !modelDropdown.classList.contains('hidden')) {
            modelDropdown.classList.add('hidden');
        }
    });

    // Fungsikan tombol untuk membuka modal codebase
    if (codebaseBtn) {
        codebaseBtn.addEventListener('click', () => {
            codebaseModal.classList.remove('hidden');
        });
    }

    // Fungsikan tombol untuk menutup modal
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            codebaseModal.classList.add('hidden');
        });
    }

    // Fungsikan tombol untuk menyimpan codebase dari modal
    if (saveCodebaseBtn) {
        saveCodebaseBtn.addEventListener('click', () => {
            activeCodebase = codebaseTextarea.value;
            console.log("Codebase saved!", activeCodebase); // Untuk debugging
            codebaseModal.classList.add('hidden');
            // Beri feedback visual bahwa codebase aktif
            codebaseBtn.classList.add('text-blue-600'); 
        });
    }

    // --- Fungsi Inti ---

    const sendMessage = async () => {
        const message = chatInput.value.trim();
        if (!message) return;

        // Di sini kita bisa menyertakan `activeCodebase` jika perlu
        // const fullMessage = `Codebase:\n${activeCodebase}\n\nQuestion: ${message}`;
        // Untuk sekarang, kita tetap kirim pesan aslinya saja

        if (!welcomeScreen.classList.contains('hidden')) {
            welcomeScreen.classList.add('hidden');
            chatContainer.classList.remove('hidden');
        }

        appendMessage(message, 'user');
        chatInput.value = '';
        autoResizeTextarea(chatInput);

        const aiMessageContainer = appendMessage('', 'ai');
        const aiTextElement = aiMessageContainer.querySelector('.message-content');

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Nanti body bisa di-extend dengan codebase
                body: JSON.stringify({ message }),
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let aiResponse = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                aiResponse += chunk;
                aiTextElement.innerHTML = aiResponse;
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }
        } catch (error) {
            console.error('Error fetching chat response:', error);
            aiTextElement.innerHTML = '<p class="text-red-500">Maaf, terjadi kesalahan.</p>';
        }
    };

    const appendMessage = (content, role) => {
        const messageWrapper = document.createElement('div');
        messageWrapper.className = `mb-6 flex ${role === 'user' ? 'justify-end' : 'justify-start'}`;
        const messageBubble = document.createElement('div');
        messageBubble.className = `max-w-2xl rounded-xl p-4 ${role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`;
        const textElement = document.createElement('div');
        textElement.className = 'message-content';
        textElement.innerHTML = content;
        messageBubble.appendChild(textElement);
        messageWrapper.appendChild(messageBubble);
        chatContainer.appendChild(messageWrapper);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        return messageBubble;
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