import React from 'react';
import { StyleSheet, Text, View, Image, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Colors } from '@/constants/Colors';
import { LogOut, User, Settings, Shield, HelpCircle } from 'lucide-react-native';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Logout',
          onPress: () => {
            // Navigate to login screen
            router.replace('/login');
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.titleText}>Profile</Text>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <Image 
            source={{ uri: 'https://images.pexels.com/photos/6146931/pexels-photo-6146931.jpeg' }} 
            style={styles.avatar} 
          />
        </View>
        <Text style={styles.userName}>Coach Smith</Text>
        <Text style={styles.userRole}>Team Coach</Text>
      </View>

      <Card style={styles.menuCard}>
        <View style={styles.menuItem}>
          <User size={24} color={Colors.primary[500]} style={styles.menuIcon} />
          <Text style={styles.menuText}>Account Information</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.menuItem}>
          <Shield size={24} color={Colors.primary[500]} style={styles.menuIcon} />
          <Text style={styles.menuText}>Privacy & Security</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.menuItem}>
          <Settings size={24} color={Colors.primary[500]} style={styles.menuIcon} />
          <Text style={styles.menuText}>Settings</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.menuItem}>
          <HelpCircle size={24} color={Colors.primary[500]} style={styles.menuIcon} />
          <Text style={styles.menuText}>Help & Support</Text>
        </View>
      </Card>

      <Button
        title="Logout"
        variant="outline"
        size="large"
        style={styles.logoutButton}
        onPress={handleLogout}
        textStyle={styles.logoutButtonText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  titleText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: Colors.neutral[900],
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: Colors.primary[500],
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  userName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: Colors.neutral[900],
    marginBottom: 4,
  },
  userRole: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.neutral[600],
  },
  menuCard: {
    margin: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  menuIcon: {
    marginRight: 16,
  },
  menuText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.neutral[900],
  },
  divider: {
    height: 1,
    backgroundColor: Colors.neutral[200],
  },
  logoutButton: {
    margin: 16,
    borderColor: Colors.error[500],
  },
  logoutButtonText: {
    color: Colors.error[500],
  },
});
