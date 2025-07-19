import ZegoUIKitPrebuiltCallService from '@zegocloud/zego-uikit-prebuilt-call-rn';
import * as ZIM from 'zego-zim-react-native';
import * as ZPNs from 'zego-zpns-react-native';
import { ZEGO_CONFIG } from '../config/zegoConfig';
import userService from './userService';
import callHistoryService from './callHistoryService';

class ZegoService {
  constructor() {
    this.initialized = false;
    this.currentUser = null;
  }

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
            // Add call invitation configuration with acceptance callbacks
            callInvitationConfig: {
              // Called when a call invitation is accepted (on caller side)
              onIncomingCallAccepted: async (callID, caller, type) => {
                console.log('[ZegoService] Call accepted by recipient:', { callID, caller, type });
                try {
                  // Notify server that call was accepted
                  await callHistoryService.initiateCall({
                    call_id: callID,
                    call_type: type === 1 ? 'video' : 'audio',
                    recipient_id: caller.userID,
                    status: 'accepted'
                  });
                  console.log('[ZegoService] Call acceptance notification sent successfully');
                } catch (error) {
                  console.error('[ZegoService] Error notifying call acceptance:', error);
                }
              },
              // Called when a call invitation is accepted (on called side)
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
              // Called when a call invitation is declined
              onIncomingCallDeclined: async (callID, caller, type) => {
                console.log('[ZegoService] Call declined by recipient:', { callID, caller, type });
                try {
                  // Notify server that call was declined
                  await callHistoryService.endCall({
                    call_id: callID,
                    status: 'declined'
                  });
                  console.log('[ZegoService] Call decline notification sent successfully');
                } catch (error) {
                  console.error('[ZegoService] Error notifying call decline:', error);
                }
              },
              // Called when a call invitation is declined
              onOutgoingCallDeclined: async (callID, callee, type) => {
                console.log('[ZegoService] Outgoing call declined by:', { callID, callee, type });
                try {
                  // Notify server that call was declined
                  await callHistoryService.endCall({
                    call_id: callID,
                    status: 'declined'
                  });
                  console.log('[ZegoService] Outgoing call decline notification sent successfully');
                } catch (error) {
                  console.error('[ZegoService] Error notifying outgoing call decline:', error);
                }
              },
              // Called when a call invitation times out
              onIncomingCallTimeout: async (callID, caller, type) => {
                console.log('[ZegoService] Call timed out:', { callID, caller, type });
                try {
                  // Notify server that call timed out
                  await callHistoryService.endCall({
                    call_id: callID,
                    status: 'timeout'
                  });
                  console.log('[ZegoService] Call timeout notification sent successfully');
                } catch (error) {
                  console.error('[ZegoService] Error notifying call timeout:', error);
                }
              },
              // Called when a call invitation times out
              onOutgoingCallTimeout: async (callID, callee, type) => {
                console.log('[ZegoService] Outgoing call timed out:', { callID, callee, type });
                try {
                  // Notify server that call timed out
                  await callHistoryService.endCall({
                    call_id: callID,
                    status: 'timeout'
                  });
                  console.log('[ZegoService] Outgoing call timeout notification sent successfully');
                } catch (error) {
                  console.error('[ZegoService] Error notifying outgoing call timeout:', error);
                }
              },
            },
          }),
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
}

// Create singleton instance
const zegoService = new ZegoService();
export default zegoService; 