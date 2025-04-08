import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import Card from '../../components/Card';
import Button from '../../components/Button';

const Screen4 = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: () => dispatch(logout()),
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>Your account</Text>
        </View>
        
        <Card style={styles.profileCard}>
          <View style={styles.profileInfo}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
            </View>
            <View style={styles.profileDetails}>
              <Text style={styles.profileName}>{user?.name || 'User'}</Text>
              <Text style={styles.profileEmail}>{user?.email || 'user@example.com'}</Text>
            </View>
          </View>
        </Card>
        
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Edit Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Change Password</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Notifications</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Privacy Settings</Text>
          </TouchableOpacity>
        </Card>
        
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="outline"
          style={styles.logoutButton}
        />
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
    paddingBottom: 32,
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
  profileCard: {
    marginBottom: 16,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileDetails: {
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  profileEmail: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  menuItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333333',
  },
  logoutButton: {
    marginTop: 16,
  },
});

export default Screen4; 