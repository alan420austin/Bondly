// Real-time Chat for PBL Season 3 - Connect All Users

class ChatService {
    static async getUsers(departmentFilter = 'all') {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) return [];

        const users = await LocalDB.getUsers();
        let filteredUsers = users.filter(user => user.id !== currentUser.id);

        if (departmentFilter !== 'all') {
            filteredUsers = filteredUsers.filter(user => user.department === departmentFilter);
        }

        return filteredUsers.map(user => ({
            id: user.id,
            fullName: user.fullName,
            department: user.department,
            email: user.email,
            avatar: user.avatar,
            isOnline: Math.random() > 0.3 // Simulate online status
        }));
    }

    static async getChatMessages(otherUserId) {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) return [];

        const chats = await LocalDB.getChats();
        const chatId = this.getChatId(currentUser.id, otherUserId);
        
        return chats.filter(chat => chat.chatId === chatId)
                   .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }

    static async sendMessage(otherUserId, text) {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) throw new Error('User not authenticated');

        const message = {
            id: Date.now(),
            chatId: this.getChatId(currentUser.id, otherUserId),
            text: text.trim(),
            senderId: currentUser.id,
            senderName: currentUser.fullName,
            senderAvatar: currentUser.avatar,
            timestamp: new Date().toISOString(),
            read: false
        };

        await LocalDB.saveChat(message);
        return message;
    }

    static getChatId(userId1, userId2) {
        return [userId1, userId2].sort().join('_');
    }

    static async getRecentChats() {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) return [];

        const chats = await LocalDB.getChats();
        const userChats = chats.filter(chat => 
            chat.chatId.includes(currentUser.id.toString())
        );

        // Get unique chat partners
        const partners = new Map();
        userChats.forEach(chat => {
            const partnerId = chat.senderId === currentUser.id ? 
                chat.chatId.replace(currentUser.id.toString(), '').replace('_', '') : 
                chat.senderId;
            
            if (!partners.has(partnerId) && partnerId !== currentUser.id.toString()) {
                partners.set(partnerId, {
                    lastMessage: chat.text,
                    timestamp: chat.timestamp,
                    unread: chat.senderId !== currentUser.id && !chat.read
                });
            }
        });

        return Array.from(partners.entries()).map(([partnerId, chatInfo]) => ({
            partnerId: parseInt(partnerId),
            lastMessage: chatInfo.lastMessage,
            timestamp: chatInfo.timestamp,
            unread: chatInfo.unread
        }));
    }
}

// Chat management
let currentChatUser = null;
let chatRefreshInterval = null;

document.addEventListener('DOMContentLoaded', async function() {
    if (!document.getElementById('usersList')) return;

    const currentUser = AuthService.requireAuth();
    if (!currentUser) return;

    // Initialize chat
    await initializeChat();

    // Event listeners
    const departmentFilter = document.getElementById('departmentFilter');
    if (departmentFilter) {
        departmentFilter.addEventListener('change', loadUsers);
    }
    
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }

    // Load initial users
    await loadUsers();

    // Start auto-refresh for real-time feel
    chatRefreshInterval = setInterval(async () => {
        if (currentChatUser) {
            await loadMessages(currentChatUser.id);
        }
    }, 2000);
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (chatRefreshInterval) {
        clearInterval(chatRefreshInterval);
    }
});

async function initializeChat() {
    // Set up message input
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.addEventListener('input', function() {
            const sendBtn = document.querySelector('#messageInputContainer button');
            if (sendBtn) {
                sendBtn.disabled = !this.value.trim();
            }
        });
    }
}

async function loadUsers() {
    const departmentFilterElement = document.getElementById('departmentFilter');
    const departmentFilter = departmentFilterElement ? departmentFilterElement.value : 'all';
    const usersList = document.getElementById('usersList');
    
    if (!usersList) return;

    try {
        const users = await ChatService.getUsers(departmentFilter);
        displayUsers(users);
    } catch (error) {
        console.error('Error loading users:', error);
        usersList.innerHTML = '<div class="loading">Error loading users</div>';
    }
}

