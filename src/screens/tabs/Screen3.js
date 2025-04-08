import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import Card from '../../components/Card';

const activityData = [
  { id: '1', type: 'notification', message: 'Your profile was viewed by someone', time: '2 hours ago' },
  { id: '2', type: 'update', message: 'System update completed successfully', time: '5 hours ago' },
  { id: '3', type: 'activity', message: 'Your subscription has been renewed', time: '1 day ago' },
  { id: '4', type: 'notification', message: 'New feature available', time: '3 days ago' },
];

const Screen3 = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Activity</Text>
          <Text style={styles.subtitle}>Your recent activity</Text>
        </View>
        
        {activityData.map(item => (
          <Card key={item.id} style={styles.card}>
            <View style={styles.activityItem}>
              <View style={styles.activityContent}>
                <Text style={styles.activityMessage}>{item.message}</Text>
                <Text style={styles.activityTime}>{item.time}</Text>
              </View>
            </View>
          </Card>
        ))}
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
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityMessage: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#999999',
  },
});

export default Screen3; 