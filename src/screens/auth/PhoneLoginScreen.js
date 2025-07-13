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
  requestOTP, 
  verifyOTP, 
  clearAuthError, 
  resetOTPStatus 
} from '../../store/slices/authSlice';
import Colors from '../../constants/colors';
import Theme from '../../constants/theme';
import AnimatedBackground from '../../components/AnimatedBackground';
import PhoneInput from '../../components/PhoneInput';
import Button from '../../components/Button';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CheckBox from '@react-native-community/checkbox';
import { navigate } from '../../services/navigationService';

const PhoneLoginScreen = ({ navigation }) => {

  const [countryCode, setCountryCode] = useState('+91');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [hasConsent, setHasConsent] = useState(false);
  
  const dispatch = useDispatch();
  const { 
    isLoading, 
    error, 
    otpSent, 
    otpVerified,
    phoneNumber: savedPhoneNumber,
    countryCode: savedCountryCode 
  } = useSelector((state) => state.auth);

  // Use saved values when showing OTP section
  const displayPhoneNumber = otpSent ? savedPhoneNumber : mobileNumber;
  const displayCountryCode = otpSent ? savedCountryCode : countryCode;
  
  useEffect(() => {
    dispatch(clearAuthError());
    
    return () => {
      dispatch(resetOTPStatus());
    };
  }, [dispatch]);
  
  const validatePhone = () => {
    if (!mobileNumber.trim()) {
      setPhoneError('Phone number is required');
      return false;
    } else if (!/^\d{10}$/.test(mobileNumber)) {
      setPhoneError('Enter a valid 10-digit phone number');
      return false;
    }
    setPhoneError('');
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
  
  const handleRequestOtp = () => {
    if (!hasConsent) {
      Alert.alert('Consent Required', 'Please provide consent to receive OTP messages.');
      return;
    }

    if (validatePhone()) {
      dispatch(requestOTP({ countryCode, mobileNumber, hasConsent }))
        .unwrap()
        .then(() => {
          setOtp('');
        })
        .catch((error) => {
          Alert.alert('Error', error || 'Failed to send OTP');
          console.log('OTP request error:', error);
        });
    }
  };
  
  const handleVerifyOtp = () => {
    if (validateOtp()) {
      dispatch(verifyOTP({ 
        phone: savedPhoneNumber || mobileNumber, 
        otp 
      }))
        .unwrap()
        .then((response) => {
          console.log("response-1verifyotp1->", response);
          if (response) {
            if (response.is_signed_in === true) {
              console.log("User is signed in, auth state will handle navigation");
            } else {
              // navigate('Auth');
              navigate('Signup', {
                phoneNumber: (savedPhoneNumber || mobileNumber).toString(),
                countryCode: '+91'
              });
            }
          } else {
            Alert.alert('Error', 'Invalid response from server');
          }
        })
        .catch((error) => {
          console.error('Verification error:', error);
          Alert.alert('Error', error?.message || 'Login failed');
        });
    }
  };
  
  // Add console log in render to check values
  console.log('Render values:', { otpSent, countryCode, mobileNumber });
  
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
              
              <Text style={styles.title}>Welcome!</Text>
              <Text style={styles.subtitle}>
                Enter Mobile number to continue.
              </Text>
            </View>
            
            {error && (
              <View style={styles.errorContainer}>
                <Icon name="error-outline" size={20} color={Colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            
            {otpSent ? (
              <>
                <View style={styles.phoneDisplayContainer}>
                  <Icon 
                    name="phone" 
                    size={20} 
                    color={Colors.white} 
                    style={styles.inputIcon} 
                  />
                  <Text style={styles.phoneDisplayText}>
                    OTP sent to{' '}
                    <Text style={styles.phoneNumberHighlight}>
                      {displayCountryCode} {displayPhoneNumber}
                    </Text>
                  </Text>
                </View>

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
            ) : (
              <>
                <View style={styles.phoneInputContainer}>
                  <View style={styles.countryCodeContainer}>
                    <Text style={styles.countryCodeText}>{countryCode}</Text>
                  </View>
                  <TextInput
                    style={styles.phoneInput}
                    value={mobileNumber}
                    onChangeText={setMobileNumber}
                    placeholder="Enter mobile number"
                    placeholderTextColor={Colors.placeholderText}
                    keyboardType="phone-pad"
                    maxLength={10}
                    onBlur={validatePhone}
                  />
                </View>
                {phoneError ? <Text style={styles.fieldError}>{phoneError}</Text> : null}

                <View style={styles.consentContainer}>
                  <CheckBox
                    value={hasConsent}
                    onValueChange={setHasConsent}
                    tintColors={{ true: Colors.primary, false: Colors.white }}
                    style={styles.checkbox}
                  />
                  <Text style={styles.consentText}>
                    I consent to receive OTP messages for authentication purposes.
                  </Text>
                </View>
                
                <Button
                  title="Request OTP"
                  onPress={handleRequestOtp}
                  loading={isLoading}
                  style={[
                    styles.loginButton,
                    !hasConsent && styles.disabledButton
                  ]}
                  disabled={!hasConsent}
                  variant="white"
                />
              </>
            )}
            
            {/* <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View> */}
            
            {/* <TouchableOpacity
              style={styles.googleButton}
              onPress={() => {
                Alert.alert('Google Login', 'Google login will be implemented here.');
              }}
            >
              <Icon name="login" size={24} color="#DB4437" style={styles.googleIcon} />
              <Text style={styles.googleText}>Sign in with Google</Text>
            </TouchableOpacity> */}
{/*             
             <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text style={styles.signupText}>Sign Up</Text>
              </TouchableOpacity>
            </View>  */}
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
  },
  header: {
    marginBottom: Theme.spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: Theme.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.white,
    opacity: 0.8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.errorLight,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.lg,
  },
  errorText: {
    color: Colors.error,
    marginLeft: Theme.spacing.sm,
    flex: 1,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  countryCodeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
    marginRight: Theme.spacing.sm,
  },
  countryCodeText: {
    color: Colors.white,
    fontSize: 16,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: Theme.borderRadius.sm,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    color: Colors.white,
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: Theme.borderRadius.sm,
    paddingHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  },
  inputIcon: {
    marginRight: Theme.spacing.sm,
  },
  input: {
    flex: 1,
    color: Colors.white,
    fontSize: 16,
    paddingVertical: Theme.spacing.sm,
  },
  fieldError: {
    color: Colors.error,
    fontSize: 12,
    marginTop: -Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
  },
  loginButton: {
    marginTop: Theme.spacing.md,
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Theme.spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dividerText: {
    color: Colors.white,
    marginHorizontal: Theme.spacing.md,
    fontSize: Theme.fontSize.sm,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.sm,
    paddingVertical: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
  },
  googleIcon: {
    marginRight: Theme.spacing.sm,
  },
  googleText: {
    color: Colors.textDark,
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: Colors.white,
    fontSize: Theme.fontSize.sm,
  },
  signupText: {
    color: Colors.white,
    fontSize: Theme.fontSize.sm,
    fontWeight: 'bold',
    marginLeft: Theme.spacing.xs,
  },
  phoneDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom:20
    // backgroundColor: 'rgba(255, 255, 255, 0.1)',
    // borderRadius: Theme.borderRadius.sm,
    // paddingHorizontal: Theme.spacing.md,
    // paddingVertical: Theme.spacing.sm,
    // marginBottom: Theme.spacing.lg,
  },
  phoneDisplayText: {
    color: Colors.white,
    fontSize: 16,
    marginLeft: Theme.spacing.sm,
  },
  phoneNumberHighlight: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  consentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.sm,
  },
  checkbox: {
    marginRight: Theme.spacing.sm,
  },
  consentText: {
    color: Colors.white,
    fontSize: 14,
    flex: 1,
    opacity: 0.9,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default PhoneLoginScreen; 