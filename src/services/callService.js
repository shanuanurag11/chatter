import axios from 'axios';
import { Platform, PermissionsAndroid } from 'react-native';
import { request, PERMISSIONS, RESULTS, check, requestMultiple } from 'react-native-permissions';

// Constants
const API_BASE_URL = 'https://api.example.com/v1'; // Replace with your actual API endpoint
const ZEGO_APP_ID = 1234567890; // Your ZegoCloud App ID - replace with actual ID
const ZEGO_APP_SIGN = 'cdf3b371814568ecee82f84aaa9ba625506d88ebea3d7f5bd20f94da55bc7dd6'; // Replace with your actual App Sign

// Environment detection - force true for now since we're in development
// This ensures our mock functionality always works
const isDev = true;

class CallService {
  constructor() {
    this.initialized = false;
    this.activeCall = null;
    this.callStartTime = null;
    this.zegoEngine = null;
    this.zegoInitError = null;
  }

  /**
   * Initialize the call service
   * @returns {Promise<boolean>} - Success status
   */
  async initialize() {
    try {
      console.log('[CallService] initialize() called, current initialized status:', this.initialized);
      if (this.initialized) return true;
      
      // Simply check permissions
      console.log('[CallService] Checking camera and microphone permissions...');
      const permissionsGranted = await this._checkPermissions(['camera', 'microphone']);
      console.log('[CallService] Permissions granted?', permissionsGranted);
      
      if (!permissionsGranted) {
        console.error('[CallService] Permissions denied for camera/microphone');
        throw new Error('Camera and microphone permissions are required for video calls');
      }
      
      // Temporarily use fallback implementation to ensure the flow works
      console.log('[CallService] Using fallback implementation for calls');
      this.zegoEngine = null;
      this.zegoInitError = "Using fallback by design for testing";
      
      /* 
      // Try to initialize ZegoCloud - We'll enable this after fixing the flow
      try {
        console.log('[CallService] Attempting to initialize ZegoCloud');
        // Check if ZegoExpressEngine is available
        const zegoPackage = require('zego-express-engine-reactnative');
        console.log('[CallService] ZegoExpressEngine package loaded:', zegoPackage ? 'yes' : 'no');
        
        const ZegoExpressEngine = zegoPackage.default;
        console.log('[CallService] ZegoExpressEngine class available:', ZegoExpressEngine ? 'yes' : 'no');
        
        // Prepare parameters
        const appID = parseInt(ZEGO_APP_ID, 10);
        console.log('[CallService] Using App ID:', appID, 'type:', typeof appID);
        
        // Initialize the engine
        this.zegoEngine = await ZegoExpressEngine.createEngineWithProfile({
          appID: appID,
          scenario: 0, // General scenario
        });
        
        console.log('[CallService] ZegoCloud initialized successfully:', this.zegoEngine ? 'yes' : 'no');
      } catch (error) {
        console.warn('[CallService] Could not initialize ZegoCloud:', error);
        console.log('[CallService] Error details:', error.message);
        console.log('[CallService] Error stack:', error.stack);
        console.log('[CallService] Will use fallback implementation');
        this.zegoEngine = null;
        this.zegoInitError = error.message;
      }
      */
      
      this.initialized = true;
      console.log('[CallService] Call service initialized successfully');
      return true;
    } catch (error) {
      console.error('[CallService] Failed to initialize call service:', error);
      throw new Error(`Failed to initialize call service: ${error.message}`);
    }
  }

  /**
   * Check if ZegoCloud is properly initialized
   * @returns {boolean} - Whether ZegoCloud is available
   */
  isZegoAvailable() {
    console.log('[CallService] isZegoAvailable called, result:', !!this.zegoEngine);
    return !!this.zegoEngine;
  }
  
  /**
   * Get error message from ZegoCloud initialization attempt
   * @returns {string|null} - Error message or null if no error
   */
  getZegoInitError() {
    return this.zegoInitError;
  }

