import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, BackHandler, Alert, Platform, Text, TouchableOpacity, ActivityIndicator, PermissionsAndroid, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { request, PERMISSIONS, RESULTS, requestMultiple } from 'react-native-permissions';
import callService from '../services/callService';
import callHistoryService from '../services/callHistoryService';
import userService from '../services/userService';
import zegoService from '../services/zegoService';
import Icon from 'react-native-vector-icons/MaterialIcons';

// ZegoCloud import for production use
import {ZegoUIKitPrebuiltCall, ONE_ON_ONE_VIDEO_CALL_CONFIG, ZegoUIKitPrebuiltCallService } from '@zegocloud/zego-uikit-prebuilt-call-rn'

// Replace with your ZegoCloud credentials once you have them
const ZEGO_APP_ID = 1765584231; // Replace with your actual App ID (as a number)
const ZEGO_APP_SIGN = '5187d0a49871d478f21df4a71737fc84255f33c0095b8d1dd160ac333b10802d';

const VideoCallScreen = ({ route, navigation }) => {
  console.log('[VideoCallScreen] Mounted');

  // Extract parameters from route
  const {
    callId = '9999888822', // Default to static callId if not provided
    recipientId,
    recipientName = 'Anonymous',
    isRandom = false,
  } = route.params || {};

  console.log('[VideoCallScreen] Rendering with params:', { 
    callId, 
    recipientId, 
    recipientName, 
    isRandom,
  });

  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [checkingPermissions, setCheckingPermissions] = useState(false);
  const [loadingSDK, setLoadingSDK] = useState(true);
  const [callInitiated, setCallInitiated] = useState(false);
  const [userData, setUserData] = useState(null);
  const permissionRequestRef = useRef(false);

  // Load user data on component mount
  useEffect(() => {
    // Set navigation reference in zegoService
    
    const loadUserData = async () => {
      try {
        const data = await userService.getUserData();
        setUserData(data);
        console.log('[VideoCallScreen] User data loaded:', data);
        
        // Debug: Log current total_seconds
        if (data?.total_Seconds !== undefined) {
          console.log('[VideoCallScreen] Current total_seconds available:', data.total_Seconds);
        }
      } catch (error) {
        console.error('[VideoCallScreen] Error loading user data:', error);
      }
    };
    
    loadUserData();
  }, []);

  // Function to notify server about call initiation
  const notifyCallInitiation = async () => {
    if (!recipientId || callInitiated) {
      console.log('[VideoCallScreen] Skipping call initiation notification:', { 
        recipientId, 
        callInitiated 
      });
      return;
    }

    try {
      console.log('[VideoCallScreen] Notifying server about call initiation');
      
      await callHistoryService.initiateCall({
        call_id: callId,
        call_type: 'video',
        recipient_id: recipientId,
        status: 'initiated'
      });

      setCallInitiated(true);
      console.log('[VideoCallScreen] Call initiation notification successful');
    } catch (error) {
      console.error('[VideoCallScreen] Error notifying call initiation:', error);
      // Don't block the call if the API fails
    }
  };

  // Function to notify server about call end
  const notifyCallEnd = async (total_seconds) => {
    console.log('[VideoCallScreen] notifyCallEnd called with duration:', total_seconds);
    if (!callId) {
      console.log('[VideoCallScreen] Skipping call end notification - no callId');
      return;
    }

    try {
      console.log('[VideoCallScreen] Notifying server about call end**total_seconds**',total_seconds);
      
      await callHistoryService.endCall({
        call_id: callId,
        total_seconds
      });

      console.log('[VideoCallScreen] Call end notification successful');

      // Update coins and total_seconds from profile API
      if (total_seconds && total_seconds > 0) {
        console.log('[VideoCallScreen] Updating coins and total_seconds from profile API after call...');
        const updated = await userService.updateCoinsAndTotalSecondsFromProfile();
        if (updated) {
          console.log('[VideoCallScreen] Coins and total_seconds updated successfully from profile API');
        } else {
          console.error('[VideoCallScreen] Failed to update coins and total_seconds from profile API');
        }
      }
    } catch (error) {
      console.error('[VideoCallScreen] Error notifying call end:', error);
      // Don't block navigation if the API fails
    }
  };

  // Function to request Android permissions directly
  const requestAndroidPermissions = async () => {
    console.log('[VideoCallScreen] Requesting Android permissions directly with PermissionsAndroid API');
    try {
      // Get Android API level
      const apiLevel = Platform.Version;
      console.log('[VideoCallScreen] Android API level:', apiLevel);
      
      let permissionResults = {};
      
      // Use different approach based on Android version
      if (apiLevel >= 33) { // Android 13+
        console.log('[VideoCallScreen] Using Android 13+ permission approach');
        // For Android 13+, we use the react-native-permissions library
        const permissions = await requestMultiple([
          PERMISSIONS.ANDROID.CAMERA,
          PERMISSIONS.ANDROID.RECORD_AUDIO
        ]);
        
        const cameraPermission = permissions[PERMISSIONS.ANDROID.CAMERA];
        const microphonePermission = permissions[PERMISSIONS.ANDROID.RECORD_AUDIO];
        
        permissionResults = {
          camera: cameraPermission,
          microphone: microphonePermission
        };
      } else {
        // For older Android versions, use the built-in API
        console.log('[VideoCallScreen] Using standard Android permission approach');
        const cameraResult = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "This app needs access to your camera for video calls",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        
        const microphoneResult = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: "Microphone Permission",
            message: "This app needs access to your microphone for video calls",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        
        permissionResults = {
          camera: cameraResult,
          microphone: microphoneResult
        };
      }

      console.log('[VideoCallScreen] Android permission results:', permissionResults);

      // Check if permissions are granted (handle both APIs)
      const isCameraGranted = 
        permissionResults.camera === PermissionsAndroid.RESULTS.GRANTED || 
        permissionResults.camera === RESULTS.GRANTED ||
        permissionResults.camera === 'granted';
        
      const isMicrophoneGranted = 
        permissionResults.microphone === PermissionsAndroid.RESULTS.GRANTED || 
        permissionResults.microphone === RESULTS.GRANTED ||
        permissionResults.microphone === 'granted';
      
      // For debug logging, output all possible types
      console.log('[VideoCallScreen] Permission check details:', {
        cameraResult: permissionResults.camera,
        microphoneResult: permissionResults.microphone,
        permissionsAndroidGranted: PermissionsAndroid.RESULTS.GRANTED,
        reactPermissionsGranted: RESULTS.GRANTED,
        isCameraGranted,
        isMicrophoneGranted
      });

      return {
        camera: permissionResults.camera,
        microphone: permissionResults.microphone,
        granted: isCameraGranted && isMicrophoneGranted
      };
    } catch (err) {
      console.error('[VideoCallScreen] Error requesting Android permissions:', err);
      return { camera: 'error', microphone: 'error', granted: false };
    }
  };

  // Check permissions when screen mounts
  useEffect(() => {
    console.log('[VideoCallScreen] Permission effect triggered');
    
    // Function to check permissions
    const checkPermissions = async () => {
      // Set ref to indicate we're checking permissions
      permissionRequestRef.current = true;
      
      try {
        setCheckingPermissions(true);
        console.log('[VideoCallScreen] Starting permission check');
        
        let permissionResult = { granted: false };

        if (Platform.OS === 'ios') {
          // Request iOS permissions
          console.log('[VideoCallScreen] Requesting iOS permissions');
          const permissions = await requestMultiple([
            PERMISSIONS.IOS.CAMERA,
            PERMISSIONS.IOS.MICROPHONE
          ]);
          
          const cameraPermission = permissions[PERMISSIONS.IOS.CAMERA];
          const microphonePermission = permissions[PERMISSIONS.IOS.MICROPHONE];
          console.log('[VideoCallScreen] iOS permissions result:', permissions);
          
          permissionResult = {
            camera: cameraPermission,
            microphone: microphonePermission,
            granted: cameraPermission === RESULTS.GRANTED && microphonePermission === RESULTS.GRANTED
          };
        } else {
          // For Android, use direct PermissionsAndroid API
          permissionResult = await requestAndroidPermissions();
        }

        console.log('[VideoCallScreen] Permission check result:', permissionResult);
        
        if (!permissionResult.granted) {
          console.log('[VideoCallScreen] Permissions denied, showing alert');
          setErrorMessage('Camera and microphone access are required for video calls.');
          setCheckingPermissions(false);
          
          Alert.alert(
            'Permissions Required',
            'Camera and microphone permissions are required for video calls.',
            [
              { 
                text: 'Go Back', 
                onPress: () => {
                  console.log('[VideoCallScreen] User cancelled permission retry, going back');
                  navigation.goBack();
                }
              },
              { 
                text: 'Open Settings', 
                onPress: () => {
                  console.log('[VideoCallScreen] User chose to open settings');
                  Linking.openSettings();
                  // Keep the error state so user can try again after changing settings
                }
              },
              { 
                text: 'Try Again', 
                onPress: () => {
                  console.log('[VideoCallScreen] User requested permission retry');
                  // Reset both flags to trigger a fresh permission check
                  setErrorMessage(null);
                  setCheckingPermissions(false);
                  // Allow a brief delay before retrying
                  setTimeout(() => {
                    checkPermissions();
                  }, 500);
                }
              }
            ]
          );
          return false;
        }
        
        // Permissions were granted, update state and begin loading SDK
        console.log('[VideoCallScreen] Permissions granted, setting state and loading SDK');
        setPermissionsGranted(true);
        setErrorMessage(null);
        setCheckingPermissions(false);
        
        // Make sure loadingSDK is true before starting the zego initialization
        setLoadingSDK(true);
        
        // Set loading SDK to false after a short delay to allow UI to update
        setTimeout(() => {
          console.log('[VideoCallScreen] SDK loading completed');
          setLoadingSDK(false);
          // Notify server about call initiation after SDK is loaded
          notifyCallInitiation();
        }, 300); // Slightly longer delay to ensure proper initialization
        
        return true;
      } catch (error) {
        console.error('[VideoCallScreen] Error in permission check:', error);
        setErrorMessage('Failed to check permissions. Please try again.');
        setCheckingPermissions(false);
        
        Alert.alert(
          'Permission Error',
          'Failed to check permissions. Please try again.',
          [
            { text: 'Go Back', onPress: () => navigation.goBack() },
            { 
              text: 'Try Again', 
              onPress: () => {
                // Reset both flags to trigger a fresh permission check
                setErrorMessage(null);
                setCheckingPermissions(false);
                // Allow a brief delay before retrying
                setTimeout(() => {
                  checkPermissions();
                }, 500);
              }
            }
          ]
        );
        return false;
      } finally {
        // Reset the ref regardless of outcome
        permissionRequestRef.current = false;
      }
    };

    // Only start permission check if not already granted, not currently checking, no error message,
    // and not already in the process of requesting permissions
    if (!permissionsGranted && !checkingPermissions && !errorMessage && !permissionRequestRef.current) {
      console.log('[VideoCallScreen] Starting permission check flow');
      checkPermissions();
    }
  }, [permissionsGranted, checkingPermissions, errorMessage]);

  // Handle back button to properly end the call
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = async () => {
        console.log('[VideoCallScreen] Back button pressed, handling end call');
        notifyCallEnd(0); // Pass 0 for manual termination
        handleEndCall();
        return true;
      };

      if (BackHandler) {
        const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => subscription.remove();
      }
      return () => {};
    }, [])
  );

  const handleEndCall = () => {
    console.log('[VideoCallScreen] handleEndCall called');
    
    Alert.alert(
      'End Call',
      'Are you sure you want to end this call?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'End Call', 
          style: 'destructive',
          onPress: async () => {
            console.log('[VideoCallScreen] Call ended by user');
            navigation.goBack();
          } 
        }
      ]
    );
  };

  // For production ready implementation, we use unique ids 
  // In a real app, you would use authenticated user information
  const userId = 'user_' + Math.floor(Math.random() * 10000).toString();
  const userName = 'User_' + Math.floor(Math.random() * 10000).toString();

  console.log('[VideoCallScreen] Current render state:', { 
    permissionsGranted, 
    errorMessage,
    loadingSDK
  });

  // Show error screen if there's an error message
  if (errorMessage) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={36} color="#FF8A80" />
          <Text style={styles.errorText}>{errorMessage}</Text>
          <Text style={[styles.errorText, {fontSize: 14, marginTop: 0, marginBottom: 10}]}>
            You may need to enable permissions in your device settings.
          </Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.retryButton, { marginRight: 10, backgroundColor: '#455A64' }]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.retryButtonText}>Go Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: '#4CAF50' }]}
              onPress={() => {
                console.log('[VideoCallScreen] Opening device settings');
                Linking.openSettings();
              }}
            >
              <Text style={styles.retryButtonText}>Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.retryButton, { marginLeft: 10 }]}
              onPress={async () => {
                // Reset error message and checking state to trigger permission check again
                setErrorMessage(null);
                setCheckingPermissions(false);
                
                try {
                  // Check current permission status first to help with debugging
                  const status = await callService.debugPermissionStatus();
                  console.log('[VideoCallScreen] Current permission status:', status);
                  
                  // Add a small delay before attempting to check permissions again
                  setTimeout(async () => {
                    // Get Android API level
                    const apiLevel = Platform.Version;
                    
                    if (Platform.OS === 'android') {
                      try {
                        if (apiLevel >= 33) {
                          // For Android 13+, directly request through react-native-permissions
                          const results = await requestMultiple([
                            PERMISSIONS.ANDROID.CAMERA,
                            PERMISSIONS.ANDROID.RECORD_AUDIO
                          ]);
                          console.log('[VideoCallScreen] Direct permission request results:', results);
                        } else {
                          // For older Android, use built-in API
                          await requestAndroidPermissions();
                        }
                        // Clear any error state
                        setErrorMessage(null);
                      } catch (error) {
                        console.error('[VideoCallScreen] Error in direct permission request:', error);
                      }
                    }
                  }, 500);
                } catch (error) {
                  console.error('[VideoCallScreen] Error checking permission status:', error);
                }
              }}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Show loading screen while checking permissions or loading SDK
  if (!permissionsGranted || loadingSDK) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>
            {!permissionsGranted 
              ? "Checking camera and microphone permissions..." 
              : "Initializing video call, please wait..."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ZegoCloud implementation for production use
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.callContainer}>
     {<ZegoUIKitPrebuiltCall
                appID={ZEGO_APP_ID}
                appSign={ZEGO_APP_SIGN}
                userID={userId} // userID can be something like a phone number or the user id on your own user system. 
                userName={userName}
                callID={callId} // callID can be any unique string. 

                config=
                {{
                    // You can also use ONE_ON_ONE_VOICE_CALL_CONFIG/GROUP_VIDEO_CALL_CONFIG/GROUP_VOICE_CALL_CONFIG to make more types of calls.
                    ...ONE_ON_ONE_VIDEO_CALL_CONFIG,
                    onCallEnd: async (callID, reason, duration) => { 
                      console.log('[VideoCallScreen] Call ended with reason:', reason, 'duration:', duration);
                      notifyCallEnd(duration);
                      navigation.goBack();
                    },
                    timingConfig: {
                      isDurationVisible: true,
                      onDurationUpdate: (durationInSec) => {
                        console.log('[VideoCallScreen] Call duration:', durationInSec, 'seconds');
                        // Auto-end call at 20 seconds (same as zegoService)
                        const totalSeconds = userData?.total_Seconds;
                        if (durationInSec >= totalSeconds) {
                          console.log('[VideoCallScreen] Auto-ending call at', totalSeconds, 'seconds');
                          // Import and use ZegoUIKitPrebuiltCallService to hang up
                          ZegoUIKitPrebuiltCallService.hangUp();
                          notifyCallEnd(durationInSec);
                          navigation.goBack();
                        }
                      },
                    },
                }}
            />}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A237E',
  },
  callContainer: {
    flex: 1,
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 20,
  },
  errorContainer: {
    flex: 1, 
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3F51B5',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 10,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  }
});

export default VideoCallScreen; 