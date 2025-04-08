import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { signup } from '../../store/slices/authSlice';
import Input from '../../components/Input';
import Button from '../../components/Button';

const SignupScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);
  
  const validateForm = () => {
    let isValid = true;
    
    // Validate name
    if (!name.trim()) {
      setNameError('Name is required');
      isValid = false;
    } else {
      setNameError('');
    }
    
    // Validate email
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email is invalid');
      isValid = false;
    } else {
      setEmailError('');
    }
    
    // Validate password
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    } else {
      setPasswordError('');
    }
    
    // Validate confirm password
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      isValid = false;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }
    
    return isValid;
  };
  
  const handleSignup = () => {
    if (validateForm()) {
      dispatch(signup({ name, email, password }))
        .unwrap()
        .then(() => {
          // Navigate to login after successful signup
          navigation.navigate('Login');
        })
        .catch((error) => {
          console.log('Signup error:', error);
        });
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>
          
          {error && <Text style={styles.errorMessage}>{error}</Text>}
          
          <Input
            label="Name"
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            error={nameError}
            autoCapitalize="words"
          />
          
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            error={emailError}
          />
          
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Create a password"
            secureTextEntry
            error={passwordError}
          />
          
          <Input
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm your password"
            secureTextEntry
            error={confirmPasswordError}
          />
          
          <Button
            title="Sign Up"
            onPress={handleSignup}
            loading={isLoading}
            style={styles.button}
          />
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginText}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 32,
  },
  errorMessage: {
    color: '#EA4335',
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    marginVertical: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666666',
  },
  loginText: {
    fontSize: 14,
    color: '#4285F4',
    fontWeight: 'bold',
    marginLeft: 5,
  },
});

export default SignupScreen; 