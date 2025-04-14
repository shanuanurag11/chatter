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
  Modal,
  Pressable,
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

const MessageOptionsMenu = ({ visible, onClose, options }) => {
  if (!visible) return null;
  
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable 
        style={styles.modalOverlay} 
        onPress={onClose}
      >
        <View style={styles.messageOptionsContainer}>
          {options.map((option, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.messageOption}
              onPress={() => {
                option.onPress();
                onClose();
              }}
            >
              <Text style={styles.messageOptionText}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
};

const MessageBubble = ({ message, isUser, onLongPress }) => {
  const messageContent = typeof message.content === 'string' 
    ? message.content 
    : typeof message.text === 'string' ? message.text : '';
  
  const messageStatus = typeof message.status === 'string' ? message.status : '';
    
  return (
    <TouchableOpacity
      onLongPress={onLongPress}
      activeOpacity={0.8}
      delayLongPress={200}
    >
      <View style={[
        styles.messageBubbleContainer,
        isUser ? styles.userMessageContainer : styles.otherMessageContainer
      ]}>
        {!isUser && (
          <Image 
            source={{ uri: message.avatar || 'https://randomuser.me/api/portraits/women/44.jpg' }} 
            style={styles.messageAvatar} 
          />
        )}
        <View>
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
          <View style={[
            styles.messageTimeContainer,
            isUser ? { alignSelf: 'flex-end' } : { alignSelf: 'flex-start' }
          ]}>
            <Text style={styles.messageTime}>
              {message.timestamp ? messageUtils.formatMessageTime(message.timestamp) : ''}
            </Text>
            {isUser && messageStatus ? (
              <Text style={styles.messageStatus}>
                {' · '}{messageStatus}
              </Text>
            ) : null}
          </View>
        </View>
      </View>
    </TouchableOpacity>
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

const ChatHeader = ({ avatar, name, isOnline, onBackPress, onVideoPress, onAudioPress, onMorePress }) => {
  const displayName = name || '';
  const avatarUrl = avatar || 'https://randomuser.me/api/portraits/women/44.jpg';
  const onlineStatus = isOnline === true ? 'Online' : 'Offline';
  
  return (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={onBackPress}
        activeOpacity={0.7}
      >
        <Ionicons name="chevron-back" size={24} color="#000" />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.headerProfile} activeOpacity={0.7}>
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
      </TouchableOpacity>
      
      <View style={styles.headerActions}>
        <TouchableOpacity 
          style={styles.headerActionButton} 
          onPress={onAudioPress}
          activeOpacity={0.7}
        >
          <Ionicons name="call" size={22} color="#000" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.headerActionButton} 
          onPress={onVideoPress}
          activeOpacity={0.7}
        >
          <Ionicons name="videocam" size={22} color="#000" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.headerActionButton} 
          onPress={onMorePress}
          activeOpacity={0.7}
        >
          <Ionicons name="ellipsis-vertical" size={22} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const ChatInput = ({ inputText, onChangeText, onSend, sending }) => {
  return (
    <View style={styles.inputContainer}>
      <TouchableOpacity style={styles.attachButton}>
        <Ionicons name="image" size={24} color="#888" />
      </TouchableOpacity>
      
      <View style={styles.textInputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Message"
          value={inputText}
          onChangeText={onChangeText}
          multiline
        />
      </View>
      
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
          <Ionicons name="happy" size={24} color="#888" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const LoadingView = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#6C63FF" />
    <Text style={styles.loadingText}>Loading messages...</Text>
  </View>
);

// -------------------- MAIN COMPONENT --------------------

const ChatDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Extract params with safety checks
  const conversationId = route.params?.conversationId || '';
  const name = route.params?.name || 'Chat';
  const avatar = route.params?.avatar || 'https://randomuser.me/api/portraits/women/44.jpg';
  const isOnline = route.params?.isOnline || false;
  
  console.log('ChatDetailScreen initialized with params:', route.params);
  
  // State
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageOptions, setShowMessageOptions] = useState(false);
  const [initialScrollDone, setInitialScrollDone] = useState(false);
  
  // Refs
  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const hasFetchedRef = useRef(false);
  
  // -------------------- EFFECTS --------------------

  // Initial load
  useEffect(() => {
    console.log('ChatDetailScreen params received:', {
      conversationId,
      name,
      avatar,
      isOnline
    });
    
    // Prevent multiple fetches on remounts
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      
      // Load message history
      loadChatHistory();
      
      // Set up message listener
      const unsubscribe = setupMessageListener();
      return () => unsubscribe();
    }
  }, []);
  
  // Update if conversation ID changes
  useEffect(() => {
    if (hasFetchedRef.current && conversationId) {
      console.log('Conversation ID changed, reloading messages');
      loadChatHistory();
    }
  }, [conversationId]);
  
  // Add effect to scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0 && !initialScrollDone) {
      setInitialScrollDone(true);
      setTimeout(() => {
        scrollToBottom(false);
      }, 300);
    }
  }, [messages]);
  
  // -------------------- DATA OPERATIONS --------------------

  const loadChatHistory = async () => {
    try {
      // Handle both id and conversationId for compatibility
      const chatId = conversationId || '';
      console.log('Loading chat history for ID:', chatId);
      
      const history = await chatService.getChatHistory(chatId);
      
      // Process messages to ensure all values are strings
      const processedHistory = history.map(msg => {
        const processed = messageUtils.processMessage(msg);
        // Add avatar for non-user messages
        if (processed.senderId !== 'me') {
          processed.avatar = avatar;
        }
        return processed;
      });
      
      // Reverse to show latest at bottom
      setMessages(processedHistory.reverse());
      setLoading(false);
      
      // Schedule scrolling to bottom after messages render
      setTimeout(() => {
        scrollToBottom(false);
      }, 300);
    } catch (error) {
      console.error('Failed to load messages:', error, conversationId);
      setLoading(false);
      
      // Use dummy data if there's an error
      const dummyMessages = generateDummyMessages();
      setMessages(dummyMessages);
      
      // Scroll to bottom with dummy messages as well
      setTimeout(() => {
        scrollToBottom(false);
      }, 300);
    }
  };
  
  // Generate dummy messages for testing
  const generateDummyMessages = () => {
    const dummyMessages = [
      {
        id: '1',
        content: 'hi',
        timestamp: '2023-07-20T23:21:00.000Z',
        senderId: conversationId,
        avatar: avatar
      },
      {
        id: '2',
        content: 'kya kar rahe ho',
        timestamp: '2023-07-20T23:23:00.000Z',
        senderId: conversationId,
        avatar: avatar
      },
      {
        id: '3',
        content: 'Just working on some code. How about you?',
        timestamp: '2023-07-20T23:30:00.000Z',
        senderId: 'me',
        status: 'read'
      },
      {
        id: '4',
        content: "I\'m free this weekend. Want to catch up?",
        timestamp: '2023-07-20T23:35:00.000Z',
        senderId: conversationId,
        avatar: avatar
      },
      {
        id: '5',
        content: 'Sure! How about Saturday afternoon?',
        timestamp: '2023-07-20T23:40:00.000Z',
        senderId: 'me',
        status: 'delivered'
      }
    ];
    
    return dummyMessages;
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
      processedMessage.avatar = avatar;
      
      // Add new message to the list
      setMessages(prevMessages => [...prevMessages, processedMessage]);
      
      // Scroll to bottom with a slight delay to allow rendering
      setTimeout(() => {
        scrollToBottom(true);
      }, 100);
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
      
      // Scroll to bottom immediately for sent messages
      scrollToBottom(true);
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Fallback to add message locally if API fails
      const localMessage = {
        id: `local_${Date.now()}`,
        content: messageText,
        senderId: 'me',
        timestamp: new Date().toISOString(),
        status: 'sent'
      };
      
      setMessages(prevMessages => [...prevMessages, localMessage]);
      
      // Scroll to bottom
      scrollToBottom(true);
    } finally {
      setSending(false);
    }
  };
  
  // -------------------- UI HELPERS --------------------
  
  const scrollToBottom = (animated = true) => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated });
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
  
  const handleMessageLongPress = (message) => {
    setSelectedMessage(message);
    setShowMessageOptions(true);
  };
  
  const handleMessageOptions = {
    stickyOnTop: () => {
      console.log('Sticky on top:', selectedMessage.id);
      // Implementation would go here
    },
    remark: () => {
      console.log('Remark on message:', selectedMessage.id);
      // Implementation would go here
    },
    block: () => {
      console.log('Block message:', selectedMessage.id);
      // Implementation would go here
    },
    report: () => {
      console.log('Report message:', selectedMessage.id);
      // Implementation would go here
    }
  };
  
  const messageOptions = [
    { label: 'Sticky on Top', onPress: handleMessageOptions.stickyOnTop },
    { label: 'Remark', onPress: handleMessageOptions.remark },
    { label: 'Block', onPress: handleMessageOptions.block },
    { label: 'Report', onPress: handleMessageOptions.report }
  ];
  
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
      return (
        <MessageBubble 
          message={item} 
          isUser={isUser} 
          onLongPress={() => handleMessageLongPress(item)}
        />
      );
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
        onVideoPress={() => console.log('Video call with:', name)}
        onAudioPress={() => console.log('Audio call with:', name)}
        onMorePress={() => console.log('More options for:', name)}
      />
      
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.chatBackground}>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={messageUtils.generateSafeKey}
            renderItem={renderMessageItem}
            contentContainerStyle={styles.messagesList}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
            showsVerticalScrollIndicator={false}
            maintainVisibleContentPosition={{ 
              minIndexForVisible: 0,
              autoscrollToTopThreshold: 10
            }}
            onContentSizeChange={() => {
              if (messages.length > 0) {
                flatListRef.current?.scrollToEnd({ animated: false });
              }
            }}
            initialNumToRender={15}
            maxToRenderPerBatch={10}
            removeClippedSubviews={false}
          />
          
          {isTyping && <TypingIndicator />}
        </View>
        
        <ChatInput 
          inputText={inputText}
          onChangeText={handleInputChange}
          onSend={sendMessage}
          sending={sending}
        />
      </KeyboardAvoidingView>
      
      <MessageOptionsMenu 
        visible={showMessageOptions}
        onClose={() => setShowMessageOptions(false)}
        options={messageOptions}
      />
    </SafeAreaView>
  );
};

