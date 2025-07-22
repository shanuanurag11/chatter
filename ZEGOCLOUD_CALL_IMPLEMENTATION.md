# ZEGOCLOUD Call Invitation Implementation

This document outlines the implementation of ZEGOCLOUD's call invitation feature in the sakooneqlab app, allowing users to make audio and video calls by clicking on user images in chat lists and detail screens.

## Overview

The implementation follows ZEGOCLOUD's official documentation for React Native Call Kit with call invitations. The feature is implemented in three phases:

1. **Phase 1**: Proper initialization of ZEGOCLOUD ✅
2. **Phase 2**: Call invitation sent ✅
3. **Phase 3**: Call received ✅

## Architecture

### Core Components

1. **ZegoService** (`src/services/zegoService.js`)
   - Handles ZEGOCLOUD initialization and uninitialization
   - Manages call invitation functionality
   - Provides status checking and user management

2. **CallInvitationButton** (`src/components/CallInvitationButton.js`)
   - Reusable component for initiating calls
   - Integrates with ZEGOCLOUD's `ZegoSendCallInvitationButton`
   - Provides fallback functionality if ZEGOCLOUD is not available

3. **ZegoTestScreen** (`src/screens/ZegoTestScreen.js`)
   - Testing interface for ZEGOCLOUD functionality
   - Status monitoring and configuration verification
   - Manual initialization/uninitialization controls

### Integration Points

1. **Authentication Flow** (`src/store/slices/authSlice.js`)
   - ZEGOCLOUD initialized after successful login
   - ZEGOCLOUD uninitialized on logout
   - Automatic initialization on app start if user is authenticated

2. **Navigation** (`src/navigation/AppNavigator.js`)
   - Required ZEGOCLOUD screens added to navigation stack
   - `ZegoCallInvitationDialog` added to app root

3. **Chat Screens**
   - `ChatDetailScreen`: Call buttons in header
   - `UserDetailsScreen`: Call buttons in action section
   - `ChatListScreen`: Avatar click navigation to user details

## Configuration

### ZEGOCLOUD Credentials

Update `src/config/zegoConfig.js` with your ZEGOCLOUD credentials:

```javascript
export const ZEGO_CONFIG = {
  APP_ID: 1765584231, // Your ZEGOCLOUD App ID
  APP_SIGN: '5187d0a49871d478f21df4a71737fc84255f33c0095b8d1dd160ac333b10802d', // Your ZEGOCLOUD App Sign
  // ... other settings
};
```

### Resource ID Configuration

