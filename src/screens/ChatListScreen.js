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
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

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

// Chat Item Component
const ChatItem = ({ chat, onPress }) => {
  // Format timestamp - check if timestamp is in lastMessage or at chat level
  const timestamp = chat.lastMessage && chat.lastMessage.timestamp 
    ? chat.lastMessage.timestamp 
    : chat.timestamp;
  const formattedTime = formatTimeAgo(timestamp);
  
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
          <Text style={styles.chatLastMessage} numberOfLines={1}>
            {typeof chat.lastMessage === 'object' ? chat.lastMessage.text : chat.lastMessage}
          </Text>
          
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
  
  // Function to load chat data
  const loadChats = async () => {
    try {
      setError(null);
      const data = await chatService.getMessageThreads();
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
    
    // Set up websocket listener for updates
    const unsubscribe = chatService.addMessageListener((event) => {
      if (event.type === 'message') {
        // Refresh the chat list when a new message arrives
        loadChats();
      } else if (event.type === 'status_change') {
        // Update the specific chat's online status
        setChats((prevChats) => 
          prevChats.map(chat => 
            chat.id === event.data.userId 
              ? { ...chat, isOnline: event.data.isOnline }
              : chat
          )
        );
      }
    });
    
    return () => unsubscribe();
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
    try {
      console.log('Chat pressed with data:', chat);
      
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
      
      // Prepare navigation params
      const params = {
        conversationId: chat.id,
        name: chat.name,
        avatar: chat.avatar,
        isOnline: chat.isOnline
      };
      
      console.log('Navigating to ChatDetail with params:', params);
      
      // Navigate to chat detail screen
      navigation.navigate('ChatDetail', params);
    } catch (error) {
      console.error('Error navigating to chat:', error);
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
});

export default ChatListScreen; 