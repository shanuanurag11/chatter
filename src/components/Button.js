import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

const Button = ({ 
  title, 
  onPress, 
  style, 
  textStyle, 
  loading = false, 
  disabled = false,
  variant = 'primary', // 'primary', 'secondary', 'outline'
}) => {
  
  const getButtonStyles = () => {
    if (disabled) return [styles.button, styles.disabled, style];
    
    switch (variant) {
      case 'secondary':
        return [styles.button, styles.secondary, style];
      case 'outline':
        return [styles.button, styles.outline, style];
      default:
        return [styles.button, styles.primary, style];
    }
  };
  
  const getTextStyles = () => {
    if (disabled) return [styles.text, styles.disabledText, textStyle];
    
    switch (variant) {
      case 'outline':
        return [styles.text, styles.outlineText, textStyle];
      default:
        return [styles.text, textStyle];
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
        <ActivityIndicator color={variant === 'outline' ? '#4285F4' : '#FFF'} />
      ) : (
        <Text style={getTextStyles()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  primary: {
    backgroundColor: '#4285F4',
  },
  secondary: {
    backgroundColor: '#34A853',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4285F4',
  },
  disabled: {
    backgroundColor: '#E5E5E5',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  outlineText: {
    color: '#4285F4',
  },
  disabledText: {
    color: '#9E9E9E',
  },
});

export default Button; 