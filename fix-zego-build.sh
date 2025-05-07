#!/bin/bash

echo "🔧 Starting ZegoCloud build fix..."

# Create needed directories
echo "📁 Creating required directories..."
mkdir -p node_modules/@zegocloud/zego-uikit-prebuilt-call-rn/src
mkdir -p node_modules/@zegocloud/zego-uikit-prebuilt-call-rn/android/build/generated/source/codegen/jni
mkdir -p node_modules/@zegocloud/zego-uikit-rn/src
mkdir -p node_modules/@zegocloud/zego-uikit-rn/android/build/generated/source/codegen/jni
mkdir -p node_modules/zego-express-engine-reactnative/src
mkdir -p node_modules/react-delegate-component/lib
mkdir -p node_modules/react-native-sound/lib

# Clear build caches
echo "🧹 Cleaning build caches..."
cd android && ./gradlew clean
cd ..

# Reset Metro cache
echo "🔄 Resetting Metro cache..."
rm -rf $TMPDIR/metro-*

echo "✅ Fix completed! Try running your app now."
echo "Note: If you still have issues, you may need to run 'npx react-native start --reset-cache' in a separate terminal." 