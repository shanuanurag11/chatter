import { Platform } from 'react-native';
import apiClient from './api/client';
import socketService from './socketService';

// Configuration
const API_BASE_URL = 'https://api.example.com';
const SOCKET_URL = 'wss://api.example.com/ws/chat';

class ChatService {
  constructor() {
    this.messageListeners = [];
    this.connectionListeners = [];
    this.isConnected = false;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.deviceId = Platform.OS === 'ios' ? 'ios_device' : 'android_device';
    this.chats = [];
    
    // Initialize socket listeners
    this.initializeSocketListeners();
  }

  // Initialize socket listeners
  initializeSocketListeners() {
    console.log('Initializing socket listeners');
    
    // Add message listener
    this.socketMessageUnsubscribe = socketService.addMessageListener((event, data) => {
      console.log('Socket message event received:', event, data);
      
      if (event === 'message_sent') {
        this.handleMessageSent(data);
      } else if (event === 'message_received') {
        this.handleMessageReceived(data);
      } else if (event === 'message_read') {
        this.handleMessageRead(data);
      }
    });

    // Add error listener
    this.socketErrorUnsubscribe = socketService.addErrorListener((error) => {
      console.error('Socket error:', error);
      this.notifyListeners({
        type: 'error',
        data: error
      });
    });
  }

  // Handle sent message
  handleMessageSent(data) {
    console.log('Handling sent message:', data);
    const { conversationId, message } = data;
    
    // Notify listeners
    this.notifyListeners({
      type: 'message_sent',
      data
    });
  }

  // Handle received message
  handleMessageReceived(data) {
    console.log('Handling received message:', data);
    const { conversationId, message } = data;
    
    // Notify listeners
    this.notifyListeners({
      type: 'message_received',
      data: {
        id: data.messageId,
        content: message,
        senderId: data.from_user_id,
        timestamp: new Date().toISOString(),
        status: 'received',
        conversationId
      }
    });
  }

  // Handle message read
  handleMessageRead(data) {
    console.log('Handling message read:', data);
    const { conversationId, messageIds } = data;
    
    // Notify listeners
    this.notifyListeners({
      type: 'message_read',
      data
    });
  }

  // Cleanup socket listeners
  cleanupSocketListeners() {
    console.log('Cleaning up socket listeners');
    if (this.socketMessageUnsubscribe) {
      this.socketMessageUnsubscribe();
    }
    if (this.socketErrorUnsubscribe) {
      this.socketErrorUnsubscribe();
    }
  }

  // ---------- Message List Methods ----------

  // Get all message threads (conversations)
  async getMessageThreads() {
    try {
      const response = await apiClient.get('/api/v1/user/chats/');
      if (response.data.status) {
        return response.data.data.conversations.map(chat => ({
          id: chat.id,
          name: chat.other_participant?.name || 'Unknown',
          avatar: chat.other_participant?.profile_picture,
          lastMessage: {
            text: chat.latest_message?.content || '',
            timestamp: chat.last_message_at,
            messageType: chat.latest_message?.message_type || 'text',
            fileUrl: chat.latest_message?.file_url,
            fileName: chat.latest_message?.file_name,
            fileSize: chat.latest_message?.file_size,
            hasFile: chat.latest_message?.has_file || false
          },
          unread: chat.unread_count,
          isOnline: false,
          timestamp: chat.last_message_at,
          created_at: chat.created_at,
          updated_at: chat.updated_at,
          other_participant: chat.other_participant
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching chats:', error);
      throw error;
    }
  }

  // Mark a conversation as read
  async markConversationAsRead(conversationId) {
    try {
      await apiClient.post(`/api/v1/user/chats/${conversationId}/read/`);
      return true;
    } catch (error) {
      console.error('Error marking conversation as read:', error);
      throw error;
    }
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
    try {
      const response = await apiClient.get(`/api/v1/user/chats/${conversationId}/messages/`);
      if (response.data.status) {
        // Transform the API response to match our app's data structure
        return response.data.data.messages.map(message => ({
          id: message.id,
          content: message.content,
          senderId: message.sender,
          timestamp: message.created_at,
          messageType: message.message_type,
          fileUrl: message.file_url,
          fileName: message.file_name,
          fileSize: message.file_size,
          isRead: message.is_read,
          isDeleted: message.is_deleted,
          isMyMessage: message.is_my_message,
          conversationId
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching chat history:', error);
      throw error;
    }
  }

  // Send a message
  async sendMessage(conversationId, content, chatData = null) {
    try {
      let otherParticipantId;
      
      if (chatData && chatData.other_participant) {
        // Use the chat data passed from ChatListScreen
        otherParticipantId = chatData.other_participant.id;
      } 
      
      if (!otherParticipantId) {
        throw new Error('Other participant ID not found');
      }

      // Send message through socket service with both IDs
      const socketResponse = await socketService.sendMessage(conversationId, otherParticipantId, content);
      return socketResponse;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
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
    this.messageListeners.push(callback);
    return () => {
      const index = this.messageListeners.indexOf(callback);
      if (index !== -1) {
        this.messageListeners.splice(index, 1);
      }
    };
  }
  
  // Notify all listeners
  notifyListeners(event) {
    this.messageListeners.forEach(listener => {
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