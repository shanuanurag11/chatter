import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../constants/colors';

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
      {/* App logo with gradient background */}
      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientEnd]}
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
              colors={['#F5F5F5', '#E8E8E8']}
              style={styles.iconButtonGradient}
            >
              <Icon name="place" size={22} color={Colors.primary} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Decorative bottom border */}
      <View style={styles.bottomBorder} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  logoText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
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
    color: '#000',
    fontWeight: 'bold',
  },
  inactiveTabText: {
    color: 'rgba(170, 170, 170, 0.8)',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Colors.primary,
    borderRadius: 1.5,
  },
  rightButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    borderRadius: 22,
  },
  bottomBorder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
});

export default PeopleHeader; 