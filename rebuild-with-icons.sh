#!/bin/bash

echo "Step 1: Running the link-vector-icons.js script..."
node link-vector-icons.js

echo "Step 2: Cleaning Android build..."
cd android && ./gradlew clean && cd ..

echo "Step 3: Running npm install to ensure all dependencies are up to date..."
npm install

echo "Step 4: Rebuilding the app..."
npx react-native run-android

echo "Done! The app should now be running with vector icons properly linked." 