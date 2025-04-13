import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Colors from '../constants/colors';
import Theme from '../constants/theme';

const Button = ({ 
  title, 
  onPress, 
  style, 
  textStyle, 
  loading = false, 
  disabled = false,
  variant = 'primary', // 'primary', 'secondary', 'outline', 'white'
  icon = null,
}) => {
  
  const getButtonStyles = () => {
    if (disabled) return [styles.button, styles.disabled, style];
    
    switch (variant) {
      case 'secondary':
        return [styles.button, styles.secondary, style];
      case 'outline':
        return [styles.button, styles.outline, style];
      case 'white':
        return [styles.button, styles.white, style];
      default:
        return [styles.button, styles.primary, style];
    }
  };
  
  const getTextStyles = () => {
    if (disabled) return [styles.text, styles.disabledText, textStyle];
    
    switch (variant) {
      case 'outline':
        return [styles.text, styles.outlineText, textStyle];
      case 'white':
        return [styles.text, styles.whiteText, textStyle];
      default:
        return [styles.text, textStyle];
    }
  };
  
  const getLoaderColor = () => {
    switch (variant) {
      case 'outline':
        return Colors.primary;
      case 'white':
        return Colors.primary;
      default:
        return Colors.white;
    }
  };
  
  return (
    <TouchableOpacity
      style={getButtonStyles()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={getLoaderColor()} />
      ) : (
        <>
          {icon}
          <Text style={getTextStyles()}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: Theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.md,
    flexDirection: 'row',
  },
  primary: {
    backgroundColor: Colors.primary,
  },
  secondary: {
    backgroundColor: Colors.success,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  white: {
    backgroundColor: Colors.white,
    ...Theme.shadows.medium,
  },
  disabled: {
    backgroundColor: Colors.textLight,
    opacity: 0.7,
  },
  text: {
    color: Colors.white,
    fontSize: Theme.fontSize.md,
    fontWeight: '600',
  },
  outlineText: {
    color: Colors.primary,
  },
  whiteText: {
    color: Colors.primary,
  },
  disabledText: {
    color: Colors.white,
  },
});

export default Button; 