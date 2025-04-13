import React from 'react';
import { View, StyleSheet } from 'react-native';

const Logo = ({ size = 100 }) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={[styles.circle, { width: size, height: size }]}>
        <View style={[styles.letter, { height: size * 0.6, width: size * 0.4 }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  letter: {
    backgroundColor: '#6B46C1',
    borderRadius: 8,
    transform: [{ rotate: '15deg' }],
  },
});

export default Logo; 