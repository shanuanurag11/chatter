import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { 
  loginWithPhone, 
  requestOTP, 
  verifyOTP, 
  clearError, 
  resetOTPStatus 
} from '../../store/slices/authSlice';
import Colors from '../../constants/colors';
import Theme from '../../constants/theme';
import AnimatedBackground from '../../components/AnimatedBackground';
import PhoneInput from '../../components/PhoneInput';
import Button from '../../components/Button';
import Icon from 'react-native-vector-icons/MaterialIcons';

const PhoneLoginScreen = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [useOtp, setUseOtp] = useState(false);
  
  const dispatch = useDispatch();
  const { isLoading, error, otpSent, otpVerified } = useSelector((state) => state.auth);
  
  useEffect(() => {
    // Clear any previous auth errors when mounting the component
    dispatch(clearError());
    dispatch(resetOTPStatus());
    
    return () => {
      dispatch(resetOTPStatus());
    };
  }, [dispatch]);
  
  const validatePhone = () => {
    if (!phone.trim()) {
      setPhoneError('Phone number is required');
      return false;
    } else if (!/^\d{10}$/.test(phone)) {
      setPhoneError('Enter a valid 10-digit phone number');
      return false;
    }
    setPhoneError('');
    return true;
  };
  
  const validatePassword = () => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };
  
  const validateOtp = () => {
    if (!otp.trim()) {
      setOtpError('OTP is required');
      return false;
    } else if (!/^\d{6}$/.test(otp)) {
      setOtpError('Enter a valid 6-digit OTP');
      return false;
    }
    setOtpError('');
    return true;
  };
  
  const handlePasswordLogin = () => {
    if (validatePhone() && validatePassword()) {
      dispatch(loginWithPhone({ phone, password }))
        .unwrap()
        .catch((error) => {
          console.log('Login error:', error);
        });
    }
  };
  
  const handleRequestOtp = () => {
    if (validatePhone()) {
      dispatch(requestOTP(phone))
        .unwrap()
        .then((response) => {
          // For demo purposes, show the OTP
          if (response.otp) {
            Alert.alert(
              'Development Mode', 
              `OTP for testing: ${response.otp}`,
              [{ text: 'OK' }]
            );
          }
        })
        .catch((error) => {
          console.log('OTP request error:', error);
        });
    }
  };
  
  const handleVerifyOtp = () => {
    if (validatePhone() && validateOtp()) {
      dispatch(verifyOTP({ phone, otp }))
        .unwrap()
        .then(() => {
          // If OTP verification is successful, attempt login without password
          dispatch(loginWithPhone({ phone, password: 'password123' })); // Using a hardcoded password for demo
        })
        .catch((error) => {
          console.log('OTP verification error:', error);
        });
    }
  };
  
  const toggleLoginMethod = () => {
    setUseOtp(!useOtp);
    dispatch(clearError());
    dispatch(resetOTPStatus());
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <AnimatedBackground />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.content}>
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Icon name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              
              <Text style={styles.title}>Welcome Back!</Text>
              <Text style={styles.subtitle}>
                Log in to continue to TenderU
              </Text>
            </View>
            
            {error && (
              <View style={styles.errorContainer}>
                <Icon name="error-outline" size={20} color={Colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            
            <PhoneInput
              value={phone}
              onChangeText={setPhone}
              error={phoneError}
              onBlur={validatePhone}
              isDark={true}
            />
            
            {!useOtp && !otpSent ? (
              <>
                <View style={styles.inputContainer}>
                  <Icon 
                    name="lock" 
                    size={20} 
                    color={Colors.placeholderText} 
                    style={styles.inputIcon} 
                  />
                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor={Colors.placeholderText}
                    secureTextEntry
                    onBlur={validatePassword}
                  />
                </View>
                {passwordError ? <Text style={styles.fieldError}>{passwordError}</Text> : null}
                
                <Button
                  title="Log In"
                  onPress={handlePasswordLogin}
                  loading={isLoading}
                  style={styles.loginButton}
                  variant="white"
                />
                
                <TouchableOpacity
                  style={styles.forgotPassword}
                  onPress={() => navigation.navigate('ForgotPassword')}
                >
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {otpSent && (
                  <>
                    <View style={styles.inputContainer}>
                      <Icon 
                        name="sms" 
                        size={20} 
                        color={Colors.placeholderText} 
                        style={styles.inputIcon} 
                      />
                      <TextInput
                        style={styles.input}
                        value={otp}
                        onChangeText={setOtp}
                        placeholder="Enter 6-digit OTP"
                        placeholderTextColor={Colors.placeholderText}
                        keyboardType="number-pad"
                        maxLength={6}
                        onBlur={validateOtp}
                      />
                    </View>
                    {otpError ? <Text style={styles.fieldError}>{otpError}</Text> : null}
                    
                    <Button
                      title="Verify OTP"
                      onPress={handleVerifyOtp}
                      loading={isLoading}
                      style={styles.loginButton}
                      variant="white"
                    />
                    
                    <TouchableOpacity style={styles.resendOtp} onPress={handleRequestOtp}>
                      <Text style={styles.resendOtpText}>Resend OTP</Text>
                    </TouchableOpacity>
                  </>
                )}
                
                {!otpSent && (
                  <Button
                    title="Request OTP"
                    onPress={handleRequestOtp}
                    loading={isLoading}
                    style={styles.loginButton}
                    variant="white"
                  />
                )}
              </>
            )}
            
            <TouchableOpacity style={styles.toggleMethod} onPress={toggleLoginMethod}>
              <Text style={styles.toggleMethodText}>
                {useOtp ? 'Use Password Instead' : 'Use OTP Instead'}
              </Text>
            </TouchableOpacity>
            
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>
            
            <TouchableOpacity
              style={styles.googleButton}
              onPress={() => {
                // Dummy Google login for now
                Alert.alert('Google Login', 'Google login will be implemented here.');
              }}
            >
              <Icon name="login" size={24} color="#DB4437" style={styles.googleIcon} />
              <Text style={styles.googleText}>Sign in with Google</Text>
            </TouchableOpacity>
            
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text style={styles.signupText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: Theme.spacing.lg,
    paddingTop: Theme.spacing.xl,
  },
  header: {
    marginBottom: Theme.spacing.xl,
  },
  backButton: {
    marginBottom: Theme.spacing.md,
  },
  title: {
    ...Theme.titleLight,
    marginBottom: Theme.spacing.xs,
  },
  subtitle: {
    ...Theme.subtitleLight,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 101, 101, 0.1)',
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
  },
  errorText: {
    color: Colors.error,
    marginLeft: Theme.spacing.xs,
    fontSize: Theme.fontSize.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.sm,
  },
  inputIcon: {
    marginLeft: Theme.spacing.md,
    marginRight: Theme.spacing.sm,
  },
  input: {
    flex: 1,
    height: 50,
    color: Colors.white,
    fontSize: Theme.fontSize.md,
  },
  fieldError: {
    color: Colors.error,
    fontSize: Theme.fontSize.xs,
    marginBottom: Theme.spacing.md,
  },
  loginButton: {
    marginTop: Theme.spacing.md,
  },
  forgotPassword: {
    alignSelf: 'center',
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
  },
  forgotPasswordText: {
    color: Colors.white,
    fontSize: Theme.fontSize.sm,
  },
  resendOtp: {
    alignSelf: 'center',
    marginTop: Theme.spacing.md,
  },
  resendOtpText: {
    color: Colors.white,
    fontSize: Theme.fontSize.sm,
    textDecorationLine: 'underline',
  },
  toggleMethod: {
    alignSelf: 'center',
    marginTop: Theme.spacing.md,
  },
  toggleMethodText: {
    color: Colors.white,
    fontSize: Theme.fontSize.sm,
    textDecorationLine: 'underline',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Theme.spacing.xl,
    marginBottom: Theme.spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dividerText: {
    color: Colors.white,
    paddingHorizontal: Theme.spacing.md,
    fontSize: Theme.fontSize.sm,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.md,
    paddingVertical: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    ...Theme.shadows.medium,
  },
  googleIcon: {
    marginRight: Theme.spacing.sm,
  },
  googleText: {
    color: Colors.textDark,
    fontSize: Theme.fontSize.md,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Theme.spacing.xl,
  },
  footerText: {
    fontSize: Theme.fontSize.sm,
    color: Colors.white,
  },
  signupText: {
    fontSize: Theme.fontSize.sm,
    color: Colors.white,
    fontWeight: 'bold',
    marginLeft: Theme.spacing.xs,
    textDecorationLine: 'underline',
  },
});

export default PhoneLoginScreen; 