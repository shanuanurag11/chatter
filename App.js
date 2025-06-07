import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import AppNavigation from './AppNavigation';
import { ZegoUIKitPrebuiltCallFloatingMinimizedView } from '@zegocloud/zego-uikit-prebuilt-call-rn';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/store';
import AuthProvider from './src/components/AuthProvider';

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AuthProvider>
          <NavigationContainer>
            <AppNavigation />
            <ZegoUIKitPrebuiltCallFloatingMinimizedView />
          </NavigationContainer>
        </AuthProvider>
      </PersistGate>
    </Provider>
  );
}
