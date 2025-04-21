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
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../constants/colors';

// Dummy token packages data
const DUMMY_TOKEN_PACKAGES = [
  {
    id: '1',
    tokenAmount: 10,
    price: 0,
    originalPrice: 0,
    discount: null,
    isFree: true,
    currency: 'Rs',
    isPopular: false,
    label: null
  },
  {
    id: '2',
    tokenAmount: 340,
    price: 308,
    originalPrice: 398,
    discount: null,
    isFree: false,
    currency: 'Rs',
    isPopular: false,
    label: null
  },
  {
    id: '3',
    tokenAmount: 880,
    price: 744,
    originalPrice: 826.67,
    discount: '10% OFF',
    isFree: false,
    currency: 'Rs',
    isPopular: false,
    label: null
  },
  {
    id: '4',
    tokenAmount: 1800,
    price: 1469,
    originalPrice: 1728.24,
    discount: '15% OFF',
    isFree: false,
    currency: 'Rs',
    isPopular: true,
    label: '🔥'
  },
  {
    id: '5',
    tokenAmount: 4000,
    price: 2999,
    originalPrice: 3749,
    discount: '20% OFF',
    isFree: false,
    currency: 'Rs',
    isPopular: false,
    label: null
  },
  {
    id: '6',
    tokenAmount: 10000,
    price: 7499,
    originalPrice: 9999,
    discount: '25% OFF',
    isFree: false,
    currency: 'Rs',
    isPopular: false,
    label: 'Best Value'
  },
];

// Dummy token usage data
const DUMMY_TOKEN_USAGE = {
  timeDuration: '00:29:28',
  tokensRemaining: 100,
  videoCallTokens: 2,
  chatTokens: 5,
  currentPrice: 77,
  originalPrice: 181
};

// Token image asset (in a real app, use a real asset)
const TokenIcon = ({ style }) => (
  <View style={[styles.tokenIconContainer, style]}>
    <LinearGradient
      colors={['#FFD700', '#FFA500']}
      style={styles.tokenIconGradient}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
    >
      <Text style={styles.tokenIconText}>C</Text>
    </LinearGradient>
  </View>
);

