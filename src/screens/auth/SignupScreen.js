import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { loginWithGoogle } from '../../store/slices/authSlice';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Logo from '../../components/Logo';
import AnimatedBackground from '../../components/AnimatedBackground';
import Colors from '../../constants/colors';
import Theme from '../../constants/theme';
import Button from '../../components/Button';

const { width, height } = Dimensions.get('window');

const SignupScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleGoogleSignup = () => {
    if (!agreedToTerms) {
      Alert.alert(
        'Terms & Conditions',
        'Please agree to the Terms and Conditions to continue.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // This is a dummy implementation for demo purposes
    // In a real app, you would integrate with Google Sign-In SDK
    const mockGoogleData = {
      name: 'Google User',
      email: 'user@gmail.com',
      photo: 'https://randomuser.me/api/portraits/lego/1.jpg'
    };
    
    dispatch(loginWithGoogle(mockGoogleData))
      .unwrap()
      .then(() => {
        // Login successful
        console.log('Google login successful');
      })
      .catch((error) => {
        Alert.alert('Login Error', error?.message || 'Failed to login with Google');
      });
  };

  const handlePhoneLogin = () => {
    if (!agreedToTerms) {
      Alert.alert(
        'Terms & Conditions',
        'Please agree to the Terms and Conditions to continue.',
        [{ text: 'OK' }]
      );
      return;
    }
    navigation.navigate('PhoneLogin');
  };

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedBackground />
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Logo size={100} />
          <Text style={styles.title}>TenderU</Text>
          <Text style={styles.subtitle}>Connect with new friends</Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Continue with Google"
            onPress={handleGoogleSignup}
            loading={isLoading}
            variant="white"
            icon={
              <Icon name="login" size={24} color="#DB4437" style={styles.buttonIcon} />
            }
            style={styles.button}
          />

          <Button
            title="Continue with Phone"
            onPress={handlePhoneLogin}
            variant="white"
            icon={
              <Icon name="phone" size={24} color={Colors.primary} style={styles.buttonIcon} />
            }
            style={styles.button}
          />

          <View style={styles.termsContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setAgreedToTerms(!agreedToTerms)}
            >
              {agreedToTerms && <View style={styles.checkboxInner} />}
            </TouchableOpacity>
            <Text style={styles.termsText}>
              I have read and agree to the Terms and Conditions
            </Text>
          </View>
          
          {error && (
            <View style={styles.errorContainer}>
              <Icon name="error-outline" size={20} color={Colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('PhoneLogin')}>
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.xl,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: Theme.fontSize.xxxl,
    fontWeight: 'bold',
    color: Colors.white,
    marginTop: Theme.spacing.md,
  },
  subtitle: {
    fontSize: Theme.fontSize.lg,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: Theme.spacing.xs,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    width: '100%',
    maxWidth: 300,
    marginBottom: Theme.spacing.md,
  },
  buttonIcon: {
    marginRight: Theme.spacing.sm,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Theme.spacing.md,
    maxWidth: 300,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.white,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  checkboxInner: {
    width: 12,
    height: 12,
    backgroundColor: Colors.white,
    borderRadius: 2,
  },
  termsText: {
    fontSize: Theme.fontSize.sm,
    color: Colors.white,
    flex: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 101, 101, 0.1)',
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.sm,
    marginTop: Theme.spacing.md,
    maxWidth: 300,
  },
  errorText: {
    color: Colors.error,
    marginLeft: Theme.spacing.xs,
    fontSize: Theme.fontSize.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: Theme.fontSize.sm,
    color: Colors.white,
  },
  loginText: {
    fontSize: Theme.fontSize.sm,
    color: Colors.white,
    fontWeight: 'bold',
    marginLeft: Theme.spacing.xs,
    textDecorationLine: 'underline',
  },
});

export default SignupScreen; 