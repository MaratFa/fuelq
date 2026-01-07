/**
 * Chat Component
 * Handles real-time chat functionality for rooms and direct messages
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize chat
    initChat();
});

/**
 * Initialize chat functionality
 */
function initChat() {
    // Initialize chat tabs
    initChatTabs();

    // Initialize room list
    initRoomList();

    // Initialize direct messages
    initDirectMessages();

    // Initialize connection requests
    initConnectionRequests();

    // Initialize chat room
    initChatRoom();

    // Initialize chat input
    initChatInput();

    // Initialize real-time connection
    initRealtimeConnection();

    // Initialize chat search
    initChatSearch();

    // Initialize create room functionality
    initCreateRoom();
}

/**
 * Initialize chat tabs
 */
function initChatTabs() {
    const chatTabs = document.querySelectorAll('.chat-tab');
    const chatLists = document.querySelectorAll('.chat-list');

    chatTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Get tab type
            const tabType = tab.getAttribute('data-tab');

            // Update active states
            chatTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Show corresponding list
            chatLists.forEach(list => list.classList.remove('active'));
            document.getElementById(`${tabType}-list`).classList.add('active');
        });
    });
}

/**
 * Initialize room list
 */
function initRoomList() {
    const roomItems = document.querySelectorAll('.chat-room-item');

    roomItems.forEach(item => {
        item.addEventListener('click', () => {
            // Update active state
            roomItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // Load room messages
            const roomId = item.getAttribute('data-room-id');
            loadRoomMessages(roomId);
        });
    });
}

/**
 * Initialize direct messages
 */
function initDirectMessages() {
    const userItems = document.querySelectorAll('.chat-user-item');

    userItems.forEach(item => {
        item.addEventListener('click', () => {
            // Update active state
            userItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // Load direct messages
            const userId = item.getAttribute('data-user-id');
            loadDirectMessages(userId);
        });
    });
}

/**
 * Initialize connection requests
 */
function initConnectionRequests() {
    const acceptButtons = document.querySelectorAll('.accept-btn');
    const declineButtons = document.querySelectorAll('.decline-btn');

    acceptButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const requestItem = button.closest('.chat-request-item');
            const userId = requestItem.getAttribute('data-user-id');

            acceptConnectionRequest(userId, requestItem);
        });
    });

    declineButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const requestItem = button.closest('.chat-request-item');
            const userId = requestItem.getAttribute('data-user-id');

            declineConnectionRequest(userId, requestItem);
        });
    });
}

/**
 * Accept connection request
 * @param {string} userId - The user ID
 * @param {HTMLElement} requestItem - The request item element
 */
function acceptConnectionRequest(userId, requestItem) {
    fetch(`/api/chat/accept-request`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId }),
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to accept connection request');
        }
        return response.json();
    })
    .then(data => {
        // Remove request item
        requestItem.remove();

        // Show notification
        showNotification('Connection request accepted', 'success');

        // Add user to direct messages list
        addToDirectMessagesList(data.user);
    })
    .catch(error => {
        console.error('Error accepting connection request:', error);
        showNotification('Failed to accept connection request', 'error');
    });
}

/**
 * Decline connection request
 * @param {string} userId - The user ID
 * @param {HTMLElement} requestItem - The request item element
 */
function declineConnectionRequest(userId, requestItem) {
    fetch(`/api/chat/decline-request`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId }),
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to decline connection request');
        }
        return response.json();
    })
    .then(data => {
        // Remove request item
        requestItem.remove();

        // Show notification
        showNotification('Connection request declined', 'info');
    })
    .catch(error => {
        console.error('Error declining connection request:', error);
        showNotification('Failed to decline connection request', 'error');
    });
}

/**
 * Add user to direct messages list
 * @param {Object} user - The user object
 */
function addToDirectMessagesList(user) {
    const directList = document.getElementById('direct-list');

    // Create user item
    const userItem = document.createElement('div');
    userItem.className = 'chat-user-item';
    userItem.setAttribute('data-user-id', user.id);
    userItem.innerHTML = `
        <img src="${user.avatar || '/src/assets/images/default-avatar.png'}" alt="${user.name}" class="user-avatar">
        <div class="user-info">
            <div class="user-name">${user.name}</div>
            <div class="user-message">Start a conversation</div>
        </div>
        <div class="user-meta">
            <span class="message-time">Just now</span>
            <span class="user-status ${user.status || 'online'}"></span>
        </div>
    `;

    // Add click event
    userItem.addEventListener('click', () => {
        // Update active state
        document.querySelectorAll('.chat-user-item').forEach(i => i.classList.remove('active'));
        userItem.classList.add('active');

        // Load direct messages
        loadDirectMessages(user.id);
    });

    // Add to list
    directList.appendChild(userItem);

    // Switch to direct messages tab
    document.querySelector('[data-tab="direct"]').click();
}

/**
 * Initialize chat room
 */
function initChatRoom() {
    // Initialize view participants button
    const viewParticipantsBtn = document.querySelector('.view-participants');
    if (viewParticipantsBtn) {
        viewParticipantsBtn.addEventListener('click', showParticipantsModal);
    }

    // Initialize room settings button
    const roomSettingsBtn = document.querySelector('.room-actions button[title="Room settings"]');
    if (roomSettingsBtn) {
        roomSettingsBtn.addEventListener('click', showRoomSettingsModal);
    }

    // Initialize leave room button
    const leaveRoomBtn = document.querySelector('.room-actions button[title="Leave room"]');
    if (leaveRoomBtn) {
        leaveRoomBtn.addEventListener('click', leaveRoom);
    }

    // Initialize message actions
    const messageActions = document.querySelectorAll('.message-action');
    messageActions.forEach(action => {
        action.addEventListener('click', (e) => {
            const messageElement = e.target.closest('.chat-message');
            const messageId = messageElement.getAttribute('data-message-id');
            const action = e.target.getAttribute('data-action');

            handleMessageAction(messageId, action, messageElement);
        });
    });
}

/**
 * Show participants modal
 */
function showParticipantsModal() {
    // Create modal if it doesn't exist
    let modal = document.getElementById('participants-modal');

    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'participants-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Room Participants</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="participants-list">
                        <!-- Participants will be loaded here -->
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Initialize close button
        const closeBtn = modal.querySelector('.close');
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        // Initialize backdrop click
        const backdrop = modal.querySelector('.modal-backdrop');
        backdrop.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    // Show modal
    modal.style.display = 'flex';

    // Load participants
    loadRoomParticipants();
}

/**
 * Load room participants
 */
