import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Colors } from '@/constants/Colors';
import { ArrowLeft, Camera, Upload, Users } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { getTeamById, updateTeam } from '@/utils/storage';

export default function TeamEditScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const teamId = params.id as string;
  
  const [teamName, setTeamName] = useState('');
  const [division, setDivision] = useState('');
  const [coach, setCoach] = useState('');
  const [manager, setManager] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [teamLogo, setTeamLogo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Division options
  const divisions = [
    "Men's Premier", 
    "Women's Premier", 
    "Men's First Division", 
    "Women's First Division", 
    "Junior Boys", 
    "Junior Girls"
  ];
  
  const [showDivisionDropdown, setShowDivisionDropdown] = useState(false);

  // Load team data
  useEffect(() => {
    const loadTeam = async () => {
      try {
        const team = await getTeamById(teamId);
        if (team) {
          setTeamName(team.name);
          setDivision(team.division);
          setCoach(team.coach);
          setManager(team.manager);
          setContactEmail(team.contactEmail);
          setContactPhone(team.contactPhone);
          setTeamLogo(team.logoUrl);
        } else {
          Alert.alert('Error', 'Team not found');
          router.back();
        }
        setInitialLoading(false);
      } catch (error) {
        console.error('Error loading team:', error);
        Alert.alert('Error', 'Failed to load team data');
        router.back();
      }
    };

    loadTeam();
  }, [teamId]);

  const selectDivision = (div: string) => {
    setDivision(div);
    setShowDivisionDropdown(false);
  };

  const handleUploadLogo = async () => {
    // Request media library permissions
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "You need to grant media library permissions to upload a logo.");
      return;
    }
    
    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    
    if (!result.canceled) {
      setTeamLogo(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!teamName || !division || !coach || !contactEmail || !contactPhone) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    try {
      // Update team in AsyncStorage
      await updateTeam({
        id: teamId,
        name: teamName,
        division,
        coach,
        manager,
        contactEmail,
        contactPhone,
        logoUrl: teamLogo,
      });
      
      setIsLoading(false);
      Alert.alert(
        'Team Updated',
        'Your team has been updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', 'Failed to update team. Please try again.');
      console.error('Error updating team:', error);
    }
  };

  if (initialLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.loadingText}>Loading team data...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={Colors.neutral[800]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Team</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Card style={styles.formCard}>
            <View style={styles.logoUploadContainer}>
              <View style={styles.logoPlaceholder}>
                {teamLogo ? (
                  <Image source={{ uri: teamLogo }} style={styles.logoImage} />
                ) : (
                  <Users size={40} color={Colors.neutral[400]} />
                )}
              </View>
              <Button
                title="Change Team Logo"
                variant="outline"
                size="small"
                style={styles.uploadButton}
                onPress={handleUploadLogo}
                textStyle={styles.uploadButtonText}
              />
            </View>

            <Text style={styles.sectionTitle}>Team Information</Text>
            
            <Text style={styles.inputLabel}>Team Name*</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter team name"
              value={teamName}
              onChangeText={setTeamName}
              placeholderTextColor={Colors.neutral[400]}
            />

            <Text style={styles.inputLabel}>Division*</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowDivisionDropdown(!showDivisionDropdown)}
            >
              <Text style={division ? styles.dropdownText : styles.dropdownPlaceholder}>
                {division || "Select division"}
              </Text>
            </TouchableOpacity>
            
            {showDivisionDropdown && (
              <View style={styles.dropdownList}>
                {divisions.map((div) => (
                  <TouchableOpacity
                    key={div}
                    style={styles.dropdownItem}
                    onPress={() => selectDivision(div)}
                  >
                    <Text style={styles.dropdownItemText}>{div}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.inputLabel}>Coach*</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter coach name"
              value={coach}
              onChangeText={setCoach}
              placeholderTextColor={Colors.neutral[400]}
            />

            <Text style={styles.inputLabel}>Manager</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter manager name"
              value={manager}
              onChangeText={setManager}
              placeholderTextColor={Colors.neutral[400]}
            />

            <Text style={styles.sectionTitle}>Contact Information</Text>
            
            <Text style={styles.inputLabel}>Email Address*</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter contact email"
              value={contactEmail}
              onChangeText={setContactEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={Colors.neutral[400]}
            />

            <Text style={styles.inputLabel}>Phone Number*</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter contact phone"
              value={contactPhone}
              onChangeText={setContactPhone}
              keyboardType="phone-pad"
              placeholderTextColor={Colors.neutral[400]}
            />

            <Button
              title="Update Team"
              variant="primary"
              size="large"
              style={styles.submitButton}
              loading={isLoading}
              onPress={handleSubmit}
              disabled={!teamName || !division || !coach || !contactEmail || !contactPhone}
            />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: Colors.neutral[900],
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  formCard: {
    padding: 24,
  },
  logoUploadContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  uploadButton: {
    minWidth: 180,
  },
  uploadButtonText: {
    color: Colors.primary[600],
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: Colors.neutral[900],
    marginBottom: 16,
    marginTop: 8,
  },
  inputLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.neutral[700],
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: 8,
    paddingHorizontal: 16,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.neutral[900],
    backgroundColor: 'white',
    marginBottom: 16,
  },
  dropdownButton: {
    height: 50,
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    backgroundColor: 'white',
    marginBottom: 16,
  },
  dropdownText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.neutral[900],
  },
  dropdownPlaceholder: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.neutral[400],
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: 8,
    backgroundColor: 'white',
    marginTop: -16,
    marginBottom: 16,
    maxHeight: 200,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  dropdownItemText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.neutral[900],
  },
  submitButton: {
    marginTop: 16,
  },
  loadingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.neutral[600],
  },
});
