import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  Dimensions,
  Animated,
  Easing
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../constants/colors';

const { width } = Dimensions.get('window');

const PromoBanner = ({ data, onPress }) => {
  if (!data) return null;
  
  // Animation values for pulsating effect
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const moveAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Create a pulsating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    ).start();
    
    // Create a floating animation for the image
    Animated.loop(
      Animated.sequence([
        Animated.timing(moveAnim, {
          toValue: 1,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(moveAnim, {
          toValue: 0,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    ).start();
  }, []);
  
  // Map movement value for floating effect
  const translateY = moveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8]
  });

  return (
    <TouchableOpacity 
      style={styles.outerContainer}
      onPress={onPress}
      activeOpacity={0.95}
    >
      {/* Main banner with gradient background */}
      <LinearGradient
        colors={[
          data.backgroundColor || Colors.primary, 
          Colors.primaryDark,
          data.backgroundColor ? adjustColor(data.backgroundColor, -30) : Colors.primaryDarker
        ]}
        locations={[0, 0.7, 1]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.container}
      >
        {/* Enhanced inner shadow gradient for depth */}
        <LinearGradient
          colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0)']}
          start={{x: 0, y: 0}}
          end={{x: 0, y: 0.6}}
          style={styles.innerShadow}
        />
        
        {/* Decorative elements */}
        <View style={styles.decorations}>
          <View style={styles.circleLarge} />
          <View style={styles.circleSmall} />
          <View style={styles.circleMedium} />
          <View style={styles.diamondShape} />
          <View style={styles.bottomHighlight} />
        </View>
        
        {/* Left section with text */}
        <View style={styles.textContainer}>
          <View style={styles.shineEffect} />
          <Text style={styles.title}>{data.title}</Text>
          <View style={styles.discountContainer}>
            <Text style={styles.discount}>{data.discount}</Text>
            <View style={styles.discountHighlight} />
          </View>
          
          {/* Get Now button */}
          <Animated.View style={{
            transform: [{ scale: scaleAnim }]
          }}>
            <TouchableOpacity style={styles.getButton} onPress={onPress}>
              <LinearGradient
                colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.15)']}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>{data.buttonText || 'Get Now'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
        
        {/* Right section with image */}
        <Animated.View style={[
          styles.imageContainer,
          { transform: [{ translateY }] }
        ]}>
          {data.imageUrl ? (
            <Image 
              source={{ uri: data.imageUrl }} 
              style={styles.image}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Icon name="account-balance-wallet" size={46} color="#fff" />
            </View>
          )}
          
          {/* Image highlight effect */}
          <View style={styles.imageHighlight} />
        </Animated.View>
        
        {/* Accent elements for visual interest */}
        <View style={styles.accentDot1} />
        <View style={styles.accentDot2} />
        <View style={styles.accentDot3} />
      </LinearGradient>
    </TouchableOpacity>
  );
};

// Helper function to darken a color
const adjustColor = (color, amount) => {
  // This is a simple implementation that assumes color is in the format '#RRGGBB'
  // In a real app, you would use a proper color manipulation library
  if (!color || color.charAt(0) !== '#') {
    return color;
  }
  
  const hex = color.slice(1);
  const num = parseInt(hex, 16);
  
  let r = (num >> 16) + amount;
  let g = ((num >> 8) & 0x00FF) + amount;
  let b = (num & 0x0000FF) + amount;
  
  r = Math.min(Math.max(0, r), 255);
  g = Math.min(Math.max(0, g), 255);
  b = Math.min(Math.max(0, b), 255);
  
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
};

const styles = StyleSheet.create({
  outerContainer: {
    width: width - 32,
    height: 160,
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 16,
    overflow: 'hidden',
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: 24,
    position: 'relative',
    alignItems: 'center',
    padding: 4,
  },
  innerShadow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  decorations: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  circleLarge: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -60,
    left: -30,
  },
  circleSmall: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    bottom: -30,
    left: 50,
  },
  circleMedium: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    top: 20,
    right: -40,
  },
  diamondShape: {
    position: 'absolute',
    width: 70,
    height: 70,
    transform: [{ rotate: '45deg' }],
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    bottom: 10,
    right: 30,
  },
  bottomHighlight: {
    position: 'absolute',
    height: 30,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  shineEffect: {
    position: 'absolute',
    width: 140,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transform: [{ rotate: '-30deg' }],
    top: 5,
    left: -30,
  },
  textContainer: {
    flex: 1,
    paddingLeft: 20,
    paddingRight: 10,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'flex-start',
    zIndex: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  discountContainer: {
    position: 'relative',
    marginBottom: 14,
  },
  discount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  discountHighlight: {
    position: 'absolute',
    height: 10,
    width: '70%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    bottom: 6,
    left: 0,
    zIndex: -1,
    borderRadius: 5,
  },
  getButton: {
    width: 100,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 8,
  },
  buttonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  imageContainer: {
    width: '40%',
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    marginRight: 16,
    position: 'relative',
  },
  imageHighlight: {
    position: 'absolute',
    width: '80%',
    height: 30,
    bottom: 0,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    transform: [{scaleX: 0.7}],
    opacity: 0.5,
  },
  image: {
    width: '90%',
    height: '90%',
    borderRadius: 12,
  },
  placeholderImage: {
    width: '80%',
    height: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 7,
  },
  accentDot1: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    bottom: 15,
    left: '30%',
  },
  accentDot2: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    top: 20,
    right: '25%',
  },
  accentDot3: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    top: 50,
    left: '20%',
  },
});

export default PromoBanner; 