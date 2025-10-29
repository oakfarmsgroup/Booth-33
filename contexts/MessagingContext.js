import React, { createContext, useContext, useState } from 'react';

const MessagingContext = createContext();

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
};

export const MessagingProvider = ({ children }) => {
  // Conversations list
  const [conversations, setConversations] = useState([
    {
      id: 'conv_1',
      userId: 'user_2',
      userName: 'Mike Soundz',
      userAvatar: require('../assets/images/Artist.png'),
      lastMessage: 'That beat is fire! 🔥 Want to collab on a track?',
      lastMessageTime: new Date(2025, 9, 27, 15, 30),
      unreadCount: 2,
      messages: [
        {
          id: 'msg_1',
          senderId: 'user_2',
          senderName: 'Mike Soundz',
          text: 'Hey! I listened to your latest track on the feed',
          timestamp: new Date(2025, 9, 27, 14, 0),
          read: true,
        },
        {
          id: 'msg_2',
          senderId: 'current_user',
          senderName: 'You',
          text: 'Thanks! Appreciate it 🙏',
          timestamp: new Date(2025, 9, 27, 14, 15),
          read: true,
        },
        {
          id: 'msg_3',
          senderId: 'user_2',
          senderName: 'Mike Soundz',
          text: 'That beat is fire! 🔥 Want to collab on a track?',
          timestamp: new Date(2025, 9, 27, 15, 30),
          read: false,
        },
      ],
    },
    {
      id: 'conv_2',
      userId: 'user_3',
      userName: 'Sarah J',
      userAvatar: require('../assets/images/Artist.png'),
      lastMessage: 'See you at the studio tomorrow!',
      lastMessageTime: new Date(2025, 9, 26, 18, 45),
      unreadCount: 0,
      messages: [
        {
          id: 'msg_4',
          senderId: 'user_3',
          senderName: 'Sarah J',
          text: 'Hey! Are you coming to the Open Mic Night event?',
          timestamp: new Date(2025, 9, 26, 17, 0),
          read: true,
        },
        {
          id: 'msg_5',
          senderId: 'current_user',
          senderName: 'You',
          text: 'Yes! Already RSVP\'d. Can\'t wait!',
          timestamp: new Date(2025, 9, 26, 17, 30),
          read: true,
        },
        {
          id: 'msg_6',
          senderId: 'user_3',
          senderName: 'Sarah J',
          text: 'See you at the studio tomorrow!',
          timestamp: new Date(2025, 9, 26, 18, 45),
          read: true,
        },
      ],
    },
  ]);

  // Send a message
  const sendMessage = (conversationId, text) => {
    const newMessage = {
      id: `msg_${Date.now()}`,
      senderId: 'current_user',
      senderName: 'You',
      text: text,
      timestamp: new Date(),
      read: true,
    };

    setConversations(conversations.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          messages: [...conv.messages, newMessage],
          lastMessage: text,
          lastMessageTime: newMessage.timestamp,
        };
      }
      return conv;
    }));

    return newMessage;
  };

  // Start a new conversation
  const startConversation = (userId, userName, userAvatar, initialMessage = null) => {
    // Check if conversation already exists
    const existing = conversations.find(conv => conv.userId === userId);
    if (existing) {
      return existing;
    }

    const newConversation = {
      id: `conv_${Date.now()}`,
      userId,
      userName,
      userAvatar: userAvatar || require('../assets/images/Artist.png'),
      lastMessage: initialMessage || '',
      lastMessageTime: new Date(),
      unreadCount: 0,
      messages: initialMessage ? [{
        id: `msg_${Date.now()}`,
        senderId: 'current_user',
        senderName: 'You',
        text: initialMessage,
        timestamp: new Date(),
        read: true,
      }] : [],
    };

    setConversations([newConversation, ...conversations]);
    return newConversation;
  };

  // Mark conversation as read
  const markConversationAsRead = (conversationId) => {
    setConversations(conversations.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          unreadCount: 0,
          messages: conv.messages.map(msg => ({ ...msg, read: true })),
        };
      }
      return conv;
    }));
  };

  // Delete conversation
  const deleteConversation = (conversationId) => {
    setConversations(conversations.filter(conv => conv.id !== conversationId));
  };

  // Get conversation by ID
  const getConversation = (conversationId) => {
    return conversations.find(conv => conv.id === conversationId);
  };

  // Get conversation by user ID
  const getConversationByUser = (userId) => {
    return conversations.find(conv => conv.userId === userId);
  };

  // Get total unread count
  const getTotalUnreadCount = () => {
    return conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
  };

  // Get recent conversations
  const getRecentConversations = (limit = 20) => {
    return [...conversations]
      .sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime))
      .slice(0, limit);
  };

  // Simulate receiving a message (for demo purposes)
  const simulateIncomingMessage = (conversationId, text, senderName) => {
    const newMessage = {
      id: `msg_${Date.now()}`,
      senderId: conversationId.replace('conv_', 'user_'),
      senderName: senderName,
      text: text,
      timestamp: new Date(),
      read: false,
    };

    setConversations(conversations.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          messages: [...conv.messages, newMessage],
          lastMessage: text,
          lastMessageTime: newMessage.timestamp,
          unreadCount: conv.unreadCount + 1,
        };
      }
      return conv;
    }));

    return newMessage;
  };

  const value = {
    conversations,
    sendMessage,
    startConversation,
    markConversationAsRead,
    deleteConversation,
    getConversation,
    getConversationByUser,
    getTotalUnreadCount,
    getRecentConversations,
    simulateIncomingMessage, // For demo/testing
  };

  return (
    <MessagingContext.Provider value={value}>
      {children}
    </MessagingContext.Provider>
  );
};
