// public/js/ui_logic.js
document.addEventListener('DOMContentLoaded', () => {
    // Variabel untuk menyimpan state UI
    let activeCodebase = '';
    let selectedModel = 'gemini-2.5-flash'; // Model default

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
                    const icon = l.querySelector('i.uil-check-circle');
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

    /**
     * Menambahkan styling interaktif pada blok kode yang di-render.
     * @param {HTMLElement} container - Elemen kontainer dari pesan AI.
     */
    const enhanceCodeBlocks = (container) => {
        const pres = container.querySelectorAll('pre');

        pres.forEach(pre => {
            if (pre.parentElement.classList.contains('code-block-wrapper')) {
                return; // Sudah di-enhance, jangan proses lagi
            }

            const code = pre.querySelector('code');
            if (!code) return;

            const langClass = Array.from(code.classList).find(c => c.startsWith('language-'));
            const language = langClass ? langClass.replace('language-', '') : 'text';

            // 1. Buat wrapper utama
            const wrapper = document.createElement('div');
            wrapper.className = 'code-block-wrapper bg-[#0d1117] border border-gray-700 rounded-lg overflow-hidden my-4';

            // 2. Buat header
            const header = document.createElement('div');
            header.className = 'flex items-center justify-between bg-[#161b22] px-4 py-2 text-xs text-gray-400 border-b border-gray-700';
            
            const langSpan = document.createElement('span');
            langSpan.className = 'font-mono uppercase';
            langSpan.textContent = language;

            // 3. Buat tombol copy
            const copyButton = document.createElement('button');
            copyButton.className = 'flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-gray-700 active:bg-gray-600 transition-colors';
            copyButton.innerHTML = `<i class="uil uil-copy text-base"></i><span class="text-sm">Copy code</span>`;

            copyButton.addEventListener('click', () => {
                navigator.clipboard.writeText(code.innerText).then(() => {
                    copyButton.innerHTML = `<i class="uil uil-check text-base text-green-400"></i><span class="text-sm">Copied!</span>`;
                    setTimeout(() => {
                        copyButton.innerHTML = `<i class="uil uil-copy text-base"></i><span class="text-sm">Copy code</span>`;
                    }, 2000);
                }).catch(err => {
                    console.error('Gagal menyalin kode:', err);
                });
            });

            header.appendChild(langSpan);
            header.appendChild(copyButton);

            // 4. Susun ulang DOM
            pre.parentNode.insertBefore(wrapper, pre);
            wrapper.appendChild(header);
            wrapper.appendChild(pre);

            // Tag <pre> sekarang hanya untuk scrolling
            pre.className = 'overflow-x-auto text-sm';
            // Tag <code> kita buat block dan beri padding di dalamnya
            code.style.display = 'block';
            code.style.padding = '1rem'; // Ini setara dengan class p-4 di Tailwind
            // Memicu Prism untuk mewarnai elemen kode ini
            Prism.highlightElement(code);
        });
    };

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
                
                if (firstChunk && !done) {
                    aiTextElement.innerHTML = '';
                    firstChunk = false;
                }

                if (done) {
                    // Setelah stream selesai, jalankan fungsi untuk mempercantik blok kode
                    enhanceCodeBlocks(aiTextElement);
                    break;
                }

                const chunk = decoder.decode(value, { stream: true });
                aiResponse += chunk;
                aiTextElement.innerHTML = aiResponse; // Render HTML secara streaming
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
        
        if (role === 'user') {
            // Bubble biru untuk user
            messageBubble.className = `max-w-4xl rounded-xl p-4 shadow-sm bg-blue-600 text-white`;
        } else {
            // Tanpa bubble untuk AI, agar blok kode bisa full-width
            messageBubble.className = `max-w-4xl w-full`;
        }
        
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