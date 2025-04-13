import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import CustomStatusBar from './CustomStatusBar';
import Colors from '../constants/colors';

const { width, height } = Dimensions.get('window');

const Circle = ({ size, position, duration }) => {
  const moveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(moveAnim, {
          toValue: 1,
          duration: duration,
          useNativeDriver: true,
        }),
        Animated.timing(moveAnim, {
          toValue: 0,
          duration: duration,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          ...position,
          transform: [
            {
              translateY: moveAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 50],
              }),
            },
            {
              scale: moveAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [1, 1.2, 1],
              }),
            },
          ],
        },
      ]}
    />
  );
};

const AnimatedBackground = () => {
  const circles = [
    { size: 100, position: { top: '10%', left: '10%' }, duration: 3000 },
    { size: 80, position: { top: '30%', right: '15%' }, duration: 4000 },
    { size: 120, position: { top: '50%', left: '5%' }, duration: 3500 },
    { size: 90, position: { top: '70%', right: '10%' }, duration: 4500 },
    { size: 60, position: { top: '85%', left: '30%' }, duration: 3200 },
  ];

  return (
    <View style={styles.container}>
      <CustomStatusBar backgroundColor={Colors.primaryDark} barStyle="light-content" />
      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientMiddle, Colors.gradientEnd]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      {circles.map((circle, index) => (
        <Circle key={index} {...circle} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  circle: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});

export default AnimatedBackground; 