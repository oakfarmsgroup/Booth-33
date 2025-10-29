import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function AdminContentScreen() {
  const [filter, setFilter] = useState('needs_review'); // 'needs_review', 'flagged', 'removed', 'all'

  const [posts, setPosts] = useState([
    {
      id: 1,
      user: 'DJ Mike Soundz',
      avatar: require('../assets/images/Artist.png'),
      timestamp: '2 hours ago',
      caption: 'Just dropped my new track! Let me know what you think 🔥🎵',
      audioFile: 'Final_Mix_v2.mp3',
      likes: 234,
      comments: 45,
      status: 'active',
      flagged: false,
      flagReason: null,
    },
    {
      id: 2,
      user: 'Sarah J Podcast',
      avatar: require('../assets/images/Artist_Locs.png'),
      timestamp: '5 hours ago',
      caption: 'New episode out now! Interview with an amazing artist 🎙️',
      audioFile: 'Episode_42.mp3',
      likes: 189,
      comments: 34,
      status: 'active',
      flagged: false,
      flagReason: null,
    },
    {
      id: 3,
      user: 'Anonymous User',
      avatar: require('../assets/images/Artist.png'),
      timestamp: '1 day ago',
      caption: 'This is inappropriate content that should be removed...',
      audioFile: 'spam_content.mp3',
      likes: 2,
      comments: 0,
      status: 'active',
      flagged: true,
      flagReason: 'Inappropriate content reported by 3 users',
    },
    {
      id: 4,
      user: 'Beats Producer',
      avatar: require('../assets/images/Artist.png'),
      timestamp: '3 days ago',
      caption: 'Check out my latest beat! Available for purchase 💰',
      audioFile: 'beat_pack_1.mp3',
      likes: 156,
      comments: 23,
      status: 'removed',
      flagged: false,
      flagReason: null,
    },
  ]);

  const handleRemovePost = (post) => {
    Alert.alert(
      'Remove Post',
      `Are you sure you want to remove this post by ${post.user}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setPosts(posts.map(p => 
              p.id === post.id ? { ...p, status: 'removed' } : p
            ));
            Alert.alert('Success', 'Post removed. User will be notified.');
          },
        },
      ]
    );
  };

  const handleRestorePost = (post) => {
    Alert.alert(
      'Restore Post',
      `Restore this post by ${post.user}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          onPress: () => {
            setPosts(posts.map(p => 
              p.id === post.id ? { ...p, status: 'active', flagged: false } : p
            ));
            Alert.alert('Success', 'Post restored.');
          },
        },
      ]
    );
  };

  const handleClearFlag = (post) => {
    Alert.alert(
      'Clear Flag',
      `Mark this post as safe?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Flag',
          onPress: () => {
            setPosts(posts.map(p => 
              p.id === post.id ? { ...p, flagged: false, flagReason: null } : p
            ));
            Alert.alert('Success', 'Flag cleared. Post is safe.');
          },
        },
      ]
    );
  };

  const filteredPosts = posts.filter(p => {
    if (filter === 'needs_review') {
      // Only show flagged or removed posts (posts that need attention)
      return p.flagged || p.status === 'removed';
    }
    if (filter === 'flagged') return p.flagged;
    if (filter === 'removed') return p.status === 'removed';
    if (filter === 'all') return true;
    return true;
  });

  const getFilterCount = (filterType) => {
    if (filterType === 'needs_review') {
      return posts.filter(p => p.flagged || p.status === 'removed').length;
    }
    if (filterType === 'all') return posts.length;
    if (filterType === 'flagged') return posts.filter(p => p.flagged).length;
    if (filterType === 'removed') return posts.filter(p => p.status === 'removed').length;
    return 0;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F0F0F', '#1A0F2E', '#0F0F0F']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Content</Text>
            <Text style={styles.headerSubtitle}>Moderation Dashboard</Text>
          </View>
          <View style={styles.alertBadge}>
            <Text style={styles.alertIcon}>⚠️</Text>
            <Text style={styles.alertText}>{getFilterCount('flagged')} Flagged</Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContainer}
        >
          <TouchableOpacity 
            style={[styles.filterTab, filter === 'needs_review' && styles.filterTabActive]}
            onPress={() => setFilter('needs_review')}
          >
            <Text style={[styles.filterText, filter === 'needs_review' && styles.filterTextActive]}>
              Needs Review ({getFilterCount('needs_review')})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterTab, filter === 'flagged' && styles.filterTabActive]}
            onPress={() => setFilter('flagged')}
          >
            <Text style={[styles.filterText, filter === 'flagged' && styles.filterTextActive]}>
              Flagged ({getFilterCount('flagged')})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterTab, filter === 'removed' && styles.filterTabActive]}
            onPress={() => setFilter('removed')}
          >
            <Text style={[styles.filterText, filter === 'removed' && styles.filterTextActive]}>
              Removed ({getFilterCount('removed')})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
              All Posts ({getFilterCount('all')})
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Posts Feed */}
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {filteredPosts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>✅</Text>
              <Text style={styles.emptyText}>
                {filter === 'needs_review' ? 'No posts need review!' : `No ${filter} posts`}
              </Text>
              <Text style={styles.emptySubtext}>
                {filter === 'needs_review' ? 'All posts are safe and approved' : 'Check back later'}
              </Text>
            </View>
          ) : (
            filteredPosts.map((post) => (
              <View key={post.id} style={[
                styles.postCard,
                post.flagged && styles.postCardFlagged,
                post.status === 'removed' && styles.postCardRemoved
              ]}>
                {/* Flag Badge */}
                {post.flagged && post.status !== 'removed' && (
                  <View style={styles.flagBanner}>
                    <Text style={styles.flagIcon}>⚠️</Text>
                    <Text style={styles.flagText}>{post.flagReason}</Text>
                  </View>
                )}

                {/* Removed Badge */}
                {post.status === 'removed' && (
                  <View style={styles.removedBanner}>
                    <Text style={styles.removedIcon}>🚫</Text>
                    <Text style={styles.removedText}>Post Removed</Text>
                  </View>
                )}

                {/* Post Header */}
                <View style={styles.postHeader}>
                  <View style={styles.userInfo}>
                    <Image
                      source={post.avatar}
                      style={styles.avatar}
                      resizeMode="cover"
                    />
                    <View>
                      <Text style={styles.username}>{post.user}</Text>
                      <Text style={styles.timestamp}>{post.timestamp}</Text>
                    </View>
                  </View>
                </View>

                {/* Post Content */}
                <Text style={styles.caption}>{post.caption}</Text>

                {/* Audio File */}
                <View style={styles.audioContainer}>
                  <Text style={styles.audioIcon}>🎵</Text>
                  <View style={styles.audioInfo}>
                    <Text style={styles.audioFileName}>{post.audioFile}</Text>
                  </View>
                </View>

                {/* Engagement Stats */}
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statIcon}>❤️</Text>
                    <Text style={styles.statText}>{post.likes}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statIcon}>💬</Text>
                    <Text style={styles.statText}>{post.comments}</Text>
                  </View>
                </View>

                {/* Admin Actions */}
                <View style={styles.actionsContainer}>
                  {post.status === 'removed' ? (
                    // Restore button for removed posts
                    <TouchableOpacity 
                      style={styles.restoreButton}
                      onPress={() => handleRestorePost(post)}
                    >
                      <LinearGradient
                        colors={['#10B981', '#059669']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.restoreGradient}
                      >
                        <Text style={styles.restoreButtonText}>Restore Post</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ) : (
                    <>
                      {/* Clear flag if flagged */}
                      {post.flagged && (
                        <TouchableOpacity 
                          style={styles.clearButton}
                          onPress={() => handleClearFlag(post)}
                        >
                          <Text style={styles.clearButtonText}>Clear Flag</Text>
                        </TouchableOpacity>
                      )}
                      
                      {/* Remove button */}
                      <TouchableOpacity 
                        style={[styles.removeButton, post.flagged && { flex: 1 }]}
                        onPress={() => handleRemovePost(post)}
                      >
                        <Text style={styles.removeButtonText}>Remove Post</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            ))
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#F59E0B',
    marginTop: 4,
  },
  alertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  alertIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  alertText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
  filterScroll: {
    marginBottom: 12,
  },
  filterContainer: {
    paddingHorizontal: 20,
    gap: 6,
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    marginRight: 6,
  },
  filterTabActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  filterTextActive: {
    color: '#F59E0B',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#444',
    marginTop: 8,
  },
  postCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  postCardFlagged: {
    borderColor: 'rgba(239, 68, 68, 0.5)',
    borderWidth: 2,
  },
  postCardRemoved: {
    opacity: 0.6,
    borderColor: 'rgba(107, 114, 128, 0.5)',
  },
  flagBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  flagIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  flagText: {
    flex: 1,
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
  },
  removedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  removedIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  removedText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '700',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  username: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  caption: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
    marginBottom: 12,
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  audioIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  audioInfo: {
    flex: 1,
  },
  audioFileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  statText: {
    fontSize: 14,
    color: '#666',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  clearButton: {
    flex: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
  },
  removeButton: {
    flex: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EF4444',
  },
  restoreButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  restoreGradient: {
    padding: 14,
    alignItems: 'center',
  },
  restoreButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});