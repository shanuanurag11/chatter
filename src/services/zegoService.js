import ZegoUIKitPrebuiltCallService from '@zegocloud/zego-uikit-prebuilt-call-rn';
import * as ZIM from 'zego-zim-react-native';
import * as ZPNs from 'zego-zpns-react-native';
import { ZEGO_CONFIG } from '../config/zegoConfig';
import userService from './userService';

class ZegoService {
  constructor() {
    this.initialized = false;
    this.currentUser = null;
  }

  /**
   * Initialize ZEGOCLOUD call service
   * This should be called after user login
   */
  async initialize(userID, userName) {
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

      // Initialize ZEGOCLOUD call service
      await ZegoUIKitPrebuiltCallService.init(
        ZEGO_CONFIG.APP_ID,
        ZEGO_CONFIG.APP_SIGN,
        userID,
        userName,
        [ZIM, ZPNs],
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