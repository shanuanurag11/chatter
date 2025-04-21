import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator,
  Animated
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../constants/colors';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// API URL for fetching VIP data (replace with your real endpoint when ready)
const API_BASE_URL = 'https://api.example.com/v1';

// Dummy VIP subscription plans data
const DUMMY_VIP_PACKAGES = [
  {
    id: '1',
    title: '1',
    period: 'month',
    price: 308,
    pricePerMonth: 308.00,
    currency: 'Rs',
    isPopular: false,
    isSelected: false
  },
  {
    id: '2',
    title: '3',
    period: 'month',
    price: 672,
    pricePerMonth: 224.00,
    currency: 'Rs',
    isPopular: true,
    isSelected: true,
    tag: 'HOT'
  },
  {
    id: '3',
    title: '6',
    period: 'month',
    price: 1179,
    pricePerMonth: 196.50,
    currency: 'Rs',
    isPopular: false,
    isSelected: false
  }
];

// Dummy VIP privileges data
const DUMMY_VIP_PRIVILEGES = [
  {
    id: '1',
    title: 'Match Tickets',
    description: 'Get 10 Match Tickets per day',
    iconName: 'ticket-outline',
    count: 20,
    unit: 's'
  },
  {
    id: '2',
    title: 'Unlimited Chat',
    description: 'Chat with anyone without limits',
    iconName: 'chatbubbles-outline'
  },
  {
    id: '3',
    title: 'Video Calls',
    description: 'Make video calls with VIP priority',
    iconName: 'videocam-outline',
    count: 5,
    unit: 'min'
  }
];

// Dummy user data
const DUMMY_USER_DATA = {
  username: 'user3IGhMk98',
  avatar: null, // This would be a URL in a real app
  isVip: false,
};

// Component for privileges carousel item
const PrivilegeCard = ({ item, index, scrollX }) => {
  const inputRange = [
    (index - 1) * 220,
    index * 220,
    (index + 1) * 220,
  ];
  
  const scale = scrollX.interpolate({
    inputRange,
    outputRange: [0.85, 1, 0.85],
    extrapolate: 'clamp',
  });
  
  const opacity = scrollX.interpolate({
    inputRange,
    outputRange: [0.7, 1, 0.7],
    extrapolate: 'clamp',
  });
  
  return (
    <Animated.View style={[
      styles.privilegeCard,
      { transform: [{ scale }], opacity }
    ]}>
      <View style={styles.privilegeIconContainer}>
        <LinearGradient
          colors={['#8E64FF', '#6C63FF']}
          style={styles.privilegeIconFallback}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
        >
          <Ionicons 
            name={item.iconName} 
            size={28} 
            color="#FFFFFF" 
          />
        </LinearGradient>
      </View>
      <Text style={styles.privilegeTitle}>
        {item.title} {item.count ? `(${item.count}${item.unit})` : ''}
      </Text>
      <Text style={styles.privilegeDescription}>{item.description}</Text>
    </Animated.View>
  );
};

