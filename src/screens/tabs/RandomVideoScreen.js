import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Platform,
  Animated,
  Image,
  Easing,
  StatusBar,
  Alert,
  Linking,
} from 'react-native';
import { request, PERMISSIONS, RESULTS, requestMultiple } from 'react-native-permissions';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../../constants/colors';
import callService from '../../services/callService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

// List of profile image URLs
const femaleProfiles = [
  'https://randomuser.me/api/portraits/women/33.jpg',
  'https://randomuser.me/api/portraits/women/44.jpg',
  'https://randomuser.me/api/portraits/women/68.jpg',
  'https://randomuser.me/api/portraits/women/65.jpg',
  'https://randomuser.me/api/portraits/women/54.jpg',
  'https://randomuser.me/api/portraits/women/14.jpg',
  'https://randomuser.me/api/portraits/women/81.jpg',
  'https://randomuser.me/api/portraits/women/63.jpg',
];

const maleProfiles = [
  'https://randomuser.me/api/portraits/men/32.jpg',
  'https://randomuser.me/api/portraits/men/55.jpg',
];

// Generate static online user profiles
const generateProfiles = () => {
  const profiles = [];
  
  // Add 1 profile for center (user)
  profiles.push({
    id: 'center_user',
    name: 'You',
    ring: 0,
    angle: 0,
    imageUrl: 'https://randomuser.me/api/portraits/women/22.jpg', // Default user image
  });
  
  // Add 2-3 profiles for inner ring
  for (let i = 0; i < 3; i++) {
    // 80% chance of female profile
    const isFemale = Math.random() < 0.8;
    const profilesArray = isFemale ? femaleProfiles : maleProfiles;
    const randomIndex = Math.floor(Math.random() * profilesArray.length);
    
    profiles.push({
      id: `inner_user_${i}`,
      name: `User ${i + 1}`,
      ring: 1,
      angle: (i * 120) + Math.random() * 40 - 20,
      imageUrl: profilesArray[randomIndex],
      isOnline: true,
      joinedTime: Math.floor(Math.random() * 5000), // Random join time offset
      pulseSpeed: 0.8 + (Math.random() * 0.4), // Random pulse speed
    });
  }
  
  // Add 5-7 profiles for outer ring
  for (let i = 0; i < 6; i++) {
    // 80% chance of female profile
    const isFemale = Math.random() < 0.8;
    const profilesArray = isFemale ? femaleProfiles : maleProfiles;
    const randomIndex = Math.floor(Math.random() * profilesArray.length);
    
    profiles.push({
      id: `outer_user_${i}`,
      name: `User ${i + 3}`,
      ring: 2,
      angle: (i * 60) + Math.random() * 20 - 10,
      imageUrl: profilesArray[randomIndex],
      isOnline: Math.random() > 0.2, // 80% chance of being online
      joinedTime: Math.floor(Math.random() * 5000), // Random join time offset
      pulseSpeed: 0.8 + (Math.random() * 0.4), // Random pulse speed
    });
  }
  
  return profiles;
};

