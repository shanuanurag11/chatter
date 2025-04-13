import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Colors from '../constants/colors';
import Theme from '../constants/theme';

const PhoneInput = ({
  value,
  onChangeText,
  error,
  onBlur,
  countryCode = '+91',
  style,
  isDark = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => {
    setIsFocused(false);
    if (onBlur) onBlur();
  };

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.inputContainer,
          isDark ? styles.inputContainerDark : styles.inputContainerLight,
          isFocused && (isDark ? styles.focusedDark : styles.focusedLight),
          error && styles.errorInput,
        ]}
      >
        <Icon 
          name="phone" 
          size={20} 
          color={isDark ? Colors.placeholderText : Colors.textLight} 
          style={styles.iconStyle} 
        />
        
        <View style={styles.countryCodeContainer}>
          <Text style={[styles.countryCode, isDark && styles.textDark]}>
            {countryCode}
          </Text>
        </View>
        
        <TextInput
          style={[
            styles.input, 
            isDark && styles.inputDark
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder="Enter phone number"
          placeholderTextColor={isDark ? Colors.placeholderText : Colors.textLight}
          keyboardType="phone-pad"
          maxLength={10}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Theme.spacing.md,
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
  countryCodeContainer: {
    marginLeft: Theme.spacing.sm,
    paddingRight: Theme.spacing.sm,
    borderRightWidth: 1,
    borderRightColor: isDark => isDark ? 'rgba(255, 255, 255, 0.2)' : '#E0E0E0',
    height: '70%',
    justifyContent: 'center',
  },
  countryCode: {
    color: Colors.textDark,
    fontSize: Theme.fontSize.md,
    fontWeight: '600',
  },
  textDark: {
    color: Colors.white,
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
});

export default PhoneInput; 