import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, MapPin, Calendar, Clock, Users, Trophy } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { 
  Event, 
  Team, 
  getEventById, 
  getRegisteredTeamsForEvent, 
  getTeams, 
  registerTeamForEvent 
} from '@/utils/storage';
// Custom date formatting functions
const formatFullDate = (date: Date): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  const dayName = days[date.getDay()];
  const monthName = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  
  return `${dayName}, ${monthName} ${day}, ${year}`;
};

const formatTime = (date: Date): string => {
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  
  return `${formattedHours}:${minutes} ${ampm}`;
};

export default function EventDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const eventId = Array.isArray(id) ? id[0] : id || '';
  
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<Event | null>(null);
  const [registeredTeams, setRegisteredTeams] = useState<Team[]>([]);
  const [availableTeams, setAvailableTeams] = useState<Team[]>([]);
  
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch event details
        const eventData = await getEventById(eventId);
        if (!eventData) {
          Alert.alert('Error', 'Event not found', [
            { text: 'Go Back', onPress: () => router.back() }
          ]);
          return;
        }
        
        setEvent(eventData);
        
        // Fetch registered teams
        const teamsForEvent = await getRegisteredTeamsForEvent(eventId);
        setRegisteredTeams(teamsForEvent);
        
        // Fetch available teams (teams not registered for this event)
        const allTeams = await getTeams();
        const registeredTeamIds = teamsForEvent.map(team => team.id);
        const unregisteredTeams = allTeams.filter(team => !registeredTeamIds.includes(team.id));
        setAvailableTeams(unregisteredTeams);
        
      } catch (error) {
        console.error('Error fetching event details:', error);
        Alert.alert('Error', 'Failed to load event details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEventDetails();
  }, [eventId]);
  
  const handleRegisterTeam = async () => {
    if (availableTeams.length === 0) {
      Alert.alert('No Teams Available', 'All your teams are already registered for this event or you need to create a team first.');
      return;
    }
    
    // If there's only one team available, register it directly
    if (availableTeams.length === 1) {
      try {
        await registerTeamForEvent(eventId, availableTeams[0].id);
        Alert.alert('Success', `${availableTeams[0].name} has been registered for this event!`);
        // Refresh the data
        const teamsForEvent = await getRegisteredTeamsForEvent(eventId);
        setRegisteredTeams(teamsForEvent);
        setAvailableTeams(prev => prev.filter(team => team.id !== availableTeams[0].id));
        
        // Update event data
        const updatedEvent = await getEventById(eventId);
        if (updatedEvent) setEvent(updatedEvent);
      } catch (error: any) {
        Alert.alert('Registration Failed', error.message || 'Could not register team for this event');
      }
      return;
    }
    
    // If there are multiple teams, show a selection dialog
    const teamOptions = availableTeams.map(team => ({
      text: team.name,
      onPress: async () => {
        try {
          await registerTeamForEvent(eventId, team.id);
          Alert.alert('Success', `${team.name} has been registered for this event!`);
          
          // Refresh the data
          const teamsForEvent = await getRegisteredTeamsForEvent(eventId);
          setRegisteredTeams(teamsForEvent);
          setAvailableTeams(prev => prev.filter(t => t.id !== team.id));
          
          // Update event data
          const updatedEvent = await getEventById(eventId);
          if (updatedEvent) setEvent(updatedEvent);
        } catch (error: any) {
          Alert.alert('Registration Failed', error.message || 'Could not register team for this event');
        }
      }
    }));
    
    Alert.alert(
      'Select Team',
      'Which team would you like to register?',
      [...teamOptions, { text: 'Cancel', style: 'cancel' }]
    );
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
        <Text style={styles.loadingText}>Loading event details...</Text>
      </View>
    );
  }
  
  if (!event) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Event not found</Text>
        <Button title="Go Back" onPress={() => router.back()} style={styles.errorButton} />
      </View>
    );
  }
  
  const isUpcoming = event.status === 'upcoming' || event.status === 'ongoing';
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image 
          source={{ uri: event.imageUrl || 'https://images.pexels.com/photos/6646175/pexels-photo-6646175.jpeg' }} 
          style={styles.headerImage} 
        />
        
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color="white" />
        </Pressable>
        
        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{event.title}</Text>
            <View style={[styles.statusBadge, 
              event.status === 'upcoming' ? styles.upcomingBadge :
              event.status === 'ongoing' ? styles.ongoingBadge :
              event.status === 'completed' ? styles.completedBadge :
              styles.cancelledBadge
            ]}>
              <Text style={styles.statusText}>
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <Calendar size={20} color={Colors.neutral[600]} style={styles.infoIcon} />
            <Text style={styles.infoText}>
              {formatFullDate(startDate)}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Clock size={20} color={Colors.neutral[600]} style={styles.infoIcon} />
            <Text style={styles.infoText}>
              {formatTime(startDate)} - {formatTime(endDate)}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <MapPin size={20} color={Colors.neutral[600]} style={styles.infoIcon} />
            <Text style={styles.infoText}>{event.location}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Users size={20} color={Colors.neutral[600]} style={styles.infoIcon} />
            <Text style={styles.infoText}>
              {event.registeredTeams} / {event.maxTeams} Teams Registered
            </Text>
          </View>
          
          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>About this Event</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>
          
          <View style={styles.teamsContainer}>
            <Text style={styles.sectionTitle}>Registered Teams</Text>
            
            {registeredTeams.length === 0 ? (
              <Text style={styles.noTeamsText}>No teams registered yet</Text>
            ) : (
              registeredTeams.map(team => (
                <Card key={team.id} style={styles.teamCard}>
                  <View style={styles.teamCardContent}>
                    <Image 
                      source={{ uri: team.logoUrl || 'https://via.placeholder.com/100' }} 
                      style={styles.teamLogo} 
                    />
                    <View style={styles.teamInfo}>
                      <Text style={styles.teamName}>{team.name}</Text>
                      <Text style={styles.teamDivision}>{team.division}</Text>
                    </View>
                    <Pressable 
                      style={styles.viewTeamButton}
                      onPress={() => {
                        // @ts-ignore - Ignoring type error as the route exists
                        router.push(`/team-details?id=${team.id}`);
                      }}
                    >
                      <Text style={styles.viewTeamButtonText}>View</Text>
                    </Pressable>
                  </View>
                </Card>
              ))
            )}
          </View>
          
          {isUpcoming && event.registeredTeams < event.maxTeams && availableTeams.length > 0 && (
            <Button 
              title="Register a Team" 
              onPress={handleRegisterTeam} 
              style={styles.registerButton}
            />
          )}
          
          {!isUpcoming && event.status === 'completed' && (
            <View style={styles.resultsContainer}>
              <View style={styles.resultsTitleRow}>
                <Trophy size={24} color={Colors.primary[500]} />
                <Text style={styles.resultsTitle}>Event Results</Text>
              </View>
              
              <Text style={styles.resultsText}>
                Results for this event will be posted here once available.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.neutral[600],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontFamily: 'Inter-Medium',
    fontSize: 18,
    color: Colors.neutral[800],
    marginBottom: 20,
  },
  errorButton: {
    width: 200,
  },
  headerImage: {
    width: '100%',
    height: 200,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: Colors.neutral[900],
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  upcomingBadge: {
    backgroundColor: Colors.primary[100],
  },
  ongoingBadge: {
    backgroundColor: Colors.success[100],
  },
  completedBadge: {
    backgroundColor: Colors.neutral[200],
  },
  cancelledBadge: {
    backgroundColor: Colors.error[100],
  },
  statusText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: Colors.neutral[800],
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.neutral[800],
  },
  descriptionContainer: {
    marginTop: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: Colors.neutral[900],
    marginBottom: 12,
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.neutral[800],
    lineHeight: 24,
  },
  teamsContainer: {
    marginBottom: 24,
  },
  noTeamsText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.neutral[600],
    fontStyle: 'italic',
    marginTop: 8,
  },
  teamCard: {
    marginBottom: 12,
  },
  teamCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  teamLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.neutral[200],
  },
  teamInfo: {
    flex: 1,
    marginLeft: 12,
  },
  teamName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.neutral[900],
  },
  teamDivision: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.neutral[600],
  },
  viewTeamButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.primary[50],
    borderRadius: 4,
  },
  viewTeamButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.primary[600],
  },
  registerButton: {
    marginBottom: 24,
  },
  resultsContainer: {
    backgroundColor: Colors.neutral[100],
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  resultsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultsTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: Colors.neutral[900],
    marginLeft: 8,
  },
  resultsText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.neutral[700],
  },
});
