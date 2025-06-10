document.addEventListener('DOMContentLoaded', function () {
    const chatArea = document.getElementById('chat-area');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const newChatButton = document.getElementById('new-chat');

    setupProfileImage();

    let messages = [];

    function loadChatHistory() {
        const savedMessages = localStorage.getItem('chatHistory');
        if (savedMessages) {
            messages = JSON.parse(savedMessages);
            chatArea.innerHTML = '';
            messages.forEach(message => {
                if (message.isUserMessage) {
                    renderUserMessage(message.text);
                } else {
                    renderBotMessage(message.text);
                }
            });
            scrollToBottom();
        } else {
            addBotMessage("Hello! I'm your task assistant. How can I help you today?");
        }
    }

    function saveChatHistory() {
        localStorage.setItem('chatHistory', JSON.stringify(messages));
    }

    function renderUserMessage(text) {
        const div = document.createElement('div');
        div.className = 'message user-message';
        div.textContent = text;
        chatArea.appendChild(div);
    }

    function renderBotMessage(text) {
        const div = document.createElement('div');
        div.className = 'message bot-message';
        div.textContent = text;
        chatArea.appendChild(div);
    }

    function scrollToBottom() {
        setTimeout(() => {
            chatArea.scrollTop = chatArea.scrollHeight;
        }, 100);
    }

    loadChatHistory();

    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') sendMessage();
    });

    newChatButton.addEventListener('click', function () {
        chatArea.innerHTML = '';
        messages = [];
        saveChatHistory();
        addBotMessage("Hello! I'm your task assistant. How can I help you today?");
    });

    function sendMessage() {
        const text = messageInput.value.trim();
        if (!text) return;

        addUserMessage(text);
        messageInput.value = '';
        showTypingIndicator();
        simulateBotResponse(text);
    }

    function addUserMessage(text) {
        const div = document.createElement('div');
        div.className = 'message user-message';
        div.textContent = text;
        chatArea.appendChild(div);
        messages.push({ text, isUserMessage: true, timestamp: new Date().toISOString() });
        saveChatHistory();
        scrollToBottom();
    }

    function addBotMessage(text) {
        const div = document.createElement('div');
        div.className = 'message bot-message';
        div.textContent = text;
        chatArea.appendChild(div);
        messages.push({ text, isUserMessage: false, timestamp: new Date().toISOString() });
        saveChatHistory();
        scrollToBottom();
    }

    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'typing-indicator';
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'typing-dot';
            typingDiv.appendChild(dot);
        }
        chatArea.appendChild(typingDiv);
        scrollToBottom();
    }

    function hideTypingIndicator() {
        const typing = document.getElementById('typing-indicator');
        if (typing) typing.remove();
    }

    async function simulateBotResponse(userMessage) {
        try {
            const response = await fetch('/api/groq-chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify({ message: userMessage })
            });

            // Cek apakah response JSON valid
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error("Invalid JSON response from server");
            }

            const data = await response.json();
            console.log("👉 Groq response:", data);

            hideTypingIndicator();

            if (!data || typeof data.reply !== 'string' || !data.reply.trim()) {
                console.warn("⚠️ Invalid or empty response from Groq:", data);
                addBotMessage("⚠️ Assistant is temporarily unavailable. Please try again.");
                return;
            }

            addBotMessage(data.reply);
        } catch (error) {
            hideTypingIndicator();
            addBotMessage("⚠️ Failed to get a response. Please check your connection or try again.");
            console.error("Groq Chat Error:", error);
        }
    }

});

// Profile image setup
function setupProfileImage() {
    const profileImgContainer = document.getElementById('profileImage');
    const currentUser = getCurrentUser();

    if (currentUser && currentUser.profileImage) {
        profileImgContainer.innerHTML = `<img src="${currentUser.profileImage}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover;">`;
    } else {
        profileImgContainer.innerHTML = `<i class="bi bi-person-circle" style="font-size: 40px; color: #6c757d;"></i>`;
        profileImgContainer.style.backgroundColor = '#f8f9fa';
    }
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser') || 'null');
}
