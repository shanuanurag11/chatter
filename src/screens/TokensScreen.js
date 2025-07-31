import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Animated,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../constants/colors';
import IAPService from '../services/iapService';

// Token Icon Component
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
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  
  // Animated values
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    initializeIAP();
    
    // Cleanup on unmount
    return () => {
      // Don't cleanup here as other screens might use IAP
    };
  }, []);

  const initializeIAP = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Initializing IAP Service...');
      
      // Override IAP service callbacks to handle purchases in this screen
      IAPService.onPurchaseSuccess = handlePurchaseSuccess;
      IAPService.onPurchaseError = handlePurchaseError;
      IAPService.onPurchasesRestored = handlePurchasesRestored;
      
      // Initialize IAP service
      await IAPService.init();
      
      // Get products
      const fetchedProducts = IAPService.getProducts();
      console.log('Fetched products:', fetchedProducts);
      
      setProducts(fetchedProducts);
      setLoading(false);
      
      // Start fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
      
    } catch (error) {
      console.error('Failed to initialize IAP:', error);
      setError('Failed to load products. Please check your connection and try again.');
      setLoading(false);
    }
  };

  const handlePurchaseSuccess = (purchase) => {
    console.log('Purchase successful:', purchase);
    setPurchasing(false);
    
    const tokenAmount = IAPService.getTokenAmountFromProductId(purchase.productId);
    Alert.alert(
      'Purchase Successful!', 
      `You have successfully purchased ${tokenAmount} tokens!`,
      [{ text: 'OK' }]
    );
    
    // TODO: Update user's token balance in your app state/storage
  };

  const handlePurchaseError = (error) => {
    console.error('Purchase error:', error);
    setPurchasing(false);
    // Error handling is already done in IAPService
  };

  const handlePurchasesRestored = (purchases) => {
    console.log('Purchases restored:', purchases);
    Alert.alert(
      'Purchases Restored', 
      `${purchases.length} purchase(s) have been restored.`,
      [{ text: 'OK' }]
    );
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handlePurchaseProduct = async (product) => {
    try {
      setPurchasing(true);
      console.log('Purchasing product:', product.productId);
      await IAPService.purchaseProduct(product.productId);
    } catch (error) {
      console.error('Purchase failed:', error);
      setPurchasing(false);
    }
  };

  const getTokenAmountFromProductId = (productId) => {
    return IAPService.getTokenAmountFromProductId(productId);
  };

  const formatPrice = (product) => {
    return product.localizedPrice || `$${product.price}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Initializing store...</Text>
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
            onPress={initializeIAP}
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
      
      {/* Header */}
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
            <Text style={styles.headerTitle}>Buy Tokens</Text>
            <View style={styles.tokenBalanceContainer}>
              <TokenIcon />
              <Text style={styles.tokenBalanceText}>{this.userDa}</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Products Title */}
        <Animated.Text 
          style={[
            styles.sectionTitle,
            { opacity: fadeAnim }
          ]}
        >
          Choose Token Package: {products?.length}
        </Animated.Text>
        
        {/* Products Grid */}
        <Animated.View 
          style={[
            styles.productGrid,
            { opacity: fadeAnim }
          ]}
        >
          {products.length === 0 ? (
            <View style={styles.noProductsContainer}>
              <Icon name="storefront-outline" size={60} color="#999" />
              <Text style={styles.noProductsText}>No products available</Text>
              <TouchableOpacity 
                style={styles.refreshButton} 
                onPress={initializeIAP}
              >
                <Text style={styles.refreshButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          ) : (
            products.map((product, index) => (
              <View
                key={product.productId}
                style={styles.productItemContainer}
              >
                <TouchableOpacity
                  style={styles.productItem}
                  onPress={() => handlePurchaseProduct(product)}
                  disabled={purchasing}
                  activeOpacity={0.85}
                >
                  {/* Token Icon */}
                  <View style={styles.productIconContainer}>
                    <LinearGradient
                      colors={['#FFD700', '#FFA500']}
                      style={styles.productIconGradient}
                    >
                      <Icon name="cash" size={40} color="#FFF" />
                    </LinearGradient>
                  </View>
                  
                  {/* Token Amount */}
                  <View style={styles.productTokenAmount}>
                    <TokenIcon />
                    <Text style={styles.productTokenText}>
                      {getTokenAmountFromProductId(product.productId)}
                    </Text>
                  </View>
                  
                  {/* Product Title */}
                  <Text style={styles.productTitle}>
                    {product.title || `${getTokenAmountFromProductId(product.productId)} Tokens`}
                  </Text>
                  
                  {/* Product Description */}
                  {product.description && (
                    <Text style={styles.productDescription}>
                      {product.description}
                    </Text>
                  )}
                  
                  {/* Purchase Button */}
                  <LinearGradient
                    colors={[Colors.gradientStart, Colors.primary, Colors.primaryDark]}
                    style={[
                      styles.purchaseButton,
                      purchasing && styles.purchaseButtonDisabled
                    ]}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                  >
                    {purchasing ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Text style={styles.purchaseButtonText}>
                        {formatPrice(product)}
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ))
          )}
        </Animated.View>
        
        {/* Restore Purchases Button */}
        <Animated.View 
          style={[
            styles.restoreContainer,
            { opacity: fadeAnim }
          ]}
        >
          <TouchableOpacity 
            style={styles.restoreButton}
            onPress={() => IAPService.restorePurchases()}
            disabled={purchasing}
          >
            <Icon name="refresh-outline" size={20} color={Colors.primary} />
            <Text style={styles.restoreButtonText}>Restore Purchases</Text>
          </TouchableOpacity>
        </Animated.View>
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
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productItemContainer: {
    width: '48%',
    marginBottom: 16,
  },
  productItem: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    shadowColor: 'rgba(108, 99, 255, 0.5)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.08)',
    minHeight: 200,
  },
  productIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 12,
    overflow: 'hidden',
  },
  productIconGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productTokenAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  productTokenText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginLeft: 6,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMedium,
    textAlign: 'center',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 12,
  },
  purchaseButton: {
    width: '100%',
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
  },
  purchaseButtonDisabled: {
    opacity: 0.6,
  },
  purchaseButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  noProductsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  noProductsText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    marginBottom: 20,
  },
  refreshButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
    borderRadius: 20,
  },
  refreshButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  restoreContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  restoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.2)',
  },
  restoreButtonText: {
    fontSize: 14,
    color: Colors.primary,
    marginLeft: 8,
    fontWeight: '500',
  },
});

export default TokensScreen; 