import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, RefreshControl, Image, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { Colors } from '@/constants/Colors';
import { Calendar as CalendarIcon, MapPin, Users, Clock, Plus } from 'lucide-react-native';
import { Event, getEvents, getEventsForTeam, getTeams, registerTeamForEvent } from '@/utils/storage';

// Helper functions for date formatting
const formatDate = (date: Date): string => {
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

const formatTime = (date: Date): string => {
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  
  return `${formattedHours}:${minutes} ${ampm}`;
};

export default function EventsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [teams, setTeams] = useState<{ id: string, name: string }[]>([]);
  
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const allEvents = await getEvents();
      
      // Sort events by date
      allEvents.sort((a, b) => a.startDate - b.startDate);
      
      // Get my team's events
      // For simplicity, we'll just get events for the first team
      // In a real app, you'd get the user's team or let them select
      const teamsList = await getTeams();
      setTeams(teamsList.map(team => ({ id: team.id, name: team.name })));
      
      if (teamsList.length > 0) {
        const teamEvents = await getEventsForTeam(teamsList[0].id);
        setMyEvents(teamEvents);
      }
      
      setEvents(allEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      Alert.alert('Error', 'Failed to load events. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);
  
  // Fetch events when the screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchEvents();
      return () => {};
    }, [])
  );
  
  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };
  
  const handleRegisterTeam = async (eventId: string) => {
    if (teams.length === 0) {
      Alert.alert('No Teams', 'You need to create a team before registering for an event.');
      return;
    }
    
    // If there's only one team, register it directly
    if (teams.length === 1) {
      try {
        await registerTeamForEvent(eventId, teams[0].id);
        Alert.alert('Success', `${teams[0].name} has been registered for this event!`);
        fetchEvents(); // Refresh events
      } catch (error: any) {
        Alert.alert('Registration Failed', error.message || 'Could not register team for this event');
      }
      return;
    }
    
    // If there are multiple teams, show a selection dialog
    // This is a simple implementation - in a real app, you'd want a proper selection UI
    const teamOptions = teams.map(team => ({
      text: team.name,
      onPress: async () => {
        try {
          await registerTeamForEvent(eventId, team.id);
          Alert.alert('Success', `${team.name} has been registered for this event!`);
          fetchEvents(); // Refresh events
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
  
  const handleCreateEvent = () => {
    // @ts-ignore - Ignoring type error for now as the route will be created
    router.push('/event-registration');
  };
  
  const handleViewEventDetails = (eventId: string) => {
    // @ts-ignore - Ignoring type error for now as the route will be created
    router.push(`/event-details?id=${eventId}`);
  };
  
  const filteredEvents = 
    activeTab === 'upcoming' ? events.filter(event => event.status === 'upcoming' || event.status === 'ongoing') : 
    activeTab === 'past' ? events.filter(event => event.status === 'completed' || event.status === 'cancelled') :
    myEvents;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.titleText}>Events</Text>
      </View>

      <View style={styles.tabsContainer}>
        <Pressable 
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}>
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
            Upcoming
          </Text>
        </Pressable>
        <Pressable 
          style={[styles.tab, activeTab === 'past' && styles.activeTab]}
          onPress={() => setActiveTab('past')}>
          <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>
            Past
          </Text>
        </Pressable>
        <Pressable 
          style={[styles.tab, activeTab === 'myEvents' && styles.activeTab]}
          onPress={() => setActiveTab('myEvents')}>
          <Text style={[styles.tabText, activeTab === 'myEvents' && styles.activeTabText]}>
            My Events
          </Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary[500]} />
            <Text style={styles.loadingText}>Loading events...</Text>
          </View>
        ) : activeTab === 'myEvents' && myEvents.length === 0 ? (
          <EmptyState
            title="No Events Registered"
            message="You haven't registered for any events yet. Browse upcoming events and register to participate."
            buttonTitle="Browse Events"
            onButtonPress={() => setActiveTab('upcoming')}
            icon={<CalendarIcon size={48} color={Colors.neutral[300]} />}
            style={styles.emptyState}
          />
        ) : filteredEvents.length === 0 ? (
          <EmptyState
            title="No Events Found"
            message="There are no events to display at this time."
            icon={<CalendarIcon size={48} color={Colors.neutral[300]} />}
            style={styles.emptyState}
          />
        ) : (
          filteredEvents.map((event, index) => {
            // Format date for display
            const startDate = new Date(event.startDate);
            const day = startDate.getDate().toString().padStart(2, '0');
            const month = new Intl.DateTimeFormat('en', { month: 'short' }).format(startDate).toUpperCase();
            
            return (
              <Card key={event.id} style={styles.eventCard}>
                <Image 
                  source={{ uri: event.imageUrl || 'https://images.pexels.com/photos/6646175/pexels-photo-6646175.jpeg' }} 
                  style={styles.eventImage} 
                />
                
                <View style={styles.dateTag}>
                  <Text style={styles.dateDay}>{day}</Text>
                  <Text style={styles.dateMonth}>{month}</Text>
                </View>
                
                <View style={styles.eventContent}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  
                  <View style={styles.eventMetaRow}>
                    <MapPin size={16} color={Colors.neutral[600]} style={styles.metaIcon} />
                    <Text style={styles.eventMetaText}>{event.location}</Text>
                  </View>
                  
                  <View style={styles.eventMetaRow}>
                    <Clock size={16} color={Colors.neutral[600]} style={styles.metaIcon} />
                    <Text style={styles.eventMetaText}>
                      {formatDate(new Date(event.startDate))} - {formatTime(new Date(event.endDate))}
                    </Text>
                  </View>
                  
                  <View style={styles.eventMetaRow}>
                    <Users size={16} color={Colors.neutral[600]} style={styles.metaIcon} />
                    <Text style={styles.eventMetaText}>{event.registeredTeams} / {event.maxTeams} Teams</Text>
                  </View>
                  
                  <Text style={styles.eventDescription} numberOfLines={2}>
                    {event.description}
                  </Text>
                  
                  <View style={styles.eventFooter}>
                    {event.status === 'upcoming' || event.status === 'ongoing' ? (
                      <>
                        <Button 
                          title="Details" 
                          variant="outline" 
                          style={styles.detailsButton} 
                          onPress={() => handleViewEventDetails(event.id)}
                        />
                        <Button 
                          title="Register" 
                          style={styles.viewResultsButton} 
                          onPress={() => handleRegisterTeam(event.id)}
                        />
                      </>
                    ) : (
                      <Button 
                        title="View Results" 
                        style={{...styles.viewResultsButton, width: '100%'}}
                        onPress={() => handleViewEventDetails(event.id)}
                      />
                    )}
                  </View>
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>
      
      <Pressable style={styles.fabButton} onPress={handleCreateEvent}>
        <Plus size={24} color="white" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  titleText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: Colors.neutral[900],
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.primary[500],
  },
  tabText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.neutral[600],
  },
  activeTabText: {
    color: Colors.primary[500],
    fontFamily: 'Inter-SemiBold',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  eventCard: {
    marginBottom: 16,
    padding: 0,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: 150,
  },
  dateTag: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    minWidth: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  dateDay: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: Colors.primary[500],
  },
  dateMonth: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: Colors.neutral[700],
  },
  eventContent: {
    padding: 16,
  },
  eventTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: Colors.neutral[900],
    marginBottom: 8,
  },
  eventMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  metaIcon: {
    marginRight: 8,
  },
  eventMetaText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.neutral[700],
  },
  eventDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.neutral[700],
    marginTop: 8,
    marginBottom: 16,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailsButton: {
    flex: 1,
    marginRight: 8,
  },
  viewResultsButton: {
    flex: 1,
  },
  fabButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  fabButtonText: {
    color: 'white',
  },
  emptyState: {
    marginTop: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  loadingText: {
    marginTop: 16,
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.neutral[600],
  },
});