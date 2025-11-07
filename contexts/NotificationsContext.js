import React, { createContext, useContext, useState, useEffect } from 'react';
import * as notificationsService from '../services/notificationsService';

const NotificationsContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notificationSubscription, setNotificationSubscription] = useState(null);

  // Load notifications and subscribe to real-time updates
  useEffect(() => {
    loadNotifications();

    // Subscribe to real-time notifications
    const setupSubscription = async () => {
      const subscription = await notificationsService.subscribeToNotifications(handleNewNotification);
      setNotificationSubscription(subscription);
    };

    setupSubscription();

    // Cleanup subscription on unmount
    return () => {
      if (notificationSubscription) {
        notificationsService.unsubscribeFromNotifications(notificationSubscription);
      }
    };
  }, []);

  // Load notifications from database
  const loadNotifications = async () => {
    setLoading(true);
    try {
      const result = await notificationsService.getUserNotifications();
      if (result.success) {
        setNotifications(result.data || []);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle real-time notification
  const handleNewNotification = (newNotification) => {
    setNotifications(prev => [newNotification, ...prev]);
  };

  /* Keeping sample data for reference - remove this block
  const [notifications, setNotifications] = useState([
    // Sample notifications
    {
      id: 'notif_1',
      type: 'booking',
      title: 'Booking Confirmed',
      message: 'Your music recording session for Oct 28 at 2:00 PM has been approved',
      time: '2 hours ago',
      timestamp: new Date(2025, 9, 27, 10, 0),
      read: false,
      actionLabel: 'View',
      actionRoute: 'Book',
      data: {
        bookingId: 'book1',
        date: new Date(2025, 9, 28, 14, 0),
      },
    },
    {
      id: 'notif_2',
      type: 'payment',
      title: 'Payment Successful',
      message: 'Your payment of $150 for music session has been processed',
      time: '5 hours ago',
      timestamp: new Date(2025, 9, 26, 15, 30),
      read: false,
      actionLabel: 'Receipt',
      actionRoute: 'Profile',
      data: {
        amount: 150,
        description: 'Music session booking',
      },
    },
    {
      id: 'notif_3',
      type: 'session',
      title: 'Session Files Ready',
      message: 'Your recorded tracks from Oct 20 session are now available in your library',
      time: '1 day ago',
      timestamp: new Date(2025, 9, 25, 12, 0),
      read: false,
      actionLabel: 'View Files',
      actionRoute: 'Library',
      data: {
        sessionId: 'session1',
      },
    },
    {
      id: 'notif_4',
      type: 'event',
      title: 'Open Mic Night Tomorrow',
      message: 'Reminder: Open Mic Night is tomorrow at 7:00 PM. 12 people are attending!',
      time: '1 day ago',
      timestamp: new Date(2025, 9, 25, 10, 0),
      read: true,
      actionLabel: 'Details',
      actionRoute: 'Home',
      data: {
        eventId: 'evt1',
      },
    },
    {
      id: 'notif_5',
      type: 'system',
      title: 'Welcome to Booth 33',
      message: 'Thanks for joining! Check out our booking options and upcoming events',
      time: '3 days ago',
      timestamp: new Date(2025, 9, 23, 9, 0),
      read: true,
      data: {},
    },
  ]);
  */

  // Create a notification in database
  const createNotification = async (type, title, message, data = {}) => {
    try {
      const result = await notificationsService.createNotification(type, title, message, data);
      if (result.success) {
        setNotifications(prev => [result.data, ...prev]);
        return result.data;
      }
      return null;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
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
  const markAsRead = async (notificationId) => {
    try {
      const result = await notificationsService.markAsRead(notificationId);
      if (result.success) {
        setNotifications(prev =>
          prev.map((notif) =>
            notif.id === notificationId ? { ...notif, read: true } : notif
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const result = await notificationsService.markAllAsRead();
      if (result.success) {
        setNotifications(prev => prev.map((notif) => ({ ...notif, read: true })));
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      const result = await notificationsService.deleteNotification(notificationId);
      if (result.success) {
        setNotifications(prev => prev.filter((notif) => notif.id !== notificationId));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
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
    loading,
    createNotification,
    loadNotifications, // Allow manual refresh

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
