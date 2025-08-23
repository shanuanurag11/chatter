import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Animated, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import CallInvitationButton from './CallInvitationButton';
import Colors from '../constants/colors';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // Two cards per row with margins

const PersonCard = ({ person, onPress, onVideoPress }) => {
  if (!person) return null;

  // Check if user has sufficient total_seconds for calling
  const checkCallEligibility = () => {
    console.log("Checking call eligibility for person:", JSON.stringify(person, null, 2));
    const min_seconds_for_call = 4;
    // Check if person has total_seconds property
    if (person && person.total_seconds !== undefined) {
      console.log("Found total_seconds:", person.total_seconds);
      if (person.total_seconds < min_seconds_for_call) {
        console.log("Insufficient total_seconds, blocking call");
        return false;
      }
      console.log("Sufficient total_seconds, allowing call");
    } else {
      console.log("No total_seconds found in person, allowing call");
    }
    return true;
  };

  // Handle disabled button click
  const handleDisabledButtonClick = () => {
    Alert.alert(
      'Insufficient Time',
      'You need at least 4 seconds to make a call. Please add more time to your account.',
      [
        { 
          text: 'OK', 
          onPress: () => {
            console.log("User acknowledged insufficient time");
          }
        }
      ]
    );
  };

  // Check if call is eligible
  const isCallEligible = checkCallEligibility();

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
      {person.active && (
        <View style={styles.statusIndicatorContainer}>
          <View style={[
            styles.statusIndicator, 
            { backgroundColor: person.active ? '#4CD964' : '#FF3B30' }
          ]} />
          <View style={styles.statusPulse} />
        </View>
      )}
      
      {/* Country flag if available */}
      {person.country_code && (
        <View style={styles.flagContainer}>
          <Text style={styles.flag}>
            {getFlagEmoji(person.country_code)}
          </Text>
        </View>
      )}
      
      {/* User avatar with subtle border and gradient overlay */}
      <View style={styles.avatarContainer}>
        {console.log("person-12121->" ,person)     }
        {person?.profile_picture ?<Image 
          source={{ uri: 'https://sakooneqalb.com' +person?.profile_picture || 'https://via.placeholder.com/150' }} 
          style={styles.avatar}
          resizeMode="cover"
        />:<Image 
        source={require('../assets/images/user.png')} 
        style={styles.avatar}
        resizeMode="cover"
      />}
        
        
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
        {/* Video Call Button using CallInvitationButton */}
        {isCallEligible ? (
          <CallInvitationButton
            targetUser={person}
            isVideoCall={true}
            onCallStarted={() => {
              console.log('Video call started with:', person.name);
              onVideoPress && onVideoPress(person);
            }}
            onCallFailed={(error) => {
              console.error('Video call failed:', error);
              // The error handling is done in the parent component
            }}
            style={styles.videoButton}
          />
        ) : (
          <TouchableOpacity
            onPress={handleDisabledButtonClick}
            style={styles.disabledVideoButton}
            activeOpacity={0.7}
          >
            <Icon name="videocam-off" size={20} color="#D32F2F" />
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
            {person.name || person.username || 'Anonymous'}
          </Text>
          
          {/* Add a subtle indicator if verified */}
          {person.is_verified && (
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
  
  // Extract country code from phone code (e.g. +91 -> in)
  const code = countryCode.replace('+', '');
  
  // Common country codes mapping
  const countryMapping = {
    '91': 'in', // India
    '92': 'pk', // Pakistan
    '1': 'us',  // USA
    '44': 'gb', // UK
    '86': 'cn', // China
    '81': 'jp', // Japan
    // Add more mappings as needed
  };
  
  const country = countryMapping[code];
  if (!country) return '';
  
  // Convert country code to flag emoji
  const codePoints = country
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt());
  
  return String.fromCodePoint(...codePoints);
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
  disabledVideoButton: {
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
    backgroundColor: 'rgba(211, 47, 47, 0.2)', // Red background for disabled state
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