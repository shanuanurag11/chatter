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
import apiClient from './api/client';
import userService from './userService';

class IAPService {
  constructor() {
    this.purchaseUpdateSubscription = null;
    this.purchaseErrorSubscription = null;
    this.isInitialized = false;
    
    // Product IDs will be fetched from API
    this.productIds = [];
    
    this.products = [];
  }

  /**
   * Fetch product IDs from API
   */
  async fetchProductIds() {
    try {
      console.log('Fetching product IDs from API...');
      
      const response = await apiClient.get('/api/v1/products/');
      console.log('Product IDs API response:', response.data);
      
      if (response.data && response.data.status && response.data.data && response.data.data.products) {
        this.productIds = response.data.data.products;
        console.log('Product IDs fetched successfully:', this.productIds);
        return this.productIds;
      } else {
        console.error('Invalid API response for product IDs:', response.data);
        throw new Error('Invalid API response for product IDs');
      }
    } catch (error) {
      console.error('Error fetching product IDs from API:', error);
      
      // Fallback to default product IDs if API fails
      console.log('Using fallback product IDs...');
      
      return this.productIds;
    }
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
      
      // Fetch product IDs from API first
      await this.fetchProductIds();
      
      // Load products using fetched IDs
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
      console.log('Loading products with IDs:', this.productIds);
      
      if (!this.productIds || this.productIds.length === 0) {
        throw new Error('No product IDs available. Please fetch product IDs first.');
      }
      
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
   * Get current product IDs
   */
  getProductIds() {
    return this.productIds;
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
        console.log('Purchase receipt:', receipt);
        
        // Validate the purchase with our server
        console.log('Validating purchase with server...');
        const validationResult = await this.validatePurchaseWithServer(purchase);
        
        if (validationResult.success) {
          // Finish the transaction
          await finishTransaction({ 
            purchase, 
            isConsumable: true // Tokens are consumable
          });
          
          console.log('Purchase completed successfully');
          
          // Update user's token balance and other data from profile API
          console.log('Updating user data from profile API...');
          await userService.updateCoinsAndTotalSecondsFromProfile();
          
          // Show success message
          Alert.alert('Success', 'Success');
          
          // Call the success callback
          this.onPurchaseSuccess(purchase);
          
        } else {
          console.error('Purchase validation failed:', validationResult.message || 'Unknown error');
          Alert.alert('Transaction Failed', 'Transaction failed.');
        }
      } else {
        console.error('No receipt found in purchase');
        Alert.alert('Transaction Failed', 'Transaction failed.');
      }
    } catch (error) {
      console.error('Error processing purchase:', error);
      Alert.alert('Transaction Failed', 'Transaction failed.');
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
    // Extract number from product ID (e.g., 'token_100' -> '100')
    const match = productId.match(/token_(\d+)/);
    if (match) {
      return match[1];
    }
    
    // Fallback to static mapping for backwards compatibility
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
        console.log('Processing restored purchases...');
        
        // Verify each restored purchase with server
        let verifiedCount = 0;
        for (const purchase of purchases) {
          try {
            console.log('Verifying restored purchase:', purchase.productId);
            const validationResult = await this.validatePurchaseWithServer(purchase);
            if (validationResult.success) {
              verifiedCount++;
            }
          } catch (error) {
            console.warn('Error verifying restored purchase:', error);
          }
        }
        
        if (verifiedCount > 0) {
          // Update user data after successful verifications
          await userService.updateCoinsAndTotalSecondsFromProfile();
          Alert.alert('Restore Successful', `${verifiedCount} purchase(s) restored and verified.`);
        } else {
          Alert.alert('Restore Complete', 'Purchases restored but none could be verified.');
        }
        
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
   * Validate purchase with your server
   */
  async validatePurchaseWithServer(purchase) {
    try {
      console.log('Sending purchase receipt to server for validation...');
      
      const requestData = {
        receipt: purchase.transactionReceipt,
        product_id: purchase.productId,
        transaction_id: purchase.transactionId,
        platform: Platform.OS,
        purchase_token: purchase.purchaseToken, // Android
        original_transaction_id: purchase.originalTransactionIdentifierIOS, // iOS
      };
      
      console.log('Verification request data:', requestData);
      
      const response = await apiClient.post('/api/v1/user/wallet/reacharge/', requestData);
      
      console.log('Verification API response:', response.data);
      
      if (response.data && response.data.status) {
        console.log('Purchase verification successful');
        return { 
          success: true, 
          data: response.data.data 
        };
      } else {
        console.error('Purchase verification failed:', response.data?.message || 'Unknown error');
        return { 
          success: false, 
          message: response.data?.message || 'Verification failed' 
        };
      }
    } catch (error) {
      console.error('Error validating purchase with server:', error);
      
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.message || 'Server error during verification';
        console.error('Server error response:', error.response.data);
        return { 
          success: false, 
          message: errorMessage 
        };
      } else if (error.request) {
        // Network error
        console.error('Network error during verification:', error.request);
        return { 
          success: false, 
          message: 'Network error during verification' 
        };
      } else {
        // Other error
        console.error('Unknown error during verification:', error.message);
        return { 
          success: false, 
          message: 'Unknown error during verification' 
        };
      }
    }
  }
}

// Export singleton instance
export default new IAPService(); 