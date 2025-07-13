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
  ActivityIndicator,
  RefreshControl
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
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  
  // Animated values for interactions
  const cardScale = useRef(new Animated.Value(1)).current;
  const avatarAnim = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  
  // Fetch user profile
  const fetchUserProfile = async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const profileData = await profileService.getUserProfile();
      console.log('Profile data:', profileData);
      
      if (!profileData) {
        throw new Error('No profile data received from server');
      }
      
      setUser(profileData);
    } catch (err) {
      console.error('Profile fetch error:', err);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to load profile';
      
      if (err.message) {
        if (err.message.includes('network') || err.message.includes('connection')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (err.message.includes('unauthorized') || err.message.includes('401')) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.message.includes('server') || err.message.includes('500')) {
          errorMessage = 'Server error. Please try again later.';
        } else if (err.message.includes('timeout')) {
          errorMessage = 'Request timeout. Please try again.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle pull-to-refresh
  const handleRefresh = () => {
    fetchUserProfile(true);
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

  const handleWithdrawalPress = () => {
    navigation.navigate('Withdrawal');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={64} color="#FF3B30" />
          <Text style={styles.errorTitle}>Unable to Load Profile</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchUserProfile}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="person-outline" size={64} color="#8E8E93" />
          <Text style={styles.errorTitle}>No Profile Data</Text>
          <Text style={styles.errorText}>Unable to load your profile information.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchUserProfile}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={Colors.background} 
        animated={true}
      />
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Enhanced Profile Header Section */}
        <View style={styles.profileHeader}>
          <LinearGradient
            colors={['#667eea', '#764ba2', '#f093fb']}
            style={styles.profileGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
          >
            <View style={styles.profilePattern} />
            
            {/* Profile Actions */}
            <View style={styles.profileActions}>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={handleEditProfile}
              >
                <Icon name="create-outline" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton}>
                <Icon name="settings-outline" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            {/* Profile Avatar and Info */}
            <View style={styles.profileContent}>
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
                  <TouchableOpacity style={styles.cameraButton} onPress={handleEditProfile}>
                    <Icon name="camera" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
                <View style={styles.avatarRing} />
                {user.is_verified && (
                  <View style={styles.verifiedBadge}>
                    <Icon name="checkmark-circle" size={20} color="#4CAF50" />
                  </View>
                )}
              </Animated.View>
              
              {/* User Info */}
              <Animated.View style={[styles.userInfoContainer, contentAnimStyle]}>
                <View style={styles.nameContainer}>
                  <Text style={styles.username}>{user.username}</Text>
                  <Text style={styles.userId}>ID: {user.id}</Text>
                  <View style={styles.statusContainer}>
                    {user.is_verified && (
                      <View style={styles.verifiedTextContainer}>
                        <Icon name="checkmark-circle" size={14} color="#4CAF50" />
                        <Text style={styles.verifiedText}>Verified</Text>
                      </View>
                    )}
                    <View style={[styles.statusIndicator, { backgroundColor: user.active ? '#4CD964' : '#FF3B30' }]}>
                      <Text style={styles.statusText}>{user.active ? 'Active' : 'Inactive'}</Text>
                    </View>
                  </View>
                </View>
                
                {user.bio && user.bio.trim() !== '' ? (
                  <View style={styles.bioContainer}>
                    <Icon name="chatbubble-outline" size={16} color="#FFFFFF" style={styles.bioIcon} />
                    <Text style={styles.bioText}>{user.bio}</Text>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.addBioButton} onPress={handleEditProfile}>
                    <Icon name="add-circle-outline" size={16} color="#FFFFFF" />
                    <Text style={styles.addBioText}>Add Bio</Text>
                  </TouchableOpacity>
                )}
              </Animated.View>
            </View>
          </LinearGradient>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Photos</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Videos</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.selected_age || 'N/A'}</Text>
            <Text style={styles.statLabel}>Age</Text>
          </View>
        </View>

        {/* Withdrawal Card - Only for Female Users */}
        {user?.gender?.toLowerCase()  === 'female' ? (
          <Animated.View style={[styles.withdrawalContainer, {transform: [{scale: cardScale}]}]}>
            <TouchableOpacity 
              style={styles.withdrawalCard}
              onPress={handleWithdrawalPress}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2', '#f093fb']}
                style={styles.withdrawalGradient}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
              >
                <View style={styles.withdrawalPattern} />
                <View style={styles.withdrawalContent}>
                  <View style={styles.withdrawalIconContainer}>
                    <Icon name="wallet-outline" size={28} color="#FFFFFF" />
                  </View>
                  <View style={styles.withdrawalTextContainer}>
                    <Text style={styles.withdrawalLabel}>Withdraw Coins</Text>
                    <Text style={styles.withdrawalText}>Cash out your earnings</Text>
                  </View>
                  <View style={styles.withdrawalArrowContainer}>
                    <Icon name="chevron-forward" size={24} color="#FFFFFF" />
                  </View>
                </View>
                <View style={styles.withdrawalShine} />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )
      :( <Animated.View style={[styles.cardsContainer, {transform: [{scale: cardScale}]}]}>
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
      </Animated.View>)}

        {/* Personal Information Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.userDetailsContainer}>
            {user.name && (
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <Icon name="person-outline" size={18} color={Colors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Full Name</Text>
                  <Text style={styles.detailText}>{user.name}</Text>
                </View>
              </View>
            )}
            
            {user.mobile_number && (
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <Icon name="call-outline" size={18} color={Colors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Phone Number</Text>
                  <Text style={styles.detailText}>{user.mobile_number}</Text>
                </View>
              </View>
            )}
            
            {user.gender && (
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <Icon name="male-female-outline" size={18} color={Colors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Gender</Text>
                  <Text style={styles.detailText}>{user.gender}</Text>
                </View>
              </View>
            )}
            
            {user.selected_age && (
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <Icon name="calendar-outline" size={18} color={Colors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Age</Text>
                  <Text style={styles.detailText}>{user.selected_age} years old</Text>
                </View>
              </View>
            )}

            {(user.address || user.city) && (
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <Icon name="location-outline" size={18} color={Colors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Location</Text>
                  <Text style={styles.detailText}>
                    {user.address && user.city ? `${user.address}, ${user.city}` : user.address || user.city}
                  </Text>
                </View>
              </View>
            )}

            {user.created_at && (
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <Icon name="time-outline" size={18} color={Colors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Member Since</Text>
                  <Text style={styles.detailText}>
                    {new Date(user.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Media Section */}
        {(user.images?.length > 0 || user.videos?.length > 0) && (
          <View style={styles.sectionContainer}>
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

        {/* Empty Media State */}
        {(!user.images || user.images.length === 0) && (!user.videos || user.videos.length === 0) && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Media</Text>
            <View style={styles.emptyMediaContainer}>
              <Icon name="images-outline" size={48} color="#CCCCCC" />
              <Text style={styles.emptyMediaTitle}>No Media Yet</Text>
              <Text style={styles.emptyMediaText}>Add photos and videos to your profile</Text>
              <TouchableOpacity style={styles.addMediaButton} onPress={handleEditProfile}>
                <Icon name="add" size={20} color={Colors.white} />
                <Text style={styles.addMediaButtonText}>Add Media</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FF6B6B', '#FF5252']}
              style={styles.logoutGradient}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
            >
              <Icon name="log-out-outline" size={20} color="#FFFFFF" style={styles.logoutIcon} />
              <Text style={styles.logoutText}>Logout</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  },
  scrollContent: {
    paddingBottom: 100,
  },
  profileHeader: {
    height: 280,
    position: 'relative',
    marginBottom: 20,
  },
  profileGradient: {
    flex: 1,
    position: 'relative',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profilePattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
    backgroundColor: 'transparent',
    borderTopWidth: 150,
    borderLeftWidth: 150,
    borderStyle: 'solid',
    borderTopColor: 'white',
    borderLeftColor: 'transparent',
  },
  profileActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 20,
    paddingHorizontal: 20,
    zIndex: 2,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  profileContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  avatarWrapper: {
    alignItems: 'center',
    position: 'relative',
    marginBottom: 20,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F0F0F0',
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    position: 'relative',
  },
  avatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarRing: {
    position: 'absolute',
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    top: -6,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  userInfoContainer: {
    alignItems: 'center',
  },
  nameContainer: {
    alignItems: 'center',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 3,
  },
  userId: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  bioContainer: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    maxWidth: '90%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  bioIcon: {
    marginRight: 8,
  },
  bioText: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
  },
  addBioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    marginTop: 8,
  },
  addBioText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 20,
    paddingVertical: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 10,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  cardsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  tokenCard: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    height: 100,
    elevation: 6,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  vipCard: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    height: 100,
    elevation: 6,
    shadowColor: '#FF7D6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardGradient: {
    flex: 1,
    position: 'relative',
  },
  cardContent: {
    flex: 1,
    padding: 16,
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
    opacity: 0.1,
    zIndex: 1,
    backgroundColor: 'transparent',
    borderTopWidth: 100,
    borderLeftWidth: 100,
    borderStyle: 'solid',
    borderTopColor: 'white',
    borderLeftColor: 'transparent',
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  tokenAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  vipText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 2,
  },
  cardArrow: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -8 }],
    opacity: 0.8,
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  userDetailsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  detailIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  mediaContainer: {
    marginBottom: 20,
  },
  mediaSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444444',
    marginBottom: 12,
  },
  mediaScrollView: {
    flexDirection: 'row',
  },
  mediaItem: {
    width: 120,
    height: 120,
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
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
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyMediaContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyMediaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMediaText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  addMediaButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addMediaButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  logoutContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  logoutButton: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  logoutGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  verifiedTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  verifiedText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4,
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  withdrawalContainer: {
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 10,
  },
  withdrawalCard: {
    borderRadius: 20,
    overflow: 'hidden',
    height: 110,
    elevation: 8,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  withdrawalGradient: {
    flex: 1,
    position: 'relative',
  },
  withdrawalPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.15,
    zIndex: 1,
    backgroundColor: 'transparent',
  },
  withdrawalContent: {
    flex: 1,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    zIndex: 2,
  },
  withdrawalIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  withdrawalTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  withdrawalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  withdrawalText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  withdrawalArrowContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  withdrawalShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    borderRadius: 20,
    opacity: 0.1,
    zIndex: 0,
  },
});

export default ProfileScreen; 