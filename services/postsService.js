import { supabase } from '../config/supabase';

/**
 * Posts Service
 * Handles social feed posts, likes, and comments
 */

// Create a new post
export const createPost = async (content, audioUrl = null, imageUrl = null) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('posts')
      .insert([
        {
          user_id: user.id,
          content,
          audio_url: audioUrl,
          image_url: imageUrl,
          created_at: new Date().toISOString(),
        },
      ])
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          username,
          avatar_url
        )
      `);

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Create post error:', error);
    return { success: false, error: error.message };
  }
};

// Get feed posts (with pagination)
export const getFeedPosts = async (limit = 20, offset = 0) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          username,
          avatar_url,
          verified
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Get feed posts error:', error);
    return { success: false, error: error.message };
  }
};

// Get user's posts
export const getUserPosts = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          username,
          avatar_url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Get user posts error:', error);
    return { success: false, error: error.message };
  }
};

// Like a post
export const likePost = async (postId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('likes')
      .insert([
        {
          user_id: user.id,
          post_id: postId,
        },
      ])
      .select();

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Like post error:', error);
    return { success: false, error: error.message };
  }
};

// Unlike a post
export const unlikePost = async (postId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('likes')
      .delete()
      .eq('user_id', user.id)
      .eq('post_id', postId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Unlike post error:', error);
    return { success: false, error: error.message };
  }
};

// Check if user liked a post
export const hasLikedPost = async (postId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: true, hasLiked: false };

    const { data, error } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('post_id', postId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return { success: true, hasLiked: !!data };
  } catch (error) {
    console.error('Check like error:', error);
    return { success: false, error: error.message };
  }
};

// Add a comment
export const addComment = async (postId, content) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          user_id: user.id,
          post_id: postId,
          content,
        },
      ])
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          username,
          avatar_url
        )
      `);

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Add comment error:', error);
    return { success: false, error: error.message };
  }
};

// Get post comments
export const getPostComments = async (postId) => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          username,
          avatar_url
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Get comments error:', error);
    return { success: false, error: error.message };
  }
};

// Delete a post
export const deletePost = async (postId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', user.id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Delete post error:', error);
    return { success: false, error: error.message };
  }
};

// Upload audio file
export const uploadAudio = async (fileUri, fileName) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const uniqueFileName = `${user.id}_${Date.now()}_${fileName}`;
    const filePath = `audio/${uniqueFileName}`;

    // Note: In React Native, file upload needs special handling
    // This is a placeholder - you'll need to implement proper file upload
    const { data, error } = await supabase.storage
      .from('audio')
      .upload(filePath, fileUri);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('audio')
      .getPublicUrl(filePath);

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Upload audio error:', error);
    return { success: false, error: error.message };
  }
};

// Upload image
export const uploadImage = async (fileUri, fileName) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const uniqueFileName = `${user.id}_${Date.now()}_${fileName}`;
    const filePath = `posts/${uniqueFileName}`;

    const { data, error } = await supabase.storage
      .from('posts')
      .upload(filePath, fileUri);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('posts')
      .getPublicUrl(filePath);

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Upload image error:', error);
    return { success: false, error: error.message };
  }
};

export default {
  createPost,
  getFeedPosts,
  getUserPosts,
  likePost,
  unlikePost,
  hasLikedPost,
  addComment,
  getPostComments,
  deletePost,
  uploadAudio,
  uploadImage,
};