function loadRoomParticipants() {
    const participantsList = document.querySelector('.participants-list');

    // Show loading state
    participantsList.innerHTML = `
        <div class="loading-indicator">
            <div class="spinner"></div>
            <p>Loading participants...</p>
        </div>
    `;

    // Get current room ID
    const activeRoom = document.querySelector('.chat-room-item.active');
    const roomId = activeRoom ? activeRoom.getAttribute('data-room-id') : null;

    if (!roomId) {
        participantsList.innerHTML = '<p>No room selected</p>';
        return;
    }

    // Fetch participants
    fetch(`/api/chat/rooms/${roomId}/participants`, {
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load participants');
        }
        return response.json();
    })
    .then(participants => {
        // Update UI
        participantsList.innerHTML = '';

        if (participants.length === 0) {
            participantsList.innerHTML = '<p>No participants in this room</p>';
            return;
        }

        participants.forEach(participant => {
            const participantItem = document.createElement('div');
            participantItem.className = 'participant-item';
            participantItem.innerHTML = `
                <img src="${participant.avatar || '/src/assets/images/default-avatar.png'}" alt="${participant.name}" class="participant-avatar">
                <div class="participant-info">
                    <div class="participant-name">${participant.name}</div>
                    <div class="participant-role">${participant.role || 'Member'}</div>
                </div>
                <div class="participant-status ${participant.status || 'online'}"></div>
            `;

            participantsList.appendChild(participantItem);
        });
    })
    .catch(error => {
        console.error('Error loading participants:', error);
        participantsList.innerHTML = '<p>Failed to load participants</p>';
    });
}

/**
 * Show room settings modal
 */
function showRoomSettingsModal() {
    // Create modal if it doesn't exist
    let modal = document.getElementById('room-settings-modal');

    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'room-settings-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Room Settings</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="settings-form">
                        <div class="form-group">
                            <label for="room-name">Room Name</label>
                            <input type="text" id="room-name" placeholder="Enter room name">
                        </div>
                        <div class="form-group">
                            <label for="room-description">Description</label>
                            <textarea id="room-description" placeholder="Enter room description"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="room-category">Category</label>
                            <select id="room-category">
                                <option value="general">General</option>
                                <option value="hydrogen">Hydrogen</option>
                                <option value="biofuels">Biofuels</option>
                                <option value="solar">Solar</option>
                                <option value="wind">Wind</option>
                                <option value="nuclear">Nuclear</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="switch">
                                <input type="checkbox" id="room-private">
                                <span class="slider"></span>
                            </label>
                            <div class="setting-info">
                                <div class="setting-title">Private Room</div>
                                <div class="setting-desc">Only invited users can join</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary cancel-btn">Cancel</button>
                    <button class="btn-primary save-btn">Save Settings</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Initialize close button
        const closeBtn = modal.querySelector('.close');
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        // Initialize cancel button
        const cancelBtn = modal.querySelector('.cancel-btn');
        cancelBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        // Initialize save button
        const saveBtn = modal.querySelector('.save-btn');
        saveBtn.addEventListener('click', saveRoomSettings);

        // Initialize backdrop click
        const backdrop = modal.querySelector('.modal-backdrop');
        backdrop.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    // Show modal
    modal.style.display = 'flex';

    // Load current room settings
    loadRoomSettings();
}

/**
 * Load room settings
 */
function loadRoomSettings() {
    // Get current room ID
    const activeRoom = document.querySelector('.chat-room-item.active');
    const roomId = activeRoom ? activeRoom.getAttribute('data-room-id') : null;

    if (!roomId) {
        return;
    }

    // Fetch room settings
    fetch(`/api/chat/rooms/${roomId}/settings`, {
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load room settings');
        }
        return response.json();
    })
    .then(settings => {
        // Update form fields
        document.getElementById('room-name').value = settings.name || '';
        document.getElementById('room-description').value = settings.description || '';
        document.getElementById('room-category').value = settings.category || 'general';
        document.getElementById('room-private').checked = settings.isPrivate || false;
    })
    .catch(error => {
        console.error('Error loading room settings:', error);
        showNotification('Failed to load room settings', 'error');
    });
}

/**
 * Save room settings
 */
function saveRoomSettings() {
    // Get current room ID
    const activeRoom = document.querySelector('.chat-room-item.active');
    const roomId = activeRoom ? activeRoom.getAttribute('data-room-id') : null;

    if (!roomId) {
        return;
    }

    // Get form values
    const name = document.getElementById('room-name').value.trim();
    const description = document.getElementById('room-description').value.trim();
    const category = document.getElementById('room-category').value;
    const isPrivate = document.getElementById('room-private').checked;

    // Validate inputs
    if (!name) {
        showNotification('Room name is required', 'error');
        return;
    }

    // Show loading state
    const saveBtn = document.querySelector('.save-btn');
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    saveBtn.disabled = true;

    // Send to server
    fetch(`/api/chat/rooms/${roomId}/settings`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name,
            description,
            category,
            isPrivate
        }),
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to save room settings');
        }
        return response.json();
    })
    .then(data => {
        // Update room name in UI
        const roomNameElement = document.querySelector('.room-details h3');
        if (roomNameElement) {
            roomNameElement.textContent = name;
        }

        // Update room name in sidebar
        const roomNameInSidebar = document.querySelector('.chat-room-item.active .room-name');
        if (roomNameInSidebar) {
            roomNameInSidebar.textContent = name;
        }

        // Close modal
        document.getElementById('room-settings-modal').style.display = 'none';

        // Show notification
        showNotification('Room settings saved successfully', 'success');
    })
    .catch(error => {
        console.error('Error saving room settings:', error);
        showNotification('Failed to save room settings', 'error');
    })
    .finally(() => {
        // Reset button state
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
    });
}

/**
 * Leave room
 */
function leaveRoom() {
    // Get current room ID
    const activeRoom = document.querySelector('.chat-room-item.active');
    const roomId = activeRoom ? activeRoom.getAttribute('data-room-id') : null;

    if (!roomId) {
        return;
    }

    // Confirm before leaving
    if (!confirm('Are you sure you want to leave this room?')) {
        return;
    }

    // Send to server
    fetch(`/api/chat/rooms/${roomId}/leave`, {
        method: 'POST',
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to leave room');
        }
        return response.json();
    })
    .then(data => {
        // Remove room from sidebar
        activeRoom.remove();

        // Select first room in list
        const firstRoom = document.querySelector('.chat-room-item');
        if (firstRoom) {
            firstRoom.click();
        } else {
            // Show empty state
            const messagesContainer = document.querySelector('.chat-messages-container');
            messagesContainer.innerHTML = `
                <div class="empty-chat">
                    <div class="empty-icon">
                        <i class="fas fa-comments"></i>
                    </div>
                    <h3>No room selected</h3>
                    <p>Select a room from the sidebar or create a new one</p>
                </div>
            `;
        }

        // Show notification
        showNotification('You have left the room', 'info');
    })
    .catch(error => {
        console.error('Error leaving room:', error);
        showNotification('Failed to leave room', 'error');
    });
}

