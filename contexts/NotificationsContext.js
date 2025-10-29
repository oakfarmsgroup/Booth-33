import React, { createContext, useContext, useState } from 'react';

const NotificationsContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([
    // Sample notifications
    {
      id: 'notif_1',
      type: 'booking_reminder',
      title: 'Upcoming Session Tomorrow',
      message: 'Your 2-hour music recording session is scheduled for tomorrow at 2:00 PM',
      timestamp: new Date(2025, 9, 27, 10, 0),
      read: false,
      data: {
        bookingId: 'book1',
        date: new Date(2025, 9, 28, 14, 0),
      },
    },
    {
      id: 'notif_2',
      type: 'credits_granted',
      title: 'Studio Credits Received! 💳',
      message: 'You received $60 in studio credits - Welcome bonus',
      timestamp: new Date(2025, 9, 26, 15, 30),
      read: false,
      data: {
        amount: 60,
        reason: 'Welcome bonus',
      },
    },
    {
      id: 'notif_3',
      type: 'booking_approved',
      title: 'Booking Confirmed! ✓',
      message: 'Your podcast recording session for Oct 30 at 3:00 PM has been approved',
      timestamp: new Date(2025, 9, 25, 12, 0),
      read: true,
      data: {
        bookingId: 'book2',
      },
    },
  ]);

  // Create a notification
  const createNotification = (type, title, message, data = {}) => {
    const notification = {
      id: `notif_${Date.now()}`,
      type,
      title,
      message,
      timestamp: new Date(),
      read: false,
      data,
    };

    setNotifications([notification, ...notifications]);
    return notification;
  };

  // Notification type helpers
  const notifyBookingReminder = (booking) => {
    const hours = booking.duration === 8 ? 'Full Day' : `${booking.duration}hr${booking.duration > 1 ? 's' : ''}`;
    const dateStr = new Date(booking.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    return createNotification(
      'booking_reminder',
      'Upcoming Session Tomorrow',
      `Your ${hours} ${booking.type} session is scheduled for ${dateStr} at ${booking.timeSlot}`,
      { bookingId: booking.id, date: booking.date }
    );
  };

  const notifyBookingApproved = (booking) => {
    const dateStr = new Date(booking.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    return createNotification(
      'booking_approved',
      'Booking Confirmed! ✓',
      `Your ${booking.type} session for ${dateStr} at ${booking.timeSlot} has been approved`,
      { bookingId: booking.id }
    );
  };

  const notifyBookingRejected = (booking, reason) => {
    const dateStr = new Date(booking.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    return createNotification(
      'booking_rejected',
      'Booking Not Approved',
      `Your ${booking.type} session for ${dateStr} at ${booking.timeSlot} was not approved. ${reason ? `Reason: ${reason}` : ''}`,
      { bookingId: booking.id, reason }
    );
  };

  const notifyEventReminder = (event) => {
    const dateStr = new Date(event.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    return createNotification(
      'event_reminder',
      `${event.name} Tomorrow! 🎉`,
      `Don't forget: ${event.name} is tomorrow at ${event.timeSlot}. ${event.currentAttendees} people attending!`,
      { eventId: event.id, date: event.date }
    );
  };

  const notifyCreditsGranted = (amount, reason) => {
    return createNotification(
      'credits_granted',
      'Studio Credits Received! 💳',
      `You received $${amount.toFixed(2)} in studio credits${reason ? ` - ${reason}` : ''}`,
      { amount, reason }
    );
  };

  const notifyPaymentSuccess = (amount, description) => {
    return createNotification(
      'payment_success',
      'Payment Successful ✓',
      `Payment of $${amount.toFixed(2)} processed successfully for ${description}`,
      { amount, description }
    );
  };

  const notifyPaymentFailed = (amount, description) => {
    return createNotification(
      'payment_failed',
      'Payment Failed',
      `Payment of $${amount.toFixed(2)} could not be processed for ${description}. Please update your payment method.`,
      { amount, description }
    );
  };

  const notifyRefund = (amount, description) => {
    return createNotification(
      'refund',
      'Refund Processed 💰',
      `Refund of $${amount.toFixed(2)} has been processed for ${description}`,
      { amount, description }
    );
  };

  const notifyNewFollower = (username) => {
    return createNotification(
      'social_follow',
      'New Follower',
      `${username} started following you`,
      { username }
    );
  };

  const notifyCommentOnPost = (username, postId) => {
    return createNotification(
      'social_comment',
      'New Comment',
      `${username} commented on your post`,
      { username, postId }
    );
  };

  const notifyLikeOnPost = (username, postId) => {
    return createNotification(
      'social_like',
      'New Like',
      `${username} liked your post`,
      { username, postId }
    );
  };

  // Mark notification as read
  const markAsRead = (notificationId) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(notifications.map((notif) => ({ ...notif, read: true })));
  };

  // Delete notification
  const deleteNotification = (notificationId) => {
    setNotifications(notifications.filter((notif) => notif.id !== notificationId));
  };

  // Clear all notifications
  const clearAll = () => {
    setNotifications([]);
  };

  // Get unread count
  const getUnreadCount = () => {
    return notifications.filter((notif) => !notif.read).length;
  };

  // Get notifications by type
  const getNotificationsByType = (type) => {
    return notifications.filter((notif) => notif.type === type);
  };

  // Get recent notifications (last N)
  const getRecentNotifications = (limit = 10) => {
    return notifications.slice(0, limit);
  };

  const value = {
    notifications,
    createNotification,

    // Type-specific helpers
    notifyBookingReminder,
    notifyBookingApproved,
    notifyBookingRejected,
    notifyEventReminder,
    notifyCreditsGranted,
    notifyPaymentSuccess,
    notifyPaymentFailed,
    notifyRefund,
    notifyNewFollower,
    notifyCommentOnPost,
    notifyLikeOnPost,

    // Management
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,

    // Queries
    getUnreadCount,
    getNotificationsByType,
    getRecentNotifications,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};
