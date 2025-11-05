import { supabase } from '../config/supabase';

/**
 * Events Service
 * Handles event creation, RSVPs, and event management
 */

// Create a new event
export const createEvent = async (eventData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('events')
      .insert([
        {
          organizer_id: user.id,
          title: eventData.title,
          description: eventData.description,
          event_date: eventData.eventDate,
          event_time: eventData.eventTime,
          location: eventData.location,
          image_url: eventData.imageUrl || null,
          max_attendees: eventData.maxAttendees || null,
          created_at: new Date().toISOString(),
        },
      ])
      .select(`
        *,
        organizer:organizer_id (
          id,
          full_name,
          username,
          avatar_url
        )
      `);

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Create event error:', error);
    return { success: false, error: error.message };
  }
};

// Get all upcoming events
export const getUpcomingEvents = async (limit = 20) => {
  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        organizer:organizer_id (
          id,
          full_name,
          username,
          avatar_url,
          verified
        )
      `)
      .gte('event_date', now.split('T')[0]) // Events from today onwards
      .order('event_date', { ascending: true })
      .order('event_time', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Get upcoming events error:', error);
    return { success: false, error: error.message };
  }
};

// Get events created by a specific user
export const getUserEvents = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        organizer:organizer_id (
          id,
          full_name,
          username,
          avatar_url
        )
      `)
      .eq('organizer_id', userId)
      .order('event_date', { ascending: true });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Get user events error:', error);
    return { success: false, error: error.message };
  }
};

// Get a specific event by ID
export const getEventById = async (eventId) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        organizer:organizer_id (
          id,
          full_name,
          username,
          avatar_url,
          verified
        )
      `)
      .eq('id', eventId)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Get event by ID error:', error);
    return { success: false, error: error.message };
  }
};

// RSVP to an event
export const rsvpToEvent = async (eventId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Check if event has max attendees limit
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('max_attendees, attendee_count')
      .eq('id', eventId)
      .single();

    if (eventError) throw eventError;

    // Check if event is full
    if (event.max_attendees && event.attendee_count >= event.max_attendees) {
      return { success: false, error: 'Event is full' };
    }

    // Create RSVP
    const { data, error } = await supabase
      .from('event_rsvps')
      .insert([
        {
          event_id: eventId,
          user_id: user.id,
          status: 'going',
        },
      ])
      .select();

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('RSVP to event error:', error);
    return { success: false, error: error.message };
  }
};

// Cancel RSVP to an event
export const cancelRsvp = async (eventId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('event_rsvps')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', user.id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Cancel RSVP error:', error);
    return { success: false, error: error.message };
  }
};

// Get attendees for an event
export const getEventAttendees = async (eventId) => {
  try {
    const { data, error } = await supabase
      .from('event_rsvps')
      .select(`
        *,
        user:user_id (
          id,
          full_name,
          username,
          avatar_url,
          verified
        )
      `)
      .eq('event_id', eventId)
      .eq('status', 'going');

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Get event attendees error:', error);
    return { success: false, error: error.message };
  }
};

// Check if current user has RSVP'd to an event
export const hasRsvpd = async (eventId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: true, hasRsvpd: false };

    const { data, error } = await supabase
      .from('event_rsvps')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .eq('status', 'going')
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return { success: true, hasRsvpd: !!data };
  } catch (error) {
    console.error('Check RSVP error:', error);
    return { success: false, error: error.message };
  }
};

// Get events user has RSVP'd to
export const getUserRsvps = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('event_rsvps')
      .select(`
        *,
        event:event_id (
          id,
          title,
          description,
          event_date,
          event_time,
          location,
          image_url,
          attendee_count,
          organizer:organizer_id (
            id,
            full_name,
            username,
            avatar_url
          )
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'going')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Get user RSVPs error:', error);
    return { success: false, error: error.message };
  }
};

// Update event details (organizer only)
export const updateEvent = async (eventId, updates) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('events')
      .update({
        title: updates.title,
        description: updates.description,
        event_date: updates.eventDate,
        event_time: updates.eventTime,
        location: updates.location,
        image_url: updates.imageUrl,
        max_attendees: updates.maxAttendees,
        updated_at: new Date().toISOString(),
      })
      .eq('id', eventId)
      .eq('organizer_id', user.id) // Only organizer can update
      .select();

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Update event error:', error);
    return { success: false, error: error.message };
  }
};

// Delete an event (organizer only)
export const deleteEvent = async (eventId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)
      .eq('organizer_id', user.id); // Only organizer can delete

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Delete event error:', error);
    return { success: false, error: error.message };
  }
};

// Upload event image
export const uploadEventImage = async (fileUri, fileName) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const uniqueFileName = `${user.id}_${Date.now()}_${fileName}`;
    const filePath = `events/${uniqueFileName}`;

    const { data, error } = await supabase.storage
      .from('posts') // Using posts bucket for event images
      .upload(filePath, fileUri);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('posts')
      .getPublicUrl(filePath);

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Upload event image error:', error);
    return { success: false, error: error.message };
  }
};

export default {
  createEvent,
  getUpcomingEvents,
  getUserEvents,
  getEventById,
  rsvpToEvent,
  cancelRsvp,
  getEventAttendees,
  hasRsvpd,
  getUserRsvps,
  updateEvent,
  deleteEvent,
  uploadEventImage,
};
