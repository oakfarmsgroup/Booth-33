import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useBookings } from '../contexts/BookingsContext';
import { useSessions } from '../contexts/SessionsContext';
import { getAllBookings, updateBookingStatus } from '../services/bookingsService';

export default function AdminBookingsScreen() {
  const { completeBooking } = useBookings();
  const { createSessionFromBooking, hasSessionForBooking } = useSessions();
  const [filter, setFilter] = useState('pending'); // 'pending', 'confirmed', 'completed', 'cancelled'
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load bookings from database
  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const result = await getAllBookings();
      if (result.success) {
        // Transform bookings to match expected format
        const transformedBookings = result.data.map(booking => ({
          id: booking.id,
          user: booking.profiles?.full_name || booking.profiles?.username || 'Unknown User',
          email: booking.profiles?.email || '',
          type: booking.session_type,
          date: new Date(booking.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }),
          time: booking.time,
          duration: `${booking.duration} hours`,
          price: booking.price,
          status: booking.status,
          notes: booking.notes || ''
        }));
        setBookings(transformedBookings);
      } else {
        console.error('Failed to load bookings:', result.error);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  const handleApprove = (booking) => {
    Alert.alert(
      'Approve Booking',
      `Confirm booking for ${booking.user}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            try {
              const result = await updateBookingStatus(booking.id, 'confirmed');
              if (result.success) {
                // Optimistically update UI
                setBookings(bookings.map(b =>
                  b.id === booking.id ? { ...b, status: 'confirmed' } : b
                ));
                Alert.alert('Success', 'Booking approved! User will be notified.');
              } else {
                Alert.alert('Error', result.error || 'Failed to approve booking');
              }
            } catch (error) {
              console.error('Error approving booking:', error);
              Alert.alert('Error', 'An unexpected error occurred');
            }
          },
        },
      ]
    );
  };

  const handleReject = (booking) => {
    Alert.alert(
      'Reject Booking',
      `Reject booking for ${booking.user}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await updateBookingStatus(booking.id, 'cancelled');
              if (result.success) {
                // Optimistically update UI
                setBookings(bookings.map(b =>
                  b.id === booking.id ? { ...b, status: 'cancelled' } : b
                ));
                Alert.alert('Rejected', 'Booking rejected. User will be notified.');
              } else {
                Alert.alert('Error', result.error || 'Failed to reject booking');
              }
            } catch (error) {
              console.error('Error rejecting booking:', error);
              Alert.alert('Error', 'An unexpected error occurred');
            }
          },
        },
      ]
    );
  };

  const handleComplete = (booking) => {
    // Check if session already exists for this booking
    if (hasSessionForBooking(booking.id)) {
      Alert.alert('Session Exists', 'A session has already been created for this booking.');
      return;
    }

    Alert.alert(
      'Complete Booking',
      `Mark booking for ${booking.user} as completed?\n\nThis will automatically create a draft session for file uploads.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            try {
              // Update booking status to completed
              const result = await updateBookingStatus(booking.id, 'completed');
              if (result.success) {
                // Update local state
                setBookings(bookings.map(b =>
                  b.id === booking.id ? { ...b, status: 'completed' } : b
                ));

                // Update context
                completeBooking(booking.id);

                // Auto-create session
                const session = createSessionFromBooking(booking);

                Alert.alert(
                  'Success',
                  `Booking completed!\n\nA draft session "${session.sessionName}" has been created. You can now upload files in the Sessions tab.`
                );
              } else {
                Alert.alert('Error', result.error || 'Failed to complete booking');
              }
            } catch (error) {
              console.error('Error completing booking:', error);
              Alert.alert('Error', 'An unexpected error occurred');
            }
          },
        },
      ]
    );
  };

  const filteredBookings = bookings.filter(b => b.status === filter);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return { bg: 'rgba(245, 158, 11, 0.2)', text: '#F59E0B' };
      case 'confirmed': return { bg: 'rgba(16, 185, 129, 0.2)', text: '#10B981' };
      case 'completed': return { bg: 'rgba(59, 130, 246, 0.2)', text: '#3B82F6' };
      case 'cancelled': return { bg: 'rgba(239, 68, 68, 0.2)', text: '#EF4444' };
      default: return { bg: 'rgba(255, 255, 255, 0.1)', text: '#666' };
    }
  };

  const getFilterCount = (status) => {
    return bookings.filter(b => b.status === status).length;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top','left','right']}>
      <LinearGradient
        colors={['#0F0F0F', '#1A0F2E', '#0F0F0F']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Bookings</Text>
          <View style={styles.totalBadge}>
            <Text style={styles.totalText}>{bookings.length} Total</Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContainer}
          contentInsetAdjustmentBehavior="never"
        >
          <TouchableOpacity 
            style={[styles.filterTab, filter === 'pending' && styles.filterTabActive]}
            onPress={() => setFilter('pending')}
          >
            <Text style={[styles.filterText, filter === 'pending' && styles.filterTextActive]}>
              Pending ({getFilterCount('pending')})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterTab, filter === 'confirmed' && styles.filterTabActive]}
            onPress={() => setFilter('confirmed')}
          >
            <Text style={[styles.filterText, filter === 'confirmed' && styles.filterTextActive]}>
              Confirmed ({getFilterCount('confirmed')})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterTab, filter === 'completed' && styles.filterTabActive]}
            onPress={() => setFilter('completed')}
          >
            <Text style={[styles.filterText, filter === 'completed' && styles.filterTextActive]}>
              Completed ({getFilterCount('completed')})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterTab, filter === 'cancelled' && styles.filterTabActive]}
            onPress={() => setFilter('cancelled')}
          >
            <Text style={[styles.filterText, filter === 'cancelled' && styles.filterTextActive]}>
              Cancelled ({getFilterCount('cancelled')})
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Bookings List */}
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="never"
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          {filteredBookings.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>No {filter} bookings</Text>
            </View>
          ) : (
            filteredBookings.map((booking) => {
              const statusColors = getStatusColor(booking.status);
              
              return (
                <View key={booking.id} style={styles.bookingCard}>
                  {/* Header */}
                  <View style={styles.bookingHeader}>
                    <View style={styles.bookingHeaderLeft}>
                      <Text style={styles.bookingIcon}>
                        {booking.type === 'music' ? '🎵' : '🎙️'}
                      </Text>
                      <View>
                        <Text style={styles.bookingUser}>{booking.user}</Text>
                        <Text style={styles.bookingEmail}>{booking.email}</Text>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                      <Text style={[styles.statusText, { color: statusColors.text }]}>
                        {booking.status}
                      </Text>
                    </View>
                  </View>

                  {/* Details */}
                  <View style={styles.bookingDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Type:</Text>
                      <Text style={styles.detailValue}>
                        {booking.type === 'music' ? 'Music Recording' : 'Podcast Recording'}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Date:</Text>
                      <Text style={styles.detailValue}>{booking.date}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Time:</Text>
                      <Text style={styles.detailValue}>{booking.time}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Duration:</Text>
                      <Text style={styles.detailValue}>{booking.duration}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Price:</Text>
                      <Text style={styles.detailValuePrice}>${booking.price}</Text>
                    </View>
                    {booking.notes && (
                      <View style={styles.notesContainer}>
                        <Text style={styles.notesLabel}>Notes:</Text>
                        <Text style={styles.notesText}>{booking.notes}</Text>
                      </View>
                    )}
                  </View>

                  {/* Actions (for pending bookings) */}
                  {booking.status === 'pending' && (
                    <View style={styles.actionsContainer}>
                      <TouchableOpacity
                        style={styles.rejectButton}
                        onPress={() => handleReject(booking)}
                      >
                        <Text style={styles.rejectButtonText}>Reject</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.approveButton}
                        onPress={() => handleApprove(booking)}
                      >
                        <LinearGradient
                          colors={['#10B981', '#059669']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.approveGradient}
                        >
                          <Text style={styles.approveButtonText}>Approve</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Actions (for confirmed bookings) */}
                  {booking.status === 'confirmed' && !hasSessionForBooking(booking.id) && (
                    <View style={styles.actionsContainer}>
                      <TouchableOpacity
                        style={styles.completeButton}
                        onPress={() => handleComplete(booking)}
                      >
                        <LinearGradient
                          colors={['#3B82F6', '#2563EB']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.completeGradient}
                        >
                          <Text style={styles.completeButtonText}>Mark Complete & Create Session</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Session already exists indicator */}
                  {booking.status === 'confirmed' && hasSessionForBooking(booking.id) && (
                    <View style={styles.sessionExistsContainer}>
                      <Text style={styles.sessionExistsText}>✓ Session created</Text>
                    </View>
                  )}
                </View>
              );
            })
          )}

          <View style={{ height: 40 }} />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  totalBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  totalText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F59E0B',
  },
  filterScroll: {
    marginBottom: 12,
    paddingVertical: 0,
    flexGrow: 0,
    maxHeight: 40,
  },
  filterContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  filterTab: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    minHeight: 34,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 999,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
  },
  filterTabActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  filterText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#888',
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
  bookingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(245, 158, 11, 0.1)',
  },
  bookingHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bookingIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  bookingUser: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  bookingEmail: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  bookingDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  detailValuePrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#10B981',
  },
  notesContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 8,
  },
  notesLabel: {
    fontSize: 12,
    color: '#F59E0B',
    marginBottom: 4,
    fontWeight: '600',
  },
  notesText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EF4444',
  },
  approveButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  approveGradient: {
    padding: 14,
    alignItems: 'center',
  },
  approveButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  completeButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  completeGradient: {
    padding: 14,
    alignItems: 'center',
  },
  completeButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sessionExistsContainer: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  sessionExistsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
});
