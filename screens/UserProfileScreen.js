import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function UserProfileScreen({ userId, onBackPress, onMessagePress }) {
  const [refreshing, setRefreshing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts'); // posts, sessions, reviews

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Mock user data
  const user = {
    id: userId || 'user_1',
    name: 'Mike Soundz',
    username: '@mikesoundz',
    avatar: require('../assets/images/Artist.png'),
    bio: 'Professional music producer & audio engineer\n🎵 10+ years experience\n📍 Los Angeles, CA\n🏆 Platinum certified producer',
    verified: true,
    stats: {
      posts: 156,
      followers: 2400,
      following: 340,
      sessions: 89,
    },
    badges: ['🏆 Verified', '⭐ Pro', '🔥 Top Rated'],
    genres: ['Hip Hop', 'R&B', 'Pop', 'Electronic'],
    equipment: ['Pro Tools', 'Logic Pro', 'Neumann U87', 'SSL Console'],
    socialLinks: {
      instagram: '@mikesoundz',
      soundcloud: 'mikesoundz',
      spotify: 'Mike Soundz',
    },
  };

  // Mock posts
  const mockPosts = [
    { id: '1', title: 'New beat drop 🔥', likes: 342, comments: 23, thumbnail: require('../assets/images/Artist.png') },
    { id: '2', title: 'Studio vibes', likes: 289, comments: 18, thumbnail: require('../assets/images/Artist.png') },
    { id: '3', title: 'Mixing session', likes: 401, comments: 31, thumbnail: require('../assets/images/Artist.png') },
  ];

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'posts':
        return (
          <View style={styles.tabContent}>
            {mockPosts.map((post) => (
              <TouchableOpacity key={post.id} style={styles.postCard}>
                <Image source={post.thumbnail} style={styles.postThumbnail} />
                <View style={styles.postInfo}>
                  <Text style={styles.postTitle} numberOfLines={1}>{post.title}</Text>
                  <View style={styles.postStats}>
                    <Text style={styles.postStat}>❤️ {post.likes}</Text>
                    <Text style={styles.postStat}>💬 {post.comments}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        );
      case 'sessions':
        return (
          <View style={styles.tabContent}>
            <View style={styles.sessionCard}>
              <Text style={styles.sessionIcon}>🎵</Text>
              <View style={styles.sessionInfo}>
                <Text style={styles.sessionName}>Music Production</Text>
                <Text style={styles.sessionDetails}>$75/hr • 4.9 ⭐ (89 reviews)</Text>
              </View>
            </View>
            <View style={styles.sessionCard}>
              <Text style={styles.sessionIcon}>🎙️</Text>
              <View style={styles.sessionInfo}>
                <Text style={styles.sessionName}>Mixing & Mastering</Text>
                <Text style={styles.sessionDetails}>$100/hr • 5.0 ⭐ (56 reviews)</Text>
              </View>
            </View>
          </View>
        );
      case 'reviews':
        return (
          <View style={styles.tabContent}>
            <View style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewAuthor}>Sarah J</Text>
                <Text style={styles.reviewRating}>⭐⭐⭐⭐⭐</Text>
              </View>
              <Text style={styles.reviewText}>
                Amazing producer! Very professional and delivered exactly what I needed. Highly recommend!
              </Text>
              <Text style={styles.reviewDate}>2 weeks ago</Text>
            </View>
            <View style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewAuthor}>Jay Beats</Text>
                <Text style={styles.reviewRating}>⭐⭐⭐⭐⭐</Text>
              </View>
              <Text style={styles.reviewText}>
                Great collaboration experience. Mike really knows his stuff and brought creative ideas to the table.
              </Text>
              <Text style={styles.reviewDate}>1 month ago</Text>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <LinearGradient colors={['#0F0F0F', '#1A0F2E', '#0F0F0F']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity style={styles.moreButton}>
            <Text style={styles.moreButtonText}>⋯</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8B5CF6" />}
        >
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              <Image source={user.avatar} style={styles.avatar} />
              {user.verified && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedIcon}>✓</Text>
                </View>
              )}
            </View>

            {/* Name & Username */}
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.username}>{user.username}</Text>

            {/* Bio */}
            <Text style={styles.bio}>{user.bio}</Text>

            {/* Badges */}
            <View style={styles.badgesContainer}>
              {user.badges.map((badge, index) => (
                <View key={index} style={styles.badge}>
                  <Text style={styles.badgeText}>{badge}</Text>
                </View>
              ))}
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user.stats.posts}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user.stats.followers}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user.stats.following}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user.stats.sessions}</Text>
                <Text style={styles.statLabel}>Sessions</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.followButton]}
                onPress={handleFollow}
              >
                <LinearGradient
                  colors={isFollowing ? ['#444', '#333'] : ['#8B5CF6', '#EC4899']}
                  style={styles.actionButtonGradient}
                >
                  <Text style={styles.actionButtonText}>
                    {isFollowing ? 'Following' : 'Follow'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.messageButton]}
                onPress={onMessagePress}
              >
                <Text style={styles.messageButtonText}>💬 Message</Text>
              </TouchableOpacity>
            </View>

            {/* Genres */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎵 Genres</Text>
              <View style={styles.tagsContainer}>
                {user.genres.map((genre, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{genre}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Equipment */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎛️ Equipment</Text>
              <View style={styles.tagsContainer}>
                {user.equipment.map((item, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Social Links */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔗 Connect</Text>
              <View style={styles.socialLinks}>
                <TouchableOpacity style={styles.socialLink}>
                  <Text style={styles.socialLinkText}>📷 {user.socialLinks.instagram}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialLink}>
                  <Text style={styles.socialLinkText}>🎵 {user.socialLinks.soundcloud}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialLink}>
                  <Text style={styles.socialLinkText}>🎧 {user.socialLinks.spotify}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            {['posts', 'sessions', 'reviews'].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab Content */}
          {renderTabContent()}

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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 92, 246, 0.2)',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  moreButton: {
    padding: 8,
  },
  moreButtonText: {
    fontSize: 24,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  avatarContainer: {
    alignSelf: 'center',
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: 'rgba(139, 92, 246, 0.5)',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#0F0F0F',
  },
  verifiedIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  username: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  bio: {
    fontSize: 15,
    color: '#CCC',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  badgesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  badge: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.5)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#8B5CF6',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
  },
  actionsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    marginHorizontal: 4,
  },
  followButton: {
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  messageButton: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderWidth: 1,
    borderColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    margin: 4,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#CCC',
  },
  socialLinks: {
    gap: 8,
  },
  socialLink: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  socialLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(139, 92, 246, 0.2)',
    marginHorizontal: 20,
    marginTop: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 3,
    borderBottomColor: '#8B5CF6',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#8B5CF6',
  },
  tabContent: {
    padding: 20,
  },
  postCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  postThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  postInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  postStats: {
    flexDirection: 'row',
  },
  postStat: {
    fontSize: 14,
    color: '#888',
    marginRight: 16,
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    marginBottom: 4,
  },
  sessionDetails: {
    fontSize: 14,
    color: '#888',
  },
  reviewCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reviewAuthor: {
    fontSize: 15,
    fontWeight: '700',
    color: '#EC4899',
  },
  reviewRating: {
    fontSize: 14,
  },
  reviewText: {
    fontSize: 14,
    color: '#CCC',
    lineHeight: 20,
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: '#666',
  },
});
