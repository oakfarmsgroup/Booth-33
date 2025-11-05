import { supabase } from '../config/supabase';

/**
 * Notifications Service
 * Handles in-app notifications and real-time updates
 */

// Get all notifications for current user
export const getUserNotifications = async (limit = 50) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Get notifications error:', error);
    return { success: false, error: error.message };
  }
};

// Get unread notification count
export const getUnreadCount = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (error) throw error;
    return { success: true, count: count || 0 };
  } catch (error) {
    console.error('Get unread count error:', error);
    return { success: false, error: error.message };
  }
};

// Mark notification as read
export const markAsRead = async (notificationId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .eq('user_id', user.id) // Ensure user can only mark their own notifications
      .select();

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Mark as read error:', error);
    return { success: false, error: error.message };
  }
};

// Mark all notifications as read
export const markAllAsRead = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Mark all as read error:', error);
    return { success: false, error: error.message };
  }
};

// Delete a notification
export const deleteNotification = async (notificationId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', user.id); // Ensure user can only delete their own notifications

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Delete notification error:', error);
    return { success: false, error: error.message };
  }
};

// Delete all notifications for current user
export const deleteAllNotifications = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', user.id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Delete all notifications error:', error);
    return { success: false, error: error.message };
  }
};

// Create a notification
export const createNotification = async (userId, type, title, message, data = null) => {
  try {
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert([
        {
          user_id: userId,
          type, // 'booking', 'message', 'like', 'comment', 'follow', 'system'
          title,
          message,
          data, // JSON data for additional context
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) throw error;
    return { success: true, data: notification[0] };
  } catch (error) {
    console.error('Create notification error:', error);
    return { success: false, error: error.message };
  }
};

// Get notifications by type
export const getNotificationsByType = async (type, limit = 20) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', type)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Get notifications by type error:', error);
    return { success: false, error: error.message };
  }
};

// Subscribe to notifications (real-time)
export const subscribeToNotifications = (callback) => {
  const subscription = supabase.auth.getUser().then(({ data: { user } }) => {
    if (!user) throw new Error('Not authenticated');

    return supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('New notification:', payload.new);
          callback(payload.new);
        }
      )
      .subscribe();
  });

  return subscription;
};

// Unsubscribe from notifications
export const unsubscribeFromNotifications = (subscription) => {
  if (subscription && typeof subscription.unsubscribe === 'function') {
    subscription.unsubscribe();
  } else if (subscription && subscription.then) {
    // If subscription is a promise, wait for it and then unsubscribe
    subscription.then(sub => {
      if (sub && typeof sub.unsubscribe === 'function') {
        sub.unsubscribe();
      }
    });
  }
};

// Notification helper functions for common notification types

// Notify user about new booking status
export const notifyBookingStatus = async (userId, bookingId, status) => {
  const statusMessages = {
    confirmed: 'Your booking has been confirmed!',
    rejected: 'Your booking request was declined',
    cancelled: 'Your booking has been cancelled',
    completed: 'Your session has been completed',
  };

  const title = `Booking ${status.charAt(0).toUpperCase() + status.slice(1)}`;
  const message = statusMessages[status] || `Your booking status: ${status}`;

  return createNotification(userId, 'booking', title, message, { bookingId, status });
};

// Notify user about new message
export const notifyNewMessage = async (userId, senderId, senderName) => {
  return createNotification(
    userId,
    'message',
    'New Message',
    `${senderName} sent you a message`,
    { senderId }
  );
};

// Notify user about new like
export const notifyPostLike = async (userId, postId, likerName) => {
  return createNotification(
    userId,
    'like',
    'New Like',
    `${likerName} liked your post`,
    { postId }
  );
};

// Notify user about new comment
export const notifyPostComment = async (userId, postId, commenterName, commentText) => {
  return createNotification(
    userId,
    'comment',
    'New Comment',
    `${commenterName} commented: "${commentText.substring(0, 50)}${commentText.length > 50 ? '...' : ''}"`,
    { postId }
  );
};

// Notify user about new follower
export const notifyNewFollower = async (userId, followerId, followerName) => {
  return createNotification(
    userId,
    'follow',
    'New Follower',
    `${followerName} started following you`,
    { followerId }
  );
};

// Send system notification
export const notifySystem = async (userId, title, message) => {
  return createNotification(userId, 'system', title, message);
};

export default {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  createNotification,
  getNotificationsByType,
  subscribeToNotifications,
  unsubscribeFromNotifications,
  notifyBookingStatus,
  notifyNewMessage,
  notifyPostLike,
  notifyPostComment,
  notifyNewFollower,
  notifySystem,
};
