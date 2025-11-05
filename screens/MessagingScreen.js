import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, TextInput, RefreshControl, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMessaging } from '../contexts/MessagingContext';

export default function MessagingScreen({ onOpenChat }) {
  const { conversations, getRecentConversations, deleteConversation, getTotalUnreadCount } = useMessaging();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const formatTime = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffMs = now - messageDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleDeleteConversation = (conv) => {
    Alert.alert(
      'Delete Conversation',
      `Delete conversation with ${conv.userName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteConversation(conv.id),
        },
      ]
    );
  };

  const filteredConversations = getRecentConversations().filter((conv) =>
    conv.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <LinearGradient colors={['#0F0F0F', '#1A0F2E', '#0F0F0F']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Messages</Text>
          {getTotalUnreadCount() > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{getTotalUnreadCount()}</Text>
            </View>
          )}
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Conversations List */}
        <ScrollView
          style={styles.conversationsList}
          contentContainerStyle={styles.conversationsListContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8B5CF6" />}
        >
          {filteredConversations.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>💬</Text>
              <Text style={styles.emptyStateTitle}>
                {searchQuery ? 'No conversations found' : 'No messages yet'}
              </Text>
              <Text style={styles.emptyStateText}>
                {searchQuery
                  ? 'Try searching for a different name'
                  : 'Start a conversation by messaging other artists or the studio admin'}
              </Text>
            </View>
          ) : (
            filteredConversations.map((conv) => (
              <TouchableOpacity
                key={conv.id}
                style={styles.conversationCard}
                onPress={() => onOpenChat && onOpenChat(conv)}
                onLongPress={() => handleDeleteConversation(conv)}
              >
                {/* Avatar */}
                <View style={styles.avatarContainer}>
                  <Image source={conv.userAvatar} style={styles.avatar} />
                  {conv.unreadCount > 0 && <View style={styles.onlineDot} />}
                </View>

                {/* Message Info */}
                <View style={styles.messageInfo}>
                  <View style={styles.messageHeader}>
                    <Text style={styles.userName}>{conv.userName}</Text>
                    <Text style={styles.messageTime}>{formatTime(conv.lastMessageTime)}</Text>
                  </View>
                  <View style={styles.messagePreview}>
                    <Text
                      style={[styles.lastMessage, conv.unreadCount > 0 && styles.lastMessageUnread]}
                      numberOfLines={1}
                    >
                      {conv.lastMessage}
                    </Text>
                    {conv.unreadCount > 0 && (
                      <View style={styles.unreadCountBadge}>
                        <Text style={styles.unreadCountText}>{conv.unreadCount}</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Arrow */}
                <Text style={styles.arrowIcon}>›</Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        {/* Floating Action Button */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => {
            Alert.alert('New Message', 'Search for users to start a conversation (Coming Soon)');
          }}
        >
          <LinearGradient colors={['#8B5CF6', '#EC4899']} style={styles.fabGradient}>
            <Text style={styles.fabIcon}>✏️</Text>
          </LinearGradient>
        </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  unreadBadge: {
    backgroundColor: '#EC4899',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    paddingHorizontal: 8,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
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
  conversationsList: {
    flex: 1,
  },
  conversationsListContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.5)',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#0F0F0F',
  },
  messageInfo: {
    flex: 1,
    marginLeft: 16,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  messageTime: {
    fontSize: 12,
    color: '#666',
  },
  messagePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    flex: 1,
    fontSize: 15,
    color: '#888',
  },
  lastMessageUnread: {
    color: '#CCCCCC',
    fontWeight: '600',
  },
  unreadCountBadge: {
    backgroundColor: '#EC4899',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    paddingHorizontal: 6,
  },
  unreadCountText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  arrowIcon: {
    fontSize: 28,
    color: '#444',
    marginLeft: 8,
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
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  fabGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: {
    fontSize: 24,
  },
});
