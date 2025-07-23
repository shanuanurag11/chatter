import ZegoUIKitPrebuiltCallService from '@zegocloud/zego-uikit-prebuilt-call-rn';
import * as ZIM from 'zego-zim-react-native';
import * as ZPNs from 'zego-zpns-react-native';
import { ZEGO_CONFIG } from '../config/zegoConfig';
import userService from './userService';
import callHistoryService from './callHistoryService';
import navigationService from './navigationService';

class ZegoService {
  constructor() {
    this.initialized = false;
    this.currentUser = null;
    this.navigation = null; // Store navigation reference
  }

  // Set navigation reference
  setNavigation(navigation) {
    this.navigation = navigation;
  }

   handleCallEnd = async (callID, reason, duration) => {
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
        const resetSuccess = await this.zegoResetAfterCall();
        if (resetSuccess) {
          console.log('[ZegoService] ZEGO service reset successfully after call');
        } else {
          console.error('[ZegoService] Failed to reset ZEGO service after call');
        }
      } else {
        console.error('[ZegoService] Failed to update coins and total_seconds from profile API');
      }
    }

    // Navigate back if navigation is available

  };
  /**
   * Initialize ZEGOCLOUD call service
   * This should be called after user login
   */
  async initialize(userID, userName, duration) {
    try {
      console.log('[ZegoService] Initializing with user:', userID, userName);
      
      if (this.initialized) {
        console.log('[ZegoService] Already initialized');
        return true;
      }

      // Validate ZEGO configuration
      if (!ZEGO_CONFIG.APP_ID || !ZEGO_CONFIG.APP_SIGN) {
        throw new Error('ZEGO configuration is missing APP_ID or APP_SIGN');
      }

      // Initialize ZEGOCLOUD call service with call acceptance callbacks
      await ZegoUIKitPrebuiltCallService.init(
        ZEGO_CONFIG.APP_ID,
        ZEGO_CONFIG.APP_SIGN,
        userID,
        userName,
        [ZIM, ZPNs],
        {
          requireConfig: (data) => ({
            timingConfig: {
              isDurationVisible: true,
              onDurationUpdate: (durationInSec) => {
                console.log('Call duration:', durationInSec, 'seconds');
                if (durationInSec === duration) {
                  ZegoUIKitPrebuiltCallService.hangUp(); // Auto-end call at 20 sec
                }
              },
            },
            onCallEnd: (callID, reason, duration) => {
              this.handleCallEnd(callID, reason, duration);
              if (this.navigation) {
                console.log('[ZegoService] Navigating back after call end using passed navigation');
                this.navigation.goBack();
              } else {
                console.log('[ZegoService] Using navigation service to go back');
                navigationService.goBack();
              }
           
            },
          }),
 
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

      this.currentUser = { userID, userName };
      this.initialized = true;
      
      console.log('[ZegoService] Initialized successfully');
      return true;
    } catch (error) {
      console.error('[ZegoService] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Uninitialize ZEGOCLOUD call service
   * This should be called when user logs out
   */
  async uninitialize() {
    try {
      console.log('[ZegoService] Uninitializing...');
      
      if (!this.initialized) {
        console.log('[ZegoService] Not initialized, skipping uninit');
        return true;
      }

      await ZegoUIKitPrebuiltCallService.uninit();
      
      this.initialized = false;
      this.currentUser = null;
      
      console.log('[ZegoService] Uninitialized successfully');
      return true;
    } catch (error) {
      console.error('[ZegoService] Uninitialization failed:', error);
      throw error;
    }
  }

  /**
   * Send call invitation
   * @param {Array} invitees - Array of invitee objects with userID and userName
   * @param {boolean} isVideoCall - Whether this is a video call
   * @param {string} resourceID - Resource ID from ZEGOCLOUD console
   */
  async sendCallInvitation(invitees, isVideoCall = false, resourceID = "zego_call") {
    try {
      console.log('[ZegoService] Sending call invitation:', { invitees, isVideoCall, resourceID });
      
      if (!this.initialized) {
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
  }

  /**
   * Check if service is initialized
   */
  isInitialized() {
    return this.initialized;
  }

  /**
   * Get current user info
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Request system alert window permission (Android)
   */
  async requestSystemAlertWindow() {
    try {
      await ZegoUIKitPrebuiltCallService.requestSystemAlertWindow({
        message: 'We need your consent for the following permissions in order to use the offline call function properly',
        allow: 'Allow',
        deny: 'Deny',
      });
    } catch (error) {
      console.error('[ZegoService] Failed to request system alert window:', error);
    }
  }

  /**
   * Reset ZEGO service after call ends with updated duration
   * This method uninitializes and reinitializes the service with the latest user data
   */
  async zegoResetAfterCall() {
    try {
      console.log('[ZegoService] Resetting ZEGO service after call...');
      
      // Get updated user data with new total_seconds
      const updatedUserData = await userService.getUserData();
      if (!updatedUserData) {
        console.error('[ZegoService] Failed to get updated user data for reset');
        return false;
      }

      // Uninitialize current ZEGO service
      await this.uninitialize();
      
      // Get user details for reinitialization
      const userId = await userService.getUserId();
      const userName = updatedUserData.name || updatedUserData.userName || 'User';
      const newDuration = updatedUserData.total_Seconds || 0;
      
      console.log('[ZegoService] Reinitializing with new duration:', newDuration);
      
      // Reinitialize with updated duration
      await this.initialize(userId, userName, newDuration);
      
      console.log('[ZegoService] ZEGO service reset successfully');
      return true;
    } catch (error) {
      console.error('[ZegoService] Error resetting ZEGO service after call:', error);
      return false;
    }
  }
}

// Create singleton instance
const zegoService = new ZegoService();
export default zegoService; 