/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';

// Required for React Navigation
import 'react-native-gesture-handler';

// Add ZEGOCLOUD system calling UI initialization
import ZegoUIKitPrebuiltCallService from '@zegocloud/zego-uikit-prebuilt-call-rn'
import * as ZIM from 'zego-zim-react-native';
import * as ZPNs from 'zego-zpns-react-native';

// Initialize ZEGO credentials and setup system calling UI
const initializeApp = async () => {
  try {
    // Fetch ZEGO credentials from API before initializing
    
    // Initialize system calling UI after credentials are loaded
    ZegoUIKitPrebuiltCallService.useSystemCallingUI([ZIM, ZPNs]);
  } catch (error) {
    console.error('Failed to initialize ZEGO credentials:', error);
    // Still initialize system calling UI with fallback or show error
    ZegoUIKitPrebuiltCallService.useSystemCallingUI([ZIM, ZPNs]);
  }
};

// Initialize app with credentials
initializeApp();

AppRegistry.registerComponent(appName, () => App);