function displayUsers(users) {
    const usersList = document.getElementById('usersList');
    if (!usersList) return;

    if (users.length === 0) {
        usersList.innerHTML = '<div class="loading">No users found</div>';
        return;
    }

    usersList.innerHTML = users.map(user => `
        <div class="user-item" data-user-id="${user.id}">
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 1.2em;">${user.avatar}</span>
                <div>
                    <div style="font-weight: 600;">${user.fullName}</div>
                    <div style="font-size: 0.875rem; color: var(--text-muted);">
                        ${user.department} 
                        <span style="color: ${user.isOnline ? '#4CAF50' : '#999'}">• ${user.isOnline ? 'Online' : 'Offline'}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    // Add click event listeners
    document.querySelectorAll('.user-item').forEach(item => {
        item.addEventListener('click', async () => {
            const userId = parseInt(item.getAttribute('data-user-id'));
            const user = await LocalDB.getUserById(userId);
            
            if (user) {
                startChatWithUser(user);
            }
        });
    });
}

async function startChatWithUser(user) {
    currentChatUser = user;
    
    // Update UI
    document.querySelectorAll('.user-item').forEach(item => {
        item.classList.remove('active');
    });
    const activeUser = document.querySelector(`[data-user-id="${user.id}"]`);
    if (activeUser) activeUser.classList.add('active');
    
    // Update chat header
    const chatHeader = document.getElementById('chatHeader');
    if (chatHeader) {
        chatHeader.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 1.5em;">${user.avatar}</span>
                <div>
                    <h3 style="margin: 0;">${user.fullName}</h3>
                    <div style="font-size: 0.875rem; color: var(--text-muted);">${user.department} Department</div>
                </div>
            </div>
        `;
    }
    
    // Show message input
    const messageInputContainer = document.getElementById('messageInputContainer');
    if (messageInputContainer) {
        messageInputContainer.style.display = 'flex';
        const messageInput = document.getElementById('messageInput');
        if (messageInput) messageInput.focus();
    }
    
    // Load messages
    await loadMessages(user.id);
}

async function loadMessages(otherUserId) {
    const messagesContainer = document.getElementById('messagesContainer');
    if (!messagesContainer) return;

    try {
        const messages = await ChatService.getChatMessages(otherUserId);
        displayMessages(messages);
    } catch (error) {
        console.error('Error loading messages:', error);
        messagesContainer.innerHTML = '<div class="loading">Error loading messages</div>';
    }
}

function displayMessages(messages) {
    const messagesContainer = document.getElementById('messagesContainer');
    if (!messagesContainer) return;

    const currentUser = AuthService.getCurrentUser();

    if (messages.length === 0) {
        messagesContainer.innerHTML = `
            <div class="welcome-message">
                <h4>No messages yet</h4>
                <p>Start a conversation with ${currentChatUser?.fullName || 'this user'}</p>
                <p style="font-size: 0.9em; color: var(--text-muted);">You can discuss assignments, share resources, or just chat!</p>
            </div>
        `;
        return;
    }

    // Remove welcome message if it exists
    const welcomeMessage = messagesContainer.querySelector('.welcome-message');
    if (welcomeMessage) {
        welcomeMessage.remove();
    }

    messagesContainer.innerHTML = messages.map(message => {
        const isCurrentUser = message.senderId === currentUser.id;
        return `
            <div class="message-bubble ${isCurrentUser ? 'message-sent' : 'message-received'}">
                ${!isCurrentUser ? `<div style="font-size: 0.8em; margin-bottom: 5px; font-weight: 600;">${message.senderName}</div>` : ''}
                <div>${escapeHtml(message.text)}</div>
                <div style="font-size: 0.75rem; opacity: 0.7; margin-top: 0.25rem; text-align: ${isCurrentUser ? 'right' : 'left'}">
                    ${formatTime(message.timestamp)}
                </div>
            </div>
        `;
    }).join('');

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

async function sendMessage() {
    if (!currentChatUser) {
        showMessage('Please select a user to chat with', 'error');
        return;
    }
    
    const messageInput = document.getElementById('messageInput');
    const text = messageInput.value.trim();
    
    if (!text) return;

    try {
        await ChatService.sendMessage(currentChatUser.id, text);
        messageInput.value = '';
        await loadMessages(currentChatUser.id);
    } catch (error) {
        showMessage('Error sending message: ' + error.message, 'error');
    }
}

// Utility functions
function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showMessage(message, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `popup show ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '100px';
    messageDiv.style.right = '20px';
    messageDiv.style.zIndex = '1000';
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}