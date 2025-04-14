import React, { useState, useRef, useCallback, memo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Modal,
  Animated,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../../constants/colors';
import chatService from '../../services/chatService';

// -------------------- UTILITIES --------------------

const messageUtils = {
  /**
   * Format timestamp for display
   */
  formatTimestamp: (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return '';
      }
      
      const now = new Date();
      
      // Same day
      if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      
      // This year
      if (date.getFullYear() === now.getFullYear()) {
        return `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
      }
      
      // Different year
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return '';
    }
  },
  
  /**
   * Process message threads to ensure data is valid
   */
  processThreads: (threads) => {
    return threads.map(thread => {
      // Format lastMessage
      let lastMessageFormatted = thread.lastMessage;
      if (typeof lastMessageFormatted !== 'string') {
        // If lastMessage is an object with text property
        if (lastMessageFormatted && typeof lastMessageFormatted.text === 'string') {
          lastMessageFormatted = lastMessageFormatted.text;
        } else {
          lastMessageFormatted = '';
        }
      }
      
      // Format time
      let formattedTime = '';
      if (thread.time && typeof thread.time === 'string') {
        formattedTime = thread.time;
      } else if (thread.lastMessage && thread.lastMessage.timestamp) {
        // Use timestamp from lastMessage if it exists
        formattedTime = messageUtils.formatTimestamp(thread.lastMessage.timestamp);
      }
      
      // Return processed thread
      return {
        ...thread,
        lastMessage: lastMessageFormatted,
        time: formattedTime,
        name: thread.name || '',
        unread: typeof thread.unread === 'number' ? thread.unread : 0
      };
    });
  },
  
  /**
   * Generate a safe key for list items
   */
  generateSafeKey: (item) => {
    return item && item.id ? item.id : `message_${Math.random().toString(36).substr(2, 9)}`;
  },
  
  /**
   * Get the icon name for system messages
   */
  getSystemIcon: (id) => {
    switch (id) {
      case 'customer-service': return 'headset-mic';
      case 'call': return 'call';
      case 'visitors': return 'visibility';
      case 'notifications': return 'notifications';
      default: return 'chat';
    }
  }
};

// -------------------- UI COMPONENTS --------------------

/**
 * Component to display a message item in the list
 */
const MessageItem = memo(({ item, onPress }) => {
  const isSystemMessage = item.type === 'system';
  const hasUnread = item.unread > 0;
  
  // Ensure time is always a string
  const messageTime = typeof item.time === 'string' ? item.time : '';
  
  // Ensure lastMessage is always a string
  const messageText = typeof item.lastMessage === 'string' 
    ? item.lastMessage 
    : item.lastMessage && typeof item.lastMessage.text === 'string'
      ? item.lastMessage.text
      : '';
  
  return (
    <TouchableOpacity
      style={styles.messageItem}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        {isSystemMessage ? (
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientEnd]}
            style={styles.systemIconContainer}
          >
            <Icon
              name={messageUtils.getSystemIcon(item.id)}
              size={24}
              color="#fff"
            />
          </LinearGradient>
        ) : (
          <>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            {item.isOnline && <View style={styles.onlineIndicator} />}
          </>
        )}
      </View>
      
      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <Text style={styles.messageName} numberOfLines={1}>
            {item.name || ''}
          </Text>
          {messageTime ? (
            <Text style={styles.messageTime}>
              {messageTime}
            </Text>
          ) : null}
        </View>
        
        <View style={styles.messagePreview}>
          <Text
            style={[
              styles.messageText,
              hasUnread ? styles.unreadMessage : null
            ]}
            numberOfLines={1}
          >
            {messageText}
          </Text>
          
          {hasUnread && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>
                {item.unread}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
});

/**
 * Screen header component with title and action buttons
 */
const MessageHeader = ({ onNewMessagePress, onOptionsPress }) => (
  <View style={styles.header}>
    <View style={styles.headerTitleContainer}>
      <Text style={styles.headerTitle}>Messages</Text>
      <View style={styles.headerDot}></View>
    </View>
    
    <View style={styles.headerActions}>
      <TouchableOpacity 
        style={styles.headerButton}
        onPress={onNewMessagePress}
      >
        <Icon name="person-add" size={24} color="#000" />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.headerButton}
        onPress={onOptionsPress}
      >
        <Icon name="more-vert" size={24} color="#000" />
      </TouchableOpacity>
    </View>
  </View>
);

/**
 * Options menu that slides down with animation
 */
const OptionsMenu = ({ visible, fadeAnim, slideAnim, onMarkAllRead, onClearList }) => {
  if (!visible) return null;
  
  return (
    <Animated.View 
      style={[
        styles.optionsMenu,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <TouchableOpacity 
        style={styles.optionItem} 
        onPress={onMarkAllRead}
      >
        <Text style={styles.optionText}>Mark all as read</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.optionItem}
        onPress={onClearList}
      >
        <Text style={styles.optionText}>Clear message list</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

/**
 * Empty state when no messages are available
 */
const EmptyMessageList = () => (
  <View style={styles.emptyContainer}>
    <Icon name="forum" size={60} color={Colors.textLight} style={{ opacity: 0.6 }} />
    <Text style={styles.emptyText}>No messages yet</Text>
    <Text style={styles.emptySubtext}>
      When you connect with someone, you'll see your conversations here
    </Text>
  </View>
);

/**
 * Loading state component
 */
const LoadingState = () => (
  <SafeAreaView style={styles.container}>
    <StatusBar barStyle="dark-content" backgroundColor="#fff" />
    <MessageHeader onNewMessagePress={() => {}} onOptionsPress={() => {}} />
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.loadingText}>Loading messages...</Text>
    </View>
  </SafeAreaView>
);

/**
 * Error state component
 */
const ErrorState = ({ error, onRetry }) => (
  <SafeAreaView style={styles.container}>
    <StatusBar barStyle="dark-content" backgroundColor="#fff" />
    <MessageHeader onNewMessagePress={() => {}} onOptionsPress={() => {}} />
    <View style={styles.errorContainer}>
      <Icon name="error-outline" size={50} color={Colors.error} />
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity 
        style={styles.retryButton}
        onPress={onRetry}
      >
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  </SafeAreaView>
);

// -------------------- MAIN COMPONENT --------------------

const MessageScreen = ({ navigation }) => {
  // -------------------- STATE --------------------
  const [messages, setMessages] = useState([]);
  const [isOptionsVisible, setOptionsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // -------------------- REFS --------------------
  const messageListenerRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  
  // -------------------- EFFECTS --------------------
  
  // Initial data loading and socket setup
  useEffect(() => {
    fetchMessages();
    
    // Set up WebSocket listener
    messageListenerRef.current = chatService.addMessageListener(handleIncomingMessage);
    
    // Clean up on unmount
    return () => {
      if (messageListenerRef.current) {
        messageListenerRef.current();
      }
    };
  }, []);
  
  // Update unread count whenever messages change
  useEffect(() => {
    const count = messages.reduce((total, msg) => total + (msg.unread || 0), 0);
    setUnreadCount(count);
  }, [messages]);
  
  // -------------------- DATA OPERATIONS --------------------
  
  /**
   * Fetch initial messages
   */
  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const messageThreads = await chatService.getMessageThreads();
      const processedThreads = messageUtils.processThreads(messageThreads);
      setMessages(processedThreads);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Handle incoming messages from WebSocket
   */
  const handleIncomingMessage = useCallback((message) => {
    if (message.type === 'message') {
      // Update messages list with the new message
      setMessages(prevMessages => {
        // Find the conversation this message belongs to
        const conversationId = message.data.conversationId;
        const conversationIndex = prevMessages.findIndex(m => m.id === conversationId);
        
        if (conversationIndex >= 0) {
          // Conversation exists, update it
          const updatedMessages = [...prevMessages];
          
          // Format the timestamp as a string
          const formattedTime = typeof message.data.timestamp === 'string' 
            ? messageUtils.formatTimestamp(message.data.timestamp)
            : '';
          
          // Get the message content as a string
          const messageContent = typeof message.data.content === 'string'
            ? message.data.content
            : '';
          
          updatedMessages[conversationIndex] = {
            ...updatedMessages[conversationIndex],
            lastMessage: messageContent,
            time: formattedTime,
            unread: (updatedMessages[conversationIndex].unread || 0) + 1
          };
          return updatedMessages;
        }
        
        // Conversation doesn't exist yet, we would fetch full details
        return prevMessages;
      });
    }
  }, []);
  
  /**
   * Mark single conversation as read
   */
  const markConversationAsRead = async (conversationId) => {
    try {
      await chatService.markConversationAsRead(conversationId);
      
      // Update local state
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === conversationId ? { ...msg, unread: 0 } : msg
        )
      );
    } catch (err) {
      console.error('Error marking conversation as read:', err);
    }
  };
  
  /**
   * Mark all conversations as read
   */
  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await chatService.markAllConversationsAsRead();
      
      // Update local state
      setMessages(prevMessages => 
        prevMessages.map(msg => ({
          ...msg,
          unread: 0
        }))
      );
      
      // Close options menu
      toggleOptions();
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  }, []);
  
  /**
   * Clear message list 
   */
  const handleClearMessageList = useCallback(async () => {
    try {
      // Keep system messages, remove chat messages
      const systemMessages = messages.filter(msg => msg.type === 'system');
      const chatMessages = messages.filter(msg => msg.type === 'chat');
      
      // Delete each chat conversation
      const deletionPromises = chatMessages.map(msg => 
        chatService.deleteConversation(msg.id)
      );
      
      await Promise.all(deletionPromises);
      
      // Update local state with only system messages
      setMessages(systemMessages);
      
      // Close options menu
      toggleOptions();
    } catch (err) {
      console.error('Error clearing message list:', err);
    }
  }, [messages]);
  
  // -------------------- UI OPERATIONS --------------------
  
  /**
   * Show/hide options menu with animation
   */
  const toggleOptions = () => {
    if (isOptionsVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 20,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start(() => setOptionsVisible(false));
    } else {
      setOptionsVisible(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }
  };
  
  /**
   * Handle tapping on a message item
   */
  const handleMessagePress = useCallback((message) => {
    // Close options menu if open
    if (isOptionsVisible) {
      toggleOptions();
    }
    
    if (message.type === 'chat') {
      // Mark conversation as read if it has unread messages
      if (message.unread > 0) {
        markConversationAsRead(message.id);
      }
      
      // Navigate to chat screen
      navigation.navigate('ChatDetail', { 
        conversationId: message.id,
        name: message.name,
        avatar: message.avatar,
        isOnline: message.isOnline
      });
    } else if (message.type === 'system') {
      handleSystemMessagePress(message);
    }
  }, [isOptionsVisible, navigation]);
  
  /**
   * Handle system message press
   */
  const handleSystemMessagePress = (message) => {
    // Mark system message as read if needed
    if (message.unread > 0) {
      markConversationAsRead(message.id);
    }
    
    switch (message.id) {
      case 'customer-service':
        console.log('Navigating to Customer Service');
        break;
      case 'call':
        console.log('Navigating to Call History');
        break;
      case 'visitors':
        console.log('Navigating to Profile Visitors');
        break;
      case 'notifications':
        console.log('Navigating to Notifications');
        break;
    }
  };
  
  /**
   * Handle new message button press
   */
  const handleNewMessagePress = () => {
    console.log('Navigate to New Message screen');
  };
  
  /**
   * Render a message item
   */
  const renderItem = useCallback(({ item }) => {
    // Skip rendering invalid items
    if (!item || !item.id) {
      console.warn('Attempting to render invalid message item:', item);
      return null;
    }
    
    return (
      <MessageItem 
        item={item}
        onPress={handleMessagePress}
      />
    );
  }, [handleMessagePress]);
  
  // -------------------- RENDER --------------------
  
  // Show loading state
  if (loading && messages.length === 0) {
    return <LoadingState />;
  }
  
  // Show error state
  if (error && messages.length === 0) {
    return <ErrorState error={error} onRetry={fetchMessages} />;
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <MessageHeader 
        onNewMessagePress={handleNewMessagePress}
        onOptionsPress={toggleOptions}
      />
      
      {/* Options Menu */}
      <OptionsMenu 
        visible={isOptionsVisible}
        fadeAnim={fadeAnim}
        slideAnim={slideAnim}
        onMarkAllRead={handleMarkAllAsRead}
        onClearList={handleClearMessageList}
      />
      
      {/* Message List or Empty State */}
      {messages.length === 0 ? (
        <EmptyMessageList />
      ) : (
        <FlatList
          data={messages}
          renderItem={renderItem}
          keyExtractor={messageUtils.generateSafeKey}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={15}
          maxToRenderPerBatch={10}
          windowSize={21}
          removeClippedSubviews={true}
          onRefresh={fetchMessages}
          refreshing={loading}
        />
      )}
    </SafeAreaView>
  );
};

// -------------------- STYLES --------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  headerTitleContainer: {
    position: 'relative',
  },
  headerDot: {
    position: 'absolute',
    bottom: -4,
    left: 2,
    width: 8,
    height: 8,
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginLeft: 8,
  },
  optionsMenu: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
    width: 200,
    overflow: 'hidden',
  },
  optionItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  listContent: {
    paddingBottom: 80, // For bottom tab bar
  },
  messageItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
  },
  systemIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CD964',
    borderWidth: 2,
    borderColor: '#fff',
  },
  messageContent: {
    flex: 1,
    justifyContent: 'center',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  messageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  messageTime: {
    fontSize: 14,
    color: '#888',
    marginLeft: 8,
  },
  messagePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  messageText: {
    fontSize: 14,
    color: '#888',
    flex: 1,
  },
  unreadMessage: {
    color: '#333',
    fontWeight: '500',
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
    marginVertical: 16,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});

export default MessageScreen; 