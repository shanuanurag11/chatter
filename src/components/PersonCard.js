import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../constants/colors';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // Two cards per row with margins

const PersonCard = ({ person, onPress, onVideoPress }) => {
  if (!person) return null;

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => onPress && onPress(person)}
      activeOpacity={0.9}
    >
      {/* Enhanced card border with multi-layer gradient */}
      <LinearGradient
        colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
        locations={[0, 0.5, 1]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.cardBorder}
      />
      
      {/* Online status indicator with pulse animation */}
      {person.isOnline && (
        <View style={styles.statusIndicatorContainer}>
          <View style={[
            styles.statusIndicator, 
            { backgroundColor: person.isOnline ? '#4CD964' : '#FF3B30' }
          ]} />
          <View style={styles.statusPulse} />
        </View>
      )}
      
      {/* Country flag if available */}
      {person.country && (
        <View style={styles.flagContainer}>
          <Text style={styles.flag}>
            {getFlagEmoji(person.country)}
          </Text>
        </View>
      )}
      
      {/* User avatar with subtle border and gradient overlay */}
      <View style={styles.avatarContainer}>
        <Image 
          source={{ uri: person.avatar }} 
          style={styles.avatar}
          resizeMode="cover"
        />
        
        {/* Inner shadow for better depth */}
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.2)']}
          style={styles.avatarInnerShadow}
        />
      </View>
      
      {/* Enhanced gradient overlay with multiple color stops */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.7)']}
        locations={[0, 0.6, 1]}
        style={styles.gradientOverlay}
      >
        {person.hasVideo && (
          <TouchableOpacity 
            style={styles.videoButton}
            onPress={() => onVideoPress && onVideoPress(person)}
          >
            <LinearGradient
              colors={[Colors.gradientStart, Colors.gradientEnd]}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.videoButtonGradient}
            >
              <Icon name="videocam" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </LinearGradient>
      
      {/* Enhanced username footer with stronger gradient */}
      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientEnd]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.footer}
      >
        {/* Small top border for visual separation */}
        <View style={styles.footerTopBorder} />
        
        <View style={styles.nameContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {person.name}
          </Text>
          
          {/* Add a subtle indicator if verified */}
          {person.isVerified && (
            <View style={styles.verifiedBadge}>
              <Icon name="verified" size={12} color="#fff" />
            </View>
          )}
        </View>
      </LinearGradient>

      {/* Enhanced decorative elements */}
      <View style={styles.glowEffect} />
      <View style={styles.cornerHighlight} />
    </TouchableOpacity>
  );
};

// Helper function to convert country code to flag emoji
const getFlagEmoji = (countryCode) => {
  if (!countryCode) return '';
  
  // For India (in)
  if (countryCode.toLowerCase() === 'in') {
    return '🇮🇳';
  }
  
  // For Pakistan (pk)
  if (countryCode.toLowerCase() === 'pk') {
    return '🇵🇰';
  }
  
  // For USA (us)
  if (countryCode.toLowerCase() === 'us') {
    return '🇺🇸';
  }
  
  // Default to empty if country code not recognized
  return '';
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.35, // Slightly taller for better proportions
    margin: 8,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    position: 'relative',
  },
  cardBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    zIndex: 1,
  },
  statusIndicatorContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 15,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  statusPulse: {
    position: 'absolute',
    top: -4,
    left: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(76, 217, 100, 0.3)',
    opacity: 0.8,
    zIndex: -1,
  },
  flagContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  flag: {
    fontSize: 18,
  },
  avatarContainer: {
    width: '100%',
    height: '85%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    zIndex: 2,
    position: 'relative',
  },
  avatar: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0', // Placeholder color
  },
  avatarInnerShadow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    zIndex: 3,
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: '15%', // Positioned above the footer
    left: 0,
    right: 0,
    height: '35%', // Covers more of the avatar for better text visibility
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingBottom: 12,
    paddingRight: 12,
    zIndex: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '15%',
    justifyContent: 'center',
    paddingHorizontal: 12,
    zIndex: 10,
  },
  footerTopBorder: {
    position: 'absolute',
    top: 0,
    left: 12,
    right: 12,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    flex: 1,
    marginRight: 4,
  },
  videoButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    marginRight: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
    zIndex: 10,
  },
  videoButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 21,
  },
  verifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowEffect: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    opacity: 0.6,
    transform: [{ translateX: 35 }, { translateY: -35 }],
  },
  cornerHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomRightRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 2,
  },
});

export default PersonCard; 