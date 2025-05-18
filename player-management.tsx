import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Alert, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { EmptyState } from '@/components/common/EmptyState';
import { Colors } from '@/constants/Colors';
import { ArrowLeft, Plus, Search, Filter, Users, Trash2, Edit, X, ChevronDown, ChevronUp, Shirt } from 'lucide-react-native';
import { getPlayersByTeamId, deletePlayer, getTeamById, Player } from '@/utils/storage';


export default function PlayerManagementScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const teamId = params.teamId as string;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('All Positions');
  const [showPositionFilter, setShowPositionFilter] = useState(false);
  const [sortBy, setSortBy] = useState('Name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [teamName, setTeamName] = useState('');
  const [expandedPlayers, setExpandedPlayers] = useState<Record<string, boolean>>({});

  const loadPlayers = async () => {
    try {
      setIsLoading(true);
      const teamData = await getTeamById(teamId);
      if (teamData) {
        setTeamName(teamData.name);
      }

      const playerData = await getPlayersByTeamId(teamId);
      setPlayers(playerData);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading players:', error);
      setIsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadPlayers();
      return () => {};
    }, [teamId])
  );

  const positions = ['All Positions', 'Goalkeeper', 'Defender', 'Midfielder', 'Forward'];

  const sortOptions = ['Name', 'Jersey Number', 'Position'];

  const filteredPlayers = players.filter(player => {
    const matchesSearch =
      `${player.firstName} ${player.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.jerseyNumber.toString().includes(searchQuery);

    const matchesPosition =
      selectedPosition === 'All Positions' ||
      player.position === selectedPosition;

    return matchesSearch && matchesPosition;
  }).sort((a, b) => {
    if (sortBy === 'Name') {
      const nameA = `${a.firstName} ${a.lastName}`;
      const nameB = `${b.firstName} ${b.lastName}`;
      return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    } else if (sortBy === 'Jersey Number') {
      return sortOrder === 'asc' ? a.jerseyNumber - b.jerseyNumber : b.jerseyNumber - a.jerseyNumber;
    } else if (sortBy === 'Position') {
      return sortOrder === 'asc' ? a.position.localeCompare(b.position) : b.position.localeCompare(a.position);
    }
    return 0;
  });

  const handleAddPlayer = () => {
    router.push(`/player-registration?teamId=${teamId}`);
  };

  const handleEditPlayer = (playerId: string) => {
    router.push(`/player-edit?id=${playerId}`);
  };

  const handleDeletePlayer = async (playerId: string) => {
    Alert.alert(
      'Delete Player',
      'Are you sure you want to delete this player?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePlayer(playerId);
              loadPlayers(); // Refresh the player list
              Alert.alert('Success', 'Player deleted successfully');
            } catch (error) {
              console.error('Error deleting player:', error);
              Alert.alert('Error', 'Failed to delete player');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const togglePlayerDetails = (playerId: string) => {
    if (expandedPlayers[playerId]) {
      setExpandedPlayers({ ...expandedPlayers, [playerId]: false });
    } else {
      setExpandedPlayers({ ...expandedPlayers, [playerId]: true });
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.neutral[800]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{teamName ? `${teamName} Players` : 'Manage Players'}</Text>
        <TouchableOpacity onPress={handleAddPlayer}>
          <Plus size={24} color={Colors.primary[600]} />
        </TouchableOpacity>
      </View>

      <View style={styles.filtersContainer}>
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.neutral[400]} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search players..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.neutral[400]}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <X size={18} color={Colors.neutral[400]} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filterActions}>
          <TouchableOpacity style={styles.filterButton} onPress={() => setShowPositionFilter(!showPositionFilter)}>
            <Text style={styles.filterButtonText}>{selectedPosition}</Text>
            <Filter size={16} color={Colors.neutral[600]} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.sortButton} onPress={() => setShowSortOptions(!showSortOptions)}>
            <Text style={styles.sortButtonText}>Sort: {sortBy}</Text>
            {sortOrder === 'asc' ? (
              <ChevronUp size={16} color={Colors.neutral[600]} />
            ) : (
              <ChevronDown size={16} color={Colors.neutral[600]} />
            )}
          </TouchableOpacity>
        </View>

        {showPositionFilter && (
          <View style={styles.filterDropdown}>
            {positions.map((position) => (
              <TouchableOpacity
                key={position}
                style={[
                  styles.filterOption,
                  selectedPosition === position && styles.selectedFilterOption,
                ]}
                onPress={() => {
                  setSelectedPosition(position);
                  setShowPositionFilter(false);
                }}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    selectedPosition === position && styles.selectedFilterOptionText,
                  ]}
                >
                  {position}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {showSortOptions && (
          <View style={styles.sortDropdown}>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.sortOption,
                  sortBy === option && styles.selectedSortOption,
                ]}
                onPress={() => {
                  if (sortBy === option) {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortBy(option);
                    setSortOrder('asc');
                  }
                  setShowSortOptions(false);
                }}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    sortBy === option && styles.selectedSortOptionText,
                  ]}
                >
                  {option}
                </Text>
                {sortBy === option && (
                  sortOrder === 'asc' ? (
                    <ChevronUp size={16} color={sortBy === option ? Colors.primary[600] : Colors.neutral[600]} />
                  ) : (
                    <ChevronDown size={16} color={sortBy === option ? Colors.primary[600] : Colors.neutral[600]} />
                  )
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary[500]} />
            <Text style={styles.loadingText}>Loading players...</Text>
          </View>
        ) : filteredPlayers.length === 0 ? (
          <EmptyState
            title="No players found"
            message="Try adjusting your search or filters"
            icon={<Users size={48} color={Colors.neutral[300]} />}
            style={styles.emptyState}
          />
        ) : (
          filteredPlayers.map((player) => (
            <Card key={player.id} style={styles.playerCard}>
              <TouchableOpacity
                style={styles.playerHeader}
                onPress={() => togglePlayerDetails(player.id)}
                activeOpacity={0.7}
              >
                <View style={styles.playerBasicInfo}>
                  <View style={styles.jerseyNumberContainer}>
                    <Text style={styles.jerseyNumber}>{player.jerseyNumber}</Text>
                  </View>

                  {player.photoUrl ? (
                    <Image source={{ uri: player.photoUrl }} style={styles.playerPhoto} />
                  ) : (
                    <View style={styles.playerPhotoPlaceholder}>
                      <Shirt size={24} color={Colors.neutral[400]} />
                    </View>
                  )}

                  <View style={styles.playerNameContainer}>
                    <Text style={styles.playerName}>{player.firstName} {player.lastName}</Text>
                    <Text style={styles.playerPosition}>{player.position}</Text>
                  </View>
                </View>

                <View style={styles.playerActions}>
                  <TouchableOpacity style={styles.actionButton} onPress={() => handleEditPlayer(player.id)}>
                    <Edit size={20} color={Colors.primary[600]} />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionButton} onPress={() => handleDeletePlayer(player.id)}>
                    <Trash2 size={20} color={Colors.error[600]} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>

              {expandedPlayers[player.id] && (
                <View style={styles.playerDetails}>
                  <View style={styles.detailsRow}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Date of Birth</Text>
                      <Text style={styles.detailValue}>{player.dateOfBirth}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Nationality</Text>
                      <Text style={styles.detailValue}>{player.nationality}</Text>
                    </View>
                  </View>

                  <View style={styles.detailsRow}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Height</Text>
                      <Text style={styles.detailValue}>{player.height} cm</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Weight</Text>
                      <Text style={styles.detailValue}>{player.weight} kg</Text>
                    </View>
                  </View>

                  <View style={styles.detailsRow}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Email</Text>
                      <Text style={styles.detailValue}>{player.email}</Text>
                    </View>
                  </View>

                  <View style={styles.detailsRow}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Phone</Text>
                      <Text style={styles.detailValue}>{player.phone}</Text>
                    </View>
                  </View>

                  <View style={styles.statsContainer}>
                    <Text style={styles.statsTitle}>Player Information</Text>
                    <View style={styles.statsRow}>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{player.jerseyNumber}</Text>
                        <Text style={styles.statLabel}>Jersey</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{player.position.charAt(0)}</Text>
                        <Text style={styles.statLabel}>Position</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{player.nationality.substring(0, 3)}</Text>
                        <Text style={styles.statLabel}>Nationality</Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </Card>
          ))
        )}
      </ScrollView>

      <Button
        title="Add New Player"
        style={styles.fabButton}
        textStyle={styles.fabButtonText}
        onPress={handleAddPlayer}
        icon={<Plus size={20} color="white" style={{ marginRight: 8 }} />}
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
  filtersContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[100],
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.neutral[900],
  },
  clearButton: {
    padding: 8,
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.neutral[100],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flex: 1,
    marginRight: 8,
  },
  filterButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.neutral[800],
    marginRight: 8,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.neutral[100],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flex: 1,
    marginLeft: 8,
  },
  sortButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.neutral[800],
    marginRight: 8,
  },
  filterDropdown: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: 8,
    marginTop: 8,
    zIndex: 10,
  },
  filterOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  selectedFilterOption: {
    backgroundColor: Colors.primary[50],
  },
  filterOptionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.neutral[800],
  },
  selectedFilterOptionText: {
    fontFamily: 'Inter-Medium',
    color: Colors.primary[600],
  },
  sortDropdown: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: 8,
    marginTop: 8,
    zIndex: 10,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  selectedSortOption: {
    backgroundColor: Colors.primary[50],
  },
  sortOptionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.neutral[800],
  },
  selectedSortOptionText: {
    fontFamily: 'Inter-Medium',
    color: Colors.primary[600],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  playerCard: {
    marginBottom: 12,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playerBasicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  jerseyNumberContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  jerseyNumber: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: 'white',
  },
  playerPhoto: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  playerPhotoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  playerNameContainer: {
    flex: 1,
  },
  playerName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.neutral[900],
  },
  playerPosition: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.neutral[600],
  },
  playerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  playerDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
  detailsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.neutral[600],
  },
  detailValue: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.neutral[900],
  },
  statsContainer: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
  statsTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.neutral[900],
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: Colors.primary[600],
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.neutral[600],
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
    color: 'white',
    fontFamily: 'Inter-SemiBold',
  },
});
