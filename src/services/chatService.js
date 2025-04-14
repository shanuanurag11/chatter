import { Platform } from 'react-native';

// Dummy data for testing
import { DUMMY_MESSAGES, DUMMY_CHATS } from '../data/dummyChats';

// Configuration
const API_BASE_URL = 'https://api.example.com';
const SOCKET_URL = 'wss://api.example.com/ws/chat';

// Mock API for chat functionality
import { getRandomInt } from '../utils/helpers';

// In-memory data for demo purposes
const DUMMY_CHAT_THREADS = [
  {
    id: 'user1',
    name: 'Sarah Johnson',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    lastMessage: {
      text: "Yes, I\'m free tomorrow afternoon. Let's meet at 2pm.",
      timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
    },
    unread: 2,
    isOnline: true,
    hasVideo: true,
  },
  {
    id: 'user2',
    name: 'Mike Peterson',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    lastMessage: {
      text: 'I\'ll send you the project files later today.',
      timestamp: new Date(Date.now() - 3 * 3600000).toISOString(),
    },
    unread: 0,
    isOnline: true,
    hasVideo: false,
  },
  {
    id: 'user3',
    name: 'Jessica Williams',
    avatar: 'https://randomuser.me/api/portraits/women/55.jpg',
    lastMessage: {
      text: 'Did you check the latest designs?',
      timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    unread: 4,
    isOnline: false,
    hasVideo: true,
  },
  {
    id: 'user4',
    name: 'David Chen',
    avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
    lastMessage: {
      text: 'Looking forward to the conference next week!',
      timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    unread: 0,
    isOnline: false,
    hasVideo: true,
  },
  {
    id: 'user5',
    name: 'Emily Rodriguez',
    avatar: 'https://randomuser.me/api/portraits/women/28.jpg',
    lastMessage: {
      text: 'Thanks for helping with that task.',
      timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    unread: 1,
    isOnline: true,
    hasVideo: false,
  },
];

// Mock message history for each chat
const MESSAGE_HISTORY = {
  user1: generateMessages('user1', 15),
  user2: generateMessages('user2', 8),
  user3: generateMessages('user3', 20),
  user4: generateMessages('user4', 5),
  user5: generateMessages('user5', 12),
};

// Generate random messages for demo
function generateMessages(userId, count) {
  const messages = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 5);
  
  for (let i = 0; i < count; i++) {
    const isUser = Math.random() > 0.5;
    const hoursAgo = count - i + Math.random() * 2;
    const timestamp = new Date(startDate.getTime() + (i * 3600000));
    
    messages.push({
      id: `msg_${userId}_${i}`,
      content: getRandomMessage(isUser),
      senderId: isUser ? 'me' : userId,
      timestamp: timestamp.toISOString(),
      status: getRandomStatus(),
    });
  }
  
  return messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

// Random message content for demo
function getRandomMessage(isUser) {
  const userMessages = [
    "Hey, how are you?",
    "Can we meet tomorrow to discuss the project?",
    "I've finished the task you assigned me.",
    "What do you think about the new design?",
    "Are you free this weekend?",
    "I'll send you the files in a moment.",
    "Let me know when you're available for a call."
  ];
  
  const otherMessages = [
    "I\'m doing well, thanks for asking!",
    "Yes, I\'m available tomorrow. What time works for you?",
    "Great job on completing that task!",
    "The new design looks fantastic.",
    "I\'m free on Saturday, but busy on Sunday.",
    "Thanks, I'll review them as soon as possible.",
    "I can talk now if you're free."
  ];
  
  const messages = isUser ? userMessages : otherMessages;
  return messages[getRandomInt(0, messages.length - 1)];
}

// Random message status
function getRandomStatus() {
  const statuses = ['sent', 'delivered', 'read'];
  return statuses[getRandomInt(0, statuses.length - 1)];
}

// WebSocket message listeners
const messageListeners = [];

class ChatService {
  constructor() {
    this.socket = null;
    this.messageListeners = [];
    this.connectionListeners = [];
    this.isConnected = false;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.deviceId = Platform.OS === 'ios' ? 'ios_device' : 'android_device';
    
    // Clone and normalize the chat threads
    this.chats = DUMMY_CHAT_THREADS.map(chat => ({
      ...chat,
      // Ensure both id and conversationId exist
      id: chat.id || chat.conversationId,
      conversationId: chat.conversationId || chat.id,
      // Normalize other required fields
      name: chat.name || chat.userName,
      avatar: chat.avatar || chat.userAvatar,
    }));
    
    // Initialize MESSAGE_HISTORY from DUMMY_CHATS
    DUMMY_CHATS.forEach(chat => {
      if (!MESSAGE_HISTORY[chat.conversationId]) {
        MESSAGE_HISTORY[chat.conversationId] = chat.messages || [];
      }
    });
    
    // Simulate periodic online status changes
    setInterval(() => {
      this._updateRandomUserStatus();
    }, 30000); // Every 30 seconds
    
    // Simulate incoming messages occasionally
    setInterval(() => {
      this._simulateIncomingMessage();
    }, 60000); // Every minute
  }

  // ---------- Message List Methods ----------

  // Get all message threads (conversations)
  async getMessageThreads() {
    // Simulate API delay
    await this.delay(800);
    return [...this.chats];
  }

  // Mark a conversation as read
  async markConversationAsRead(conversationId) {
    // Simulate API delay
    await this.delay(300);
    
    const chatIndex = this.chats.findIndex(chat => chat.id === conversationId);
    if (chatIndex !== -1) {
      this.chats[chatIndex] = {
        ...this.chats[chatIndex],
        unread: 0,
      };
    }
    
    return true;
  }

  // Mark all conversations as read
  async markAllConversationsAsRead() {
    try {
      // In development, simulate success
      if (__DEV__) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return { success: true };
      }
      
      // In production, call the API
      const response = await fetch(`${API_BASE_URL}/messages/read-all`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark all conversations as read');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error marking all conversations as read:', error);
      throw error;
    }
  }

  // Delete a conversation
  async deleteConversation(conversationId) {
    try {
      // In development, simulate success
      if (__DEV__) {
        await new Promise(resolve => setTimeout(resolve, 300));
        return { success: true };
      }
      
      // In production, call the API
      const response = await fetch(`${API_BASE_URL}/messages/thread/${conversationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete conversation');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  }

  // Get unread message count
  async getUnreadCount() {
    try {
      // In development, calculate from dummy data
      if (__DEV__) {
        await new Promise(resolve => setTimeout(resolve, 300));
        const count = DUMMY_MESSAGES.reduce((total, msg) => total + (msg.unread || 0), 0);
        return { count };
      }
      
      // In production, call the API
      const response = await fetch(`${API_BASE_URL}/messages/unread-count`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to get unread count');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }

  // ---------- Individual Chat Methods ----------

  // Get chat history for a conversation
  async getChatHistory(conversationId) {
    // Simulate API delay
    await this.delay(1000);
    
    console.log(`Fetching chat history for ${conversationId}`);
    
    // Handle case where conversationId is empty/missing
    if (!conversationId) {
      console.error('No conversation ID provided');
      return [];
    }
    
    // Check both direct ID and in DUMMY_CHATS
    if (!MESSAGE_HISTORY[conversationId]) {
      console.log('Conversation not found in MESSAGE_HISTORY, trying to find in DUMMY_CHATS');
      
      // Look for it in DUMMY_CHATS and initialize if found
      const dummyChat = DUMMY_CHATS.find(chat => 
        chat.conversationId === conversationId || chat.userId === conversationId
      );
      
      if (dummyChat && dummyChat.messages) {
        MESSAGE_HISTORY[conversationId] = [...dummyChat.messages];
        console.log(`Found messages in DUMMY_CHATS for ${conversationId}`);
      } else {
        console.error(`Conversation ${conversationId} not found in any data source`);
        return [];
      }
    }
    
    return [...MESSAGE_HISTORY[conversationId]];
  }

  // Send a message
  async sendMessage(conversationId, content) {
    // Simulate API delay
    await this.delay(500);
    
    // Handle missing MESSAGE_HISTORY
    if (!MESSAGE_HISTORY[conversationId]) {
      console.log(`Initializing new message history for ${conversationId}`);
      MESSAGE_HISTORY[conversationId] = [];
    }
    
    const newMessage = {
      id: `msg_${conversationId}_${Date.now()}`,
      content,
      senderId: 'me',
      timestamp: new Date().toISOString(),
      status: 'sent',
    };
    
    // Add to message history
    MESSAGE_HISTORY[conversationId].push(newMessage);
    
    // Update last message in thread list
    const threadIndex = this.chats.findIndex(t => t.id === conversationId);
    if (threadIndex !== -1) {
      this.chats[threadIndex].lastMessage = {
        text: content,
        timestamp: newMessage.timestamp,
      };
      this.chats[threadIndex].unread = 0;
    }
    
    // Simulate message delivery after a delay
    setTimeout(() => {
      newMessage.status = 'delivered';
      this.notifyListeners({
        type: 'status_update',
        data: {
          messageId: newMessage.id,
          status: 'delivered',
        },
      });
      
      // Simulate message read after another delay
      setTimeout(() => {
        newMessage.status = 'read';
        this.notifyListeners({
          type: 'status_update',
          data: {
            messageId: newMessage.id,
            status: 'read',
          },
        });
      }, 2000);
    }, 1000);
    
    return newMessage;
  }

  // ---------- WebSocket Methods ----------

  // Connect to WebSocket
  async connectToWebSocket() {
    if (this.isConnected || this.isConnecting) return;
    
    try {
      this.isConnecting = true;
      
      // In development, simulate connection
      if (__DEV__) {
        await new Promise(resolve => setTimeout(resolve, 500));
        this.isConnected = true;
        this.isConnecting = false;
        this.notifyConnectionListeners(true);
        
        // Simulate receiving messages
        this.startMockMessageSimulation();
        
        return;
      }
      
      // Create WebSocket connection
      const authToken = await this.getAuthToken();
      this.socket = new WebSocket(`${SOCKET_URL}?token=${authToken}&device=${this.deviceId}`);
      
      // Set up event listeners
      this.socket.onopen = this.handleSocketOpen.bind(this);
      this.socket.onmessage = this.handleSocketMessage.bind(this);
      this.socket.onclose = this.handleSocketClose.bind(this);
      this.socket.onerror = this.handleSocketError.bind(this);
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      this.isConnecting = false;
      this.notifyConnectionListeners(false);
    }
  }
  
  // Disconnect from WebSocket
  disconnectWebSocket() {
    if (!this.isConnected && !this.socket) return;
    
    try {
      if (__DEV__) {
        this.isConnected = false;
        this.notifyConnectionListeners(false);
        
        // Stop mock simulation
        this.stopMockMessageSimulation();
        
        return;
      }
      
      this.socket.close();
      this.socket = null;
      this.isConnected = false;
      this.notifyConnectionListeners(false);
    } catch (error) {
      console.error('Error disconnecting WebSocket:', error);
    }
  }
  
  // WebSocket event handlers
  handleSocketOpen() {
    this.isConnected = true;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.notifyConnectionListeners(true);
    
    console.log('WebSocket connection established');
  }
  
  handleSocketMessage(event) {
    try {
      const data = JSON.parse(event.data);
      
      // Notify all message listeners
      this.notifyMessageListeners(data);
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  }
  
  handleSocketClose(event) {
    this.isConnected = false;
    this.isConnecting = false;
    this.notifyConnectionListeners(false);
    
    console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
    
    // Attempt to reconnect if not closed cleanly
    if (event.code !== 1000) {
      this.attemptReconnect();
    }
  }
  
  handleSocketError(error) {
    console.error('WebSocket error:', error);
    this.isConnected = false;
    this.isConnecting = false;
    this.notifyConnectionListeners(false);
    
    // Attempt to reconnect
    this.attemptReconnect();
  }
  
  // Try to reconnect to WebSocket
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnect attempts reached');
      return;
    }
    
    this.reconnectAttempts++;
    
    const delay = Math.min(1000 * (2 ** this.reconnectAttempts), 30000);
    
    console.log(`Attempting to reconnect in ${delay / 1000} seconds`);
    
    setTimeout(() => {
      this.connectToWebSocket();
    }, delay);
  }
  
  // ---------- Mock Methods for Development ----------
  
  // Simulate receiving messages
  startMockMessageSimulation() {
    // Clear any existing interval
    this.stopMockMessageSimulation();
    
    // Set up interval to simulate incoming messages
    this.mockInterval = setInterval(() => {
      // 5% chance of receiving a mock message
      if (Math.random() < 0.05) {
        const mockMessage = this.generateMockMessage();
        this.notifyMessageListeners(mockMessage);
      }
    }, 5000);
  }
  
  stopMockMessageSimulation() {
    if (this.mockInterval) {
      clearInterval(this.mockInterval);
      this.mockInterval = null;
    }
  }
  
  generateMockMessage() {
    // Get random conversation
    const conversations = DUMMY_MESSAGES.filter(msg => msg.type === 'chat');
    const conversation = conversations[Math.floor(Math.random() * conversations.length)];
    
    return {
      type: 'message',
      data: {
        id: `msg_${Math.random().toString(36).substr(2, 9)}`,
        conversationId: conversation.id,
        senderId: conversation.id,
        content: `This is a mock message from ${conversation.name} at ${new Date().toLocaleTimeString()}`,
        timestamp: new Date().toISOString(),
        status: 'received'
      }
    };
  }
  
  // ---------- Listener Methods ----------
  
  // Add listener for incoming messages
  addMessageListener(callback) {
    messageListeners.push(callback);
    
    // Simulate occasional new messages and typing indicators
    const intervalId = setInterval(() => {
      // Randomly decide whether to send a message or typing indicator
      if (Math.random() > 0.7) {
        const randomUserId = `user${getRandomInt(1, 5)}`;
        
        if (Math.random() > 0.5) {
          // Simulate typing indicator
          this.notifyListeners({
            type: 'typing',
            data: {
              userId: randomUserId,
              isTyping: true,
            },
          });
          
          // Stop typing after a while
          setTimeout(() => {
            this.notifyListeners({
              type: 'typing',
              data: {
                userId: randomUserId,
                isTyping: false,
              },
            });
          }, getRandomInt(2000, 5000));
        } else {
          // Simulate new message
          const newMessage = {
            id: `msg_${randomUserId}_${Date.now()}`,
            content: getRandomMessage(false),
            senderId: randomUserId,
            timestamp: new Date().toISOString(),
            status: 'sent',
          };
          
          // Add to message history
          if (MESSAGE_HISTORY[randomUserId]) {
            MESSAGE_HISTORY[randomUserId].push(newMessage);
          }
          
          // Update thread data
          const threadIndex = this.chats.findIndex(t => t.id === randomUserId);
          if (threadIndex !== -1) {
            this.chats[threadIndex].lastMessage = {
              text: newMessage.content,
              timestamp: newMessage.timestamp,
            };
            this.chats[threadIndex].unread += 1;
          }
          
          // Notify listeners
          this.notifyListeners({
            type: 'message',
            data: {
              senderId: randomUserId,
              message: newMessage,
            },
          });
        }
      }
    }, 15000); // Every 15 seconds
    
    // Return unsubscribe function
    return () => {
      const index = messageListeners.indexOf(callback);
      if (index !== -1) {
        messageListeners.splice(index, 1);
      }
      clearInterval(intervalId);
    };
  }
  
  // Notify all listeners
  notifyListeners(event) {
    messageListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in message listener:', error);
      }
    });
  }
  
  // Add connection status listener
  addConnectionListener(listener) {
    if (typeof listener !== 'function') return;
    
    this.connectionListeners.push(listener);
    
    return () => this.removeConnectionListener(listener);
  }
  
  // Remove connection listener
  removeConnectionListener(listener) {
    this.connectionListeners = this.connectionListeners.filter(l => l !== listener);
  }
  
  // Notify all connection listeners
  notifyConnectionListeners(isConnected) {
    this.connectionListeners.forEach(listener => {
      try {
        listener(isConnected);
      } catch (error) {
        console.error('Error in connection listener:', error);
      }
    });
  }
  
  // ---------- Utility Methods ----------
  
  // Get auth token
  async getAuthToken() {
    // Implementation will depend on your auth strategy
    return 'dummy_token_for_testing';
  }

  // Internal methods
  
  // Simulate network delay
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // Randomly update online status of a user
  _updateRandomUserStatus() {
    if (this.chats.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * this.chats.length);
    const randomChat = this.chats[randomIndex];
    
    this.chats[randomIndex] = {
      ...randomChat,
      isOnline: !randomChat.isOnline,
    };
    
    // Notify listeners
    this._notifyListeners({
      type: 'status_change',
      data: {
        userId: randomChat.id,
        isOnline: !randomChat.isOnline,
      },
    });
  }
  
  // Simulate receiving a message
  _simulateIncomingMessage() {
    if (Math.random() > 0.3 || this.chats.length === 0) return; // 30% chance
    
    const randomIndex = Math.floor(Math.random() * this.chats.length);
    const randomChat = this.chats[randomIndex];
    
    const messages = [
      'Hey, how are you?',
      'Did you get my last message?',
      'Just checking in!',
      'Are you available for a call later?',
      'Have you seen the news?',
      'Can you help me with something?',
      'I was thinking about what you said earlier.',
      'Let me know when you\'re free.',
    ];
    
    const randomMessageIndex = Math.floor(Math.random() * messages.length);
    const content = messages[randomMessageIndex];
    
    const newMessage = {
      id: Date.now().toString(),
      senderId: randomChat.id,
      content,
      timestamp: new Date().toISOString(),
      status: 'delivered',
      conversationId: randomChat.id,
    };
    
    // Add to chat history
    if (!MESSAGE_HISTORY[randomChat.id]) {
      MESSAGE_HISTORY[randomChat.id] = [];
    }
    
    MESSAGE_HISTORY[randomChat.id].push(newMessage);
    
    // Update chat in list
    this.chats[randomIndex] = {
      ...randomChat,
      lastMessage: {
        text: content,
        timestamp: newMessage.timestamp,
      },
      unread: randomChat.unread + 1,
    };
    
    // Notify listeners
    this._notifyListeners({
      type: 'message',
      data: newMessage,
    });
  }
  
  // Notify all listeners
  _notifyListeners(event) {
    this.messageListeners.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in message listener:', error);
      }
    });
  }
}

export default new ChatService(); 