import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../../store/slices/authSlice';
import Input from '../../components/Input';
import Button from '../../components/Button';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);
  
  useEffect(() => {
    // Clear any previous auth errors when mounting the component
    dispatch(clearError());
  }, [dispatch]);
  
  const validateForm = () => {
    let isValid = true;
    
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
    
    return isValid;
  };
  
  const handleLogin = () => {
    if (validateForm()) {
      dispatch(login({ email, password }));
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Log in to your account</Text>
        
        {error && <Text style={styles.errorMessage}>{error}</Text>}
        
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          error={emailError}
          onBlur={() => validateForm()}
        />
        
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry
          error={passwordError}
          onBlur={() => validateForm()}
        />
        
        <TouchableOpacity 
          onPress={() => navigation.navigate('ForgotPassword')}
          style={styles.forgotPassword}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>
        
        <Button
          title="Log In"
          onPress={handleLogin}
          loading={isLoading}
          style={styles.button}
        />
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.signupText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#4285F4',
    fontSize: 14,
  },
  button: {
    marginBottom: 24,
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
  signupText: {
    fontSize: 14,
    color: '#4285F4',
    fontWeight: 'bold',
    marginLeft: 5,
  },
});

export default LoginScreen; 