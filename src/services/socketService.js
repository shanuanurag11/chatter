import { io } from 'socket.io-client';
import { Platform } from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.isAuthenticated = false;
    this.messageListeners = [];
    this.typingListeners = [];
    this.statusListeners = [];
    this.notificationListeners = [];
    this.errorListeners = [];
    this.userId = null;
    this.authPromise = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  // Initialize socket connection
  async initialize(userId) {
    if (!userId) {
      throw new Error('User ID is required for socket initialization');
    }

    try {
      console.log('Initializing socket with userId:', userId);
      this.userId = userId;

      // Initialize socket with basic configuration
      this.socket = io('ws://69.62.85.193:8001', {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        randomizationFactor: 0.5,
        timeout: 10000,
        autoConnect: false
      });

      // Set up event listeners
      this.setupEventListeners();
      
      // Return a promise that resolves when both connection and authentication are complete
      return await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Socket connection timeout'));
        }, 10000);

        this.socket.once('connect', () => {
          clearTimeout(timeout);
          console.log('Socket connected successfully, socket id:', this.socket.id);
          this.isConnected = true;
          this.reconnectAttempts = 0;
          
          // Create auth promise
          this.authPromise = new Promise((authResolve, authReject) => {
            const authTimeout = setTimeout(() => {
              authReject(new Error('Authentication timeout'));
            }, 5000);

            this.socket.once('user_connected', (data) => {
              clearTimeout(authTimeout);
              console.log('User authenticated successfully:', data);
              this.isAuthenticated = true;
              authResolve(true);
            });

            this.socket.once('user_connection_error', (error) => {
              clearTimeout(authTimeout);
              console.error('User authentication failed:', error);
              this.isAuthenticated = false;
              authReject(error);
            });

            // Send authentication request with socket.id
            this.authenticateUser();
          });

          // Wait for authentication
          this.authPromise
            .then(() => {
              resolve(true);
            })
            .catch((error) => {
              console.error('Authentication failed:', error);
              reject(error);
            });
        });

        this.socket.once('connect_error', (error) => {
          clearTimeout(timeout);
          console.error('Socket connection error:', error);
          reject(error);
        });

        // Connect manually after setup
        this.socket.connect();
      });
    } catch (error) {
      console.error('Socket initialization error:', error);
      throw error;
    }
  }

  // Authenticate user with socket server
  authenticateUser() {
    if (!this.socket || !this.userId) {
      console.error('Cannot authenticate: socket or userId missing');
      return;
    }

    console.log('Authenticating user:', this.userId, 'with socket id:', this.socket.id);
    // Send authentication with socket.id
    this.socket.emit('user_data', {
      from_user_id: this.userId,
      socket_id: this.socket.id
    });
  }

  // Set up all socket event listeners
  setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;
      this.isAuthenticated = false;
      
      if (reason === 'io server disconnect') {
        this.socket.connect();
      }
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('Reconnection attempt:', attemptNumber);
      this.reconnectAttempts = attemptNumber;
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Reconnected after', attemptNumber, 'attempts');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.authenticateUser();
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('Reconnection error:', error);
      this.notifyErrorListeners(error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('Failed to reconnect after', this.maxReconnectAttempts, 'attempts');
      this.notifyErrorListeners(new Error('Reconnection failed'));
    });

    // Authentication response
    this.socket.on('user_connected', (data) => {
      console.log('User authenticated:', data);
      this.isAuthenticated = true;
    });

    this.socket.on('user_connection_error', (error) => {
      console.error('User authentication error:', error);
      this.isAuthenticated = false;
      this.notifyErrorListeners(error);
    });

    // Message events
    this.socket.on('message_sent', (data) => {
      console.log('Message sent event received:', data);
      this.notifyMessageListeners('message_sent', data);
    });

    this.socket.on('message_received', (data) => {
      console.log('Message received event received:', data);
      this.notifyMessageListeners('message_received', data);
    });

    this.socket.on('message_read_receipt', (data) => {
      console.log('Message read receipt event received:', data);
      this.notifyMessageListeners('message_read', data);
    });

    // Typing events
    this.socket.on('typingResponse', (data) => {
      console.log('Typing response event received:', data);
      this.notifyTypingListeners(data);
    });

    // Room events
    this.socket.on('room_joined', (data) => {
      console.log('Room joined event received:', data);
      this.notifyRoomListeners('room_joined', data);
    });

    this.socket.on('room_left', (data) => {
      console.log('Room left event received:', data);
      this.notifyRoomListeners('room_left', data);
    });

    // User status events
    this.socket.on('online_users_list', (data) => {
      console.log('Online users list event received:', data);
      this.notifyStatusListeners('online_users', data);
    });

    this.socket.on('user_status_update', (data) => {
      console.log('User status update event received:', data);
      this.notifyStatusListeners('status_update', data);
    });

    // Notification events
    this.socket.on('notification', (data) => {
      console.log('Notification event received:', data);
      this.notifyNotificationListeners(data);
    });

    // Error events
    this.socket.on('error', (error) => {
      console.error('Socket error event received:', error);
      this.notifyErrorListeners(error);
    });
  }

  // Send message with acknowledgment
  sendMessage(conversationId, toUserId, message, messageType = 'text') {
    if (!this.socket || !this.isConnected || !this.isAuthenticated) {
      console.error('Cannot send message: socket not ready');
      return Promise.reject(new Error('Socket not ready'));
    }

    console.log('Sending message:', {
      from_user_id: this.userId,
      to_user_id: toUserId,
      conversation_id: conversationId,
      message,
      messageType
    });

    const messageData = {
      from_user_id: this.userId,
      to_user_id: toUserId,
      room_id: conversationId,
      message: message,
      message_type: messageType
    };

    return new Promise((resolve, reject) => {
      this.socket.emit('message', messageData, (response) => {
        if (response.error) {
          console.error('Message send error:', response.error);
          reject(new Error(response.error));
        } else {
          console.log('Message send response:', response);
          // Emit message_sent event locally to ensure UI updates
          this.notifyMessageListeners('message_sent', {
            ...messageData,
            messageId: response?.messageId || `msg_${Date.now()}`,
            timestamp: new Date().toISOString()
          });
          resolve(response);
        }
      });
    });
  }

  // Mark messages as read
  markMessagesAsRead(roomId, messageIds) {
    if (!this.socket || !this.isConnected) return false;

    const readData = {
      user_id: this.userId,
      room_id: roomId,
      message_ids: messageIds
    };

    this.socket.emit('message_read', readData);
    return true;
  }

  // Send typing status
  sendTypingStatus(toUserId, isTyping, roomId = null) {
    if (!this.socket || !this.isConnected) return false;

    const typingData = {
      user_id: this.userId,
      to_user_id: toUserId,
      is_type: isTyping,
      room_id: roomId
    };

    this.socket.emit('typing', typingData);
    return true;
  }

  // Join room
  joinRoom(roomId) {
    if (!this.socket || !this.isConnected) return false;

    this.socket.emit('join_room', {
      user_id: this.userId,
      room_id: roomId
    });
    return true;
  }

  // Leave room
  leaveRoom(roomId) {
    if (!this.socket || !this.isConnected) return false;

    this.socket.emit('leave_room', {
      room_id: roomId
    });
    return true;
  }

  // Get online users
  getOnlineUsers() {
    if (!this.socket || !this.isConnected) return false;

    this.socket.emit('get_online_users', {});
    return true;
  }

  // Add event listeners
  addMessageListener(callback) {
    console.log('Adding message listener');
    this.messageListeners.push(callback);
    return () => {
      const index = this.messageListeners.indexOf(callback);
      if (index !== -1) {
        console.log('Removing message listener');
        this.messageListeners.splice(index, 1);
      }
    };
  }

  addTypingListener(callback) {
    this.typingListeners.push(callback);
    return () => {
      const index = this.typingListeners.indexOf(callback);
      if (index !== -1) {
        this.typingListeners.splice(index, 1);
      }
    };
  }

  addStatusListener(callback) {
    this.statusListeners.push(callback);
    return () => {
      const index = this.statusListeners.indexOf(callback);
      if (index !== -1) {
        this.statusListeners.splice(index, 1);
      }
    };
  }

  addNotificationListener(callback) {
    this.notificationListeners.push(callback);
    return () => {
      const index = this.notificationListeners.indexOf(callback);
      if (index !== -1) {
        this.notificationListeners.splice(index, 1);
      }
    };
  }

  addErrorListener(callback) {
    this.errorListeners.push(callback);
    return () => {
      const index = this.errorListeners.indexOf(callback);
      if (index !== -1) {
        this.errorListeners.splice(index, 1);
      }
    };
  }

  // Notify listeners
  notifyMessageListeners(event, data) {
    console.log('Notifying message listeners:', event, data);
    this.messageListeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (error) {
        console.error('Error in message listener:', error);
      }
    });
  }

  notifyTypingListeners(data) {
    this.typingListeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('Error in typing listener:', error);
      }
    });
  }

  notifyStatusListeners(event, data) {
    this.statusListeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (error) {
        console.error('Error in status listener:', error);
      }
    });
  }

  notifyNotificationListeners(data) {
    this.notificationListeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('Error in notification listener:', error);
      }
    });
  }

  notifyErrorListeners(error) {
    this.errorListeners.forEach(listener => {
      try {
        listener(error);
      } catch (err) {
        console.error('Error in error listener:', err);
      }
    });
  }

  // Disconnect socket with cleanup
  disconnect() {
    if (this.socket) {
      // Remove all listeners
      this.socket.removeAllListeners();
      
      // Disconnect socket
      this.socket.disconnect();
      
      // Reset state
      this.socket = null;
      this.isConnected = false;
      this.isAuthenticated = false;
      this.messageListeners = [];
      this.typingListeners = [];
      this.statusListeners = [];
      this.notificationListeners = [];
      this.errorListeners = [];
      this.userId = null;
      this.authPromise = null;
      this.reconnectAttempts = 0;
    }
  }
}

export default new SocketService(); 