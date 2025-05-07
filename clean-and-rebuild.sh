#!/bin/bash

echo "🧹 Cleaning up node_modules..."
rm -rf node_modules

echo "🧹 Cleaning up Android build files..."
cd android && ./gradlew clean && cd ..

echo "🧹 Cleaning up Metro bundler cache..."
rm -rf $TMPDIR/metro-*
watchman watch-del-all

echo "🔧 Installing node modules..."
npm install --legacy-peer-deps

echo "📦 Rebuilding Android app..."
cd android && ./gradlew --refresh-dependencies && cd ..

echo "🚀 Ready to run the app!"
echo "Run 'npx react-native run-android' to start" 