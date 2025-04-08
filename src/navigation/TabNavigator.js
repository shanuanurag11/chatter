import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import Screen1 from '../screens/tabs/Screen1';
import Screen2 from '../screens/tabs/Screen2';
import Screen3 from '../screens/tabs/Screen3';
import Screen4 from '../screens/tabs/Screen4';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#4285F4',
        tabBarInactiveTintColor: '#7F7F7F',
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarStyle: styles.tabBar,
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Screen1" 
        component={Screen1} 
        options={{ 
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => (
            // You can add custom icon component here
            <YourIconComponent name="home" color={color} />
          ),
        }} 
      />
      <Tab.Screen 
        name="Screen2" 
        component={Screen2} 
        options={{ 
          tabBarLabel: 'Browse',
          tabBarIcon: ({ color }) => (
            <YourIconComponent name="search" color={color} />
          ),
        }} 
      />
      <Tab.Screen 
        name="Screen3" 
        component={Screen3} 
        options={{ 
          tabBarLabel: 'Activity',
          tabBarIcon: ({ color }) => (
            <YourIconComponent name="activity" color={color} />
          ),
        }} 
      />
      <Tab.Screen 
        name="Screen4" 
        component={Screen4} 
        options={{ 
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => (
            <YourIconComponent name="user" color={color} />
          ),
        }} 
      />
    </Tab.Navigator>
  );
};

// Replace this with your actual icon component
const YourIconComponent = ({ name, color }) => {
  // This is a placeholder. You should use your preferred icon library like:
  // return <Icon name={name} size={24} color={color} />;
  return null;
};

const styles = StyleSheet.create({
  tabBar: {
    height: 60,
    paddingBottom: 5,
    paddingTop: 5,
  },
  tabBarLabel: {
    fontSize: 12,
  },
});

export default TabNavigator; 