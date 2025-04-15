import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  ImageBackground,
  StatusBar 
} from 'react-native';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import Clipboard from '@react-native-clipboard/clipboard';

// Dummy user data
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
  { id: 'daily', icon: 'gift-outline', title: 'Daily Bonus', type: 'ionicons' },
  { id: 'credits', icon: 'star-outline', title: 'Credits', count: 0, type: 'ionicons' },
  { id: 'package', icon: 'cube-outline', title: 'Package', type: 'ionicons' },
  { id: 'level', icon: 'shield-outline', title: 'My Level', type: 'ionicons' },
  { id: 'invite', icon: 'mail-outline', title: 'Invite to get bonus', type: 'ionicons' },
  { id: 'bind', icon: 'mail-outline', title: 'Bind invitation code', type: 'ionicons' }
];

const ProfileScreen = () => {
  const dispatch = useDispatch();
  const [user] = useState(dummyUser); // In real app, this would come from Redux or context
  
  const handleLogout = () => {
    dispatch(logout());
  };
  
  const copyUserId = () => {
    Clipboard.setString(user.userId);
    // Show toast or alert that ID was copied
  };
  
  const handleVerify = () => {
    // Handle verification process
    console.log('Starting verification process');
  };
  
  const handleTokenPress = () => {
    // Navigate to tokens screen
    console.log('Navigate to tokens screen');
  };
  
  const handleVIPPress = () => {
    // Navigate to VIP subscription screen
    console.log('Navigate to VIP subscription screen');
  };
  
  const handleMenuItemPress = (id) => {
    console.log(`Menu item pressed: ${id}`);
    // Handle different menu items
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6C63FF" />
      
      {/* Curved header background */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={['#6C63FF', '#8E64FF']}
          style={styles.headerGradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
        />
        
        {/* Header buttons */}
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="settings-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="share-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Profile section with avatar */}
      <View style={styles.profileContainer}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: user.avatar }} 
              style={styles.avatar} 
              resizeMode="cover"
            />
          </View>
        </View>
        
        {/* Username and ID */}
        <View style={styles.userInfoContainer}>
          <View style={styles.usernameContainer}>
            <Text style={styles.username}>{user.username}</Text>
            {user.isVerified ? (
              <View style={styles.verifiedBadge}>
                <Icon name="checkmark-circle" size={16} color="#6C63FF" />
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.verifyButton}
                onPress={handleVerify}
              >
                <Text style={styles.verifyText}>Go Verify</Text>
                <Icon name="chevron-forward" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.idContainer}
            onPress={copyUserId}
          >
            <Text style={styles.idText}>ID: {user.userId}</Text>
            <Icon name="copy-outline" size={16} color="#999999" style={styles.copyIcon} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Tokens and VIP Cards */}
      <View style={styles.cardsContainer}>
        <TouchableOpacity 
          style={styles.tokenCard}
          onPress={handleTokenPress}
        >
          <LinearGradient
            colors={['#B37FFF', '#6C63FF']}
            style={styles.cardGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
          >
            <View style={styles.cardContent}>
              <View style={styles.cardIconContainer}>
                <Icon name="key" size={24} color="#FFC107" />
              </View>
              <Text style={styles.tokenAmount}>{user.tokens}</Text>
              <Text style={styles.cardLabel}>Tokens</Text>
              <Icon name="chevron-forward" size={20} color="#FFFFFF" style={styles.cardArrow} />
            </View>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.vipCard}
          onPress={handleVIPPress}
        >
          <LinearGradient
            colors={['#FF9D80', '#FF7D6B']}
            style={styles.cardGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
          >
            <View style={styles.cardContent}>
              <View style={styles.cardIconContainer}>
                <Icon name="crown" size={24} color="#FFC107" />
              </View>
              <Text style={styles.cardLabel}>VIP</Text>
              <Text style={styles.vipText}>Get VIP</Text>
              <Icon name="chevron-forward" size={20} color="#FFFFFF" style={styles.cardArrow} />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
      
      {/* Menu Items */}
      <ScrollView style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity 
            key={item.id}
            style={[
              styles.menuItem, 
              index === menuItems.length - 1 ? styles.lastMenuItem : null
            ]}
            onPress={() => handleMenuItemPress(item.id)}
          >
            <View style={styles.menuIconContainer}>
              {item.type === 'ionicons' ? (
                <Icon name={item.icon} size={24} color="#333333" />
              ) : (
                <MaterialIcons name={item.icon} size={24} color="#333333" />
              )}
            </View>
            
            <Text style={styles.menuText}>{item.title}</Text>
            
            {item.id === 'credits' && (
              <View style={styles.creditsContainer}>
                <Text style={styles.creditsText}>{user.credits}</Text>
              </View>
            )}
            
            <Icon name="chevron-forward" size={20} color="#CCCCCC" style={styles.menuArrow} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    height: 140,
    position: 'relative',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  profileContainer: {
    marginTop: -50,
    paddingHorizontal: 20,
  },
  avatarWrapper: {
    alignItems: 'center',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    backgroundColor: '#F0F0F0',
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  userInfoContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  verifiedBadge: {
    marginLeft: 8,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6C63FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginLeft: 8,
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
    marginTop: 5,
  },
  idText: {
    fontSize: 14,
    color: '#999999',
  },
  copyIcon: {
    marginLeft: 5,
  },
  cardsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 20,
  },
  tokenCard: {
    flex: 1,
    marginRight: 8,
    borderRadius: 16,
    overflow: 'hidden',
    height: 80,
  },
  vipCard: {
    flex: 1,
    marginLeft: 8,
    borderRadius: 16,
    overflow: 'hidden',
    height: 80,
  },
  cardGradient: {
    flex: 1,
  },
  cardContent: {
    flex: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  tokenAmount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 5,
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
  },
  menuContainer: {
    flex: 1,
    marginTop: 20,
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuText: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
  },
  creditsContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    marginRight: 10,
  },
  creditsText: {
    fontSize: 14,
    color: '#6C63FF',
    fontWeight: 'bold',
  },
  menuArrow: {
    marginLeft: 'auto',
  },
});

export default ProfileScreen; 