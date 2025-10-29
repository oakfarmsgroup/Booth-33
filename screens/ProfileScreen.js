import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Modal, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Vibration } from 'react-native';
import { useCredits } from '../contexts/CreditsContext';
import { usePayment } from '../contexts/PaymentContext';
import { useTier } from '../contexts/TierContext';
import { darkenColor } from '../data/tierSystem';

export default function ProfileScreen({ onLogout }) {
  const { credits, getTransactionHistory, getTotalGranted, getTotalUsed } = useCredits();
  const { paymentMethods, addPaymentMethod, removePaymentMethod, setDefaultPaymentMethod, getPaymentHistory } = usePayment();
  const { currentTier, nextTier, progress, userStats, getTierProgress, TIERS } = useTier();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [showPaymentMethodsModal, setShowPaymentMethodsModal] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showPaymentHistoryModal, setShowPaymentHistoryModal] = useState(false);
  const [showTierModal, setShowTierModal] = useState(false);
  
  // User profile data (will come from backend later)
  const [profile, setProfile] = useState({
    name: 'Alex Rivera',
    username: 'alexrivera',
    bio: 'Music producer & content creator\n📍 Los Angeles, CA\n🎵 Making beats & vibes',
    postsCount: 12,
    followersCount: 847,
    followingCount: 234,
    sessionsCount: 8,
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: profile.name,
    username: profile.username,
    bio: profile.bio,
  });

  // Settings state
  const [settings, setSettings] = useState({
    notifications: true,
    emailNotifications: true,
    publicProfile: true,
    showSessionHistory: true,
  });

  // Add Card Form state
  const [cardForm, setCardForm] = useState({
    holderName: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
  });

  const handleSaveProfile = () => {
    setProfile({
      ...profile,
      name: editForm.name,
      username: editForm.username,
      bio: editForm.bio,
    });
    setShowEditModal(false);
    Alert.alert('Success!', 'Profile updated successfully');
  };

  const handleChangeAvatar = () => {
    // Will add real image picker later
    Alert.alert('Change Avatar', 'Image picker will open here to select a new profile photo');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            if (onLogout) {
              onLogout(); // Call the logout function passed from App.js
            } else {
              Alert.alert('Logged Out', 'You have been logged out');
            }
          },
        },
      ]
    );
  };

  const toggleSetting = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  // Payment Method Handlers
  const handleAddCard = () => {
    const result = addPaymentMethod(cardForm);
    if (result.success) {
      Alert.alert('Success!', 'Payment method added successfully');
      setCardForm({
        holderName: '',
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
      });
      setShowAddCardModal(false);
    } else {
      Alert.alert('Error', result.message);
    }
  };

  const handleRemoveCard = (cardId) => {
    Alert.alert(
      'Remove Card',
      'Are you sure you want to remove this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const result = removePaymentMethod(cardId);
            if (result.success) {
              Alert.alert('Removed', 'Payment method removed successfully');
            } else {
              Alert.alert('Error', result.message);
            }
          },
        },
      ]
    );
  };

  const handleSetDefaultCard = (cardId) => {
    setDefaultPaymentMethod(cardId);
    Alert.alert('Success', 'Default payment method updated');
  };

  const formatCardNumber = (text) => {
    // Remove non-digits
    const cleaned = text.replace(/\D/g, '');
    // Add space every 4 digits
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.slice(0, 19); // Max 16 digits + 3 spaces
  };

  // Safe brand emoji helper (avoids broken string literals)
  const getBrandEmoji = (brand) => {
    const b = (brand || '').toLowerCase();
    if (b === 'visa') return '💳';
    if (b === 'mastercard') return '💳';
    if (b === 'amex') return '💳';
    if (b === 'discover') return '💳';
    return '💳';
  };

  const getCardBrandEmoji = (brand) => {
    switch (brand.toLowerCase()) {
      case 'visa': return '💳';
      case 'mastercard': return '💳';
      case 'amex': return '💳';
      case 'discover': return '💳';
      default: return '💳';
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F0F0F', '#1A0F2E', '#0F0F0F']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity onPress={() => setShowSettingsModal(true)}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Profile Info */}
          <View style={styles.profileSection}>
            {/* Avatar with Edit Button */}
            <TouchableOpacity onPress={handleChangeAvatar}>
              <View style={styles.avatarGlow}>
                <View style={styles.avatarContainer}>
                  <Image
                    source={require('../assets/images/Artist.png')}
                    style={styles.avatar}
                    resizeMode="cover"
                  />
                  <View style={styles.avatarEditBadge}>
                    <Text style={styles.avatarEditIcon}>📷</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            <Text style={styles.name}>{profile.name}</Text>
            <Text style={styles.username}>@{profile.username}</Text>
            
            {/* Stats */}
            <View style={styles.stats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{profile.postsCount}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{profile.followersCount}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{profile.followingCount}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
            </View>

            {/* Edit Profile Button */}
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => setShowEditModal(true)}
            >
              <LinearGradient
                colors={['#8B5CF6', '#EC4899']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.editButtonGradient}
              >
                <Text style={styles.editButtonText}>EDIT PROFILE</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Bio Section */}
          <View style={styles.bioSection}>
            <Text style={styles.bioTitle}>About</Text>
            <Text style={styles.bioText}>{profile.bio}</Text>
          </View>

          {/* Credits Card */}
          <TouchableOpacity
            style={styles.creditsContainer}
            onPress={() => setShowCreditsModal(true)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.creditsGradient}
            >
              <View style={styles.creditsHeader}>
                <View>
                  <Text style={styles.creditsLabel}>💳 Studio Credits</Text>
                  <Text style={styles.creditsBalance}>${credits.toFixed(2)}</Text>
                  <Text style={styles.creditsSubtext}>Available balance</Text>
                </View>
                <View style={styles.creditsIcon}>
                  <Text style={styles.creditsIconText}>→</Text>
                </View>
              </View>

              <View style={styles.creditsStats}>
                <View style={styles.creditsStat}>
                  <Text style={styles.creditsStatValue}>${getTotalGranted().toFixed(0)}</Text>
                  <Text style={styles.creditsStatLabel}>Total Granted</Text>
                </View>
                <View style={styles.creditsStatDivider} />
                <View style={styles.creditsStat}>
                  <Text style={styles.creditsStatValue}>${getTotalUsed().toFixed(0)}</Text>
                  <Text style={styles.creditsStatLabel}>Total Used</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Activity Stats */}
          <View style={styles.activitySection}>
            <Text style={styles.sectionTitle}>Activity</Text>
            
            <View style={styles.activityCard}>
              <View style={styles.activityItem}>
                <Text style={styles.activityIcon}>🎵</Text>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityLabel}>Music Sessions</Text>
                  <Text style={styles.activityValue}>{profile.sessionsCount} completed</Text>
                </View>
              </View>

              <View style={styles.activityItem}>
                <Text style={styles.activityIcon}>📅</Text>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityLabel}>Next Booking</Text>
                  <Text style={styles.activityValue}>Oct 28, 2025 • 3:00 PM</Text>
                </View>
              </View>

              <View style={styles.activityItem}>
                <Text style={styles.activityIcon}>⭐</Text>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityLabel}>Member Since</Text>
                  <Text style={styles.activityValue}>August 2025</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Tier Status Section */}
          <View style={styles.tierSection}>
            <Text style={styles.sectionTitle}>Membership Tier</Text>

            <TouchableOpacity
              style={styles.tierCard}
              onPress={() => {
                Vibration.vibrate(10);
                setShowTierModal(true);
              }}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[currentTier.color, darkenColor(currentTier.color)]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.tierGradient}
              >
                <Text style={styles.tierEmoji}>{currentTier.emoji}</Text>
                <Text style={styles.tierName}>{currentTier.name} Member</Text>

                {/* Progress to next tier */}
                <View style={styles.tierProgress}>
                  {(() => {
                    const nt = nextTier;
                    const p = nt ? getTierProgress(userStats, nt.key).percent : 100;
                    const label = nt ? `${p}% to ${nt.name}` : 'Top Tier Achieved';
                    return (
                      <>
                        <Text style={styles.tierProgressText}>{label}</Text>
                        <View style={styles.progressBarContainer}>
                          <View style={[styles.progressBarFill, { width: `${p}%` }]} />
                        </View>
                      </>
                    );
                  })()}
                </View>

                {/* Requirements breakdown */}
                {nextTier && (
                  <View style={styles.requirementsList}>
                    {Object.keys(nextTier.requirements).map((key) => {
                      const have = userStats[key] ?? 0;
                      const need = nextTier.requirements[key];
                      const pct = need === 0 ? 100 : Math.min(100, Math.round((have / need) * 100));
                      const label = key
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, (s) => s.toUpperCase());
                      return (
                        <View key={key} style={styles.requirementRow}>
                          <Text style={styles.requirementLabel}>{label}</Text>
                          <View style={styles.requirementBar}>
                            <View style={[styles.requirementBarFill, { width: `${pct}%` }]} />
                          </View>
                          <Text style={styles.requirementPct}>{pct}%</Text>
                        </View>
                      );
                    })}
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <View style={styles.actionsSection}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            
            <TouchableOpacity style={styles.actionItem}>
              <Text style={styles.actionIcon}>📚</Text>
              <Text style={styles.actionText}>My Library</Text>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem}>
              <Text style={styles.actionIcon}>📅</Text>
              <Text style={styles.actionText}>Booking History</Text>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => setShowPaymentMethodsModal(true)}
            >
              <Text style={styles.actionIcon}>💳</Text>
              <Text style={styles.actionText}>Payment Methods</Text>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => setShowPaymentHistoryModal(true)}
            >
              <Text style={styles.actionIcon}>💰</Text>
              <Text style={styles.actionText}>Payment History</Text>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem}>
              <Text style={styles.actionIcon}>❓</Text>
              <Text style={styles.actionText}>Help & Support</Text>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Logout Button */}
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Edit Profile Modal */}
        <Modal
          visible={showEditModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowEditModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowEditModal(false)}>
                  <Text style={styles.modalCancel}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={handleSaveProfile}>
                  <Text style={styles.modalSave}>Save</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Name</Text>
                  <TextInput
                    style={styles.formInput}
                    value={editForm.name}
                    onChangeText={(text) => setEditForm({ ...editForm, name: text })}
                    placeholder="Your name"
                    placeholderTextColor="#666"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Username</Text>
                  <TextInput
                    style={styles.formInput}
                    value={editForm.username}
                    onChangeText={(text) => setEditForm({ ...editForm, username: text })}
                    placeholder="username"
                    placeholderTextColor="#666"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Bio</Text>
                  <TextInput
                    style={[styles.formInput, styles.formTextArea]}
                    value={editForm.bio}
                    onChangeText={(text) => setEditForm({ ...editForm, bio: text })}
                    placeholder="Tell us about yourself"
                    placeholderTextColor="#666"
                    multiline
                    numberOfLines={5}
                    textAlignVertical="top"
                  />
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Credits History Modal */}
        <Modal
          visible={showCreditsModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowCreditsModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.creditsModalHeader}
              >
                <View>
                  <Text style={styles.creditsModalTitle}>💳 Studio Credits</Text>
                  <Text style={styles.creditsModalBalance}>${credits.toFixed(2)}</Text>
                </View>
                <TouchableOpacity onPress={() => setShowCreditsModal(false)}>
                  <Text style={styles.modalCloseButton}>✕</Text>
                </TouchableOpacity>
              </LinearGradient>

              <ScrollView style={styles.modalScroll}>
                <Text style={styles.transactionTitle}>Transaction History</Text>

                {getTransactionHistory().length === 0 ? (
                  <View style={styles.emptyTransactions}>
                    <Text style={styles.emptyTransactionsIcon}>📋</Text>
                    <Text style={styles.emptyTransactionsText}>No transactions yet</Text>
                  </View>
                ) : (
                  getTransactionHistory().map((transaction) => (
                    <View key={transaction.id} style={styles.transactionCard}>
                      <View style={styles.transactionHeader}>
                        <View style={[
                          styles.transactionIcon,
                          transaction.type === 'granted' ? styles.transactionIconGranted : styles.transactionIconUsed
                        ]}>
                          <Text style={styles.transactionIconText}>
                            {transaction.type === 'granted' ? '↓' : '↑'}
                          </Text>
                        </View>
                        <View style={styles.transactionInfo}>
                          <Text style={styles.transactionDescription}>{transaction.description}</Text>
                          <Text style={styles.transactionDate}>
                            {new Date(transaction.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </Text>
                          {transaction.type === 'granted' && transaction.grantedBy && (
                            <Text style={styles.transactionGrantedBy}>
                              Granted by: {transaction.grantedBy}
                            </Text>
                          )}
                        </View>
                        <Text style={[
                          styles.transactionAmount,
                          transaction.type === 'granted' ? styles.transactionAmountGranted : styles.transactionAmountUsed
                        ]}>
                          {transaction.type === 'granted' ? '+' : '-'}${transaction.amount.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  ))
                )}

                <View style={{ height: 40 }} />
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Settings Modal */}
        <Modal
          visible={showSettingsModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowSettingsModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={{ width: 60 }} />
                <Text style={styles.modalTitle}>Settings</Text>
                <TouchableOpacity onPress={() => setShowSettingsModal(false)}>
                  <Text style={styles.modalCancel}>Done</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.settingsSection}>
                  <Text style={styles.settingsSectionTitle}>Notifications</Text>
                  
                  <View style={styles.settingItem}>
                    <View style={styles.settingInfo}>
                      <Text style={styles.settingLabel}>Push Notifications</Text>
                      <Text style={styles.settingDesc}>Get notified about bookings</Text>
                    </View>
                    <TouchableOpacity 
                      style={[styles.toggle, settings.notifications && styles.toggleActive]}
                      onPress={() => toggleSetting('notifications')}
                    >
                      <View style={[styles.toggleCircle, settings.notifications && styles.toggleCircleActive]} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.settingItem}>
                    <View style={styles.settingInfo}>
                      <Text style={styles.settingLabel}>Email Notifications</Text>
                      <Text style={styles.settingDesc}>Receive updates via email</Text>
                    </View>
                    <TouchableOpacity 
                      style={[styles.toggle, settings.emailNotifications && styles.toggleActive]}
                      onPress={() => toggleSetting('emailNotifications')}
                    >
                      <View style={[styles.toggleCircle, settings.emailNotifications && styles.toggleCircleActive]} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.settingsSection}>
                  <Text style={styles.settingsSectionTitle}>Privacy</Text>
                  
                  <View style={styles.settingItem}>
                    <View style={styles.settingInfo}>
                      <Text style={styles.settingLabel}>Public Profile</Text>
                      <Text style={styles.settingDesc}>Anyone can see your profile</Text>
                    </View>
                    <TouchableOpacity 
                      style={[styles.toggle, settings.publicProfile && styles.toggleActive]}
                      onPress={() => toggleSetting('publicProfile')}
                    >
                      <View style={[styles.toggleCircle, settings.publicProfile && styles.toggleCircleActive]} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.settingItem}>
                    <View style={styles.settingInfo}>
                      <Text style={styles.settingLabel}>Show Session History</Text>
                      <Text style={styles.settingDesc}>Display on your profile</Text>
                    </View>
                    <TouchableOpacity 
                      style={[styles.toggle, settings.showSessionHistory && styles.toggleActive]}
                      onPress={() => toggleSetting('showSessionHistory')}
                    >
                      <View style={[styles.toggleCircle, settings.showSessionHistory && styles.toggleCircleActive]} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.settingsSection}>
                  <Text style={styles.settingsSectionTitle}>About</Text>
                  
                  <TouchableOpacity style={styles.settingItem}>
                    <View style={styles.settingInfo}>
                      <Text style={styles.settingLabel}>Terms of Service</Text>
                    </View>
                    <Text style={styles.settingArrow}>›</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.settingItem}>
                    <View style={styles.settingInfo}>
                      <Text style={styles.settingLabel}>Privacy Policy</Text>
                    </View>
                    <Text style={styles.settingArrow}>›</Text>
                  </TouchableOpacity>

                  <View style={styles.settingItem}>
                    <View style={styles.settingInfo}>
                      <Text style={styles.settingLabel}>Version</Text>
                    </View>
                    <Text style={styles.settingValue}>1.0.0</Text>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Payment Methods Modal */}
        <Modal
          visible={showPaymentMethodsModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowPaymentMethodsModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={{ width: 60 }} />
                <Text style={styles.modalTitle}>💳 Payment Methods</Text>
                <TouchableOpacity onPress={() => setShowPaymentMethodsModal(false)}>
                  <Text style={styles.modalCancel}>Done</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Saved Cards */}
                {paymentMethods.length > 0 ? (
                  <View style={styles.paymentMethodsList}>
                    {paymentMethods.map((method) => (
                      <View key={method.id} style={styles.paymentMethodCard}>
                        <View style={styles.cardHeader}>
                          <View style={styles.cardInfo}>
                            <Text style={styles.cardEmoji}>{getBrandEmoji(method.brand)}</Text>
                            <View>
                              <Text style={styles.cardBrand}>
                                {method.brand.toUpperCase()} •••• {method.last4}
                              </Text>
                              <Text style={styles.cardExpiry}>
                                Expires {String(method.expiryMonth).padStart(2, '0')}/{method.expiryYear}
                              </Text>
                              <Text style={styles.cardHolder}>{method.holderName}</Text>
                            </View>
                          </View>
                          {method.isDefault && (
                            <View style={styles.defaultBadge}>
                              <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                            </View>
                          )}
                        </View>

                        {/* Card Actions */}
                        <View style={styles.cardActions}>
                          {!method.isDefault && (
                            <TouchableOpacity
                              onPress={() => handleSetDefaultCard(method.id)}
                              style={styles.cardActionButton}
                            >
                              <Text style={styles.cardActionText}>Set as Default</Text>
                            </TouchableOpacity>
                          )}
                          <TouchableOpacity
                            onPress={() => handleRemoveCard(method.id)}
                            style={[styles.cardActionButton, styles.cardActionButtonDanger]}
                          >
                            <Text style={[styles.cardActionText, styles.cardActionTextDanger]}>
                              Remove
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.noCardsContainer}>
                    <Text style={styles.noCardsEmoji}>💳</Text>
                    <Text style={styles.noCardsText}>No payment methods added yet</Text>
                    <Text style={styles.noCardsSubtext}>Add a card to make bookings easier</Text>
                  </View>
                )}

                {/* Add Card Button */}
                <TouchableOpacity
                  onPress={() => {
                    setShowPaymentMethodsModal(false);
                    setShowAddCardModal(true);
                  }}
                  style={styles.addCardButtonContainer}
                >
                  <LinearGradient
                    colors={['#8B5CF6', '#6D28D9']}
                    style={styles.addCardButton}
                  >
                    <Text style={styles.addCardButtonText}>+ Add New Card</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Add Card Modal */}
        <Modal
          visible={showAddCardModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowAddCardModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={{ width: 60 }} />
                <Text style={styles.modalTitle}>Add Payment Method</Text>
                <TouchableOpacity onPress={() => setShowAddCardModal(false)}>
                  <Text style={styles.modalCancel}>Cancel</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.formSection}>
                  {/* Card Holder Name */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Cardholder Name</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="John Doe"
                      placeholderTextColor="#666"
                      value={cardForm.holderName}
                      onChangeText={(text) => setCardForm({ ...cardForm, holderName: text })}
                    />
                  </View>

                  {/* Card Number */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Card Number</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="1234 5678 9012 3456"
                      placeholderTextColor="#666"
                      keyboardType="numeric"
                      maxLength={19}
                      value={cardForm.cardNumber}
                      onChangeText={(text) =>
                        setCardForm({ ...cardForm, cardNumber: formatCardNumber(text) })
                      }
                    />
                  </View>

                  {/* Expiry and CVV Row */}
                  <View style={styles.inputRow}>
                    {/* Expiry Month */}
                    <View style={[styles.inputGroup, styles.inputHalf]}>
                      <Text style={styles.inputLabel}>Month</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="MM"
                        placeholderTextColor="#666"
                        keyboardType="numeric"
                        maxLength={2}
                        value={cardForm.expiryMonth}
                        onChangeText={(text) =>
                          setCardForm({ ...cardForm, expiryMonth: text.replace(/\D/g, '') })
                        }
                      />
                    </View>

                    {/* Expiry Year */}
                    <View style={[styles.inputGroup, styles.inputHalf]}>
                      <Text style={styles.inputLabel}>Year</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="YYYY"
                        placeholderTextColor="#666"
                        keyboardType="numeric"
                        maxLength={4}
                        value={cardForm.expiryYear}
                        onChangeText={(text) =>
                          setCardForm({ ...cardForm, expiryYear: text.replace(/\D/g, '') })
                        }
                      />
                    </View>
                  </View>

                  {/* CVV */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>CVV</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="123"
                      placeholderTextColor="#666"
                      keyboardType="numeric"
                      maxLength={4}
                      secureTextEntry={true}
                      value={cardForm.cvv}
                      onChangeText={(text) =>
                        setCardForm({ ...cardForm, cvv: text.replace(/\D/g, '') })
                      }
                    />
                  </View>

                  {/* Test Card Info */}
                  <View style={styles.testCardInfo}>
                    <Text style={styles.testCardTitle}>💡 Test Card</Text>
                    <Text style={styles.testCardText}>
                      Use card number starting with 4 for Visa, 5 for Mastercard
                    </Text>
                  </View>

                  {/* Add Card Button */}
                  <TouchableOpacity onPress={handleAddCard} style={styles.saveButtonContainer}>
                    <LinearGradient
                      colors={['#8B5CF6', '#6D28D9']}
                      style={styles.saveButton}
                    >
                      <Text style={styles.saveButtonText}>Add Card</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Payment History Modal */}
        <Modal
          visible={showPaymentHistoryModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowPaymentHistoryModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={{ width: 60 }} />
                <Text style={styles.modalTitle}>💰 Payment History</Text>
                <TouchableOpacity onPress={() => setShowPaymentHistoryModal(false)}>
                  <Text style={styles.modalCancel}>Done</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {getPaymentHistory().length > 0 ? (
                  <View style={styles.paymentHistoryList}>
                    {getPaymentHistory().map((transaction) => {
                      const paymentMethod = paymentMethods.find(pm => pm.id === transaction.paymentMethodId);
                      return (
                        <View key={transaction.id} style={styles.paymentHistoryCard}>
                          <View style={styles.paymentHistoryHeader}>
                            <View style={styles.paymentHistoryInfo}>
                              <Text style={styles.paymentHistoryDescription}>
                                {transaction.description}
                              </Text>
                              <Text style={styles.paymentHistoryDate}>
                                {new Date(transaction.date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: 'numeric',
                                  minute: '2-digit',
                                })}
                              </Text>
                              {paymentMethod && (
                                <Text style={styles.paymentHistoryCard}>
                                  {paymentMethod.brand.toUpperCase()} •••• {paymentMethod.last4}
                                </Text>
                              )}
                            </View>
                            <View style={styles.paymentHistoryAmount}>
                              <Text
                                style={[
                                  styles.paymentHistoryAmountText,
                                  transaction.status === 'completed' && styles.paymentHistoryAmountCompleted,
                                  transaction.status === 'failed' && styles.paymentHistoryAmountFailed,
                                  transaction.status === 'refunded' && styles.paymentHistoryAmountRefunded,
                                ]}
                              >
                                ${transaction.amount.toFixed(2)}
                              </Text>
                              <View
                                style={[
                                  styles.paymentHistoryStatusBadge,
                                  transaction.status === 'completed' && styles.statusCompleted,
                                  transaction.status === 'failed' && styles.statusFailed,
                                  transaction.status === 'refunded' && styles.statusRefunded,
                                  transaction.status === 'pending' && styles.statusPending,
                                ]}
                              >
                                <Text style={styles.paymentHistoryStatusText}>
                                  {transaction.status.toUpperCase()}
                                </Text>
                              </View>
                              {transaction.refundedAmount > 0 && (
                                <Text style={styles.paymentHistoryRefundText}>
                                  Refunded: ${transaction.refundedAmount.toFixed(2)}
                                </Text>
                              )}
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <View style={styles.noPaymentsContainer}>
                    <Text style={styles.noPaymentsEmoji}>💰</Text>
                    <Text style={styles.noPaymentsText}>No payment history yet</Text>
                    <Text style={styles.noPaymentsSubtext}>
                      Your completed bookings and payments will appear here
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        </LinearGradient>

        {/* Tier Info Modal */}
        <Modal
          visible={showTierModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowTierModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowTierModal(false)}>
                  <Text style={styles.modalCancel}>Close</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Membership Tiers</Text>
                <View style={{ width: 48 }} />
              </View>

              <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                {Object.keys(TIERS).map((key) => {
                  const t = TIERS[key];
                  const prog = getTierProgress(userStats, key).percent;
                  return (
                    <View key={key} style={styles.tierInfoCard}>
                      <View style={styles.tierInfoHeader}>
                        <Text style={styles.tierInfoEmoji}>{t.emoji}</Text>
                        <Text style={styles.tierInfoName}>{t.name}</Text>
                      </View>
                      <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBarFill, { width: `${prog}%` }]} />
                      </View>
                      <Text style={styles.tierInfoSubtitle}>Benefits</Text>
                      {t.benefits.map((b) => (
                        <Text key={b} style={styles.tierBenefit}>• {b}</Text>
                      ))}
                      <Text style={styles.tierInfoSubtitle}>Requirements</Text>
                      {Object.entries(t.requirements).map(([rk, rv]) => (
                        <Text key={rk} style={styles.tierReq}>
                          {rk.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}: {rv}
                        </Text>
                      ))}
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>
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
  settingsIcon: {
    fontSize: 24,
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  avatarGlow: {
    marginBottom: 20,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 40,
    elevation: 20,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#8B5CF6',
    overflow: 'hidden',
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#8B5CF6',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#0F0F0F',
  },
  avatarEditIcon: {
    fontSize: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: '#EC4899',
    marginBottom: 24,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 24,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 16,
    padding: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  editButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  editButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
  },
  bioSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  bioTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  bioText: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 22,
  },
  activitySection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  activityCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 16,
    padding: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  activityInfo: {
    flex: 1,
  },
  activityLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  activityValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  actionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionArrow: {
    fontSize: 24,
    color: '#666',
  },
  logoutButton: {
    marginHorizontal: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
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
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '85%',
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 92, 246, 0.3)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 92, 246, 0.2)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalCancel: {
    fontSize: 16,
    color: '#666',
  },
  modalSave: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  formTextArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  // Settings Styles
  settingsSection: {
    marginBottom: 32,
  },
  settingsSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8B5CF6',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 92, 246, 0.1)',
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
  settingDesc: {
    fontSize: 12,
    color: '#666',
  },
  settingArrow: {
    fontSize: 24,
    color: '#666',
  },
  settingValue: {
    fontSize: 14,
    color: '#666',
  },
  // Toggle Switch
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#8B5CF6',
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#666',
  },
  toggleCircleActive: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-end',
  },
  // Credits Card Styles
  creditsContainer: {
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  creditsGradient: {
    padding: 20,
  },
  creditsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  creditsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  creditsBalance: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  creditsSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  creditsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  creditsIconText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  creditsStats: {
    flexDirection: 'row',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  creditsStat: {
    flex: 1,
  },
  creditsStatValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  creditsStatLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  creditsStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 16,
  },
  // Credits Modal Styles
  creditsModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  creditsModalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  creditsModalBalance: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalCloseButton: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  transactionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  emptyTransactions: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTransactionsIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTransactionsText: {
    fontSize: 16,
    color: '#666',
  },
  transactionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionIconGranted: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  transactionIconUsed: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  transactionIconText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#999',
  },
  transactionGrantedBy: {
    fontSize: 11,
    color: '#10B981',
    marginTop: 4,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: '800',
  },
  transactionAmountGranted: {
    color: '#10B981',
  },
  transactionAmountUsed: {
    color: '#EF4444',
  },
  // Payment Methods Styles
  paymentMethodsList: {
    paddingHorizontal: 20,
  },
  paymentMethodCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  cardBrand: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardExpiry: {
    fontSize: 13,
    color: '#999',
    marginBottom: 2,
  },
  cardHolder: {
    fontSize: 12,
    color: '#666',
  },
  defaultBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8B5CF6',
    letterSpacing: 1,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  cardActionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 8,
    alignItems: 'center',
  },
  cardActionButtonDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  cardActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  cardActionTextDanger: {
    color: '#EF4444',
  },
  noCardsContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  noCardsEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  noCardsText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  noCardsSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  addCardButtonContainer: {
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 24,
  },
  addCardButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addCardButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Add Card Form Styles
  formSection: {
    paddingHorizontal: 20,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputHalf: {
    flex: 1,
  },
  testCardInfo: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  testCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8B5CF6',
    marginBottom: 6,
  },
  /* Tier styles */
  tierSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  tierCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  tierGradient: {
    padding: 20,
    alignItems: 'center',
  },
  tierEmoji: {
    fontSize: 42,
    marginBottom: 8,
  },
  tierName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  tierProgress: {
    width: '100%',
    marginBottom: 12,
  },
  tierProgressText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 6,
    textAlign: 'center',
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  requirementsList: {
    width: '100%',
    marginTop: 8,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementLabel: {
    width: 130,
    fontSize: 12,
    color: '#EEE',
  },
  requirementBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  requirementBarFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
  },
  requirementPct: {
    width: 40,
    textAlign: 'right',
    fontSize: 12,
    color: '#CCC',
  },
  tierInfoCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  tierInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tierInfoEmoji: { fontSize: 24, marginRight: 8 },
  tierInfoName: { color: '#FFF', fontWeight: '800', fontSize: 16 },
  tierInfoSubtitle: { color: '#8B5CF6', fontWeight: '700', marginTop: 10, marginBottom: 6 },
  tierBenefit: { color: '#EEE', fontSize: 12, marginBottom: 4 },
  tierReq: { color: '#AAA', fontSize: 12 },
  testCardText: {
    fontSize: 13,
    color: '#999',
    lineHeight: 18,
  },
  // Payment History Styles
  paymentHistoryList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  paymentHistoryCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  paymentHistoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentHistoryInfo: {
    flex: 1,
    marginRight: 12,
  },
  paymentHistoryDescription: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  paymentHistoryDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  paymentHistoryCardInfo: {
    fontSize: 11,
    color: '#666',
  },
  paymentHistoryAmount: {
    alignItems: 'flex-end',
  },
  paymentHistoryAmountText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  paymentHistoryAmountCompleted: {
    color: '#10B981',
  },
  paymentHistoryAmountFailed: {
    color: '#EF4444',
  },
  paymentHistoryAmountRefunded: {
    color: '#F59E0B',
  },
  paymentHistoryStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 4,
  },
  statusCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  statusFailed: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  statusRefunded: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  statusPending: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
  },
  paymentHistoryStatusText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  paymentHistoryRefundText: {
    fontSize: 11,
    color: '#F59E0B',
    fontWeight: '600',
  },
  noPaymentsContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  noPaymentsEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  noPaymentsText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  noPaymentsSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
