import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  PermissionsAndroid
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../constants/colors';
import InputField from '../components/InputField';
import SectionHeader from '../components/SectionHeader';
import PhotoSelector from '../components/PhotoSelector';
import TagsInput from '../components/TagsInput';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

// API config - replace with real API in production
const API_URL = 'https://api.example.com/v1/user';

// Dummy user data - would be replaced with Redux or Context in real app
const dummyUser = {
  userId: "109943032",
  username: "user3lGhMk98",
  images: [],
  gender: "Male",
  birthdate: "2007-04-09",
  constellation: "Aries",
  language: "English",
  tags: ["Aries"]
};

// For image picking demo - in a real app, use react-native-image-picker or similar
const mockImageOptions = [
  { id: 1, url: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { id: 2, url: 'https://randomuser.me/api/portraits/men/33.jpg' },
  { id: 3, url: 'https://randomuser.me/api/portraits/men/34.jpg' },
  { id: 4, url: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { id: 5, url: 'https://randomuser.me/api/portraits/women/45.jpg' }
];

/**
 * Edit Profile Screen
 * Allows user to update profile information including:
 * - Profile picture
 * - Photo album
 * - Personal information 
 * - Tags
 */
const EditProfileScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState({
    ...dummyUser,
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
  });
  const [tags, setTags] = useState(dummyUser.tags || []);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [tempValues, setTempValues] = useState({});
  
  // Image upload states
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  // Fetch user profile data
  const fetchUserData = async () => {
    console.log('Fetching user data...');
    
    try {
      // In a real app, this would be an API call
      // const response = await fetch(`${API_URL}/profile`);
      // const data = await response.json();
      
      // Using dummy data for now
      setTimeout(() => {
        const userData = {
          ...dummyUser,
          avatar: 'https://randomuser.me/api/portraits/men/32.jpg' // Add a sample avatar
        };
        console.log('Setting user data:', userData);
        setUser(userData);
        setTags(dummyUser.tags || []);
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to load profile data');
      setLoading(false);
    }
  };

  // Handle saving profile changes
  const handleSaveChanges = async () => {
    setSaving(true);
    
    try {
      // In a real app, this would be an API call
      // const response = await fetch(`${API_URL}/profile`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     ...user,
      //     tags
      //   }),
      // });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Show success message
      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    } catch (err) {
      console.error('Error updating profile:', err);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Navigate back to previous screen
  const handleGoBack = () => {
    navigation.goBack();
  };

  // Handle field edit toggling
  const toggleFieldEdit = (field) => {
    if (editing === field) {
      // Save the changes if we're already editing this field
      setEditing(null);
      if (tempValues[field] !== undefined) {
        setUser(prev => ({
          ...prev,
          [field]: tempValues[field]
        }));
      }
    } else {
      // Start editing this field
      setEditing(field);
      setTempValues(prev => ({
        ...prev,
        [field]: user[field]
      }));
    }
  };

  // Handle temp value changes
  const handleTempValueChange = (field, value) => {
    setTempValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle profile picture selection
  const handleProfilePictureSelect = () => {
    setImageModalVisible(true);
  };

  // Request camera permission - Android only
  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "App needs camera permission to take pictures",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // iOS handles permissions differently
  };

  // Fallback function for when react-native-image-picker doesn't work
  const handleImagePickerFallback = (type) => {
    setImageModalVisible(false);
    
    // Simulate image selection with mock data
    setTimeout(() => {
      Alert.alert(
        "Select Test Image",
        "Choose one of these sample images:",
        mockImageOptions.map(img => ({
          text: `Test Image ${img.id}`,
          onPress: () => {
            console.log('Selected fallback image:', img.url);
            // Create a mock imageData object similar to what react-native-image-picker would return
            const mockImageData = {
              uri: img.url,
              type: 'image/jpeg',
              fileName: `test_image_${img.id}.jpg`
            };
            handleImageUpload(mockImageData);
          }
        })).concat([
          {
            text: "Cancel",
            style: "cancel"
          }
        ])
      );
    }, 500);
  };

  // Handle camera selection with fallback
  const handleTakePhoto = async () => {
    try {
      const hasPermission = await requestCameraPermission();
      
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Camera permission is required to take photos');
        return;
      }

      const options = {
        mediaType: 'photo',
        quality: 0.8,
        saveToPhotos: true,
        includeBase64: false,
      };
      
      setImageModalVisible(false);
      
      try {
        console.log('Launching camera...');
        const result = await launchCamera(options);
        console.log('Camera result:', JSON.stringify(result));
        
        if (result.didCancel) {
          console.log('User cancelled camera');
        } else if (result.errorCode) {
          console.log('Camera Error:', result.errorMessage);
          Alert.alert('Error', 'Failed to take photo: ' + result.errorMessage);
        } else if (result.assets && result.assets.length > 0) {
          // Got photo data, now upload
          const imageData = result.assets[0];
          console.log('Image captured successfully:', imageData.uri);
          handleImageUpload(imageData);
        } else {
          console.log('No image captured or unknown error');
          Alert.alert('Error', 'Failed to capture image. Please try again.');
        }
      } catch (error) {
        console.error('Camera launch error:', error);
        console.log('Falling back to mock image picker');
        handleImagePickerFallback('camera');
      }
    } catch (error) {
      console.error('Camera permission error:', error);
      Alert.alert('Error', 'Failed to request camera permission. Using fallback option.');
      handleImagePickerFallback('camera');
    }
  };

  // Handle gallery selection with fallback
  const handleChooseFromGallery = async () => {
    try {
      const options = {
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: false,
        selectionLimit: 1,
      };
      
      setImageModalVisible(false);
      
      try {
        console.log('Launching image library...');
        const result = await launchImageLibrary(options);
        console.log('Gallery result:', JSON.stringify(result));
        
        if (result.didCancel) {
          console.log('User cancelled image picker');
        } else if (result.errorCode) {
          console.log('ImagePicker Error:', result.errorMessage);
          Alert.alert('Error', 'Failed to pick image: ' + result.errorMessage);
        } else if (result.assets && result.assets.length > 0) {
          // Got image data, now upload
          const imageData = result.assets[0];
          console.log('Image selected successfully:', imageData.uri);
          handleImageUpload(imageData);
        } else {
          console.log('No image selected or unknown error');
          Alert.alert('Error', 'Failed to select image. Please try again.');
        }
      } catch (error) {
        console.error('Image library launch error:', error);
        console.log('Falling back to mock image picker');
        handleImagePickerFallback('gallery');
      }
    } catch (error) {
      console.error('Gallery selection error:', error);
      Alert.alert('Error', 'Failed to open gallery. Using fallback option.');
      handleImagePickerFallback('gallery');
    }
  };

  // Handle actual image upload (with selected or captured image)
  const handleImageUpload = async (imageData) => {
    setUploadingImage(true);
    
    try {
      // Create a FormData object for multipart/form-data uploads
      const formData = new FormData();
      formData.append('userId', user.userId);
      
      // Append the image file
      formData.append('profileImage', {
        uri: imageData.uri,
        type: imageData.type || 'image/jpeg',
        name: imageData.fileName || 'profile.jpg',
      });
      
      // In a real app, you would make an API call like this:
      // const response = await fetch(`${API_URL}/profile/image`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'multipart/form-data',
      //     'Authorization': `Bearer ${accessToken}`,
      //   },
      //   body: formData,
      // });
      
      // For the demo, we'll simulate the delay and use the local image URI
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // After a successful upload, the server would return the new image URL
      // For demo purposes, we'll use the local URI
      setUser(prev => ({
        ...prev,
        avatar: imageData.uri
      }));
      
      Alert.alert("Success", "Profile picture updated successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Error", "Failed to upload profile picture. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle photo album changes 
  const handlePhotoAlbumChange = (photos) => {
    console.log('Photo album updated:', photos);
    // In a real app, this would update the photo array
    // and possibly upload new photos to a server
  };

  // Handle adding/removing tags
  const handleTagChange = (newTags) => {
    setTags(newTags);
  };

  // Render field based on edit state
  const renderField = (fieldKey, label, icon, editable = true) => {
    const isEditing = editing === fieldKey;
    const value = isEditing ? tempValues[fieldKey] : user[fieldKey];
    
    return (
      <View style={styles.fieldContainer}>
        <View style={styles.fieldIconContainer}>
          <Icon name={icon} size={20} color={Colors.primary} />
        </View>
        
        <View style={styles.fieldContent}>
          {isEditing ? (
            <View style={styles.editingFieldContainer}>
              <Text style={styles.fieldLabel}>{label}</Text>
              <View style={styles.inputWrapper}>
                <InputField
                  value={value || ''}
                  onChangeText={(text) => handleTempValueChange(fieldKey, text)}
                  placeholder={`Enter your ${label.toLowerCase()}`}
                  style={styles.editingInput}
                  autoFocus
                />
              </View>
              <View style={styles.editActionButtons}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setEditing(null)}
                >
                  <Icon name="close" size={18} color="#FF5252" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.saveFieldButton}
                  onPress={() => toggleFieldEdit(fieldKey)}
                >
                  <Icon name="checkmark" size={18} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <Text style={styles.fieldLabel}>{label}</Text>
              <View style={styles.fieldValueContainer}>
                <Text style={styles.fieldValue}>{value || 'Not set'}</Text>
                {editable && (
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => toggleFieldEdit(fieldKey)}
                    activeOpacity={0.7}
                  >
                    <Icon name="pencil" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </View>
      </View>
    );
  };

  // Remove profile picture with confirmation dialog
  const handleRemoveProfilePicture = () => {
    Alert.alert(
      "Remove Profile Picture",
      "Are you sure you want to remove your profile picture?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setImageModalVisible(false);
            setUser(prev => ({...prev, avatar: null}));
          }
        }
      ]
    );
  };

  // Render loading state
  if (loading) {
    console.log('Rendering loading state');
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
        <LinearGradient
          colors={[Colors.background, '#F9F5FF']}
          style={styles.gradientBackground}
        >
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Render error state
  if (error) {
    console.log('Rendering error state:', error);
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
        <LinearGradient
          colors={[Colors.background, '#F9F5FF']}
          style={styles.gradientBackground}
        >
          <View style={styles.errorContent}>
            <Icon name="alert-circle-outline" size={70} color="#FF5252" />
            <Text style={styles.errorTitle}>Oops!</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={fetchUserData}
            >
              <LinearGradient
                colors={[Colors.primaryLight, Colors.primary]}
                style={styles.retryButtonGradient}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  console.log('Rendering main UI, user:', user);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <LinearGradient
        colors={[Colors.background, '#F9F5FF']}
        style={styles.gradientBackground}
      >
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
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <View style={styles.headerRight} />
            
            {/* Decorative elements for header */}
            <View style={styles.headerDecoration1} />
            <View style={styles.headerDecoration2} />
          </LinearGradient>
        </View>
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Picture Section */}
          <View style={styles.profileCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.8)', 'rgba(245,240,255,0.8)']}
              style={styles.profileCardGradient}
            />
            
            <View style={styles.profilePictureWrapper}>
              <TouchableOpacity 
                style={styles.profilePictureContainer}
                onPress={handleProfilePictureSelect}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['rgba(108, 99, 255, 0.7)', 'rgba(142, 100, 255, 0.7)']}
                  style={styles.profileImageBorder}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                />
                {uploadingImage ? (
                  <View style={styles.uploadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                  </View>
                ) : user?.avatar ? (
                  <Image source={{ uri: user.avatar }} style={styles.profileImage} />
                ) : (
                  <View style={styles.profileImagePlaceholder}>
                    <Icon name="person" size={40} color="#CCCCCC" />
                  </View>
                )}
                <View style={styles.editIconContainer}>
                  <LinearGradient
                    colors={[Colors.primaryLight, Colors.primary]}
                    style={styles.editIconGradient}
                  >
                    <Icon name="camera" size={16} color="#FFFFFF" />
                  </LinearGradient>
                </View>
              </TouchableOpacity>
              
              <View style={styles.profileTextContainer}>
                <Text style={styles.profileNameText}>{user?.username || 'Username'}</Text>
                <Text style={styles.profileIdText}>ID: {user?.userId || 'N/A'}</Text>
                
                <View style={styles.statusBadge}>
                  <Icon name="checkmark-circle" size={14} color="#fff" />
                  <Text style={styles.statusBadgeText}>Verified Account</Text>
                </View>
              </View>
            </View>
          </View>
          
          {/* Photo Album Section - Temporarily hidden
          <View style={styles.section}>
            <SectionHeader 
              title={`Photo Album (${user?.images?.length || 0}/9)`} 
              subtitle="Share your favorite moments"
            />
            <PhotoSelector 
              photos={user?.images || []} 
              onPhotosChange={handlePhotoAlbumChange}
              maxPhotos={9}
            />
            <Text style={styles.helperText}>
              <Icon name="information-circle-outline" size={14} color="#999" /> Drag pictures to reorder
            </Text>
          </View>
          */}
          
          {/* My Info Section */}
          <View style={styles.section}>
            <SectionHeader 
              title="My Info" 
              subtitle="Personal information"
            />
            
            <View style={styles.infoFieldsContainer}>
              {/* Name Field */}
              {renderField('username', 'Name', 'person-outline')}
              
              {/* UserID Field - Not editable */}
              {renderField('userId', 'UserID', 'id-card-outline', false)}
              
              {/* Gender Field */}
              {renderField('gender', 'Gender', 'male-female-outline')}
              
              {/* Birthday Field */}
              {renderField('birthdate', 'Birthday', 'calendar-outline')}
              
              {/* Constellation Field */}
              {renderField('constellation', 'Constellation', 'star-outline')}
              
              {/* Language Field */}
              {renderField('language', 'Language', 'language-outline')}
            </View>
          </View>
          
          {/* Tags Section */}
          <View style={styles.section}>
            <SectionHeader 
              title="My Tags" 
              subtitle="Add tags to help others find you"
            />
            <TagsInput 
              tags={tags} 
              onTagsChange={handleTagChange} 
              placeholder="Add tags..."
            />
          </View>
          
          {/* Fixed height spacer for save button visibility - adjusted to be less prominent */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
        
        {/* Save button - adjusted positioning */}
        <View style={styles.saveButtonContainer}>
          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={handleSaveChanges}
            disabled={saving}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[Colors.gradientStart, Colors.gradientEnd]}
              style={styles.saveButtonGradient}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Icon name="checkmark-circle-outline" size={20} color="#FFFFFF" style={styles.saveButtonIcon} />
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
        
        {/* Image Upload Options Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={imageModalVisible}
          onRequestClose={() => setImageModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHandle} />
              
              <Text style={styles.modalTitle}>Update Profile Picture</Text>
              
              <TouchableOpacity 
                style={styles.modalOption} 
                onPress={handleTakePhoto}
              >
                <View style={styles.modalIconContainer}>
                  <Icon name="camera-outline" size={24} color={Colors.primary} />
                </View>
                <Text style={styles.modalOptionText}>Take Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalOption} 
                onPress={handleChooseFromGallery}
              >
                <View style={styles.modalIconContainer}>
                  <Icon name="image-outline" size={24} color={Colors.primary} />
                </View>
                <Text style={styles.modalOptionText}>Choose from Gallery</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalOption, styles.deleteOption]} 
                onPress={handleRemoveProfilePicture}
              >
                <View style={[styles.modalIconContainer, styles.deleteIconContainer]}>
                  <Icon name="trash-outline" size={24} color="#FF5252" />
                </View>
                <Text style={styles.deleteOptionText}>Remove Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setImageModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  gradientBackground: {
    flex: 1,
    position: 'relative',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: Colors.textMedium,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#555',
    marginTop: 20,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginBottom: 30,
    maxWidth: '80%',
  },
  retryButton: {
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  retryButtonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    height: 110,
    zIndex: 10,
    marginBottom: 10,
  },
  headerGradient: {
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  headerDecoration1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
  },
  headerDecoration2: {
    position: 'absolute',
    bottom: -40,
    left: 30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
    paddingHorizontal: 16,
  },
  profileCard: {
    borderRadius: 24,
    marginBottom: 16,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  profileCardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
  },
  profilePictureWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePictureContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    position: 'relative',
  },
  profileImageBorder: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: 55,
    zIndex: -1,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 47,
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 47,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  editIconGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileTextContainer: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  profileNameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  profileIdText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 22,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  helperText: {
    fontSize: 12,
    color: '#999999',
    marginTop: 8,
    marginLeft: 4,
  },
  infoFieldsContainer: {
    marginTop: 6,
  },
  fieldContainer: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  lastFieldContainer: {
    borderBottomWidth: 0,
    paddingBottom: 4,
  },
  fieldIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '15', // 15% opacity
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  fieldContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldLabel: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '600',
  },
  fieldValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '60%',
  },
  fieldValue: {
    fontSize: 16,
    color: '#999999',
    marginRight: 12,
    textAlign: 'right',
    flexShrink: 1,
  },
  editButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  editingFieldContainer: {
    flex: 1,
  },
  inputWrapper: {
    marginTop: 8,
    marginBottom: 8,
  },
  editingInput: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 10,
  },
  editActionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  cancelButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFEEEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  saveFieldButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSpacer: {
    height: 70,
  },
  saveButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingTop: 10,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  saveButton: {
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  saveButtonGradient: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
  },
  saveButtonIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  uploadingContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 47,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    alignItems: 'center',
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginVertical: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 20,
  },
  modalOption: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  deleteOption: {
    borderBottomWidth: 0,
  },
  deleteIconContainer: {
    backgroundColor: '#FFEEEE',
  },
  deleteOptionText: {
    color: '#FF5252',
    fontWeight: '500',
    fontSize: 16,
  },
  cancelButton: {
    width: '100%',
    paddingVertical: 16,
    marginTop: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
});

export default EditProfileScreen; 