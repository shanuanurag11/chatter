import {
  initConnection,
  getProducts,
  requestPurchase,
  purchaseUpdatedListener,
  purchaseErrorListener,
  finishTransaction,
  flushFailedPurchasesCachedAsPendingAndroid,
  endConnection,
  getAvailablePurchases,
} from 'react-native-iap';
import { Platform, Alert } from 'react-native';

class IAPService {
  constructor() {
    this.purchaseUpdateSubscription = null;
    this.purchaseErrorSubscription = null;
    this.isInitialized = false;
    
    // Product IDs for tokens as specified
    this.productIds = [
      'token_55',
      'token_100', 
      'token_155',
      'token_300'
    ];
    
    this.products = [];
  }

  /**
   * Initialize IAP connection and set up listeners
   */
  async init() {
    try {
      console.log('Initializing IAP Service...');
      
      // Initialize connection
      await initConnection();
      console.log('IAP Connection initialized');
      
      // Flush failed purchases on Android
      if (Platform.OS === 'android') {
        try {
          await flushFailedPurchasesCachedAsPendingAndroid();
          console.log('Flushed failed cached purchases');
        } catch (error) {
          console.warn('Error flushing failed purchases:', error);
        }
      }
      
      // Set up listeners
      this.setupPurchaseListeners();
      
      // Load products
      await this.loadProducts();
      
      this.isInitialized = true;
      console.log('IAP Service initialized successfully');
      
      return true;
    } catch (error) {
      console.error('IAP Service initialization failed:', error);
      throw error;
    }
  }

  /**
   * Set up purchase update and error listeners
   */
  setupPurchaseListeners() {
    // Purchase success listener
    this.purchaseUpdateSubscription = purchaseUpdatedListener((purchase) => {
      console.log('Purchase updated:', purchase);
      this.handlePurchaseUpdate(purchase);
    });

    // Purchase error listener
    this.purchaseErrorSubscription = purchaseErrorListener((error) => {
      console.warn('Purchase error:', error);
      this.handlePurchaseError(error);
    });
  }

  /**
   * Load available products from the store
   */
  async loadProducts() {
    try {
      console.log('Loading products...');
      const products = await getProducts({ skus: this.productIds });
      this.products = products;
      console.log('Products loaded:', products);
      return products;
    } catch (error) {
      console.error('Error loading products:', error);
      throw error;
    }
  }

  /**
   * Get loaded products
   */
  getProducts() {
    return this.products;
  }

  /**
   * Get product by ID
   */
  getProductById(productId) {
    return this.products.find(product => product.productId === productId);
  }

