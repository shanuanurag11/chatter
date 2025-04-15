import React from 'react';
import { StatusBar, View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../constants/colors';

/**
 * Custom status bar component that handles proper rendering across platforms
 * and maintains consistent colors with the app theme
 */
const CustomStatusBar = ({ 
  // Use our main theme color as default
  backgroundColor = '#6C63FF', 
  barStyle = 'light-content',
  translucent = false 
}) => {
  const insets = useSafeAreaInsets();
  
  return (
    <>
      <StatusBar
        animated={true}
        backgroundColor={backgroundColor}
        barStyle={barStyle}
        translucent={translucent}
      />
      {!translucent && Platform.OS === 'android' && (
        <View style={[styles.statusBarPlaceholder, { 
          height: insets.top,
          backgroundColor 
        }]} />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  statusBarPlaceholder: {
    width: '100%',
  },
});

export default CustomStatusBar; 