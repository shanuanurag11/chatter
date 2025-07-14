import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import userService from '../services/userService';
import chatService from '../services/chatService';
import CallInvitationButton from '../components/CallInvitationButton';

const { width, height } = Dimensions.get('window');

// Theme colors
const COLORS = {
  primary: '#6C63FF',
  primaryLight: '#8E64FF',
  primaryDark: '#5A52E0',
  secondary: '#B366FF',
  accent: '#FF6B9D',
  success: '#4CD964',
  warning: '#FF9500',
  error: '#FF3B30',
  background: '#F8F9FF',
  surface: '#FFFFFF',
  surfaceVariant: '#F0F2FF',
  textPrimary: '#1A1A2E',
  textSecondary: '#6C757D',
  textTertiary: '#9CA3AF',
  border: '#E5E7FF',
  borderLight: '#F1F3FF',
  shadow: 'rgba(108, 99, 255, 0.1)',
  shadowDark: 'rgba(108, 99, 255, 0.2)',
};

const UserDetailsScreen = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messageLoading, setMessageLoading] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const { userId } = route.params;

  // Check if user has sufficient total_seconds for calling
  const checkCallEligibility = () => {
    console.log("Checking call eligibility for userProfile:", JSON.stringify(userProfile, null, 2));
    const min_seconds_for_call = 4;
    // Check if userProfile has total_seconds property
    if (userProfile && userProfile.total_seconds !== undefined) {
      console.log("Found total_seconds:", userProfile.total_seconds);
      if (userProfile.total_seconds < min_seconds_for_call) {
        console.log("Insufficient total_seconds, blocking call");
        return false;
      }
      console.log("Sufficient total_seconds, allowing call");
    } else {
      console.log("No total_seconds found in userProfile, allowing call");
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

  useEffect(() => {
    if (userId) {
      loadUserProfile();
    }
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const profile = await userService.getUserProfileById(userId);
      console.log('UserDetailsScreen - Received profile data:', JSON.stringify(profile, null, 2));
      
      if (profile) {
        setUserProfile(profile);
      } else {
        setError('Failed to load user profile');
      }
    } catch (err) {
      console.error('Error loading user profile:', err);
      setError(err.message || 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleMessagePress = async () => {
    try {
      setMessageLoading(true);
      // Create or find conversation with this user
      const chat = await chatService.createOrFindConversation(userId);
      
      // Navigate to chat detail screen with the proper chat object
      navigation.navigate('ChatDetail', {
        chat: chat
      });
    } catch (error) {
      console.error('Error creating/finding conversation:', error);
      // You might want to show an error message to the user here
      Alert.alert('Error', 'Failed to start conversation. Please try again.');
    } finally {
      setMessageLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getAgeFromDate = (dateString) => {
    if (!dateString) {
      console.log('UserDetailsScreen - No date string provided for age calculation');
      return null;
    }
    
    console.log('UserDetailsScreen - Calculating age from date:', dateString);
    
    try {
      const birthDate = new Date(dateString);
      const today = new Date();
      
      console.log('UserDetailsScreen - Birth date:', birthDate);
      console.log('UserDetailsScreen - Today:', today);
      
      // Check if the date is valid and not in the future
      if (isNaN(birthDate.getTime()) || birthDate > today) {
        console.log('UserDetailsScreen - Invalid date or future date detected');
        return null;
      }
      
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      console.log('UserDetailsScreen - Calculated age:', age);
      return age > 0 ? age : null;
    } catch (error) {
      console.error('Error calculating age:', error);
      return null;
    }
  };

  const renderInfoItem = (icon, label, value, isLast = false) => {
    // Don't render if value is null, undefined, or empty string
    if (!value || value === '') {
      console.log(`UserDetailsScreen - Skipping ${label}: value is ${value}`);
      return null;
    }
    
    console.log(`UserDetailsScreen - Rendering ${label}: ${value}`);
    
    return (
      <View style={[styles.infoItem, isLast && styles.infoItemLast]}>
        <View style={styles.infoIconContainer}>
          <Ionicons name={icon} size={22} color={COLORS.primary} />
        </View>
        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>{label}</Text>
          <Text style={styles.infoValue}>{value}</Text>
        </View>
        <View style={styles.infoArrow}>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textTertiary} />
        </View>
      </View>
    );
  };

  const renderStatCard = (icon, value, label) => (
    <LinearGradient
      colors={[COLORS.surface, COLORS.surfaceVariant]}
      style={styles.statCard}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
    >
      <View style={styles.statIconContainer}>
        <Ionicons name={icon} size={24} color={COLORS.primary} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </LinearGradient>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <View style={styles.loadingContainer}>
          <LinearGradient
            colors={[COLORS.surface, COLORS.surfaceVariant]}
            style={styles.loadingCard}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
          >
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </LinearGradient>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <View style={styles.errorContainer}>
          <LinearGradient
            colors={[COLORS.surface, COLORS.surfaceVariant]}
            style={styles.errorCard}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
          >
            <Ionicons name="alert-circle-outline" size={64} color={COLORS.error} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadUserProfile}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryLight]}
                style={styles.retryButtonGradient}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </SafeAreaView>
    );
  }

  if (!userProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <View style={styles.errorContainer}>
          <LinearGradient
            colors={[COLORS.surface, COLORS.surfaceVariant]}
            style={styles.errorCard}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
          >
            <Ionicons name="person-outline" size={64} color={COLORS.textTertiary} />
            <Text style={styles.errorText}>User not found</Text>
          </LinearGradient>
        </View>
      </SafeAreaView>
    );
  }

  const age = getAgeFromDate(userProfile.date_of_birth);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {/* Header */}
      <View style={styles.headerWrapper}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryLight, COLORS.secondary]}
          style={styles.headerGradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
        />
        <View style={styles.headerDecorationContainer}>
          <View style={styles.headerDecoration1} />
          <View style={styles.headerDecoration2} />
          <View style={styles.headerDecoration3} />
          <View style={styles.headerDecoration4} />
        </View>
        
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Profile</Text>
            <View style={styles.headerAccent} />
          </View>
          
          <TouchableOpacity 
            style={[styles.messageButton, messageLoading && styles.messageButtonDisabled]} 
            onPress={handleMessagePress}
            disabled={messageLoading}
          >
            {messageLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="chatbubble-ellipses" size={24} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Profile Picture Section */}
          <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImageWrapper}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryLight]}
                style={styles.profileImageBorder}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
              >
                <Image
                  source={
                    userProfile.profile_picture
                      ? { uri: userProfile.profile_picture }
                      : require('../assets/images/user.png')
                  }
                  style={styles.profileImage}
                />
              </LinearGradient>
              {userProfile.is_verified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                </View>
              )}
            </View>
            <LinearGradient
              colors={[COLORS.surface, COLORS.surfaceVariant]}
              style={styles.profileStatusContainer}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
            >
              <View style={[styles.statusDot, { backgroundColor: userProfile.active ? COLORS.success : COLORS.error }]} />
              <Text style={styles.statusText}>{userProfile.active ? 'Online' : 'Offline'}</Text>
            </LinearGradient>
          </View>
          
          <Text style={styles.userName}>{userProfile.name}</Text>
          <Text style={styles.username}>@{userProfile.username}</Text>
          
          {userProfile.bio && (
              <LinearGradient
                colors={[COLORS.surface, COLORS.surfaceVariant]}
                style={styles.bioContainer}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
              >
                <Text style={styles.bio}>{userProfile.bio}</Text>
              </LinearGradient>
          )}
            </View>

        {/* Quick Stats */}
          <View style={styles.statsSection}>
            <View style={styles.statsRow}>
            {renderStatCard('calendar-outline', age || 'N/A', 'Age')}
              {renderStatCard('location-outline', userProfile.city || 'N/A', 'City')}
              {renderStatCard('time-outline', userProfile.selected_age ? `${userProfile.selected_age}y` : 'N/A', 'Selected')}
            </View>
          </View>

          {/* Profile Information */}
          <View style={styles.infoSection}>
            <View style={styles.sectionHeader}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryLight]}
                style={styles.sectionIconContainer}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
              >
                <Ionicons name="person-circle-outline" size={24} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.sectionTitle}>Profile Information</Text>
            </View>
            
            <LinearGradient
              colors={[COLORS.surface, COLORS.surfaceVariant]}
              style={styles.infoCard}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
            >
              {renderInfoItem('person-outline', 'Full Name', userProfile.name)}
              {renderInfoItem('at-outline', 'Username', userProfile.username)}
              {renderInfoItem('mail-outline', 'Email Address', userProfile.user_email)}
              {renderInfoItem('call-outline', 'Mobile Number', userProfile.mobile_number)}
              {renderInfoItem('calendar-outline', 'Date of Birth', formatDate(userProfile.date_of_birth))}
              {age && renderInfoItem('time-outline', 'Age', `${age} years old`)}
              {renderInfoItem('male-female-outline', 'Gender', userProfile.gender)}
              {renderInfoItem('location-outline', 'City', userProfile.city)}
              {renderInfoItem('home-outline', 'Address', userProfile.address)}
              {renderInfoItem('time-outline', 'Selected Age', userProfile.selected_age ? `${userProfile.selected_age} years` : null)}
              {renderInfoItem('checkmark-circle-outline', 'Account Status', userProfile.active ? 'Active' : 'Inactive')}
              {renderInfoItem('calendar-outline', 'Member Since', formatDate(userProfile.created_at), true)}
            </LinearGradient>
          </View>

        {/* Media Section */}
        {(userProfile.images?.length > 0 || userProfile.videos?.length > 0) && (
          <View style={styles.mediaSection}>
            <View style={styles.sectionHeader}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryLight]}
                style={styles.sectionIconContainer}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
              >
                <Ionicons name="images-outline" size={24} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.sectionTitle}>Media</Text>
            </View>
            
            <LinearGradient
              colors={[COLORS.surface, COLORS.surfaceVariant]}
              style={styles.mediaCard}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
            >
              {userProfile.images?.length > 0 && (
                <View style={styles.mediaItem}>
                  <View style={styles.mediaIconContainer}>
                    <Ionicons name="images" size={24} color={COLORS.primary} />
                  </View>
                  <View style={styles.mediaContent}>
                    <Text style={styles.mediaCount}>{userProfile.images.length}</Text>
                    <Text style={styles.mediaLabel}>Photos</Text>
                  </View>
                </View>
              )}
              
              {userProfile.videos?.length > 0 && (
                <View style={styles.mediaItem}>
                  <View style={styles.mediaIconContainer}>
                    <Ionicons name="videocam" size={24} color={COLORS.primary} />
                  </View>
                  <View style={styles.mediaContent}>
                    <Text style={styles.mediaCount}>{userProfile.videos.length}</Text>
                    <Text style={styles.mediaLabel}>Videos</Text>
                  </View>
                </View>
              )}
            </LinearGradient>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          {/* Call Buttons Row */}
          <View style={styles.callButtonsRow}>
            <CallInvitationButton
              targetUser={userProfile}
              isVideoCall={false}
              onCallStarted={() => console.log('Audio call started with:', userProfile.name)}
              onCallFailed={(error) => {
                Alert.alert('Call Failed', error.message || 'Unable to start audio call');
              }}
              style={styles.callButton}
            />
            
            <CallInvitationButton
              targetUser={userProfile}
              isVideoCall={true}
              onCallStarted={() => console.log('Video call started with:', userProfile.name)}
              onCallFailed={(error) => {
                Alert.alert('Call Failed', error.message || 'Unable to start video call');
              }}
              style={styles.callButton}
            />
          </View>
          
          {/* Message Button */}
          <TouchableOpacity 
            style={[styles.primaryButton, messageLoading && styles.primaryButtonDisabled]} 
            onPress={handleMessagePress}
            disabled={messageLoading}
          >
            <LinearGradient
              colors={messageLoading ? [COLORS.textTertiary, COLORS.textTertiary] : [COLORS.primary, COLORS.primaryLight]}
              style={styles.primaryButtonGradient}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
            >
              {messageLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="chatbubble-ellipses" size={20} color="#FFFFFF" />
              )}
              <Text style={styles.primaryButtonText}>
                {messageLoading ? 'Starting Chat...' : 'Send Message'}
              </Text>
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
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
  },
  loadingCard: {
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 32,
  },
  errorCard: {
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  errorText: {
    marginTop: 20,
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
  },
  retryButton: {
    marginTop: 32,
    borderRadius: 16,
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  retryButtonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  headerWrapper: {
    position: 'relative',
    paddingTop: 20,
    paddingBottom: 30,
    overflow: 'hidden',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerDecorationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  headerDecoration1: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerDecoration2: {
    position: 'absolute',
    bottom: -100,
    left: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerDecoration3: {
    position: 'absolute',
    top: 50,
    left: '50%',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerDecoration4: {
    position: 'absolute',
    top: 120,
    right: '20%',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  headerTitleContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  headerAccent: {
    position: 'absolute',
    bottom: -6,
    width: 32,
    height: 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 1.5,
  },
  messageButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  messageButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowOpacity: 0.1,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingTop: 24,
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImageWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  profileImageBorder: {
    width: 128,
    height: 128,
    borderRadius: 64,
    padding: 4,
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.surfaceVariant,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  profileStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  username: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 16,
    fontWeight: '600',
  },
  bioContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderRadius: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  bio: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  statsSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  statIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  infoSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginLeft: 12,
  },
  infoCard: {
    borderRadius: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  infoItemLast: {
    borderBottomWidth: 0,
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  infoArrow: {
    marginLeft: 8,
  },
  mediaSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  mediaCard: {
    borderRadius: 20,
    padding: 24,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  mediaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  mediaIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  mediaContent: {
    flex: 1,
  },
  mediaCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  mediaLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  actionSection: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  callButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  callButton: {
    flex: 1,
    borderRadius: 16,
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  primaryButton: {
    borderRadius: 16,
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  primaryButtonGradient: {
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  primaryButtonDisabled: {
    shadowOpacity: 0.1,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
});

export default UserDetailsScreen; 