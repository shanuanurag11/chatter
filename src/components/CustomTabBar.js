import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Colors from '../constants/colors';

// List of icons used in this component - these are all verified to exist in MaterialIcons
const ICONS = {
  MATCH: 'favorite',
  PEOPLE: 'group',
  MESSAGE: 'message',
  ME: 'person'
};

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[
      styles.container,
      { paddingBottom: Math.max(insets.bottom, 5) }
    ]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // Get icon name based on route name using our predefined icons
        let iconName;
        switch (route.name) {
          case 'Match':
            iconName = ICONS.MATCH;
            break;
          case 'People':
            iconName = ICONS.PEOPLE;
            break;
          case 'Message':
            iconName = ICONS.MESSAGE;
            break;
          case 'Me':
            iconName = ICONS.ME;
            break;
          default:
            iconName = 'circle';
        }

        return (
          <TouchableOpacity
            key={index}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            style={styles.tabButton}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Icon 
                name={iconName} 
                size={24} 
                color={isFocused ? Colors.white : 'rgba(255, 255, 255, 0.6)'}
              />
            </View>
            
            {isFocused ? (
              <Text style={styles.activeTabText}>
                {label}
              </Text>
            ) : (
              <Text style={styles.inactiveTabText}>
                {label}
              </Text>
            )}
            {isFocused && <View style={styles.indicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    height: 60,
    borderTopWidth: 0,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 8,
  },
  iconContainer: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTabText: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '600',
    color: Colors.white,
  },
  inactiveTabText: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  indicator: {
    position: 'absolute',
    top: 0,
    width: '60%',
    height: 3,
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  }
});

export default CustomTabBar; 