import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Modal, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useBookings } from '../contexts/BookingsContext';
import { useCredits } from '../contexts/CreditsContext';
import { usePayment } from '../contexts/PaymentContext';
import { useNotifications } from '../contexts/NotificationsContext';

export default function BookScreen() {
  const { addBooking, isTimeSlotBooked, getUpcomingBookings, getPastBookings, cancelBooking, getEventForTimeSlot, events, rsvpToEvent, unrsvpFromEvent, isUserRSVPd } = useBookings();
  const { credits, useCredits: applyCredits, calculateCreditUsage } = useCredits();
  const { processPayment, getDefaultPaymentMethod, paymentMethods } = usePayment();
  const { notifyPaymentSuccess, notifyPaymentFailed } = useNotifications();

  const [selectedType, setSelectedType] = useState('music'); // 'music' or 'podcast'
  const [selectedDate, setSelectedDate] = useState(0); // Index of selected date
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(2); // Default 2 hours
  const [bookingNotes, setBookingNotes] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showMyBookingsModal, setShowMyBookingsModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [tipsExpanded, setTipsExpanded] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Generate next 7 days
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    dates.push(date);
  }

  // Duration options with pricing
  const durationOptions = [
    { hours: 1, price: 60, label: '1 Hour' },
    { hours: 2, price: 120, label: '2 Hours' },
    { hours: 3, price: 180, label: '3 Hours' },
    { hours: 4, price: 250, label: '4 Hours' },
    { hours: 8, price: 500, label: 'Full Day (8hrs)' },
  ];

  // Get current price based on selected duration
  const getCurrentPrice = () => {
    const option = durationOptions.find(opt => opt.hours === selectedDuration);
    return option ? option.price : 120;
  };

  // Time slots from 9 AM to 9 PM
  const timeSlotsList = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
    '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM'
  ];

  // Generate time slots with availability based on bookings, events, and duration
  const timeSlots = timeSlotsList.map(time => {
    const selectedDateObj = dates[selectedDate];
    const event = getEventForTimeSlot(selectedDateObj, time);
    const isBooked = isTimeSlotBooked(selectedDateObj, time, selectedDuration);

    return {
      time,
      available: !isBooked,
      event: event, // If there's an event, store it
      isEvent: !!event, // Boolean flag
    };
  });

  const formatDate = (date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return {
      day: days[date.getDay()],
      date: date.getDate(),
      month: months[date.getMonth()],
    };
  };

  const handleBooking = async () => {
    if (!selectedTimeSlot) {
      alert('Please select a time slot');
      return;
    }

    const fullPrice = getCurrentPrice();
    const creditCalc = calculateCreditUsage(fullPrice);
    const remainingBalance = creditCalc.remainingPrice;

    // Check if payment method is needed and available
    if (remainingBalance > 0) {
      const defaultCard = getDefaultPaymentMethod();
      if (!defaultCard) {
        Alert.alert(
          'No Payment Method',
          'Please add a payment method in your profile to complete this booking.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Add Card', onPress: () => {
              // Navigate to profile (for now just show message)
              Alert.alert('Info', 'Go to Profile > Payment Methods to add a card');
            }},
          ]
        );
        return;
      }
    }

    setIsProcessingPayment(true);

    try {
      // Create booking
      const booking = {
        type: selectedType,
        date: dates[selectedDate],
        timeSlot: selectedTimeSlot,
        duration: selectedDuration,
        price: fullPrice,
        notes: bookingNotes,
      };

      const newBooking = addBooking(booking);

      // Apply credits if available
      if (creditCalc.creditsToUse > 0) {
        const result = applyCredits(
          creditCalc.creditsToUse,
          newBooking.id,
          `Studio booking - ${selectedDuration}h ${selectedType} session`
        );

        if (!result.success) {
          Alert.alert('Error', result.message);
          setIsProcessingPayment(false);
          return;
        }
      }

      // Process payment if there's remaining balance
      let paymentTransaction = null;
      if (remainingBalance > 0) {
        const paymentResult = await processPayment(
          remainingBalance,
          newBooking.id,
          `${selectedType.toUpperCase()} Session - ${selectedDuration}h`
        );

        if (!paymentResult.success) {
          // Notify payment failure
          notifyPaymentFailed(remainingBalance, `${selectedType} session`);

          Alert.alert(
            'Payment Failed',
            paymentResult.message || 'Unable to process payment. Please try another card.',
            [{ text: 'OK' }]
          );
          setIsProcessingPayment(false);
          return;
        }

        paymentTransaction = paymentResult.transaction;

        // Notify payment success
        notifyPaymentSuccess(remainingBalance, `${selectedType} session`);
      }

      // Store booking details for modal (including credit and payment info)
      const details = {
        type: selectedType,
        date: `${formatDate(dates[selectedDate]).day}, ${formatDate(dates[selectedDate]).month} ${formatDate(dates[selectedDate]).date}`,
        time: selectedTimeSlot,
        duration: selectedDuration,
        price: fullPrice,
        creditsApplied: creditCalc.creditsToUse,
        finalPrice: remainingBalance,
        paymentProcessed: remainingBalance > 0,
        paymentTransaction: paymentTransaction,
        notes: bookingNotes,
      };

      setBookingDetails(details);
      setIsProcessingPayment(false);
      setShowSuccessModal(true);

      // Reset form after showing modal
      setTimeout(() => {
        setSelectedTimeSlot(null);
        setBookingNotes('');
        setSelectedDuration(2);
      }, 1000);
    } catch (error) {
      setIsProcessingPayment(false);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
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
          <Text style={styles.headerTitle}>Book Studio</Text>
          <TouchableOpacity
            style={styles.myBookingsButton}
            onPress={() => setShowMyBookingsModal(true)}
          >
            <View style={styles.myBookingsIcon}>
              <Text style={styles.myBookingsIconText}>📅</Text>
            </View>
            <Text style={styles.myBookingsText}>My Bookings</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Session Type Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, selectedType === 'music' && styles.tabActive]}
              onPress={() => setSelectedType('music')}
            >
              <Text style={[styles.tabText, selectedType === 'music' && styles.tabTextActive]}>
                🎵 Music
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, selectedType === 'podcast' && styles.tabActive]}
              onPress={() => setSelectedType('podcast')}
            >
              <Text style={[styles.tabText, selectedType === 'podcast' && styles.tabTextActive]}>
                🎙️ Podcast
              </Text>
            </TouchableOpacity>
          </View>

          {/* Pro Tips Card */}
          <TouchableOpacity 
            style={styles.tipsCard}
            onPress={() => setTipsExpanded(!tipsExpanded)}
            activeOpacity={0.8}
          >
            <View style={styles.tipsHeader}>
              <View style={styles.tipsHeaderLeft}>
                <Text style={styles.tipsIcon}>💡</Text>
                <Text style={styles.tipsTitle}>
                  {selectedType === 'music' ? 'Music Session Tips' : 'Podcast Session Tips'}
                </Text>
              </View>
              <Text style={styles.tipsToggle}>{tipsExpanded ? '−' : '+'}</Text>
            </View>
            
            {tipsExpanded && (
              <View style={styles.tipsContent}>
                {selectedType === 'music' ? (
                  <>
                    <Text style={styles.tipsText}>
                      <Text style={styles.tipsBold}>Come prepared!</Text> Have your beat selected and ready to roll. 
                      Trust us, scrolling through 47 "fire" beats while the clock's ticking isn't the vibe. 🔥
                    </Text>
                    <Text style={styles.tipsText}>
                      <Text style={styles.tipsBold}>Know your lyrics.</Text> We're here to capture magic, not watch you 
                      freestyle writer's block. Bring a notepad, your phone, or telepathic skills—your choice.
                    </Text>
                    <Text style={styles.tipsText}>
                      <Text style={styles.tipsBold}>Warm up those vocals.</Text> Hit some scales in the car. Your throat 
                      will thank you, and so will our ears. 🎤
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.tipsText}>
                      <Text style={styles.tipsBold}>Have a topic & outline ready.</Text> "Let's just wing it" 
                      rarely ends in podcast gold. Come with a game plan, even if it's on a napkin. 📝
                    </Text>
                    <Text style={styles.tipsText}>
                      <Text style={styles.tipsBold}>Script the intro & outro.</Text> These bookends matter. 
                      Know how you're starting and ending—awkward silences aren't "dramatic pauses."
                    </Text>
                    <Text style={styles.tipsText}>
                      <Text style={styles.tipsBold}>Prep your questions.</Text> If you're interviewing someone, 
                      bring more questions than you think you need. Dead air is the enemy. 🎙️
                    </Text>
                    <Text style={styles.tipsText}>
                      <Text style={styles.tipsBold}>Check your energy.</Text> Coffee? Water? Whatever fuels you—
                      bring it. Long recording sessions require stamina!
                    </Text>
                  </>
                )}
              </View>
            )}
          </TouchableOpacity>

          {/* Date Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
              {dates.map((date, index) => {
                const formatted = formatDate(date);
                const isSelected = selectedDate === index;
                const isToday = index === 0;
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.dateCard, isSelected && styles.dateCardSelected]}
                    onPress={() => setSelectedDate(index)}
                  >
                    <Text style={[styles.dateDay, isSelected && styles.dateDaySelected]}>
                      {formatted.day}
                    </Text>
                    <Text style={[styles.dateNumber, isSelected && styles.dateNumberSelected]}>
                      {formatted.date}
                    </Text>
                    <Text style={[styles.dateMonth, isSelected && styles.dateMonthSelected]}>
                      {formatted.month}
                    </Text>
                    {isToday && (
                      <View style={styles.todayBadge}>
                        <Text style={styles.todayText}>Today</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Duration Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Duration</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.durationScroll}>
              {durationOptions.map((option) => {
                const isSelected = selectedDuration === option.hours;

                return (
                  <TouchableOpacity
                    key={option.hours}
                    style={[styles.durationCard, isSelected && styles.durationCardSelected]}
                    onPress={() => {
                      setSelectedDuration(option.hours);
                      setSelectedTimeSlot(null); // Reset time slot when duration changes
                    }}
                  >
                    <Text style={[styles.durationLabel, isSelected && styles.durationLabelSelected]}>
                      {option.label}
                    </Text>
                    <Text style={[styles.durationPrice, isSelected && styles.durationPriceSelected]}>
                      ${option.price}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Time Slots */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Time Slots</Text>
            <View style={styles.timeSlotsGrid}>
              {timeSlots.map((slot, index) => {
                const isSelected = selectedTimeSlot === slot.time;
                const isAvailable = slot.available;
                const isEvent = slot.isEvent;

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.timeSlot,
                      !isAvailable && !isEvent && styles.timeSlotBooked,
                      isEvent && styles.timeSlotEvent,
                      isSelected && styles.timeSlotSelected,
                    ]}
                    onPress={() => {
                      if (isEvent) {
                        setSelectedEvent(slot.event);
                        setShowEventModal(true);
                      } else if (isAvailable) {
                        setSelectedTimeSlot(slot.time);
                      }
                    }}
                    disabled={false}
                  >
                    <Text style={[
                      styles.timeSlotText,
                      !isAvailable && !isEvent && styles.timeSlotTextBooked,
                      isEvent && styles.timeSlotTextEvent,
                      isSelected && styles.timeSlotTextSelected,
                    ]}>
                      {slot.time}
                    </Text>
                    {isEvent ? (
                      <View style={styles.eventBadge}>
                        <Text style={styles.eventBadgeText}>🎉 EVENT</Text>
                      </View>
                    ) : !isAvailable && (
                      <Text style={styles.bookedLabel}>Booked</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Booking Details */}
          {selectedTimeSlot && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Session Details</Text>
              
              <View style={styles.detailsCard}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Type:</Text>
                  <Text style={styles.detailValue}>
                    {selectedType === 'music' ? '🎵 Music Recording' : '🎙️ Podcast Recording'}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Date:</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(dates[selectedDate]).day}, {formatDate(dates[selectedDate]).month} {formatDate(dates[selectedDate]).date}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Time:</Text>
                  <Text style={styles.detailValue}>{selectedTimeSlot}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Duration:</Text>
                  <Text style={styles.detailValue}>
                    {selectedDuration === 8 ? 'Full Day (8 hours)' : `${selectedDuration} ${selectedDuration === 1 ? 'hour' : 'hours'}`}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Price:</Text>
                  <Text style={styles.detailValuePrice}>${getCurrentPrice()}</Text>
                </View>
              </View>

              {/* Notes Input */}
              <TextInput
                style={styles.notesInput}
                placeholder="Add notes or special requests..."
                placeholderTextColor="#666"
                multiline
                numberOfLines={4}
                value={bookingNotes}
                onChangeText={setBookingNotes}
              />

              {/* Credits Section */}
              {credits > 0 && (
                <View style={styles.creditsSection}>
                  <View style={styles.creditsHeader}>
                    <Text style={styles.creditsTitle}>💳 Studio Credits Available</Text>
                    <Text style={styles.creditsBalance}>${credits.toFixed(2)}</Text>
                  </View>
                  {selectedDuration && (
                    <>
                      <View style={styles.creditBreakdown}>
                        <View style={styles.creditRow}>
                          <Text style={styles.creditLabel}>Booking Price:</Text>
                          <Text style={styles.creditValue}>${getCurrentPrice().toFixed(2)}</Text>
                        </View>
                        <View style={styles.creditRow}>
                          <Text style={styles.creditLabel}>Credits Applied:</Text>
                          <Text style={styles.creditValueGreen}>
                            -${calculateCreditUsage(getCurrentPrice()).creditsToUse.toFixed(2)}
                          </Text>
                        </View>
                        <View style={[styles.creditRow, styles.creditRowTotal]}>
                          <Text style={styles.creditLabelTotal}>You Pay:</Text>
                          <Text style={styles.creditValueTotal}>
                            ${calculateCreditUsage(getCurrentPrice()).remainingPrice.toFixed(2)}
                          </Text>
                        </View>
                      </View>
                      {calculateCreditUsage(getCurrentPrice()).canCoverFull && (
                        <View style={styles.freeBadge}>
                          <Text style={styles.freeBadgeText}>✨ FREE with credits! ✨</Text>
                        </View>
                      )}
                    </>
                  )}
                </View>
              )}

              {/* Payment Method Display */}
              {selectedDuration && calculateCreditUsage(getCurrentPrice()).remainingPrice > 0 && (
                <View style={styles.paymentMethodSection}>
                  <Text style={styles.paymentMethodTitle}>💳 Payment Method</Text>
                  {paymentMethods.length > 0 ? (
                    <View style={styles.paymentMethodCard}>
                      <Text style={styles.paymentMethodBrand}>
                        {getDefaultPaymentMethod()?.brand.toUpperCase()} •••• {getDefaultPaymentMethod()?.last4}
                      </Text>
                      <Text style={styles.paymentMethodInfo}>
                        ${calculateCreditUsage(getCurrentPrice()).remainingPrice.toFixed(2)} will be charged
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.paymentMethodWarning}>
                      <Text style={styles.paymentMethodWarningText}>
                        ⚠️ Add a payment method in your profile to complete this booking
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Book Button */}
              <TouchableOpacity
                style={[styles.bookButton, isProcessingPayment && styles.bookButtonDisabled]}
                onPress={handleBooking}
                disabled={isProcessingPayment}
              >
                <LinearGradient
                  colors={isProcessingPayment ? ['#666', '#666'] : ['#8B5CF6', '#EC4899']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.bookButtonGradient}
                >
                  {isProcessingPayment ? (
                    <View style={styles.processingContainer}>
                      <ActivityIndicator color="#FFFFFF" />
                      <Text style={styles.bookButtonText}> Processing...</Text>
                    </View>
                  ) : (
                    <Text style={styles.bookButtonText}>REQUEST BOOKING</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* Info */}
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              💡 Bookings require admin approval. You'll receive a notification once confirmed.
            </Text>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Success Modal */}
        <Modal
          visible={showSuccessModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowSuccessModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {/* Success Icon */}
              <View style={styles.successIconContainer}>
                <LinearGradient
                  colors={['#8B5CF6', '#EC4899']}
                  style={styles.successIconGradient}
                >
                  <Text style={styles.successIcon}>✓</Text>
                </LinearGradient>
              </View>

              {/* Title */}
              <Text style={styles.modalTitle}>Booking Requested!</Text>
              <Text style={styles.modalSubtitle}>Your booking is pending approval</Text>

              {/* Booking Details */}
              {bookingDetails && (
                <View style={styles.modalDetails}>
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>Type:</Text>
                    <Text style={styles.modalDetailValue}>
                      {bookingDetails.type === 'music' ? '🎵 Music' : '🎙️ Podcast'}
                    </Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>Date:</Text>
                    <Text style={styles.modalDetailValue}>{bookingDetails.date}</Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>Time:</Text>
                    <Text style={styles.modalDetailValue}>{bookingDetails.time}</Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>Duration:</Text>
                    <Text style={styles.modalDetailValue}>
                      {bookingDetails.duration === 8 ? 'Full Day' : `${bookingDetails.duration}hr${bookingDetails.duration > 1 ? 's' : ''}`}
                    </Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>Price:</Text>
                    <Text style={styles.modalDetailValuePrice}>${bookingDetails.price}</Text>
                  </View>
                  {bookingDetails.creditsApplied > 0 && (
                    <>
                      <View style={styles.modalDetailRow}>
                        <Text style={styles.modalDetailLabel}>Credits Applied:</Text>
                        <Text style={styles.modalDetailValueGreen}>-${bookingDetails.creditsApplied.toFixed(2)}</Text>
                      </View>
                      <View style={[styles.modalDetailRow, styles.modalDetailRowTotal]}>
                        <Text style={styles.modalDetailLabelTotal}>Amount Charged:</Text>
                        <Text style={styles.modalDetailValuePriceTotal}>
                          {bookingDetails.finalPrice === 0 ? 'FREE!' : `$${bookingDetails.finalPrice.toFixed(2)}`}
                        </Text>
                      </View>
                    </>
                  )}
                  {bookingDetails.paymentProcessed && bookingDetails.paymentTransaction && (
                    <View style={styles.paymentConfirmation}>
                      <Text style={styles.paymentConfirmationIcon}>✓</Text>
                      <Text style={styles.paymentConfirmationText}>
                        Payment processed successfully
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Close Button */}
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => setShowSuccessModal(false)}
              >
                <LinearGradient
                  colors={['#8B5CF6', '#EC4899']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.modalButtonGradient}
                >
                  <Text style={styles.modalButtonText}>GOT IT</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* My Bookings Modal */}
        <Modal
          visible={showMyBookingsModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowMyBookingsModal(false)}
        >
          <View style={styles.myBookingsOverlay}>
            <View style={styles.myBookingsContent}>
              {/* Header */}
              <View style={styles.myBookingsHeader}>
                <Text style={styles.myBookingsTitle}>My Bookings</Text>
                <TouchableOpacity onPress={() => setShowMyBookingsModal(false)}>
                  <Text style={styles.myBookingsClose}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Upcoming Bookings */}
                <Text style={styles.bookingsSectionTitle}>Upcoming</Text>
                {getUpcomingBookings().length === 0 ? (
                  <View style={styles.emptyBookings}>
                    <Text style={styles.emptyBookingsIcon}>📅</Text>
                    <Text style={styles.emptyBookingsText}>No upcoming bookings</Text>
                    <Text style={styles.emptyBookingsSubtext}>Book a session to get started!</Text>
                  </View>
                ) : (
                  getUpcomingBookings().map((booking) => (
                    <View key={booking.id} style={styles.bookingCard}>
                      <View style={styles.bookingCardHeader}>
                        <Text style={styles.bookingType}>
                          {booking.type === 'music' ? '🎵 Music Session' : '🎙️ Podcast Session'}
                        </Text>
                        <View style={[
                          styles.bookingStatusBadge,
                          booking.status === 'confirmed' && styles.bookingStatusConfirmed,
                          booking.status === 'pending' && styles.bookingStatusPending,
                        ]}>
                          <Text style={styles.bookingStatusText}>
                            {booking.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.bookingDetails}>
                        <View style={styles.bookingDetailRow}>
                          <Text style={styles.bookingDetailLabel}>📅 Date:</Text>
                          <Text style={styles.bookingDetailValue}>
                            {new Date(booking.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </Text>
                        </View>
                        <View style={styles.bookingDetailRow}>
                          <Text style={styles.bookingDetailLabel}>🕐 Time:</Text>
                          <Text style={styles.bookingDetailValue}>{booking.timeSlot}</Text>
                        </View>
                        <View style={styles.bookingDetailRow}>
                          <Text style={styles.bookingDetailLabel}>⏱️ Duration:</Text>
                          <Text style={styles.bookingDetailValue}>
                            {booking.duration === 8 ? 'Full Day' : `${booking.duration} hrs`}
                          </Text>
                        </View>
                        <View style={styles.bookingDetailRow}>
                          <Text style={styles.bookingDetailLabel}>💰 Price:</Text>
                          <Text style={styles.bookingDetailValuePrice}>${booking.price}</Text>
                        </View>
                      </View>

                      {booking.notes && (
                        <View style={styles.bookingNotes}>
                          <Text style={styles.bookingNotesLabel}>Notes:</Text>
                          <Text style={styles.bookingNotesText}>{booking.notes}</Text>
                        </View>
                      )}

                      <TouchableOpacity
                        style={styles.cancelBookingButton}
                        onPress={() => {
                          Alert.alert(
                            'Cancel Booking',
                            'Are you sure you want to cancel this booking?',
                            [
                              { text: 'No', style: 'cancel' },
                              {
                                text: 'Yes, Cancel',
                                style: 'destructive',
                                onPress: () => cancelBooking(booking.id)
                              },
                            ]
                          );
                        }}
                      >
                        <Text style={styles.cancelBookingText}>Cancel Booking</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                )}

                {/* Past Bookings */}
                {getPastBookings().length > 0 && (
                  <>
                    <Text style={styles.bookingsSectionTitle}>Past</Text>
                    {getPastBookings().map((booking) => (
                      <View key={booking.id} style={[styles.bookingCard, styles.bookingCardPast]}>
                        <View style={styles.bookingCardHeader}>
                          <Text style={[styles.bookingType, styles.bookingTypePast]}>
                            {booking.type === 'music' ? '🎵 Music Session' : '🎙️ Podcast Session'}
                          </Text>
                          <View style={[
                            styles.bookingStatusBadge,
                            booking.status === 'cancelled' && styles.bookingStatusCancelled,
                          ]}>
                            <Text style={styles.bookingStatusText}>
                              {booking.status === 'cancelled' ? 'Cancelled' : 'Completed'}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.bookingDetails}>
                          <View style={styles.bookingDetailRow}>
                            <Text style={styles.bookingDetailLabel}>📅 Date:</Text>
                            <Text style={[styles.bookingDetailValue, styles.bookingDetailValuePast]}>
                              {new Date(booking.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </Text>
                          </View>
                          <View style={styles.bookingDetailRow}>
                            <Text style={styles.bookingDetailLabel}>🕐 Time:</Text>
                            <Text style={[styles.bookingDetailValue, styles.bookingDetailValuePast]}>
                              {booking.timeSlot}
                            </Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </>
                )}

                <View style={{ height: 40 }} />
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Event Details Modal */}
        <Modal
          visible={showEventModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowEventModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <LinearGradient
                colors={['#F59E0B', '#FBBF24']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.eventModalHeader}
              >
                <Text style={styles.eventModalTitle}>🎉 Studio Event</Text>
                <TouchableOpacity onPress={() => setShowEventModal(false)}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </LinearGradient>

              <ScrollView style={styles.modalScroll}>
                {selectedEvent && (
                  <>
                    <View style={styles.eventDetailsContainer}>
                      <Text style={styles.eventName}>{selectedEvent.name}</Text>

                      <View style={styles.eventTypeBadge}>
                        <Text style={styles.eventTypeText}>
                          {selectedEvent.type === 'open-mic' ? '🎤 Open Mic' :
                           selectedEvent.type === 'listening-party' ? '🎵 Listening Party' :
                           selectedEvent.type === 'workshop' ? '🎓 Workshop' :
                           '🔒 Private Event'}
                        </Text>
                      </View>

                      {selectedEvent.description && (
                        <View style={styles.eventDescriptionContainer}>
                          <Text style={styles.eventDescription}>{selectedEvent.description}</Text>
                        </View>
                      )}

                      <View style={styles.eventInfoSection}>
                        <View style={styles.eventInfoRow}>
                          <Text style={styles.eventInfoLabel}>📅 Date:</Text>
                          <Text style={styles.eventInfoValue}>
                            {new Date(selectedEvent.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </Text>
                        </View>

                        <View style={styles.eventInfoRow}>
                          <Text style={styles.eventInfoLabel}>🕐 Time:</Text>
                          <Text style={styles.eventInfoValue}>{selectedEvent.timeSlot}</Text>
                        </View>

                        <View style={styles.eventInfoRow}>
                          <Text style={styles.eventInfoLabel}>⏱️ Duration:</Text>
                          <Text style={styles.eventInfoValue}>{selectedEvent.duration} hour{selectedEvent.duration > 1 ? 's' : ''}</Text>
                        </View>

                        {selectedEvent.price > 0 && (
                          <View style={styles.eventInfoRow}>
                            <Text style={styles.eventInfoLabel}>💰 Price:</Text>
                            <Text style={styles.eventInfoValue}>${selectedEvent.price}</Text>
                          </View>
                        )}

                        {selectedEvent.price === 0 && (
                          <View style={styles.freeEventBadge}>
                            <Text style={styles.freeEventText}>✨ FREE EVENT ✨</Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.attendanceSection}>
                        <View style={styles.attendanceHeader}>
                          <Text style={styles.attendanceLabel}>👥 Attendees</Text>
                          <Text style={styles.attendanceCount}>
                            {selectedEvent.currentAttendees} / {selectedEvent.maxAttendees}
                          </Text>
                        </View>

                        <View style={styles.attendanceBarContainer}>
                          <View
                            style={[
                              styles.attendanceBarFill,
                              { width: `${(selectedEvent.currentAttendees / selectedEvent.maxAttendees) * 100}%` }
                            ]}
                          />
                        </View>

                        {selectedEvent.currentAttendees >= selectedEvent.maxAttendees && (
                          <Text style={styles.eventFullText}>Event is at capacity</Text>
                        )}
                      </View>

                      <View style={styles.eventButtonContainer}>
                        {isUserRSVPd(selectedEvent.id) ? (
                          <TouchableOpacity
                            style={styles.unrsvpButton}
                            onPress={() => {
                              unrsvpFromEvent(selectedEvent.id);
                              setShowEventModal(false);
                            }}
                          >
                            <Text style={styles.unrsvpButtonText}>✓ You're Going - Tap to Cancel</Text>
                          </TouchableOpacity>
                        ) : (
                          <LinearGradient
                            colors={['#F59E0B', '#FBBF24']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.rsvpButton}
                          >
                            <TouchableOpacity
                              onPress={() => {
                                if (selectedEvent.currentAttendees < selectedEvent.maxAttendees) {
                                  rsvpToEvent(selectedEvent.id);
                                  Alert.alert(
                                    'RSVP Confirmed!',
                                    `You're all set for ${selectedEvent.name}. We'll see you there!`,
                                    [{ text: 'Got it!' }]
                                  );
                                  setShowEventModal(false);
                                } else {
                                  Alert.alert(
                                    'Event Full',
                                    'Sorry, this event has reached maximum capacity.',
                                    [{ text: 'OK' }]
                                  );
                                }
                              }}
                              style={styles.rsvpButtonInner}
                              disabled={selectedEvent.currentAttendees >= selectedEvent.maxAttendees}
                            >
                              <Text style={styles.rsvpButtonText}>
                                {selectedEvent.currentAttendees >= selectedEvent.maxAttendees ? 'Event Full' : 'RSVP Now'}
                              </Text>
                            </TouchableOpacity>
                          </LinearGradient>
                        )}
                      </View>
                    </View>
                  </>
                )}
              </ScrollView>
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
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  myBookingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.5)',
    gap: 6,
  },
  myBookingsIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  myBookingsIconText: {
    fontSize: 16,
  },
  myBookingsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  // Tips Card Styles
  tipsCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  tipsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tipsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tipsIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F59E0B',
  },
  tipsToggle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F59E0B',
    marginLeft: 12,
  },
  tipsContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(245, 158, 11, 0.2)',
  },
  tipsText: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 22,
    marginBottom: 12,
  },
  tipsBold: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  dateScroll: {
    paddingHorizontal: 20,
  },
  dateCard: {
    width: 80,
    padding: 16,
    marginRight: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 16,
    alignItems: 'center',
  },
  dateCardSelected: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderColor: '#8B5CF6',
    borderWidth: 2,
  },
  dateDay: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  dateDaySelected: {
    color: '#EC4899',
  },
  dateNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  dateNumberSelected: {
    color: '#8B5CF6',
  },
  dateMonth: {
    fontSize: 12,
    color: '#666',
  },
  dateMonthSelected: {
    color: '#FFFFFF',
  },
  todayBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#10B981',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  todayText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Duration Selector Styles
  durationScroll: {
    paddingHorizontal: 20,
  },
  durationCard: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginRight: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 120,
  },
  durationCardSelected: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderColor: '#8B5CF6',
    borderWidth: 2,
  },
  durationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  durationLabelSelected: {
    color: '#8B5CF6',
    fontWeight: '800',
  },
  durationPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#10B981',
  },
  durationPriceSelected: {
    color: '#EC4899',
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  timeSlot: {
    width: '30%',
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 12,
    alignItems: 'center',
  },
  timeSlotBooked: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  timeSlotSelected: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    borderColor: '#8B5CF6',
    borderWidth: 2,
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  timeSlotTextBooked: {
    color: '#444',
  },
  timeSlotTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  timeSlotEvent: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderColor: '#F59E0B',
    borderWidth: 2,
  },
  timeSlotTextEvent: {
    color: '#FBBF24',
    fontWeight: '800',
  },
  eventBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.3)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  eventBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#F59E0B',
  },
  bookedLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  detailsCard: {
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
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
    fontSize: 18,
    fontWeight: '800',
    color: '#10B981',
  },
  notesInput: {
    marginHorizontal: 20,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 12,
    color: '#FFFFFF',
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  bookButton: {
    marginHorizontal: 20,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  bookButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
  },
  infoBox: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: 12,
  },
  infoText: {
    fontSize: 12,
    color: '#F59E0B',
    lineHeight: 18,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  successIconContainer: {
    marginBottom: 24,
  },
  successIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIcon: {
    fontSize: 48,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#EC4899',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalDetails: {
    width: '100%',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  modalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalDetailLabel: {
    fontSize: 14,
    color: '#666',
  },
  modalDetailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalDetailValuePrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#10B981',
  },
  modalButton: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
  },
  modalButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
  },
  // My Bookings Modal Styles
  myBookingsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'flex-end',
  },
  myBookingsContent: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    maxHeight: '90%',
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 92, 246, 0.3)',
  },
  myBookingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 92, 246, 0.2)',
  },
  myBookingsTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  myBookingsClose: {
    fontSize: 24,
    color: '#666',
    fontWeight: '600',
  },
  bookingsSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8B5CF6',
    marginBottom: 16,
    marginTop: 8,
  },
  emptyBookings: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyBookingsIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyBookingsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyBookingsSubtext: {
    fontSize: 14,
    color: '#666',
  },
  bookingCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  bookingCardPast: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  bookingCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  bookingType: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bookingTypePast: {
    color: '#666',
  },
  bookingStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bookingStatusConfirmed: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  bookingStatusPending: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  bookingStatusCancelled: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  bookingStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bookingDetails: {
    gap: 12,
  },
  bookingDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingDetailLabel: {
    fontSize: 13,
    color: '#999',
  },
  bookingDetailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bookingDetailValuePast: {
    color: '#666',
  },
  bookingDetailValuePrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#10B981',
  },
  bookingNotes: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 92, 246, 0.2)',
  },
  bookingNotesLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8B5CF6',
    marginBottom: 6,
  },
  bookingNotesText: {
    fontSize: 13,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  cancelBookingButton: {
    marginTop: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    alignItems: 'center',
  },
  cancelBookingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444',
  },
  // Event Modal Styles
  eventModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  eventModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  eventDetailsContainer: {
    padding: 24,
  },
  eventName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 16,
    lineHeight: 34,
  },
  eventTypeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  eventTypeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F59E0B',
  },
  eventDescriptionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  eventDescription: {
    fontSize: 15,
    color: '#CCCCCC',
    lineHeight: 22,
  },
  eventInfoSection: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  eventInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventInfoLabel: {
    fontSize: 14,
    color: '#FBBF24',
    fontWeight: '600',
  },
  eventInfoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  freeEventBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  freeEventText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 1,
  },
  attendanceSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  attendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  attendanceLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  attendanceCount: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F59E0B',
  },
  attendanceBarContainer: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  attendanceBarFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 4,
  },
  eventFullText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  eventButtonContainer: {
    marginTop: 8,
  },
  rsvpButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  rsvpButtonInner: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  rsvpButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  unrsvpButton: {
    paddingVertical: 18,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#10B981',
    alignItems: 'center',
  },
  unrsvpButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 1,
  },
  // Credits Section Styles
  creditsSection: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 16,
    padding: 16,
  },
  creditsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  creditsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
  },
  creditsBalance: {
    fontSize: 20,
    fontWeight: '800',
    color: '#10B981',
  },
  creditBreakdown: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
  },
  creditRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  creditLabel: {
    fontSize: 14,
    color: '#999',
  },
  creditValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  creditValueGreen: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
  },
  creditRowTotal: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(16, 185, 129, 0.2)',
    marginTop: 8,
    paddingTop: 8,
  },
  creditLabelTotal: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  creditValueTotal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#10B981',
  },
  freeBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    alignItems: 'center',
  },
  freeBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 1,
  },
  // Success Modal Credits Styles
  modalDetailValueGreen: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
  },
  modalDetailRowTotal: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 92, 246, 0.2)',
    marginTop: 8,
    paddingTop: 8,
  },
  modalDetailLabelTotal: {
    fontSize: 15,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  modalDetailValuePriceTotal: {
    fontSize: 20,
    fontWeight: '800',
    color: '#10B981',
  },
  // Payment Method Styles
  paymentMethodSection: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 16,
    padding: 16,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8B5CF6',
    marginBottom: 12,
  },
  paymentMethodCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
  },
  paymentMethodBrand: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  paymentMethodInfo: {
    fontSize: 13,
    color: '#999',
  },
  paymentMethodWarning: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    padding: 12,
  },
  paymentMethodWarningText: {
    fontSize: 13,
    color: '#EF4444',
    lineHeight: 18,
  },
  bookButtonDisabled: {
    opacity: 0.7,
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentConfirmation: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
  },
  paymentConfirmationIcon: {
    fontSize: 20,
    marginRight: 8,
    color: '#10B981',
  },
  paymentConfirmationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    flex: 1,
  },
});