const TokensScreen = () => {
  const navigation = useNavigation();
  const [packages, setPackages] = useState([]);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Add animated values for enhanced UI
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // In a real app, fetch from API
    fetchTokenPackages();
    
    // Delay animations slightly to prevent jank
    setTimeout(() => {
      // Start animations
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
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        })
      ]).start();
    }, 100);
  }, []);

  const fetchTokenPackages = async () => {
    try {
      // Simulate API call
      setTimeout(() => {
        setPackages(DUMMY_TOKEN_PACKAGES);
        setUsage(DUMMY_TOKEN_USAGE);
        setLoading(false);
      }, 1000);
      
      // In a real app, you would fetch from an API:
      // const response = await fetch('https://api.example.com/token-packages');
      // const data = await response.json();
      // setPackages(data.packages);
      // setUsage(data.usage);
    } catch (error) {
      console.error('Failed to fetch token packages:', error);
      setError('Failed to load token packages. Please try again.');
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const goToVipSubscription = () => {
    navigation.navigate('VipSubscription');
  };

  const handlePurchaseTokens = (tokenPackage) => {
    // In a real app, navigate to payment screen or show payment modal
    console.log('Purchasing package:', tokenPackage);
    alert(`Purchase ${tokenPackage.tokenAmount} tokens for ${tokenPackage.currency}${tokenPackage.price}`);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading tokens...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
        <View style={styles.errorContent}>
          <Icon name="alert-circle-outline" size={70} color="#FF5252" />
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={fetchTokenPackages}
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      
      {/* Enhanced Header with Gradient */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={[Colors.primary, Colors.primaryLight]}
          style={styles.headerGradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
        >
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={handleGoBack}
            >
              <Icon name="chevron-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Tokens</Text>
            <View style={styles.tokenBalanceContainer}>
              <TokenIcon />
              <Text style={styles.tokenBalanceText}>2</Text>
            </View>
          </View>
          
          {/* Add decorative circles for consistency */}
          <View style={styles.headerDecor1} />
          <View style={styles.headerDecor2} />
        </LinearGradient>
        
        {/* Updated shadow for better visual effect */}
        <LinearGradient 
          colors={['rgba(108, 99, 255, 0.08)', 'transparent']}
          style={styles.headerShadow}
          pointerEvents="none"
        />
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Animated Promotional Banner */}
        <Animated.View 
          style={[
            styles.promotionalBanner,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: translateY },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          <LinearGradient
            colors={[Colors.gradientStart, Colors.primary, Colors.primaryDark]}
            style={styles.bannerGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
          >
            {/* Enhanced decorative elements */}
            <View style={styles.decorCircle1} />
            <View style={styles.decorCircle2} />
            <View style={styles.decorCircle3} />
            
            <View style={styles.bannerContent}>
              <View style={styles.bannerTextContainer}>
                <Text style={styles.discountText}>30%OFF</Text>
                <Text style={styles.bannerMainText}>
                  Get <TokenIcon style={styles.inlineTokenIcon} />
                </Text>
                <Text style={styles.bannerSubText}>Every day</Text>
              </View>
              
              <View style={styles.bannerImageContainer}>
                <View style={styles.tokenImageFallback}>
                  <Icon name="gift-outline" size={60} color="#FFF" />
                  <Icon name="cash-outline" size={36} color="#FFD700" style={styles.coinIcon} />
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.bannerButton}
                onPress={goToVipSubscription}
              >
                <Icon name="chevron-forward-outline" size={24} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
        
        {/* Fix VIP Subscription Link */}
        <Animated.View 
          style={[
            styles.vipSubscriptionLink,
            {
              opacity: fadeAnim,
              transform: [{ translateY: Animated.multiply(translateY, 1.2) }]
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.vipLinkTouchable}
            onPress={goToVipSubscription}
            activeOpacity={0.85}
          >
            <View style={styles.vipIconContainer}>
              <Icon name="diamond-outline" size={24} color="#FFF" />
            </View>
            <View style={styles.vipLinkContent}>
              <Text style={styles.vipLinkText}>Get VIP Membership</Text>
              <Text style={styles.vipLinkSubText}>Unlock exclusive features</Text>
            </View>
            <View style={styles.vipLinkBadge}>
              <Text style={styles.vipLinkBadgeText}>Premium</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
        
        {/* Enhanced Current Token Usage Summary */}
        {usage && (
          <Animated.View 
            style={[
              styles.usageSummary,
              {
                opacity: fadeAnim,
                transform: [{ translateY: Animated.multiply(translateY, 1.5) }]
              }
            ]}
          >
            <LinearGradient
              colors={[Colors.primary, '#8B5CF6', '#7C3AED']}
              style={styles.usageSummaryGradient}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
            >
              {/* Enhanced decorative elements */}
              <View style={styles.usageDecor1} />
              <View style={styles.usageDecor2} />
              <View style={styles.usageDecor3} />
              
              <View style={styles.usageTimeContainer}>
                <Icon name="time-outline" size={18} color="#FFF" style={styles.usageIcon} />
                <Text style={styles.usageTimeText}>{usage.timeDuration}</Text>
              </View>
              
              <View style={styles.usageDetailsContainer}>
                <View style={styles.usageTokenRow}>
                  <View style={styles.usageTokenItem}>
                    <TokenIcon />
                    <Text style={styles.usageTokenAmount}>{usage.tokensRemaining}</Text>
                  </View>
                  
                  <View style={styles.usageTokenItem}>
                    <View style={styles.usageTokenIcon}>
                      <Icon name="videocam" size={16} color="#FFF" />
                    </View>
                    <Text style={styles.usageTokenAmount}>{usage.videoCallTokens}</Text>
                  </View>
                  
                  <View style={styles.usageTokenItem}>
                    <View style={[styles.usageTokenIcon, styles.chatTokenIcon]}>
                      <Icon name="chatbubble" size={16} color="#FFF" />
                    </View>
                    <Text style={styles.usageTokenAmount}>{usage.chatTokens}</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.usagePriceContainer}>
                <Text style={styles.currentPriceText}>{usage.currency || 'Rs'}{usage.currentPrice}</Text>
                <Text style={styles.originalPriceText}>{usage.currency || 'Rs'}{usage.originalPrice}</Text>
              </View>
            </LinearGradient>
          </Animated.View>
        )}
        
        {/* Title for token packages section */}
        <Animated.Text 
          style={[
            styles.sectionTitle,
            {
              opacity: fadeAnim,
              transform: [{ translateY: Animated.multiply(translateY, 1.6) }]
            }
          ]}
        >
          Choose Token Package
        </Animated.Text>
        
        {/* Token Packages Grid - Fix package item layout */}
        <View style={styles.packageGrid}>
          {packages.map((pkg, index) => (
            <Animated.View
              key={pkg.id}
              style={[
                { 
                  width: '48%',
                  opacity: fadeAnim,
                  transform: [{ 
                    translateY: Animated.multiply(translateY, 1.8 + (index * 0.1)) 
                  }]
                }
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.packageItem,
                  pkg.isPopular && styles.popularPackage
                ]}
                onPress={() => handlePurchaseTokens(pkg)}
                activeOpacity={0.85}
              >
                {pkg.isPopular && (
                  <View style={styles.popularTag}>
                    <Text style={styles.popularTagText}>Popular</Text>
                  </View>
                )}
                
                {pkg.discount && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountBadgeText}>{pkg.discount}</Text>
                  </View>
                )}
                
                {pkg.label && pkg.label !== 'Popular' && (
                  <View style={styles.labelContainer}>
                    <Text style={styles.labelText}>{pkg.label}</Text>
                  </View>
                )}
                
                <View style={styles.packageIconContainer}>
                  {pkg.tokenAmount > 100 ? (
                    <View style={styles.tokenStackFallback}>
                      <LinearGradient
                        colors={['#FFD700', '#FFA500']}
                        style={styles.tokenStackGradient}
                      >
                        <Icon name="cash" size={40} color="#FFF" />
                      </LinearGradient>
                    </View>
                  ) : (
                    <View style={styles.tokenSingleFallback}>
                      <LinearGradient
                        colors={['#FFD700', '#FFA500']}
                        style={styles.tokenSingleGradient}
                      >
                        <Icon name="cash-outline" size={36} color="#FFF" />
                      </LinearGradient>
                    </View>
                  )}
                </View>
                
                <View style={styles.packageTokenAmount}>
                  <TokenIcon />
                  <Text style={styles.packageTokenText}>{pkg.tokenAmount}</Text>
                </View>
                
                {pkg.originalPrice > 0 && pkg.originalPrice !== pkg.price && (
                  <Text style={styles.packageOriginalPrice}>
                    {pkg.currency}{pkg.originalPrice.toFixed(0)}
                  </Text>
                )}
                
                <LinearGradient
                  colors={pkg.isFree 
                    ? ['#4CAF50', '#2E7D32'] 
                    : [Colors.gradientStart, Colors.primary, Colors.primaryDark]
                  }
                  style={styles.packagePriceButton}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                >
                  <Text style={styles.packagePriceText}>
                    {pkg.isFree ? 'Free' : `${pkg.currency}${pkg.price}`}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          ))}
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
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
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
  headerContainer: {
    position: 'relative',
    zIndex: 10,
  },
  headerGradient: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    position: 'relative',
    zIndex: 2,
  },
  headerShadow: {
    height: 16,
    width: '100%',
    position: 'absolute',
    bottom: -16,
    left: 0,
  },
  headerDecor1: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    top: -30,
    right: 20,
    zIndex: 1,
  },
  headerDecor2: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    bottom: -10,
    left: 50,
    zIndex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  tokenBalanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    minWidth: 60,
  },
  tokenBalanceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  tokenIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    elevation: 2,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  tokenIconGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tokenIconText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
    flexGrow: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 16,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  promotionalBanner: {
    height: 170,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  bannerGradient: {
    flex: 1,
    position: 'relative',
  },
  decorCircle1: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
    top: -30,
    right: -30,
  },
  decorCircle2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.08)',
    bottom: -30,
    left: 40,
  },
  decorCircle3: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    top: 20,
    left: 20,
  },
  bannerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    position: 'relative',
  },
  bannerTextContainer: {
    flex: 1,
  },
  discountText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 3,
    letterSpacing: 1,
  },
  bannerMainText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  bannerSubText: {
    fontSize: 24,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  inlineTokenIcon: {
    marginLeft: -6,
  },
  bannerImageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  tokenImageFallback: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  coinIcon: {
    position: 'absolute',
    bottom: 20,
    right: 30,
  },
  bannerButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0,0,0,0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  vipSubscriptionLink: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: 'rgba(150, 51, 255, 0.6)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  vipLinkTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(150, 51, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(150, 51, 255, 0.15)',
    borderRadius: 16,
  },
  vipIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9633FF',
    marginRight: 12,
    shadowColor: '#9633FF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  vipLinkIcon: {
    // Remove marginRight: 0 as it's not needed
  },
  vipLinkContent: {
    flex: 1,
  },
  vipLinkText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9633FF',
  },
  vipLinkSubText: {
    fontSize: 12,
    color: '#9633FF',
    opacity: 0.7,
    marginTop: 2,
    fontWeight: '400',
  },
  vipLinkBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(150, 51, 255, 0.15)',
    borderRadius: 12,
  },
  vipLinkBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9633FF',
  },
  usageSummary: {
    height: 140,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  usageSummaryGradient: {
    flex: 1,
    padding: 16,
    position: 'relative',
  },
  usageDecor1: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: 10,
    left: 10,
  },
  usageDecor2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: -30,
    right: 40,
  },
  usageDecor3: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.12)',
    top: 70,
    left: 80,
  },
  usageTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    position: 'relative',
    zIndex: 1,
  },
  usageIcon: {
    marginRight: 8,
  },
  usageTimeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  usageDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    position: 'relative',
    zIndex: 1,
  },
  usageTokenRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  usageTokenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  usageTokenIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF5252',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  chatTokenIcon: {
    backgroundColor: '#FF9800',
  },
  usageTokenAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 8,
  },
  usagePriceContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    alignItems: 'flex-end',
    zIndex: 1,
  },
  currentPriceText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  originalPriceText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textDecorationLine: 'line-through',
  },
  packageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  packageItem: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    paddingTop: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: 'rgba(108, 99, 255, 0.5)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.08)',
    minHeight: 220,
  },
  popularPackage: {
    borderColor: Colors.primary,
    borderWidth: 2,
    shadowColor: Colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
    paddingTop: 22,
  },
  popularTag: {
    position: 'absolute',
    top: -12,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 5,
  },
  popularTagText: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: Colors.primary,
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 80,
    textAlign: 'center',
  },
  discountBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#FFECF8',
    borderRadius: 12,
    zIndex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 64, 129, 0.15)',
  },
  discountBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF4081',
  },
  labelContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  labelText: {
    fontSize: 20,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  packageIconContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  tokenStackFallback: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tokenStackGradient: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    backgroundColor: '#FFA500',
  },
  tokenSingleFallback: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tokenSingleGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    backgroundColor: '#FFA500',
  },
  packageTokenAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  packageTokenText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginLeft: 6,
  },
  packageOriginalPrice: {
    fontSize: 16,
    color: '#999',
    textDecorationLine: 'line-through',
    marginBottom: 12,
  },
  packagePriceButton: {
    width: '100%',
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    backgroundColor: Colors.primary,
  },
  packagePriceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 0.5,
  },
});

export default TokensScreen; 