import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal, Alert, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useBookings } from '../contexts/BookingsContext';

export default function EventsScreen() {
  const { events, rsvpToEvent, unrsvpFromEvent, isUserRSVPd, getUpcomingEvents } = useBookings();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'open-mic', 'listening-party', 'workshop', 'private'
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate fetching new events
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const upcomingEvents = getUpcomingEvents();

  // Filter events
  const filteredEvents = filter === 'all'
    ? upcomingEvents
    : upcomingEvents.filter(event => event.type === filter);

  const getEventIcon = (type) => {
    switch (type) {
      case 'open-mic':
        return '🎤';
      case 'listening-party':
        return '🎧';
      case 'workshop':
        return '📚';
      case 'private':
        return '🎭';
      default:
        return '🎉';
    }
  };

  const getEventTypeLabel = (type) => {
    switch (type) {
      case 'open-mic':
        return 'Open Mic';
      case 'listening-party':
        return 'Listening Party';
      case 'workshop':
        return 'Workshop';
      case 'private':
        return 'Private Event';
      default:
        return 'Event';
    }
  };

  const handleRSVP = (event) => {
    const hasRSVPd = isUserRSVPd(event.id);

    if (hasRSVPd) {
      Alert.alert(
        'Cancel RSVP',
        `Cancel your RSVP for ${event.name}?`,
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Yes, Cancel',
            style: 'destructive',
            onPress: () => {
              unrsvpFromEvent(event.id);
              Alert.alert('RSVP Cancelled', `Your RSVP for ${event.name} has been cancelled.`);
            },
          },
        ]
      );
    } else {
      if (event.currentAttendees >= event.maxAttendees) {
        Alert.alert('Event Full', 'This event has reached maximum capacity.');
        return;
      }

      Alert.alert(
        'Confirm RSVP',
        `RSVP for ${event.name}?\n\n${new Date(event.date).toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric'
        })} at ${event.timeSlot}`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Confirm RSVP',
            onPress: () => {
              rsvpToEvent(event.id);
              Alert.alert('RSVP Confirmed!', `You're going to ${event.name}! See you there! 🎉`);
            },
          },
        ]
      );
    }
  };

  const openEventDetails = (event) => {
    setSelectedEvent(event);
    setShowDetailsModal(true);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F0F0F', '#1A0F2E', '#0F0F0F']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Events</Text>
          <View style={styles.eventsBadge}>
            <Text style={styles.eventsBadgeText}>{upcomingEvents.length} Upcoming</Text>
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
            style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
              All Events
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, filter === 'open-mic' && styles.filterTabActive]}
            onPress={() => setFilter('open-mic')}
          >
            <Text style={[styles.filterText, filter === 'open-mic' && styles.filterTextActive]}>
              🎤 Open Mic
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, filter === 'listening-party' && styles.filterTabActive]}
            onPress={() => setFilter('listening-party')}
          >
            <Text style={[styles.filterText, filter === 'listening-party' && styles.filterTextActive]}>
              🎧 Listening Party
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, filter === 'workshop' && styles.filterTabActive]}
            onPress={() => setFilter('workshop')}
          >
            <Text style={[styles.filterText, filter === 'workshop' && styles.filterTextActive]}>
              📚 Workshop
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Events List */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#F59E0B"
            />
          }
        >
          {filteredEvents.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>🎉</Text>
              <Text style={styles.emptyStateTitle}>No Events Available</Text>
              <Text style={styles.emptyStateText}>
                Check back soon for upcoming studio events, open mics, and workshops!
              </Text>
            </View>
          ) : (
            filteredEvents.map((event) => {
              const hasRSVPd = isUserRSVPd(event.id);
              const isFull = event.currentAttendees >= event.maxAttendees;
              const spotsLeft = event.maxAttendees - event.currentAttendees;

              return (
                <TouchableOpacity
                  key={event.id}
                  style={[styles.eventCard, hasRSVPd && styles.eventCardRSVPd]}
                  onPress={() => openEventDetails(event)}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={hasRSVPd ? ['#F59E0B', '#FBBF24'] : ['rgba(245, 158, 11, 0.2)', 'rgba(245, 158, 11, 0.05)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.eventCardGradient}
                  >
                    {/* RSVP Badge */}
                    {hasRSVPd && (
                      <View style={styles.rsvpdBadge}>
                        <Text style={styles.rsvpdBadgeText}>✓ YOU'RE GOING</Text>
                      </View>
                    )}

                    {/* Event Icon & Type */}
                    <View style={styles.eventHeader}>
                      <Text style={styles.eventIcon}>{getEventIcon(event.type)}</Text>
                      <View style={styles.eventTypeContainer}>
                        <Text style={[styles.eventType, hasRSVPd && styles.eventTypeRSVPd]}>
                          {getEventTypeLabel(event.type).toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    {/* Event Name */}
                    <Text style={[styles.eventName, hasRSVPd && styles.eventNameRSVPd]}>
                      {event.name}
                    </Text>

                    {/* Description */}
                    <Text style={[styles.eventDescription, hasRSVPd && styles.eventDescriptionRSVPd]} numberOfLines={2}>
                      {event.description}
                    </Text>

                    {/* Event Details */}
                    <View style={styles.eventDetails}>
                      <View style={styles.eventDetailRow}>
                        <Text style={[styles.eventDetailIcon, hasRSVPd && styles.eventDetailIconRSVPd]}>📅</Text>
                        <Text style={[styles.eventDetailText, hasRSVPd && styles.eventDetailTextRSVPd]}>
                          {new Date(event.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </Text>
                      </View>
                      <View style={styles.eventDetailRow}>
                        <Text style={[styles.eventDetailIcon, hasRSVPd && styles.eventDetailIconRSVPd]}>🕐</Text>
                        <Text style={[styles.eventDetailText, hasRSVPd && styles.eventDetailTextRSVPd]}>
                          {event.timeSlot}
                        </Text>
                      </View>
                      <View style={styles.eventDetailRow}>
                        <Text style={[styles.eventDetailIcon, hasRSVPd && styles.eventDetailIconRSVPd]}>👥</Text>
                        <Text style={[styles.eventDetailText, hasRSVPd && styles.eventDetailTextRSVPd]}>
                          {event.currentAttendees} / {event.maxAttendees}
                        </Text>
                      </View>
                    </View>

                    {/* Price & RSVP Button */}
                    <View style={styles.eventFooter}>
                      <Text style={[styles.eventPrice, hasRSVPd && styles.eventPriceRSVPd]}>
                        {event.price === 0 ? 'FREE' : `$${event.price}`}
                      </Text>

                      <TouchableOpacity
                        style={[
                          styles.rsvpButton,
                          hasRSVPd && styles.rsvpButtonActive,
                          isFull && !hasRSVPd && styles.rsvpButtonFull,
                        ]}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleRSVP(event);
                        }}
                      >
                        <Text style={[
                          styles.rsvpButtonText,
                          hasRSVPd && styles.rsvpButtonTextActive,
                          isFull && !hasRSVPd && styles.rsvpButtonTextFull,
                        ]}>
                          {hasRSVPd ? 'Cancel RSVP' : isFull ? 'Full' : 'RSVP'}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Spots Left Warning */}
                    {!hasRSVPd && spotsLeft <= 5 && spotsLeft > 0 && (
                      <Text style={styles.spotsLeftWarning}>Only {spotsLeft} spots left!</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              );
            })
          )}

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Event Details Modal */}
        <Modal
          visible={showDetailsModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowDetailsModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Event Details</Text>
                <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>

              {selectedEvent && (
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={styles.modalEventIcon}>
                    <Text style={styles.modalEventIconText}>{getEventIcon(selectedEvent.type)}</Text>
                  </View>

                  <Text style={styles.modalEventName}>{selectedEvent.name}</Text>
                  <Text style={styles.modalEventType}>{getEventTypeLabel(selectedEvent.type)}</Text>

                  <Text style={styles.modalEventDescription}>{selectedEvent.description}</Text>

                  <View style={styles.modalDetailsGrid}>
                    <View style={styles.modalDetailItem}>
                      <Text style={styles.modalDetailLabel}>Date</Text>
                      <Text style={styles.modalDetailValue}>
                        {new Date(selectedEvent.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </Text>
                    </View>

                    <View style={styles.modalDetailItem}>
                      <Text style={styles.modalDetailLabel}>Time</Text>
                      <Text style={styles.modalDetailValue}>{selectedEvent.timeSlot}</Text>
                    </View>

                    <View style={styles.modalDetailItem}>
                      <Text style={styles.modalDetailLabel}>Duration</Text>
                      <Text style={styles.modalDetailValue}>{selectedEvent.duration} hours</Text>
                    </View>

                    <View style={styles.modalDetailItem}>
                      <Text style={styles.modalDetailLabel}>Price</Text>
                      <Text style={styles.modalDetailValue}>
                        {selectedEvent.price === 0 ? 'FREE' : `$${selectedEvent.price}`}
                      </Text>
                    </View>

                    <View style={styles.modalDetailItem}>
                      <Text style={styles.modalDetailLabel}>Attendees</Text>
                      <Text style={styles.modalDetailValue}>
                        {selectedEvent.currentAttendees} / {selectedEvent.maxAttendees}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.modalRSVPButton}
                    onPress={() => {
                      handleRSVP(selectedEvent);
                      setShowDetailsModal(false);
                    }}
                  >
                    <LinearGradient
                      colors={isUserRSVPd(selectedEvent.id) ? ['#EF4444', '#DC2626'] : ['#F59E0B', '#D97706']}
                      style={styles.modalRSVPButtonGradient}
                    >
                      <Text style={styles.modalRSVPButtonText}>
                        {isUserRSVPd(selectedEvent.id) ? 'Cancel RSVP' : 'RSVP Now'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
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
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  eventsBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  eventsBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F59E0B',
  },
  filterScroll: {
    marginBottom: 16,
  },
  filterContainer: {
    paddingHorizontal: 20,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  filterTabActive: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
  },
  filterTextActive: {
    color: '#0F0F0F',
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  eventCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  eventCardRSVPd: {
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  eventCardGradient: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  rsvpdBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#0F0F0F',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  rsvpdBadgeText: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  eventTypeContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  eventType: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F59E0B',
    letterSpacing: 0.5,
  },
  eventTypeRSVPd: {
    color: '#0F0F0F',
  },
  eventName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  eventNameRSVPd: {
    color: '#0F0F0F',
  },
  eventDescription: {
    fontSize: 14,
    color: '#CCC',
    lineHeight: 20,
    marginBottom: 16,
  },
  eventDescriptionRSVPd: {
    color: '#0F0F0F',
  },
  eventDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventDetailIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  eventDetailIconRSVPd: {
    opacity: 0.8,
  },
  eventDetailText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  eventDetailTextRSVPd: {
    color: '#0F0F0F',
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventPrice: {
    fontSize: 20,
    fontWeight: '900',
    color: '#10B981',
  },
  eventPriceRSVPd: {
    color: '#0F0F0F',
  },
  rsvpButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  rsvpButtonActive: {
    backgroundColor: 'transparent',
    borderColor: '#0F0F0F',
  },
  rsvpButtonFull: {
    backgroundColor: '#666',
    borderColor: '#666',
  },
  rsvpButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F0F0F',
  },
  rsvpButtonTextActive: {
    color: '#0F0F0F',
  },
  rsvpButtonTextFull: {
    color: '#FFFFFF',
  },
  spotsLeftWarning: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    fontSize: 80,
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 24,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalClose: {
    fontSize: 24,
    color: '#888',
    fontWeight: '300',
  },
  modalEventIcon: {
    alignSelf: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalEventIconText: {
    fontSize: 40,
  },
  modalEventName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalEventType: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F59E0B',
    textAlign: 'center',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  modalEventDescription: {
    fontSize: 16,
    color: '#CCC',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalDetailsGrid: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  modalDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalDetailLabel: {
    fontSize: 14,
    color: '#888',
    fontWeight: '600',
  },
  modalDetailValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  modalRSVPButton: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  modalRSVPButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalRSVPButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F0F0F',
  },
});
