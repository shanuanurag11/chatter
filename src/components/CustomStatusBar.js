import React from 'react';
import { StatusBar, View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../constants/colors';

const CustomStatusBar = ({ 
  backgroundColor = Colors.primaryDark, 
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