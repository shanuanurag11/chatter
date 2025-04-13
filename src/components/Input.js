import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Colors from '../constants/colors';
import Theme from '../constants/theme';

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  error,
  onBlur,
  keyboardType = 'default',
  autoCapitalize = 'none',
  style,
  icon,
  isDark = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => {
    setIsFocused(false);
    if (onBlur) onBlur();
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={[styles.label, isDark && styles.labelDark]}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          isDark ? styles.inputContainerDark : styles.inputContainerLight,
          isFocused && (isDark ? styles.focusedDark : styles.focusedLight),
          error && styles.errorInput,
        ]}
      >
        {icon && (
          <Icon 
            name={icon} 
            size={20} 
            color={isDark ? Colors.placeholderText : Colors.textLight} 
            style={styles.iconStyle} 
          />
        )}
        <TextInput
          style={[
            styles.input, 
            isDark && styles.inputDark
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={isDark ? Colors.placeholderText : '#A0AEC0'}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          onFocus={handleFocus}
          onBlur={handleBlur}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.eyeIcon}
          >
            <Icon 
              name={isPasswordVisible ? 'visibility-off' : 'visibility'} 
              size={20} 
              color={isDark ? Colors.placeholderText : Colors.textLight} 
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Theme.spacing.md,
  },
  label: {
    marginBottom: Theme.spacing.xs,
    fontSize: Theme.fontSize.sm,
    fontWeight: '500',
    color: Colors.textDark,
  },
  labelDark: {
    color: Colors.white,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Theme.borderRadius.md,
    height: 50,
  },
  inputContainerLight: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F9F9F9',
  },
  inputContainerDark: {
    backgroundColor: Colors.inputBackground,
  },
  iconStyle: {
    marginLeft: Theme.spacing.md,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: Theme.spacing.md,
    fontSize: Theme.fontSize.md,
    color: Colors.textDark,
  },
  inputDark: {
    color: Colors.white,
  },
  focusedLight: {
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
  },
  focusedDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  errorInput: {
    borderColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    fontSize: Theme.fontSize.xs,
    marginTop: Theme.spacing.xs,
  },
  eyeIcon: {
    padding: Theme.spacing.sm,
    marginRight: Theme.spacing.xs,
  },
});

export default Input; 