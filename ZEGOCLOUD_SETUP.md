# ZEGOCLOUD Invitation-Based Audio Call Integration Setup Guide

This guide will help you integrate ZEGOCLOUD's Call Kit for React Native to enable invitation-based audio calling features in your app.

## Prerequisites

- React Native project (0.60+)
- iOS 11.0+ / Android API 21+
- ZEGOCLOUD account and credentials

## Installation

### 1. Install Dependencies

```bash
npm install @zegocloud/zego-uikit-prebuilt-call-rn react-native-uuid
# or
yarn add @zegocloud/zego-uikit-prebuilt-call-rn react-native-uuid
```

### 2. Platform-Specific Setup

#### iOS Setup

1. Install pods:
```bash
cd ios && pod install && cd ..
```

2. Add camera and microphone permissions to `ios/YourApp/Info.plist`:
```xml
<key>NSCameraUsageDescription</key>
<string>This app needs access to camera for video calls</string>
<key>NSMicrophoneUsageDescription</key>
<string>This app needs access to microphone for audio calls</string>
```

#### Android Setup

1. Add permissions to `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.INTERNET" />
```

2. Add to `android/app/build.gradle`:
```gradle
android {
    defaultConfig {
        // ... other configs
        ndk {
            abiFilters "armeabi-v7a", "arm64-v8a", "x86_64"
        }
    }
}
```

## Configuration

### 1. Get ZEGOCLOUD Credentials

1. Sign up at [ZEGOCLOUD Console](https://console.zego.im/)
2. Create a new project
3. Get your App ID and App Sign from the project settings

### 2. Update Configuration

Update `src/config/zegoConfig.js` with your credentials:

```javascript
export const ZEGO_CONFIG = {
  APP_ID: 'your_app_id_here',
  APP_SIGN: 'your_app_sign_here',
  // ... other settings
};
```

## Features Implemented

### Call Invitation System
- **Incoming Call Screen**: Handle incoming call invitations with accept/decline options
- **Call Invitation Service**: Manage invitation lifecycle and ZEGOCLOUD integration
- **Global Call Handler**: Centralized call management across the app
- **Invitation-based Calling**: Send and receive call invitations with proper UI

### User Interface
- Audio call button in UserDetailsScreen header
- Loading states for call actions
- Call invitation UI with accept/decline options
- Integrated ZEGOCLOUD call interface within IncomingCallScreen

## Technical Features

### Call Invitation Workflow
1. **Send Invitation**: User clicks audio call button → sends invitation via ZEGOCLOUD
2. **Receive Invitation**: Target user receives notification → shows incoming call screen
3. **Accept Call**: Target accepts → ZEGOCLOUD call interface appears directly
4. **Decline Call**: Target declines → sender notified
5. **Timeout**: Invitation expires if not responded to

### Global Call Management
- Automatic initialization on app start
- Centralized event handling for all call states
- Cleanup on app unmount
- Cross-screen call state management

### Error Handling
- Configuration validation
- Network error handling
- Call failure recovery
- User-friendly error messages

## Usage

### Making a Call
1. Navigate to a user's details page
2. Tap the audio call button in the header
3. Call invitation is sent to the target user via ZEGOCLOUD
4. Wait for acceptance or handle decline/timeout

### Receiving a Call
1. App shows incoming call screen when invitation received
2. Choose to accept or decline the call
3. If accepted, ZEGOCLOUD call interface appears directly
4. Use ZEGOCLOUD's built-in mute/unmute controls during the call

## Testing

### Test the Integration
1. Run the app on two devices
2. Navigate to a user's details page
3. Tap the audio call button
4. Accept the call on the other device
5. Test ZEGOCLOUD's built-in call controls
6. End the call and verify cleanup

### Debug Mode
Enable debug logging by setting `DEBUG_MODE: true` in the ZEGO configuration.

## Troubleshooting

### Common Issues
1. **Permission Denied**: Ensure camera/microphone permissions are granted
2. **Call Not Connecting**: Check network connectivity and ZEGOCLOUD credentials
3. **App Crashes**: Verify all dependencies are properly installed
4. **Invitation Not Received**: Check global call handler initialization

### Debug Steps
1. Check console logs for error messages
2. Verify ZEGOCLOUD credentials are correct
3. Test network connectivity
4. Ensure all permissions are granted

## Next Steps

1. **Install Dependencies**: Run the installation commands above
2. **Configure Credentials**: Update the ZEGO configuration with your credentials
3. **Platform Setup**: Follow iOS/Android specific setup instructions
4. **Test Integration**: Test the invitation-based calling feature on multiple devices
5. **Customize UI**: Modify the call invitation screens to match your app's design
6. **Add Features**: Implement additional features like call history, missed calls, etc.

## Support

- [ZEGOCLOUD Documentation](https://docs.zego.im/)
- [React Native Call Kit Guide](https://docs.zego.im/docs/ZEGOUICallKitRN)
- [ZEGOCLOUD Console](https://console.zego.im/)

## Implementation Status

✅ **Completed Features:**
- Invitation-based calling system
- Incoming call screen with ZEGOCLOUD integration
- Call invitation service
- Global call handler
- User interface integration
- Error handling and validation
- Configuration management

🚀 **Ready for Testing:**
- Complete invitation-based calling workflow
- Cross-device call functionality
- ZEGOCLOUD's built-in call controls
- Call duration tracking
- Automatic cleanup and error recovery

The implementation provides a streamlined, invitation-based audio calling solution that integrates seamlessly with your existing chat application using ZEGOCLOUD's Call Kit. 