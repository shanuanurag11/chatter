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
  containerStyle,
  inputStyle,
  labelStyle,
  leftComponent,
  multiline,
  numberOfLines,
  textAlignVertical,
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
      {label && (
        <Text style={[
          styles.label, 
          isDark && styles.labelDark,
          labelStyle
        ]}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputContainer,
          isDark ? styles.inputContainerDark : styles.inputContainerLight,
          isFocused && (isDark ? styles.focusedDark : styles.focusedLight),
          error && styles.errorInput,
          containerStyle,
        ]}
      >
        {leftComponent}
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
            isDark && styles.inputDark,
            multiline && styles.multilineInput,
            inputStyle,
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
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={textAlignVertical}
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
    width: '100%',
  },
  label: {
    marginBottom: Theme.spacing.xs,
    fontSize: Theme.fontSize.sm,
    fontWeight: '500',
    color: Colors.textDark,
  },
  labelDark: {
    color: Colors.lightGray,
    fontSize: 14,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Theme.borderRadius.lg,
    minHeight: 56,
    borderWidth: 1,
    overflow: 'hidden',
  },
  inputContainerLight: {
    borderColor: '#E0E0E0',
    backgroundColor: '#F9F9F9',
  },
  inputContainerDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconStyle: {
    marginLeft: Theme.spacing.md,
  },
  input: {
    flex: 1,
    minHeight: 56,
    paddingHorizontal: Theme.spacing.md,
    fontSize: 16,
    color: Colors.textDark,
    fontWeight: '400',
  },
  inputDark: {
    color: Colors.white,
  },
  multilineInput: {
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.md,
    textAlignVertical: 'top',
  },
  focusedLight: {
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
  },
  focusedDark: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  errorInput: {
    borderColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    fontSize: Theme.fontSize.xs,
    marginTop: Theme.spacing.xs,
    marginLeft: Theme.spacing.xs,
  },
  eyeIcon: {
    padding: Theme.spacing.md,
    marginRight: Theme.spacing.xs,
  },
});

export default Input; 