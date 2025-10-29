import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Modal, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TIERS, TIER_ORDER, getTierProgress, determineTier } from '../data/tierSystem';

export default function AdminUsersScreen() {
  // Mock users with minimal stats
  const [query, setQuery] = useState('');
  const users = [
    { id: 1, name: 'Alex Rivera', username: 'alexrivera', stats: { sessionsBooked: 12, referrals: 1, postsCreated: 20, daysActive: 40, totalSpent: 1400 } },
    { id: 2, name: 'Mike Soundz', username: 'mikesoundz', stats: { sessionsBooked: 3, referrals: 0, postsCreated: 5, daysActive: 9, totalSpent: 220 } },
    { id: 3, name: 'Sarah J', username: 'sarahj', stats: { sessionsBooked: 28, referrals: 4, postsCreated: 44, daysActive: 90, totalSpent: 4200 } },
    { id: 4, name: 'Producer Pro', username: 'producerpro', stats: { sessionsBooked: 8, referrals: 3, postsCreated: 18, daysActive: 30, totalSpent: 980 } },
  ];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(u => u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q));
  }, [query]);

  const distribution = useMemo(() => {
    const counts = { SILVER: 0, GOLD: 0, PLATINUM: 0, DIAMOND: 0 };
    users.forEach(u => {
      const t = determineTier(u.stats).key;
      counts[t]++;
    });
    return counts;
  }, []);

  const totalUsers = users.length;
  const [selectedUser, setSelectedUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F0F0F', '#1A0F2E', '#0F0F0F']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Users</Text>
            <Text style={styles.headerSubtitle}>Tier Analytics</Text>
          </View>
          <View style={styles.searchBox}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by username"
              placeholderTextColor="#666"
              value={query}
              onChangeText={setQuery}
            />
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          {/* Tier Distribution */}
          <View style={styles.section}>
            <Text style={styles.cardTitle}>Tier Distribution</Text>
            {TIER_ORDER.map((key) => {
              const count = distribution[key] || 0;
              const pct = totalUsers === 0 ? 0 : Math.round((count / totalUsers) * 100);
              const t = TIERS[key];
              return (
                <View key={key} style={styles.tierRow}>
                  <Text style={styles.tierRowLabel}>{t.emoji} {t.name}</Text>
                  <View style={styles.tierBar}> 
                    <View style={[styles.tierBarFill, { width: `${pct}%`, backgroundColor: 'rgba(245, 158, 11, 0.8)' }]} />
                  </View>
                  <Text style={styles.tierRowValue}>{count} users</Text>
                </View>
              );
            })}
          </View>

          {/* User List */}
          <View style={styles.section}>
            <Text style={styles.cardTitle}>Users</Text>
            {filtered.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🫥</Text>
                <Text style={styles.emptyText}>No users match your search</Text>
              </View>
            )}
            {filtered.map((u) => {
              const cur = determineTier(u.stats);
              const nextIdx = TIER_ORDER.indexOf(cur.key) + 1;
              const next = TIER_ORDER[nextIdx] ? { key: TIER_ORDER[nextIdx], ...TIERS[TIER_ORDER[nextIdx]] } : null;
              const progress = next ? getTierProgress(u.stats, next.key).percent : 100;
              return (
                <TouchableOpacity key={u.id} style={styles.userTierCard} activeOpacity={0.8} onPress={() => setSelectedUser(u)}>
                  <View style={styles.userInfo}>
                    <View style={styles.avatarCircle}><Text style={styles.avatarLetter}>{u.name[0]}</Text></View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.userName}>{u.name}</Text>
                      <Text style={styles.userHandle}>@{u.username}</Text>
                    </View>
                    <View style={[styles.userTierBadge, { borderWidth: 1, borderColor: TIERS[cur.key].color }]}>
                      <Text style={styles.userTierText}>{cur.emoji} {cur.name}</Text>
                    </View>
                  </View>
                  <View style={styles.userProgressRow}>
                    <Text style={styles.userProgressLabel}>{next ? `Progress to ${next.name}` : 'Top tier'}</Text>
                    <Text style={styles.userProgressPct}>{progress}%</Text>
                  </View>
                  <View style={styles.userProgressBar}>
                    <View style={[styles.userProgressFill, { width: `${progress}%` }]} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
        <Modal visible={!!selectedUser} transparent animationType="fade" onRequestClose={() => setSelectedUser(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setSelectedUser(null)}><Text style={styles.modalClose}>Close</Text></TouchableOpacity>
                <Text style={styles.modalTitle}>User Tier Details</Text>
                <View style={{ width: 48 }} />
              </View>
              {selectedUser && (() => {
                const cur = determineTier(selectedUser.stats);
                const nextIdx = TIER_ORDER.indexOf(cur.key) + 1;
                const next = TIER_ORDER[nextIdx] ? { key: TIER_ORDER[nextIdx], ...TIERS[TIER_ORDER[nextIdx]] } : null;
                return (
                  <View>
                    <Text style={styles.detailUserName}>{selectedUser.name} (@{selectedUser.username})</Text>
                    <Text style={styles.detailTier}>{cur.emoji} {cur.name}</Text>
                    {next && (
                      <View style={{ marginTop: 12 }}>
                        <Text style={styles.detailLabel}>Progress to {next.name}</Text>
                        <View style={styles.userProgressBar}><View style={[styles.userProgressFill, { width: `${getTierProgress(selectedUser.stats, next.key).percent}%` }]} /></View>
                      </View>
                    )}
                  </View>
                );
              })()}
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F0F' },
  gradient: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 12, color: '#F59E0B' },
  searchBox: { width: 200 },
  searchInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#FFF',
    fontSize: 14,
  },

  section: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginBottom: 12 },

  tierRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  tierRowLabel: { width: 120, color: '#FFF', fontSize: 14 },
  tierBar: { flex: 1, height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 6, overflow: 'hidden', marginHorizontal: 8 },
  tierBarFill: { height: '100%', backgroundColor: '#F59E0B' },
  tierRowValue: { width: 80, textAlign: 'right', color: '#F59E0B', fontSize: 12 },

  userTierCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.25)', borderRadius: 12, padding: 12, marginBottom: 10 },
  userInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatarCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(245,158,11,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  avatarLetter: { color: '#F59E0B', fontWeight: '800' },
  userName: { color: '#FFF', fontWeight: '700' },
  userHandle: { color: '#888', fontSize: 12 },
  userTierBadge: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: 'rgba(245,158,11,0.2)', borderRadius: 8 },
  userTierText: { color: '#F59E0B', fontWeight: '700', fontSize: 12 },
  userProgressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  userProgressLabel: { color: '#888', fontSize: 12 },
  userProgressPct: { color: '#F59E0B', fontSize: 12, fontWeight: '700' },
  userProgressBar: { height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden', marginTop: 6 },
  userProgressFill: { height: '100%', backgroundColor: '#F59E0B' },
  emptyState: { alignItems: 'center', paddingVertical: 20 },
  emptyEmoji: { fontSize: 36, marginBottom: 8 },
  emptyText: { color: '#888' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1A1A1A', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16, borderTopWidth: 1, borderTopColor: 'rgba(245,158,11,0.3)' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(245,158,11,0.2)', paddingBottom: 8 },
  modalTitle: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  modalClose: { color: '#888', fontSize: 14 },
  detailUserName: { color: '#FFF', fontWeight: '700', marginBottom: 4 },
  detailTier: { color: '#F59E0B', fontWeight: '700' },
});
