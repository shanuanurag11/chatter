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
  ToastAndroid
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import chatService from '../services/chatService';
import Ionicons from 'react-native-vector-icons/Ionicons';
import peopleService from '../services/peopleService';
import { launchImageLibrary } from 'react-native-image-picker';
import socketService from '../services/socketService';
// import Toast from 'react-native-toast-message';

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
  const isImage = message.message_type === 'image' || message.type === 'image';

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
            {isImage ? (
              <Image
                source={{ uri: message.imageUrl || message.fileUrl || message.content }}
                style={styles.chatImage}
                resizeMode="cover"
              />
            ) : (
              <Text style={[
                styles.messageText,
                isUser ? styles.userMessageText : styles.otherMessageText
              ]}>
                {messageContent}
              </Text>
            )}
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

const ChatInput = ({ inputText, onChangeText, onSend, sending, onAttachImage }) => {
  return (
    <View style={styles.inputContainer}>
      <TouchableOpacity style={styles.attachButton} onPress={onAttachImage}>
        <Ionicons name="image" size={24} color="#888" />
      </TouchableOpacity>
      <View style={styles.textInputContainer}>
        <TextInput
          style={[styles.textInput, { color: '#6C63FF' }]}
          placeholder="Message"
          placeholderTextColor="#888"
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
  const { chat } = route.params;  // Get the complete chat object
  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [imageSending, setImageSending] = useState(false);
  
  const flatListRef = useRef(null);
  const messageListenerUnsubscribe = useRef(null);
  const typingTimeoutRef = useRef(null);  // Changed from state to ref
  
  // Load chat history
  const loadChatHistory = async () => {
    try {
      setLoading(true);
      const history = await chatService.getChatHistory(chat.id);
      // Process messages to ensure all values are strings and sort by timestamp
      const processedHistory = history
        .map(msg => ({
          ...msg,
          content: msg.content || msg.message || '',
          senderId: msg.senderId || msg.from_user_id || '',
          timestamp: msg.timestamp || new Date().toISOString(),
          status: msg.status || 'sent',
          is_my_message: msg.isMyMessage || false
        }))
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      setMessages(processedHistory);
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setLoading(false);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!inputText.trim()) return;
    
    try {
      setSending(true);
      const message = inputText.trim();
      setInputText('');
      
      // Create a temporary message object for immediate display
      const tempMessage = {
        id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: message,
        senderId: chatService.userId,
        timestamp: new Date().toISOString(),
        status: 'sending',
        is_my_message: true
      };
      
      // Add message to local state immediately at the end
      setMessages(prevMessages => [...prevMessages, tempMessage]);
      
      // Send message using the complete chat data
      const response = await chatService.sendMessage(chat.id, message, chat);
      
      // Update the temporary message with the server response
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === tempMessage.id 
            ? {
                ...msg,
                id: response.message_id || response.messageId,
                status: 'sent',
                timestamp: response.timestamp || new Date().toISOString(),
                is_my_message: true
              }
            : msg
        )
      );
      
      // Scroll to bottom after sending
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      // Show error toast
      if (Platform.OS === 'android') {
        ToastAndroid.show('Failed to send message', ToastAndroid.SHORT);
      }
      // Update message status to failed
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.status === 'sending' 
            ? { ...msg, status: 'failed' }
            : msg
        )
      );
    } finally {
      setSending(false);
    }
  };

  // Send image message
  const sendImageMessage = async (imageUri) => {
    if (!imageUri) return;
    try {
      setImageSending(true);
      // Create a temporary image message
      const tempMessage = {
        id: `temp_img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: imageUri,
        senderId: chatService.userId,
        timestamp: new Date().toISOString(),
        status: 'sending',
        is_my_message: true,
        message_type: 'image',
        imageUrl: imageUri
      };
      setMessages(prevMessages => [...prevMessages, tempMessage]);
      // Send image as a message (simulate upload, or upload if you have an endpoint)
      // For now, we send the local uri as content
      const response = await chatService.sendMessage(chat.id, imageUri, chat, 'image');
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === tempMessage.id
            ? {
                ...msg,
                id: response.message_id || response.messageId,
                status: 'sent',
                timestamp: response.timestamp || new Date().toISOString(),
                is_my_message: true,
                message_type: 'image',
                imageUrl: imageUri
              }
            : msg
        )
      );
      scrollToBottom();
    } catch (error) {
      console.error('Error sending image:', error);
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.status === 'sending' && msg.message_type === 'image'
            ? { ...msg, status: 'failed' }
            : msg
        )
      );
    } finally {
      setImageSending(false);
    }
  };

  // Image picker handler
  const handleAttachImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        console.error('ImagePicker Error: ', response.errorMessage);
        return;
      }
      const asset = response.assets && response.assets[0];
      if (asset && asset.uri) {
        sendImageMessage(asset.uri);
      }
    });
  };

  // Set up message listener
  useEffect(() => {
    const unsubscribe = socketService.addMessageListener((event, data) => {
      console.log('Message event received11:', event);
      console.log('Message data11:', data);
      
      if (event === 'message_received' && data.room_id === chat.id) {
        // Create a properly formatted message object
        const newMessage = {
          id: data.id || data.message_id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          content: data.content || data.message || '',
          senderId: data.senderId || data.from_user_id,
          timestamp: data.timestamp || new Date().toISOString(),
          status: 'received',
          is_my_message: false,
          message_type: data.message_type || 'text',
          imageUrl: data.imageUrl
        };

        console.log('Adding new received message:', newMessage);
        
        // Add new message to the messages array
        setMessages(prevMessages => {
          // Check if message already exists to prevent duplicates
          const messageExists = prevMessages.some(msg => msg.id === newMessage.id);
          if (messageExists) {
            console.log('Message already exists, not adding duplicate');
            return prevMessages;
          }
          return [...prevMessages, newMessage];
        });

        // Scroll to bottom after adding new message
        scrollToBottom();
      } else if (event === 'message_sent' && data.room_id === chat.id) {
        console.log('Message sent event received11:', data);
        // Update message status if it was sent by current user
        setMessages(prevMessages => 
          prevMessages.map(msg => {
            if (msg.status === 'sending' && msg.content === data.message) {
              return {
                ...msg,
                id: data.message_id || data.messageId || msg.id,
                status: 'sent',
                timestamp: data.timestamp || new Date().toISOString(),
                is_my_message: true
              };
            }
            return msg;
          })
        );
      }
    });

    messageListenerUnsubscribe.current = unsubscribe;
    return () => {
      if (messageListenerUnsubscribe.current) {
        messageListenerUnsubscribe.current();
      }
    };
  }, [chat.id]);

  // Load initial chat history
  useEffect(() => {
    loadChatHistory();
  }, [chat.id]);
  
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
    setShowOptions(true);
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
    const isUser = item.is_my_message;
    
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
  
  const handleVideoCallPress = async () => {
    try {
      setLoading(true);
      
      // Call the initiateVideoCall method from peopleService
      const callData = await peopleService.initiateVideoCall(chat.id);
      
      setLoading(false);
      
      // Navigate to the VideoCallScreen with the call data
      navigation.navigate('VideoCall', {
        contactName: chat.name,
        contactId: chat.id,
        callID: callData.callId,
        isIncoming: false
      });
    } catch (error) {
      setLoading(false);
      
      // Show error toast
      ToastAndroid.show({
        type: 'error',
        text1: 'Call Failed',
        text2: error.message || 'Could not start video call',
        position: 'bottom',
        visibilityTime: 4000,
      });
      
      console.error('Error starting video call:', error);
    }
  };
  
  // -------------------- RENDER --------------------
  
  if (loading) {
    return <LoadingView />;
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <ChatHeader
        avatar={chat.avatar}
        name={chat.name}
        isOnline={chat.isOnline}
        onBackPress={() => navigation.goBack()}
        onVideoPress={handleVideoCallPress}
        onAudioPress={() => console.log('Audio call with:', chat.name)}
        onMorePress={() => console.log('More options for:', chat.name)}
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
            keyExtractor={(item) => {
              // Use a combination of id and timestamp to ensure uniqueness
              const messageId = item.id || item.messageId || '';
              const timestamp = item.timestamp || Date.now();
              return `msg_${messageId}_${timestamp}`;
            }}
            renderItem={({ item }) => (
              <MessageBubble
                message={item}
                isUser={item.is_my_message}
                onLongPress={() => handleMessageLongPress(item)}
              />
            )}
            onContentSizeChange={() => scrollToBottom()}
            onLayout={() => scrollToBottom()}
          />
          
          {isTyping && <TypingIndicator />}
        </View>
        
        <ChatInput 
          inputText={inputText}
          onChangeText={handleInputChange}
          onSend={sendMessage}
          sending={sending || imageSending}
          onAttachImage={handleAttachImage}
        />
      </KeyboardAvoidingView>
      
      <MessageOptionsMenu 
        visible={showOptions}
        onClose={() => setShowOptions(false)}
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
    marginLeft: 'auto',
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 4,
    borderTopLeftRadius: 16,
  },
  otherMessage: {
    backgroundColor: '#FFFFFF',
    marginRight: 'auto',
    borderTopLeftRadius: 4,
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 4,
    borderTopRightRadius: 16,
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
    color: '#6C63FF',
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
  chatImage: {
    width: 180,
    height: 180,
    borderRadius: 12,
    marginBottom: 4,
    backgroundColor: '#EEE',
  },
});

export default ChatDetailScreen; 