const VipSubscriptionScreen = () => {
  const navigation = useNavigation();
  const [packages, setPackages] = useState([]);
  const [privileges, setPrivileges] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const scrollX = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Fetch VIP data
    fetchVipData();
    
    // Start animations after a slight delay
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        })
      ]).start();
    }, 100);
  }, []);
  
  const fetchVipData = async () => {
    try {
      // Simulate API calls
      setTimeout(() => {
        // Initialize with dummy data
        setPackages(DUMMY_VIP_PACKAGES);
        setPrivileges(DUMMY_VIP_PRIVILEGES);
        setUserData(DUMMY_USER_DATA);
        
        // Find the default selected package
        const defaultSelected = DUMMY_VIP_PACKAGES.find(pkg => pkg.isSelected);
        setSelectedPackage(defaultSelected || DUMMY_VIP_PACKAGES[0]);
        
        setLoading(false);
      }, 1000);
      
      // In a real app, you would use actual API calls:
      // const packagesResponse = await fetch(`${API_BASE_URL}/vip/packages`);
      // const packagesData = await packagesResponse.json();
      // setPackages(packagesData);
      
      // const privilegesResponse = await fetch(`${API_BASE_URL}/vip/privileges`);
      // const privilegesData = await privilegesResponse.json();
      // setPrivileges(privilegesData);
      
      // const userResponse = await fetch(`${API_BASE_URL}/user/profile`);
      // const userData = await userResponse.json();
      // setUserData(userData);
    } catch (error) {
      console.error('Failed to fetch VIP data:', error);
      setError('Failed to load VIP subscription options. Please try again.');
      setLoading(false);
    }
  };
  
  const handleGoBack = () => {
    navigation.goBack();
  };
  
  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg);
    
    // Updated packages with new selection
    setPackages(packages.map(item => ({
      ...item,
      isSelected: item.id === pkg.id
    })));
  };
  
  const handleSubscribe = () => {
    if (!selectedPackage) return;
    
    // In a real app, navigate to payment or show payment modal
    console.log(`Subscribing to ${selectedPackage.title} month package for ${selectedPackage.currency}${selectedPackage.price}`);
    alert(`Subscribing to ${selectedPackage.title} month VIP for ${selectedPackage.currency}${selectedPackage.price}`);
  };
  
  const goToTokensScreen = () => {
    navigation.navigate('Tokens');
  };
  
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading VIP options...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
        <View style={styles.errorContent}>
          <Ionicons name="alert-circle-outline" size={70} color="#FF5252" />
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={fetchVipData}
          >
            <LinearGradient
              colors={[Colors.primaryLight, Colors.primary]}
              style={styles.retryButtonGradient}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <LinearGradient
      colors={['#6C63FF', '#3A3897', '#24225B']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Premium Memberships</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Current Subscription Status */}
          <View style={styles.compactUserCard}>
            <LinearGradient
              colors={['rgba(108, 99, 255, 0.7)', 'rgba(72, 66, 179, 0.9)']}
              style={styles.userCardGradient}
            >
              <View style={styles.userCardContent}>
                <View style={styles.avatarContainer}>
                  {userData?.avatar ? (
                    <Image source={{ uri: userData.avatar }} style={styles.avatar} />
                  ) : (
                    <View style={styles.userAvatarFallback}>
                      <Ionicons name="person" size={24} color="#888" />
                    </View>
                  )}
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{userData?.username}</Text>
                  <Text style={styles.userStatus}>{userData?.isVip ? 'VIP' : 'Free Plan'}</Text>
                </View>
                <View style={styles.tokenInfo}>
                  <Text style={styles.tokenLabel}>Current Tokens</Text>
                  <View style={styles.tokenValueContainer}>
                    <MaterialCommunityIcons name="diamond-stone" size={16} color="#FFC107" />
                    <Text style={styles.tokenValue}>{userData?.tokens || '0'}</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Title Section */}
          <View style={styles.sectionTitleContainer}>
            <MaterialIcons name="star" size={20} color="#FFC107" style={styles.sectionTitleIcon} />
            <Text style={styles.sectionTitle}>VIP Subscription Plans</Text>
          </View>

          {/* Subscription Plans */}
          <View style={styles.planCardsContainer}>
            {packages.map((plan, index) => (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planCard,
                  plan.id === selectedPackage.id && styles.selectedPlan,
                ]}
                onPress={() => handleSelectPackage(plan)}
                activeOpacity={0.85}
              >
                {plan.isPopular && (
                  <View style={[styles.planBadge, { backgroundColor: plan.isPopular ? Colors.primary : Colors.primaryLight }]}>
                    <Text style={styles.planBadgeText}>{plan.isPopular ? 'HOT' : ''}</Text>
                  </View>
                )}
                
                <View style={styles.planTextContainer}>
                  <Text style={styles.planTitle} numberOfLines={1} ellipsizeMode="tail">
                    {plan.title}
                  </Text>
                  <Text style={styles.planPrice} numberOfLines={1} ellipsizeMode="tail">
                    {plan.currency}{plan.price.toFixed(0)}
                  </Text>
                  <Text style={styles.planPeriod} numberOfLines={1} ellipsizeMode="tail">
                    per {plan.period}
                  </Text>
                </View>
                
                <View style={styles.planDivider} />
                <View style={styles.benefitsContainer}>
                  {privileges.slice(0, 3).map((item, i) => (
                    <View key={i} style={styles.benefitItem}>
                      <Ionicons name="checkmark-circle" size={12} color="#6C63FF" />
                      <Text style={styles.benefitText} numberOfLines={1} ellipsizeMode="tail">
                        {item.title}
                      </Text>
                    </View>
                  ))}
                </View>
                
                {/* Selected plan indicator */}
                {plan.id === selectedPackage.id && (
                  <View style={styles.selectedIndicator}>
                    <Text style={styles.selectedIndicatorText}>SELECTED</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Purchase Button */}
          <TouchableOpacity style={styles.purchaseButton} onPress={handleSubscribe} activeOpacity={0.8}>
            <LinearGradient
              colors={['#8F87FF', '#6C63FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.purchaseButtonGradient}
            >
              <Text style={styles.purchaseButtonText} numberOfLines={1} ellipsizeMode="tail">
                Subscribe for {selectedPackage?.currency}{selectedPackage?.price.toFixed(0)}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Token Purchase Link */}
          <TouchableOpacity style={styles.tokenPurchaseLink} onPress={goToTokensScreen}>
            <Ionicons name="diamond-outline" size={18} color="#FFF" style={styles.tokenLinkIcon} />
            <Text style={styles.tokenLinkText}>Buy Tokens Instead</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: Colors.textMedium,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#555',
    marginTop: 20,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginBottom: 30,
    maxWidth: '80%',
  },
  retryButton: {
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  retryButtonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
  },
  headerRight: {
    width: 42,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  
  // Section title styles
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 10,
  },
  sectionTitleIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#FFF',
  },
  
  // Compact user card styles
  compactUserCard: {
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: 'rgba(0,0,0,0.3)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    overflow: 'hidden',
  },
  userCardGradient: {
    borderRadius: 20,
    padding: 20,
  },
  userCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  userAvatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  userStatus: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  tokenInfo: {
    alignItems: 'flex-end',
    minWidth: 90,
    maxWidth: 100,
  },
  tokenLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  tokenValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    justifyContent: 'center',
  },
  tokenValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
    marginLeft: 6,
  },
  
  // Plan cards - reduced height and adjusted spacing
  planCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
    marginHorizontal: 4,
    maxWidth: '32.5%',
  },
  selectedPlan: {
    borderColor: '#FFC107',
    borderWidth: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    transform: [{scale: 1.01}],
  },
  planTextContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 6,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 6,
    marginBottom: 2,
    textAlign: 'center',
  },
  planPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
  },
  planPeriod: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 6,
    textAlign: 'center',
  },
  planDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginTop: 6,
    marginBottom: 8,
  },
  benefitsContainer: {
    paddingHorizontal: 1,
    marginBottom: 4,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    paddingVertical: 0,
  },
  benefitText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: 4,
    flex: 1,
  },
  
  // Purchase button
  purchaseButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    marginTop: 8,
    shadowColor: 'rgba(108, 99, 255, 0.6)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  purchaseButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  purchaseButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginRight: 10,
    letterSpacing: 0.5,
  },
  
  // Token purchase link
  tokenPurchaseLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  tokenLinkIcon: {
    marginRight: 8,
  },
  tokenLinkText: {
    fontSize: 15,
    color: '#FFF',
    fontWeight: '500',
  },
  
  // Adjust badge positions for smaller card
  planBadge: {
    position: 'absolute',
    top: -8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    zIndex: 10,
    elevation: 4,
    shadowColor: 'rgba(0,0,0,0.3)',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  planBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  
  // Adjust indicator position for smaller card
  selectedIndicator: {
    position: 'absolute',
    bottom: -10,
    alignSelf: 'center',
    backgroundColor: '#FFC107',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    zIndex: 10,
    elevation: 4,
    shadowColor: 'rgba(0,0,0,0.3)',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  selectedIndicatorText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  
  // Plan cards container
  planCardsContainer: {
    flexDirection: 'row',
    marginBottom: 20, // Reduced from 24
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
});

export default VipSubscriptionScreen; 