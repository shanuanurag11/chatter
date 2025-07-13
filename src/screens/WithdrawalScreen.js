import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TextInput
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../constants/colors';

const WithdrawalScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    ifscCode: '',
    accountNumber: '',
    confirmAccountNumber: '',
    accountHolderName: '',
    coinsToWithdraw: ''
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.ifscCode.trim()) {
      newErrors.ifscCode = 'IFSC Code is required';
    } else if (formData.ifscCode.length !== 11) {
      newErrors.ifscCode = 'IFSC Code must be 11 characters';
    }

    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = 'Account Number is required';
    } else if (formData.accountNumber.length < 9) {
      newErrors.accountNumber = 'Account Number must be at least 9 digits';
    }

    if (!formData.confirmAccountNumber.trim()) {
      newErrors.confirmAccountNumber = 'Please confirm account number';
    } else if (formData.accountNumber !== formData.confirmAccountNumber) {
      newErrors.confirmAccountNumber = 'Account numbers do not match';
    }

    if (!formData.accountHolderName.trim()) {
      newErrors.accountHolderName = 'Account Holder Name is required';
    }

    if (!formData.coinsToWithdraw.trim()) {
      newErrors.coinsToWithdraw = 'Amount to withdraw is required';
    } else {
      const coins = parseInt(formData.coinsToWithdraw);
      if (isNaN(coins) || coins <= 0) {
        newErrors.coinsToWithdraw = 'Please enter a valid amount';
      } else if (coins < 100) {
        newErrors.coinsToWithdraw = 'Minimum withdrawal amount is 100 coins';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Withdrawal Request Submitted',
        'Your withdrawal request has been submitted successfully. You will receive the amount within 3-5 business days.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit withdrawal request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const renderInputField = (field, label, placeholder, icon, keyboardType = 'default', maxLength = null) => (
    <View style={styles.inputContainer}>
      <View style={styles.inputLabelContainer}>
        <Icon name={icon} size={18} color={Colors.primary} style={styles.inputIcon} />
        <Text style={styles.inputLabel}>{label}</Text>
      </View>
      <View style={[styles.inputWrapper, errors[field] && styles.inputError]}>
        <TextInput
          style={styles.textInput}
          placeholder={placeholder}
          placeholderTextColor={Colors.textLight}
          value={formData[field]}
          onChangeText={(value) => handleInputChange(field, value)}
          keyboardType={keyboardType}
          maxLength={maxLength}
          autoCapitalize={field === 'accountHolderName' ? 'words' : 'none'}
        />
      </View>
      {errors[field] && (
        <Text style={styles.errorText}>{errors[field]}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={Colors.background} 
        animated={true}
      />
      
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleGoBack}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={24} color={Colors.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Withdraw Coins</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header Card */}
          <View style={styles.headerCard}>
            <LinearGradient
              colors={[Colors.primary, Colors.primaryLight]}
              style={styles.headerGradient}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
            >
              <View style={styles.headerContent}>
                <View style={styles.iconContainer}>
                  <Icon name="wallet-outline" size={32} color={Colors.white} />
                </View>
                <Text style={styles.headerTitle}>Bank Transfer</Text>
                <Text style={styles.headerSubtitle}>
                  Withdraw your coins to your bank account
                </Text>
              </View>
            </LinearGradient>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Bank Details</Text>
            
            {renderInputField(
              'ifscCode',
              'IFSC Code',
              'Enter 11-digit IFSC code',
              'business-outline',
              'default',
              11
            )}
            
            {renderInputField(
              'accountNumber',
              'Account Number',
              'Enter account number',
              'card-outline',
              'numeric',
              20
            )}
            
            {renderInputField(
              'confirmAccountNumber',
              'Confirm Account Number',
              'Re-enter account number',
              'card-outline',
              'numeric',
              20
            )}
            
            {renderInputField(
              'accountHolderName',
              'Account Holder Name',
              'Enter account holder name',
              'person-outline',
              'default'
            )}
            
            {renderInputField(
              'coinsToWithdraw',
              'Coins to Withdraw',
              'Enter amount (min 100 coins)',
              'wallet-outline',
              'numeric'
            )}
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Icon name="information-circle-outline" size={20} color={Colors.info} />
              <Text style={styles.infoTitle}>Important Information</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoText}>
                • Minimum withdrawal amount: 100 coins{'\n'}
                • Processing time: 3-5 business days{'\n'}
                • Bank charges may apply{'\n'}
                • Ensure account details are correct
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.primaryLight]}
              style={styles.submitGradient}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
            >
              {loading ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <>
                  <Icon name="checkmark-outline" size={20} color={Colors.white} />
                  <Text style={styles.submitButtonText}>Submit Withdrawal</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textDark,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  headerCard: {
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerGradient: {
    padding: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 20,
  },
  formContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputIcon: {
    marginRight: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textDark,
  },
  inputWrapper: {
    backgroundColor: Colors.backgroundDark,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.divider,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputError: {
    borderColor: Colors.error,
  },
  textInput: {
    fontSize: 16,
    color: Colors.textDark,
    padding: 0,
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 4,
    marginLeft: 4,
  },
  infoCard: {
    margin: 20,
    backgroundColor: Colors.backgroundDark,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.info,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
    marginLeft: 8,
  },
  infoContent: {
    marginLeft: 28,
  },
  infoText: {
    fontSize: 13,
    color: Colors.textMedium,
    lineHeight: 18,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    marginLeft: 8,
  },
});

export default WithdrawalScreen; 