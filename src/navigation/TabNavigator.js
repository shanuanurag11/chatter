import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Screen1 from '../screens/tabs/Screen1';
import PeopleScreen from '../screens/tabs/PeopleScreen';
import MessageScreen from '../screens/tabs/MessageScreen';
import Screen4 from '../screens/tabs/Screen4';
import CustomTabBar from '../components/CustomTabBar';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Match" 
        component={Screen1} 
        options={{ 
          title: 'MATCH',
        }} 
      />
      <Tab.Screen 
        name="People" 
        component={PeopleScreen} 
        options={{ 
          title: 'PEOPLE',
        }} 
      />
      <Tab.Screen 
        name="Message" 
        component={MessageScreen} 
        options={{ 
          title: 'MESSAGE',
        }} 
      />
      <Tab.Screen 
        name="Me" 
        component={Screen4} 
        options={{ 
          title: 'ME',
        }} 
      />
    </Tab.Navigator>
  );
};

export default TabNavigator; 