import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import chatService from '../services/chatService';
import socketService from '../services/socketService';
import userService from '../services/userService';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import EncryptedStorage from 'react-native-encrypted-storage';

// Format timestamp function
const formatTimeAgo = (timestamp) => {
  if (!timestamp) return '';
  
  try {
    const now = new Date();
    const messageDate = new Date(timestamp);
    
    // Check if the date is valid
    if (isNaN(messageDate.getTime())) {
      return '';
    }
    
    const diffMs = now - messageDate;
    
    // Convert to minutes
    const diffMin = Math.floor(diffMs / 60000);
    
    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    
    // Convert to hours
    const diffHour = Math.floor(diffMin / 60);
    
    if (diffHour < 24) return `${diffHour}h ago`;
    
    // Convert to days
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay < 7) return `${diffDay}d ago`;
    
    // Return formatted date
    return messageDate.toLocaleDateString();
  } catch (error) {
    console.error('Error formatting time:', error);
    return '';
  }
};

// Add helper function to get file icon
const getFileIcon = (messageType) => {
  switch (messageType?.toLowerCase()) {
    case 'image':
      return 'image-outline';
    case 'file':
      return 'document-outline';
    case 'reaction':
      return 'heart-outline';
    default:
      return 'chatbubble-outline';
  }
};

// Add emoji mapping
const EMOJI_MAP = {
  'star': '⭐',
  'think': '🤔',
  'smile': '😊',
  'heart': '❤️',
  'laugh': '😂',
  'wink': '😉',
  'sad': '😢',
  'angry': '😠',
  'thumbsup': '👍',
  'thumbsdown': '👎',
  'clap': '👏',
  'fire': '🔥',
  'party': '🎉',
  'eyes': '👀',
  'ok': '👌',
};

// Helper function to convert emoji codes to actual emojis
const convertEmojiCodes = (text) => {
  if (!text) return '';
  
  console.log('Converting emoji for text:', text); // Debug log
  
  // If the text is just an emoji code (e.g., ":star:")
  if (text.startsWith(':') && text.endsWith(':')) {
    const emojiCode = text.slice(1, -1).toLowerCase();
    const emoji = EMOJI_MAP[emojiCode];
    console.log('Found emoji code:', emojiCode, 'Converting to:', emoji); // Debug log
    return emoji || text;
  }
  
  // If emoji codes are part of a larger text
  return text.replace(/:([a-z0-9_]+):/g, (match, code) => {
    const emoji = EMOJI_MAP[code.toLowerCase()];
    console.log('Found emoji in text:', code, 'Converting to:', emoji); // Debug log
    return emoji || match;
  });
};

