import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, RefreshControl, Pressable, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '@/components/common/Card';
import { Colors } from '@/constants/Colors';
import { Calendar, MapPin } from 'lucide-react-native';

export default function MatchesScreen() {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');
  
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const getMatchesByStatus = (status) => {
    return matches.filter(match => match.status === status);
  };

  const displayedMatches = 
    activeTab === 'upcoming' ? getMatchesByStatus('upcoming') : 
    activeTab === 'live' ? getMatchesByStatus('live') : 
    activeTab === 'results' ? getMatchesByStatus('completed') : [];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.titleText}>Matches</Text>
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
          style={[styles.tab, activeTab === 'live' && styles.activeTab]}
          onPress={() => setActiveTab('live')}>
          <Text style={[styles.tabText, activeTab === 'live' && styles.activeTabText]}>
            Live
          </Text>
          {getMatchesByStatus('live').length > 0 && (
            <View style={styles.liveBadge}>
              <Text style={styles.liveBadgeText}>{getMatchesByStatus('live').length}</Text>
            </View>
          )}
        </Pressable>
        <Pressable 
          style={[styles.tab, activeTab === 'results' && styles.activeTab]}
          onPress={() => setActiveTab('results')}>
          <Text style={[styles.tabText, activeTab === 'results' && styles.activeTabText]}>
            Results
          </Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        
        {displayedMatches.map((match, index) => (
          <Card key={index} style={styles.matchCard}>
            {match.status === 'live' && (
              <View style={styles.liveIndicator}>
                <View style={styles.liveBlinkingDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            )}
            
            <View style={styles.matchHeader}>
              <View style={styles.matchDateContainer}>
                <Calendar size={16} color={Colors.neutral[600]} style={styles.calendarIcon} />
                <Text style={styles.matchDate}>{match.date}</Text>
              </View>
              <View style={styles.locationContainer}>
                <MapPin size={16} color={Colors.neutral[600]} style={styles.locationIcon} />
                <Text style={styles.locationText}>{match.location}</Text>
              </View>
            </View>
            
            <View style={styles.teamsContainer}>
              <View style={styles.teamColumn}>
                <Image source={{ uri: match.homeTeam.logoUrl }} style={styles.teamLogo} />
                <Text style={styles.teamName}>{match.homeTeam.name}</Text>
                <Text style={styles.teamDivision}>{match.homeTeam.division}</Text>
              </View>
              
              <View style={styles.scoreContainer}>
                {match.status === 'upcoming' ? (
                  <>
                    <Text style={styles.vsText}>VS</Text>
                    <Text style={styles.matchTime}>{match.time}</Text>
                  </>
                ) : (
                  <>
                    <View style={styles.scoreBox}>
                      <Text style={styles.scoreText}>{match.homeTeam.score}</Text>
                    </View>
                    <Text style={styles.scoreDivider}>:</Text>
                    <View style={styles.scoreBox}>
                      <Text style={styles.scoreText}>{match.awayTeam.score}</Text>
                    </View>
                    {match.status === 'live' && (
                      <Text style={styles.periodText}>{match.period}</Text>
                    )}
                  </>
                )}
              </View>
              
              <View style={styles.teamColumn}>
                <Image source={{ uri: match.awayTeam.logoUrl }} style={styles.teamLogo} />
                <Text style={styles.teamName}>{match.awayTeam.name}</Text>
                <Text style={styles.teamDivision}>{match.awayTeam.division}</Text>
              </View>
            </View>
            
            {match.status === 'completed' && (
              <View style={styles.matchSummary}>
                <Text style={styles.summaryText}>{match.summary}</Text>
              </View>
            )}
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

const matches = [
  {
    status: 'upcoming',
    date: '24 Jun 2024',
    time: '15:00',
    location: 'Windhoek Stadium',
    homeTeam: {
      name: 'Windhoek Warriors',
      division: 'Men\'s Premier',
      logoUrl: 'https://images.pexels.com/photos/6146931/pexels-photo-6146931.jpeg',
      score: null
    },
    awayTeam: {
      name: 'Namibia Nationals',
      division: 'Men\'s Premier',
      logoUrl: 'https://images.pexels.com/photos/6889088/pexels-photo-6889088.jpeg',
      score: null
    }
  },
  {
    status: 'upcoming',
    date: '26 Jun 2024',
    time: '12:30',
    location: 'Sports Complex',
    homeTeam: {
      name: 'Coastal Strikers',
      division: 'Women\'s Premier',
      logoUrl: 'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg',
      score: null
    },
    awayTeam: {
      name: 'Desert Foxes',
      division: 'Junior Girls',
      logoUrl: 'https://images.pexels.com/photos/6891505/pexels-photo-6891505.jpeg',
      score: null
    }
  },
  {
    status: 'live',
    date: 'Today',
    period: '2nd Quarter',
    location: 'Central Field',
    homeTeam: {
      name: 'Capital City HC',
      division: 'Men\'s Premier',
      logoUrl: 'https://images.pexels.com/photos/6608358/pexels-photo-6608358.jpeg',
      score: 2
    },
    awayTeam: {
      name: 'Swakopmund Stars',
      division: 'Men\'s Premier',
      logoUrl: 'https://images.pexels.com/photos/6956245/pexels-photo-6956245.jpeg',
      score: 1
    }
  },
  {
    status: 'completed',
    date: '15 Jun 2024',
    location: 'Windhoek Stadium',
    summary: 'An intense match that saw the Warriors secure a decisive victory against the Nationals with solid defensive play and clinical finishing.',
    homeTeam: {
      name: 'Windhoek Warriors',
      division: 'Men\'s Premier',
      logoUrl: 'https://images.pexels.com/photos/6146931/pexels-photo-6146931.jpeg',
      score: 3
    },
    awayTeam: {
      name: 'Namibia Nationals',
      division: 'Men\'s Premier',
      logoUrl: 'https://images.pexels.com/photos/6889088/pexels-photo-6889088.jpeg',
      score: 1
    }
  },
  {
    status: 'completed',
    date: '10 Jun 2024',
    location: 'Sports Complex',
    summary: 'The Coastal Strikers dominated with their superior speed and technical skills, claiming a well-deserved victory.',
    homeTeam: {
      name: 'Coastal Strikers',
      division: 'Women\'s Premier',
      logoUrl: 'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg',
      score: 4
    },
    awayTeam: {
      name: 'Desert Foxes',
      division: 'Junior Girls',
      logoUrl: 'https://images.pexels.com/photos/6891505/pexels-photo-6891505.jpeg',
      score: 0
    }
  }
];

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
    flexDirection: 'row',
    justifyContent: 'center',
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
  liveBadge: {
    backgroundColor: Colors.secondary[500],
    borderRadius: 10,
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  liveBadgeText: {
    color: 'white',
    fontFamily: 'Inter-Bold',
    fontSize: 10,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  matchCard: {
    marginBottom: 16,
    padding: 16,
    position: 'relative',
  },
  liveIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.secondary[500],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveBlinkingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
    marginRight: 6,
  },
  liveText: {
    color: 'white',
    fontFamily: 'Inter-Bold',
    fontSize: 12,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  matchDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarIcon: {
    marginRight: 6,
  },
  matchDate: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.neutral[700],
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    marginRight: 6,
  },
  locationText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.neutral[700],
  },
  teamsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  teamColumn: {
    flex: 2,
    alignItems: 'center',
  },
  teamLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  teamName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.neutral[900],
    textAlign: 'center',
    marginBottom: 4,
  },
  teamDivision: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.neutral[600],
    textAlign: 'center',
  },
  scoreContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vsText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: Colors.neutral[800],
    marginBottom: 4,
  },
  matchTime: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.neutral[600],
  },
  scoreBox: {
    backgroundColor: Colors.neutral[100],
    width: 36,
    height: 36,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: Colors.neutral[900],
  },
  scoreDivider: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: Colors.neutral[400],
    marginHorizontal: 4,
  },
  periodText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: Colors.secondary[500],
    marginTop: 4,
  },
  matchSummary: {
    marginTop: 16,
    padding: 12,
    backgroundColor: Colors.neutral[50],
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary[500],
  },
  summaryText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.neutral[700],
    lineHeight: 20,
  },
});