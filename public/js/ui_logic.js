document.addEventListener('DOMContentLoaded', () => {
    // Variabel untuk menyimpan state UI
    let activeCodebase = '';
    let selectedModel = 'gemini-2.5-flash-latest'; // Model default

    // --- Selektor Elemen DOM ---
    const welcomeScreen = document.getElementById('welcome-screen');
    const chatContainer = document.getElementById('chat-container');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    
    // Elemen UI Sidebar & Header
    const newChatBtn = document.querySelector('aside button.flex');
    const modelSelectorBtn = document.getElementById('model-selector-btn');
    const modelDropdown = document.getElementById('model-dropdown');
    const modelSelectorLinks = modelDropdown.querySelectorAll('a');
    const modelNameDisplay = modelSelectorBtn.querySelector('span');

    // Elemen Modal Codebase
    const codebaseBtn = document.getElementById('codebase-btn');
    const codebaseModal = document.getElementById('codebase-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const saveCodebaseBtn = document.getElementById('save-codebase-btn');
    const codebaseTextarea = document.getElementById('codebase-textarea');

    // --- Logika Event Listener ---

    if (newChatBtn) {
        newChatBtn.addEventListener('click', () => window.location.href = '/');
    }

    if (modelSelectorBtn && modelDropdown) {
        modelSelectorBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            modelDropdown.classList.toggle('hidden');
        });
    }

    modelSelectorLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const newModel = link.getAttribute('data-model');
            const modelText = link.querySelector('span').innerText.trim();

            if (newModel) {
                selectedModel = newModel;
                modelNameDisplay.innerText = modelText;

                // Update tanda centang
                modelSelectorLinks.forEach(l => {
                    const icon = l.querySelector('i');
                    if(icon) icon.remove();
                });
                const checkIcon = document.createElement('i');
                checkIcon.className = 'uil uil-check-circle text-blue-600';
                link.appendChild(checkIcon);

                console.log(`Model changed to: ${selectedModel}`);
            }
            modelDropdown.classList.add('hidden');
        });
    });
    
    window.addEventListener('click', () => {
        if (modelDropdown && !modelDropdown.classList.contains('hidden')) {
            modelDropdown.classList.add('hidden');
        }
    });

    if (codebaseBtn) {
        codebaseBtn.addEventListener('click', () => {
            codebaseModal.classList.remove('hidden');
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            codebaseModal.classList.add('hidden');
        });
    }

    if (saveCodebaseBtn) {
        saveCodebaseBtn.addEventListener('click', () => {
            activeCodebase = codebaseTextarea.value;
            console.log("Codebase saved!");
            codebaseModal.classList.add('hidden');
            codebaseBtn.classList.add('text-blue-600');
        });
    }

    // --- Fungsi Inti ---

    const sendMessage = async () => {
        const message = chatInput.value.trim();
        if (!message) return;

        if (!welcomeScreen.classList.contains('hidden')) {
            welcomeScreen.classList.add('hidden');
            chatContainer.classList.remove('hidden');
        }

        appendMessage(message, 'user');
        chatInput.value = '';
        autoResizeTextarea(chatInput);

        const aiMessageContainer = appendMessage('', 'ai');
        const aiTextElement = aiMessageContainer.querySelector('.message-content');
        
        aiTextElement.innerHTML = '<div class="p-1"><span class="font-semibold animate-pulse">Caecillia is thinking...</span></div>';

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message,
                    codebase: activeCodebase,
                    modelName: selectedModel
                }),
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let aiResponse = '';
            
            let firstChunk = true;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                if(firstChunk) {
                    aiTextElement.innerHTML = '';
                    firstChunk = false;
                }

                const chunk = decoder.decode(value, { stream: true });
                aiResponse += chunk;
                aiTextElement.innerHTML = aiResponse;
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }
        } catch (error) {
            console.error('Error fetching chat response:', error);
            aiTextElement.innerHTML = '<p class="text-red-500">Maaf, terjadi kesalahan. Pastikan API Key valid dan coba lagi.</p>';
        }
    };

    const appendMessage = (content, role) => {
        const messageWrapper = document.createElement('div');
        messageWrapper.className = `mb-6 flex ${role === 'user' ? 'justify-end' : 'justify-start'}`;
        
        const messageBubble = document.createElement('div');
        messageBubble.className = `max-w-4xl rounded-xl p-4 shadow-sm ${role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-800'}`;
        
        const textElement = document.createElement('div');
        textElement.className = 'message-content prose prose-sm max-w-none';
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