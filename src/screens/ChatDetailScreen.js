import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import chatService from '../services/chatService';
import Ionicons from 'react-native-vector-icons/Ionicons';

// -------------------- UTILITIES --------------------

const messageUtils = {
  formatMessageTime: (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const messageDate = new Date(timestamp);
      if (isNaN(messageDate.getTime())) return '';
      
      return messageDate.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      console.error('Error formatting message time:', error);
      return '';
    }
  },

  formatDateHeader: (date) => {
    if (!date) return '';
    
    try {
      const messageDate = new Date(date);
      if (isNaN(messageDate.getTime())) return '';
      
      return messageDate.toLocaleDateString([], {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date header:', error);
      return '';
    }
  },

  processMessage: (message, fallbackText = '') => {
    return {
      id: message.id || `msg_${Date.now()}`,
      content: typeof message.content === 'string' ? message.content : 
               typeof message.text === 'string' ? message.text : fallbackText,
      status: typeof message.status === 'string' ? message.status : '',
      timestamp: typeof message.timestamp === 'string' ? 
                message.timestamp : new Date().toISOString(),
      senderId: message.senderId || ''
    };
  },

  generateSafeKey: (item, index) => {
    const safeTimestamp = item.timestamp ? 
      (typeof item.timestamp === 'string' ? 
        item.timestamp : JSON.stringify(item.timestamp)) : '';
    return `msg-${safeTimestamp}-${index}`;
  }
};

// -------------------- UI COMPONENTS --------------------

const MessageBubble = ({ message, isUser }) => {
  const messageContent = typeof message.content === 'string' 
    ? message.content 
    : typeof message.text === 'string' ? message.text : '';
  
  const messageStatus = typeof message.status === 'string' ? message.status : '';
    
  return (
    <View style={[
      styles.messageBubbleContainer,
      isUser ? styles.userMessageContainer : styles.otherMessageContainer
    ]}>
      <View style={[
        styles.messageBubble,
        isUser ? styles.userMessage : styles.otherMessage
      ]}>
        <Text style={[
          styles.messageText,
          isUser ? styles.userMessageText : styles.otherMessageText
        ]}>
          {messageContent}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={[
          styles.messageTime,
          isUser ? styles.userMessageTime : styles.otherMessageTime
        ]}>
          {message.timestamp ? messageUtils.formatMessageTime(message.timestamp) : ''}
        </Text>
        {isUser && messageStatus ? (
          <Text style={styles.messageStatus}>
            {' · '}{messageStatus}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

const DateHeader = ({ date }) => {
  const formattedDate = date ? messageUtils.formatDateHeader(date) : '';
  
  if (!formattedDate) return null;
  
  return (
    <View style={styles.dateHeaderContainer}>
      <Text style={styles.dateHeaderText}>
        {formattedDate}
      </Text>
    </View>
  );
};

const TypingIndicator = () => (
  <View style={styles.typingContainer}>
    <View style={styles.typingBubble}>
      <View style={styles.typingDot} />
      <View style={[styles.typingDot, styles.typingDotMiddle]} />
      <View style={styles.typingDot} />
    </View>
    <Text style={styles.typingText}>typing...</Text>
  </View>
);

const ChatHeader = ({ avatar, name, isOnline, onBackPress, onVideoPress }) => {
  const displayName = name || '';
  const avatarUrl = avatar || 'https://via.placeholder.com/40';
  const onlineStatus = isOnline === true ? 'Online' : 'Offline';
  
  return (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={onBackPress}
        activeOpacity={0.7}
      >
        <Ionicons name="chevron-back" size={24} color="#007AFF" />
      </TouchableOpacity>
      
      <View style={styles.headerProfile}>
        <Image 
          source={{ uri: avatarUrl }} 
          style={styles.headerAvatar}
        />
        <View>
          <Text style={styles.headerName}>{displayName}</Text>
          <Text style={styles.headerStatus}>
            {onlineStatus}
          </Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.videoButton} 
        onPress={onVideoPress}
        activeOpacity={0.7}
      >
        <Ionicons name="videocam" size={22} color="#007AFF" />
      </TouchableOpacity>
    </View>
  );
};

const ChatInput = ({ inputText, onChangeText, onSend, sending }) => {
  return (
    <View style={styles.inputContainer}>
      <TouchableOpacity style={styles.attachButton}>
        <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
      </TouchableOpacity>
      
      <TextInput
        style={styles.textInput}
        placeholder="Message"
        value={inputText}
        onChangeText={onChangeText}
        multiline
      />
      
      {inputText.trim() ? (
        <TouchableOpacity 
          style={styles.sendButton} 
          onPress={onSend}
          disabled={sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="send" size={20} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.micButton}>
          <Ionicons name="mic-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const LoadingView = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#007AFF" />
    <Text style={styles.loadingText}>Loading messages...</Text>
  </View>
);

// -------------------- MAIN COMPONENT --------------------

const ChatDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { conversationId, name, avatar, isOnline } = route.params;
  
  // State
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // Refs
  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  // -------------------- EFFECTS --------------------

  useEffect(() => {
    // Load message history
    loadChatHistory();
    
    // Set up message listener
    const unsubscribe = setupMessageListener();
    
    // Configure navigation header
    configureNavigationHeader();
    
    return () => unsubscribe();
  }, [navigation, conversationId, name, avatar, isOnline]);
  
  // -------------------- DATA OPERATIONS --------------------

  const loadChatHistory = async () => {
    try {
      const history = await chatService.getChatHistory(conversationId);
      
      // Process messages to ensure all values are strings
      const processedHistory = history.map(msg => 
        messageUtils.processMessage(msg)
      );
      
      setMessages(processedHistory.reverse()); // Reverse to show latest at bottom
      setLoading(false);
    } catch (error) {
      console.error('Failed to load messages:', error);
      setLoading(false);
    }
  };
  
  const setupMessageListener = () => {
    return chatService.addMessageListener(handleIncomingEvent);
  };
  
  const handleIncomingEvent = (event) => {
    if (event.type === 'message' && event.data && event.data.senderId === conversationId) {
      handleIncomingMessage(event);
    } else if (event.type === 'typing' && event.data && event.data.userId === conversationId) {
      setIsTyping(Boolean(event.data.isTyping));
    } else if (event.type === 'status' && event.data && event.data.messageId) {
      handleStatusUpdate(event);
    }
  };
  
  const handleIncomingMessage = (event) => {
    try {
      // Extract message data, using defaults for missing values
      const messageData = event.data.message || event.data;
      
      // Process the message to ensure all values are strings
      const processedMessage = messageUtils.processMessage(
        messageData, 
        ''
      );
      processedMessage.senderId = messageData.senderId || conversationId;
      
      // Add new message to the list
      setMessages(prevMessages => [...prevMessages, processedMessage]);
      
      // Scroll to bottom
      scrollToBottom();
    } catch (error) {
      console.error('Error processing incoming message:', error);
    }
  };
  
  const handleStatusUpdate = (event) => {
    try {
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === event.data.messageId 
            ? { 
                ...msg, 
                status: typeof event.data.status === 'string' ? event.data.status : msg.status || '' 
              } 
            : msg
        )
      );
    } catch (error) {
      console.error('Error updating message status:', error);
    }
  };
  
  const sendMessage = async () => {
    if (inputText.trim() === '') return;
    
    const messageText = inputText.trim();
    setInputText('');
    setSending(true);
    
    try {
      const newMessage = await chatService.sendMessage(
        conversationId, 
        messageText
      );
      
      // Process new message
      const processedMessage = messageUtils.processMessage(
        newMessage,
        messageText
      );
      processedMessage.senderId = 'me';
      
      // Add the new message to the list
      setMessages(prevMessages => [...prevMessages, processedMessage]);
      
      // Scroll to bottom
      scrollToBottom();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };
  
  // -------------------- UI HELPERS --------------------
  
  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };
  
  const handleInputChange = (text) => {
    setInputText(text);
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to stop "typing" after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      // In a real app, you'd notify the server that the user stopped typing
      console.log('User stopped typing');
    }, 3000);
    
    // In a real app, you'd notify the server that the user is typing
    console.log('User is typing');
  };
  
  const configureNavigationHeader = () => {
    navigation.setOptions({
      title: '',
      headerRight: () => (
        <TouchableOpacity 
          style={styles.callButton}
          onPress={() => {
            console.log('Starting video call with:', conversationId);
          }}
        >
          <Ionicons name="videocam" size={24} color="#007AFF" />
        </TouchableOpacity>
      ),
      headerLeft: () => (
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={28} color="#007AFF" />
            <Text style={styles.backText}>Chats</Text>
          </TouchableOpacity>
        </View>
      ),
      headerTitle: () => (
        <View style={styles.headerTitle}>
          <Image source={{ uri: avatar }} style={styles.headerAvatar} />
          <View>
            <Text style={styles.headerName}>{name}</Text>
            <Text style={styles.headerStatus}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>
      ),
    });
  };
  
  const renderMessageItem = ({ item, index }) => {
    if (!item) {
      console.warn('Trying to render null item at index', index);
      return null;
    }
    
    // Check if this is a date header item
    if (item.type === 'date') {
      const headerDate = item.date || item.timestamp || '';
      return <DateHeader date={headerDate} />;
    }
    
    // Determine if this message is from the current user
    const isUser = item.senderId === 'me';
    
    try {
      return <MessageBubble message={item} isUser={isUser} />;
    } catch (error) {
      console.error('Error rendering message bubble:', error, item);
      return null;
    }
  };
  
  // -------------------- RENDER --------------------
  
  if (loading) {
    return <LoadingView />;
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <ChatHeader
        avatar={avatar}
        name={name}
        isOnline={isOnline}
        onBackPress={() => navigation.goBack()}
        onVideoPress={() => {
          console.log('Starting video call with:', conversationId);
        }}
      />
      
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={messageUtils.generateSafeKey}
          renderItem={renderMessageItem}
          contentContainerStyle={styles.messagesList}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />
        
        {isTyping && <TypingIndicator />}
        
        <ChatInput 
          inputText={inputText}
          onChangeText={handleInputChange}
          onSend={sendMessage}
          sending={sending}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// -------------------- STYLES --------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#CECED2',
    backgroundColor: '#FFFFFF',
  },
  headerProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
  },
  videoButton: {
    padding: 8,
  },
  backText: {
    fontSize: 17,
    color: '#007AFF',
    marginLeft: -5,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  headerName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  headerStatus: {
    fontSize: 12,
    color: '#8E8E93',
  },
  callButton: {
    padding: 8,
    marginRight: 8,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  messageBubbleContainer: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 4,
  },
  userMessage: {
    backgroundColor: '#007AFF',
  },
  otherMessage: {
    backgroundColor: '#E9E9EB',
  },
  messageText: {
    fontSize: 16,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: '#000000',
  },
  messageTime: {
    fontSize: 11,
    color: '#8E8E93',
  },
  userMessageTime: {
    color: '#8E8E93',
    alignSelf: 'flex-end',
  },
  otherMessageTime: {
    color: '#8E8E93',
  },
  messageStatus: {
    fontSize: 11,
    color: '#8E8E93',
  },
  dateHeaderContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dateHeaderText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
    backgroundColor: 'rgba(238, 238, 238, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#CECED2',
  },
  attachButton: {
    padding: 8,
  },
  textInput: {
    flex: 1,
    marginHorizontal: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  typingBubble: {
    flexDirection: 'row',
    backgroundColor: '#E9E9EB',
    borderRadius: 10,
    padding: 8,
    marginRight: 8,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8E8E93',
    marginHorizontal: 2,
  },
  typingDotMiddle: {
    marginTop: -4,
  },
  typingText: {
    fontSize: 12,
    color: '#8E8E93',
  },
});

export default ChatDetailScreen; 