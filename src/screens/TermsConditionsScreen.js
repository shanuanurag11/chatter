import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../constants/colors';

const TermsConditionsScreen = () => {
  const navigation = useNavigation();

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={[Colors.gradientStart, Colors.gradientEnd]}
          style={styles.headerGradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
        >
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleGoBack}
          >
            <Icon name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Terms & Conditions</Text>
          <View style={styles.headerRight} />
        </LinearGradient>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.lastUpdated}>Last Updated: December 2024</Text>
          
          <Text style={styles.paragraph}>
            By downloading, installing, or using the Chatter app ("Service"), you agree to be bound by these Terms and Conditions ("Terms"). If you disagree with any part of these terms, then you may not access the Service.
          </Text>
          
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service. These Terms apply to all visitors, users, and others who access or use the Service.
          </Text>
          
          <Text style={styles.sectionTitle}>2. Age Requirements</Text>
          <Text style={styles.paragraph}>
            You must be at least 18 years old to use this Service. By using our Service, you represent and warrant that you are at least 18 years of age. If you are under 18, you may not use our Service.
          </Text>
          
          <Text style={styles.sectionTitle}>3. User Accounts</Text>
          <Text style={styles.paragraph}>
            When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account. You agree not to disclose your password to any third party.
          </Text>
          
          <Text style={styles.sectionTitle}>4. Acceptable Use</Text>
          <Text style={styles.paragraph}>
            You agree not to use the Service to:
          </Text>
          <Text style={styles.bulletPoint}>• Violate any applicable laws or regulations</Text>
          <Text style={styles.bulletPoint}>• Harass, abuse, or harm other users</Text>
          <Text style={styles.bulletPoint}>• Post inappropriate, offensive, or illegal content</Text>
          <Text style={styles.bulletPoint}>• Impersonate another person or entity</Text>
          <Text style={styles.bulletPoint}>• Attempt to gain unauthorized access to our systems</Text>
          <Text style={styles.bulletPoint}>• Use the Service for commercial purposes without permission</Text>
          <Text style={styles.bulletPoint}>• Interfere with or disrupt the Service</Text>
          
          <Text style={styles.sectionTitle}>5. User Content</Text>
          <Text style={styles.paragraph}>
            You retain ownership of any content you submit, post, or display on or through the Service. By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute your content in connection with the Service.
          </Text>
          
          <Text style={styles.sectionTitle}>6. Privacy Policy</Text>
          <Text style={styles.paragraph}>
            Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices regarding the collection and use of your personal information.
          </Text>
          
          <Text style={styles.sectionTitle}>7. Intellectual Property</Text>
          <Text style={styles.paragraph}>
            The Service and its original content, features, and functionality are and will remain the exclusive property of Chatter and its licensors. The Service is protected by copyright, trademark, and other laws.
          </Text>
          
          <Text style={styles.sectionTitle}>8. Payment Terms</Text>
          <Text style={styles.paragraph}>
            Some features of the Service may require payment. All payments are processed securely through third-party payment processors. You agree to pay all fees associated with your use of paid features. Prices are subject to change with notice.
          </Text>
          
          <Text style={styles.sectionTitle}>9. Termination</Text>
          <Text style={styles.paragraph}>
            We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including without limitation if you breach the Terms.
          </Text>
          
          <Text style={styles.sectionTitle}>10. Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            In no event shall Chatter, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Service.
          </Text>
          
          <Text style={styles.sectionTitle}>11. Disclaimer</Text>
          <Text style={styles.paragraph}>
            The Service is provided on an "AS IS" and "AS AVAILABLE" basis. Chatter makes no warranties, expressed or implied, and hereby disclaims all warranties, including without limitation, warranties of merchantability, fitness for a particular purpose, and non-infringement.
          </Text>
          
          <Text style={styles.sectionTitle}>12. Indemnification</Text>
          <Text style={styles.paragraph}>
            You agree to defend, indemnify, and hold harmless Chatter and its licensors from and against any claims, damages, obligations, losses, liabilities, costs, or debt arising from your use of the Service or violation of these Terms.
          </Text>
          
          <Text style={styles.sectionTitle}>13. Governing Law</Text>
          <Text style={styles.paragraph}>
            These Terms shall be interpreted and governed by the laws of the jurisdiction in which Chatter operates, without regard to its conflict of law provisions.
          </Text>
          
          <Text style={styles.sectionTitle}>14. Changes to Terms</Text>
          <Text style={styles.paragraph}>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
          </Text>
          
          <Text style={styles.sectionTitle}>15. Contact Information</Text>
          <Text style={styles.paragraph}>
            If you have any questions about these Terms and Conditions, please contact us at:
          </Text>
          <Text style={styles.contactInfo}>Email: legal@chatterapp.com</Text>
          <Text style={styles.contactInfo}>Address: 123 Tech Street, Mumbai, Maharashtra 400001, India</Text>
          
          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    position: 'relative',
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerRight: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 30,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 24,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
    marginLeft: 20,
    marginBottom: 8,
  },
  contactInfo: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
    marginBottom: 8,
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 50,
  },
});

export default TermsConditionsScreen; 