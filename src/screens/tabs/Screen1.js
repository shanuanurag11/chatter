import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import Card from '../../components/Card';

const Screen1 = () => {
  const { user } = useSelector(state => state.auth);
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Home Screen</Text>
          <Text style={styles.subtitle}>Welcome, {user?.name || 'User'}!</Text>
        </View>
        
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Latest Updates</Text>
          <Text style={styles.cardContent}>
            This is a placeholder for the home screen content. You would typically 
            display personalized content, recent activities, or featured items here.
          </Text>
        </Card>
        
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Getting Started</Text>
          <Text style={styles.cardContent}>
            This boilerplate includes authentication flow, tab navigation, and Redux setup.
            Edit the screens and components to build your app.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
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
  card: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333333',
  },
  cardContent: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666666',
  },
});

export default Screen1; 