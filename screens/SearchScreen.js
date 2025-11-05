import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // all, users, posts, sessions, events
  const [recentSearches, setRecentSearches] = useState([
    'Mike Soundz',
    'Recording session',
    'Open Mic Night',
    'Beat production',
  ]);

  // Mock data for search results
  const mockUsers = [
    { id: '1', name: 'Mike Soundz', username: '@mikesoundz', avatar: require('../assets/images/Artist.png'), followers: '2.4K', verified: true },
    { id: '2', name: 'Sarah J', username: '@sarahj', avatar: require('../assets/images/Artist.png'), followers: '1.8K', verified: false },
    { id: '3', name: 'Jay Beats', username: '@jaybeats', avatar: require('../assets/images/Artist.png'), followers: '987', verified: false },
  ];

  const mockPosts = [
    { id: '1', user: 'Mike Soundz', title: 'New beat drop 🔥', likes: 342, timestamp: '2h ago' },
    { id: '2', user: 'Sarah J', title: 'Vocals for hire', likes: 189, timestamp: '5h ago' },
  ];

  const mockSessions = [
    { id: '1', name: 'Music Recording Session', type: 'music', price: '$75/hr', rating: 4.9 },
    { id: '2', name: 'Podcast Recording', type: 'podcast', price: '$60/hr', rating: 4.8 },
  ];

  const mockEvents = [
    { id: '1', name: 'Open Mic Night', date: 'Nov 15', attendees: 47 },
    { id: '2', name: 'Beat Making Workshop', date: 'Nov 20', attendees: 23 },
  ];

  const filters = [
    { key: 'all', label: 'All', icon: '🔍' },
    { key: 'users', label: 'Users', icon: '👥' },
    { key: 'posts', label: 'Posts', icon: '📝' },
    { key: 'sessions', label: 'Sessions', icon: '🎵' },
    { key: 'events', label: 'Events', icon: '🎉' },
  ];

  const addToRecentSearches = (query) => {
    if (!query.trim() || recentSearches.includes(query)) return;
    setRecentSearches([query, ...recentSearches.slice(0, 9)]);
  };

  const removeRecentSearch = (query) => {
    setRecentSearches(recentSearches.filter(s => s !== query));
  };

  const clearAllRecentSearches = () => {
    setRecentSearches([]);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      addToRecentSearches(searchQuery.trim());
    }
  };

  const getFilteredResults = () => {
    if (!searchQuery.trim()) return null;

    const query = searchQuery.toLowerCase();
    const results = {
      users: mockUsers.filter(u => u.name.toLowerCase().includes(query) || u.username.toLowerCase().includes(query)),
      posts: mockPosts.filter(p => p.title.toLowerCase().includes(query) || p.user.toLowerCase().includes(query)),
      sessions: mockSessions.filter(s => s.name.toLowerCase().includes(query)),
      events: mockEvents.filter(e => e.name.toLowerCase().includes(query)),
    };

    if (activeFilter === 'all') {
      return results;
    } else {
      return { [activeFilter]: results[activeFilter] };
    }
  };

  const filteredResults = getFilteredResults();
  const hasResults = filteredResults && Object.values(filteredResults).some(arr => arr.length > 0);

  return (
    <LinearGradient colors={['#0F0F0F', '#1A0F2E', '#0F0F0F']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Search</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search users, posts, sessions..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[styles.filterChip, activeFilter === filter.key && styles.filterChipActive]}
              onPress={() => setActiveFilter(filter.key)}
            >
              <Text style={styles.filterIcon}>{filter.icon}</Text>
              <Text style={[styles.filterLabel, activeFilter === filter.key && styles.filterLabelActive]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {!searchQuery.trim() ? (
            /* Recent Searches */
            <View style={styles.recentSearches}>
              <View style={styles.recentHeader}>
                <Text style={styles.recentTitle}>Recent Searches</Text>
                {recentSearches.length > 0 && (
                  <TouchableOpacity onPress={clearAllRecentSearches}>
                    <Text style={styles.clearAllText}>Clear All</Text>
                  </TouchableOpacity>
                )}
              </View>

              {recentSearches.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateIcon}>🔍</Text>
                  <Text style={styles.emptyStateText}>No recent searches</Text>
                </View>
              ) : (
                recentSearches.map((search, index) => (
                  <View key={index} style={styles.recentItem}>
                    <TouchableOpacity
                      style={styles.recentItemLeft}
                      onPress={() => setSearchQuery(search)}
                    >
                      <Text style={styles.recentIcon}>🕒</Text>
                      <Text style={styles.recentText}>{search}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeRecentSearch(search)} style={styles.removeButton}>
                      <Text style={styles.removeButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}

              {/* Trending */}
              <Text style={styles.sectionTitle}>🔥 Trending</Text>
              <TouchableOpacity style={styles.trendingItem}>
                <Text style={styles.trendingText}>#OpenMicNight</Text>
                <Text style={styles.trendingCount}>234 posts</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.trendingItem}>
                <Text style={styles.trendingText}>#BeatProduction</Text>
                <Text style={styles.trendingCount}>189 posts</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.trendingItem}>
                <Text style={styles.trendingText}>#MusicCollab</Text>
                <Text style={styles.trendingCount}>156 posts</Text>
              </TouchableOpacity>
            </View>
          ) : !hasResults ? (
            /* No Results */
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>😔</Text>
              <Text style={styles.emptyStateTitle}>No results found</Text>
              <Text style={styles.emptyStateText}>
                Try searching for something else or check your spelling
              </Text>
            </View>
          ) : (
            /* Search Results */
            <View style={styles.results}>
              {/* Users */}
              {filteredResults.users && filteredResults.users.length > 0 && (
                <View style={styles.resultSection}>
                  <Text style={styles.resultSectionTitle}>👥 Users</Text>
                  {filteredResults.users.map((user) => (
                    <TouchableOpacity key={user.id} style={styles.userCard}>
                      <Image source={user.avatar} style={styles.userAvatar} />
                      <View style={styles.userInfo}>
                        <View style={styles.userNameRow}>
                          <Text style={styles.userName}>{user.name}</Text>
                          {user.verified && <Text style={styles.verifiedBadge}>✓</Text>}
                        </View>
                        <Text style={styles.userUsername}>{user.username}</Text>
                        <Text style={styles.userFollowers}>{user.followers} followers</Text>
                      </View>
                      <TouchableOpacity style={styles.followButton}>
                        <Text style={styles.followButtonText}>Follow</Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Posts */}
              {filteredResults.posts && filteredResults.posts.length > 0 && (
                <View style={styles.resultSection}>
                  <Text style={styles.resultSectionTitle}>📝 Posts</Text>
                  {filteredResults.posts.map((post) => (
                    <TouchableOpacity key={post.id} style={styles.postCard}>
                      <Text style={styles.postUser}>{post.user}</Text>
                      <Text style={styles.postTitle}>{post.title}</Text>
                      <View style={styles.postFooter}>
                        <Text style={styles.postLikes}>❤️ {post.likes}</Text>
                        <Text style={styles.postTime}>{post.timestamp}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Sessions */}
              {filteredResults.sessions && filteredResults.sessions.length > 0 && (
                <View style={styles.resultSection}>
                  <Text style={styles.resultSectionTitle}>🎵 Sessions</Text>
                  {filteredResults.sessions.map((session) => (
                    <TouchableOpacity key={session.id} style={styles.sessionCard}>
                      <Text style={styles.sessionIcon}>{session.type === 'music' ? '🎵' : '🎙️'}</Text>
                      <View style={styles.sessionInfo}>
                        <Text style={styles.sessionName}>{session.name}</Text>
                        <View style={styles.sessionDetails}>
                          <Text style={styles.sessionPrice}>{session.price}</Text>
                          <Text style={styles.sessionRating}>⭐ {session.rating}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Events */}
              {filteredResults.events && filteredResults.events.length > 0 && (
                <View style={styles.resultSection}>
                  <Text style={styles.resultSectionTitle}>🎉 Events</Text>
                  {filteredResults.events.map((event) => (
                    <TouchableOpacity key={event.id} style={styles.eventCard}>
                      <Text style={styles.eventName}>{event.name}</Text>
                      <View style={styles.eventFooter}>
                        <Text style={styles.eventDate}>📅 {event.date}</Text>
                        <Text style={styles.eventAttendees}>👥 {event.attendees} attending</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    color: '#666',
    fontSize: 18,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filtersContent: {
    paddingHorizontal: 20,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderColor: '#8B5CF6',
  },
  filterIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
  },
  filterLabelActive: {
    color: '#8B5CF6',
  },
  content: {
    flex: 1,
  },
  recentSearches: {
    paddingHorizontal: 20,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  clearAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 92, 246, 0.1)',
  },
  recentItemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  recentText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  removeButton: {
    padding: 8,
  },
  removeButtonText: {
    fontSize: 16,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 24,
    marginBottom: 12,
  },
  trendingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 92, 246, 0.1)',
  },
  trendingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  trendingCount: {
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
  },
  results: {
    paddingHorizontal: 20,
  },
  resultSection: {
    marginBottom: 24,
  },
  resultSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.5)',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  verifiedBadge: {
    fontSize: 14,
    color: '#8B5CF6',
    marginLeft: 4,
  },
  userUsername: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  userFollowers: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  followButton: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderWidth: 1,
    borderColor: '#8B5CF6',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  postCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  postUser: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EC4899',
    marginBottom: 8,
  },
  postTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  postLikes: {
    fontSize: 14,
    color: '#888',
  },
  postTime: {
    fontSize: 13,
    color: '#666',
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  sessionIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  sessionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sessionPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  sessionRating: {
    fontSize: 14,
    color: '#F59E0B',
  },
  eventCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  eventName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eventDate: {
    fontSize: 14,
    color: '#888',
  },
  eventAttendees: {
    fontSize: 14,
    color: '#666',
  },
});
