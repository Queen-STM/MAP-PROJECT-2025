import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, Alert, ActivityIndicator, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/common/Button';
import { Colors } from '@/constants/Colors';
import { ChevronLeft, Calendar, MapPin, Clock, Users, Image as ImageIcon } from 'lucide-react-native';
import { saveEvent } from '@/utils/storage';
import * as ImagePicker from 'expo-image-picker';
// We'll use a simpler date selection approach instead of DateTimePicker
// Custom date formatting function
const formatDateTime = (date: Date): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  
  return `${month} ${day}, ${year} ${formattedHours}:${minutes} ${ampm}`;
};

export default function EventRegistrationScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [maxTeams, setMaxTeams] = useState('12');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(new Date().getTime() + 3 * 60 * 60 * 1000)); // 3 hours later
  // Date selection state
  const [showDateSelection, setShowDateSelection] = useState(false);
  
  const handleImagePick = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'You need to grant permission to access your photos');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      setImageUrl(result.assets[0].uri);
    }
  };
  
  const handleSubmit = async () => {
    // Validate form
    if (!title.trim()) {
      Alert.alert('Missing Information', 'Please enter an event title');
      return;
    }
    
    if (!description.trim()) {
      Alert.alert('Missing Information', 'Please enter an event description');
      return;
    }
    
    if (!location.trim()) {
      Alert.alert('Missing Information', 'Please enter an event location');
      return;
    }
    
    if (isNaN(parseInt(maxTeams)) || parseInt(maxTeams) <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid number of maximum teams');
      return;
    }
    
    if (startDate >= endDate) {
      Alert.alert('Invalid Dates', 'End date must be after start date');
      return;
    }
    
    try {
      setLoading(true);
      
      await saveEvent({
        title,
        description,
        location,
        startDate: startDate.getTime(),
        endDate: endDate.getTime(),
        imageUrl,
        status: 'upcoming',
        maxTeams: parseInt(maxTeams),
      });
      
      Alert.alert(
        'Success',
        'Event has been created successfully!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert('Error', 'Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.neutral[800]} />
        </Pressable>
        <Text style={styles.headerTitle}>Create Event</Text>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formGroup}>
          <Text style={styles.label}>Event Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter event title"
            placeholderTextColor={Colors.neutral[400]}
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter event description"
            placeholderTextColor={Colors.neutral[400]}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Location</Text>
          <View style={styles.inputWithIcon}>
            <MapPin size={20} color={Colors.neutral[500]} style={styles.inputIcon} />
            <TextInput
              style={styles.iconInput}
              value={location}
              onChangeText={setLocation}
              placeholder="Enter event location"
              placeholderTextColor={Colors.neutral[400]}
            />
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Start Date & Time</Text>
          <Pressable 
            style={styles.inputWithIcon} 
            onPress={() => {
              // In a real app, we would show a date picker here
              // For now, let's just set a date 7 days in the future
              const newDate = new Date();
              newDate.setDate(newDate.getDate() + 7);
              setStartDate(newDate);
              
              // Also update end date if it's before the new start date
              if (endDate <= newDate) {
                setEndDate(new Date(newDate.getTime() + 3 * 60 * 60 * 1000));
              }
              
              Alert.alert('Date Set', 'Start date set to 7 days from now');
            }}
          >
            <Calendar size={20} color={Colors.neutral[500]} style={styles.inputIcon} />
            <Text style={styles.dateText}>
              {formatDateTime(startDate)}
            </Text>
          </Pressable>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>End Date & Time</Text>
          <Pressable 
            style={styles.inputWithIcon} 
            onPress={() => {
              // In a real app, we would show a date picker here
              // For now, let's just set a date 3 hours after the start date
              const newEndDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000);
              setEndDate(newEndDate);
              Alert.alert('Date Set', 'End date set to 3 hours after start time');
            }}
          >
            <Clock size={20} color={Colors.neutral[500]} style={styles.inputIcon} />
            <Text style={styles.dateText}>
              {formatDateTime(endDate)}
            </Text>
          </Pressable>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Maximum Teams</Text>
          <View style={styles.inputWithIcon}>
            <Users size={20} color={Colors.neutral[500]} style={styles.inputIcon} />
            <TextInput
              style={styles.iconInput}
              value={maxTeams}
              onChangeText={setMaxTeams}
              placeholder="Enter maximum number of teams"
              placeholderTextColor={Colors.neutral[400]}
              keyboardType="number-pad"
            />
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Event Image</Text>
          <Pressable style={styles.imagePickerButton} onPress={handleImagePick}>
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.previewImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <ImageIcon size={32} color={Colors.neutral[400]} />
                <Text style={styles.imagePlaceholderText}>Tap to select an image</Text>
              </View>
            )}
          </Pressable>
        </View>
        
        <Button
          title={loading ? 'Creating Event...' : 'Create Event'}
          onPress={handleSubmit}
          disabled={loading}
          style={styles.submitButton}
        />
        
        {loading && (
          <ActivityIndicator 
            size="large" 
            color={Colors.primary[500]} 
            style={styles.loadingIndicator} 
          />
        )}
      </ScrollView>
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
    padding: 16,
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
    marginLeft: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.neutral[800],
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: 8,
    padding: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.neutral[900],
  },
  textArea: {
    minHeight: 100,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: 8,
    padding: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  iconInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.neutral[900],
    padding: 0,
  },
  dateText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.neutral[900],
  },
  imagePickerButton: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: Colors.neutral[300],
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.neutral[500],
    marginTop: 8,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  submitButton: {
    marginTop: 20,
  },
  loadingIndicator: {
    marginTop: 20,
  },
});
