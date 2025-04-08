import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPassword } from '../../store/slices/authSlice';
import Input from '../../components/Input';
import Button from '../../components/Button';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);
  
  const validateEmail = () => {
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email is invalid');
      return false;
    } else {
      setEmailError('');
      return true;
    }
  };
  
  const handleReset = () => {
    if (validateEmail()) {
      dispatch(forgotPassword(email))
        .unwrap()
        .then(() => {
          setResetSent(true);
        })
        .catch((error) => {
          console.log('Forgot password error:', error);
        });
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>
          Enter your email address and we'll send you a link to reset your password
        </Text>
        
        {error && <Text style={styles.errorMessage}>{error}</Text>}
        
        {resetSent ? (
          <View style={styles.successContainer}>
            <Text style={styles.successTitle}>Check your email</Text>
            <Text style={styles.successMessage}>
              We've sent a password reset link to {email}
            </Text>
            <Button
              title="Back to Login"
              onPress={() => navigation.navigate('Login')}
              style={styles.button}
            />
          </View>
        ) : (
          <>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              error={emailError}
              onBlur={validateEmail}
            />
            
            <Button
              title="Send Reset Link"
              onPress={handleReset}
              loading={isLoading}
              style={styles.button}
            />
          </>
        )}
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
  },
  backButton: {
    marginVertical: 16,
  },
  backText: {
    fontSize: 16,
    color: '#4285F4',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    marginTop: 24,
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
    marginTop: 24,
  },
  successContainer: {
    marginTop: 32,
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#34A853',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
  },
});

export default ForgotPasswordScreen; 