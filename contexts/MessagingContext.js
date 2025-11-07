import React, { createContext, useContext, useState, useEffect } from 'react';
import * as messagingService from '../services/messagingService';
import { getCurrentUser } from '../config/supabase';

const MessagingContext = createContext();

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
};

export const MessagingProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [messageSubscription, setMessageSubscription] = useState(null);

  // Load current user and conversations on mount
  useEffect(() => {
    loadUserAndConversations();

    // Cleanup subscription on unmount
    return () => {
      if (messageSubscription) {
        messagingService.unsubscribeFromMessages(messageSubscription);
      }
    };
  }, []);

  const loadUserAndConversations = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        setLoading(false);
        return;
      }

      setCurrentUserId(user.id);
      await loadConversations();
      await loadUnreadCount();

      // Subscribe to real-time messages
      const subscription = await messagingService.subscribeToMessages(handleNewMessage);
      setMessageSubscription(subscription);
    } catch (error) {
      console.error('Error loading messaging data:', error);
      setLoading(false);
    }
  };

  const loadConversations = async () => {
    setLoading(true);
    try {
      const result = await messagingService.getConversations();
      if (result.success) {
        setConversations(result.data || []);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const result = await messagingService.getUnreadCount();
      if (result.success) {
        setUnreadCount(result.data || 0);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const handleNewMessage = (newMessage) => {
    // Update conversations with new message
    loadConversations();
    loadUnreadCount();
  };

  // Send a message
  const sendMessage = async (recipientId, text) => {
    try {
      const result = await messagingService.sendMessage(recipientId, text);
      if (result.success) {
        // Refresh conversations to show new message
        await loadConversations();
        return result.data;
      }
      return null;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  };

  // Get conversation with a specific user
  const getConversation = async (otherUserId, limit = 50) => {
    try {
      const result = await messagingService.getConversation(otherUserId, limit);
      if (result.success) {
        return result.data;
      }
      return [];
    } catch (error) {
      console.error('Error getting conversation:', error);
      return [];
    }
  };

  // Get conversation by conversation ID (from local state)
  const getConversationById = (conversationId) => {
    return conversations.find(conv => conv.id === conversationId);
  };

  // Get conversation by user ID (from local state)
  const getConversationByUser = (userId) => {
    return conversations.find(conv => conv.otherUserId === userId);
  };

  // Start a new conversation (just send first message)
  const startConversation = async (userId, userName, userAvatar, initialMessage = null) => {
    if (initialMessage) {
      const result = await sendMessage(userId, initialMessage);
      if (result) {
        // Conversation will be created automatically
        await loadConversations();
        return getConversationByUser(userId);
      }
    }

    // Return placeholder conversation for UI
    return {
      id: `temp_${Date.now()}`,
      otherUserId: userId,
      otherUserName: userName,
      otherUserAvatar: userAvatar,
      lastMessage: '',
      lastMessageTime: new Date(),
      unreadCount: 0,
      messages: [],
    };
  };

  // Mark conversation as read
  const markConversationAsRead = async (otherUserId) => {
    try {
      const result = await messagingService.markMessagesAsRead(otherUserId);
      if (result.success) {
        // Update local state
        setConversations(conversations.map(conv => {
          if (conv.otherUserId === otherUserId) {
            return { ...conv, unreadCount: 0 };
          }
          return conv;
        }));
        await loadUnreadCount();
      }
    } catch (error) {
      console.error('Error marking conversation as read:', error);
    }
  };

  // Delete conversation (delete all messages with user)
  const deleteConversation = async (conversationId) => {
    try {
      // Note: messagingService doesn't have deleteConversation,
      // but we can remove it from local state
      setConversations(conversations.filter(conv => conv.id !== conversationId));
      // TODO: Implement backend deleteConversation if needed
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  // Get total unread count
  const getTotalUnreadCount = () => {
    return unreadCount;
  };

  // Get recent conversations (already sorted by service)
  const getRecentConversations = (limit = 20) => {
    return conversations.slice(0, limit);
  };

  // Refresh conversations
  const refreshConversations = async () => {
    await loadConversations();
    await loadUnreadCount();
  };

  const value = {
    conversations,
    loading,
    unreadCount,
    currentUserId,
    sendMessage,
    startConversation,
    markConversationAsRead,
    deleteConversation,
    getConversation,
    getConversationById,
    getConversationByUser,
    getTotalUnreadCount,
    getRecentConversations,
    refreshConversations,
  };

  return (
    <MessagingContext.Provider value={value}>
      {children}
    </MessagingContext.Provider>
  );
};
