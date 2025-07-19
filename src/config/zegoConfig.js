// ZEGOCLOUD Configuration
// Get these values from your ZEGOCLOUD Admin Console: https://console.zego.im/

import uuid from 'react-native-uuid';

export const ZEGO_CONFIG = {
  // Replace with your actual App ID from ZEGOCLOUD Console
  APP_ID: 229292280, // Your ZEGOCLOUD App ID (number)
  
  // Replace with your actual App Sign from ZEGOCLOUD Console
  APP_SIGN: 'a6e5dd0784398ee99430daf2105c74095d1ff2b0e18540a2bbfa510a0c8ed3da', // Your ZEGOCLOUD App Sign (string)
  
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

// Helper function to validate ZEGO configuration
export const validateZegoConfig = () => {
  const requiredFields = ['APP_ID', 'APP_SIGN'];
  const missingFields = requiredFields.filter(field => !ZEGO_CONFIG[field]);
  
  if (missingFields.length > 0) {
    console.error('Missing required ZEGO configuration fields:', missingFields);
    return false;
  }
  
  if (typeof ZEGO_CONFIG.APP_ID !== 'number') {
    console.error('ZEGO APP_ID must be a number');
    return false;
  }
  
  if (typeof ZEGO_CONFIG.APP_SIGN !== 'string' || ZEGO_CONFIG.APP_SIGN.length < 10) {
    console.error('ZEGO APP_SIGN must be a valid string');
    return false;
  }
  
  console.log('ZEGO configuration is valid');
  return true;
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