1. Go to [ZEGOCLOUD Console](https://console.zego.im/)
2. Create a new resource ID named `zego_call`
3. Configure push notifications for offline call invitations

## Implementation Details

### Phase 1: Initialization ✅

**Files Modified:**
- `index.js`: Added system calling UI initialization
- `src/services/zegoService.js`: Created ZEGOCLOUD service
- `src/store/slices/authSlice.js`: Integrated initialization with auth flow
- `src/navigation/AppNavigator.js`: Added required ZEGOCLOUD screens

**Key Features:**
- Automatic initialization on login
- Proper cleanup on logout
- Status monitoring and error handling
- Configuration validation

### Phase 2: Call Invitation Sent ✅

**Files Modified:**
- `src/components/CallInvitationButton.js`: Created call invitation component
- `src/screens/ChatDetailScreen.js`: Integrated call buttons in header
- `src/screens/UserDetailsScreen.js`: Added call buttons in action section

**Key Features:**
- Audio and video call buttons
- User-friendly interface
- Error handling and fallback
- Integration with existing UI

### Phase 3: Call Received ✅

**Files Modified:**
- `src/App.js`: Added `ZegoCallInvitationDialog`
- `android/app/src/main/AndroidManifest.xml`: Added required permissions

**Key Features:**
- Incoming call notifications
- System-level call UI
- Offline call invitations
- Cross-platform support

## Usage

### Making Calls

1. **From Chat Detail Screen:**
   - Navigate to any chat conversation
   - Tap the audio (📞) or video (📹) button in the header
   - Call invitation will be sent to the other user

2. **From User Details Screen:**
   - Navigate to user profile
   - Tap the audio or video call buttons
   - Call invitation will be sent to the selected user

3. **From Chat List:**
   - Tap on any user's avatar in the chat list
   - Navigate to user details
   - Use call buttons to initiate calls

### Receiving Calls

1. **Online Calls:**
   - Call invitation dialog appears immediately
   - Accept or decline the call
   - Navigate to call screen if accepted

2. **Offline Calls:**
   - Push notification received
   - Tap notification to answer call
   - System-level call UI appears

## Testing

### ZEGOCLOUD Test Screen

Access the test screen from the Profile tab to:

1. **Check Status:**
   - Verify ZEGOCLOUD initialization status
   - View current user information
   - Check configuration details

2. **Test Functionality:**
   - Test call invitation system
   - Reinitialize ZEGOCLOUD manually
   - Uninitialize for testing

3. **Debug Issues:**
   - View error messages
   - Check configuration validity
   - Monitor initialization process

### Manual Testing Steps

1. **Initialization Test:**
   ```
   1. Login to the app
   2. Navigate to Profile → ZEGOCLOUD Test
   3. Verify status shows "Initialized"
   4. Check user ID and name are correct
   ```

2. **Call Invitation Test:**
   ```
   1. Navigate to any chat conversation
   2. Tap audio or video call button
   3. Verify call invitation is sent
   4. Check for any error messages
   ```

3. **Cross-Device Test:**
   ```
   1. Install app on two devices
   2. Login with different accounts
   3. Initiate call from one device
   4. Verify call invitation received on other device
   ```

## Troubleshooting

### Common Issues

1. **ZEGOCLOUD Not Initialized:**
   - Check APP_ID and APP_SIGN in configuration
   - Verify user authentication is successful
   - Check console logs for initialization errors

2. **Call Invitation Not Sent:**
   - Ensure ZEGOCLOUD is properly initialized
   - Check target user information is valid
   - Verify resource ID is configured in ZEGOCLOUD console

3. **Call Not Received:**
   - Check push notification permissions
   - Verify offline call configuration
   - Test with both devices online first

### Debug Steps

1. **Check Console Logs:**
   ```javascript
   // Look for these log messages:
   [ZegoService] Initializing with user: ...
   [ZegoService] Initialized successfully
   [CallInvitationButton] Sending call invitation: ...
   ```

2. **Verify Configuration:**
   ```javascript
   // In ZegoTestScreen, check:
   - App ID matches ZEGOCLOUD console
   - App Sign is correct
   - Resource ID is configured
   ```

3. **Test Permissions:**
   ```javascript
   // Ensure these permissions are granted:
   - Camera
   - Microphone
   - Push Notifications
   - System Alert Window (Android)
   ```

## Platform-Specific Setup

### Android

**Permissions Added:**
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
<uses-permission android:name="android.permission.USE_FULL_SCREEN_INTENT" />
<uses-permission android:name="android.permission.ANSWER_PHONE_CALLS" />
<uses-permission android:name="android.permission.READ_PHONE_STATE" />
```

### iOS

**Required Setup:**
1. Add camera and microphone permissions to `Info.plist`
2. Configure Push Notifications capability
3. Add Background Modes capability
4. Import PushKit and CallKit libraries

## Next Steps

### Phase 4: Advanced Features (Future)

1. **Call History:**
   - Track call duration and status
   - Store call logs locally
   - Sync with backend

2. **Call Quality:**
   - Monitor call quality metrics
   - Implement quality indicators
   - Handle poor connection scenarios

3. **Group Calls:**
   - Extend to support group video calls
   - Implement call participant management
   - Add screen sharing functionality

4. **Customization:**
   - Custom call UI themes
   - Personalized ringtones
   - Call recording features

## Support

- [ZEGOCLOUD Documentation](https://www.zegocloud.com/docs/uikit/callkit-rn/quick-start-(with-call-invitation))
- [ZEGOCLOUD Console](https://console.zego.im/)
- [React Native Call Kit Guide](https://docs.zego.im/docs/ZEGOUICallKitRN)

## Implementation Status

✅ **Completed:**
- ZEGOCLOUD initialization and configuration
- Call invitation system integration
- User interface integration
- Cross-platform support
- Error handling and fallback
- Testing interface

🚀 **Ready for Production:**
- Complete call invitation workflow
- Offline call support
- System-level call UI
- Automatic initialization
- Proper cleanup and error recovery

The implementation provides a robust, invitation-based calling solution that integrates seamlessly with the existing chat application using ZEGOCLOUD's Call Kit. 