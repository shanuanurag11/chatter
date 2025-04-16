import React from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Colors from '../constants/colors';

/**
 * InputField component
 * A reusable input field with label and optional error message
 * 
 * @param {string} label - Input label
 * @param {string} value - Input value
 * @param {function} onChangeText - Function called when text changes
 * @param {Object} [props] - Additional TextInput props
 * @param {string} [error] - Error message to display
 * @param {boolean} [isPassword] - Whether the input is a password field
 * @param {function} [onClear] - Function to clear the input
 */
const InputField = ({ 
  label, 
  value, 
  onChangeText, 
  error, 
  isPassword = false,
  onClear,
  ...props 
}) => {
  const [secureTextEntry, setSecureTextEntry] = React.useState(isPassword);
  
  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };
  
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[
        styles.inputContainer,
        error ? styles.inputError : null
      ]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          placeholderTextColor="#999999"
          {...props}
        />
        
        {isPassword && (
          <TouchableOpacity 
            onPress={toggleSecureEntry}
            style={styles.iconButton}
          >
            <Icon 
              name={secureTextEntry ? 'eye-outline' : 'eye-off-outline'} 
              size={20} 
              color="#999999" 
            />
          </TouchableOpacity>
        )}
        
        {!isPassword && value && onClear && (
          <TouchableOpacity 
            onPress={onClear}
            style={styles.iconButton}
          >
            <Icon name="close-circle" size={20} color="#999999" />
          </TouchableOpacity>
        )}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#FF5252',
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333333',
  },
  iconButton: {
    padding: 10,
  },
  errorText: {
    marginTop: 4,
    fontSize: 14,
    color: '#FF5252',
  },
});

export default InputField; 