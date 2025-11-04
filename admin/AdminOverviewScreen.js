import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useCredits } from '../contexts/CreditsContext';
import { usePayment } from '../contexts/PaymentContext';
import { useRewards } from '../contexts/RewardsContext';
import { TIERS } from '../data/tierSystem';

export default function AdminOverviewScreen() {
  const navigation = useNavigation();
  const { grantCredits } = useCredits();
  const { getRevenueStats, getPaymentHistory, processRefund } = usePayment();
  const { userRewards, milestones, referrals, rewardTiers } = useRewards();
  const [showGrantCreditsModal, setShowGrantCreditsModal] = useState(false);
  const [creditAmount, setCreditAmount] = useState('');
  const [creditReason, setCreditReason] = useState('');
  const [selectedUser, setSelectedUser] = useState('Current User'); // In real app, would select from list
  const [showPaymentTransactionsModal, setShowPaymentTransactionsModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [showRewardsKPIModal, setShowRewardsKPIModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [studioSettings, setStudioSettings] = useState({
    musicSessionPrice: 150,
    podcastSessionPrice: 150,
    sessionDuration: 2,
    cancellationPolicy: '24 hours',
    depositRequired: true,
    depositAmount: 50,
    maxAdvanceBooking: 60, // days
    notifications: {
      bookingRequests: true,
      cancellations: true,
      reviews: true,
    },
  });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [blockedSlots, setBlockedSlots] = useState([
    { id: 1, date: 'Oct 30, 2025', time: '10:00 AM', reason: 'Equipment maintenance' },
    { id: 2, date: 'Nov 1, 2025', time: '2:00 PM', reason: 'Staff meeting' },
  ]);
  const [studioHours, setStudioHours] = useState({
    monday: { open: '9:00 AM', close: '10:00 PM', closed: false },
    tuesday: { open: '9:00 AM', close: '10:00 PM', closed: false },
    wednesday: { open: '9:00 AM', close: '10:00 PM', closed: false },
    thursday: { open: '9:00 AM', close: '10:00 PM', closed: false },
    friday: { open: '9:00 AM', close: '10:00 PM', closed: false },
    saturday: { open: '10:00 AM', close: '8:00 PM', closed: false },
    sunday: { open: '12:00 PM', close: '6:00 PM', closed: false },
  });

  // Get real payment stats
  const revenueStats = getRevenueStats();

  // Calculate rewards KPIs
  const rewardsKPIs = {
    totalUsers: 1, // Mock - would come from backend
    activeReferralPrograms: referrals.length,
    totalCreditsDistributed: userRewards.lifetimeCreditsEarned,
    avgMilestonesPerUser: milestones.filter(m => m.completed).length,
    tierDistribution: {
      silver: 45,   // Percentage of users in each tier (mock data)
      gold: 30,
      platinum: 20,
      diamond: 5,
    },
    topReferrers: [
      { name: 'Current User', referrals: userRewards.successfulReferrals, credits: userRewards.successfulReferrals * 20 },
      { name: 'Alex Martinez', referrals: 5, credits: 100 },
      { name: 'Jordan Lee', referrals: 4, credits: 80 },
    ],
  };

  // Mock data (will come from backend later)
  const stats = {
    todayBookings: 5,
    weekBookings: 23,
    monthBookings: 87,
    todayRevenue: revenueStats.monthlyRevenue, // Using monthly revenue as mock for today
    weekRevenue: revenueStats.monthlyRevenue,
    monthRevenue: revenueStats.netRevenue,
    totalRevenue: revenueStats.totalRevenue,
    totalRefunded: revenueStats.totalRefunded,
    totalTransactions: revenueStats.totalTransactions,
    activeUsers: 142,
    completionRate: 94,
  };

  const recentBookings = [
    { id: 1, user: 'Mike Soundz', type: 'music', date: 'Today', time: '2:00 PM', status: 'pending' },
    { id: 2, user: 'Sarah J', type: 'podcast', date: 'Today', time: '4:00 PM', status: 'confirmed' },
    { id: 3, user: 'Jay Beats', type: 'music', date: 'Tomorrow', time: '10:00 AM', status: 'pending' },
    { id: 4, user: 'Lisa Chen', type: 'podcast', date: 'Tomorrow', time: '3:00 PM', status: 'confirmed' },
  ];

  const handleGrantCredits = () => {
    const amount = parseFloat(creditAmount);

    if (!creditAmount || isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid credit amount');
      return;
    }

    if (!creditReason.trim()) {
      Alert.alert('Error', 'Please enter a reason for granting credits');
      return;
    }

    grantCredits(amount, creditReason, 'Studio Admin');

    Alert.alert(
      'Credits Granted!',
      `$${amount.toFixed(2)} in credits have been granted to ${selectedUser}`,
      [{ text: 'OK' }]
    );

    // Reset form
    setCreditAmount('');
    setCreditReason('');
    setShowGrantCreditsModal(false);
  };

  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setShowPaymentTransactionsModal(false);
    setShowRefundModal(true);
  };

  const handleProcessRefund = async () => {
    if (!selectedTransaction) return;

    const amount = refundAmount ? parseFloat(refundAmount) : null;

    if (refundAmount && (isNaN(amount) || amount <= 0)) {
      Alert.alert('Error', 'Please enter a valid refund amount');
      return;
    }

    const maxRefundable = selectedTransaction.amount - selectedTransaction.refundedAmount;
    const refundToProcess = amount || maxRefundable;

    if (refundToProcess > maxRefundable) {
      Alert.alert('Error', `Maximum refundable amount is $${maxRefundable.toFixed(2)}`);
      return;
    }

    Alert.alert(
      'Confirm Refund',
      `Refund $${refundToProcess.toFixed(2)} for this transaction?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Refund',
          style: 'destructive',
          onPress: async () => {
            const result = await processRefund(selectedTransaction.id, refundToProcess);
            if (result.success) {
              Alert.alert('Success', `Refunded $${refundToProcess.toFixed(2)} successfully`);
              setShowRefundModal(false);
              setRefundAmount('');
              setSelectedTransaction(null);
            } else {
              Alert.alert('Error', result.message);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0F0F0F', '#1A0F2E', '#0F0F0F']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Dashboard</Text>
            <Text style={styles.headerSubtitle}>Studio Overview</Text>
          </View>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Online</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Quick Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Stats</Text>
            
            <View style={styles.statsGrid}>
              {/* Today */}
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>📅</Text>
                <Text style={styles.statValue}>{stats.todayBookings}</Text>
                <Text style={styles.statLabel}>Today's Bookings</Text>
              </View>

              {/* Week */}
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>📊</Text>
                <Text style={styles.statValue}>{stats.weekBookings}</Text>
                <Text style={styles.statLabel}>This Week</Text>
              </View>

              {/* Month */}
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>📈</Text>
                <Text style={styles.statValue}>{stats.monthBookings}</Text>
                <Text style={styles.statLabel}>This Month</Text>
              </View>

              {/* Users */}
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>👥</Text>
                <Text style={styles.statValue}>{stats.activeUsers}</Text>
                <Text style={styles.statLabel}>Active Users</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>

            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => setShowGrantCreditsModal(true)}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.quickActionGradient}
              >
                <View style={styles.quickActionContent}>
                  <View>
                    <Text style={styles.quickActionTitle}>💳 Grant Studio Credits</Text>
                    <Text style={styles.quickActionSubtitle}>Add free session credits to user accounts</Text>
                  </View>
                  <Text style={styles.quickActionArrow}>→</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => setShowPaymentTransactionsModal(true)}
            >
              <LinearGradient
                colors={['#8B5CF6', '#6D28D9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.quickActionGradient}
              >
                <View style={styles.quickActionContent}>
                  <View>
                    <Text style={styles.quickActionTitle}>💰 Payment Transactions</Text>
                    <Text style={styles.quickActionSubtitle}>
                      View all payments and process refunds • {stats.totalTransactions} total
                    </Text>
                  </View>
                  <Text style={styles.quickActionArrow}>→</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Revenue */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Revenue</Text>

            <View style={styles.revenueCard}>
              <View style={styles.revenueItem}>
                <Text style={styles.revenueLabel}>Total Revenue</Text>
                <Text style={styles.revenueValue}>${stats.totalRevenue.toFixed(2)}</Text>
              </View>
              <View style={styles.revenueDivider} />
              <View style={styles.revenueItem}>
                <Text style={styles.revenueLabel}>Refunded</Text>
                <Text style={[styles.revenueValue, styles.revenueRefunded]}>
                  -${stats.totalRefunded.toFixed(2)}
                </Text>
              </View>
              <View style={styles.revenueDivider} />
              <View style={styles.revenueItem}>
                <Text style={styles.revenueLabel}>Net Revenue</Text>
                <Text style={[styles.revenueValue, styles.revenueNet]}>
                  ${stats.monthRevenue.toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Payment Stats Summary */}
            <View style={styles.paymentStatsCard}>
              <View style={styles.paymentStatItem}>
                <Text style={styles.paymentStatLabel}>💳 Total Transactions</Text>
                <Text style={styles.paymentStatValue}>{stats.totalTransactions}</Text>
              </View>
              <View style={styles.paymentStatItem}>
                <Text style={styles.paymentStatLabel}>📅 This Month</Text>
                <Text style={styles.paymentStatValue}>
                  ${revenueStats.monthlyRevenue.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>

          {/* Recent Bookings */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Bookings</Text>
              <TouchableOpacity>
                <Text style={styles.viewAll}>View All →</Text>
              </TouchableOpacity>
            </View>

            {recentBookings.map((booking) => (
              <View key={booking.id} style={styles.bookingCard}>
                <View style={styles.bookingInfo}>
                  <Text style={styles.bookingIcon}>
                    {booking.type === 'music' ? '🎵' : '🎙️'}
                  </Text>
                  <View style={styles.bookingDetails}>
                    <Text style={styles.bookingUser}>{booking.user}</Text>
                    <Text style={styles.bookingTime}>
                      {booking.date} • {booking.time}
                    </Text>
                  </View>
                </View>
                <View style={[
                  styles.bookingStatus,
                  booking.status === 'confirmed' ? styles.statusConfirmed : styles.statusPending
                ]}>
                  <Text style={[
                    styles.bookingStatusText,
                    booking.status === 'confirmed' ? styles.statusConfirmedText : styles.statusPendingText
                  ]}>
                    {booking.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Rewards & Engagement */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Rewards & Engagement</Text>
              <TouchableOpacity onPress={() => setShowRewardsKPIModal(true)}>
                <Text style={styles.viewAll}>View Details →</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.rewardsGrid}>
              <View style={styles.rewardKPICard}>
                <Text style={styles.kpiValue}>{rewardsKPIs.totalCreditsDistributed}</Text>
                <Text style={styles.kpiLabel}>Credits Distributed</Text>
              </View>

              <View style={styles.rewardKPICard}>
                <Text style={styles.kpiValue}>{rewardsKPIs.activeReferralPrograms}</Text>
                <Text style={styles.kpiLabel}>Active Referrals</Text>
              </View>

              <View style={styles.rewardKPICard}>
                <Text style={styles.kpiValue}>{rewardsKPIs.avgMilestonesPerUser}</Text>
                <Text style={styles.kpiLabel}>Avg Milestones</Text>
              </View>

              <View style={styles.rewardKPICard}>
                <Text style={styles.kpiValue}>{Object.keys(TIERS).length}</Text>
                <Text style={styles.kpiLabel}>Reward Tiers</Text>
              </View>
            </View>

            {/* Tier Distribution */}
            <View style={styles.tierDistributionCard}>
              <Text style={styles.tierDistributionTitle}>User Tier Distribution</Text>
              <View style={styles.tierBars}>
                {Object.entries(rewardsKPIs.tierDistribution).map(([tier, percentage]) => {
                  const tierKey = tier.toUpperCase();
                  const tierData = TIERS[tierKey];
                  return (
                    <View key={tier} style={styles.tierBarRow}>
                      <Text style={styles.tierBarLabel}>
                        {tierData.emoji} {tierData.name}
                      </Text>
                      <View style={styles.tierBarContainer}>
                        <View
                          style={[
                            styles.tierBarFill,
                            { width: `${percentage}%`, backgroundColor: tierData.color },
                          ]}
                        />
                      </View>
                      <Text style={styles.tierBarPercent}>{percentage}%</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Performance */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Performance</Text>
            
            <View style={styles.performanceCard}>
              <View style={styles.performanceItem}>
                <View style={styles.performanceHeader}>
                  <Text style={styles.performanceLabel}>Session Completion Rate</Text>
                  <Text style={styles.performancePercent}>{stats.completionRate}%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${stats.completionRate}%` }]} />
                </View>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Bookings')}
            >
              <Text style={styles.actionIcon}>✅</Text>
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>Review Pending Bookings</Text>
                <Text style={styles.actionDesc}>3 requests waiting for approval</Text>
              </View>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => setShowCalendarModal(true)}
            >
              <Text style={styles.actionIcon}>📅</Text>
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>Manage Calendar</Text>
                <Text style={styles.actionDesc}>Block time slots or update availability</Text>
              </View>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => setShowSettingsModal(true)}
            >
              <Text style={styles.actionIcon}>⚙️</Text>
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>Studio Settings</Text>
                <Text style={styles.actionDesc}>Update hours, pricing, and policies</Text>
              </View>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Grant Credits Modal */}
        <Modal
          visible={showGrantCreditsModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowGrantCreditsModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalHeader}
              >
                <Text style={styles.modalTitle}>💳 Grant Studio Credits</Text>
                <TouchableOpacity onPress={() => setShowGrantCreditsModal(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </LinearGradient>

              <View style={styles.modalBody}>
                <Text style={styles.inputLabel}>User</Text>
                <View style={styles.inputDisabled}>
                  <Text style={styles.inputDisabledText}>{selectedUser}</Text>
                </View>
                <Text style={styles.inputNote}>Demo mode: Credits will be granted to the current user</Text>

                <Text style={styles.inputLabel}>Credit Amount ($) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter amount (e.g., 60 for 1 hour)"
                  placeholderTextColor="#666"
                  value={creditAmount}
                  onChangeText={setCreditAmount}
                  keyboardType="decimal-pad"
                />

                <Text style={styles.inputLabel}>Reason *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="e.g., Welcome bonus, Referral reward, Promotion"
                  placeholderTextColor="#666"
                  value={creditReason}
                  onChangeText={setCreditReason}
                  multiline
                  numberOfLines={3}
                />

                <View style={styles.creditPresets}>
                  <Text style={styles.presetsLabel}>Quick Amounts:</Text>
                  <View style={styles.presetsRow}>
                    <TouchableOpacity
                      style={styles.presetButton}
                      onPress={() => setCreditAmount('60')}
                    >
                      <Text style={styles.presetButtonText}>$60</Text>
                      <Text style={styles.presetButtonSubtext}>1 hour</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.presetButton}
                      onPress={() => setCreditAmount('120')}
                    >
                      <Text style={styles.presetButtonText}>$120</Text>
                      <Text style={styles.presetButtonSubtext}>2 hours</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.presetButton}
                      onPress={() => setCreditAmount('180')}
                    >
                      <Text style={styles.presetButtonText}>$180</Text>
                      <Text style={styles.presetButtonSubtext}>3 hours</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.grantButton}
                  onPress={handleGrantCredits}
                >
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.grantButtonGradient}
                  >
                    <Text style={styles.grantButtonText}>GRANT CREDITS</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Payment Transactions Modal */}
        <Modal
          visible={showPaymentTransactionsModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowPaymentTransactionsModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <LinearGradient
                colors={['#8B5CF6', '#6D28D9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalHeader}
              >
                <Text style={styles.modalTitle}>💰 Payment Transactions</Text>
                <TouchableOpacity onPress={() => setShowPaymentTransactionsModal(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </LinearGradient>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                {getPaymentHistory().length > 0 ? (
                  <View>
                    {getPaymentHistory().map((transaction) => (
                      <TouchableOpacity
                        key={transaction.id}
                        style={styles.transactionItem}
                        onPress={() => handleViewTransaction(transaction)}
                      >
                        <View style={styles.transactionInfo}>
                          <Text style={styles.transactionDescription}>
                            {transaction.description}
                          </Text>
                          <Text style={styles.transactionDate}>
                            {new Date(transaction.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </Text>
                          <View
                            style={[
                              styles.transactionStatusBadge,
                              transaction.status === 'completed' && styles.statusBadgeCompleted,
                              transaction.status === 'failed' && styles.statusBadgeFailed,
                              transaction.status === 'refunded' && styles.statusBadgeRefunded,
                            ]}
                          >
                            <Text style={styles.transactionStatusText}>
                              {transaction.status.toUpperCase()}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.transactionAmount}>
                          <Text style={styles.transactionAmountValue}>
                            ${transaction.amount.toFixed(2)}
                          </Text>
                          {transaction.refundedAmount > 0 && (
                            <Text style={styles.transactionRefundedText}>
                              Refunded: ${transaction.refundedAmount.toFixed(2)}
                            </Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>No transactions yet</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Refund Modal */}
        <Modal
          visible={showRefundModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowRefundModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <LinearGradient
                colors={['#EF4444', '#DC2626']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalHeader}
              >
                <Text style={styles.modalTitle}>💸 Process Refund</Text>
                <TouchableOpacity onPress={() => setShowRefundModal(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </LinearGradient>

              {selectedTransaction && (
                <View style={styles.modalBody}>
                  <View style={styles.refundTransactionDetails}>
                    <Text style={styles.refundLabel}>Transaction</Text>
                    <Text style={styles.refundValue}>{selectedTransaction.description}</Text>

                    <Text style={styles.refundLabel}>Original Amount</Text>
                    <Text style={styles.refundValue}>${selectedTransaction.amount.toFixed(2)}</Text>

                    <Text style={styles.refundLabel}>Already Refunded</Text>
                    <Text style={styles.refundValue}>
                      ${selectedTransaction.refundedAmount.toFixed(2)}
                    </Text>

                    <Text style={styles.refundLabel}>Maximum Refundable</Text>
                    <Text style={[styles.refundValue, styles.refundHighlight]}>
                      ${(selectedTransaction.amount - selectedTransaction.refundedAmount).toFixed(2)}
                    </Text>
                  </View>

                  <Text style={styles.inputLabel}>Refund Amount ($)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={`Max: ${(selectedTransaction.amount - selectedTransaction.refundedAmount).toFixed(2)}`}
                    placeholderTextColor="#666"
                    value={refundAmount}
                    onChangeText={setRefundAmount}
                    keyboardType="decimal-pad"
                  />
                  <Text style={styles.inputNote}>
                    Leave empty to refund full available amount
                  </Text>

                  <TouchableOpacity
                    style={styles.refundButton}
                    onPress={handleProcessRefund}
                  >
                    <LinearGradient
                      colors={['#EF4444', '#DC2626']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.refundButtonGradient}
                    >
                      <Text style={styles.refundButtonText}>PROCESS REFUND</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>

        {/* Rewards KPI Details Modal */}
        <Modal
          visible={showRewardsKPIModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowRewardsKPIModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modal}>
              <LinearGradient
                colors={['#F59E0B', '#D97706']}
                style={styles.modalHeader}
              >
                <Text style={styles.modalTitle}>Rewards & Engagement KPIs</Text>
                <TouchableOpacity onPress={() => setShowRewardsKPIModal(false)}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </LinearGradient>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                {/* Overview Stats */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Overview</Text>
                  <View style={styles.kpiOverviewGrid}>
                    <View style={styles.kpiOverviewItem}>
                      <Text style={styles.kpiOverviewValue}>{rewardsKPIs.totalCreditsDistributed}</Text>
                      <Text style={styles.kpiOverviewLabel}>Total Credits Distributed</Text>
                    </View>
                    <View style={styles.kpiOverviewItem}>
                      <Text style={styles.kpiOverviewValue}>{rewardsKPIs.activeReferralPrograms}</Text>
                      <Text style={styles.kpiOverviewLabel}>Active Referral Programs</Text>
                    </View>
                  </View>
                </View>

                {/* Tier Breakdown */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>User Tier Distribution</Text>
                  {Object.entries(TIERS).map(([tierKey, tier]) => {
                    const percentage = rewardsKPIs.tierDistribution[tierKey.toLowerCase()] || 0;
                    const userCount = Math.round((percentage / 100) * rewardsKPIs.totalUsers);

                    return (
                      <View key={tierKey} style={styles.tierDetailCard}>
                        <View style={styles.tierDetailHeader}>
                          <Text style={styles.tierDetailIcon}>{tier.emoji}</Text>
                          <View style={styles.tierDetailInfo}>
                            <Text style={styles.tierDetailName}>{tier.name}</Text>
                            <Text style={styles.tierDetailStats}>{userCount} users • {percentage}%</Text>
                          </View>
                          <Text style={[styles.tierDetailPoints, { color: tier.color }]}>
                            {tier.requirements.sessionsBooked} sessions
                          </Text>
                        </View>
                        <View style={styles.tierBenefitsList}>
                          {tier.benefits.slice(0, 2).map((benefit, index) => (
                            <Text key={index} style={styles.tierBenefitText}>
                              • {benefit}
                            </Text>
                          ))}
                        </View>
                      </View>
                    );
                  })}
                </View>

                {/* Top Referrers */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Top Referrers</Text>
                  {rewardsKPIs.topReferrers.map((referrer, index) => (
                    <View key={index} style={styles.referrerCard}>
                      <View style={styles.referrerRank}>
                        <Text style={styles.referrerRankText}>#{index + 1}</Text>
                      </View>
                      <View style={styles.referrerInfo}>
                        <Text style={styles.referrerName}>{referrer.name}</Text>
                        <Text style={styles.referrerStats}>
                          {referrer.referrals} successful referrals
                        </Text>
                      </View>
                      <View style={styles.referrerCredits}>
                        <Text style={styles.referrerCreditsValue}>{referrer.credits}</Text>
                        <Text style={styles.referrerCreditsLabel}>credits earned</Text>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Milestone Completion */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Milestone Completion</Text>
                  {milestones.slice(0, 5).map((milestone) => (
                    <View key={milestone.id} style={styles.milestoneKPICard}>
                      <Text style={styles.milestoneKPIIcon}>{milestone.icon}</Text>
                      <View style={styles.milestoneKPIInfo}>
                        <Text style={styles.milestoneKPITitle}>{milestone.title}</Text>
                        <Text style={styles.milestoneKPIDescription}>{milestone.description}</Text>
                        {milestone.completed ? (
                          <Text style={styles.milestoneKPICompleted}>✓ Completed</Text>
                        ) : milestone.progress !== undefined ? (
                          <Text style={styles.milestoneKPIProgress}>{milestone.progress}% complete</Text>
                        ) : null}
                      </View>
                      <View style={styles.milestoneKPIReward}>
                        <Text style={styles.milestoneKPIRewardValue}>+{milestone.reward.amount}</Text>
                        <Text style={styles.milestoneKPIRewardLabel}>credits</Text>
                      </View>
                    </View>
                  ))}
                </View>

                <View style={{ height: 40 }} />
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Calendar Management Modal */}
        <Modal
          visible={showCalendarModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowCalendarModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <LinearGradient
                colors={['#8B5CF6', '#6D28D9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalHeader}
              >
                <Text style={styles.modalTitle}>📅 Calendar Management</Text>
                <TouchableOpacity onPress={() => setShowCalendarModal(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </LinearGradient>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                {/* Blocked Time Slots Section */}
                <View style={styles.calendarSection}>
                  <Text style={styles.calendarSectionTitle}>🚫 Blocked Time Slots</Text>
                  <Text style={styles.calendarSectionDesc}>
                    Manage blocked time slots for maintenance or special events
                  </Text>

                  {blockedSlots.length > 0 ? (
                    <View style={styles.blockedSlotsList}>
                      {blockedSlots.map((slot) => (
                        <View key={slot.id} style={styles.blockedSlotCard}>
                          <View style={styles.blockedSlotInfo}>
                            <Text style={styles.blockedSlotDate}>{slot.date}</Text>
                            <Text style={styles.blockedSlotTime}>{slot.time}</Text>
                            <Text style={styles.blockedSlotReason}>{slot.reason}</Text>
                          </View>
                          <TouchableOpacity
                            style={styles.unblockButton}
                            onPress={() => {
                              Alert.alert(
                                'Unblock Time Slot',
                                `Remove block for ${slot.date} at ${slot.time}?`,
                                [
                                  { text: 'Cancel', style: 'cancel' },
                                  {
                                    text: 'Unblock',
                                    onPress: () => {
                                      setBlockedSlots(blockedSlots.filter(s => s.id !== slot.id));
                                      Alert.alert('Success', 'Time slot unblocked');
                                    },
                                  },
                                ]
                              );
                            }}
                          >
                            <Text style={styles.unblockButtonText}>Unblock</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View style={styles.emptyBlockedSlots}>
                      <Text style={styles.emptyBlockedSlotsText}>No blocked time slots</Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.addBlockButton}
                    onPress={() => {
                      Alert.alert(
                        'Add Blocked Time Slot',
                        'Full date/time picker will be available in the complete version',
                        [{ text: 'OK' }]
                      );
                    }}
                  >
                    <LinearGradient
                      colors={['#EF4444', '#DC2626']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.addBlockButtonGradient}
                    >
                      <Text style={styles.addBlockButtonText}>+ Block Time Slot</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                {/* Studio Hours Section */}
                <View style={styles.calendarSection}>
                  <Text style={styles.calendarSectionTitle}>🕐 Studio Hours</Text>
                  <Text style={styles.calendarSectionDesc}>
                    Set your regular operating hours for each day of the week
                  </Text>

                  <View style={styles.studioHoursList}>
                    {Object.keys(studioHours).map((day) => {
                      const hours = studioHours[day];
                      return (
                        <View key={day} style={styles.studioHoursCard}>
                          <View style={styles.studioHoursDay}>
                            <Text style={styles.studioHoursDayText}>
                              {day.charAt(0).toUpperCase() + day.slice(1)}
                            </Text>
                          </View>
                          {hours.closed ? (
                            <View style={styles.studioHoursClosed}>
                              <Text style={styles.studioHoursClosedText}>Closed</Text>
                            </View>
                          ) : (
                            <View style={styles.studioHoursTime}>
                              <Text style={styles.studioHoursTimeText}>
                                {hours.open} - {hours.close}
                              </Text>
                            </View>
                          )}
                          <TouchableOpacity
                            style={styles.editHoursButton}
                            onPress={() => {
                              Alert.alert(
                                `Edit ${day.charAt(0).toUpperCase() + day.slice(1)} Hours`,
                                'Time picker will be available in the complete version',
                                [{ text: 'OK' }]
                              );
                            }}
                          >
                            <Text style={styles.editHoursButtonText}>Edit</Text>
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.calendarSection}>
                  <Text style={styles.calendarSectionTitle}>⚡ Quick Actions</Text>

                  <TouchableOpacity
                    style={styles.quickCalendarAction}
                    onPress={() => {
                      Alert.alert(
                        'Block Entire Day',
                        'Select a date to block all time slots',
                        [{ text: 'OK' }]
                      );
                    }}
                  >
                    <Text style={styles.quickCalendarActionIcon}>🚫</Text>
                    <Text style={styles.quickCalendarActionText}>Block Entire Day</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.quickCalendarAction}
                    onPress={() => {
                      Alert.alert(
                        'Set Holiday Hours',
                        'Configure special hours for holidays',
                        [{ text: 'OK' }]
                      );
                    }}
                  >
                    <Text style={styles.quickCalendarActionIcon}>🎉</Text>
                    <Text style={styles.quickCalendarActionText}>Set Holiday Hours</Text>
                  </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Studio Settings Modal */}
        <Modal
          visible={showSettingsModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowSettingsModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <LinearGradient
                colors={['#F59E0B', '#D97706']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalHeader}
              >
                <Text style={styles.modalTitle}>⚙️ Studio Settings</Text>
                <TouchableOpacity onPress={() => setShowSettingsModal(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </LinearGradient>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                {/* Pricing Section */}
                <View style={styles.settingsSection}>
                  <Text style={styles.settingsSectionTitle}>💰 Pricing</Text>

                  <View style={styles.settingItem}>
                    <View style={styles.settingItemHeader}>
                      <Text style={styles.settingItemLabel}>🎵 Music Recording Session</Text>
                      <Text style={styles.settingItemValue}>${studioSettings.musicSessionPrice}</Text>
                    </View>
                    <Text style={styles.settingItemDesc}>Per {studioSettings.sessionDuration} hour session</Text>
                    <TouchableOpacity
                      style={styles.editSettingButton}
                      onPress={() => {
                        Alert.alert(
                          'Edit Pricing',
                          'Price editor will be available in the complete version',
                          [{ text: 'OK' }]
                        );
                      }}
                    >
                      <Text style={styles.editSettingButtonText}>Edit Price</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.settingItem}>
                    <View style={styles.settingItemHeader}>
                      <Text style={styles.settingItemLabel}>🎙️ Podcast Recording Session</Text>
                      <Text style={styles.settingItemValue}>${studioSettings.podcastSessionPrice}</Text>
                    </View>
                    <Text style={styles.settingItemDesc}>Per {studioSettings.sessionDuration} hour session</Text>
                    <TouchableOpacity
                      style={styles.editSettingButton}
                      onPress={() => {
                        Alert.alert(
                          'Edit Pricing',
                          'Price editor will be available in the complete version',
                          [{ text: 'OK' }]
                        );
                      }}
                    >
                      <Text style={styles.editSettingButtonText}>Edit Price</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Session Configuration */}
                <View style={styles.settingsSection}>
                  <Text style={styles.settingsSectionTitle}>⏱️ Session Configuration</Text>

                  <View style={styles.settingItem}>
                    <View style={styles.settingItemHeader}>
                      <Text style={styles.settingItemLabel}>Default Session Duration</Text>
                      <Text style={styles.settingItemValue}>{studioSettings.sessionDuration} hours</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.editSettingButton}
                      onPress={() => {
                        Alert.alert(
                          'Edit Session Duration',
                          'Duration editor will be available in the complete version',
                          [{ text: 'OK' }]
                        );
                      }}
                    >
                      <Text style={styles.editSettingButtonText}>Edit Duration</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.settingItem}>
                    <View style={styles.settingItemHeader}>
                      <Text style={styles.settingItemLabel}>Max Advance Booking</Text>
                      <Text style={styles.settingItemValue}>{studioSettings.maxAdvanceBooking} days</Text>
                    </View>
                    <Text style={styles.settingItemDesc}>How far in advance users can book</Text>
                    <TouchableOpacity
                      style={styles.editSettingButton}
                      onPress={() => {
                        Alert.alert(
                          'Edit Advance Booking',
                          'Editor will be available in the complete version',
                          [{ text: 'OK' }]
                        );
                      }}
                    >
                      <Text style={styles.editSettingButtonText}>Edit</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Policies */}
                <View style={styles.settingsSection}>
                  <Text style={styles.settingsSectionTitle}>📋 Policies</Text>

                  <View style={styles.settingItem}>
                    <View style={styles.settingItemHeader}>
                      <Text style={styles.settingItemLabel}>Cancellation Policy</Text>
                      <Text style={styles.settingItemValue}>{studioSettings.cancellationPolicy}</Text>
                    </View>
                    <Text style={styles.settingItemDesc}>Minimum notice required for cancellation</Text>
                    <TouchableOpacity
                      style={styles.editSettingButton}
                      onPress={() => {
                        Alert.alert(
                          'Edit Cancellation Policy',
                          'Choose cancellation window: 12 hours, 24 hours, 48 hours, or 72 hours',
                          [{ text: 'OK' }]
                        );
                      }}
                    >
                      <Text style={styles.editSettingButtonText}>Edit Policy</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.settingItem}>
                    <View style={styles.settingItemHeader}>
                      <Text style={styles.settingItemLabel}>Deposit Required</Text>
                      <Text style={[
                        styles.settingItemValue,
                        { color: studioSettings.depositRequired ? '#10B981' : '#666' }
                      ]}>
                        {studioSettings.depositRequired ? 'Yes' : 'No'}
                      </Text>
                    </View>
                    {studioSettings.depositRequired && (
                      <Text style={styles.settingItemDesc}>
                        ${studioSettings.depositAmount} deposit required at booking
                      </Text>
                    )}
                    <TouchableOpacity
                      style={styles.editSettingButton}
                      onPress={() => {
                        setStudioSettings({
                          ...studioSettings,
                          depositRequired: !studioSettings.depositRequired,
                        });
                      }}
                    >
                      <Text style={styles.editSettingButtonText}>
                        {studioSettings.depositRequired ? 'Disable' : 'Enable'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Notifications */}
                <View style={styles.settingsSection}>
                  <Text style={styles.settingsSectionTitle}>🔔 Notifications</Text>

                  <View style={styles.settingToggleItem}>
                    <View style={styles.settingToggleInfo}>
                      <Text style={styles.settingToggleLabel}>Booking Requests</Text>
                      <Text style={styles.settingToggleDesc}>Get notified of new booking requests</Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.settingToggle,
                        studioSettings.notifications.bookingRequests && styles.settingToggleActive
                      ]}
                      onPress={() => {
                        setStudioSettings({
                          ...studioSettings,
                          notifications: {
                            ...studioSettings.notifications,
                            bookingRequests: !studioSettings.notifications.bookingRequests,
                          },
                        });
                      }}
                    >
                      <View style={[
                        styles.settingToggleCircle,
                        studioSettings.notifications.bookingRequests && styles.settingToggleCircleActive
                      ]} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.settingToggleItem}>
                    <View style={styles.settingToggleInfo}>
                      <Text style={styles.settingToggleLabel}>Cancellations</Text>
                      <Text style={styles.settingToggleDesc}>Get notified when users cancel</Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.settingToggle,
                        studioSettings.notifications.cancellations && styles.settingToggleActive
                      ]}
                      onPress={() => {
                        setStudioSettings({
                          ...studioSettings,
                          notifications: {
                            ...studioSettings.notifications,
                            cancellations: !studioSettings.notifications.cancellations,
                          },
                        });
                      }}
                    >
                      <View style={[
                        styles.settingToggleCircle,
                        studioSettings.notifications.cancellations && styles.settingToggleCircleActive
                      ]} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.settingToggleItem}>
                    <View style={styles.settingToggleInfo}>
                      <Text style={styles.settingToggleLabel}>Reviews</Text>
                      <Text style={styles.settingToggleDesc}>Get notified of new reviews</Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.settingToggle,
                        studioSettings.notifications.reviews && styles.settingToggleActive
                      ]}
                      onPress={() => {
                        setStudioSettings({
                          ...studioSettings,
                          notifications: {
                            ...studioSettings.notifications,
                            reviews: !studioSettings.notifications.reviews,
                          },
                        });
                      }}
                    >
                      <View style={[
                        styles.settingToggleCircle,
                        studioSettings.notifications.reviews && styles.settingToggleCircleActive
                      ]} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Save Button */}
                <TouchableOpacity
                  style={styles.saveSettingsButton}
                  onPress={() => {
                    Alert.alert(
                      'Settings Saved',
                      'Your studio settings have been updated successfully',
                      [
                        {
                          text: 'OK',
                          onPress: () => setShowSettingsModal(false),
                        },
                      ]
                    );
                  }}
                >
                  <LinearGradient
                    colors={['#F59E0B', '#D97706']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.saveSettingsButtonGradient}
                  >
                    <Text style={styles.saveSettingsButtonText}>SAVE SETTINGS</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
              </ScrollView>
            </View>
          </View>
        </Modal>

      </LinearGradient>
    </SafeAreaView>
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
    paddingTop: 40,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#F59E0B',
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)'
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  revenueCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 16,
    padding: 20,
  },
  revenueItem: {
    flex: 1,
    alignItems: 'center',
  },
  revenueDivider: {
    width: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
  },
  revenueLabel: {
    fontSize: 12,
    color: '#10B981',
    marginBottom: 8,
  },
  revenueValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#10B981',
  },
  bookingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  bookingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bookingIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  bookingDetails: {
    flex: 1,
  },
  bookingUser: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  bookingTime: {
    fontSize: 12,
    color: '#666',
  },
  bookingStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusPending: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  statusConfirmed: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  bookingStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusPendingText: {
    color: '#F59E0B',
  },
  statusConfirmedText: {
    color: '#10B981',
  },
  performanceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    borderRadius: 16,
    padding: 20,
  },
  performanceItem: {
    marginBottom: 0,
  },
  performanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  performanceLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  performancePercent: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F59E0B',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 4,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  actionIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  actionDesc: {
    fontSize: 12,
    color: '#666',
  },
  actionArrow: {
    fontSize: 24,
    color: '#666',
  },
  // Quick Actions Styles
  quickActionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  quickActionGradient: {
    padding: 20,
  },
  quickActionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quickActionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  quickActionSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  quickActionArrow: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalClose: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalBody: {
    padding: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#FFFFFF',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputDisabledText: {
    fontSize: 15,
    color: '#666',
  },
  inputNote: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
    fontStyle: 'italic',
  },
  creditPresets: {
    marginTop: 20,
  },
  presetsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  presetButton: {
    flex: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  presetButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#10B981',
    marginBottom: 4,
  },
  presetButtonSubtext: {
    fontSize: 11,
    color: '#999',
  },
  grantButton: {
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  grantButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  grantButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  // Payment Dashboard Styles
  revenueRefunded: {
    color: '#EF4444',
  },
  revenueNet: {
    color: '#10B981',
  },
  paymentStatsCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  paymentStatItem: {
    flex: 1,
  },
  paymentStatLabel: {
    fontSize: 13,
    color: '#999',
    marginBottom: 8,
  },
  paymentStatValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#8B5CF6',
  },
  // Transaction List Styles
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  transactionInfo: {
    flex: 1,
    marginRight: 12,
  },
  transactionDescription: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  transactionDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  transactionStatusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  statusBadgeFailed: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  statusBadgeRefunded: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  transactionStatusText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionAmountValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#10B981',
    marginBottom: 4,
  },
  transactionRefundedText: {
    fontSize: 11,
    color: '#F59E0B',
    fontWeight: '600',
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
  },
  // Refund Modal Styles
  refundTransactionDetails: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  refundLabel: {
    fontSize: 13,
    color: '#999',
    marginTop: 12,
    marginBottom: 4,
  },
  refundValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  refundHighlight: {
    fontSize: 18,
    fontWeight: '800',
    color: '#EF4444',
  },
  refundButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 24,
  },
  refundButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  refundButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  // Rewards KPI Styles
  rewardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  rewardKPICard: {
    width: '48%',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    margin: '1%',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    alignItems: 'center',
  },
  kpiValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#F59E0B',
    marginBottom: 6,
  },
  kpiLabel: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  tierDistributionCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  tierDistributionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  tierBars: {
    gap: 12,
  },
  tierBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tierBarLabel: {
    fontSize: 13,
    color: '#CCCCCC',
    width: 80,
  },
  tierBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  tierBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  tierBarPercent: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F59E0B',
    width: 40,
    textAlign: 'right',
  },
  // Rewards KPI Modal Styles
  kpiOverviewGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  kpiOverviewItem: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    alignItems: 'center',
  },
  kpiOverviewValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F59E0B',
    marginBottom: 6,
  },
  kpiOverviewLabel: {
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
  },
  tierDetailCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  tierDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tierDetailIcon: {
    fontSize: 36,
    marginRight: 12,
  },
  tierDetailInfo: {
    flex: 1,
  },
  tierDetailName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  tierDetailStats: {
    fontSize: 13,
    color: '#888',
  },
  tierDetailPoints: {
    fontSize: 14,
    fontWeight: '700',
  },
  tierBenefitsList: {
    gap: 6,
  },
  tierBenefitText: {
    fontSize: 13,
    color: '#AAAAAA',
  },
  referrerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  referrerRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  referrerRankText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F59E0B',
  },
  referrerInfo: {
    flex: 1,
  },
  referrerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  referrerStats: {
    fontSize: 12,
    color: '#888',
  },
  referrerCredits: {
    alignItems: 'flex-end',
  },
  referrerCreditsValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F59E0B',
  },
  referrerCreditsLabel: {
    fontSize: 11,
    color: '#888',
  },
  milestoneKPICard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  milestoneKPIIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  milestoneKPIInfo: {
    flex: 1,
  },
  milestoneKPITitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  milestoneKPIDescription: {
    fontSize: 12,
    color: '#888',
    marginBottom: 6,
  },
  milestoneKPICompleted: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  milestoneKPIProgress: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
  },
  milestoneKPIReward: {
    alignItems: 'flex-end',
  },
  milestoneKPIRewardValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F59E0B',
  },
  milestoneKPIRewardLabel: {
    fontSize: 10,
    color: '#888',
  },
  // Calendar Modal Styles
  calendarSection: {
    marginBottom: 32,
  },
  calendarSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  calendarSectionDesc: {
    fontSize: 13,
    color: '#999',
    marginBottom: 16,
    lineHeight: 18,
  },
  blockedSlotsList: {
    marginBottom: 16,
  },
  blockedSlotCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  blockedSlotInfo: {
    flex: 1,
  },
  blockedSlotDate: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  blockedSlotTime: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 4,
  },
  blockedSlotReason: {
    fontSize: 12,
    color: '#999',
  },
  unblockButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  unblockButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444',
  },
  emptyBlockedSlots: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyBlockedSlotsText: {
    fontSize: 14,
    color: '#666',
  },
  addBlockButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  addBlockButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  addBlockButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  studioHoursList: {
    gap: 12,
  },
  studioHoursCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 12,
    padding: 16,
  },
  studioHoursDay: {
    width: 100,
  },
  studioHoursDayText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  studioHoursTime: {
    flex: 1,
  },
  studioHoursTimeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  studioHoursClosed: {
    flex: 1,
  },
  studioHoursClosedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  editHoursButton: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editHoursButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  quickCalendarAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  quickCalendarActionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  quickCalendarActionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Studio Settings Modal Styles
  settingsSection: {
    marginBottom: 32,
  },
  settingsSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  settingItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  settingItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingItemLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  settingItemValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F59E0B',
  },
  settingItemDesc: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  editSettingButton: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  editSettingButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F59E0B',
  },
  settingToggleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  settingToggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingToggleLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  settingToggleDesc: {
    fontSize: 12,
    color: '#999',
  },
  settingToggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 2,
    justifyContent: 'center',
  },
  settingToggleActive: {
    backgroundColor: '#F59E0B',
  },
  settingToggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#666',
  },
  settingToggleCircleActive: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-end',
  },
  saveSettingsButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 16,
  },
  saveSettingsButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveSettingsButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
});
