import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector, useDispatch } from 'react-redux';
import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';
import ChatDetailScreen from '../screens/ChatDetailScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import { checkAuthStatus } from '../store/slices/authSlice';
import LoadingScreen from '../screens/LoadingScreen';
import CustomStatusBar from '../components/CustomStatusBar';
import Colors from '../constants/colors';
import { View, StyleSheet } from 'react-native';

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
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isAuthenticated ? (
            <>
              <Stack.Screen name="Main" component={TabNavigator} />
              <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
              <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            </>
          ) : (
            <Stack.Screen name="Auth" component={AuthNavigator} />
          )}
        </Stack.Navigator>
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