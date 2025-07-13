import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector, useDispatch } from 'react-redux';
import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';
import ChatDetailScreen from '../screens/ChatDetailScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import TokensScreen from '../screens/TokensScreen';
import VipSubscriptionScreen from '../screens/VipSubscriptionScreen';
import VideoCallScreen from '../screens/VideoCallScreen';
import UserDetailsScreen from '../screens/UserDetailsScreen';
import WithdrawalScreen from '../screens/WithdrawalScreen';
import { checkAuthStatus } from '../store/slices/authSlice';
import LoadingScreen from '../screens/LoadingScreen';
import CustomStatusBar from '../components/CustomStatusBar';
import Colors from '../constants/colors';
import { View, StyleSheet } from 'react-native';
import { navigationRef } from '../services/navigationService';

// Import ZEGOCLOUD call screens
import { 
  ZegoUIKitPrebuiltCallWaitingScreen, 
  ZegoUIKitPrebuiltCallInCallScreen,
  ZegoCallInvitationDialog
} from '@zegocloud/zego-uikit-prebuilt-call-rn';

const Stack = createStackNavigator();

// Define app-wide status bar color
const STATUS_BAR_COLOR = '#6C63FF';

const AppNavigator = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <CustomStatusBar backgroundColor={STATUS_BAR_COLOR} />
        <LoadingScreen />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomStatusBar backgroundColor={STATUS_BAR_COLOR} />
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {console.log("isAuthenticated-->",isAuthenticated)}
          {isAuthenticated ? (
            <>
              <Stack.Screen name="Main" component={TabNavigator} />
              <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
              <Stack.Screen name="EditProfile" component={EditProfileScreen} />
              <Stack.Screen name="Tokens" component={TokensScreen} />
              <Stack.Screen name="VipSubscription" component={VipSubscriptionScreen} />
              <Stack.Screen name="VideoCallScreen" component={VideoCallScreen} />
              <Stack.Screen name="UserDetails" component={UserDetailsScreen} />
              <Stack.Screen name="Withdrawal" component={WithdrawalScreen} />
              
              {/* ZEGOCLOUD Call Screens - DO NOT change the names */}
              <Stack.Screen
                options={{ headerShown: false }}
                name="ZegoUIKitPrebuiltCallWaitingScreen"
                component={ZegoUIKitPrebuiltCallWaitingScreen}
              />
              <Stack.Screen
                options={{ headerShown: false }}
                name="ZegoUIKitPrebuiltCallInCallScreen"
                component={ZegoUIKitPrebuiltCallInCallScreen}
              />
            </>
          ) : (
            <Stack.Screen name="Auth" component={AuthNavigator} />
          )}
        </Stack.Navigator>
        
        {/* ZEGOCLOUD Call Invitation Dialog - Must be inside NavigationContainer */}
        <ZegoCallInvitationDialog />
      </NavigationContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AppNavigator; 