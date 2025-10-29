import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export default function AdminSettingsScreen({ onLogout }) {
  const [autoApproveBookings, setAutoApproveBookings] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [autoArchiveOldSessions, setAutoArchiveOldSessions] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const handleLogoutPress = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout from admin panel?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: onLogout,
        },
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear all cached data?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            // Will implement actual cache clearing later
            Alert.alert('Success', 'Cache cleared successfully');
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert('Export Data', 'This will export all admin data to CSV files.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0F0F0F', '#1A0F0F', '#0F0F0F']}
        style={styles.gradient}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Admin Settings</Text>
            <Text style={styles.headerSubtitle}>Manage your admin panel preferences</Text>
          </View>

          {/* Booking Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Booking Management</Text>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Auto-Approve Bookings</Text>
                <Text style={styles.settingDescription}>
                  Automatically approve all new booking requests
                </Text>
              </View>
              <Switch
                value={autoApproveBookings}
                onValueChange={setAutoApproveBookings}
                trackColor={{ false: '#333', true: '#F59E0B' }}
                thumbColor={autoApproveBookings ? '#FFFFFF' : '#999'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Auto-Archive Old Sessions</Text>
                <Text style={styles.settingDescription}>
                  Archive sessions older than 90 days automatically
                </Text>
              </View>
              <Switch
                value={autoArchiveOldSessions}
                onValueChange={setAutoArchiveOldSessions}
                trackColor={{ false: '#333', true: '#F59E0B' }}
                thumbColor={autoArchiveOldSessions ? '#FFFFFF' : '#999'}
              />
            </View>
          </View>

          {/* Notification Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notifications</Text>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Email Notifications</Text>
                <Text style={styles.settingDescription}>
                  Receive email alerts for new bookings and messages
                </Text>
              </View>
              <Switch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
                trackColor={{ false: '#333', true: '#F59E0B' }}
                thumbColor={emailNotifications ? '#FFFFFF' : '#999'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Push Notifications</Text>
                <Text style={styles.settingDescription}>
                  Receive push notifications on this device
                </Text>
              </View>
              <Switch
                value={pushNotifications}
                onValueChange={setPushNotifications}
                trackColor={{ false: '#333', true: '#F59E0B' }}
                thumbColor={pushNotifications ? '#FFFFFF' : '#999'}
              />
            </View>
          </View>

          {/* Studio Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Studio Management</Text>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Maintenance Mode</Text>
                <Text style={styles.settingDescription}>
                  Disable new bookings for maintenance
                </Text>
              </View>
              <Switch
                value={maintenanceMode}
                onValueChange={setMaintenanceMode}
                trackColor={{ false: '#333', true: '#EF4444' }}
                thumbColor={maintenanceMode ? '#FFFFFF' : '#999'}
              />
            </View>
          </View>

          {/* Data Management */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Management</Text>

            <TouchableOpacity style={styles.actionButton} onPress={handleExportData}>
              <Text style={styles.actionButtonIcon}>📊</Text>
              <View style={styles.actionButtonInfo}>
                <Text style={styles.actionButtonLabel}>Export Data</Text>
                <Text style={styles.actionButtonDescription}>
                  Download all admin data as CSV
                </Text>
              </View>
              <Text style={styles.actionButtonArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleClearCache}>
              <Text style={styles.actionButtonIcon}>🗑️</Text>
              <View style={styles.actionButtonInfo}>
                <Text style={styles.actionButtonLabel}>Clear Cache</Text>
                <Text style={styles.actionButtonDescription}>
                  Free up storage space
                </Text>
              </View>
              <Text style={styles.actionButtonArrow}>›</Text>
            </TouchableOpacity>
          </View>

          {/* App Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Version</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Build</Text>
              <Text style={styles.infoValue}>2025.10.28</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Admin Panel</Text>
              <Text style={styles.infoValue}>Booth 33 Studio</Text>
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogoutPress}>
            <LinearGradient
              colors={['#EF4444', '#DC2626']}
              style={styles.logoutGradient}
            >
              <Text style={styles.logoutButtonText}>🚪 Logout from Admin Panel</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Bottom Spacing */}
          <View style={{ height: 100 }} />
        </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#999',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F59E0B',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#888',
    lineHeight: 18,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  actionButtonIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  actionButtonInfo: {
    flex: 1,
  },
  actionButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  actionButtonDescription: {
    fontSize: 13,
    color: '#888',
  },
  actionButtonArrow: {
    fontSize: 28,
    color: '#666',
    fontWeight: '300',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(245, 158, 11, 0.1)',
  },
  infoLabel: {
    fontSize: 15,
    color: '#AAAAAA',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  logoutButton: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  logoutGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
