import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import Card from '../../components/Card';

const mockData = [
  { id: '1', title: 'Item 1', description: 'Description for item 1' },
  { id: '2', title: 'Item 2', description: 'Description for item 2' },
  { id: '3', title: 'Item 3', description: 'Description for item 3' },
  { id: '4', title: 'Item 4', description: 'Description for item 4' },
  { id: '5', title: 'Item 5', description: 'Description for item 5' },
];

const Screen2 = () => {
  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardDescription}>{item.description}</Text>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Browse</Text>
        <Text style={styles.subtitle}>Discover content</Text>
      </View>
      
      <FlatList
        data={mockData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginTop: 4,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  card: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333333',
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666666',
  },
});

export default Screen2; 