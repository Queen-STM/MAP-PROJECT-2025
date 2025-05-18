import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Colors } from '@/constants/Colors';
import { ArrowLeft, Camera, Upload, Calendar, Hash, Medal, Shirt } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { getPlayerById, updatePlayer } from '@/utils/storage';

export default function PlayerEditScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const playerId = params.id as string;
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [jerseyNumber, setJerseyNumber] = useState('');
  const [position, setPosition] = useState('');
  const [nationality, setNationality] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [playerPhoto, setPlayerPhoto] = useState<string | null>(null);
  const [teamId, setTeamId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showPositionDropdown, setShowPositionDropdown] = useState(false);

  // Position options
  const positions = [
    "Goalkeeper",
    "Defender",
    "Midfielder",
    "Forward",
    "Utility Player"
  ];
  
  // Load player data
  useEffect(() => {
    const loadPlayer = async () => {
      try {
        const player = await getPlayerById(playerId);
        if (player) {
          setFirstName(player.firstName);
          setLastName(player.lastName);
          setDateOfBirth(player.dateOfBirth);
          setJerseyNumber(player.jerseyNumber);
          setPosition(player.position);
          setNationality(player.nationality);
          setHeight(player.height);
          setWeight(player.weight);
          setEmail(player.email);
          setPhone(player.phone);
          setPlayerPhoto(player.photoUrl);
          setTeamId(player.teamId);
        } else {
          Alert.alert('Error', 'Player not found');
          router.back();
        }
        setInitialLoading(false);
      } catch (error) {
        console.error('Error loading player:', error);
        Alert.alert('Error', 'Failed to load player data');
        router.back();
      }
    };

    loadPlayer();
  }, [playerId]);

  const selectPosition = (pos: string) => {
    setPosition(pos);
    setShowPositionDropdown(false);
  };

  const handleTakePhoto = async () => {
    // Request camera permissions
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "You need to grant camera permissions to take a photo.");
      return;
    }
    
    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    
    if (!result.canceled) {
      setPlayerPhoto(result.assets[0].uri);
    }
  };

  const handleUploadPhoto = async () => {
    // Request media library permissions
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "You need to grant media library permissions to upload a photo.");
      return;
    }
    
    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    
    if (!result.canceled) {
      setPlayerPhoto(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!firstName || !lastName || !position || !jerseyNumber) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Validate jersey number
    if (isNaN(Number(jerseyNumber)) || Number(jerseyNumber) < 1 || Number(jerseyNumber) > 99) {
      Alert.alert('Error', 'Jersey number must be between 1 and 99');
      return;
    }

    setIsLoading(true);
    
    try {
      // Update player in AsyncStorage
      await updatePlayer({
        id: playerId,
        teamId,
        firstName,
        lastName,
        dateOfBirth,
        jerseyNumber,
        position,
        nationality,
        height,
        weight,
        email,
        phone,
        photoUrl: playerPhoto,
      });
      
      setIsLoading(false);
      Alert.alert(
        'Player Updated',
        'Player has been updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', 'Failed to update player. Please try again.');
      console.error('Error updating player:', error);
    }
  };

  if (initialLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.loadingText}>Loading player data...</Text>
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
        <Text style={styles.headerTitle}>Edit Player</Text>
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
            <View style={styles.photoUploadContainer}>
              <View style={styles.photoPlaceholder}>
                {playerPhoto ? (
                  <Image source={{ uri: playerPhoto }} style={styles.playerImage} />
                ) : (
                  <Shirt size={40} color={Colors.neutral[400]} />
                )}
              </View>
              <View style={styles.photoButtons}>
                <Button
                  title="Take Photo"
                  variant="outline"
                  size="small"
                  style={styles.photoButton}
                  onPress={handleTakePhoto}
                  icon={<Camera size={16} color={Colors.primary[600]} style={{marginRight: 4}} />}
                />
                <Button
                  title="Upload"
                  variant="outline"
                  size="small"
                  style={styles.photoButton}
                  onPress={handleUploadPhoto}
                  icon={<Upload size={16} color={Colors.primary[600]} style={{marginRight: 4}} />}
                />
              </View>
            </View>

            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.rowContainer}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>First Name*</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter first name"
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholderTextColor={Colors.neutral[400]}
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Last Name*</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter last name"
                  value={lastName}
                  onChangeText={setLastName}
                  placeholderTextColor={Colors.neutral[400]}
                />
              </View>
            </View>

            <View style={styles.rowContainer}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Date of Birth</Text>
                <View style={styles.iconInput}>
                  <Calendar size={16} color={Colors.neutral[400]} style={styles.inputIcon} />
                  <TextInput
                    style={styles.inputWithIcon}
                    placeholder="YYYY-MM-DD"
                    value={dateOfBirth}
                    onChangeText={setDateOfBirth}
                    placeholderTextColor={Colors.neutral[400]}
                    keyboardType="numbers-and-punctuation"
                  />
                </View>
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Jersey Number*</Text>
                <View style={styles.iconInput}>
                  <Hash size={16} color={Colors.neutral[400]} style={styles.inputIcon} />
                  <TextInput
                    style={styles.inputWithIcon}
                    placeholder="1-99"
                    value={jerseyNumber}
                    onChangeText={setJerseyNumber}
                    placeholderTextColor={Colors.neutral[400]}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                </View>
              </View>
            </View>

            <Text style={styles.inputLabel}>Position*</Text>
            <TouchableOpacity
              style={[styles.input, styles.dropdownButton]}
              onPress={() => setShowPositionDropdown(!showPositionDropdown)}
            >
              <Text style={position ? styles.dropdownText : styles.dropdownPlaceholder}>
                {position || "Select position"}
              </Text>
            </TouchableOpacity>
            
            {showPositionDropdown && (
              <View style={styles.dropdownList}>
                {positions.map((pos) => (
                  <TouchableOpacity
                    key={pos}
                    style={styles.dropdownItem}
                    onPress={() => selectPosition(pos)}
                  >
                    <Text style={styles.dropdownItemText}>{pos}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.sectionTitle}>Physical Information</Text>
            
            <Text style={styles.inputLabel}>Nationality</Text>
            <View style={styles.iconInput}>
              <Medal size={16} color={Colors.neutral[400]} style={styles.inputIcon} />
              <TextInput
                style={styles.inputWithIcon}
                placeholder="Enter nationality"
                value={nationality}
                onChangeText={setNationality}
                placeholderTextColor={Colors.neutral[400]}
              />
            </View>

            <View style={styles.rowContainer}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Height (cm)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Height in cm"
                  value={height}
                  onChangeText={setHeight}
                  placeholderTextColor={Colors.neutral[400]}
                  keyboardType="number-pad"
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Weight (kg)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Weight in kg"
                  value={weight}
                  onChangeText={setWeight}
                  placeholderTextColor={Colors.neutral[400]}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <Text style={styles.sectionTitle}>Contact Information</Text>
            
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter email address"
              value={email}
              onChangeText={setEmail}
              placeholderTextColor={Colors.neutral[400]}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter phone number"
              value={phone}
              onChangeText={setPhone}
              placeholderTextColor={Colors.neutral[400]}
              keyboardType="phone-pad"
            />

            <Button
              title="Update Player"
              variant="primary"
              size="large"
              style={styles.submitButton}
              loading={isLoading}
              onPress={handleSubmit}
              disabled={!firstName || !lastName || !position || !jerseyNumber}
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
  photoUploadContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  playerImage: {
    width: '100%',
    height: '100%',
  },
  photoButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  photoButton: {
    marginHorizontal: 8,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: Colors.neutral[900],
    marginBottom: 16,
    marginTop: 8,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
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
  iconInput: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  inputWithIcon: {
    flex: 1,
    height: 50,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.neutral[900],
  },
  dropdownButton: {
    justifyContent: 'center',
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
