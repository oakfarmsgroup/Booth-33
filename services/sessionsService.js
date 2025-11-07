import { supabase } from '../config/supabase';
import { getCurrentUser } from './authService';

/**
 * Get all delivered sessions for the current user
 * @returns {Promise<{success: boolean, data: any[], error: any}>}
 */
export async function getUserSessions() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated', data: [] };
    }

    const { data, error } = await supabase
      .from('sessions')
      .select(`
        id,
        session_name,
        session_type,
        session_date,
        status,
        delivered_at,
        created_at,
        session_files (
          id,
          file_name,
          file_type,
          file_size,
          duration,
          file_url,
          status,
          uploaded_at
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'delivered')
      .order('delivered_at', { ascending: false });

    if (error) {
      console.error('Error fetching sessions:', error);
      return { success: false, error, data: [] };
    }

    // Transform data to match LibraryScreen format
    const sessions = data.map(session => ({
      id: session.id,
      type: session.session_type,
      name: session.session_name,
      date: new Date(session.session_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      status: session.status,
      deliveredAt: session.delivered_at,
      files: (session.session_files || []).map(file => ({
        id: file.id,
        name: file.file_name,
        type: file.file_type,
        size: file.file_size,
        duration: file.duration,
        url: file.file_url,
        status: file.status,
        uploadedAt: file.uploaded_at
      }))
    }));

    return { success: true, data: sessions, error: null };
  } catch (error) {
    console.error('Error in getUserSessions:', error);
    return { success: false, error, data: [] };
  }
}

/**
 * Get a specific session by ID
 * @param {string} sessionId
 * @returns {Promise<{success: boolean, data: any, error: any}>}
 */
export async function getSession(sessionId) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated', data: null };
    }

    const { data, error } = await supabase
      .from('sessions')
      .select(`
        *,
        session_files (*)
      `)
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching session:', error);
      return { success: false, error, data: null };
    }

    return { success: true, data, error: null };
  } catch (error) {
    console.error('Error in getSession:', error);
    return { success: false, error, data: null };
  }
}

/**
 * Create a new session (typically called by admin after delivering files)
 * @param {object} sessionData
 * @returns {Promise<{success: boolean, data: any, error: any}>}
 */
export async function createSession(sessionData) {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .insert([{
        user_id: sessionData.userId,
        booking_id: sessionData.bookingId,
        session_name: sessionData.sessionName,
        session_type: sessionData.sessionType,
        session_date: sessionData.sessionDate,
        status: 'delivered',
        delivered_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating session:', error);
      return { success: false, error, data: null };
    }

    return { success: true, data, error: null };
  } catch (error) {
    console.error('Error in createSession:', error);
    return { success: false, error, data: null };
  }
}

/**
 * Add a file to a session
 * @param {string} sessionId
 * @param {object} fileData
 * @returns {Promise<{success: boolean, data: any, error: any}>}
 */
export async function addSessionFile(sessionId, fileData) {
  try {
    const { data, error } = await supabase
      .from('session_files')
      .insert([{
        session_id: sessionId,
        file_name: fileData.fileName,
        file_type: fileData.fileType,
        file_url: fileData.fileUrl,
        file_size: fileData.fileSize,
        duration: fileData.duration,
        status: 'ready'
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding session file:', error);
      return { success: false, error, data: null };
    }

    return { success: true, data, error: null };
  } catch (error) {
    console.error('Error in addSessionFile:', error);
    return { success: false, error, data: null };
  }
}

/**
 * Delete a session and all its files
 * @param {string} sessionId
 * @returns {Promise<{success: boolean, error: any}>}
 */
export async function deleteSession(sessionId) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Files will be deleted automatically via CASCADE
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting session:', error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error in deleteSession:', error);
    return { success: false, error };
  }
}

/**
 * Delete a specific file from a session
 * @param {string} fileId
 * @returns {Promise<{success: boolean, error: any}>}
 */
export async function deleteSessionFile(fileId) {
  try {
    const { error } = await supabase
      .from('session_files')
      .delete()
      .eq('id', fileId);

    if (error) {
      console.error('Error deleting session file:', error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error in deleteSessionFile:', error);
    return { success: false, error };
  }
}

/**
 * Search sessions by name or file name
 * @param {string} query
 * @returns {Promise<{success: boolean, data: any[], error: any}>}
 */
export async function searchSessions(query) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated', data: [] };
    }

    // Search by session name
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .select(`
        id,
        session_name,
        session_type,
        session_date,
        status,
        delivered_at,
        session_files (*)
      `)
      .eq('user_id', user.id)
      .eq('status', 'delivered')
      .ilike('session_name', `%${query}%`);

    if (sessionError) {
      console.error('Error searching sessions:', sessionError);
      return { success: false, error: sessionError, data: [] };
    }

    return { success: true, data: sessionData, error: null };
  } catch (error) {
    console.error('Error in searchSessions:', error);
    return { success: false, error, data: [] };
  }
}

export default {
  getUserSessions,
  getSession,
  createSession,
  addSessionFile,
  deleteSession,
  deleteSessionFile,
  searchSessions
};
