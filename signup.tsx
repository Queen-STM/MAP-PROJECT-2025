import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Colors } from '@/constants/Colors';
import { Eye, EyeOff, User, Lock, Mail, Phone } from 'lucide-react-native';

export default function SignupScreen() {
  const insets = useSafeAreaInsets();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = () => {
    // Basic validation
    if (!fullName || !email || !phone || !username || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Account Created',
        'Your account has been created successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/login')
          }
        ]
      );
    }, 1500);
  };

  const navigateToLogin = () => {
    router.push('/login');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoContainer}>
          <Image 
            source={{ uri: 'https://namibiahockey.org/wp-content/uploads/2022/07/cropped-NHU-Logo-2022-1-1.png' }} 
            style={styles.logo} 
            resizeMode="contain"
          />
          <Text style={styles.appName}>Namibia Hockey Union</Text>
        </View>

        <Card style={styles.signupCard}>
          <Text style={styles.cardTitle}>Create Account</Text>
          <Text style={styles.cardSubtitle}>Join the Namibia Hockey community</Text>

          <View style={styles.inputContainer}>
            <User size={20} color={Colors.neutral[400]} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={fullName}
              onChangeText={setFullName}
              placeholderTextColor={Colors.neutral[400]}
            />
          </View>

          <View style={styles.inputContainer}>
            <Mail size={20} color={Colors.neutral[400]} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={Colors.neutral[400]}
            />
          </View>

          <View style={styles.inputContainer}>
            <Phone size={20} color={Colors.neutral[400]} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholderTextColor={Colors.neutral[400]}
            />
          </View>

          <View style={styles.inputContainer}>
            <User size={20} color={Colors.neutral[400]} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              placeholderTextColor={Colors.neutral[400]}
            />
          </View>

          <View style={styles.inputContainer}>
            <Lock size={20} color={Colors.neutral[400]} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholderTextColor={Colors.neutral[400]}
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              {showPassword ? (
                <EyeOff size={20} color={Colors.neutral[400]} />
              ) : (
                <Eye size={20} color={Colors.neutral[400]} />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Lock size={20} color={Colors.neutral[400]} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              placeholderTextColor={Colors.neutral[400]}
            />
            <TouchableOpacity 
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              {showConfirmPassword ? (
                <EyeOff size={20} color={Colors.neutral[400]} />
              ) : (
                <Eye size={20} color={Colors.neutral[400]} />
              )}
            </TouchableOpacity>
          </View>

          <Button
            title="Create Account"
            variant="primary"
            size="large"
            style={styles.signupButton}
            loading={isLoading}
            onPress={handleSignup}
            disabled={!fullName || !email || !phone || !username || !password || !confirmPassword}
          />

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  appName: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: Colors.primary[700],
    textAlign: 'center',
  },
  signupCard: {
    padding: 24,
    marginBottom: 24,
  },
  cardTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: Colors.neutral[900],
    marginBottom: 8,
  },
  cardSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.neutral[600],
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    backgroundColor: 'white',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.neutral[900],
  },
  eyeIcon: {
    padding: 8,
  },
  signupButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.neutral[600],
    marginRight: 4,
  },
  loginLink: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: Colors.primary[600],
  },
});
