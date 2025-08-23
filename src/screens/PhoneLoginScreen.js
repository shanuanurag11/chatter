import { useDispatch, useSelector } from 'react-redux';
import { loginWithFacebook, loginWithApple } from '../store/slices/authSlice';



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