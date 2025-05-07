# ZegoCloud Video Calling Setup Guide

## Current Status

Currently, the application includes a fallback video call interface that simulates a video call when ZegoCloud packages are not fully implemented. This fallback allows you to test the basic flow and UI of the video calling feature.

## Setup Instructions

To implement the actual ZegoCloud video calling functionality, follow these steps:

### 1. Install Dependencies

**Important Note for React Native 0.78.2**: Make sure to use the compatible versions of ZegoCloud packages.

```bash
# Install ZegoCloud and all required packages
npm install --save @zegocloud/zego-uikit-prebuilt-call-rn@^6.3.2 @zegocloud/zego-uikit-rn@^2.17.4 react-delegate-component@^1.0.0 zego-express-engine-reactnative@^3.20.2 react-native-sound@^0.11.2 react-native-keep-awake@4.0.0 react-native-encrypted-storage@^4.0.3 react-native-device-info@^14.0.4 --force
```

The `--force` flag might be necessary due to some version compatibility issues.

### 2. Configure iOS Permissions

Add the following to your `ios/YourApp/Info.plist` file:

```xml
<key>NSCameraUsageDescription</key>
<string>We need access to your camera for video calls</string>
<key>NSMicrophoneUsageDescription</key>
<string>We need access to your microphone for video calls</string>
```

### 3. Configure Android Permissions

Ensure your `android/app/src/main/AndroidManifest.xml` includes these permissions:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />

<uses-feature android:name="android.hardware.camera" />
<uses-feature android:name="android.hardware.camera.autofocus" />
<uses-feature android:name="android.hardware.audio.output" />
<uses-feature android:name="android.hardware.microphone" />
```

### 4. Get ZegoCloud Credentials

1. Create an account at [ZegoCloud Console](https://console.zegocloud.com/)
2. Create a new project
3. Make note of your AppID (number) and AppSign (string)

### 5. Update VideoCallScreen.js

1. Open `src/screens/VideoCallScreen.js`
2. Uncomment the ZegoCloud import at the top of the file
3. Update the `ZEGO_APP_ID` and `ZEGO_APP_SIGN` constants with your actual credentials
4. Uncomment the ZegoCloud implementation section at the bottom of the file
5. Remove or comment out the fallback UI section

### 6. Test End-to-End

1. Make sure your app can build successfully
2. Navigate to the RandomVideoScreen
3. Press the "GO" button
4. You should now see the ZegoCloud UI instead of the fallback UI

## Troubleshooting

### Common Issues:

1. **Module not found**: If you see `Unable to resolve module @zegocloud/zego-uikit-prebuilt-call-rn`, make sure you've installed all the required packages and restarted the development server.

2. **Permissions denied**: Ensure that you've configured the permissions properly for both iOS and Android.

3. **ZegoCloud initialization fails**: Double-check your App ID and App Sign. The App ID should be a number and the App Sign should be a string.

4. **Build errors after installing packages**: Try cleaning the build:
   ```bash
   cd android && ./gradlew clean && cd ..
   cd ios && pod deintegrate && pod install && cd ..
   ```

5. **Package compatibility issues**: You may need to use the `--force` flag when installing dependencies due to version conflicts.

6. **Error: ENOENT: no such file or directory, lstat '.../node_modules/@zegocloud/zego-uikit-prebuilt-call-rn/src'**: This happens when the build system tries to find ZegoCloud files before they're installed or when there are issues with the package installation. Solutions:
   - Make sure you've properly installed the ZegoCloud packages: `npm install --save @zegocloud/zego-uikit-prebuilt-call-rn --force`
   - Clear node_modules and reinstall packages: `rm -rf node_modules && npm install`
   - Clean the build cache: `npx react-native start --reset-cache`
   - Try creating the directories manually (temporary fix):
     ```bash
     mkdir -p node_modules/@zegocloud/zego-uikit-prebuilt-call-rn/src
     mkdir -p node_modules/@zegocloud/zego-uikit-rn/src
     mkdir -p node_modules/zego-express-engine-reactnative/src
     mkdir -p node_modules/react-delegate-component/lib
     mkdir -p node_modules/react-native-sound/lib
     ```
   - If all else fails, use the fallback UI provided in VideoCallScreen.js by keeping the import commented out.

7. **React Native 0.78.2 Compatibility**: If you're having issues with the latest React Native version, you may need to:
   - Use specific versions of the ZegoCloud packages (as specified in step 1)
   - Check for any pending PRs or issues on the ZegoCloud GitHub repositories
   - Contact ZegoCloud support if needed

8. **Build fails with duplicate classes error**: This is often related to conflicts between auto-linking and manual linking. Make sure your android/app/build.gradle and android/settings.gradle files are properly configured.

## For Production Use

For production, consider implementing:

1. **API based token generation**: Replace the hard-coded App ID and App Sign with server-generated tokens
2. **User verification**: Use your authentication system to verify users before allowing video calls
3. **Call quality monitoring**: Implement call quality metrics and reporting
4. **Better error handling**: Add more comprehensive error handling and recovery options
5. **User feedback**: Add features for users to report issues with calls

## About the Fallback Implementation

The fallback implementation in `VideoCallScreen.js` provides:

1. A simulated "connecting" state with loading indicator
2. A simulated "connected" state with remote video (represented by a profile picture)
3. Local video preview (simplified)
4. Call controls (mute, end call, camera toggle)
5. Call duration timer

This allows you to continue development and testing of your video call flow without needing to implement the full ZegoCloud integration immediately. 