// -------------------- STYLES --------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  chatBackground: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
  },
  headerProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 5,
  },
  headerActionButton: {
    padding: 8,
    marginLeft: 5,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  headerStatus: {
    fontSize: 12,
    color: '#888888',
    marginTop: 2,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 12,
  },
  messageBubbleContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    maxWidth: '80%',
  },
  messageAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
    alignSelf: 'flex-end',
    marginBottom: 15,
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 4,
  },
  userMessage: {
    backgroundColor: '#6C63FF',
  },
  otherMessage: {
    backgroundColor: '#FFFFFF',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: '#000000',
  },
  messageTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageTime: {
    fontSize: 11,
    color: '#888888',
  },
  messageStatus: {
    fontSize: 11,
    color: '#888888',
  },
  dateHeaderContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dateHeaderText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#888888',
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
    borderTopColor: '#EEEEEE',
  },
  attachButton: {
    padding: 8,
  },
  textInputContainer: {
    flex: 1,
    marginHorizontal: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
  },
  textInput: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#6C63FF',
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
    color: '#888888',
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
    backgroundColor: '#888888',
    marginHorizontal: 2,
  },
  typingDotMiddle: {
    marginTop: -4,
  },
  typingText: {
    fontSize: 12,
    color: '#888888',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageOptionsContainer: {
    width: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  messageOption: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  messageOptionText: {
    fontSize: 16,
    color: '#333333',
  },
});

export default ChatDetailScreen; 