  /**
   * Request a call ID to start a call with a recipient
   * @param {string} recipientId - ID of the call recipient
   * @param {string} callType - Type of call: 'audio' or 'video'
   * @returns {Promise<object>} - Call data object
   */
  async requestCallId(recipientId, callType = 'video') {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      
      // Check permissions based on call type
      if (callType === 'video') {
        const permissionsGranted = await this._checkPermissions(['camera', 'microphone']);
        if (!permissionsGranted) {
          throw new Error('Camera and microphone permissions are required for video calls');
        }
      } else {
        const permissionsGranted = await this._checkPermissions(['microphone']);
        if (!permissionsGranted) {
          throw new Error('Microphone permission is required for audio calls');
        }
      }
      
      // In development, simulate API call
      if (isDev) {
        console.log(`[DEV] Requesting ${callType} call to recipient: ${recipientId}`);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock call data
        const mockCallId = `call_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const mockToken = this._generateMockToken();
        
        this.activeCall = {
          callId: mockCallId,
          recipientId,
          callType,
          token: mockToken,
          status: 'connecting'
        };
        
        return {
          success: true,
          callId: mockCallId,
          token: mockToken
        };
      }
      
      // In production, make actual API call
      const response = await axios.post(`${API_BASE_URL}/calls`, {
        recipientId,
        callType
      });
      
      if (response.data && response.data.success) {
        this.activeCall = {
          callId: response.data.callId,
          recipientId,
          callType,
          token: response.data.token,
          status: 'connecting'
        };
        
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to request call ID');
      }
    } catch (error) {
      console.error('Error requesting call ID:', error);
      
      // Handle different error types
      if (error.response) {
        // Server responded with an error status
        if (error.response.status === 404) {
          throw new Error('User not found or not available for calls');
        } else if (error.response.status === 403) {
          throw new Error('You do not have permission to call this user');
        } else if (error.response.status === 429) {
          throw new Error('Too many call attempts. Please try again later');
        } else {
          throw new Error(error.response.data?.message || 'Server error when requesting call');
        }
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('No response from server. Please check your connection');
      } else {
        // Other errors
        throw error;
      }
    }
  }

  /**
   * Join an existing call
   * @param {string} callId - ID of the call to join
   * @returns {Promise<object>} - Call data object
   */
  async joinCall(callId) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      
      // Check permissions
      const permissionsGranted = await this._checkPermissions(['camera', 'microphone']);
      if (!permissionsGranted) {
        throw new Error('Camera and microphone permissions are required to join a call');
      }
      
      // In development, simulate API call
      if (isDev) {
        console.log(`[DEV] Joining call: ${callId}`);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock token
        const mockToken = this._generateMockToken();
        
        this.activeCall = {
          callId,
          token: mockToken,
          status: 'connecting'
        };
        
        return {
          success: true,
          callId,
          token: mockToken
        };
      }
      
      // In production, make actual API call
      const response = await axios.post(`${API_BASE_URL}/calls/${callId}/join`);
      
      if (response.data && response.data.success) {
        this.activeCall = {
          callId: response.data.callId,
          token: response.data.token,
          status: 'connecting'
        };
        
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to join call');
      }
    } catch (error) {
      console.error('Error joining call:', error);
      
      // Handle different error types
      if (error.response) {
        if (error.response.status === 404) {
          throw new Error('Call not found or has ended');
        } else if (error.response.status === 403) {
          throw new Error('You do not have permission to join this call');
        } else {
          throw new Error(error.response.data?.message || 'Server error when joining call');
        }
      } else if (error.request) {
        throw new Error('No response from server. Please check your connection');
      } else {
        throw error;
      }
    }
  }

  /**
   * End an active call
   * @param {string} callId - ID of the call to end
   * @param {string} reason - Reason for ending the call
   * @returns {Promise<object>} - Call end result
   */
  async endCall(callId, reason = 'userEnded') {
    try {
      console.log(`[CallService] Ending call: ${callId}, reason: ${reason}`);
      
      if (!this.activeCall || this.activeCall.callId !== callId) {
        console.warn(`[CallService] No matching active call found for ID: ${callId}`);
        return { success: false, message: 'No active call with this ID' };
      }
      
      const callDuration = this.callStartTime ? Math.floor((Date.now() - this.callStartTime) / 1000) : 0;
      console.log(`[CallService] Call duration: ${callDuration} seconds`);
      
      // If ZegoCloud is available, properly leave the room
      if (this.zegoEngine) {
        try {
          console.log('[CallService] Leaving ZegoCloud room');
          // In a real implementation with ZegoCloud:
          this.zegoEngine.stopPublishingStream();
          this.zegoEngine.stopPlayingStream('');
          this.zegoEngine.logoutRoom(callId);
        } catch (error) {
          console.error('[CallService] Error leaving ZegoCloud room:', error);
        }
      }
      
      // In development, simulate API call
      if (isDev) {
        console.log(`[DEV] Ending call: ${callId}, reason: ${reason}`);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Reset active call
        const endedCall = { ...this.activeCall };
        this.activeCall = null;
        this.callStartTime = null;
        
        return {
          success: true,
          callId,
          duration: callDuration,
          reason
        };
      }
      
      // In production, make actual API call
      const response = await axios.post(`${API_BASE_URL}/calls/${callId}/end`, {
        reason,
        duration: callDuration
      });
      
      if (response.data && response.data.success) {
        // Reset active call
        this.activeCall = null;
        this.callStartTime = null;
        
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to end call');
      }
    } catch (error) {
      console.error('[CallService] Error ending call:', error);
      
      // Reset active call even on error
      this.activeCall = null;
      this.callStartTime = null;
      
      return {
        success: false,
        message: error.message || 'Error ending call'
      };
    }
  }

  /**
   * Get the current active call data
   * @returns {object|null} - Current call data or null if no active call
   */
  getCurrentCall() {
    return this.activeCall;
  }

  /**
   * Mark a call as connected
   * @param {string} callId - ID of the call to mark as connected
   */
  setCallConnected(callId) {
    console.log('[CallService] setCallConnected called for callId:', callId);
    
    if (this.activeCall && this.activeCall.callId === callId) {
      console.log('[CallService] Marking call as connected:', callId);
      this.activeCall.status = 'connected';
      this.callStartTime = Date.now();
      
      // If ZegoCloud is available, report statistics about the call
      if (this.zegoEngine) {
        console.log('[CallService] ZegoCloud available, would report call statistics here');
        // In a real implementation, you might want to start collecting call quality metrics
        // this.zegoEngine.startPublishingStream();
        // this.zegoEngine.startPlayingStream();
      }
      
      return true;
    }
    
    console.warn('[CallService] Call not found or already connected:', callId);
    return false;
  }

  /**
   * Check required permissions
   * @param {Array<string>} permissions - Array of permissions to check: 'camera', 'microphone'
   * @returns {Promise<boolean>} - True if all permissions granted
   */
  async _checkPermissions(permissions) {
    try {
      console.log('[CallService] _checkPermissions called for:', permissions, 'Platform:', Platform.OS);
      
      if (Platform.OS === 'android') {
        // Get Android API level to determine approach
        const apiLevel = Platform.Version;
        console.log('[CallService] Android API level:', apiLevel);
        
        if (apiLevel >= 33) {
          // For Android 13+, use react-native-permissions library
          console.log('[CallService] Using Android 13+ permission approach with react-native-permissions');
          const permissionsToCheck = [];
          
          if (permissions.includes('camera')) {
            permissionsToCheck.push(PERMISSIONS.ANDROID.CAMERA);
          }
          
          if (permissions.includes('microphone')) {
            permissionsToCheck.push(PERMISSIONS.ANDROID.RECORD_AUDIO);
          }
          
          if (permissionsToCheck.length === 0) {
            return true; // No permissions needed
          }
          
          const results = await requestMultiple(permissionsToCheck);
          console.log('[CallService] Android 13+ permission results:', results);
          
          // Check if all requested permissions are granted
          let allGranted = true;
          for (const permission of permissionsToCheck) {
            if (results[permission] !== RESULTS.GRANTED) {
              allGranted = false;
              break;
            }
          }
          
          return allGranted;
        } else {
          // For older Android versions, use the direct approach
          console.log('[CallService] Using standard Android permission approach');
          // Continue with the existing implementation for older Android versions
          const results = await Promise.all(
            permissions.map(async (permission) => {
              if (permission === 'camera') {
                return await PermissionsAndroid.request(
                  PermissionsAndroid.PERMISSIONS.CAMERA,
                  {
                    title: 'Camera Permission',
                    message: 'This app needs access to your camera for video calls.',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                  }
                );
              } else if (permission === 'microphone') {
                return await PermissionsAndroid.request(
                  PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                  {
                    title: 'Microphone Permission',
                    message: 'This app needs access to your microphone for calls.',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                  }
                );
              }
              return null;
            })
          );
          
          console.log('[CallService] Android permission results:', results);
          const allGranted = results.every(
            result => result === PermissionsAndroid.RESULTS.GRANTED || result === 'granted'
          );
          
          return allGranted;
        }
      } else if (Platform.OS === 'ios') {
        // For iOS, use the react-native-permissions approach
        const results = await Promise.all(
          permissions.map(async (permission) => {
            if (permission === 'camera') {
              return await request(PERMISSIONS.IOS.CAMERA);
            } else if (permission === 'microphone') {
              return await request(PERMISSIONS.IOS.MICROPHONE);
            }
            return null;
          })
        );
        
        console.log('[CallService] iOS permission results:', results);
        const allGranted = results.every(result => result === RESULTS.GRANTED);
        return allGranted;
      }
      
      return false;
    } catch (error) {
      console.error('[CallService] Error checking permissions:', error);
      return false;
    }
  }

  /**
   * Generate a mock token for development
   * @returns {string} Mock token
   */
  _generateMockToken() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    const token = `dev_token_${timestamp}_${random}`;
    
    return `mock_token_${token}`;
  }

  /**
   * Request a random video call
   * @returns {Promise<object>} - Random call data
   */
  async requestRandomCall() {
    try {
      console.log('[CallService] requestRandomCall() called, initialized:', this.initialized);
      
      if (!this.initialized) {
        console.log('[CallService] Not initialized, calling initialize()');
        await this.initialize();
      }
      
      // Directly check permissions without additional logic - simpler approach that was working before
      console.log('[CallService] Checking permissions for requestRandomCall');
      const permissionsGranted = await this._checkPermissions(['camera', 'microphone']);
      console.log('[CallService] Permissions check result:', permissionsGranted);
      
      if (!permissionsGranted) {
        console.error('[CallService] Permissions denied for camera/microphone');
        throw new Error('Camera and microphone permissions are required for video calls. Please grant them and try again.');
      }
      
      // If permissions are granted, proceed with call setup
      console.log('[CallService] Using development mode for call simulation');
      
      // Generate random user data for simulation
      const randomId = `random_${Math.floor(Math.random() * 10000)}`;
      const randomNames = ['Jessica', 'Emma', 'Oliver', 'James', 'Sophia', 'Mia', 'Noah', 'Ava', 'Liam'];
      const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
      
      // Mock call data
      const mockCallId = `random_call_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const mockToken = this._generateMockToken();
      
      // Set active call
      this.activeCall = {
        callId: mockCallId,
        recipientId: randomId,
        recipientName: randomName,
        callType: 'video',
        token: mockToken,
        status: 'connecting',
        isRandom: true
      };
      
      // Set call start time when connecting
      this.callStartTime = Date.now();
      
      console.log('[CallService] Random call data generated:', { callId: mockCallId, recipientId: randomId, recipientName: randomName });
      
      // Simplified response - reducing artificial delay to 500ms to improve responsiveness
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        success: true,
        callId: mockCallId,
        recipientId: randomId,
        recipientName: randomName,
        token: mockToken,
        isRandom: true
      };
    } catch (error) {
      console.error('[CallService] Error requesting random call:', error);
      throw error;
    }
  }
  
  /**
   * Toggle camera during a call
   * @returns {Promise<boolean>} Success status
   */
  async toggleCamera() {
    try {
      if (!this.activeCall) {
        throw new Error('No active call');
      }
      
      // In a real implementation with ZegoCloud:
      // this.zegoEngine.enableCamera(!isCameraEnabled);
      
      console.log('[DEV] Toggling camera');
      return true;
    } catch (error) {
      console.error('Error toggling camera:', error);
      return false;
    }
  }
  
  /**
   * Toggle microphone during a call
   * @returns {Promise<boolean>} Success status
   */
  async toggleMicrophone() {
    try {
      if (!this.activeCall) {
        throw new Error('No active call');
      }
      
      // In a real implementation with ZegoCloud:
      // this.zegoEngine.muteMicrophone(!isMicMuted);
      
      console.log('[DEV] Toggling microphone');
      return true;
    } catch (error) {
      console.error('Error toggling microphone:', error);
      return false;
    }
  }
  
  /**
   * Switch speaker during a call
   * @returns {Promise<boolean>} Success status
   */
  async toggleSpeaker() {
    try {
      if (!this.activeCall) {
        throw new Error('No active call');
      }
      
      // In a real implementation with ZegoCloud:
      // this.zegoEngine.setAudioRouteToSpeaker(!isSpeakerOn);
      
      console.log('[DEV] Toggling speaker');
      return true;
    } catch (error) {
      console.error('Error toggling speaker:', error);
      return false;
    }
  }

  /**
   * Debug permissions status - use to check current status without making requests
   * @returns {Promise<object>} Current permission statuses
   */
  async debugPermissionStatus() {
    try {
      console.log('[CallService] Checking current permission status');
      console.log('[CallService] Platform:', Platform.OS, 'API Level:', Platform.Version);
      
      // Log all possible permission values for reference
      console.log('[CallService] Permission result values:', {
        GRANTED: RESULTS.GRANTED,
        DENIED: RESULTS.DENIED,
        BLOCKED: RESULTS.BLOCKED,
        UNAVAILABLE: RESULTS.UNAVAILABLE,
        LIMITED: RESULTS.LIMITED,
        ANDROID_GRANTED: PermissionsAndroid.RESULTS.GRANTED,
        ANDROID_DENIED: PermissionsAndroid.RESULTS.DENIED,
        ANDROID_NEVER_ASK_AGAIN: PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN,
      });
      
      if (Platform.OS === 'android') {
        const cameraStatus = await check(PERMISSIONS.ANDROID.CAMERA);
        const microphoneStatus = await check(PERMISSIONS.ANDROID.RECORD_AUDIO);
        
        console.log('[CallService] Current Android permissions:', {
          camera: cameraStatus,
          microphone: microphoneStatus
        });
        
        // Determine if permissions are blocked
        // On Android, DENIED can be asked again, but BLOCKED/NEVER_ASK_AGAIN cannot
        const cameraBlocked = cameraStatus === RESULTS.BLOCKED || cameraStatus === RESULTS.DENIED || 
                            cameraStatus === 'blocked' || cameraStatus === 'never_ask_again';
        const microphoneBlocked = microphoneStatus === RESULTS.BLOCKED || microphoneStatus === RESULTS.DENIED || 
                                microphoneStatus === 'blocked' || microphoneStatus === 'never_ask_again';
        
        // Check if permissions are granted
        const cameraGranted = cameraStatus === RESULTS.GRANTED || cameraStatus === 'granted';
        const microphoneGranted = microphoneStatus === RESULTS.GRANTED || microphoneStatus === 'granted';
        
        return {
          camera: cameraStatus,
          microphone: microphoneStatus,
          allGranted: cameraGranted && microphoneGranted,
          // Only consider "blocked" if the permission can no longer be requested
          blocked: (cameraStatus === RESULTS.BLOCKED || cameraStatus === 'never_ask_again' || 
                   microphoneStatus === RESULTS.BLOCKED || microphoneStatus === 'never_ask_again')
        };
      } else if (Platform.OS === 'ios') {
        const cameraStatus = await check(PERMISSIONS.IOS.CAMERA);
        const microphoneStatus = await check(PERMISSIONS.IOS.MICROPHONE);
        
        console.log('[CallService] Current iOS permissions:', {
          camera: cameraStatus,
          microphone: microphoneStatus
        });
        
        // Check if permissions are granted
        const cameraGranted = cameraStatus === RESULTS.GRANTED || cameraStatus === 'granted';
        const microphoneGranted = microphoneStatus === RESULTS.GRANTED || microphoneStatus === 'granted';
        
        return {
          camera: cameraStatus,
          microphone: microphoneStatus,
          allGranted: cameraGranted && microphoneGranted,
          blocked: (cameraStatus === RESULTS.BLOCKED || cameraStatus === RESULTS.UNAVAILABLE || 
                   microphoneStatus === RESULTS.BLOCKED || microphoneStatus === RESULTS.UNAVAILABLE)
        };
      }
      
      return {
        camera: 'unknown',
        microphone: 'unknown',
        allGranted: false,
        blocked: false
      };
    } catch (error) {
      console.error('[CallService] Error checking permission status:', error);
      return {
        camera: 'error',
        microphone: 'error',
        allGranted: false,
        blocked: true,
        error: error.message
      };
    }
  }
}

export default new CallService(); 