// Chat Item Component
const ChatItem = ({ chat, onPress }) => {
  const timestamp = chat.lastMessage && chat.lastMessage.timestamp 
    ? chat.lastMessage.timestamp 
    : chat.timestamp;
  const formattedTime = formatTimeAgo(timestamp);
  
  // Get message type and icon
  const messageType = chat.lastMessage?.messageType || 'text';
  const fileIcon = getFileIcon(messageType);
  
  // Get message status
  const isMyMessage = chat.lastMessage?.isMyMessage;
  const isRead = chat.lastMessage?.isRead;
  
  // Convert emoji codes in message text
  const originalText = chat.lastMessage?.text || '';
  console.log('Original message:', originalText, 'Type:', messageType); // Debug log
  const messageText = convertEmojiCodes(originalText);
  console.log('Converted message:', messageText); // Debug log
  
  return (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => onPress(chat)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: chat.avatar }} style={styles.avatar} />
        {chat.isOnline && <View style={styles.onlineBadge} />}
      </View>
      
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName} numberOfLines={1}>{chat.name}</Text>
          <Text style={styles.chatTime}>{formattedTime}</Text>
        </View>
        
        <View style={styles.chatFooter}>
          <View style={styles.lastMessageContainer}>
            {isMyMessage && (
              <Ionicons 
                name={isRead ? "checkmark-done" : "checkmark"} 
                size={16} 
                color={isRead ? "#4CD964" : "#8E8E93"} 
                style={styles.messageStatusIcon} 
              />
            )}
            {messageType !== 'text' && messageType !== 'reaction' && (
              <Ionicons 
                name={fileIcon} 
                size={16} 
                color="#8E8E93" 
                style={styles.messageTypeIcon} 
              />
            )}
            <Text 
              style={[
                styles.chatLastMessage,
                isMyMessage && styles.myMessage,
                messageType === 'reaction' && styles.emojiMessage
              ]} 
              numberOfLines={1}
            >
              {messageText}
            </Text>
          </View>
          
          {chat.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{chat.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Empty State Component
const EmptyState = () => (
  <View style={styles.emptyContainer}>
    <Ionicons name="chatbubble-ellipses-outline" size={64} color="#CCCCCC" />
    <Text style={styles.emptyTitle}>No Conversations Yet</Text>
    <Text style={styles.emptySubtitle}>
      When you start chatting with others, they'll appear here.
    </Text>
  </View>
);

// Main ChatListScreen Component
const ChatListScreen = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const navigation = useNavigation();
  
  // Initialize socket connection
  useEffect(() => {
    const initializeSocket = async () => {
      try {
        setError(null);
        // Get user data from UserService
        const userData = await userService.getUserData();
        console.log("User data from service:", userData);

        if (!userData) {
          console.log("No user data found, attempting to fetch from API...");
          // If no user data in storage, try to get from API
          const currentUser = await userService.getCurrentUser();
          console.log("Current user from API:", currentUser);
          
          if (!currentUser) {
            console.error('No user data available, please login again');
            setError('Please login again to continue');
            return;
          }
        }

        // Initialize socket with user_id
        const userId = await userData?.id;
        console.log("Initializing socket with user_id:", userId);
        
        if (!userId) {
          console.error('No user_id available');
          setError('Unable to initialize chat. Please try again.');
          return;
        }

        try {
          const initialized = await socketService.initialize(userId);
          if (!initialized) {
            throw new Error('Failed to initialize socket');
          }
          
          // Add socket listeners
          const messageUnsubscribe = socketService.addMessageListener((event, data) => {
            console.log('Socket message event in ChatListScreen:', event, data);
            if (event === 'message_received' || event === 'message_sent') {
              loadChats(); // Refresh chat list when new message arrives
            }
          });
          
          const statusUnsubscribe = socketService.addStatusListener((data) => {
            console.log('Socket status event in ChatListScreen:', data);
            // Update online status in chat list
            setChats(prevChats => 
              prevChats.map(chat => 
                chat.other_participant?.id === data.user_id
                  ? { ...chat, isOnline: data.is_online }
                  : chat
              )
            );
          });

          const errorUnsubscribe = socketService.addErrorListener((error) => {
            console.error('Socket error received:', error);
            if (error.message === 'Failed to create user') {
              // Try to reinitialize socket with fresh user data
              userService.getCurrentUser().then(async (freshUserData) => {
                if (freshUserData) {
                  await userService.saveUserData(freshUserData);
                  const newUserId = freshUserData.id;
                  if (newUserId) {
                    socketService.disconnect();
                    const reinitialized = await socketService.initialize(newUserId);
                    if (!reinitialized) {
                      setError('Authentication failed. Please try logging in again.');
                    }
                  }
                } else {
                  setError('Authentication failed. Please try logging in again.');
                }
              }).catch(() => {
                setError('Authentication failed. Please try logging in again.');
              });
            } else {
              setError('Connection error. Please try again.');
            }
          });
          
          // Cleanup listeners on unmount
          return () => {
            messageUnsubscribe();
            statusUnsubscribe();
            errorUnsubscribe();
            socketService.disconnect();
          };
        } catch (error) {
          console.error('Socket initialization error:', error);
          setError('Unable to connect to chat server. Please try again.');
          return;
        }
      } catch (error) {
        console.error('Socket setup error:', error);
        setError('Failed to setup chat. Please try again.');
      }
    };
    
    initializeSocket();
  }, []);
  
  // Function to load chat data
  const loadChats = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await chatService.getMessageThreads();
      console.log("Chat list data:", data);
      setChats(data);
    } catch (err) {
      console.error('Failed to load chats:', err);
      setError('Unable to load your conversations. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Initial load
  useEffect(() => {
    loadChats();
  }, []);
  
  // Refresh when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadChats();
    }, [])
  );
  
  // Handle pull-to-refresh
  const handleRefresh = () => {
    setRefreshing(true);
    loadChats();
  };
  
  // Navigate to chat detail screen
  const handleChatPress = (chat) => {
    console.log("Selected chat:", chat);
    try {
      if (!chat || !chat.id) {
        console.error('Invalid chat object:', chat);
        return;
      }
      
      // Mark conversation as read when navigating to it
      chatService.markConversationAsRead(chat.id);
      
      // Update local state to reflect read status
      setChats(prevChats => 
        prevChats.map(c => 
          c.id === chat.id ? { ...c, unread: 0 } : c
        )
      );
      
      // Pass the complete chat object to ChatDetail screen
      navigation.navigate('ChatDetail', {
        chat: chat  // Pass the entire chat object
      });
    } catch (error) {
      console.error('Error navigating to chat:', error);
      setError('Failed to open chat. Please try again.');
    }
  };
  
  // Render separator between items
  const renderSeparator = () => <View style={styles.separator} />;
  
  // Render loading state
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading conversations...</Text>
      </View>
    );
  }
  
  // Render error state
  if (error && !refreshing) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#FF3B30" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadChats}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6C63FF" />
      
      <View style={styles.headerWrapper}>
        <LinearGradient
          colors={['#6C63FF', '#8E64FF']}
          style={styles.headerGradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
        />
        <View style={styles.headerDecorationContainer}>
          <View style={styles.headerDecoration1} />
          <View style={styles.headerDecoration2} />
        </View>
        
        <View style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Messages</Text>
            <View style={styles.headerAccent} />
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="search-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.headerButton, styles.headerButtonSecondary]}>
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      <View style={styles.contentContainer}>
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChatItem chat={item} onPress={handleChatPress} />
          )}
          ItemSeparatorComponent={renderSeparator}
          contentContainerStyle={chats.length === 0 ? {flex: 1} : {paddingTop: 12}}
          ListEmptyComponent={EmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#6C63FF']}
              tintColor="#6C63FF"
            />
          }
        />
      </View>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 4,
  },
  headerWrapper: {
    position: 'relative',
    paddingTop: 20,
    paddingBottom: 40,
    overflow: 'hidden',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerDecorationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  headerDecoration1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerDecoration2: {
    position: 'absolute',
    bottom: -80,
    left: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  headerTitleContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerAccent: {
    position: 'absolute',
    bottom: -6,
    left: 0,
    width: 32,
    height: 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 1.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  headerButtonSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  chatItem: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EEEEEE',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CD964',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  chatContent: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  chatTime: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 8,
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  messageTypeIcon: {
    marginRight: 4,
  },
  chatLastMessage: {
    fontSize: 14,
    color: '#8E8E93',
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
    minWidth: 20,
    alignItems: 'center',
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginLeft: 76, // Align with the end of avatar
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  messageStatusIcon: {
    marginRight: 4,
  },
  myMessage: {
    color: '#666666',
  },
  emojiMessage: {
    fontSize: 18, // Increased font size for better emoji visibility
    lineHeight: 22,
  },
});

export default ChatListScreen; 