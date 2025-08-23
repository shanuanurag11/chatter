import ZegoUIKitPrebuiltCallService from '@zegocloud/zego-uikit-prebuilt-call-rn';
import * as ZIM from 'zego-zim-react-native';
import * as ZPNs from 'zego-zpns-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchZegoCredentialsFromAPI } from '../api/zegoApi';
import { validateZegoCredentials } from '../config/zegoConfig';
import userService from './userService';
import callHistoryService from './callHistoryService';
import navigationService from './navigationService';

// Create a functional service using closures to maintain state
const createZegoService = () => {
  let initialized = false;
  let currentUser = null;
  let navigation = null;

  const handleCallEnd = async (callID, reason, duration) => {
    console.log('[ZegoService] onCallEnd called**');

    // Notify server about call end
    try {
      await callHistoryService.endCall({
        call_id: callID,
        total_seconds: duration || 0
      });
      console.log('[ZegoService] Call end notification sent successfully', duration);
    } catch (error) {
      console.error('[ZegoService] Error notifying call end:', error);
    }
    
    const total_seconds = duration;
    if (total_seconds && total_seconds > 0) {
      console.log('[ZegoService] Updating coins and total_seconds from profile API after call...');
      const updated = await userService.updateCoinsAndTotalSecondsFromProfile();
      if (updated) {
        console.log('[ZegoService] Coins and total_seconds updated successfully from profile API');
        
        // Reset ZEGO service with updated duration
        try {
          const resetSuccess = await zegoResetAfterCall();
          if (resetSuccess) {
            console.log('[ZegoService] ZEGO service reset successfully after call');
          } else {
            console.error('[ZegoService] Failed to reset ZEGO service after call');
          }
        } catch (error) {
          console.error('[ZegoService] Error resetting ZEGO service after call:', error);
          return false;
        }
      } else {
        console.error('[ZegoService] Failed to update coins and total_seconds from profile API');
      }
    }

    // Navigate back if navigation is available
    if (navigation) {
      navigation.goBack();
    }
  };

  // Set navigation reference
  const setNavigation = (nav) => {
    navigation = nav;
  };

  /**
   * Initialize ZEGOCLOUD call service
   * This should be called after user login
   */
  const initialize = async (userID, userName, duration) => {
    try {
      console.log('[ZegoService] Initializing with user:', userID, userName);
      
      if (initialized) {
        console.log('[ZegoService] Already initialized');
        return true;
      }

      // Fetch fresh ZEGO credentials from API
      let zegoCredentials;
      try {
        console.log('[ZegoService] Fetching ZEGO credentials from API...');
        zegoCredentials = await fetchZegoCredentialsFromAPI();
        
        // Store credentials in AsyncStorage for VideoCallScreen
        await AsyncStorage.setItem('zegoCredentials', JSON.stringify(zegoCredentials));
        console.log('[ZegoService] ZEGO credentials stored in AsyncStorage--->',zegoCredentials);
      } catch (credError) {
        console.error('[ZegoService] Failed to fetch ZEGO credentials:', credError);
        throw new Error('Failed to fetch ZEGO credentials: ' + credError.message);
      }

      // Validate ZEGO credentials
      if (!validateZegoCredentials(zegoCredentials)) {
        throw new Error('ZEGO credentials validation failed');
      }
      console.log('[ZegoService] Using ZEGO credentials from API:', { appId: zegoCredentials.appId });
      
      // Initialize ZEGOCLOUD call service with call acceptance callbacks
      await ZegoUIKitPrebuiltCallService.init(
        zegoCredentials.appId,
        zegoCredentials.appSign,
        userID,
        userName,
        [ZIM, ZPNs],
        {
          requireConfig: (data) => {
            const config = {
              timingConfig: {
                isDurationVisible: true,
                onDurationUpdate: (durationInSec) => {
                  console.log('Call duration:', durationInSec, 'seconds');
                  if (durationInSec === duration) {
                    ZegoUIKitPrebuiltCallService.hangUp(); // Auto-end call at duration limit
                  }
                },
              },
              onCallEnd: (callID, reason, duration) => {
                console.log("########CallWithInvitation onCallEnd", callID, reason, duration);
                
                try {
                  try{
                    handleCallEnd(callID, reason, duration);
                  }catch{}
                  
                  // Navigate back after call ends using navigationService
                  console.log('[ZegoService] Navigating back using navigationService');
                  try{navigationService.goBack();}catch(error){console.error('[ZegoService] Error navigating back:', error);}
                  try{navigationService.navigate("Message")}catch{r}
                  
                } catch (error) {
                  console.error('[ZegoService] Error in onCallEnd:', error);
                }
              },
            };
            return config;
          },
 
          onOutgoingCallAccepted: async (callID, callee, type) => {
            console.log('[ZegoService] Outgoing call accepted by:', { callID, callee, type });
            try {
              // Notify server that call was accepted
              await callHistoryService.initiateCall({
                call_id: callID,
                call_type: type === 1 ? 'video' : 'audio',
                recipient_id: callee.userID,
                status: 'accepted'
              });
              console.log('[ZegoService] Outgoing call acceptance notification sent successfully');
            } catch (error) {
              console.error('[ZegoService] Error notifying outgoing call acceptance:', error);
            }
          },
          
        },
        {
          // ringtoneConfig: {
          //   incomingCallFileName: 'zego_incoming.mp3',
          //   outgoingCallFileName: 'zego_outgoing.mp3',
          // },
          androidNotificationConfig: {
            channelID: "ZegoUIKit",
            channelName: "ZegoUIKit",
          },
        }
      );

      currentUser = { userID, userName };
      initialized = true;
      
      console.log('[ZegoService] Initialized successfully');
      return true;
    } catch (error) {
      console.error('[ZegoService] Initialization failed:', error);
      throw error;
    }
  };

  /**
   * Uninitialize ZEGOCLOUD call service
   * This should be called when user logs out
   */
  const uninitialize = async () => {
    try {
      console.log('[ZegoService] Uninitializing...');
      
      if (!initialized) {
        console.log('[ZegoService] Not initialized, skipping uninit');
        return true;
      }

      await ZegoUIKitPrebuiltCallService.uninit();
      
      initialized = false;
      currentUser = null;
      
      console.log('[ZegoService] Uninitialized successfully');
      return true;
    } catch (error) {
      console.error('[ZegoService] Uninitialization failed:', error);
      throw error;
    }
  };

  /**
   * Send call invitation
   * @param {Array} invitees - Array of invitee objects with userID and userName
   * @param {boolean} isVideoCall - Whether this is a video call
   * @param {string} resourceID - Resource ID from ZEGOCLOUD console
   */
  const sendCallInvitation = async (invitees, isVideoCall = false, resourceID = "zego_call") => {
    try {
      console.log('[ZegoService] Sending call invitation:', { invitees, isVideoCall, resourceID });
      
      if (!initialized) {
        throw new Error('ZEGOCLOUD service not initialized');
      }

      // Create call invitation button component
      const { ZegoSendCallInvitationButton } = await import('@zegocloud/zego-uikit-prebuilt-call-rn');
      
      return {
        ZegoSendCallInvitationButton,
        invitees,
        isVideoCall,
        resourceID
      };
    } catch (error) {
      console.error('[ZegoService] Failed to send call invitation:', error);
      throw error;
    }
  };

  /**
   * Check if service is initialized
   */
  const isInitialized = () => {
    return initialized;
  };

  /**
   * Get current user info
   */
  const getCurrentUser = () => {
    return currentUser;
  };

  /**
   * Request system alert window permission (Android)
   */
  const requestSystemAlertWindow = async () => {
    try {
      await ZegoUIKitPrebuiltCallService.requestSystemAlertWindow({
        message: 'We need your consent for the following permissions in order to use the offline call function properly',
        allow: 'Allow',
        deny: 'Deny',
      });
    } catch (error) {
      console.error('[ZegoService] Failed to request system alert window:', error);
    }
  };

  /**
   * Reset ZEGO service after call ends with updated duration
   * This method uninitializes and reinitializes the service with the latest user data
   */
  const zegoResetAfterCall = async () => {
    try {
      console.log('[ZegoService] Resetting ZEGO service after call...');
      
      // Get updated user data with new total_seconds
      const updatedUserData = await userService.getUserData();
      if (!updatedUserData) {
        console.error('[ZegoService] Failed to get updated user data for reset');
        return false;
      }

      // Uninitialize current ZEGO service
      await uninitialize();
      
      // Get user details for reinitialization
      const userId = await userService.getUserId();
      const userName = updatedUserData.name || updatedUserData.userName || 'User';
      const newDuration = updatedUserData.total_seconds || 0;
      
      console.log('[ZegoService] Reinitializing with new duration:', newDuration);
      
      // Reinitialize with updated duration
      await initialize(userId, userName, newDuration);
      
      console.log('[ZegoService] ZEGO service reset successfully');
      return true;
    } catch (error) {
      console.error('[ZegoService] Error resetting ZEGO service after call:', error);
      return false;
    }
  };

  return {
    setNavigation,
    handleCallEnd,
    initialize,
    uninitialize,
    sendCallInvitation,
    isInitialized,
    getCurrentUser,
    requestSystemAlertWindow,
    zegoResetAfterCall
  };
};

// Create singleton instance
const zegoService = createZegoService();
export default zegoService; 