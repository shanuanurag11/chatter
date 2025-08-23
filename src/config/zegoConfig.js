// ZEGOCLOUD Configuration
// Note: Credentials are now fetched directly in zegoService.js from API
// This file now only contains static configuration

import uuid from 'react-native-uuid';

export const ZEGO_CONFIG = {
  
  // Server URL (usually doesn't need to be changed)
  SERVER_URL: 'https://webliveroom-test.zego.im',
  
  // Call configuration
  CALL_CONFIG: {
    // Audio call settings
    AUDIO_CALL: {
      enableEchoCancellation: true,
      enableNoiseSuppression: true,
      enableAutomaticGainControl: true,
    },
    
    // Video call settings (if needed later)
    VIDEO_CALL: {
      enableEchoCancellation: true,
      enableNoiseSuppression: true,
      enableAutomaticGainControl: true,
      enableCamera: true,
    },
  },

  // Call invitation configuration
  CALL_INVITATION: {
    // Enable call invitations
    enableCallInvitation: true,
    
    // Enable incoming call notifications
    enableIncomingCallNotification: true,
    
    // Call invitation timeout (in seconds)
    invitationTimeout: 30,
    
    // Ringtone settings
    ringtone: {
      enable: true,
      // You can specify custom ringtone URLs
      incomingCallRingtone: 'https://your-domain.com/ringtone.mp3',
      outgoingCallRingtone: 'https://your-domain.com/outgoing-ringtone.mp3',
    },
    
    // Call invitation UI settings
    ui: {
      // Customize invitation UI
      showUserAvatar: true,
      showUserName: true,
      showCallType: true, // Shows "Audio Call" or "Video Call"
      
      // Custom colors
      primaryColor: '#6C63FF',
      backgroundColor: '#FFFFFF',
      textColor: '#1A1A2E',
    },
  },
};

// Helper function to validate ZEGO credentials (now used with API credentials)
export const validateZegoCredentials = (credentials) => {
  try {
    const { appId, appSign } = credentials;
    
    if (!appId || !appSign) {
      console.error('ZEGO credentials missing appId or appSign');
      return false;
    }
    
    if (typeof appId !== 'number') {
      console.error('ZEGO appId must be a number');
      return false;
    }
    
    if (typeof appSign !== 'string' || appSign.length < 10) {
      console.error('ZEGO appSign must be a valid string');
      return false;
    }
    
    console.log('ZEGO credentials are valid');
    return true;
  } catch (error) {
    console.error('Error validating ZEGO credentials:', error.message);
    return false;
  }
};

// Helper function to generate unique call ID using UUID
export const generateCallID = (callType = 'audio') => {
  const uniqueId = uuid.v4();
  console.log(`Generated ${callType} Call ID (UUID):`, uniqueId);
  return uniqueId;
};

// Helper function to create call invitation data
export const createCallInvitation = (callType, targetUser, currentUser) => {
  return {
    callID: generateCallID(callType),
    callType: callType, // 'audio' or 'video'
    targetUser: {
      userID: targetUser.userID,
      userName: targetUser.userName,
      avatar: targetUser.avatar,
    },
    caller: {
      userID: currentUser.userID,
      userName: currentUser.userName,
      avatar: currentUser.avatar,
    },
    timestamp: Date.now(),
    timeout: ZEGO_CONFIG.CALL_INVITATION.invitationTimeout,
  };
};

export default ZEGO_CONFIG; 