/**
 * Handle message action
 * @param {string} messageId - The message ID
 * @param {string} action - The action type
 * @param {HTMLElement} messageElement - The message element
 */
function handleMessageAction(messageId, action, messageElement) {
    switch (action) {
        case 'reply':
            // Focus input with reply prefix
            const chatInput = document.getElementById('chat-input');
            const messageAuthor = messageElement.querySelector('.message-author').textContent;
            chatInput.value = `@${messageAuthor} `;
            chatInput.focus();
            break;

        case 'like':
            // Toggle like status
            const likeButton = messageElement.querySelector('.message-action[data-action="like"]');
            const isLiked = likeButton.classList.contains('liked');

            if (isLiked) {
                // Unlike
                unlikeMessage(messageId, likeButton);
            } else {
                // Like
                likeMessage(messageId, likeButton);
            }
            break;
    }
}

/**
 * Like a message
 * @param {string} messageId - The message ID
 * @param {HTMLElement} likeButton - The like button element
 */
function likeMessage(messageId, likeButton) {
    fetch(`/api/chat/messages/${messageId}/like`, {
        method: 'POST',
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to like message');
        }
        return response.json();
    })
    .then(data => {
        // Update button state
        likeButton.classList.add('liked');
        likeButton.innerHTML = `<i class="fas fa-heart"></i> ${data.likesCount || 1}`;
    })
    .catch(error => {
        console.error('Error liking message:', error);
        showNotification('Failed to like message', 'error');
    });
}

/**
 * Unlike a message
 * @param {string} messageId - The message ID
 * @param {HTMLElement} likeButton - The like button element
 */
function unlikeMessage(messageId, likeButton) {
    fetch(`/api/chat/messages/${messageId}/unlike`, {
        method: 'POST',
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to unlike message');
        }
        return response.json();
    })
    .then(data => {
        // Update button state
        likeButton.classList.remove('liked');
        likeButton.innerHTML = `<i class="fas fa-heart"></i> ${data.likesCount || 0}`;
    })
    .catch(error => {
        console.error('Error unliking message:', error);
        showNotification('Failed to unlike message', 'error');
    });
}

/**
 * Initialize chat input
 */
function initChatInput() {
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');

    if (chatInput && sendBtn) {
        // Send message on button click
        sendBtn.addEventListener('click', sendMessage);

        // Send message on Enter (Shift+Enter for new line)
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        // Handle typing indicator
        let typingTimeout;
        chatInput.addEventListener('input', () => {
            // Clear existing timeout
            clearTimeout(typingTimeout);

            // Send typing indicator
            sendTypingIndicator();

            // Set timeout to stop typing indicator
            typingTimeout = setTimeout(() => {
                stopTypingIndicator();
            }, 1000);
        });
    }

    // Initialize attachment button
    const attachmentBtn = document.getElementById('attachment-btn');
    if (attachmentBtn) {
        attachmentBtn.addEventListener('click', () => {
            // Create file input if it doesn't exist
            let fileInput = document.getElementById('file-input');

            if (!fileInput) {
                fileInput = document.createElement('input');
                fileInput.id = 'file-input';
                fileInput.type = 'file';
                fileInput.style.display = 'none';
                fileInput.addEventListener('change', handleFileSelect);
                document.body.appendChild(fileInput);
            }

            // Trigger file selection
            fileInput.click();
        });
    }

    // Initialize emoji button
    const emojiBtn = document.getElementById('emoji-btn');
    if (emojiBtn) {
        emojiBtn.addEventListener('click', showEmojiPicker);
    }
}

/**
 * Send message
 */
function sendMessage() {
    const chatInput = document.getElementById('chat-input');
    const messageText = chatInput.value.trim();

    if (!messageText) {
        return;
    }

    // Get current room or user ID
    const activeRoom = document.querySelector('.chat-room-item.active');
    const activeUser = document.querySelector('.chat-user-item.active');

    let recipientId = null;
    let roomId = null;

    if (activeRoom) {
        roomId = activeRoom.getAttribute('data-room-id');
    } else if (activeUser) {
        recipientId = activeUser.getAttribute('data-user-id');
    }

    if (!roomId && !recipientId) {
        return;
    }

    // Create message object
    const message = {
        text: messageText,
        timestamp: Date.now()
    };

    // Add to UI immediately for better UX
    addMessageToUI(message, true);

    // Clear input
    chatInput.value = '';
    chatInput.style.height = 'auto';

    // Send to server
    const endpoint = roomId 
        ? `/api/chat/rooms/${roomId}/messages`
        : `/api/chat/direct/${recipientId}/messages`;

    fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(message),
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to send message');
        }
        return response.json();
    })
    .then(data => {
        // Update message with server-generated ID
        updateMessageId(message, data.id);
    })
    .catch(error => {
        console.error('Error sending message:', error);
        showNotification('Failed to send message', 'error');

        // Mark message as failed
        markMessageAsFailed(message);
    });
}

/**
 * Add message to UI
 * @param {Object} message - The message object
 * @param {boolean} isOwn - Whether the message is from the current user
 */
function addMessageToUI(message, isOwn = false) {
    const messagesContainer = document.querySelector('.chat-messages-container');

    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `chat-message ${isOwn ? 'own' : ''}`;
    messageElement.setAttribute('data-message-id', message.id || 'temp-' + Date.now());

    // Format timestamp
    const time = new Date(message.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });

    messageElement.innerHTML = `
        ${!isOwn ? `<img src="${message.authorAvatar || '/src/assets/images/default-avatar.png'}" alt="${message.authorName}" class="message-avatar">` : ''}
        <div class="message-content">
            <div class="message-header">
                <span class="message-author">${isOwn ? 'You' : message.authorName}</span>
                <span class="message-time">${time}</span>
            </div>
            <div class="message-text">${message.text}</div>
            <div class="message-actions">
                <button class="message-action" data-action="reply"><i class="fas fa-reply"></i> Reply</button>
                <button class="message-action ${message.isLiked ? 'liked' : ''}" data-action="like"><i class="fas fa-heart"></i> ${message.likesCount || 0}</button>
            </div>
        </div>
    `;

    // Add to container
    messagesContainer.appendChild(messageElement);

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Initialize message actions
    const messageActions = messageElement.querySelectorAll('.message-action');
    messageActions.forEach(action => {
        action.addEventListener('click', (e) => {
            handleMessageAction(
                messageElement.getAttribute('data-message-id'),
                e.target.getAttribute('data-action'),
                messageElement
            );
        });
    });
}

