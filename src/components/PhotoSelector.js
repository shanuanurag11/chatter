import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Image,
  FlatList
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Colors from '../constants/colors';

/**
 * PhotoSelector component
 * Displays a grid of photos with an add button
 * Supports drag to reorder functionality (commented code to be implemented)
 * 
 * @param {Array} photos - Array of photo objects with uri property
 * @param {Function} onPhotosChange - Callback when photos array changes
 * @param {number} maxPhotos - Maximum number of photos allowed
 */
const PhotoSelector = ({ photos = [], onPhotosChange, maxPhotos = 9 }) => {
  console.log('Rendering PhotoSelector, photos:', photos);
  
  // Handle adding a new photo
  const handleAddPhoto = () => {
    // In a real app, this would show image picker
    console.log('Open image picker');
    
    // For demo purposes, add a placeholder image
    if (photos.length < maxPhotos) {
      const newPhoto = {
        id: Date.now().toString(),
        uri: 'https://via.placeholder.com/150',
      };
      
      onPhotosChange([...photos, newPhoto]);
    }
  };
  
  // Handle removing a photo
  const handleRemovePhoto = (photoId) => {
    const updatedPhotos = photos.filter(photo => photo.id !== photoId);
    onPhotosChange(updatedPhotos);
  };
  
  // Render a photo item
  const renderPhotoItem = ({ item }) => {
    return (
      <View style={styles.photoItem}>
        <Image source={{ uri: item.uri }} style={styles.photo} />
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={() => handleRemovePhoto(item.id)}
        >
          <Icon name="close-circle" size={24} color="#FF5252" />
        </TouchableOpacity>
      </View>
    );
  };
  
  // Render the add photo button
  const renderAddButton = () => {
    if (photos.length >= maxPhotos) return null;
    
    return (
      <TouchableOpacity 
        style={styles.addButton}
        onPress={handleAddPhoto}
      >
        <Icon name="add" size={40} color="#CCCCCC" />
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={styles.container}>
      <FlatList
        data={photos}
        renderItem={renderPhotoItem}
        keyExtractor={item => item.id}
        numColumns={3}
        ListHeaderComponent={photos.length === 0 ? null : null}
        ListFooterComponent={renderAddButton}
        scrollEnabled={false}
        contentContainerStyle={styles.photoGrid}
      />
      
      {photos.length === 0 && (
        <TouchableOpacity 
          style={styles.emptyState}
          onPress={handleAddPhoto}
        >
          <Icon name="add" size={40} color="#CCCCCC" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  photoItem: {
    width: '31%',
    aspectRatio: 1,
    margin: '1%',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  addButton: {
    width: '31%',
    aspectRatio: 1,
    margin: '1%',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    maxHeight: 200,
  },
});

export default PhotoSelector; 