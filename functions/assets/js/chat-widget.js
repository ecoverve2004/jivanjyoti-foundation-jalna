// Enhanced AI Chat Widget Implementation
class ChatWidget {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.userInfo = null;
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.unreadCount = 0;
        this.init();
    }

    init() {
        // Check if widget already exists
        if (document.querySelector('.chat-widget')) {
            this.bindEvents();
            this.loadWelcomeMessage();
            return;
        }
        
        this.createWidget();
        this.bindEvents();
        this.loadWelcomeMessage();
    }

    createWidget() {
        const widget = document.createElement('div');
        widget.className = 'chat-widget';
        widget.innerHTML = `
            <div class="chat-window" id="chatWindow">
                <div class="chat-header">
                    <div class="chat-avatar">
                        <i class="fas fa-leaf"></i>
                    </div>
                    <div class="chat-info">
                        <h3>JivanJyoti Assistant</h3>
                        <p id="statusText">Online • Ready to help!</p>
                    </div>
                </div>
                <div class="chat-messages" id="chatMessages">
                    <!-- Messages will be added here -->
                </div>
                <div class="chat-input-area">
                    <div class="chat-input-container">
                        <div class="input-actions">
                            <button class="voice-btn" id="voiceBtn" title="Voice message">
                                <i class="fas fa-microphone"></i>
                            </button>
                            <button class="file-btn" id="fileBtn" title="Attach file">
                                <i class="fas fa-paperclip"></i>
                            </button>
                        </div>
                        <input type="text" class="chat-input" id="chatInput" placeholder="Type your message...">
                        <button class="chat-send" id="chatSend">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                    <input type="file" id="fileInput" style="display: none" accept="image/*,.pdf,.doc,.docx,.txt">
                    <div class="emoji-picker" id="emojiPicker">
                        <!-- Emojis will be added here -->
                    </div>
                </div>
            </div>
            <button class="chat-toggle" id="chatToggle">
                <i class="fas fa-comments"></i>
                <span class="notification-badge" id="notificationBadge" style="display: none;">0</span>
            </button>
        `;
        document.body.appendChild(widget);
        this.initEmojis();
    }

    initEmojis() {
        const emojis = ['😊', '👍', '❤️', '🌱', '🌳', '🌿', '💚', '🙏', '👏', '✨', '🌍', '♻️'];
        const emojiPicker = document.getElementById('emojiPicker');
        
        if (!emojiPicker) return;
        
        emojis.forEach(emoji => {
            const btn = document.createElement('button');
            btn.className = 'emoji-btn';
            btn.textContent = emoji;
            btn.onclick = () => this.insertEmoji(emoji);
            emojiPicker.appendChild(btn);
        });
    }

    insertEmoji(emoji) {
        const input = document.getElementById('chatInput');
        if (input) {
            input.value += emoji;
            input.focus();
            document.getElementById('emojiPicker').classList.remove('active');
        }
    }

    bindEvents() {
        const toggle = document.getElementById('chatToggle');
        const input = document.getElementById('chatInput');
        const send = document.getElementById('chatSend');
        const voiceBtn = document.getElementById('voiceBtn');
        const fileBtn = document.getElementById('fileBtn');
        const fileInput = document.getElementById('fileInput');

        if (toggle) toggle.addEventListener('click', () => this.toggleChat());
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
            input.addEventListener('input', () => this.handleTyping());
        }
        if (send) send.addEventListener('click', () => this.sendMessage());
        if (voiceBtn) voiceBtn.addEventListener('click', () => this.toggleVoiceRecording());
        if (fileBtn) fileBtn.addEventListener('click', () => fileInput.click());
        if (fileInput) fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
    }

    toggleChat() {
        const window = document.getElementById('chatWindow');
        const toggle = document.getElementById('chatToggle');
        
        if (!window || !toggle) return;
        
        this.isOpen = !this.isOpen;
        
        if (this.isOpen) {
            window.classList.add('active');
            toggle.classList.add('active');
            toggle.innerHTML = '<i class="fas fa-times"></i>';
            this.clearNotifications();
            this.trackEvent('chat_opened');
        } else {
            window.classList.remove('active');
            toggle.classList.remove('active');
            toggle.innerHTML = '<i class="fas fa-comments"></i><span class="notification-badge" id="notificationBadge" style="display: none;">0</span>';
        }
    }

    loadWelcomeMessage() {
        setTimeout(() => {
            const welcomeMsg = this.getPersonalizedWelcome();
            this.addMessage('bot', welcomeMsg, true);
            this.showQuickActions([
                '🌳 वृक्षारोपण जानकारी',
                '🤝 स्वयंसेवक बनें',
                '📞 संपर्क विवरण',
                '💚 दान करें'
            ]);
        }, 1000);
    }

    getPersonalizedWelcome() {
        const hour = new Date().getHours();
        let greeting = '';
        
        if (hour < 12) {
            greeting = 'सुप्रभात! ☀️';
        } else if (hour < 17) {
            greeting = 'नमस्कार! 🌞';
        } else {
            greeting = 'शुभ संध्या! 🌅';
        }
        
        const welcomeMessages = [
            `${greeting} जीवनज्योति फाउंडेशन में आपका स्वागत है! 🌱<br><br>मैं आपका AI असिस्टेंट हूं। पर्यावरण संरक्षण के बारे में कुछ भी पूछ सकते हैं!`,
            `${greeting} मैं जीवनज्योति फाउंडेशन का स्मार्ट असिस्टेंट हूं! 🤖🌳<br><br>वृक्षारोपण, स्वयंसेवा, या दान के बारे में जानना चाहते हैं?`,
            `${greeting} Welcome to JivanJyoti Foundation! 🌍<br><br>I'm here to help you learn about our environmental conservation work. How can I assist you today?`
        ];
        
        return welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    }

    sendMessage() {
        const input = document.getElementById('chatInput');
        if (!input) return;
        
        const message = input.value.trim();
        if (!message) return;
        
        this.addMessage('user', message);
        input.value = '';
        
        this.trackUserMessage(message);
        this.showTyping();
        
        setTimeout(() => {
            this.hideTyping();
            this.processMessage(message);
        }, 1500);
    }

    addMessage(sender, content, showActions = false, messageType = 'text') {
        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const avatar = sender === 'bot' ? '<i class="fas fa-leaf"></i>' : '<i class="fas fa-user"></i>';
        const timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        let messageContent = content;
        if (messageType === 'file') {
            messageContent = `<div class="file-preview">
                <i class="fas fa-file"></i>
                <span>${content}</span>
            </div>`;
        } else if (messageType === 'audio') {
            messageContent = `<audio controls style="max-width: 200px;">
                <source src="${content}" type="audio/webm">
                Your browser does not support audio playback.
            </audio>`;
        }
        
        messageDiv.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">
                ${messageContent}
                <div class="message-time">${timestamp}</div>
            </div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        this.messages.push({
            sender,
            content,
            messageType,
            timestamp: new Date().toISOString()
        });
        
        if (sender === 'bot' && !this.isOpen) {
            this.showNotification();
        }
    }

    showQuickActions(actions) {
        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) return;
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'message bot';
        
        const actionsHTML = actions.map((action, index) => 
            `<div class="quick-action" onclick="window.chatWidget.handleQuickAction('${action}')" style="animation-delay: ${index * 0.1}s">${action}</div>`
        ).join('');
        
        actionsDiv.innerHTML = `
            <div class="message-avatar"><i class="fas fa-leaf"></i></div>
            <div class="message-content">
                <p style="margin-bottom: 10px; font-size: 13px; color: #6b7280;">💡 Quick actions:</p>
                <div class="quick-actions">${actionsHTML}</div>
            </div>
        `;
        
        messagesContainer.appendChild(actionsDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    handleQuickAction(action) {
        this.addMessage('user', action);
        this.showTyping();
        
        const delay = Math.random() * 1000 + 800;
        
        setTimeout(() => {
            this.hideTyping();
            this.processMessage(action);
        }, delay);
    }

    processMessage(message) {
        const lowerMessage = message.toLowerCase();
        let response = '';
        
        if (lowerMessage.includes('program') || lowerMessage.includes('कार्यक्रम')) {
            response = 'हमारे मुख्य पर्यावरण कार्यक्रम:<br>🌳 वृक्षारोपण अभियान - 15,420+ पेड़<br>📚 पर्यावरण शिक्षा - 120+ स्कूल<br>♻️ कचरा प्रबंधन - 50+ समुदाय<br>💧 जल संरक्षण - 25+ सिस्टम<br>🌾 जैविक खेती - 200+ किसान<br><br>कौन सा कार्यक्रम आपको दिलचस्प लगता है?';
        } else if (lowerMessage.includes('tree') || lowerMessage.includes('plantation') || lowerMessage.includes('वृक्ष')) {
            response = 'हमारे वृक्षारोपण कार्यक्रम में 15,420+ पेड़ लगाए गए हैं! 🌳<br><br>हम नीम, बरगद, पीपल और आम जैसी देशी प्रजातियां लगाते हैं। प्रत्येक पेड़ की लागत ₹50 है जिसमें 2 साल की देखभाल शामिल है।<br><br>क्या आप पेड़ों को प्रायोजित करना चाहते हैं?';
        } else if (lowerMessage.includes('volunteer') || lowerMessage.includes('join') || lowerMessage.includes('स्वयंसेवक')) {
            response = 'बहुत बढ़िया! हम स्वयंसेवकों का स्वागत करते हैं! 🙌<br><br>आप इसमें मदद कर सकते हैं:<br>• वृक्षारोपण अभियान<br>• शैक्षिक कार्यशालाएं<br>• सामुदायिक पहुंच<br>• कार्यक्रम आयोजन<br><br>शुरुआत करने के लिए कृपया अपना संपर्क विवरण साझा करें!';
        } else if (lowerMessage.includes('contact') || lowerMessage.includes('phone') || lowerMessage.includes('संपर्क')) {
            response = 'यहाँ हमारे संपर्क विवरण हैं:<br><br>📍 At.Khodpuri Post.Utvad Tq.Dist.Jalna<br>📞 +91 957-777-1854<br>✉️ jivanjyoti@gmail.com<br><br>कभी भी संपर्क करने में संकोच न करें!';
        } else if (lowerMessage.includes('donate') || lowerMessage.includes('support') || lowerMessage.includes('दान')) {
            response = 'हमारा समर्थन करने के लिए धन्यवाद! 💚<br><br>आप इसके माध्यम से योगदान दे सकते हैं:<br>• वृक्ष प्रायोजन (₹50/पेड़)<br>• मासिक दान<br>• उपकरण दान<br>• स्वयंसेवी समय<br><br>हर योगदान से फर्क पड़ता है!';
        } else {
            response = 'आपके संदेश के लिए धन्यवाद! 🌱<br><br>हमारी टीम आपकी पूछताछ की समीक्षा करेगी और जल्द ही आपसे संपर्क करेगी। क्या हमारे पर्यावरण कार्यक्रमों के बारे में कुछ खास जानना चाहते हैं?';
            setTimeout(() => {
                this.showQuickActions([
                    '🌳 वृक्षारोपण जानकारी',
                    '🤝 स्वयंसेवक बनें',
                    '📞 संपर्क करें',
                    '💚 दान करें'
                ]);
            }, 1000);
        }
        
        this.addMessage('bot', response);
    }

    showTyping() {
        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) return;
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot';
        typingDiv.id = 'typingIndicator';
        
        typingDiv.innerHTML = `
            <div class="message-avatar"><i class="fas fa-leaf"></i></div>
            <div class="message-content">
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTyping() {
        const typing = document.getElementById('typingIndicator');
        if (typing) typing.remove();
    }

    showNotification() {
        this.unreadCount++;
        const badge = document.getElementById('notificationBadge');
        if (badge) {
            badge.textContent = this.unreadCount;
            badge.style.display = 'flex';
        }
    }

    clearNotifications() {
        this.unreadCount = 0;
        const badge = document.getElementById('notificationBadge');
        if (badge) {
            badge.style.display = 'none';
        }
    }

    handleTyping() {
        this.updateStatus('Typing...');
        clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => {
            this.updateStatus('Online • Ready to help!');
        }, 1000);
    }

    updateStatus(status) {
        const statusText = document.getElementById('statusText');
        if (statusText) {
            statusText.textContent = status;
        }
    }

    toggleVoiceRecording() {
        if (!this.isRecording) {
            this.startVoiceRecording();
        } else {
            this.stopVoiceRecording();
        }
    }

    async startVoiceRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];
            
            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };
            
            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(audioBlob);
                this.addMessage('user', audioUrl, false, 'audio');
                this.processVoiceMessage(audioBlob);
            };
            
            this.mediaRecorder.start();
            this.isRecording = true;
            
            const voiceBtn = document.getElementById('voiceBtn');
            if (voiceBtn) {
                voiceBtn.classList.add('recording');
                voiceBtn.innerHTML = '<i class="fas fa-stop"></i>';
            }
            
            this.updateStatus('Recording...');
            
        } catch (error) {
            console.error('Error accessing microphone:', error);
            this.addMessage('bot', 'Sorry, I couldn\'t access your microphone. Please check your permissions.');
        }
    }

    stopVoiceRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
            this.isRecording = false;
            
            const voiceBtn = document.getElementById('voiceBtn');
            if (voiceBtn) {
                voiceBtn.classList.remove('recording');
                voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            }
            
            this.updateStatus('Online • Ready to help!');
        }
    }

    processVoiceMessage(audioBlob) {
        this.showTyping();
        setTimeout(() => {
            this.hideTyping();
            this.addMessage('bot', 'मैंने आपका वॉइस मैसेज प्राप्त किया! 🎤 हमारी टीम इसे सुनेगी और जल्द ही जवाब देगी। तेज़ जवाब के लिए आप टाइप भी कर सकते हैं।');
        }, 2000);
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            this.addMessage('bot', 'File size should be less than 5MB. Please choose a smaller file.');
            return;
        }
        
        const allowedTypes = ['image/', 'application/pdf', 'text/', '.doc', '.docx'];
        const isAllowed = allowedTypes.some(type => file.type.includes(type) || file.name.includes(type));
        
        if (!isAllowed) {
            this.addMessage('bot', 'Please upload images, PDF, or document files only.');
            return;
        }
        
        this.addMessage('user', file.name, false, 'file');
        this.processFileUpload(file);
    }

    processFileUpload(file) {
        this.showTyping();
        setTimeout(() => {
            this.hideTyping();
            if (file.type.includes('image/')) {
                this.addMessage('bot', 'Thanks for sharing the image! 📸 Our team will review it and get back to you. How can we help you with this?');
            } else {
                this.addMessage('bot', `Thanks for sharing "${file.name}"! 📄 Our team will review the document and respond accordingly.`);
            }
        }, 1500);
    }

    trackEvent(event) {
        const data = {
            event: event,
            timestamp: new Date().toISOString(),
            page: window.location.pathname,
            userAgent: navigator.userAgent
        };
        
        console.log('Chat Event:', data);
    }

    trackUserMessage(message) {
        const data = {
            type: 'user_message',
            message: message,
            timestamp: new Date().toISOString(),
            page: window.location.pathname,
            sessionId: this.getSessionId()
        };
        
        console.log('User Message:', data);
        this.storeUserInquiry(data);
    }

    storeUserInquiry(data) {
        let inquiries = JSON.parse(localStorage.getItem('chatInquiries') || '[]');
        inquiries.push(data);
        localStorage.setItem('chatInquiries', JSON.stringify(inquiries));
    }

    getSessionId() {
        let sessionId = localStorage.getItem('chatSessionId');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('chatSessionId', sessionId);
        }
        return sessionId;
    }
}

// Initialize chat widget when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (typeof window.chatWidget === 'undefined') {
        window.chatWidget = new ChatWidget();
    }
});