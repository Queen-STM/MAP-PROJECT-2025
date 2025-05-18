import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, RefreshControl, TextInput, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { Colors } from '@/constants/Colors';
import { Search, Plus, Users, Filter, X, Trophy, Calendar, Trash2, Edit } from 'lucide-react-native';
import { getTeams, deleteTeam, Team, initializeSampleData } from '@/utils/storage';

export default function TeamsScreen() {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Teams');
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);

  // Load teams from AsyncStorage
  const loadTeams = async () => {
    try {
      setIsLoading(true);
      const storedTeams = await getTeams();
      
      // If no teams exist, initialize with sample data
      if (storedTeams.length === 0) {
        await initializeSampleData();
        const initializedTeams = await getTeams();
        setTeams(initializedTeams);
      } else {
        setTeams(storedTeams);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading teams:', error);
      setIsLoading(false);
    }
  };

  // Load teams when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadTeams();
      return () => {};
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTeams();
    setRefreshing(false);
  };

  const handleDeleteTeam = async (teamId: string) => {
    try {
      await deleteTeam(teamId);
      // Refresh the teams list
      loadTeams();
      Alert.alert('Success', 'Team deleted successfully');
    } catch (error) {
      console.error('Error deleting team:', error);
      Alert.alert('Error', 'Failed to delete team');
    }
  };

  // Filter teams based on search query and active category
  const filteredTeams = teams.filter(team => {
    const matchesSearch = 
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.division.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = 
      activeCategory === 'All Teams' || 
      (activeCategory === 'Men' && team.division.includes('Men')) ||
      (activeCategory === 'Women' && team.division.includes('Women')) ||
      (activeCategory === 'Junior' && team.division.includes('Junior'));
      
    return matchesSearch && matchesCategory;
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>Teams</Text>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} color={Colors.neutral[700]} />
          </TouchableOpacity>
        </View>
        <Button 
          title="Register Team" 
          variant="primary" 
          size="small"
          style={styles.registerButton}
          textStyle={styles.registerButtonText}
          onPress={() => router.push('/team-registration')}
          icon={<Plus size={16} color="white" style={{marginRight: 4}} />}
        />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={Colors.neutral[400]} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search teams..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.neutral[400]}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearIconButton}
            >
              <X size={18} color={Colors.neutral[400]} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        
        <View style={styles.categoryTabs}>
          {['All Teams', 'Men', 'Women', 'Junior'].map((category) => (
            <TouchableOpacity 
              key={category}
              style={[
                styles.categoryTab, 
                activeCategory === category && styles.activeTab
              ]}
              onPress={() => setActiveCategory(category)}
            >
              <Text 
                style={[
                  styles.categoryText, 
                  activeCategory === category && styles.activeCategoryText
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary[500]} />
            <Text style={styles.loadingText}>Loading teams...</Text>
          </View>
        ) : filteredTeams.length === 0 ? (
          <EmptyState
            title="No teams found"
            message="Try adjusting your search or filters"
            icon={<Users size={48} color={Colors.neutral[300]} />}
            style={styles.emptyState}
          />
        ) : (
          filteredTeams.map((team) => (
            <TouchableOpacity 
              key={team.id} 
              onPress={() => router.push(`/team-details?id=${team.id}`)}
              activeOpacity={0.7}
            >
              <Card style={styles.teamCard}>
                <View style={styles.teamHeader}>
                  <Image source={{ uri: team.logoUrl }} style={styles.teamLogo} />
                  <View style={styles.teamInfo}>
                    <Text style={styles.teamName}>{team.name}</Text>
                    <View style={styles.teamDivision}>
                      <Text style={styles.divisionText}>{team.division}</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.teamStats}>
                  <View style={styles.statItem}>
                    <View style={styles.statIconContainer}>
                      <Users size={18} color={Colors.primary[500]} />
                    </View>
                    <Text style={styles.statValue}>{team.players}</Text>
                    <Text style={styles.statLabel}>Players</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <View style={styles.statIconContainer}>
                      <Trophy size={18} color={Colors.primary[500]} />
                    </View>
                    <Text style={styles.statValue}>{team.wins}</Text>
                    <Text style={styles.statLabel}>Wins</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <View style={styles.statIconContainer}>
                      <Calendar size={18} color={Colors.primary[500]} />
                    </View>
                    <Text style={styles.statValue}>{team.losses}</Text>
                    <Text style={styles.statLabel}>Losses</Text>
                  </View>
                </View>
                
                <View style={styles.buttonsContainer}>
                  <Button 
                    title="Team Details" 
                    variant="outline" 
                    size="small"
                    style={styles.detailsButton}
                    onPress={() => router.push(`/team-details?id=${team.id}`)}
                  />
                  <Button 
                    title="Manage Players" 
                    variant="primary" 
                    size="small"
                    style={styles.manageButton}
                    onPress={() => router.push(`/player-management?teamId=${team.id}`)}
                  />
                </View>
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => router.push(`/team-edit?id=${team.id}`)}
                  >
                    <Edit size={18} color={Colors.neutral[700]} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => {
                      Alert.alert(
                        'Delete Team',
                        `Are you sure you want to delete ${team.name}?`,
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Delete', style: 'destructive', onPress: () => handleDeleteTeam(team.id) }
                        ]
                      );
                    }}
                  >
                    <Trash2 size={18} color={Colors.error[700]} />
                  </TouchableOpacity>
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <Button
        title="Register New Team"
        style={styles.fabButton}
        textStyle={styles.fabButtonText}
        onPress={() => router.push('/team-registration')}
        icon={<Plus size={20} color="white" style={{marginRight: 8}} />}
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.neutral[100],
  },
  titleText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: Colors.neutral[900],
  },
  registerButton: {
    backgroundColor: Colors.primary[500],
  },
  registerButtonText: {
    color: 'white',
  },
  searchContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[100],
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 46,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.neutral[900],
  },
  clearIconButton: {
    padding: 8,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  categoryTabs: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  categoryTab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: Colors.neutral[100],
  },
  categoryText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.neutral[700],
  },
  activeTab: {
    backgroundColor: Colors.primary[500],
  },
  activeCategoryText: {
    color: 'white',
  },
  teamCard: {
    marginBottom: 16,
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  teamLogo: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: Colors.primary[100],
  },
  teamInfo: {
    marginLeft: 16,
  },
  teamName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: Colors.neutral[900],
    marginBottom: 4,
  },
  teamDivision: {
    backgroundColor: Colors.primary[100],
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  divisionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: Colors.primary[700],
  },
  teamStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.neutral[200],
    marginBottom: 16,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: Colors.neutral[900],
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.neutral[600],
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.neutral[200],
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailsButton: {
    flex: 1,
    marginRight: 8,
  },
  manageButton: {
    flex: 1,
    marginLeft: 8,
  },
  fabButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    paddingHorizontal: 20,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary[500],
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 1000,
  },
  fabButtonText: {
    flex: 1,
  },
  emptyState: {
    marginTop: 60,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.neutral[600],
    marginTop: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.neutral[100],
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: Colors.error[50],
  },
});