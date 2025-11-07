import { supabase } from '../config/supabase';

/**
 * Bookings Service
 * Handles all booking operations with Supabase
 */

// Create a new booking
export const createBooking = async (bookingData) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert([
        {
          user_id: bookingData.userId,
          session_type: bookingData.sessionType,
          date: bookingData.date,
          time: bookingData.time,
          duration: bookingData.duration,
          price: bookingData.price,
          status: 'pending',
          notes: bookingData.notes || null,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Create booking error:', error);
    return { success: false, error: error.message };
  }
};

// Get all bookings for a user
export const getUserBookings = async (userId, status = null) => {
  try {
    let query = supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Get user bookings error:', error);
    return { success: false, error: error.message };
  }
};

// Get a single booking by ID
export const getBookingById = async (bookingId) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Get booking error:', error);
    return { success: false, error: error.message };
  }
};

// Update booking status
export const updateBookingStatus = async (bookingId, status) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', bookingId)
      .select();

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Update booking status error:', error);
    return { success: false, error: error.message };
  }
};

// Cancel booking
export const cancelBooking = async (bookingId, reason = null) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancellation_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .select();

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Cancel booking error:', error);
    return { success: false, error: error.message };
  }
};

// Get all bookings (admin only)
export const getAllBookings = async (filters = {}) => {
  try {
    let query = supabase
      .from('bookings')
      .select('*, users(full_name, email)')
      .order('created_at', { ascending: false });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.sessionType) {
      query = query.eq('session_type', filters.sessionType);
    }

    if (filters.startDate) {
      query = query.gte('date', filters.startDate);
    }

    if (filters.endDate) {
      query = query.lte('date', filters.endDate);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Get all bookings error:', error);
    return { success: false, error: error.message };
  }
};

// Check availability for a date/time
export const checkAvailability = async (date, time, duration) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('date', date)
      .eq('time', time)
      .in('status', ['confirmed', 'pending']);

    if (error) throw error;

    return {
      success: true,
      available: data.length === 0,
      conflictingBookings: data,
    };
  } catch (error) {
    console.error('Check availability error:', error);
    return { success: false, error: error.message };
  }
};

// Get booking statistics (admin)
export const getBookingStats = async (startDate, endDate) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) throw error;

    const stats = {
      total: data.length,
      confirmed: data.filter(b => b.status === 'confirmed').length,
      pending: data.filter(b => b.status === 'pending').length,
      cancelled: data.filter(b => b.status === 'cancelled').length,
      completed: data.filter(b => b.status === 'completed').length,
      totalRevenue: data
        .filter(b => b.status === 'confirmed' || b.status === 'completed')
        .reduce((sum, b) => sum + (b.price || 0), 0),
    };

    return { success: true, data: stats };
  } catch (error) {
    console.error('Get booking stats error:', error);
    return { success: false, error: error.message };
  }
};

// Reschedule booking
export const rescheduleBooking = async (bookingId, newDate, newTime) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({
        date: newDate,
        time: newTime,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .select();

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Reschedule booking error:', error);
    return { success: false, error: error.message };
  }
};

// Subscribe to all booking changes (for admin dashboard)
export const subscribeToBookingChanges = async (callback) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('No user found for booking subscription');
      return null;
    }

    const subscription = supabase
      .channel('bookings-all')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'api',
          table: 'bookings',
        },
        (payload) => {
          console.log('Booking change detected:', payload.eventType, payload.new || payload.old);
          callback(payload);
        }
      )
      .subscribe();

    return subscription;
  } catch (error) {
    console.error('Error subscribing to booking changes:', error);
    return null;
  }
};

// Subscribe to user's own bookings
export const subscribeToUserBookings = async (callback) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('No user found for user booking subscription');
      return null;
    }

    const subscription = supabase
      .channel('user-bookings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'api',
          table: 'bookings',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('User booking change:', payload.eventType, payload.new || payload.old);
          callback(payload);
        }
      )
      .subscribe();

    return subscription;
  } catch (error) {
    console.error('Error subscribing to user bookings:', error);
    return null;
  }
};

// Unsubscribe from booking changes
export const unsubscribeFromBookings = (subscription) => {
  if (subscription && typeof subscription.unsubscribe === 'function') {
    subscription.unsubscribe();
  } else if (subscription && subscription.then) {
    // Handle promise-based subscriptions
    subscription.then(sub => {
      if (sub && typeof sub.unsubscribe === 'function') {
        sub.unsubscribe();
      }
    });
  }
};

export default {
  createBooking,
  getUserBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  getAllBookings,
  checkAvailability,
  getBookingStats,
  rescheduleBooking,
  subscribeToBookingChanges,
  subscribeToUserBookings,
  unsubscribeFromBookings,
};
