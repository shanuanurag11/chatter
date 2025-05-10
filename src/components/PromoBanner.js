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
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const moveAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Pulsating animation
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
    
    // Floating animation
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
        {/* Background effects */}
        <LinearGradient
          colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0)']}
          start={{x: 0, y: 0}}
          end={{x: 0, y: 0.6}}
          style={styles.innerShadow}
        />
        
        <View style={styles.decorations}>
          <View style={styles.circleLarge} />
          <View style={styles.circleSmall} />
          <View style={styles.circleMedium} />
        </View>

        {/* Main content container */}
        <View style={styles.contentContainer}>
          {/* First row - Title */}
          <View style={styles.titleRow}>
            <Text style={styles.title}>{data.title}</Text>
          </View>

          {/* Second row - CTA and Discount */}
          <View style={styles.actionRow}>
            <Animated.View style={{
              transform: [{ scale: scaleAnim }]
            }}>
              <TouchableOpacity style={styles.getButton} onPress={onPress}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.15)']}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>{data.buttonText || 'Get Now'}</Text>
                  <Icon name="arrow-forward" size={20} color="#FFF" style={styles.buttonIcon} />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.discountContainer}>
              <Text style={styles.discount}>{data.discount}</Text>
              <View style={styles.discountHighlight} />
            </View>
          </View>
        </View>

        {/* Right side image */}
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
          <View style={styles.imageHighlight} />
        </Animated.View>
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
    width: '100%',
    height: 160,
    marginVertical: 8,
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
    overflow: 'hidden',
    borderRadius: 24,
    position: 'relative',
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
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -70,
    left: -40,
  },
  circleSmall: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    bottom: -40,
    left: 60,
  },
  circleMedium: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    top: 20,
    right: -50,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
    zIndex: 2,
  },
  titleRow: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
    letterSpacing: 0.5,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  getButton: {
    width: 120,
    height: 40,
    borderRadius: 20,
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 0.5,
  },
  buttonIcon: {
    marginLeft: 8,
  },
  discountContainer: {
    position: 'relative',
    alignItems: 'flex-end',
  },
  discount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
    letterSpacing: 1,
  },
  discountHighlight: {
    position: 'absolute',
    height: 14,
    width: '85%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    bottom: 6,
    left: 0,
    zIndex: -1,
    borderRadius: 7,
  },
  imageContainer: {
    position: 'absolute',
    width: '35%',
    height: '90%',
    right: 16,
    top: '5%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  imageHighlight: {
    position: 'absolute',
    width: '90%',
    height: 40,
    bottom: 0,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    transform: [{scaleX: 0.7}],
    opacity: 0.5,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  placeholderImage: {
    width: '90%',
    height: '90%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 7,
  },
});

export default PromoBanner; 