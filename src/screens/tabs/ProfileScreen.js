import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  StatusBar,
  Animated,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { logout, logoutUser } from '../../store/slices/authSlice';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import profileService from '../../services/profileService';

// Import colors from constants 
import Colors from '../../constants/colors';

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  
  // Animated values for interactions
  const cardScale = useRef(new Animated.Value(1)).current;
  const avatarAnim = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  
  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const profileData = await profileService.getUserProfile();
      console.log('Profile data:', profileData);
      setUser(profileData);
    } catch (err) {
      setError(err.message || 'Failed to load profile');
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load profile on mount
  useEffect(() => {
    fetchUserProfile();
  }, []);
  
  // Animate elements when component mounts
  useEffect(() => {
    if (!loading && user) {
      Animated.sequence([
        Animated.timing(avatarAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        })
      ]).start();
      
      // Start pulsating animation for cards
      Animated.loop(
        Animated.sequence([
          Animated.timing(cardScale, {
            toValue: 1.03,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(cardScale, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          })
        ])
      ).start();
    }
  }, [loading, user]);
  
  // Animation styles
  const avatarAnimStyle = {
    opacity: avatarAnim,
    transform: [
      {
        scale: avatarAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1]
        })
      }
    ]
  };
  
  const contentAnimStyle = {
    opacity: contentOpacity,
    transform: [
      {
        translateY: contentOpacity.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0]
        })
      }
    ]
  };
  
  const handleLogout = () => {
    dispatch(logoutUser()).then(() => {
      dispatch(logout());
    });
  };
  
  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };
  
  const handleTokenPress = () => {
    navigation.navigate('Tokens');
  };
  
  const handleVIPPress = () => {
    navigation.navigate('VipSubscription');
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchUserProfile}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>No profile data available</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchUserProfile}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={Colors.primary} 
        animated={true}
      />
      
      {/* Header with gradient background */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={[Colors.gradientStart, Colors.gradientEnd]}
          style={styles.headerGradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
        >
          <View style={styles.headerPattern} />
        </LinearGradient>
        
        {/* Header buttons */}
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={[styles.iconButton, styles.editButton]} 
            onPress={handleEditProfile}
          >
            <Icon name="create-outline" size={22} color={Colors.white} />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.iconButton, styles.settingsButton]}>
            <Icon name="settings-outline" size={22} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile section */}
        <View style={styles.profileContainer}>
          <Animated.View style={[styles.avatarWrapper, avatarAnimStyle]}>
            <View style={styles.avatarContainer}>
              <Image 
                source={{ uri: user.profile_picture || 'https://randomuser.me/api/portraits/lego/1.jpg' }} 
                style={styles.avatar} 
                resizeMode="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.1)']}
                style={styles.avatarOverlay}
              />
            </View>
            <View style={styles.avatarRing} />
            {user.is_verified && (
              <View style={styles.verifiedBadge}>
                <Icon name="checkmark-circle" size={20} color={Colors.primary} />
              </View>
            )}
          </Animated.View>
          
          {/* User Info */}
          <Animated.View style={[styles.userInfoContainer, contentAnimStyle]}>
            <View style={styles.nameContainer}>
              <Text style={styles.username}>{user.username}</Text>
              <Text style={styles.userId}>ID: {user.id}</Text>
            </View>
            
            {user.bio && (
              <View style={styles.bioContainer}>
                <Icon name="chatbubble-outline" size={16} color={Colors.textDark} style={styles.bioIcon} />
                <Text style={styles.bioText}>{user.bio}</Text>
              </View>
            )}
          </Animated.View>

          {/* Tokens and VIP Cards */}
          <Animated.View style={[styles.cardsContainer, {transform: [{scale: cardScale}]}]}>
            <TouchableOpacity 
              style={styles.tokenCard}
              onPress={handleTokenPress}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[Colors.primaryLight, Colors.primary]}
                style={styles.cardGradient}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
              >
                <View style={styles.cardPattern} />
                <View style={styles.cardContent}>
                  <View style={styles.cardIconContainer}>
                    <Icon name="key" size={24} color="#FFC107" />
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={styles.tokenAmount}>0</Text>
                    <Text style={styles.cardLabel}>Tokens</Text>
                  </View>
                  <Icon name="chevron-forward" size={20} color={Colors.white} style={styles.cardArrow} />
                </View>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.vipCard}
              onPress={handleVIPPress}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#FF9D80', '#FF7D6B']}
                style={styles.cardGradient}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
              >
                <View style={styles.cardPattern} />
                <View style={styles.cardContent}>
                  <View style={styles.cardIconContainer}>
                    <Icon name="crown" size={24} color="#FFC107" />
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={styles.cardLabel}>VIP</Text>
                    <Text style={styles.vipText}>Get VIP</Text>
                  </View>
                  <Icon name="chevron-forward" size={20} color={Colors.white} style={styles.cardArrow} />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* User Details */}
          <View style={styles.userDetailsContainer}>
            {user.name && (
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <Icon name="person-outline" size={18} color={Colors.primary} />
                </View>
                <Text style={styles.detailText}>{user.name}</Text>
              </View>
            )}
            
            {user.mobile_number && (
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <Icon name="call-outline" size={18} color={Colors.primary} />
                </View>
                <Text style={styles.detailText}>{user.mobile_number}</Text>
              </View>
            )}
            
            {user.gender && (
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <Icon name="male-female-outline" size={18} color={Colors.primary} />
                </View>
                <Text style={styles.detailText}>{user.gender}</Text>
              </View>
            )}
            
            {user.address && (
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <Icon name="location-outline" size={18} color={Colors.primary} />
                </View>
                <Text style={styles.detailText}>{user.address}, {user.city}</Text>
              </View>
            )}

            {user.selected_age && (
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <Icon name="calendar-outline" size={18} color={Colors.primary} />
                </View>
                <Text style={styles.detailText}>Age: {user.selected_age}</Text>
              </View>
            )}

            {user.created_at && (
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <Icon name="time-outline" size={18} color={Colors.primary} />
                </View>
                <Text style={styles.detailText}>Joined: {new Date(user.created_at).toLocaleDateString()}</Text>
              </View>
            )}
          </View>

          {/* Media Section */}
          {(user.images?.length > 0 || user.videos?.length > 0) && (
            <View style={styles.mediaSection}>
              <Text style={styles.sectionTitle}>Media</Text>
              
              {/* Images Grid */}
              {user.images?.length > 0 && (
                <View style={styles.mediaContainer}>
                  <Text style={styles.mediaSubtitle}>Photos</Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.mediaScrollView}
                  >
                    {user.images.map((image, index) => (
                      <TouchableOpacity 
                        key={index}
                        style={styles.mediaItem}
                        onPress={() => {
                          console.log('Preview image:', image);
                        }}
                      >
                        <Image 
                          source={{ uri: image }} 
                          style={styles.mediaImage}
                          resizeMode="cover"
                        />
                        <LinearGradient
                          colors={['transparent', 'rgba(0,0,0,0.3)']}
                          style={styles.mediaOverlay}
                        />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Videos Grid */}
              {user.videos?.length > 0 && (
                <View style={styles.mediaContainer}>
                  <Text style={styles.mediaSubtitle}>Videos</Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.mediaScrollView}
                  >
                    {user.videos.map((video, index) => (
                      <TouchableOpacity 
                        key={index}
                        style={styles.mediaItem}
                        onPress={() => {
                          console.log('Preview video:', video);
                        }}
                      >
                        <View style={styles.videoThumbnail}>
                          <Icon name="play-circle" size={40} color={Colors.white} />
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* Logout button */}
      <TouchableOpacity 
        style={styles.logoutButton} 
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#F5F5F5', '#EEEEEE']}
          style={styles.logoutGradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
        >
          <Icon name="log-out-outline" size={22} color={Colors.primary} style={styles.logoutIcon} />
          <Text style={styles.logoutText}>Logout</Text>
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
    zIndex: 2,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  headerContainer: {
    height: 180,
    position: 'relative',
    zIndex: 1,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    zIndex: 1,
  },
  headerPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.15,
    backgroundColor: 'transparent',
    borderTopWidth: 120,
    borderLeftWidth: 120,
    borderStyle: 'solid',
    borderTopColor: 'white',
    borderLeftColor: 'transparent',
    zIndex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 16,
    paddingHorizontal: 15,
    zIndex: 2,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 14,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  editButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  settingsButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  profileContainer: {
    marginTop: -50,
    paddingHorizontal: 15,
    zIndex: 2,
    position: 'relative',
    backgroundColor: Colors.background,
  },
  avatarWrapper: {
    alignItems: 'center',
    position: 'relative',
    marginBottom: 24,
    zIndex: 3,
    elevation: 8,
  },
  avatarContainer: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#F0F0F0',
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    position: 'relative',
    zIndex: 3,
  },
  avatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 3,
  },
  avatar: {
    width: '100%',
    height: '100%',
    zIndex: 3,
  },
  avatarRing: {
    position: 'absolute',
    width: 144,
    height: 144,
    borderRadius: 72,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    top: -7,
    zIndex: 3,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 5,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    zIndex: 4,
  },
  userInfoContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  nameContainer: {
    alignItems: 'center',
  },
  username: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C2C2C',
    textShadowColor: 'rgba(0,0,0,0.08)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 4,
  },
  userId: {
    fontSize: 15,
    color: '#666666',
    marginTop: 6,
    letterSpacing: 0.5,
  },
  bioContainer: {
    marginTop: 20,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: 20,
    maxWidth: '92%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  bioIcon: {
    marginRight: 10,
  },
  bioText: {
    fontSize: 15,
    color: '#444444',
    textAlign: 'center',
    flex: 1,
    lineHeight: 22,
  },
  userDetailsContainer: {
    marginTop: 28,
    width: '100%',
    paddingHorizontal: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.03)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(108, 99, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  detailText: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
    letterSpacing: 0.3,
  },
  cardsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginTop: 28,
    marginBottom: 24,
    gap: 12,
  },
  tokenCard: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    height: 100,
    elevation: 8,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  vipCard: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    height: 100,
    elevation: 8,
    shadowColor: '#FF7D6B',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  cardGradient: {
    flex: 1,
    position: 'relative',
  },
  cardContent: {
    flex: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    zIndex: 2,
  },
  cardPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.15,
    zIndex: 1,
    backgroundColor: 'transparent',
    borderTopWidth: 120,
    borderLeftWidth: 120,
    borderStyle: 'solid',
    borderTopColor: 'white',
    borderLeftColor: 'transparent',
  },
  cardIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  tokenAmount: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 4,
  },
  cardLabel: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 3,
  },
  vipText: {
    fontSize: 15,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 1,
  },
  cardArrow: {
    position: 'absolute',
    right: 14,
    top: '50%',
    transform: [{ translateY: -8 }],
    opacity: 0.9,
  },
  mediaSection: {
    marginTop: 28,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C2C2C',
    marginBottom: 22,
    letterSpacing: 0.5,
  },
  mediaContainer: {
    marginBottom: 28,
  },
  mediaSubtitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#444444',
    marginBottom: 18,
    letterSpacing: 0.3,
  },
  mediaScrollView: {
    flexDirection: 'row',
  },
  mediaItem: {
    width: 150,
    height: 150,
    marginRight: 18,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  mediaOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButton: {
    position: 'absolute',
    bottom: 24,
    left: width / 2 - 90,
    width: 180,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  logoutGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutIcon: {
    marginRight: 10,
  },
  logoutText: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
});

export default ProfileScreen; 