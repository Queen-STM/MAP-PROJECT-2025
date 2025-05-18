import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Colors } from '@/constants/Colors';
import { Eye, EyeOff, User, Lock } from 'lucide-react-native';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    
    // For demo purposes, hardcoded credentials
    if (username === 'user123' && password === '12345') {
      setTimeout(() => {
        setIsLoading(false);
        router.replace('/(tabs)');
      }, 1000);
    } else {
      setTimeout(() => {
        setIsLoading(false);
        Alert.alert('Login Failed', 'Invalid username or password. Please try again.');
      }, 1000);
    }
  };

  const navigateToSignup = () => {
    router.push('/signup');
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

        <Card style={styles.loginCard}>
          <Text style={styles.cardTitle}>Login</Text>
          <Text style={styles.cardSubtitle}>Welcome back! Please sign in to continue.</Text>

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

          <Button
            title="Login"
            variant="primary"
            size="large"
            style={styles.loginButton}
            loading={isLoading}
            onPress={handleLogin}
            disabled={!username || !password}
          />

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account?</Text>
            <TouchableOpacity onPress={navigateToSignup}>
              <Text style={styles.signupLink}>Sign Up</Text>
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
    justifyContent: 'center',
    padding: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  appName: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: Colors.primary[700],
    textAlign: 'center',
  },
  loginCard: {
    padding: 24,
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
  loginButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.neutral[600],
    marginRight: 4,
  },
  signupLink: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: Colors.primary[600],
  },
});
