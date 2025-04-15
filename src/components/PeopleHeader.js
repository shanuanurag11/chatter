import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../constants/colors';
import CustomStatusBar from '../components/CustomStatusBar';

// Animated tab indicator component
const TabIndicator = ({ width, position }) => {
  return (
    <Animated.View 
      style={[
        styles.activeTabIndicator,
        { 
          width,
          transform: [{ translateX: position }]
        }
      ]} 
    />
  );
};

const PeopleHeader = ({ 
  tabs = [], 
  activeTab, 
  onTabChange, 
  onLocationPress 
}) => {
  // Calculate positions for the animated indicator
  const tabPositions = tabs.map((_, i) => i * 100); // Just placeholder values
  
  // Find the index of the active tab
  const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
  
  return (
    <View style={styles.container}>
      {/* Status bar with theme color */}
      <CustomStatusBar backgroundColor={Colors.primary} barStyle="light-content" />
      
      {/* Background gradient */}
      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientEnd]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.headerGradient}
      />
      
      {/* Top decorative circles */}
      <View style={styles.headerDecorationContainer}>
        <View style={styles.headerDecoration1} />
        <View style={styles.headerDecoration2} />
      </View>
      
      {/* App logo with gradient background */}
      <LinearGradient
        colors={[Colors.white, '#F0F0F0']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.logoContainer}
      >
        <Text style={styles.logoText}>A</Text>
      </LinearGradient>
      
      <View style={styles.content}>
        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {tabs.map((tab, index) => {
            const isActive = activeTab === tab.id;
            
            return (
              <TouchableOpacity 
                key={tab.id}
                style={styles.tabButton}
                onPress={() => onTabChange && onTabChange(tab.id)}
              >
                <Text style={[
                  styles.tabText,
                  isActive ? styles.activeTabText : styles.inactiveTabText
                ]}>
                  {tab.title}
                </Text>
                {isActive && <View style={styles.activeTabIndicator} />}
              </TouchableOpacity>
            );
          })}
        </View>
        
        {/* Location button with shadow and gradient */}
        <View style={styles.rightButtons}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={onLocationPress}
          >
            <LinearGradient
              colors={[Colors.white, '#F7F7F7']}
              style={styles.iconButtonGradient}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
            >
              <Icon name="place" size={22} color={Colors.primary} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerDecorationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  headerDecoration1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerDecoration2: {
    position: 'absolute',
    bottom: -60,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  logoContainer: {
    position: 'absolute',
    top: 15,
    left: 20,
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  logoText: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    position: 'relative',
  },
  tabButton: {
    marginRight: 20,
    position: 'relative',
    paddingVertical: 8,
  },
  tabText: {
    fontSize: 24,
    fontWeight: '600',
  },
  activeTabText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  inactiveTabText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Colors.white,
    borderRadius: 1.5,
  },
  rightButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  iconButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 21,
  },
});

export default PeopleHeader; 