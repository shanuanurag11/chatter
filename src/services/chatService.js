import { Platform } from 'react-native';
import apiClient from './api/client';
import socketService from './socketService';

// Configuration
const API_BASE_URL = 'https://api.example.com';
const SOCKET_URL = 'wss://api.example.com/ws/chat';

class ChatService {
  constructor() {
    this.userId = null;
  }

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
          other_participant: chat.other_participant,
          coins: chat.coins,
          total_seconds: chat.total_seconds
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

  // Get chat history for a conversation
  async getChatHistory(conversationId) {
    try {
      const response = await apiClient.get(`/api/v1/user/chats/${conversationId}/messages/`);
      if (response.data.status) {
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
  async sendMessage(conversationId, content, chatData = null, messageType = 'text') {
    try {
      let otherParticipantId;
      
      if (chatData && chatData.other_participant) {
        otherParticipantId = chatData.other_participant.id;
      } 
      
      if (!otherParticipantId) {
        throw new Error('Other participant ID not found');
      }

      const socketResponse = await socketService.sendMessage(conversationId, otherParticipantId, content, messageType);
      return socketResponse;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Create or find conversation with a user
  async createOrFindConversation(otherUserId) {
    try {
      console.log('Creating or finding conversation with user:', otherUserId);
      
      // First, try to find existing conversation
      const existingChats = await this.getMessageThreads();
      const existingChat = existingChats.find(chat => 
        chat.other_participant && chat.other_participant.id === otherUserId
      );
      
      if (existingChat) {
        console.log('Found existing conversation:', existingChat);
        return existingChat;
      }
      
      // If no existing conversation, create a new one
      console.log('No existing conversation found, creating new one...');
      const response = await apiClient.post('/api/v1/user/chats/', {
        other_user_id: otherUserId
      });
      
      if (response.data.status) {
        const newChat = {
          id: response.data.data.id,
          name: response.data.data.other_participant?.name || 'Unknown',
          avatar: response.data.data.other_participant?.profile_picture,
          lastMessage: {
            text: '',
            timestamp: new Date().toISOString(),
            messageType: 'text'
          },
          unread: 0,
          isOnline: false,
          timestamp: new Date().toISOString(),
          created_at: response.data.data.created_at,
          updated_at: response.data.data.updated_at,
          other_participant: response.data.data.other_participant,
          coins: response.data.data.coins,
          total_seconds: response.data.data.total_seconds
        };
        
        console.log('Created new conversation:', newChat);
        return newChat;
      }
      
      throw new Error('Failed to create conversation');
    } catch (error) {
      console.error('Error creating or finding conversation:', error);
      throw error;
    }
  }
}

export default new ChatService(); 