const RandomVideoScreen = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const innerRingAnimation = useRef(new Animated.Value(0)).current;
  const outerRingAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimations = useRef({});
  const statusAnimations = useRef({});
  const joinAnimations = useRef({});
  const coinCountRef = useRef(3);
  const offerPercentRef = useRef(60);
  const [timeLeft, setTimeLeft] = useState(1797); // 29:57 in seconds
  
  // Fix: create pure Animated.Value objects instead of using .current on them
  const buttonPulseAnim = new Animated.Value(0);
  const buttonRotateAnim = new Animated.Value(0);
  const buttonShimmerAnim = new Animated.Value(0);
  
  const particles = useRef([]);
  const timerRefs = useRef({});

  useEffect(() => {
    // Generate static profiles when component mounts
    const generatedProfiles = generateProfiles();
    setProfiles(generatedProfiles);
    
    // Initialize animations for each profile
    generatedProfiles.forEach(profile => {
      // Create pulse animations
      const pulseAnim = new Animated.Value(0);
      pulseAnimations.current[profile.id] = pulseAnim;
      
      // Create join animations
      const joinAnim = new Animated.Value(0);
      joinAnimations.current[profile.id] = joinAnim;
      
      // Create status animations
      const statusAnim = new Animated.Value(0);
      statusAnimations.current[profile.id] = statusAnim;
    });
    
    // Define a function to start all animations after initialization
    const startAllAnimations = () => {
      // Start profile animations
      const startProfileAnimations = () => {
        Object.keys(pulseAnimations.current).forEach(profileId => {
          const profile = generatedProfiles.find(p => p.id === profileId);
          if (profile) {
            const pulseSpeed = profile.pulseSpeed || 1;
            Animated.loop(
              Animated.sequence([
                Animated.timing(pulseAnimations.current[profileId], {
                  toValue: 1,
                  duration: 1500 / pulseSpeed,
                  useNativeDriver: true,
                  easing: Easing.inOut(Easing.sin),
                }),
                Animated.timing(pulseAnimations.current[profileId], {
                  toValue: 0,
                  duration: 1500 / pulseSpeed,
                  useNativeDriver: true,
                  easing: Easing.inOut(Easing.sin),
                }),
              ])
            ).start();
          }
        });

        Object.keys(joinAnimations.current).forEach(profileId => {
          const profile = generatedProfiles.find(p => p.id === profileId);
          if (profile) {
            const joinDelay = profile.joinedTime || 0;
            Animated.timing(joinAnimations.current[profileId], {
              toValue: 1,
              duration: 800,
              delay: joinDelay,
              useNativeDriver: true,
              easing: Easing.out(Easing.back(1.5)),
            }).start();
          }
        });

        Object.keys(statusAnimations.current).forEach(profileId => {
          const profile = generatedProfiles.find(p => p.id === profileId);
          if (profile && profile.isOnline) {
            Animated.loop(
              Animated.sequence([
                Animated.timing(statusAnimations.current[profileId], {
                  toValue: 0.5,
                  duration: 1500,
                  useNativeDriver: true,
                }),
                Animated.timing(statusAnimations.current[profileId], {
                  toValue: 1,
                  duration: 1500,
                  useNativeDriver: true,
                }),
              ])
            ).start();
          }
        });
      };

      // Start ring rotation animations
      Animated.loop(
        Animated.timing(innerRingAnimation, {
          toValue: 1,
          duration: 120000, // 2 minutes per rotation
          useNativeDriver: true,
        })
      ).start();
      
      Animated.loop(
        Animated.timing(outerRingAnimation, {
          toValue: 1,
          duration: 180000, // 3 minutes per rotation (slower)
          useNativeDriver: true,
        })
      ).start();

      // Make sure we actually start button animations
      console.log('[RandomVideoScreen] Starting button animations');
      try {
        // Button rotation animation
        Animated.loop(
          Animated.timing(buttonRotateAnim, {
            toValue: 1,
            duration: 8000,
            useNativeDriver: true,
            easing: Easing.linear,
          })
        ).start();

        // Button pulse animation
        Animated.loop(
          Animated.sequence([
            Animated.timing(buttonPulseAnim, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: true,
              easing: Easing.inOut(Easing.ease),
            }),
            Animated.timing(buttonPulseAnim, {
              toValue: 0,
              duration: 1500,
              useNativeDriver: true,
              easing: Easing.inOut(Easing.ease),
            }),
          ])
        ).start();

        // Shimmer animation
        Animated.loop(
          Animated.timing(buttonShimmerAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
            easing: Easing.linear,
          })
        ).start();
      } catch (error) {
        console.error('[RandomVideoScreen] Error starting button animations:', error);
      }

      // Initialize particle effects
      particles.current = Array.from({ length: 8 }, () => ({
        x: width / 2 - 20 + (Math.random() * 40),
        y: height * 0.7 + (Math.random() * 30),
        size: 4 + Math.random() * 8,
        opacity: 0.2 + Math.random() * 0.3,
        translateY: -100 - Math.random() * 100,
        scale: 0.5 + Math.random() * 0.5,
        anim: new Animated.Value(0)
      }));

      // Animate particles
      particles.current.forEach((particle) => {
        if (particle && particle.anim) {
          Animated.loop(
            Animated.timing(particle.anim, {
              toValue: 1,
              duration: 3000 + (Math.random() * 2000),
              useNativeDriver: true,
              easing: Easing.out(Easing.ease),
            })
          ).start();
        }
      });

      // Start profile animations
      startProfileAnimations();

      // Timer for countdown
      timerRefs.current.countdown = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRefs.current.countdown);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    // Start all animations
    startAllAnimations();
    
    // Return cleanup function
    return () => {
      if (timerRefs.current.countdown) {
        clearInterval(timerRefs.current.countdown);
      }
    };
  }, []);

  // Determine if a permission-related error message
  const isPermissionError = (message) => {
    if (!message) return false;
    return message.includes('permission') || 
           message.includes('camera') || 
           message.includes('microphone') ||
           message.includes('device settings');
  };

  const handleGoPress = async () => {
    // Prevent double clicks
    if (isLoading) {
      console.log('[RandomVideoScreen] Already loading, ignoring duplicate press');
      return;
    }

    console.log('[RandomVideoScreen] Go button pressed');
    
    // Start loading animation
    setIsLoading(true);
    setError(null);  // Clear any previous errors
    
    try {
      // Short delay to show the loading animation (gives visual feedback)
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Use static call ID for video calls
      const staticCallData = {
        callId: '9999888822',
        recipientId: 'user_' + Math.floor(Math.random() * 1000),
        recipientName: ['Jessica', 'Emma', 'Sophia', 'Olivia'][Math.floor(Math.random() * 4)],
        isRandom: true
      };
      
      console.log('[RandomVideoScreen] Using static call data:', staticCallData);
      
      // Turn off loading indicator before navigation
      setIsLoading(false);
      
      // Navigate directly to video call screen with static data
      console.log('[RandomVideoScreen] Navigating to VideoCallScreen with static call ID');
      navigation.navigate('VideoCallScreen', staticCallData);
      
    } catch (error) {
      console.error('[RandomVideoScreen] Error in Go button flow:', error);
      
      // Show error message and stop loading animation
      setError('Connection failed. Please try again.');
      setIsLoading(false);
      
      Alert.alert(
        'Connection Error',
        'Unable to start video call. Please try again.',
        [
          { text: 'OK' }
        ]
      );
    }
  };

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate profile positions based on ring and angle
  const getProfilePosition = (profile) => {
    // Center
    if (profile.ring === 0) {
      return {
        top: height * 0.35 - 20, // Center vertically
        left: width / 2 - 20, // Center horizontally
        width: 40,
        height: 40,
        zIndex: 10
      };
    }
    
    // Inner ring
    if (profile.ring === 1) {
      const ringRadius = width * 0.2;
      const angleRad = profile.angle * (Math.PI / 180);
      const rotation = innerRingAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
      });
      
      return {
        position: 'absolute',
        top: height * 0.35 - 25 + ringRadius * Math.sin(angleRad),
        left: width / 2 - 25 + ringRadius * Math.cos(angleRad),
        width: 50,
        height: 50,
        zIndex: 5,
        transform: [{ rotate: rotation }]
      };
    }
    
    // Outer ring
    if (profile.ring === 2) {
      const ringRadius = width * 0.4;
      const angleRad = profile.angle * (Math.PI / 180);
      const rotation = outerRingAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '-360deg']
      });
      
      return {
        position: 'absolute',
        top: height * 0.35 - 25 + ringRadius * Math.sin(angleRad),
        left: width / 2 - 25 + ringRadius * Math.cos(angleRad),
        width: 50,
        height: 50,
        zIndex: 3,
        transform: [{ rotate: rotation }]
      };
    }
    
    return {};
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Status Bar */}
      <StatusBar
        backgroundColor="#5D6CFF"
        barStyle="light-content"
      />
      
      {/* Gradient Background */}
      <LinearGradient
        colors={['#738FFE', '#5D6CFF', '#4A57DE']}
        style={styles.background}
      />
      
      {/* Background Pattern Elements */}
      <View style={styles.patternContainer}>
        {/* Large Circle Pattern */}
        <View style={styles.circlePattern}>
          <View style={styles.circle1} />
          <View style={styles.circle2} />
          <View style={styles.circle3} />
        </View>
        
        {/* Diagonal Lines Pattern */}
        <View style={styles.diagonalLinesContainer}>
          {Array.from({ length: 8 }).map((_, index) => (
            <View 
              key={`line-${index}`} 
              style={[
                styles.diagonalLine,
                { 
                  transform: [{ rotate: `${45 + (index * 12)}deg` }],
                  opacity: 0.1 + (index * 0.02),
                  top: height * 0.1 + (index * 20),
                  left: -width * 0.3 + (index * 30)
                }
              ]}
            />
          ))}
        </View>
        
        {/* Small Floating Dots */}
        {Array.from({ length: 18 }).map((_, index) => (
          <View 
            key={`dot-${index}`}
            style={[
              styles.floatingDot,
              {
                width: 4 + (Math.random() * 8),
                height: 4 + (Math.random() * 8),
                opacity: 0.2 + (Math.random() * 0.4),
                top: Math.random() * height,
                left: Math.random() * width,
                backgroundColor: index % 3 === 0 ? '#A7B8FF' : 
                               index % 3 === 1 ? '#C4D0FF' : '#8899FF',
              }
            ]}
          />
        ))}
      </View>
      
      {/* Coin count display */}
      <View style={styles.coinCountContainer}>
        <View style={styles.coinCircle}>
          <Text style={styles.coinText}>c</Text>
        </View>
        <Text style={styles.whiteText}>{coinCountRef.current}</Text>
        <TouchableOpacity style={styles.addButton}>
          <Icon name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      {/* Right Side Controls */}
      <View style={styles.rightControls}>
        <TouchableOpacity style={styles.iconButton}>
          <Icon name="event-note" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Icon name="access-time" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      {/* Concentric Circles */}
      <View style={styles.circlesContainer}>
        <View style={styles.outerCircle} />
        <View style={styles.middleCircle} />
        <View style={styles.innerCircle} />
        
        {/* Profile Avatars */}
        {profiles.map((profile) => {
          const positionStyle = getProfilePosition(profile);
          
          if (profile.ring === 0) {
            // Center avatar (you)
            return (
              <View 
                key={profile.id}
                style={[styles.centerProfileCircle, positionStyle]}
              >
                <Image 
                  source={{ uri: profile.imageUrl }} 
                  style={styles.centerProfileImage}
                />
                <View style={styles.centerUserIndicator}>
                  <Text style={styles.centerUserText}>You</Text>
                </View>
              </View>
            );
          } else {
            // Inner/outer ring avatars with animations
            const pulseAnimation = pulseAnimations.current[profile.id];
            const joinAnimation = joinAnimations.current[profile.id];
            const statusAnimation = statusAnimations.current[profile.id];
            
            const scale = pulseAnimation?.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.1],
            }) || 1;
            
            const opacity = joinAnimation?.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1],
            }) || 1;
            
            const statusOpacity = statusAnimation?.interpolate({
              inputRange: [0, 1],
              outputRange: [0.5, 1],
            }) || 1;
            
            return (
              <Animated.View 
                key={profile.id}
                style={[
                  styles.profileCircle, 
                  positionStyle,
                  { 
                    opacity, 
                    transform: [
                      ...(positionStyle.transform || []),
                      { scale }
                    ] 
                  }
                ]}
              >
                <Image 
                  source={{ uri: profile.imageUrl }} 
                  style={styles.profileImage}
                />
                {profile.isOnline && (
                  <Animated.View 
                    style={[
                      styles.statusDot,
                      { opacity: statusOpacity }
                    ]} 
                  />
                )}
              </Animated.View>
            );
          }
        })}
      </View>
      
      {/* Special Offer */}
      <View style={styles.specialOfferContainer}>
        <View style={styles.giftBox}>
          <Icon name="card-giftcard" size={30} color="#FF9800" />
        </View>
        <View style={styles.offerBadge}>
          <Text style={styles.offerText}>{offerPercentRef.current}%OFF</Text>
        </View>
        <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
      </View>
      
      {/* Go Button */}
      <View style={styles.buttonContainer}>
        <Animated.View
          style={[
            styles.buttonGlowOuter,
            {
              opacity: buttonPulseAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.2, 0.4],
              }),
              transform: [
                {
                  scale: buttonPulseAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.2],
                  }),
                },
              ],
            },
          ]}
        />
        
        <Animated.View
          style={[
            styles.buttonGlowRing,
            {
              opacity: buttonPulseAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.6, 0.9],
              }),
              transform: [
                {
                  scale: buttonPulseAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.95, 1.05],
                  }),
                },
                {
                  rotate: buttonRotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        />
        
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleGoPress}
          disabled={isLoading}
        >
          <Animated.View
            style={[
              styles.buttonWrapper,
              {
                transform: [
                  { perspective: 1000 },
                  { rotateX: '10deg' },
                  {
                    scale: buttonPulseAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.98, 1.03],
                    }),
                  },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={['#B388FF', '#7C4DFF', '#651FFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.buttonInnerGradient}
              />
              
              <Animated.View
                style={[
                  styles.buttonShimmer,
                  {
                    transform: [
                      {
                        translateX: buttonShimmerAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-250, 250],
                        }),
                      },
                    ],
                  },
                ]}
              />
              
              {isLoading ? (
                <ActivityIndicator size="large" color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>
                  GO
                </Text>
              )}
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>
        
        {/* Particle effects */}
        {particles.current.map((particle, index) => {
          // Only render if particle has animation
          if (!particle || !particle.anim) return null;
          
          return (
            <Animated.View
              key={`particle-${index}`}
              style={[
                styles.particle,
                {
                  left: particle.x,
                  top: particle.y,
                  width: particle.size,
                  height: particle.size,
                  opacity: particle.anim.interpolate({
                    inputRange: [0, 0.7, 1],
                    outputRange: [0, particle.opacity, 0]
                  }),
                  transform: [
                    { 
                      translateY: particle.anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, particle.translateY]
                      }) 
                    },
                    { 
                      scale: particle.anim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [particle.scale, particle.scale * 1.2, particle.scale * 0.8]
                      }) 
                    }
                  ],
                },
              ]}
            />
          );
        })}
      </View>
      
      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={24} color="#FF8A80" />
          <View style={styles.errorTextContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <View style={styles.errorButtonsContainer}>
              {error.includes('permanently denied') || error.includes('device settings') ? (
                <TouchableOpacity 
                  style={styles.errorButton}
                  onPress={() => {
                    console.log('[RandomVideoScreen] Opening app settings from error panel');
                    if (Platform.OS === 'ios') {
                      Linking.openURL('app-settings:');
                    } else {
                      Linking.openSettings();
                    }
                  }}
                >
                  <Text style={styles.errorButtonText}>Open Settings</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={styles.errorButton}
                  onPress={() => {
                    console.log('[RandomVideoScreen] Retry from error panel');
                    setError(null);
                    handleGoPress();
                  }}
                >
                  <Text style={styles.errorButtonText}>Try Again</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          <TouchableOpacity 
            style={styles.errorCloseButton}
            onPress={() => setError(null)}
          >
            <Icon name="close" size={20} color="#FF8A80" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5D6CFF',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  patternContainer: {
    position: 'absolute',
    width: width,
    height: height,
    overflow: 'hidden',
  },
  circlePattern: {
    position: 'absolute',
    width: width * 2,
    height: width * 2,
    top: -width * 0.5,
    left: -width * 0.5,
  },
  circle1: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: width,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  circle2: {
    position: 'absolute',
    width: '80%',
    height: '80%',
    top: '10%',
    left: '10%',
    borderRadius: width,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  circle3: {
    position: 'absolute',
    width: '60%',
    height: '60%',
    top: '20%',
    left: '20%',
    borderRadius: width,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  diagonalLinesContainer: {
    position: 'absolute',
    width: width * 2,
    height: height * 2,
  },
  diagonalLine: {
    position: 'absolute',
    width: width * 2,
    height: 1,
    backgroundColor: 'white',
  },
  floatingDot: {
    position: 'absolute',
    borderRadius: 10,
  },
  coinCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 40,
    left: 30,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 25,
    padding: 8,
  },
  coinCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinText: {
    color: 'white',
    fontWeight: 'bold',
  },
  whiteText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    marginHorizontal: 10,
  },
  addButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightControls: {
    position: 'absolute',
    top: 40,
    right: 30,
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  circlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerCircle: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    position: 'absolute',
  },
  middleCircle: {
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    position: 'absolute',
  },
  innerCircle: {
    width: width * 0.2,
    height: width * 0.2,
    borderRadius: width * 0.1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    position: 'absolute',
  },
  centerProfileCircle: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
    overflow: 'hidden',
    position: 'absolute',
  },
  centerProfileImage: {
    width: '100%',
    height: '100%',
  },
  centerUserIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 2,
    alignItems: 'center',
  },
  centerUserText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
  },
  profileCircle: {
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'white',
    overflow: 'hidden',
    position: 'absolute',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  statusDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: 'white',
    bottom: 0,
    right: 0,
  },
  specialOfferContainer: {
    position: 'absolute',
    bottom: 140,
    right: 30,
    alignItems: 'center',
  },
  giftBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  offerBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginTop: 5,
  },
  offerText: {
    color: '#B71C1C',
    fontWeight: 'bold',
  },
  timerText: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: 5,
  },
  buttonContainer: {
    alignItems: 'center',
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
  },
  buttonGlowOuter: {
    position: 'absolute',
    width: 240,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(159, 128, 255, 0.35)',
    zIndex: -1,
    shadowColor: '#9C7CFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  buttonGlowRing: {
    position: 'absolute',
    width: 210,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
    backgroundColor: 'transparent',
    zIndex: -1,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  buttonWrapper: {
    width: 200,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#7C4DFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 15,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.95)',
    overflow: 'hidden',
    transform: [{ perspective: 800 }, { rotateX: '10deg' }],
  },
  buttonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  buttonInnerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 35,
  },
  buttonShimmer: {
    position: 'absolute',
    width: 60,
    height: 200,
    backgroundColor: 'rgba(255,255,255,0.4)',
    transform: [{ rotate: '25deg' }],
    blurRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 36,
    letterSpacing: 3,
    zIndex: 2,
  },
  particle: {
    position: 'absolute',
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 30, 50, 0.9)',
    padding: 15,
    borderRadius: 10,
    position: 'absolute',
    bottom: 150,
    left: 20,
    right: 20,
    borderWidth: 1,
    borderColor: '#FF8A80',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  errorTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  errorText: {
    color: '#FF8A80',
    fontSize: 14,
  },
  errorButtonsContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  errorButton: {
    backgroundColor: 'rgba(255, 138, 128, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#FF8A80',
  },
  errorButtonText: {
    color: '#FF8A80',
    fontSize: 12,
    fontWeight: 'bold',
  },
  errorCloseButton: {
    padding: 5,
  },
});

export default RandomVideoScreen; 