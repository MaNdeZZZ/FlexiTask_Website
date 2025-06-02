document.addEventListener('DOMContentLoaded', function() {
    const chatArea = document.getElementById('chat-area');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const newChatButton = document.getElementById('new-chat');
    
    // Fix profile image loading
    setupProfileImage();
    
    let isBotTyping = false;
    let messages = [];
    
    // Load chat history from localStorage
    function loadChatHistory() {
        const savedMessages = localStorage.getItem('chatHistory');
        if (savedMessages) {
            messages = JSON.parse(savedMessages);
            // Display the saved messages
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
            // Initial welcome message only if no history exists
            addBotMessage("Hello! I'm your task assistant. How can I help you today?");
        }
    }
    
    // Save chat history to localStorage
    function saveChatHistory() {
        localStorage.setItem('chatHistory', JSON.stringify(messages));
    }
    
    // Render functions that don't add to messages array (for loading from history)
    function renderUserMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        messageDiv.textContent = text;
        chatArea.appendChild(messageDiv);
    }
    
    function renderBotMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        messageDiv.textContent = text;
        chatArea.appendChild(messageDiv);
    }
    
    // Initial load of chat history
    loadChatHistory();
    
    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') sendMessage();
    });
    
    newChatButton.addEventListener('click', function() {
        // Clear chat history
        chatArea.innerHTML = '';
        messages = [];
        saveChatHistory();
        addBotMessage("Hello! I'm your task assistant. How can I help you today?");
    });
    
    document.querySelectorAll('.bottom-nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href') === '#') {
                e.preventDefault();
                document.querySelectorAll('.bottom-nav-link').forEach(l => {
                    l.classList.remove('active');
                });
                this.classList.add('active');
            }
        });
    });
    
    function sendMessage() {
        const text = messageInput.value.trim();
        if (text === '') return;
        
        addUserMessage(text);
        messageInput.value = '';
        
        // Show typing indicator
        showTypingIndicator();
        
        // Simulate bot response after delay
        simulateBotResponse(text);
    }
    
    function addUserMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        messageDiv.textContent = text;
        chatArea.appendChild(messageDiv);
        
        // Store message
        messages.push({
            text: text,
            isUserMessage: true,
            timestamp: new Date().toString()
        });
        
        // Save to localStorage
        saveChatHistory();
        
        scrollToBottom();
    }
    
    function addBotMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        messageDiv.textContent = text;
        chatArea.appendChild(messageDiv);
        
        // Store message
        messages.push({
            text: text,
            isUserMessage: false,
            timestamp: new Date().toString()
        });
        
        // Save to localStorage
        saveChatHistory();
        
        scrollToBottom();
    }
    
    function showTypingIndicator() {
        isBotTyping = true;
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
        isBotTyping = false;
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    function simulateBotResponse(userMessage) {
        setTimeout(() => {
            let botResponse = '';
            const lowerUserMessage = userMessage.toLowerCase();
            
            if (lowerUserMessage.includes('hello') || lowerUserMessage.includes('hi')) {
                botResponse = "Hello! How can I help you with your tasks today?";
            } else if (lowerUserMessage.includes('task') && lowerUserMessage.includes('today')) {
                botResponse = 
                    "Based on your schedule, you have 3 tasks for today:\n\n" +
                    "1. Attend webinar on Flutter development at 2 PM\n" +
                    "2. Complete prototype for FlexiTask\n" +
                    "3. Team meeting at 3 PM\n\n" +
                    "Would you like me to prioritize these for you?";
            } else if (lowerUserMessage.includes('prioritize') || lowerUserMessage.includes('priority')) {
                botResponse = 
                    "Here's the suggested priority order:\n\n" +
                    "1. Complete prototype for FlexiTask (High priority)\n" +
                    "2. Attend webinar on Flutter development at 2 PM (Medium priority)\n" +
                    "3. Team meeting at 3 PM (Medium priority)";
            } else if (lowerUserMessage.includes('tomorrow')) {
                botResponse = 
                    "You have 2 tasks scheduled for tomorrow:\n\n" +
                    "1. Review project requirements\n" +
                    "2. Doctor appointment at 10 AM\n\n" +
                    "Would you like me to add another task for tomorrow?";
            } else if (lowerUserMessage.includes('add')) {
                botResponse = "What task would you like to add? Please provide a title, date, and optional description.";
            } else if (lowerUserMessage.includes('thank')) {
                botResponse = "You're welcome! Let me know if there's anything else I can help you with.";
            } else if (lowerUserMessage.includes('clear') && lowerUserMessage.includes('history')) {
                botResponse = "Chat history has been cleared.";
                setTimeout(() => {
                    messages = [
                        {
                            text: botResponse,
                            isUserMessage: false,
                            timestamp: new Date().toString()
                        }
                    ];
                    saveChatHistory();
                    chatArea.innerHTML = '';
                    renderBotMessage(botResponse);
                }, 1000);
            } else {
                botResponse = "I'm here to help organize your tasks. You can ask me about your schedule, add new tasks, or prioritize existing ones.";
            }
            
            hideTypingIndicator();
            if (!(lowerUserMessage.includes('clear') && lowerUserMessage.includes('history'))) {
                addBotMessage(botResponse);
            }
        }, 1000);
    }
    
    function scrollToBottom() {
        setTimeout(() => {
            chatArea.scrollTop = chatArea.scrollHeight;
        }, 100);
    }
});

// Setup profile image function
function setupProfileImage() {
    const profileImgContainer = document.getElementById('profileImage');
    const currentUser = getCurrentUser();
    
    if (currentUser && currentUser.profileImage) {
        // Jika ada gambar profil, tampilkan sebagai img
        profileImgContainer.innerHTML = `<img src="${currentUser.profileImage}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover;">`;
    } else {
        // Jika tidak ada gambar profil, tampilkan ikon person
        profileImgContainer.innerHTML = `<i class="bi bi-person-circle" style="font-size: 40px; color: #6c757d;"></i>`;
        profileImgContainer.style.backgroundColor = '#f8f9fa';
    }
}

function goBack() {
    window.location.href = 'dash2.html';
}

function goToProfile() {
    window.location.href = 'profile.html';
}

// Get current user function
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser') || 'null');
}