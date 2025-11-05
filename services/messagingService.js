import { supabase } from '../config/supabase';

/**
 * Messaging Service
 * Handles direct messages with real-time subscriptions
 */

// Send a message
export const sendMessage = async (recipientId, content) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          sender_id: user.id,
          recipient_id: recipientId,
          content,
          created_at: new Date().toISOString(),
        },
      ])
      .select(`
        *,
        sender:sender_id (
          id,
          full_name,
          username,
          avatar_url
        ),
        recipient:recipient_id (
          id,
          full_name,
          username,
          avatar_url
        )
      `);

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Send message error:', error);
    return { success: false, error: error.message };
  }
};

// Get conversation between two users
export const getConversation = async (otherUserId, limit = 50) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error} = await supabase
      .from('messages')
      .select(`
        *,
        sender:sender_id (
          id,
          full_name,
          username,
          avatar_url
        ),
        recipient:recipient_id (
          id,
          full_name,
          username,
          avatar_url
        )
      `)
      .or(`and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Get conversation error:', error);
    return { success: false, error: error.message };
  }
};

// Get all conversations (list of users you've messaged)
export const getConversations = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get unique users from messages
    const { data, error } = await supabase
      .from('messages')
      .select('sender_id, recipient_id, content, created_at, read')
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Group by conversation partner
    const conversationsMap = new Map();

    for (const msg of data) {
      const partnerId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;

      if (!conversationsMap.has(partnerId)) {
        conversationsMap.set(partnerId, {
          userId: partnerId,
          lastMessage: msg.content,
          lastMessageTime: msg.created_at,
          unreadCount: 0,
        });
      }

      // Count unread messages (messages sent to current user that are unread)
      if (msg.recipient_id === user.id && !msg.read) {
        const conv = conversationsMap.get(partnerId);
        conv.unreadCount++;
      }
    }

    // Get partner profiles
    const partnerIds = Array.from(conversationsMap.keys());
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', partnerIds);

    if (profilesError) throw profilesError;

    // Combine data
    const conversations = Array.from(conversationsMap.values()).map(conv => {
      const profile = profiles.find(p => p.id === conv.userId);
      return {
        ...conv,
        userName: profile?.full_name || 'Unknown',
        username: profile?.username || '',
        userAvatar: profile?.avatar_url || null,
      };
    });

    return { success: true, data: conversations };
  } catch (error) {
    console.error('Get conversations error:', error);
    return { success: false, error: error.message };
  }
};

// Mark messages as read
export const markMessagesAsRead = async (senderId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('recipient_id', user.id)
      .eq('sender_id', senderId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Mark messages read error:', error);
    return { success: false, error: error.message };
  }
};

// Get unread message count
export const getUnreadCount = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', user.id)
      .eq('read', false);

    if (error) throw error;
    return { success: true, count: count || 0 };
  } catch (error) {
    console.error('Get unread count error:', error);
    return { success: false, error: error.message };
  }
};

// Subscribe to new messages (real-time)
export const subscribeToMessages = (callback) => {
  const { data: { user } } = supabase.auth.getUser();

  const subscription = supabase
    .channel('messages')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `recipient_id=eq.${user.id}`,
      },
      (payload) => {
        console.log('New message received:', payload.new);
        callback(payload.new);
      }
    )
    .subscribe();

  return subscription;
};

// Unsubscribe from messages
export const unsubscribeFromMessages = (subscription) => {
  if (subscription) {
    subscription.unsubscribe();
  }
};

// Delete a message
export const deleteMessage = async (messageId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)
      .eq('sender_id', user.id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Delete message error:', error);
    return { success: false, error: error.message };
  }
};

export default {
  sendMessage,
  getConversation,
  getConversations,
  markMessagesAsRead,
  getUnreadCount,
  subscribeToMessages,
  unsubscribeFromMessages,
  deleteMessage,
};
