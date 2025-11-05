import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen({ onBackPress }) {
  const [settings, setSettings] = useState({
    // Notifications
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    bookingReminders: true,
    sessionAlerts: true,
    messageNotifications: true,
    eventUpdates: true,

    // Privacy
    publicProfile: true,
    showSessionHistory: true,
    showFollowers: true,
    allowMessages: 'everyone', // everyone, followers, nobody
    dataSharing: false,

    // Appearance
    theme: 'dark', // dark, light, auto
    language: 'en', // en, es, fr, etc

    // Storage
    downloadQuality: 'high', // low, medium, high
    autoDownload: false,
  });

  const toggleSetting = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const handleChangePassword = () => {
    Alert.alert('Change Password', 'Redirect to password change screen (Coming Soon)');
  };

  const handleEditAccount = () => {
    Alert.alert('Edit Account', 'Redirect to account edit screen (Coming Soon)');
  };

  const handleContactSupport = () => {
    Alert.alert('Contact Support', 'Email: support@booth33.com\nPhone: (555) 123-4567');
  };

  const handleSendFeedback = () => {
    Alert.alert('Send Feedback', 'Open feedback form (Coming Soon)');
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will delete temporary files and free up storage. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Cache Cleared', 'Successfully cleared 42.3 MB of cached data');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted. Are you absolutely sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deleted', 'Your account has been permanently deleted.');
          },
        },
      ]
    );
  };

  const renderSection = (title) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  const renderSettingRow = (label, value, onPress, icon = '', showArrow = true) => (
    <TouchableOpacity style={styles.settingRow} onPress={onPress}>
      <View style={styles.settingLeft}>
        {icon && <Text style={styles.settingIcon}>{icon}</Text>}
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      <View style={styles.settingRight}>
        {value && <Text style={styles.settingValue}>{value}</Text>}
        {showArrow && <Text style={styles.settingArrow}>›</Text>}
      </View>
    </TouchableOpacity>
  );

  const renderToggleRow = (label, settingKey, icon = '') => (
    <View style={styles.settingRow}>
      <View style={styles.settingLeft}>
        {icon && <Text style={styles.settingIcon}>{icon}</Text>}
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      <Switch
        value={settings[settingKey]}
        onValueChange={() => toggleSetting(settingKey)}
        trackColor={{ false: '#333', true: '#8B5CF6' }}
        thumbColor={settings[settingKey] ? '#EC4899' : '#999'}
      />
    </View>
  );

  return (
    <LinearGradient colors={['#0F0F0F', '#1A0F2E', '#0F0F0F']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Settings List */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Account */}
          {renderSection('ACCOUNT')}
          {renderSettingRow('Edit Profile', '', handleEditAccount, '👤')}
          {renderSettingRow('Change Password', '', handleChangePassword, '🔑')}
          {renderSettingRow('Email & Phone', 'alex@example.com', () => {}, '📧')}

          {/* Notifications */}
          {renderSection('NOTIFICATIONS')}
          {renderToggleRow('Push Notifications', 'pushNotifications', '🔔')}
          {renderToggleRow('Email Notifications', 'emailNotifications', '📬')}
          {renderToggleRow('SMS Notifications', 'smsNotifications', '💬')}
          {renderToggleRow('Booking Reminders', 'bookingReminders', '⏰')}
          {renderToggleRow('Session Alerts', 'sessionAlerts', '🎵')}
          {renderToggleRow('Message Notifications', 'messageNotifications', '💬')}
          {renderToggleRow('Event Updates', 'eventUpdates', '🎉')}

          {/* Privacy & Security */}
          {renderSection('PRIVACY & SECURITY')}
          {renderToggleRow('Public Profile', 'publicProfile', '🌐')}
          {renderToggleRow('Show Session History', 'showSessionHistory', '📊')}
          {renderToggleRow('Show Followers', 'showFollowers', '👥')}
          {renderSettingRow(
            'Who Can Message You',
            settings.allowMessages === 'everyone' ? 'Everyone' : settings.allowMessages === 'followers' ? 'Followers Only' : 'Nobody',
            () => {
              Alert.alert('Message Privacy', 'Configure message privacy (Coming Soon)');
            },
            '💌'
          )}
          {renderToggleRow('Data Sharing for Analytics', 'dataSharing', '📈')}
          {renderSettingRow('Blocked Users', '2 users', () => {}, '🚫')}

          {/* Appearance */}
          {renderSection('APPEARANCE')}
          {renderSettingRow('Theme', 'Dark', () => {
            Alert.alert('Theme', 'Theme options: Dark, Light, Auto (Coming Soon)');
          }, '🎨')}
          {renderSettingRow('Language', 'English', () => {
            Alert.alert('Language', 'Language selection (Coming Soon)');
          }, '🌍')}

          {/* Storage & Data */}
          {renderSection('STORAGE & DATA')}
          {renderSettingRow('Download Quality', 'High', () => {
            Alert.alert('Download Quality', 'Select quality: Low, Medium, High (Coming Soon)');
          }, '💾')}
          {renderToggleRow('Auto-Download', 'autoDownload', '⬇️')}
          {renderSettingRow('Clear Cache', '42.3 MB', handleClearCache, '🗑️')}
          {renderSettingRow('Manage Downloads', '', () => {}, '📥')}

          {/* Payment & Billing */}
          {renderSection('PAYMENT & BILLING')}
          {renderSettingRow('Payment Methods', '', () => {}, '💳')}
          {renderSettingRow('Billing History', '', () => {}, '📄')}
          {renderSettingRow('Subscription', 'Free Plan', () => {}, '⭐')}

          {/* Help & Support */}
          {renderSection('HELP & SUPPORT')}
          {renderSettingRow('Help Center', '', () => {}, '❓')}
          {renderSettingRow('Contact Support', '', handleContactSupport, '📞')}
          {renderSettingRow('Send Feedback', '', handleSendFeedback, '💭')}
          {renderSettingRow('Report a Bug', '', () => {}, '🐛')}

          {/* Legal */}
          {renderSection('LEGAL')}
          {renderSettingRow('Terms of Service', '', () => {}, '📜')}
          {renderSettingRow('Privacy Policy', '', () => {}, '🔒')}
          {renderSettingRow('Community Guidelines', '', () => {}, '📋')}
          {renderSettingRow('Licenses', '', () => {}, '⚖️')}

          {/* About */}
          {renderSection('ABOUT')}
          {renderSettingRow('App Version', '1.0.0', () => {}, 'ℹ️', false)}
          {renderSettingRow('Check for Updates', '', () => {
            Alert.alert('Up to Date', 'You have the latest version of Booth 33');
          }, '🔄')}
          {renderSettingRow('Rate Booth 33', '', () => {}, '⭐')}

          {/* Danger Zone */}
          {renderSection('DANGER ZONE')}
          <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteAccount}>
            <Text style={styles.dangerButtonText}>🗑️  Delete Account</Text>
          </TouchableOpacity>

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
    flex: 1,
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginRight: 40,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#8B5CF6',
    letterSpacing: 1,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 15,
    color: '#888',
    marginRight: 8,
  },
  settingArrow: {
    fontSize: 24,
    color: '#444',
  },
  dangerButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(239, 68, 68, 0.5)',
    paddingVertical: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
  },
});
