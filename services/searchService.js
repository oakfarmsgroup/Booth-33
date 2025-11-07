import { supabase } from '../config/supabase';
import { searchUsers } from './profileService';

/**
 * Search Service
 * Unified search across posts, users, and events
 */

/**
 * Search tracks/posts by title or description
 * @param {string} query - Search query
 * @param {number} limit - Maximum results
 * @returns {Promise<{success: boolean, data: any[], error: any}>}
 */
export async function searchTracks(query, limit = 20) {
  try {
    if (!query || query.trim() === '') {
      return { success: true, data: [], error: null };
    }

    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        description,
        audio_url,
        image_url,
        play_count,
        likes_count,
        comments_count,
        created_at,
        user:user_id (
          id,
          full_name,
          username,
          avatar_url,
          verified
        )
      `)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('play_count', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error searching tracks:', error);
      return { success: false, error, data: [] };
    }

    // Transform to match expected format
    const tracks = data.map(post => ({
      id: post.id,
      title: post.title,
      artist: post.user?.full_name || post.user?.username || 'Unknown Artist',
      artistId: post.user?.id,
      artistAvatar: post.user?.avatar_url,
      verified: post.user?.verified || false,
      plays: post.play_count || 0,
      likes: post.likes_count || 0,
      audioUrl: post.audio_url,
      imageUrl: post.image_url,
      description: post.description,
      createdAt: post.created_at,
    }));

    return { success: true, data: tracks, error: null };
  } catch (error) {
    console.error('Error in searchTracks:', error);
    return { success: false, error, data: [] };
  }
}

/**
 * Search users (wrapper around profileService.searchUsers)
 * @param {string} query - Search query
 * @param {number} limit - Maximum results
 * @returns {Promise<{success: boolean, data: any[], error: any}>}
 */
export async function searchUsersWrapper(query, limit = 20) {
  try {
    return await searchUsers(query, limit);
  } catch (error) {
    console.error('Error in searchUsersWrapper:', error);
    return { success: false, error, data: [] };
  }
}

/**
 * Search events by name or type
 * @param {string} query - Search query
 * @param {number} limit - Maximum results
 * @returns {Promise<{success: boolean, data: any[], error: any}>}
 */
export async function searchEvents(query, limit = 20) {
  try {
    if (!query || query.trim() === '') {
      return { success: true, data: [], error: null };
    }

    const { data, error } = await supabase
      .from('events')
      .select(`
        id,
        name,
        description,
        type,
        date,
        location,
        image_url,
        attendees_count,
        created_at,
        host:created_by (
          id,
          full_name,
          username,
          avatar_url
        )
      `)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,type.ilike.%${query}%`)
      .gte('date', new Date().toISOString()) // Only future events
      .order('date', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error searching events:', error);
      return { success: false, error, data: [] };
    }

    // Transform to match expected format
    const events = data.map(event => ({
      id: event.id,
      name: event.name,
      description: event.description,
      type: event.type,
      date: event.date,
      location: event.location,
      imageUrl: event.image_url,
      attendees: event.attendees_count || 0,
      hostId: event.host?.id,
      hostName: event.host?.full_name || event.host?.username,
      hostAvatar: event.host?.avatar_url,
      createdAt: event.created_at,
    }));

    return { success: true, data: events, error: null };
  } catch (error) {
    console.error('Error in searchEvents:', error);
    return { success: false, error, data: [] };
  }
}

/**
 * Search across all content types
 * @param {string} query - Search query
 * @param {number} limit - Results per category
 * @returns {Promise<{success: boolean, data: {tracks: any[], users: any[], events: any[]}, error: any}>}
 */
export async function searchAll(query, limit = 10) {
  try {
    if (!query || query.trim() === '') {
      return {
        success: true,
        data: { tracks: [], users: [], events: [] },
        error: null
      };
    }

    // Run all searches in parallel
    const [tracksResult, usersResult, eventsResult] = await Promise.all([
      searchTracks(query, limit),
      searchUsersWrapper(query, limit),
      searchEvents(query, limit)
    ]);

    return {
      success: true,
      data: {
        tracks: tracksResult.success ? tracksResult.data : [],
        users: usersResult.success ? usersResult.data : [],
        events: eventsResult.success ? eventsResult.data : [],
      },
      error: null
    };
  } catch (error) {
    console.error('Error in searchAll:', error);
    return {
      success: false,
      error,
      data: { tracks: [], users: [], events: [] }
    };
  }
}

/**
 * Get trending tracks (most played recently)
 * @param {number} limit - Maximum results
 * @param {number} days - Days to look back
 * @returns {Promise<{success: boolean, data: any[], error: any}>}
 */
export async function getTrendingTracks(limit = 10, days = 7) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        audio_url,
        image_url,
        play_count,
        likes_count,
        created_at,
        user:user_id (
          id,
          full_name,
          username,
          avatar_url,
          verified
        )
      `)
      .gte('created_at', startDate.toISOString())
      .order('play_count', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error getting trending tracks:', error);
      return { success: false, error, data: [] };
    }

    const tracks = data.map(post => ({
      id: post.id,
      title: post.title,
      artist: post.user?.full_name || post.user?.username || 'Unknown',
      artistId: post.user?.id,
      artistAvatar: post.user?.avatar_url,
      verified: post.user?.verified || false,
      plays: post.play_count || 0,
      likes: post.likes_count || 0,
      audioUrl: post.audio_url,
      imageUrl: post.image_url,
    }));

    return { success: true, data: tracks, error: null };
  } catch (error) {
    console.error('Error in getTrendingTracks:', error);
    return { success: false, error, data: [] };
  }
}

/**
 * Get popular users (most followers)
 * @param {number} limit - Maximum results
 * @returns {Promise<{success: boolean, data: any[], error: any}>}
 */
export async function getPopularUsers(limit = 10) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url, bio, verified, followers_count')
      .order('followers_count', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error getting popular users:', error);
      return { success: false, error, data: [] };
    }

    const users = data.map(profile => ({
      id: profile.id,
      name: profile.full_name || profile.username,
      username: profile.username,
      avatar: profile.avatar_url,
      bio: profile.bio,
      verified: profile.verified || false,
      followers: profile.followers_count || 0,
    }));

    return { success: true, data: users, error: null };
  } catch (error) {
    console.error('Error in getPopularUsers:', error);
    return { success: false, error, data: [] };
  }
}

/**
 * Get upcoming events (sorted by date)
 * @param {number} limit - Maximum results
 * @returns {Promise<{success: boolean, data: any[], error: any}>}
 */
export async function getUpcomingEvents(limit = 10) {
  try {
    const { data, error } = await supabase
      .from('events')
      .select(`
        id,
        name,
        type,
        date,
        location,
        image_url,
        attendees_count,
        host:created_by (
          full_name,
          username,
          avatar_url
        )
      `)
      .gte('date', new Date().toISOString())
      .order('date', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error getting upcoming events:', error);
      return { success: false, error, data: [] };
    }

    const events = data.map(event => ({
      id: event.id,
      name: event.name,
      type: event.type,
      date: event.date,
      location: event.location,
      imageUrl: event.image_url,
      attendees: event.attendees_count || 0,
      hostName: event.host?.full_name || event.host?.username,
      hostAvatar: event.host?.avatar_url,
    }));

    return { success: true, data: events, error: null };
  } catch (error) {
    console.error('Error in getUpcomingEvents:', error);
    return { success: false, error, data: [] };
  }
}

export default {
  searchTracks,
  searchUsers: searchUsersWrapper,
  searchEvents,
  searchAll,
  getTrendingTracks,
  getPopularUsers,
  getUpcomingEvents
};