/**
 * Update message ID
 * @param {Object} message - The message object
 * @param {string} id - The server-generated ID
 */
function updateMessageId(message, id) {
    const messageElement = document.querySelector(`[data-message-id="temp-${message.timestamp}"]`);
    if (messageElement) {
        messageElement.setAttribute('data-message-id', id);
        message.id = id;
    }
}

/**
 * Mark message as failed
 * @param {Object} message - The message object
 */
function markMessageAsFailed(message) {
    const messageElement = document.querySelector(`[data-message-id="temp-${message.timestamp}"]`);
    if (messageElement) {
        messageElement.classList.add('failed');

        // Add retry button
        const messageText = messageElement.querySelector('.message-text');
        const retryButton = document.createElement('button');
        retryButton.className = 'retry-button';
        retryButton.innerHTML = '<i class="fas fa-redo"></i> Retry';
        retryButton.addEventListener('click', () => {
            // Remove failed message
            messageElement.remove();

            // Resend message
            sendMessage();
        });

        messageText.appendChild(retryButton);
    }
}

/**
 * Send typing indicator
 */
function sendTypingIndicator() {
    // Get current room or user ID
    const activeRoom = document.querySelector('.chat-room-item.active');
    const activeUser = document.querySelector('.chat-user-item.active');

    let roomId = null;

    if (activeRoom) {
        roomId = activeRoom.getAttribute('data-room-id');
    }

    if (!roomId) {
        return;
    }

    // Send to server
    fetch(`/api/chat/rooms/${roomId}/typing`, {
        method: 'POST',
        credentials: 'include'
    })
    .catch(error => {
        console.error('Error sending typing indicator:', error);
    });
}

/**
 * Stop typing indicator
 */
function stopTypingIndicator() {
    // Get current room or user ID
    const activeRoom = document.querySelector('.chat-room-item.active');
    const activeUser = document.querySelector('.chat-user-item.active');

    let roomId = null;

    if (activeRoom) {
        roomId = activeRoom.getAttribute('data-room-id');
    }

    if (!roomId) {
        return;
    }

    // Send to server
    fetch(`/api/chat/rooms/${roomId}/stop-typing`, {
        method: 'POST',
        credentials: 'include'
    })
    .catch(error => {
        console.error('Error stopping typing indicator:', error);
    });
}

/**
 * Handle file selection
 * @param {Event} e - The file selection event
 */
function handleFileSelect(e) {
    const file = e.target.files[0];

    if (!file) {
        return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        showNotification('File size should be less than 10MB', 'error');
        return;
    }

    // Show loading state
    showNotification('Uploading file...', 'info');

    // Create form data
    const formData = new FormData();
    formData.append('file', file);

    // Get current room or user ID
    const activeRoom = document.querySelector('.chat-room-item.active');
    const activeUser = document.querySelector('.chat-user-item.active');

    let recipientId = null;
    let roomId = null;

    if (activeRoom) {
        roomId = activeRoom.getAttribute('data-room-id');
        formData.append('roomId', roomId);
    } else if (activeUser) {
        recipientId = activeUser.getAttribute('data-user-id');
        formData.append('recipientId', recipientId);
    }

    if (!roomId && !recipientId) {
        return;
    }

    // Upload file
    fetch('/api/chat/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to upload file');
        }
        return response.json();
    })
    .then(data => {
        // Add file message to UI
        const fileMessage = {
            id: data.id,
            file: data.file,
            timestamp: Date.now()
        };

        addFileMessageToUI(fileMessage, true);

        // Show notification
        showNotification('File uploaded successfully', 'success');
    })
    .catch(error => {
        console.error('Error uploading file:', error);
        showNotification('Failed to upload file', 'error');
    });
}

/**
 * Add file message to UI
 * @param {Object} message - The message object
 * @param {boolean} isOwn - Whether the message is from the current user
 */
function addFileMessageToUI(message, isOwn = false) {
    const messagesContainer = document.querySelector('.chat-messages-container');

    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `chat-message ${isOwn ? 'own' : ''}`;
    messageElement.setAttribute('data-message-id', message.id);

    // Format timestamp
    const time = new Date(message.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });

    // Create file preview
    let filePreview = '';

    if (message.file.type.startsWith('image/')) {
        filePreview = `<img src="${message.file.url}" alt="${message.file.name}" class="message-image">`;
    } else {
        filePreview = `
            <div class="message-file">
                <div class="file-icon">
                    <i class="fas fa-file"></i>
                </div>
                <div class="file-info">
                    <div class="file-name">${message.file.name}</div>
                    <div class="file-size">${formatFileSize(message.file.size)}</div>
                </div>
                <a href="${message.file.url}" download="${message.file.name}" class="file-download">
                    <i class="fas fa-download"></i>
                </a>
            </div>
        `;
    }

    messageElement.innerHTML = `
        ${!isOwn ? `<img src="${message.authorAvatar || '/src/assets/images/default-avatar.png'}" alt="${message.authorName}" class="message-avatar">` : ''}
        <div class="message-content">
            <div class="message-header">
                <span class="message-author">${isOwn ? 'You' : message.authorName}</span>
                <span class="message-time">${time}</span>
            </div>
            <div class="message-attachment">
                ${filePreview}
            </div>
            <div class="message-actions">
                <button class="message-action" data-action="reply"><i class="fas fa-reply"></i> Reply</button>
                <button class="message-action ${message.isLiked ? 'liked' : ''}" data-action="like"><i class="fas fa-heart"></i> ${message.likesCount || 0}</button>
            </div>
        </div>
    `;

    // Add to container
    messagesContainer.appendChild(messageElement);

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Initialize message actions
    const messageActions = messageElement.querySelectorAll('.message-action');
    messageActions.forEach(action => {
        action.addEventListener('click', (e) => {
            handleMessageAction(
                messageElement.getAttribute('data-message-id'),
                e.target.getAttribute('data-action'),
                messageElement
            );
        });
    });
}

/**
 * Format file size
 * @param {number} bytes - The file size in bytes
 * @returns {string} The formatted file size
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Show emoji picker
 */
