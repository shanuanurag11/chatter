import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import zegoInvitationService from '../services/zegoInvitationService';
import userService from '../services/userService';
import callHistoryService from '../services/callHistoryService';

const { width, height } = Dimensions.get('window');

// Theme colors
const COLORS = {
  primary: '#6C63FF',
  primaryLight: '#8E64FF',
  success: '#4CD964',
  error: '#FF3B30',
  background: '#000000',
  surface: '#FFFFFF',
  textPrimary: '#FFFFFF',
  textSecondary: '#CCCCCC',
};

const IncomingCallScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { invitation } = route.params;

  const [callerInfo, setCallerInfo] = useState(null);
  const [callType, setCallType] = useState('audio');
  const [isProcessing, setIsProcessing] = useState(false);
  const [callInitiated, setCallInitiated] = useState(false);

  // Function to notify server about call initiation
  const notifyCallInitiation = async () => {
    if (!invitation?.callID || callInitiated) {
      console.log('[IncomingCallScreen] Skipping call initiation notification:', { 
        callID: invitation?.callID, 
        callInitiated 
      });
      return;
    }

    try {
      console.log('[IncomingCallScreen] Notifying server about call initiation');
      
      await callHistoryService.initiateCall({
        call_id: invitation.callID,
        call_type: callType,
        recipient_id: invitation.caller?.userID,
        status: 'initiated'
      });

      setCallInitiated(true);
      console.log('[IncomingCallScreen] Call initiation notification successful');
    } catch (error) {
      console.error('[IncomingCallScreen] Error notifying call initiation:', error);
      // Don't block the call if the API fails
    }
  };

  // Function to notify server about call end
  const notifyCallEnd = async () => {
    console.log('[IncomingCallScreen] notifyCallEnd called');
    if (!invitation?.callID) {
      console.log('[IncomingCallScreen] Skipping call end notification - no callID');
      return;
    }

    try {
      console.log('[IncomingCallScreen] Notifying server about call end');
      
      await callHistoryService.endCall({
        call_id: invitation.callID,
      });

      console.log('[IncomingCallScreen] Call end notification successful');
    } catch (error) {
      console.error('[IncomingCallScreen] Error notifying call end:', error);
      // Don't block navigation if the API fails
    }
  };

  useEffect(() => {
    if (invitation) {
      // Use consistent data structure from ZEGOCLOUD invitation
      setCallerInfo({
        userID: invitation.caller?.userID,
        userName: invitation.caller?.userName || 'Unknown',
        avatar: invitation.caller?.avatar || '',
      });
      setCallType(invitation.callType || 'audio');
    }
  }, [invitation]);

  // Cleanup effect to handle component unmount
  useEffect(() => {
    return () => {
      // If call was initiated but component is unmounting, notify server about call end
      if (callInitiated && invitation?.callID) {
        console.log('[IncomingCallScreen] Component unmounting, notifying call end');
        notifyCallEnd();
      }
    };
  }, [callInitiated, invitation?.callID]);

  const handleAcceptCall = async () => {
    try {
      setIsProcessing(true);
      
      // Accept the call invitation using ZEGOCLOUD's built-in system
      await zegoInvitationService.acceptCallInvitation(invitation);
      
      // Notify server about call initiation
      await notifyCallInitiation();
      
      // Get current user data directly from storage (same as ChatListScreen)
      const currentUser = await userService.getUserData();
      console.log("User data from storage:", currentUser);

      if (!currentUser || !currentUser.id) {
        console.error('No valid user data found in storage');
        Alert.alert('Error', 'Please login again to continue');
        navigation.goBack();
        return;
      }

      // Get user ID directly (same as ChatListScreen)
      const currentUserId = currentUser.id;
      console.log("Using user_id for accepting ZEGOCLOUD call:", currentUserId);
      
      // Navigate to audio call screen with correct user data
      navigation.navigate('AudioCall', {
        userID: currentUserId, // Current user (who is accepting the call)
        userName: currentUser.name || currentUser.username || 'User',
        callID: invitation.callID,
        targetUserID: invitation.caller?.userID, // Caller (who initiated the call)
        targetUserName: invitation.caller?.userName || 'User',
      });
    } catch (error) {
      console.error('Error accepting ZEGOCLOUD call:', error);
      Alert.alert('Error', 'Failed to accept call. Please try again.');
      navigation.goBack();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeclineCall = async () => {
    try {
      setIsProcessing(true);
      
      // Decline the call invitation using ZEGOCLOUD's built-in system
      await zegoInvitationService.declineCallInvitation(invitation);
      
      // Notify server about call end
      await notifyCallEnd();
      
      // Show declined message and go back
      Alert.alert('Call Declined', 'You declined the incoming call.');
      navigation.goBack();
    } catch (error) {
      console.error('Error declining ZEGOCLOUD call:', error);
      navigation.goBack();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBackPress = async () => {
    // Automatically decline the call when user presses back
    await handleDeclineCall();
  };

  if (!callerInfo) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading call information...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      <LinearGradient
        colors={[COLORS.background, '#1a1a1a']}
        style={styles.gradientBackground}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
      >
        {/* Caller Information */}
        <View style={styles.callerInfoContainer}>
          <View style={styles.avatarContainer}>
            <Image
              source={
                callerInfo.avatar
                  ? { uri: callerInfo.avatar }
                  : require('../assets/images/user.png')
              }
              style={styles.avatar}
            />
            <View style={styles.avatarRing} />
          </View>
          
          <Text style={styles.callerName}>{callerInfo.userName}</Text>
          <Text style={styles.callType}>
            {callType === 'audio' ? 'Audio Call' : 'Video Call'}
          </Text>
          <Text style={styles.callStatus}>Incoming call...</Text>
        </View>

        {/* Call Actions */}
        <View style={styles.actionsContainer}>
          {/* Decline Button */}
          <TouchableOpacity
            style={[styles.actionButton, styles.declineButton]}
            onPress={handleDeclineCall}
            disabled={isProcessing}
          >
            <Ionicons name="call" size={32} color={COLORS.surface} />
          </TouchableOpacity>

          {/* Accept Button */}
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={handleAcceptCall}
            disabled={isProcessing}
          >
            <Ionicons name="call" size={32} color={COLORS.surface} />
          </TouchableOpacity>
        </View>

        {/* Processing Indicator */}
        {isProcessing && (
          <View style={styles.processingContainer}>
            <Text style={styles.processingText}>
              {isProcessing ? 'Processing...' : ''}
            </Text>
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  gradientBackground: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.textPrimary,
    fontSize: 16,
  },
  callerInfoContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 30,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.surface,
  },
  avatarRing: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    opacity: 0.6,
  },
  callerName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  callType: {
    fontSize: 18,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  callStatus: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 60,
  },
  actionButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  declineButton: {
    backgroundColor: COLORS.error,
    transform: [{ rotate: '135deg' }],
  },
  acceptButton: {
    backgroundColor: COLORS.success,
  },
  processingContainer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  processingText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
});

export default IncomingCallScreen; 