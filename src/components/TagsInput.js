import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  FlatList
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Colors from '../constants/colors';

/**
 * TagsInput component
 * Allows adding and removing tags with a clean UI
 * 
 * @param {Array} tags - Array of tag strings
 * @param {Function} onTagsChange - Callback when tags array changes
 * @param {string} [placeholder] - Placeholder text for the input
 */
const TagsInput = ({ tags = [], onTagsChange, placeholder = "Add a tag..." }) => {
  console.log('Rendering TagsInput, tags:', tags);
  const [inputText, setInputText] = useState('');
  
  // Add a new tag
  const handleAddTag = () => {
    const trimmedText = inputText.trim();
    if (trimmedText && !tags.includes(trimmedText)) {
      const newTags = [...tags, trimmedText];
      onTagsChange(newTags);
      setInputText('');
    }
  };
  
  // Remove a tag
  const handleRemoveTag = (tagToRemove) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    onTagsChange(newTags);
  };
  
  // Handle input submission
  const handleInputSubmit = () => {
    handleAddTag();
  };
  
  // Render a tag item
  const renderTagItem = ({ item }) => {
    return (
      <View style={styles.tagItem}>
        <Text style={styles.tagText}>#{item}</Text>
        <TouchableOpacity 
          onPress={() => handleRemoveTag(item)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="close-circle" size={18} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.tagsContainer}>
        {tags.map(tag => (
          <TouchableOpacity 
            key={tag} 
            style={styles.tagItem}
            onPress={() => handleRemoveTag(tag)}
          >
            <Text style={styles.tagText}>#{tag}</Text>
            <Icon name="close" size={16} color={Colors.primary} style={styles.tagCloseIcon} />
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder={placeholder}
          placeholderTextColor="#999999"
          onSubmitEditing={handleInputSubmit}
          returnKeyType="done"
        />
        
        <TouchableOpacity 
          style={[
            styles.addButton,
            !inputText.trim() && styles.addButtonDisabled
          ]}
          onPress={handleAddTag}
          disabled={!inputText.trim()}
        >
          <Icon name="add" size={24} color={inputText.trim() ? Colors.primary : '#CCCCCC'} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '20', // 20% opacity
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: Colors.primary,
    marginRight: 4,
    fontWeight: '500',
  },
  tagCloseIcon: {
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#333333',
  },
  addButton: {
    padding: 6,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
});

export default TagsInput; 