function showEmojiPicker() {
    // Create emoji picker if it doesn't exist
    let emojiPicker = document.getElementById('emoji-picker');

    if (!emojiPicker) {
        emojiPicker = document.createElement('div');
        emojiPicker.id = 'emoji-picker';
        emojiPicker.className = 'emoji-picker';
        emojiPicker.innerHTML = `
            <div class="emoji-picker-header">
                <div class="emoji-categories">
                    <button class="emoji-category active" data-category="smileys">😀</button>
                    <button class="emoji-category" data-category="people">👥</button>
                    <button class="emoji-category" data-category="animals">🐾</button>
                    <button class="emoji-category" data-category="food">🍔</button>
                    <button class="emoji-category" data-category="activities">⚽</button>
                    <button class="emoji-category" data-category="travel">🚗</button>
                    <button class="emoji-category" data-category="objects">💡</button>
                    <button class="emoji-category" data-category="symbols">❤️</button>
                    <button class="emoji-category" data-category="flags">🏳️</button>
                </div>
                <button class="emoji-picker-close"><i class="fas fa-times"></i></button>
            </div>
            <div class="emoji-picker-body">
                <div class="emoji-grid">
                    <!-- Emojis will be loaded here -->
                </div>
            </div>
        `;

        document.body.appendChild(emojiPicker);

        // Initialize close button
        const closeBtn = emojiPicker.querySelector('.emoji-picker-close');
        closeBtn.addEventListener('click', () => {
            emojiPicker.style.display = 'none';
        });

        // Initialize category buttons
        const categoryButtons = emojiPicker.querySelectorAll('.emoji-category');
        categoryButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Update active state
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                // Load emojis for this category
                const category = button.getAttribute('data-category');
                loadEmojis(category);
            });
        });

        // Load default emojis
        loadEmojis('smileys');

        // Position emoji picker below emoji button
        const emojiBtn = document.getElementById('emoji-btn');
        const rect = emojiBtn.getBoundingClientRect();

        emojiPicker.style.position = 'absolute';
        emojiPicker.style.bottom = `${window.innerHeight - rect.top + 10}px`;
        emojiPicker.style.left = `${rect.left}px`;
        emojiPicker.style.display = 'block';

        // Adjust position if picker goes off screen
        const pickerRect = emojiPicker.getBoundingClientRect();

        if (pickerRect.right > window.innerWidth) {
            emojiPicker.style.left = `${window.innerWidth - pickerRect.width - 10}px`;
        }

        if (pickerRect.bottom > window.innerHeight) {
            emojiPicker.style.bottom = `${window.innerHeight - rect.bottom + 10}px`;
        }
    } else {
        // Toggle visibility
        emojiPicker.style.display = emojiPicker.style.display === 'block' ? 'none' : 'block';
    }
}

/**
 * Load emojis for a category
 * @param {string} category - The emoji category
 */
function loadEmojis(category) {
    const emojiGrid = document.querySelector('.emoji-grid');

    // Show loading state
    emojiGrid.innerHTML = `
        <div class="loading-indicator">
            <div class="spinner"></div>
        </div>
    `;

    // Load emojis
    fetch(`/api/emojis?category=${category}`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load emojis');
        }
        return response.json();
    })
    .then(emojis => {
        // Update UI
        emojiGrid.innerHTML = '';

        emojis.forEach(emoji => {
            const emojiButton = document.createElement('button');
            emojiButton.className = 'emoji-button';
            emojiButton.textContent = emoji.character;
            emojiButton.title = emoji.name;

            emojiButton.addEventListener('click', () => {
                // Add emoji to input
                const chatInput = document.getElementById('chat-input');
                const start = chatInput.selectionStart;
                const end = chatInput.selectionEnd;
                const text = chatInput.value;

                chatInput.value = text.substring(0, start) + emoji.character + text.substring(end);
                chatInput.selectionStart = chatInput.selectionEnd = start + emoji.character.length;
                chatInput.focus();
            });

            emojiGrid.appendChild(emojiButton);
        });
    })
    .catch(error => {
        console.error('Error loading emojis:', error);
        emojiGrid.innerHTML = '<p>Failed to load emojis</p>';
    });
}

/**
 * Initialize real-time connection
 */
function initRealtimeConnection() {
    // Connect to WebSocket
    const socket = new WebSocket(`wss://${window.location.host}/ws/chat`);

    // Handle connection open
    socket.addEventListener('open', () => {
        console.log('Connected to chat server');

        // Send authentication token
        const token = localStorage.getItem('auth_token');
        if (token) {
            socket.send(JSON.stringify({
                type: 'auth',
                token
            }));
        }
    });

    // Handle connection error
    socket.addEventListener('error', (error) => {
        console.error('WebSocket error:', error);
        showNotification('Connection error. Trying to reconnect...', 'error');

        // Try to reconnect after 3 seconds
        setTimeout(initRealtimeConnection, 3000);
    });

    // Handle connection close
    socket.addEventListener('close', () => {
        console.log('Disconnected from chat server');
        showNotification('Disconnected. Trying to reconnect...', 'warning');

        // Try to reconnect after 3 seconds
        setTimeout(initRealtimeConnection, 3000);
    });

    // Handle messages
    socket.addEventListener('message', (event) => {
        try {
            const data = JSON.parse(event.data);

            switch (data.type) {
                case 'new_message':
                    handleNewMessage(data.message);
                    break;

                case 'typing':
                    handleTypingIndicator(data);
                    break;

                case 'stop_typing':
                    handleStopTypingIndicator(data);
                    break;

                case 'user_online':
                    handleUserOnline(data.user);
                    break;

                case 'user_offline':
                    handleUserOffline(data.user);
                    break;

                case 'room_updated':
                    handleRoomUpdate(data.room);
                    break;

                case 'connection_request':
                    handleConnectionRequest(data.request);
                    break;
            }
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
        }
    });

    // Store socket reference for later use
    window.chatSocket = socket;
}

/**
 * Handle new message
 * @param {Object} message - The message object
 */
function handleNewMessage(message) {
    // Check if message is for current room or user
    const activeRoom = document.querySelector('.chat-room-item.active');
    const activeUser = document.querySelector('.chat-user-item.active');

    const isInCurrentRoom = activeRoom && 
        activeRoom.getAttribute('data-room-id') === message.roomId;

    const isInCurrentDM = activeUser && 
        activeUser.getAttribute('data-user-id') === message.senderId;

    if (isInCurrentRoom || isInCurrentDM) {
        // Add message to UI
        addMessageToUI(message, false);

        // Play notification sound if message is not from current user
        if (message.senderId !== getCurrentUserId()) {
            playNotificationSound();
        }
    } else {
        // Update unread count in sidebar
        if (message.roomId) {
            updateRoomUnreadCount(message.roomId, 1);
        } else {
            updateDirectMessageUnreadCount(message.senderId, 1);
        }

        // Show browser notification
        showBrowserNotification(message);

        // Play notification sound
        playNotificationSound();
    }
}

/**
 * Handle typing indicator
 * @param {Object} data - The typing data
 */
function handleTypingIndicator(data) {
    // Check if typing is for current room
    const activeRoom = document.querySelector('.chat-room-item.active');

    if (!activeRoom || activeRoom.getAttribute('data-room-id') !== data.roomId) {
        return;
    }

    // Don't show typing indicator for current user
    if (data.userId === getCurrentUserId()) {
        return;
    }

    // Show typing indicator
    showTypingIndicatorForUser(data.userName);
}

