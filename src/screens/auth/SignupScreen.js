import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AnimatedBackground from '../../components/AnimatedBackground';
import Colors from '../../constants/colors';
import Theme from '../../constants/theme';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { register } from '../../redux/authSlice';

const { width } = Dimensions.get('window');

const SignupScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    country_code: '+91',
    mobile_number: '',
    user_email: '',
    username: '',
    profile_picture: null,
    date_of_birth: new Date(),
    bio: '',
    city: '',
    address: '',
    selected_age: '',
    gender: 'Male',
    images: [],
    videos: [],
    otp_code: 123456, // Default OTP for testing
    fcm_token: '' // Will be updated when available
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState({});

  const handleImagePicker = async (type) => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
    };

    try {
      const result = type === 'camera' 
        ? await launchCamera(options)
        : await launchImageLibrary(options);

      if (result.assets && result.assets[0]) {
        setFormData(prev => ({
          ...prev,
          profile_picture: result.assets[0]
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleMultipleImages = async () => {
    const options = {
      mediaType: 'photo',
      selectionLimit: 3,
      quality: 0.8,
    };

    try {
      const result = await launchImageLibrary(options);
      if (result.assets) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...result.assets]
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick images');
    }
  };

  const handleVideoPicker = async () => {
    const options = {
      mediaType: 'video',
      quality: 0.8,
    };

    try {
      const result = await launchImageLibrary(options);
      if (result.assets && result.assets[0]) {
        setFormData(prev => ({
          ...prev,
          videos: [...prev.videos, result.assets[0]]
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick video');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.mobile_number) newErrors.mobile_number = 'Mobile number is required';
    if (!formData.user_email) newErrors.user_email = 'Email is required';
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.selected_age) newErrors.selected_age = 'Age is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';

    // Email validation
    if (formData.user_email && !/\S+@\S+\.\S+/.test(formData.user_email)) {
      newErrors.user_email = 'Please enter a valid email address';
    }

    // Mobile number validation
    if (formData.mobile_number && !/^\d{10}$/.test(formData.mobile_number)) {
      newErrors.mobile_number = 'Please enter a valid 10-digit mobile number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    try{
    if (validateForm()) {
      const registrationData = new FormData();

      // Append all required fields
      Object.keys(formData).forEach(key => {
        if (key === 'profile_picture' && formData[key]) {
          registrationData.append('profile_picture', {
            uri: formData[key].uri,
            type: formData[key].type || 'image/jpeg',
            name: formData[key].fileName || 'profile.jpg'
          });
        } else if (key === 'images' && formData[key].length > 0) {
          formData[key].forEach((image, index) => {
            registrationData.append('images[]', {
              uri: image.uri,
              type: image.type || 'image/jpeg',
              name: image.fileName || `image${index}.jpg`
            });
          });
        } else if (key === 'videos' && formData[key].length > 0) {
          formData[key].forEach((video, index) => {
            registrationData.append('videos[]', {
              uri: video.uri,
              type: video.type || 'video/mp4',
              name: video.fileName || `video${index}.mp4`
            });
          });
        } else if (key === 'date_of_birth') {
          registrationData.append(key, formData[key].toISOString().split('T')[0]);
        } else if (formData[key] !== null && formData[key] !== '') {
          registrationData.append(key, formData[key]);
        }
      });

      try {
        await dispatch(register(registrationData)).unwrap();
        Alert.alert(
          'Success',
          'Registration successful!',
          [
            {
              text: 'OK',
              onPress: () => navigation.replace('MainApp')
            }
          ]
        );
      } catch (error) {
        Alert.alert(
          'Registration Failed',
          typeof error === 'string' ? error : 'Failed to create account. Please try again.'
        );
      }
    }
    }
    catch(error){
      console.log("error-->",error);
    }
  };

  const renderError = () => {
    if (error) {
      return (
        <Text style={styles.errorText}>
          {typeof error === 'string' ? error : 'An error occurred'}
        </Text>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedBackground />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Fill in your details to get started</Text>
          </View>
          
          <View style={styles.formContainer}>
            {/* Basic Information Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              
              <View style={styles.inputGroup}>
                <Input
                  label="Mobile Number"
                  value={formData.mobile_number}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, mobile_number: text }))}
                  keyboardType="phone-pad"
                  error={errors.mobile_number}
                  leftComponent={
                    <Text style={styles.countryCode}>{formData.country_code}</Text>
                  }
                  isDark={true}
                  containerStyle={styles.inputContainer}
                  inputStyle={styles.inputText}
                  labelStyle={styles.inputLabel}
                />

                <Input
                  label="Email"
                  value={formData.user_email}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, user_email: text }))}
                  keyboardType="email-address"
                  error={errors.user_email}
                  isDark={true}
                  containerStyle={styles.inputContainer}
                  inputStyle={styles.inputText}
                  labelStyle={styles.inputLabel}
                />

                <Input
                  label="Username"
                  value={formData.username}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, username: text }))}
                  error={errors.username}
                  isDark={true}
                  containerStyle={styles.inputContainer}
                  inputStyle={styles.inputText}
                  labelStyle={styles.inputLabel}
                />
              </View>
            </View>

            {/* Profile Picture Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Profile Picture</Text>
              <View style={styles.imageSection}>
                <View style={styles.profileImageContainer}>
                  {formData.profile_picture ? (
                    <Image
                      source={{ uri: formData.profile_picture.uri }}
                      style={styles.profileImage}
                    />
                  ) : (
                    <View style={styles.placeholderImage}>
                      <Icon name="person" size={40} color={Colors.lightGray} />
                    </View>
                  )}
                </View>
                <View style={styles.imageButtons}>
                  <TouchableOpacity 
                    style={styles.imageButton}
                    onPress={() => handleImagePicker('camera')}
                  >
                    <Icon name="camera-alt" size={24} color={Colors.white} />
                    <Text style={styles.imageButtonText}>Camera</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.imageButton}
                    onPress={() => handleImagePicker('library')}
                  >
                    <Icon name="photo-library" size={24} color={Colors.white} />
                    <Text style={styles.imageButtonText}>Gallery</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Personal Details Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Personal Details</Text>
              
              {showDatePicker && (
                <DateTimePicker
                  value={formData.date_of_birth}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      setFormData(prev => ({ ...prev, date_of_birth: selectedDate }));
                    }
                  }}
                />
              )}

              <View style={styles.inputGroup}>
                <TouchableOpacity 
                  style={styles.datePickerButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Icon name="calendar-today" size={20} color={Colors.lightGray} style={styles.dateIcon} />
                  <View>
                    <Text style={styles.dateLabel}>Date of Birth</Text>
                    <Text style={styles.dateValue}>
                      {formData.date_of_birth.toLocaleDateString()}
                    </Text>
                  </View>
                </TouchableOpacity>

                <Input
                  label="Bio"
                  value={formData.bio}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, bio: text }))}
                  multiline={true}
                  numberOfLines={3}
                  textAlignVertical="top"
                  error={errors.bio}
                  isDark={true}
                  containerStyle={[styles.inputContainer, styles.bioInput]}
                  inputStyle={[styles.inputText, styles.bioText]}
                  labelStyle={styles.inputLabel}
                />

                <Input
                  label="City"
                  value={formData.city}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, city: text }))}
                  error={errors.city}
                  isDark={true}
                  containerStyle={styles.inputContainer}
                  inputStyle={styles.inputText}
                  labelStyle={styles.inputLabel}
                />


                <View style={styles.rowInputs}>
                  <View style={[styles.inputContainer, styles.halfInput]}>
                    <Text style={styles.inputLabel}>Age</Text>
                    <View style={styles.pickerContainer}>
                      <View style={styles.pickerWrapper}>
                        <Icon name="cake" size={20} color={Colors.lightGray} style={styles.pickerIcon} />
                        <Picker
                          selectedValue={formData.selected_age}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, selected_age: value }))}
                          dropdownIconColor={Colors.white}
                          style={styles.agePicker}
                          itemStyle={styles.agePickerItem}
                        >
                          <Picker.Item label="Select Age" value="" color={Colors.lightGray} />
                          {[...Array(100)].map((_, index) => (
                            <Picker.Item
                              key={index + 1}
                              label={`${index + 1}`}
                              value={`${index + 1}`}
                              color={Colors.white}
                            />
                          ))}
                        </Picker>
                      </View>
                    </View>
                    {errors.selected_age && (
                      <Text style={styles.errorText}>{errors.selected_age}</Text>
                    )}
                  </View>

                  <View style={[styles.inputContainer, styles.halfInput]}>
                    <Text style={styles.inputLabel}>Gender</Text>
                    <View style={styles.genderPicker}>
                      <TouchableOpacity 
                        style={[
                          styles.genderButton,
                          formData.gender === 'Male' && styles.genderButtonActive
                        ]}
                        onPress={() => setFormData(prev => ({ ...prev, gender: 'Male' }))}
                      >
                        <Icon 
                          name="male" 
                          size={20} 
                          color={formData.gender === 'Male' ? Colors.white : Colors.lightGray} 
                          style={styles.genderIcon}
                        />
                        <Text style={[
                          styles.genderButtonText,
                          formData.gender === 'Male' && styles.genderButtonTextActive
                        ]}>Male</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[
                          styles.genderButton,
                          formData.gender === 'Female' && styles.genderButtonActive
                        ]}
                        onPress={() => setFormData(prev => ({ ...prev, gender: 'Female' }))}
                      >
                        <Icon 
                          name="female" 
                          size={20} 
                          color={formData.gender === 'Female' ? Colors.white : Colors.lightGray} 
                          style={styles.genderIcon}
                        />
                        <Text style={[
                          styles.genderButtonText,
                          formData.gender === 'Female' && styles.genderButtonTextActive
                        ]}>Female</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Media Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Additional Media</Text>
              
              <View style={styles.mediaSection}>
                <Text style={styles.mediaLabel}>Photos (Max 3)</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.mediaScroll}
                >
                  {formData.images.map((image, index) => (
                    <View key={index} style={styles.mediaPreview}>
                      <Image
                        source={{ uri: image.uri }}
                        style={styles.mediaImage}
                      />
                      <TouchableOpacity 
                        style={styles.removeMediaButton}
                        onPress={() => {
                          setFormData(prev => ({
                            ...prev,
                            images: prev.images.filter((_, i) => i !== index)
                          }));
                        }}
                      >
                        <Icon name="close" size={20} color={Colors.white} />
                      </TouchableOpacity>
                    </View>
                  ))}
                  {formData.images.length < 3 && (
                    <TouchableOpacity 
                      style={styles.addMediaButton}
                      onPress={handleMultipleImages}
                    >
                      <Icon name="add-photo-alternate" size={32} color={Colors.lightGray} />
                    </TouchableOpacity>
                  )}
                </ScrollView>

                <Text style={styles.mediaLabel}>Video</Text>
                {formData.videos.length > 0 ? (
                  <View style={styles.videoPreview}>
                    <Icon name="videocam" size={32} color={Colors.success} />
                    <Text style={styles.videoText}>Video selected</Text>
                    <TouchableOpacity 
                      style={styles.removeVideoButton}
                      onPress={() => setFormData(prev => ({ ...prev, videos: [] }))}
                    >
                      <Icon name="close" size={20} color={Colors.error} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={styles.addVideoButton}
                    onPress={handleVideoPicker}
                  >
                    <Icon name="video-call" size={32} color={Colors.lightGray} />
                    <Text style={styles.addVideoText}>Add a video</Text>
                  </TouchableOpacity>
          )}
        </View>
            </View>

            {renderError()}

            <Button
              title="Create Account"
              onPress={handleSubmit}
              loading={isLoading}
              style={styles.submitButton}
            />
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('PhoneLogin')}>
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Theme.spacing.lg,
  },
  header: {
    marginBottom: Theme.spacing.xl,
  },
  backButton: {
    marginBottom: Theme.spacing.md,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: Theme.spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.lightGray,
  },
  formContainer: {
    marginTop: Theme.spacing.md,
  },
  section: {
    marginBottom: Theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: Theme.spacing.lg,
  },
  inputGroup: {
    gap: Theme.spacing.lg,
  },
  inputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: 48,
  },
  inputText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '400',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
  },
  inputLabel: {
    color: Colors.lightGray,
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  label: {
    color: Colors.white,
    fontSize: 14,
    marginBottom: 8,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  imageButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Theme.spacing.xl,
  },
  imageButton: {
    alignItems: 'center',
  },
  imageButtonText: {
    color: Colors.white,
    marginTop: Theme.spacing.xs,
    fontSize: 12,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    marginBottom: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: 56,
  },
  dateIcon: {
    marginRight: Theme.spacing.md,
  },
  dateLabel: {
    color: Colors.lightGray,
    fontSize: 12,
  },
  dateValue: {
    color: Colors.white,
    fontSize: 16,
    marginTop: 4,
  },
  bioText: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  bioInput: {
    minHeight: 120,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
  },
  halfInput: {
    flex: 1,
    maxWidth: '48%',
  },
  pickerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: Theme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  pickerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Theme.spacing.sm,
  },
  pickerIcon: {
    marginRight: Theme.spacing.xs,
  },
  agePicker: {
    color: Colors.white,
    height: 48,
    flex: 1,
    backgroundColor: 'transparent',
  },
  agePickerItem: {
    fontSize: 16,
    height: 48,
    color: Colors.white,
  },
  genderPicker: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    height: 48,
  },
  genderIcon: {
    marginRight: Theme.spacing.xs,
  },
  genderButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  genderButtonText: {
    color: Colors.lightGray,
    fontSize: 14,
    fontWeight: '500',
  },
  genderButtonTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
  mediaSection: {
    gap: Theme.spacing.lg,
  },
  mediaLabel: {
    color: Colors.white,
    fontSize: 14,
    marginBottom: Theme.spacing.sm,
  },
  mediaScroll: {
    flexGrow: 0,
  },
  mediaPreview: {
    marginRight: Theme.spacing.md,
    position: 'relative',
  },
  mediaImage: {
    width: 100,
    height: 100,
    borderRadius: Theme.borderRadius.md,
  },
  removeMediaButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.error,
    borderRadius: 12,
    padding: 4,
  },
  addMediaButton: {
    width: 100,
    height: 100,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderStyle: 'dashed',
  },
  videoPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  videoText: {
    color: Colors.white,
    marginLeft: Theme.spacing.md,
    flex: 1,
  },
  removeVideoButton: {
    padding: Theme.spacing.sm,
  },
  addVideoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderStyle: 'dashed',
  },
  addVideoText: {
    color: Colors.lightGray,
    marginLeft: Theme.spacing.md,
  },
  submitButton: {
    marginTop: Theme.spacing.xl,
    backgroundColor: Colors.primary,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  footerText: {
    color: Colors.lightGray,
    fontSize: 14,
  },
  loginText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: Theme.spacing.xs,
  },
  countryCode: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '400',
    marginHorizontal: Theme.spacing.md,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 14
  },
});

export default SignupScreen; 