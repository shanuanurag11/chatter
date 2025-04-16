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
  Dimensions
} from 'react-native';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { logout } from '../../store/slices/authSlice';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

// Import colors from constants 
import Colors from '../../constants/colors';

const { width } = Dimensions.get('window');

// Dummy API URL for later replacement
const API_BASE_URL = 'https://api.example.com/v1';

// Dummy user data - this would be fetched from the API in a real app
const dummyUser = {
  username: 'user3lGhMk98',
  userId: '109943032',
  tokens: 3,
  isVerified: false,
  avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
  credits: 0,
  level: {
    current: 1,
    progress: 30
  }
};

// Menu items data
const menuItems = [
  { id: 'daily', icon: 'gift-outline', title: 'Daily Bonus', type: 'ionicons', badge: 'New' },
  { id: 'credits', icon: 'star-outline', title: 'Credits', count: 0, type: 'ionicons' },
  { id: 'package', icon: 'cube-outline', title: 'Package', type: 'ionicons' },
  { id: 'level', icon: 'shield-outline', title: 'My Level', type: 'ionicons' },
  { id: 'invite', icon: 'mail-outline', title: 'Invite to get bonus', type: 'ionicons' },
  { id: 'bind', icon: 'mail-outline', title: 'Bind invitation code', type: 'ionicons' }
];

const ProfileScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [user] = useState(dummyUser); // In real app, this would come from API via Redux or Context
  
  // Animated values for interactions
  const cardScale = useRef(new Animated.Value(1)).current;
  const avatarAnim = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  
  // Animate elements when component mounts
  useEffect(() => {
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
  }, []);
  
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
  
  // In a real app, these functions would make API calls
  const handleLogout = () => {
    dispatch(logout());
  };
  
  // Navigate to edit profile screen
  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };
  
  const copyUserId = () => {
    // In a real app, this would use the Clipboard API and show a toast
    console.log('Copied ID:', user.userId);
  };
  
  const handleVerify = () => {
    // In a real app, this would navigate to verification screen
    console.log('Starting verification process');
  };
  
  const handleTokenPress = () => {
    // In a real app, this would navigate to tokens screen
    console.log('Navigate to tokens screen');
  };
  
  const handleVIPPress = () => {
    // In a real app, this would navigate to VIP subscription screen
    console.log('Navigate to VIP subscription screen');
  };
  
  const handleMenuItemPress = (id) => {
    // In a real app, this would handle different menu actions
    console.log(`Menu item pressed: ${id}`);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={Colors.primary} 
        animated={true}
      />
      
      {/* Enhanced curved header background */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={[Colors.gradientStart, Colors.gradientEnd]}
          style={styles.headerGradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
        />
        
        {/* Top decorative circles */}
        <View style={styles.headerDecorationContainer}>
          <View style={styles.headerDecoration1} />
          <View style={styles.headerDecoration2} />
          <View style={styles.headerDecoration3} />
        </View>
        
        {/* Header buttons */}
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.iconButton} onPress={handleEditProfile}>
            <Icon name="create-outline" size={22} color={Colors.white} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="notifications-outline" size={22} color={Colors.white} />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="settings-outline" size={22} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Profile section with animated avatar */}
      <View style={styles.profileContainer}>
        <Animated.View style={[styles.avatarWrapper, avatarAnimStyle]}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: user.avatar }} 
              style={styles.avatar} 
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.1)']}
              style={styles.avatarOverlay}
            />
          </View>
          <View style={styles.avatarRing} />
        </Animated.View>
        
        {/* Username and ID */}
        <Animated.View style={[styles.userInfoContainer, contentAnimStyle]}>
          <View style={styles.usernameContainer}>
            <Text style={styles.username}>{user.username}</Text>
            {user.isVerified ? (
              <View style={styles.verifiedBadge}>
                <Icon name="checkmark-circle" size={16} color={Colors.primary} />
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.verifyButton}
                onPress={handleVerify}
              >
                <Text style={styles.verifyText}>Go Verify</Text>
                <Icon name="chevron-forward" size={14} color={Colors.white} />
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.idContainer}
            onPress={copyUserId}
          >
            <Text style={styles.idText}>ID: {user.userId}</Text>
            <Icon name="copy-outline" size={14} color="#999999" style={styles.copyIcon} />
          </TouchableOpacity>
        </Animated.View>
      </View>
      
      {/* Enhanced Tokens and VIP Cards with subtle animation */}
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
                <Icon name="key" size={22} color="#FFC107" />
              </View>
              <Text style={styles.tokenAmount}>{user.tokens}</Text>
              <Text style={styles.cardLabel}>Tokens</Text>
              <Icon name="chevron-forward" size={18} color={Colors.white} style={styles.cardArrow} />
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
                <Icon name="crown" size={22} color="#FFC107" />
              </View>
              <Text style={styles.cardLabel}>VIP</Text>
              <Text style={styles.vipText}>Get VIP</Text>
              <Icon name="chevron-forward" size={18} color={Colors.white} style={styles.cardArrow} />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
      
      {/* Animated level progress bar */}
      <Animated.View style={[styles.levelContainer, contentAnimStyle]}>
        <View style={styles.levelHeader}>
          <Text style={styles.levelTitle}>Level {user.level.current}</Text>
          <Text style={styles.levelPercent}>{user.level.progress}%</Text>
        </View>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, {width: `${user.level.progress}%`}]} />
        </View>
      </Animated.View>
      
      {/* Enhanced Menu Items */}
      <ScrollView 
        style={styles.menuContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.menuContentContainer}
      >
        {menuItems.map((item, index) => (
          <TouchableOpacity 
            key={item.id}
            style={[
              styles.menuItem, 
              index === menuItems.length - 1 ? styles.lastMenuItem : null
            ]}
            onPress={() => handleMenuItemPress(item.id)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.menuIconContainer,
              item.id === 'daily' ? styles.menuIconHighlighted : null
            ]}>
              {item.type === 'ionicons' ? (
                <Icon name={item.icon} size={22} color={item.id === 'daily' ? Colors.white : Colors.textDark} />
              ) : (
                <MaterialIcons name={item.icon} size={22} color={item.id === 'daily' ? Colors.white : Colors.textDark} />
              )}
            </View>
            
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuText}>{item.title}</Text>
              {item.badge && (
                <View style={styles.menuBadge}>
                  <Text style={styles.menuBadgeText}>{item.badge}</Text>
                </View>
              )}
            </View>
            
            {item.id === 'credits' && (
              <View style={styles.creditsContainer}>
                <Text style={styles.creditsText}>{user.credits}</Text>
              </View>
            )}
            
            <Icon name="chevron-forward" size={18} color="#CCCCCC" style={styles.menuArrow} />
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* Logout button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="log-out-outline" size={22} color={Colors.primary} style={styles.logoutIcon} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerContainer: {
    height: 160,
    position: 'relative',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
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
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerDecoration2: {
    position: 'absolute',
    bottom: -60,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerDecoration3: {
    position: 'absolute',
    top: 40,
    left: width * 0.3,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 12,
    paddingHorizontal: 20,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF5252',
    top: 8,
    right: 8,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  profileContainer: {
    marginTop: -70,
    paddingHorizontal: 20,
  },
  avatarWrapper: {
    alignItems: 'center',
    position: 'relative',
  },
  avatarContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#F0F0F0',
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
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
    width: 124,
    height: 124,
    borderRadius: 62,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    top: -7,
  },
  userInfoContainer: {
    alignItems: 'center',
    marginTop: 14,
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    textShadowColor: 'rgba(0,0,0,0.05)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 3,
  },
  verifiedBadge: {
    marginLeft: 8,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    marginLeft: 8,
    elevation: 3,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  verifyText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 2,
  },
  idContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingVertical: 3,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 12,
  },
  idText: {
    fontSize: 14,
    color: '#777777',
  },
  copyIcon: {
    marginLeft: 4,
  },
  cardsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 22,
  },
  tokenCard: {
    flex: 1,
    marginRight: 10,
    borderRadius: 16,
    overflow: 'hidden',
    height: 80,
    elevation: 4,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    position: 'relative',
  },
  vipCard: {
    flex: 1,
    marginLeft: 10,
    borderRadius: 16,
    overflow: 'hidden',
    height: 80,
    elevation: 4,
    shadowColor: '#FF7D6B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    position: 'relative',
  },
  cardGradient: {
    flex: 1,
    position: 'relative',
  },
  cardContent: {
    flex: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    position: 'relative',
    zIndex: 2,
  },
  cardPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.05,
    zIndex: 1,
    backgroundColor: 'transparent',
    borderTopWidth: 80,
    borderLeftWidth: 80,
    borderStyle: 'solid',
    borderTopColor: 'white',
    borderLeftColor: 'transparent',
  },
  cardIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  tokenAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 5,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 3,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  vipText: {
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
  },
  cardArrow: {
    marginLeft: 'auto',
    opacity: 0.8,
  },
  levelContainer: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555555',
  },
  levelPercent: {
    fontSize: 14,
    color: '#888888',
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  menuContainer: {
    flex: 1,
    marginTop: 24,
  },
  menuContentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuIconHighlighted: {
    backgroundColor: Colors.primary,
  },
  menuTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 16,
    color: '#333333',
  },
  menuBadge: {
    backgroundColor: '#FF5252',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  menuBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  creditsContainer: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    marginRight: 12,
  },
  creditsText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  menuArrow: {
    marginLeft: 'auto',
    opacity: 0.6,
  },
  logoutButton: {
    position: 'absolute',
    bottom: 20,
    left: width / 2 - 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    width: 140,
    height: 44,
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutIcon: {
    marginRight: 6,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.primary,
  },
});

export default ProfileScreen; 