import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import AnalyticsCard from '../components/AnalyticsCard';

export default function AdminAnalyticsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, 90d, 1y

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const timeRanges = [
    { key: '7d', label: '7 Days' },
    { key: '30d', label: '30 Days' },
    { key: '90d', label: '90 Days' },
    { key: '1y', label: '1 Year' },
  ];

  // Mock analytics data
  const analyticsData = {
    revenue: {
      value: '$12,450',
      change: '+15.2%',
      data: [
        { label: 'Mon', value: 1200 },
        { label: 'Tue', value: 1800 },
        { label: 'Wed', value: 1500 },
        { label: 'Thu', value: 2100 },
        { label: 'Fri', value: 2400 },
        { label: 'Sat', value: 1900 },
        { label: 'Sun', value: 1550 },
      ]
    },
    bookings: {
      value: '156',
      change: '+8.4%',
      data: [
        { label: 'Mon', value: 18 },
        { label: 'Tue', value: 24 },
        { label: 'Wed', value: 20 },
        { label: 'Thu', value: 28 },
        { label: 'Fri', value: 32 },
        { label: 'Sat', value: 22 },
        { label: 'Sun', value: 12 },
      ]
    },
    activeUsers: {
      value: '847',
      change: '+23.1%',
      data: [
        { label: 'W1', value: 650 },
        { label: 'W2', value: 720 },
        { label: 'W3', value: 780 },
        { label: 'W4', value: 847 },
      ]
    },
    sessionUsage: {
      value: '92%',
      change: '+5.3%',
      data: [
        { label: 'Music', value: 65, color: '#8B5CF6' },
        { label: 'Podcast', value: 27, color: '#EC4899' },
        { label: 'Other', value: 8, color: '#F59E0B' },
      ]
    },
    averageBookingValue: {
      value: '$79.80',
      change: '+6.7%',
      data: [
        { label: 'Jan', value: 65 },
        { label: 'Feb', value: 70 },
        { label: 'Mar', value: 68 },
        { label: 'Apr', value: 75 },
        { label: 'May', value: 72 },
        { label: 'Jun', value: 79.8 },
      ]
    },
    conversionRate: {
      value: '12.4%',
      change: '+2.1%',
      data: [
        { label: 'W1', value: 10.2 },
        { label: 'W2', value: 11.5 },
        { label: 'W3', value: 11.8 },
        { label: 'W4', value: 12.4 },
      ]
    },
    customerSatisfaction: {
      value: '4.8/5.0',
      change: '+0.2',
      data: [
        { label: '5★', value: 68, color: '#10B981' },
        { label: '4★', value: 24, color: '#8B5CF6' },
        { label: '3★', value: 6, color: '#F59E0B' },
        { label: '≤2★', value: 2, color: '#EF4444' },
      ]
    },
    peakHours: {
      value: '2-6 PM',
      change: '',
      data: [
        { label: '6AM', value: 5 },
        { label: '9AM', value: 15 },
        { label: '12PM', value: 30 },
        { label: '3PM', value: 45 },
        { label: '6PM', value: 35 },
        { label: '9PM', value: 20 },
      ]
    },
  };

  return (
    <LinearGradient colors={['#0F0F0F', '#1A0F2E', '#0F0F0F']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Analytics</Text>
            <Text style={styles.headerSubtitle}>Studio Performance Insights</Text>
          </View>
        </View>

        {/* Time Range Filter */}
        <View style={styles.filterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContent}
          >
            {timeRanges.map((range) => (
              <TouchableOpacity
                key={range.key}
                style={[styles.filterChip, timeRange === range.key && styles.filterChipActive]}
                onPress={() => setTimeRange(range.key)}
              >
                <Text style={[styles.filterLabel, timeRange === range.key && styles.filterLabelActive]}>
                  {range.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Analytics Cards */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#F59E0B"
            />
          }
        >
          {/* Revenue */}
          <AnalyticsCard
            title="Total Revenue"
            subtitle="Last 7 days"
            value={analyticsData.revenue.value}
            change={analyticsData.revenue.change}
            chartType="bar"
            data={analyticsData.revenue.data}
            icon="💰"
          />

          {/* Bookings */}
          <AnalyticsCard
            title="Total Bookings"
            subtitle="Last 7 days"
            value={analyticsData.bookings.value}
            change={analyticsData.bookings.change}
            chartType="bar"
            data={analyticsData.bookings.data}
            icon="📅"
          />

          {/* Active Users */}
          <AnalyticsCard
            title="Active Users"
            subtitle="Weekly trend"
            value={analyticsData.activeUsers.value}
            change={analyticsData.activeUsers.change}
            chartType="line"
            data={analyticsData.activeUsers.data}
            icon="👥"
          />

          {/* Session Usage */}
          <AnalyticsCard
            title="Session Usage"
            subtitle="By type"
            value={analyticsData.sessionUsage.value}
            change={analyticsData.sessionUsage.change}
            chartType="pie"
            data={analyticsData.sessionUsage.data}
            icon="🎵"
          />

          {/* Average Booking Value */}
          <AnalyticsCard
            title="Avg. Booking Value"
            subtitle="Monthly trend"
            value={analyticsData.averageBookingValue.value}
            change={analyticsData.averageBookingValue.change}
            chartType="line"
            data={analyticsData.averageBookingValue.data}
            icon="📊"
          />

          {/* Conversion Rate */}
          <AnalyticsCard
            title="Conversion Rate"
            subtitle="Visits to bookings"
            value={analyticsData.conversionRate.value}
            change={analyticsData.conversionRate.change}
            chartType="line"
            data={analyticsData.conversionRate.data}
            icon="🎯"
          />

          {/* Customer Satisfaction */}
          <AnalyticsCard
            title="Customer Rating"
            subtitle="Average satisfaction"
            value={analyticsData.customerSatisfaction.value}
            change={analyticsData.customerSatisfaction.change}
            chartType="pie"
            data={analyticsData.customerSatisfaction.data}
            icon="⭐"
          />

          {/* Peak Hours */}
          <AnalyticsCard
            title="Peak Booking Hours"
            subtitle="Busiest time of day"
            value={analyticsData.peakHours.value}
            change={analyticsData.peakHours.change}
            chartType="bar"
            data={analyticsData.peakHours.data}
            icon="⏰"
          />

          {/* Summary Stats */}
          <View style={styles.summarySection}>
            <Text style={styles.summaryTitle}>📈 Quick Stats</Text>

            <View style={styles.summaryGrid}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>$2,450</Text>
                <Text style={styles.summaryLabel}>Today's Revenue</Text>
              </View>

              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>23</Text>
                <Text style={styles.summaryLabel}>Pending Bookings</Text>
              </View>

              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>98%</Text>
                <Text style={styles.summaryLabel}>Uptime</Text>
              </View>

              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>156</Text>
                <Text style={styles.summaryLabel}>Total Sessions</Text>
              </View>
            </View>
          </View>

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
  headerSubtitle: {
    fontSize: 14,
    color: '#F59E0B',
    marginTop: 4,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterContent: {
    paddingHorizontal: 20,
  },
  filterChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderColor: '#F59E0B',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
  },
  filterLabelActive: {
    color: '#F59E0B',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  summarySection: {
    marginTop: 8,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  summaryCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    borderRadius: 12,
    padding: 16,
    margin: '1%',
    marginBottom: 12,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F59E0B',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#888',
  },
});
