import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * SectionHeader component
 * Renders a section header with title and optional subtitle
 * 
 * @param {string} title - The section title
 * @param {string} [subtitle] - Optional subtitle (smaller text)
 */
const SectionHeader = ({ title, subtitle }) => {
  console.log('Rendering SectionHeader:', { title, subtitle });
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  subtitle: {
    fontSize: 14,
    color: '#999999',
    marginTop: 4,
  },
});

export default SectionHeader; 