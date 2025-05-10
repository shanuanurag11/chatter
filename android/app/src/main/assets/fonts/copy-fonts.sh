#!/bin/bash

# Create fonts directory if it doesn't exist
mkdir -p ../../../../app/src/main/assets/fonts

# Copy MaterialIcons font
cp ../../../../node_modules/react-native-vector-icons/Fonts/MaterialIcons.ttf ../../../../app/src/main/assets/fonts/

# Copy Ionicons font
cp ../../../../node_modules/react-native-vector-icons/Fonts/Ionicons.ttf ../../../../app/src/main/assets/fonts/

# Copy MaterialCommunityIcons font
cp ../../../../node_modules/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf ../../../../app/src/main/assets/fonts/ 