  /**
   * Purchase a product
   */
  async purchaseProduct(productId) {
    try {
      if (!this.isInitialized) {
        throw new Error('IAP Service not initialized');
      }

      console.log('Requesting purchase for:', productId);
      
      const purchaseParams = Platform.OS === 'android' 
        ? { skus: [productId] }
        : { 
            sku: productId,
            andDangerouslyFinishTransactionAutomaticallyIOS: false 
          };

      await requestPurchase(purchaseParams);
    } catch (error) {
      console.error('Purchase request failed:', error);
      
      // Show user-friendly error message
      let errorMessage = 'Purchase failed. Please try again.';
      
      if (error.code === 'E_USER_CANCELLED') {
        errorMessage = 'Purchase was cancelled.';
      } else if (error.code === 'E_ITEM_UNAVAILABLE') {
        errorMessage = 'This item is not available for purchase.';
      } else if (error.code === 'E_NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      Alert.alert('Purchase Error', errorMessage);
      throw error;
    }
  }

  /**
   * Handle successful purchase
   */
  async handlePurchaseUpdate(purchase) {
    try {
      console.log('Processing purchase:', purchase);
      
      const receipt = purchase.transactionReceipt;
      if (receipt) {
        // Here you would typically validate the purchase with your server
        // For now, we'll just log it and finish the transaction
        console.log('Purchase receipt:', receipt);
        
        // TODO: Send receipt to your server for validation
        // const validationResult = await this.validatePurchaseWithServer(receipt);
        
        // For demo purposes, we'll assume validation is successful
        const validationResult = { success: true };
        
        if (validationResult.success) {
          // Finish the transaction
          await finishTransaction({ 
            purchase, 
            isConsumable: true // Tokens are consumable
          });
          
          console.log('Purchase completed successfully');
          
          // Show success message
          Alert.alert(
            'Purchase Successful', 
            `You have successfully purchased ${this.getTokenAmountFromProductId(purchase.productId)} tokens!`
          );
          
          // TODO: Update user's token balance in your app state
          this.onPurchaseSuccess(purchase);
          
        } else {
          console.error('Purchase validation failed');
          Alert.alert('Purchase Error', 'Purchase validation failed. Please contact support.');
        }
      } else {
        console.error('No receipt found in purchase');
      }
    } catch (error) {
      console.error('Error processing purchase:', error);
      Alert.alert('Purchase Error', 'Error processing purchase. Please contact support.');
    }
  }

  /**
   * Handle purchase errors
   */
  handlePurchaseError(error) {
    console.error('Purchase error details:', error);
    
    let errorMessage = 'Purchase failed. Please try again.';
    
    switch (error.code) {
      case 'E_USER_CANCELLED':
        errorMessage = 'Purchase was cancelled.';
        break;
      case 'E_ITEM_UNAVAILABLE':
        errorMessage = 'This item is not available for purchase.';
        break;
      case 'E_NETWORK_ERROR':
        errorMessage = 'Network error. Please check your connection and try again.';
        break;
      case 'E_USER_ERROR':
        errorMessage = 'There was an issue with your account. Please try again later.';
        break;
      case 'E_UNKNOWN':
      default:
        errorMessage = 'An unknown error occurred. Please try again.';
        break;
    }
    
    Alert.alert('Purchase Error', errorMessage);
    
    // TODO: Log error to your analytics service
    this.onPurchaseError(error);
  }

  /**
   * Get token amount from product ID
   */
  getTokenAmountFromProductId(productId) {
    const tokenMap = {
      'token_55': '55',
      'token_100': '100',
      'token_155': '155',
      'token_300': '300'
    };
    return tokenMap[productId] || 'Unknown';
  }

  /**
   * Get available purchases (for restore functionality)
   */
  async getAvailablePurchases() {
    try {
      const purchases = await getAvailablePurchases();
      console.log('Available purchases:', purchases);
      return purchases;
    } catch (error) {
      console.error('Error getting available purchases:', error);
      throw error;
    }
  }

  /**
   * Restore purchases
   */
  async restorePurchases() {
    try {
      console.log('Restoring purchases...');
      const purchases = await this.getAvailablePurchases();
      
      if (purchases.length > 0) {
        Alert.alert('Restore Successful', `${purchases.length} purchase(s) restored.`);
        // TODO: Process restored purchases
        this.onPurchasesRestored(purchases);
      } else {
        Alert.alert('No Purchases', 'No previous purchases found to restore.');
      }
      
      return purchases;
    } catch (error) {
      console.error('Error restoring purchases:', error);
      Alert.alert('Restore Error', 'Failed to restore purchases. Please try again.');
      throw error;
    }
  }

  /**
   * Callback for successful purchase - override in your app
   */
  onPurchaseSuccess(purchase) {
    // Override this method in your app to handle successful purchases
    console.log('Override onPurchaseSuccess to handle:', purchase);
  }

  /**
   * Callback for purchase error - override in your app
   */
  onPurchaseError(error) {
    // Override this method in your app to handle purchase errors
    console.log('Override onPurchaseError to handle:', error);
  }

  /**
   * Callback for restored purchases - override in your app
   */
  onPurchasesRestored(purchases) {
    // Override this method in your app to handle restored purchases
    console.log('Override onPurchasesRestored to handle:', purchases);
  }

  /**
   * Cleanup and close connection
   */
  cleanup() {
    if (this.purchaseUpdateSubscription) {
      this.purchaseUpdateSubscription.remove();
      this.purchaseUpdateSubscription = null;
    }

    if (this.purchaseErrorSubscription) {
      this.purchaseErrorSubscription.remove();
      this.purchaseErrorSubscription = null;
    }

    endConnection();
    this.isInitialized = false;
    console.log('IAP Service cleaned up');
  }

  /**
   * Validate purchase with your server (implement this)
   */
  async validatePurchaseWithServer(receipt) {
    // TODO: Implement server-side receipt validation
    // This should send the receipt to your backend for validation
    console.log('TODO: Implement server-side validation for receipt:', receipt);
    
    // For demo purposes, return success
    return { success: true };
  }
}

// Export singleton instance
export default new IAPService(); 