/**
 * Handle stop typing indicator
 * @param {Object} data - The typing data
 */
function handleStopTypingIndicator(data) {
    // Check if stop typing is for current room
    const activeRoom = document.querySelector('.chat-room-item.active');

    if (!activeRoom || activeRoom.getAttribute('data-room-id') !== data.roomId) {
        return;
    }

    // Hide typing indicator for user
    hideTypingIndicatorForUser(data.userName);
}

/**
 * Show typing indicator for user
 * @param {string} userName - The user name
 */
function showTypingIndicatorForUser(userName) {
    // Check if typing indicator already exists
    let typingIndicator = document.querySelector(`.typing-indicator[data-user="${userName}"]`);

    if (!typingIndicator) {
        // Create typing indicator
        typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        typingIndicator.setAttribute('data-user', userName);
        typingIndicator.innerHTML = `
            <span>${userName} is typing</span>
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;

        // Add to messages container
        const messagesContainer = document.querySelector('.chat-messages-container');
        messagesContainer.appendChild(typingIndicator);

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

/**
 * Hide typing indicator for user
 * @param {string} userName - The user name
 */
function hideTypingIndicatorForUser(userName) {
    // Find and remove typing indicator
    const typingIndicator = document.querySelector(`.typing-indicator[data-user="${userName}"]`);

    if (typingIndicator) {
        typingIndicator.remove();
    }
}

/**
 * Handle user online
 * @param {Object} user - The user object
 */
function handleUserOnline(user) {
    // Update user status in direct messages list
    const userItem = document.querySelector(`.chat-user-item[data-user-id="${user.id}"]`);

    if (userItem) {
        const statusIndicator = userItem.querySelector('.user-status');
        statusIndicator.className = `user-status online`;
    }

    // Update user status in participants modal if open
    const participantItem = document.querySelector(`.participant-item[data-user-id="${user.id}"]`);

    if (participantItem) {
        const statusIndicator = participantItem.querySelector('.participant-status');
        statusIndicator.className = `participant-status online`;
    }
}

/**
 * Handle user offline
 * @param {Object} user - The user object
 */
function handleUserOffline(user) {
    // Update user status in direct messages list
    const userItem = document.querySelector(`.chat-user-item[data-user-id="${user.id}"]`);

    if (userItem) {
        const statusIndicator = userItem.querySelector('.user-status');
        statusIndicator.className = `user-status offline`;
    }

    // Update user status in participants modal if open
    const participantItem = document.querySelector(`.participant-item[data-user-id="${user.id}"]`);

    if (participantItem) {
        const statusIndicator = participantItem.querySelector('.participant-status');
        statusIndicator.className = `participant-status offline`;
    }
}

/**
 * Handle room update
 * @param {Object} room - The room object
 */
function handleRoomUpdate(room) {
    // Update room in sidebar
    const roomItem = document.querySelector(`.chat-room-item[data-room-id="${room.id}"]`);

    if (roomItem) {
        const roomName = roomItem.querySelector('.room-name');
        roomName.textContent = room.name;
    }

    // Update room name in header if this is the current room
    const activeRoom = document.querySelector('.chat-room-item.active');

    if (activeRoom && activeRoom.getAttribute('data-room-id') === room.id) {
        const roomNameInHeader = document.querySelector('.room-details h3');
        roomNameInHeader.textContent = room.name;
    }
}

/**
 * Handle connection request
 * @param {Object} request - The connection request object
 */
function handleConnectionRequest(request) {
    // Add to requests list
    const requestsList = document.getElementById('requests-list');

    // Check if request already exists
    const existingRequest = requestsList.querySelector(`[data-user-id="${request.id}"]`);

    if (existingRequest) {
        return;
    }

    // Create request item
    const requestItem = document.createElement('div');
    requestItem.className = 'chat-request-item';
    requestItem.setAttribute('data-user-id', request.id);
    requestItem.innerHTML = `
        <img src="${request.avatar || '/src/assets/images/default-avatar.png'}" alt="${request.name}" class="user-avatar">
        <div class="request-info">
            <div class="request-name">${request.name}</div>
            <div class="request-message">Wants to connect with you</div>
        </div>
        <div class="request-actions">
            <button class="accept-btn"><i class="fas fa-check"></i></button>
            <button class="decline-btn"><i class="fas fa-times"></i></button>
        </div>
    `;

    // Add event listeners
    const acceptBtn = requestItem.querySelector('.accept-btn');
    const declineBtn = requestItem.querySelector('.decline-btn');

    acceptBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        acceptConnectionRequest(request.id, requestItem);
    });

    declineBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        declineConnectionRequest(request.id, requestItem);
    });

    // Add to list
    requestsList.appendChild(requestItem);

    // Show notification
    showNotification(`${request.name} wants to connect with you`, 'info');

    // Play notification sound
    playNotificationSound();

    // Show browser notification
    showBrowserNotification({
        title: 'New Connection Request',
        body: `${request.name} wants to connect with you`,
        icon: request.avatar
    });

    // Update requests count in tab
    updateRequestsCount(1);
}

/**
 * Update room unread count
 * @param {string} roomId - The room ID
 * @param {number} count - The count to add
 */
function updateRoomUnreadCount(roomId, count) {
    const roomItem = document.querySelector(`.chat-room-item[data-room-id="${roomId}"]`);

    if (roomItem) {
        const unreadCount = roomItem.querySelector('.unread-count');

        if (unreadCount) {
            const currentCount = parseInt(unreadCount.textContent) || 0;
            const newCount = currentCount + count;

            if (newCount > 0) {
                unreadCount.textContent = newCount;
                unreadCount.style.display = 'flex';
            } else {
                unreadCount.style.display = 'none';
            }
        } else if (count > 0) {
            // Create unread count element
            const unreadElement = document.createElement('span');
            unreadElement.className = 'unread-count';
            unreadElement.textContent = count;
            unreadElement.style.display = 'flex';

            // Add to room meta
            const roomMeta = roomItem.querySelector('.room-meta');
            roomMeta.appendChild(unreadElement);
        }
    }
}

/**
 * Update direct message unread count
 * @param {string} userId - The user ID
 * @param {number} count - The count to add
 */
function updateDirectMessageUnreadCount(userId, count) {
    const userItem = document.querySelector(`.chat-user-item[data-user-id="${userId}"]`);

    if (userItem) {
        const unreadCount = userItem.querySelector('.unread-count');

        if (unreadCount) {
            const currentCount = parseInt(unreadCount.textContent) || 0;
            const newCount = currentCount + count;

            if (newCount > 0) {
                unreadCount.textContent = newCount;
                unreadCount.style.display = 'flex';
            } else {
                unreadCount.style.display = 'none';
            }
        } else if (count > 0) {
            // Create unread count element
            const unreadElement = document.createElement('span');
            unreadElement.className = 'unread-count';
            unreadElement.textContent = count;
            unreadElement.style.display = 'flex';

            // Add to user meta
            const userMeta = userItem.querySelector('.user-meta');
            userMeta.appendChild(unreadElement);
        }
    }
}

/**
 * Update requests count
 * @param {number} count - The count to add
 */
function updateRequestsCount(count) {
    const requestsTab = document.querySelector('[data-tab="requests"]');

    if (requestsTab) {
        // Get current count
        const badge = requestsTab.querySelector('.tab-badge');
        const currentCount = badge ? parseInt(badge.textContent) || 0 : 0;
        const newCount = currentCount + count;

        if (badge) {
            // Update existing badge
            badge.textContent = newCount;

            if (newCount > 0) {
                badge.style.display = 'inline-block';
            } else {
                badge.style.display = 'none';
            }
        } else if (count > 0) {
            // Create badge
            const badgeElement = document.createElement('span');
            badgeElement.className = 'tab-badge';
            badgeElement.textContent = newCount;
            badgeElement.style.display = 'inline-block';

            requestsTab.appendChild(badgeElement);
        }
    }
}

/**
 * Show browser notification
 * @param {Object} message - The message object or notification data
 */
function showBrowserNotification(message) {
    // Check if browser notifications are supported
    if (!('Notification' in window)) {
        return;
    }

    // Request permission if not granted
    if (Notification.permission === 'default') {
        Notification.requestPermission();
        return;
    }

    // Check if permission is granted
    if (Notification.permission !== 'granted') {
        return;
    }

    // Create notification
    const notification = new Notification(
        message.title || 'New Message',
        {
            body: message.body || message.text,
            icon: message.icon || '/src/assets/images/favicon.png',
            tag: 'fuelq-chat'
        }
    );

    // Auto-close after 5 seconds
    setTimeout(() => {
        notification.close();
    }, 5000);

    // Focus window when notification is clicked
    notification.addEventListener('click', () => {
        window.focus();
        notification.close();
    });
}

/**
 * Play notification sound
 */
function playNotificationSound() {
    // Create audio element if it doesn't exist
    let notificationSound = document.getElementById('notification-sound');

    if (!notificationSound) {
        notificationSound = document.createElement('audio');
        notificationSound.id = 'notification-sound';
        notificationSound.src = '/src/assets/sounds/notification.mp3';
        notificationSound.volume = 0.5;
        document.body.appendChild(notificationSound);
    }

    // Play sound
    notificationSound.play().catch(error => {
        console.error('Error playing notification sound:', error);
    });
}

/**
 * Get current user ID
 * @returns {string} The current user ID
 */
function getCurrentUserId() {
    // Get user ID from local storage or cookie
    return localStorage.getItem('user_id') || getCookie('user_id');
}

/**
 * Get cookie value
 * @param {string} name - The cookie name
 * @returns {string} The cookie value
 */
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    }

    return null;
}

/**
 * Initialize chat search
 */
function initChatSearch() {
    const searchInput = document.getElementById('chat-search');
    const searchBtn = document.querySelector('.search-btn');

    if (searchInput && searchBtn) {
        // Search on button click
        searchBtn.addEventListener('click', performSearch);

        // Search on Enter
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
}

/**
 * Perform chat search
 */
function performSearch() {
    const searchTerm = document.getElementById('chat-search').value.trim();

    if (!searchTerm) {
        // Reset to normal view
        document.querySelectorAll('.chat-room-item, .chat-user-item').forEach(item => {
            item.style.display = 'flex';
        });
        return;
    }

    // Convert to lowercase for case-insensitive search
    const lowerSearchTerm = searchTerm.toLowerCase();

    // Filter rooms
    document.querySelectorAll('.chat-room-item').forEach(item => {
        const roomName = item.querySelector('.room-name').textContent.toLowerCase();
        const roomMessage = item.querySelector('.room-message').textContent.toLowerCase();

        if (roomName.includes(lowerSearchTerm) || roomMessage.includes(lowerSearchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });

    // Filter users
    document.querySelectorAll('.chat-user-item').forEach(item => {
        const userName = item.querySelector('.user-name').textContent.toLowerCase();
        const userMessage = item.querySelector('.user-message').textContent.toLowerCase();

        if (userName.includes(lowerSearchTerm) || userMessage.includes(lowerSearchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

/**
 * Initialize create room functionality
 */
function initCreateRoom() {
    const createRoomBtn = document.getElementById('create-room');

    if (createRoomBtn) {
        createRoomBtn.addEventListener('click', showCreateRoomModal);
    }
}

/**
 * Show create room modal
 */
function showCreateRoomModal() {
    // Create modal if it doesn't exist
    let modal = document.getElementById('create-room-modal');

    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'create-room-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Create New Room</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="settings-form">
                        <div class="form-group">
                            <label for="new-room-name">Room Name</label>
                            <input type="text" id="new-room-name" placeholder="Enter room name" required>
                        </div>
                        <div class="form-group">
                            <label for="new-room-description">Description</label>
                            <textarea id="new-room-description" placeholder="Enter room description"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="new-room-category">Category</label>
                            <select id="new-room-category">
                                <option value="general">General</option>
                                <option value="hydrogen">Hydrogen</option>
                                <option value="biofuels">Biofuels</option>
                                <option value="solar">Solar</option>
                                <option value="wind">Wind</option>
                                <option value="nuclear">Nuclear</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="switch">
                                <input type="checkbox" id="new-room-private">
                                <span class="slider"></span>
                            </label>
                            <div class="setting-info">
                                <div class="setting-title">Private Room</div>
                                <div class="setting-desc">Only invited users can join</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary cancel-btn">Cancel</button>
                    <button class="btn-primary create-btn">Create Room</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Initialize close button
        const closeBtn = modal.querySelector('.close');
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        // Initialize cancel button
        const cancelBtn = modal.querySelector('.cancel-btn');
        cancelBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        // Initialize create button
        const createBtn = modal.querySelector('.create-btn');
        createBtn.addEventListener('click', createRoom);

        // Initialize backdrop click
        const backdrop = modal.querySelector('.modal-backdrop');
        backdrop.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    // Show modal
    modal.style.display = 'flex';

    // Reset form
    document.getElementById('new-room-name').value = '';
    document.getElementById('new-room-description').value = '';
    document.getElementById('new-room-category').value = 'general';
    document.getElementById('new-room-private').checked = false;

    // Focus name input
    document.getElementById('new-room-name').focus();
}

/**
 * Create room
 */
function createRoom() {
    // Get form values
    const name = document.getElementById('new-room-name').value.trim();
    const description = document.getElementById('new-room-description').value.trim();
    const category = document.getElementById('new-room-category').value;
    const isPrivate = document.getElementById('new-room-private').checked;

    // Validate inputs
    if (!name) {
        showNotification('Room name is required', 'error');
        return;
    }

    // Show loading state
    const createBtn = document.querySelector('.create-btn');
    const originalText = createBtn.innerHTML;
    createBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
    createBtn.disabled = true;

    // Send to server
    fetch('/api/chat/rooms', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name,
            description,
            category,
            isPrivate
        }),
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to create room');
        }
        return response.json();
    })
    .then(data => {
        // Close modal
        document.getElementById('create-room-modal').style.display = 'none';

        // Add room to sidebar
        const roomsList = document.getElementById('rooms-list');

        const roomItem = document.createElement('div');
        roomItem.className = 'chat-room-item';
        roomItem.setAttribute('data-room-id', data.id);
        roomItem.innerHTML = `
            <div class="room-avatar" style="background-color: ${getCategoryColor(category)};">
                <i class="fas fa-${getCategoryIcon(category)}"></i>
            </div>
            <div class="room-info">
                <div class="room-name">${name}</div>
                <div class="room-message">Room created</div>
            </div>
            <div class="room-meta">
                <span class="message-time">Just now</span>
            </div>
        `;

        // Add click event
        roomItem.addEventListener('click', () => {
            // Update active state
            document.querySelectorAll('.chat-room-item').forEach(i => i.classList.remove('active'));
            roomItem.classList.add('active');

            // Load room messages
            loadRoomMessages(data.id);
        });

        // Add to list
        roomsList.insertBefore(roomItem, roomsList.firstChild);

        // Select the new room
        roomItem.click();

        // Show notification
        showNotification('Room created successfully', 'success');
    })
    .catch(error => {
        console.error('Error creating room:', error);
        showNotification('Failed to create room', 'error');
    })
    .finally(() => {
        // Reset button state
        createBtn.innerHTML = originalText;
        createBtn.disabled = false;
    });
}

/**
 * Get category color
 * @param {string} category - The category name
 * @returns {string} The category color
 */
function getCategoryColor(category) {
    const colors = {
        general: 'var(--primary-color)',
        hydrogen: '#9C27B0',
        biofuels: '#4CAF50',
        solar: '#FF9800',
        wind: '#2196F3',
        nuclear: '#F44336'
    };

    return colors[category] || colors.general;
}

/**
 * Get category icon
 * @param {string} category - The category name
 * @returns {string} The category icon
 */
function getCategoryIcon(category) {
    const icons = {
        general: 'users',
        hydrogen: 'atom',
        biofuels: 'leaf',
        solar: 'sun',
        wind: 'wind',
        nuclear: 'radiation'
    };

    return icons[category] || icons.general;
}

/**
 * Load room messages
 * @param {string} roomId - The room ID
 */
function loadRoomMessages(roomId) {
    // Show loading state
    const messagesContainer = document.querySelector('.chat-messages-container');
    messagesContainer.innerHTML = `
        <div class="loading-indicator">
            <div class="spinner"></div>
            <p>Loading messages...</p>
        </div>
    `;

    // Fetch messages
    fetch(`/api/chat/rooms/${roomId}/messages`, {
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load messages');
        }
        return response.json();
    })
    .then(data => {
        // Update UI
        messagesContainer.innerHTML = '';

        if (data.messages.length === 0) {
            // Show empty state
            messagesContainer.innerHTML = `
                <div class="empty-chat">
                    <div class="empty-icon">
                        <i class="fas fa-comments"></i>
                    </div>
                    <h3>No messages yet</h3>
                    <p>Be the first to say something!</p>
                </div>
            `;
            return;
        }

        // Add messages to UI
        data.messages.forEach(message => {
            const isOwn = message.senderId === getCurrentUserId();

            if (message.file) {
                addFileMessageToUI(message, isOwn);
            } else {
                addMessageToUI(message, isOwn);
            }
        });

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Mark room messages as read
        markRoomMessagesAsRead(roomId);
    })
    .catch(error => {
        console.error('Error loading messages:', error);
        messagesContainer.innerHTML = `
            <div class="error-message">
                <p>Failed to load messages. Please try again.</p>
            </div>
        `;
    });
}

/**
 * Load direct messages
 * @param {string} userId - The user ID
 */
function loadDirectMessages(userId) {
    // Show loading state
    const messagesContainer = document.querySelector('.chat-messages-container');
    messagesContainer.innerHTML = `
        <div class="loading-indicator">
            <div class="spinner"></div>
            <p>Loading messages...</p>
        </div>
    `;

    // Fetch messages
    fetch(`/api/chat/direct/${userId}/messages`, {
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load messages');
        }
        return response.json();
    })
    .then(data => {
        // Update UI
        messagesContainer.innerHTML = '';

        if (data.messages.length === 0) {
            // Show empty state
            messagesContainer.innerHTML = `
                <div class="empty-chat">
                    <div class="empty-icon">
                        <i class="fas fa-comments"></i>
                    </div>
                    <h3>No messages yet</h3>
                    <p>Start the conversation!</p>
                </div>
            `;
            return;
        }

        // Add messages to UI
        data.messages.forEach(message => {
            const isOwn = message.senderId === getCurrentUserId();

            if (message.file) {
                addFileMessageToUI(message, isOwn);
            } else {
                addMessageToUI(message, isOwn);
            }
        });

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Mark direct messages as read
        markDirectMessagesAsRead(userId);
    })
    .catch(error => {
        console.error('Error loading messages:', error);
        messagesContainer.innerHTML = `
            <div class="error-message">
                <p>Failed to load messages. Please try again.</p>
            </div>
        `;
    });
}

/**
 * Mark room messages as read
 * @param {string} roomId - The room ID
 */
function markRoomMessagesAsRead(roomId) {
    fetch(`/api/chat/rooms/${roomId}/read`, {
        method: 'POST',
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to mark messages as read');
        }
        return response.json();
    })
    .then(data => {
        // Update unread count in sidebar
        updateRoomUnreadCount(roomId, -Infinity);
    })
    .catch(error => {
        console.error('Error marking messages as read:', error);
    });
}

/**
 * Mark direct messages as read
 * @param {string} userId - The user ID
 */
function markDirectMessagesAsRead(userId) {
    fetch(`/api/chat/direct/${userId}/read`, {
        method: 'POST',
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to mark messages as read');
        }
        return response.json();
    })
    .then(data => {
        // Update unread count in sidebar
        updateDirectMessageUnreadCount(userId, -Infinity);
    })
    .catch(error => {
        console.error('Error marking messages as read:', error);
    });
}
