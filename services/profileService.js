import { supabase } from '../config/supabase';

/**
 * Profile Service
 * Handles user profile operations with Supabase
 */

// Get user profile
export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Get user profile error:', error);
    return { success: false, error: error.message };
  }
};

// Update user profile
export const updateUserProfile = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select();

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Update user profile error:', error);
    return { success: false, error: error.message };
  }
};

// Upload profile avatar
export const uploadAvatar = async (userId, fileUri, fileType = 'image/jpeg') => {
  try {
    // Generate unique filename
    const fileName = `${userId}-${Date.now()}.jpg`;
    const filePath = `avatars/${fileName}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(filePath, {
        uri: fileUri,
        type: fileType,
        name: fileName,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profiles')
      .getPublicUrl(filePath);

    // Update profile with new avatar URL
    const { data, error } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', userId)
      .select();

    if (error) throw error;

    return { success: true, data: data[0], url: publicUrl };
  } catch (error) {
    console.error('Upload avatar error:', error);
    return { success: false, error: error.message };
  }
};

// Follow a user
export const followUser = async (followerId, followingId) => {
  try {
    const { data, error } = await supabase
      .from('follows')
      .insert([
        {
          follower_id: followerId,
          following_id: followingId,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Follow user error:', error);
    return { success: false, error: error.message };
  }
};

// Unfollow a user
export const unfollowUser = async (followerId, followingId) => {
  try {
    const { data, error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Unfollow user error:', error);
    return { success: false, error: error.message };
  }
};

// Get followers
export const getFollowers = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('follows')
      .select('follower_id, profiles!follows_follower_id_fkey(*)')
      .eq('following_id', userId);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Get followers error:', error);
    return { success: false, error: error.message };
  }
};

// Get following
export const getFollowing = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('follows')
      .select('following_id, profiles!follows_following_id_fkey(*)')
      .eq('follower_id', userId);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Get following error:', error);
    return { success: false, error: error.message };
  }
};

// Check if user is following another user
export const isFollowing = async (followerId, followingId) => {
  try {
    const { data, error } = await supabase
      .from('follows')
      .select('*')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"

    return { success: true, isFollowing: !!data };
  } catch (error) {
    console.error('Check following error:', error);
    return { success: false, error: error.message };
  }
};

// Search users
export const searchUsers = async (query) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`full_name.ilike.%${query}%,username.ilike.%${query}%`)
      .limit(20);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Search users error:', error);
    return { success: false, error: error.message };
  }
};

// Get user stats
export const getUserStats = async (userId) => {
  try {
    // Get followers count
    const { count: followersCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId);

    // Get following count
    const { count: followingCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId);

    // Get posts count
    const { count: postsCount } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get sessions count
    const { count: sessionsCount } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed');

    return {
      success: true,
      data: {
        followers: followersCount || 0,
        following: followingCount || 0,
        posts: postsCount || 0,
        sessions: sessionsCount || 0,
      },
    };
  } catch (error) {
    console.error('Get user stats error:', error);
    return { success: false, error: error.message };
  }
};

export default {
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  isFollowing,
  searchUsers,
  getUserStats,
};
