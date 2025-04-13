import { useDispatch, useSelector } from 'react-redux';
import { verifyOtp, sendOtp } from '../store/slices/authSlice';
import { loginWithGoogle, loginWithFacebook, loginWithApple } from '../store/slices/authSlice';

const PhoneLoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  const handleGoogleLogin = async () => {
    try {
      // In a real app, you would integrate with Google Sign-In SDK
      // For our dummy implementation, we'll pass mock data
      const googleUserData = {
        id: 'google-' + Math.random().toString(36).substring(2, 9),
        email: `user${Math.floor(Math.random() * 1000)}@gmail.com`,
        displayName: 'Google User',
        photoURL: 'https://via.placeholder.com/150',
      };
      
      await dispatch(loginWithGoogle(googleUserData));
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Google Login Failed', error.message);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      // In a real app, you would integrate with Facebook SDK
      // For our dummy implementation, we'll pass mock data
      const facebookUserData = {
        id: 'facebook-' + Math.random().toString(36).substring(2, 9),
        email: `user${Math.floor(Math.random() * 1000)}@facebook.com`,
        displayName: 'Facebook User',
        photoURL: 'https://via.placeholder.com/150',
      };
      
      await dispatch(loginWithFacebook(facebookUserData));
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Facebook Login Failed', error.message);
    }
  };

  const handleAppleLogin = async () => {
    try {
      // In a real app, you would integrate with Apple Sign-In
      // For our dummy implementation, we'll pass mock data
      const appleUserData = {
        id: 'apple-' + Math.random().toString(36).substring(2, 9),
        email: `user${Math.floor(Math.random() * 1000)}@icloud.com`,
        displayName: 'Apple User',
        photoURL: 'https://via.placeholder.com/150',
      };
      
      await dispatch(loginWithApple(appleUserData));
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Apple Login Failed', error.message);
    }
  };

  return (
    <View style={styles.socialLoginContainer}>
      <Text style={styles.orText}>Or login with</Text>
      <View style={styles.socialButtons}>
        <TouchableOpacity 
          style={[styles.socialButton, styles.googleButton]} 
          onPress={handleGoogleLogin}
        >
          <Ionicons name="logo-google" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.socialButton, styles.facebookButton]} 
          onPress={handleFacebookLogin}
        >
          <Ionicons name="logo-facebook" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.socialButton, styles.appleButton]} 
          onPress={handleAppleLogin}
        >
          <Ionicons name="logo-apple" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  socialLoginContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  orText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  googleButton: {
    backgroundColor: '#DB4437',
  },
  facebookButton: {
    backgroundColor: '#4267B2',
  },
  appleButton: {
    backgroundColor: '#000',
  },
}); 