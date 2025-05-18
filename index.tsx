import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View, Image, RefreshControl, ActivityIndicator, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Colors } from '@/constants/Colors';
import { Bell, ChevronRight } from 'lucide-react-native';
import { Event, getEvents } from '@/utils/storage';

// Helper function for formatting dates
const formatEventDate = (timestamp: number) => {
  const date = new Date(timestamp);
  const day = date.getDate().toString().padStart(2, '0');
  const month = new Intl.DateTimeFormat('en', { month: 'short' }).format(date).toUpperCase();
  const time = new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit', hour12: true }).format(date);
  
  return { day, month, time };
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const allEvents = await getEvents();
      
      // Filter for upcoming events and sort by date
      const upcoming = allEvents
        .filter(event => event.status === 'upcoming')
        .sort((a, b) => a.startDate - b.startDate)
        .slice(0, 5); // Get the first 5 upcoming events
      
      setUpcomingEvents(upcoming);
    } catch (error) {
      console.error('Error fetching events:', error);
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
  
  const handleViewAllEvents = () => {
    // @ts-ignore - Ignoring type error as the route exists
    router.push('/(tabs)/events');
  };
  
  const handleEventPress = (eventId: string) => {
    // @ts-ignore - Ignoring type error as the route will be created
    router.push(`/event-details?id=${eventId}`);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.titleText}>Namibia Hockey</Text>
        </View>
        <View style={styles.bellContainer}>
          <Bell size={24} color={Colors.neutral[700]} />
          <View style={styles.bellBadge} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <Card elevation="low" style={styles.featuredCard}>
          <Image
           source={require('./assets/h.jpeg')}
            style={styles.cardImage}
          />


          <View style={styles.cardOverlay}>
            <Text style={styles.cardOverlayText}>2024 Season</Text>
            <Text style={styles.cardTitle}>Registration Now Open</Text>
            <Button title="Register Now" style={styles.cardButton} />
          </View>
        </Card>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          <Button 
            title="View All" 
            variant="ghost" 
            size="small" 
            onPress={handleViewAllEvents}
          />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={Colors.primary[500]} />
            <Text style={styles.loadingText}>Loading events...</Text>
          </View>
        ) : upcomingEvents.length === 0 ? (
          <Text style={styles.noEventsText}>No upcoming events found</Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.eventsScrollContainer}>
            {upcomingEvents.map((event) => {
              const { day, month, time } = formatEventDate(event.startDate);
              
              return (
                <Pressable key={event.id} onPress={() => handleEventPress(event.id)}>
                  <Card style={styles.eventCard}>
                    <View style={styles.dateContainer}>
                      <Text style={styles.dateDay}>{day}</Text>
                      <Text style={styles.dateMonth}>{month}</Text>
                    </View>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventLocation}>{event.location}</Text>
                    <View style={styles.eventFooter}>
                      <Text style={styles.eventTime}>{time}</Text>
                      <ChevronRight size={16} color={Colors.primary[500]} />
                    </View>
                  </Card>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Latest News</Text>
          <Button title="View All" variant="ghost" size="small" />
        </View>

        {news.map((item, index) => (
          <Card key={index} style={styles.newsCard}>
            <Image source={{ uri: item.imageUrl }} style={styles.newsImage} />
            <View style={styles.newsContent}>
              <Text style={styles.newsDate}>{item.date}</Text>
              <Text style={styles.newsTitle}>{item.title}</Text>
              <Text style={styles.newsExcerpt} numberOfLines={2}>
                {item.excerpt}
              </Text>
              <Button 
                title="Read More" 
                variant="outline" 
                size="small" 
                style={styles.readMoreButton}
              />
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

const news = [
  {
    title: 'Namibia National Team Qualifies for World Cup',
    date: 'June 15, 2024',
    excerpt:
      'After an outstanding performance in the African Championships, the Namibia national hockey team has secured their spot in the upcoming World Cup.',
    imageUrl: 'https://images.pexels.com/photos/6956195/pexels-photo-6956195.jpeg',
  },
  {
    title: 'New Training Facilities Opening in Swakopmund',
    date: 'June 12, 2024',
    excerpt:
      'The Namibia Hockey Union is proud to announce the opening of new state-of-the-art training facilities in Swakopmund next month.',
    imageUrl: 'https://images.pexels.com/photos/6764076/pexels-photo-6764076.jpeg',
  },
];

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
  },
  welcomeText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.neutral[600],
  },
  titleText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: Colors.primary[600],
  },
  bellContainer: {
    position: 'relative',
    padding: 8,
  },
  bellBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.secondary[500],
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  featuredCard: {
    padding: 0,
    overflow: 'hidden',
    height: 200,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  cardOverlay: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 16,
    height: '100%',
    justifyContent: 'flex-end',
  },
  cardOverlayText: {
    color: 'white',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginBottom: 4,
  },
  cardTitle: {
    color: 'white',
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    marginBottom: 16,
  },
  cardButton: {
    width: 150,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: Colors.neutral[900],
  },
  eventsScrollContainer: {
    paddingRight: 16,
  },
  eventCard: {
    width: 200,
    marginRight: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  dateDay: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: Colors.primary[500],
  },
  dateMonth: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.primary[500],
    marginLeft: 4,
  },
  eventTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.neutral[900],
    marginBottom: 4,
  },
  eventLocation: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.neutral[600],
    marginBottom: 8,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventTime: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.primary[500],
  },
  newsCard: {
    flexDirection: 'row',
    padding: 0,
    overflow: 'hidden',
    height: 120,
    marginBottom: 12,
  },
  newsImage: {
    width: 120,
    height: '100%',
  },
  newsContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  newsDate: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.neutral[500],
  },
  newsTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: Colors.neutral[900],
    marginVertical: 4,
  },
  newsExcerpt: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.neutral[700],
    marginBottom: 8,
  },
  readMoreButton: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  loadingContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.neutral[600],
    marginTop: 8,
  },
  noEventsText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.neutral[600],
    fontStyle: 'italic',
    marginVertical: 16,
    textAlign: 'center',
  },
});