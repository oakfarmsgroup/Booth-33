import React, { createContext, useContext, useState } from 'react';

const SessionsContext = createContext();

export const useSessions = () => {
  const context = useContext(SessionsContext);
  if (!context) {
    throw new Error('useSessions must be used within SessionsProvider');
  }
  return context;
};

export const SessionsProvider = ({ children }) => {
  // Sessions state - stores all admin-uploaded sessions
  const [sessions, setSessions] = useState([
    // Mock example session for development
    {
      id: 9001,
      userId: 'user1',
      userName: 'Mike Soundz',
      bookingId: 1,
      sessionName: 'Music Recording Session',
      sessionType: 'music',
      sessionDate: 'Oct 20, 2025',
      status: 'delivered', // 'draft' | 'ready_to_deliver' | 'delivered'
      files: [
        {
          id: 9101,
          fileName: 'Final_Mix_Master.mp3',
          fileType: 'audio',
          fileSize: '8.4 MB',
          duration: '3:42',
          uploadedAt: new Date('2025-10-20T10:30:00'),
          status: 'ready', // 'uploading' | 'processing' | 'ready'
        },
        {
          id: 9102,
          fileName: 'Raw_Vocals_Track.mp3',
          fileType: 'audio',
          fileSize: '12.1 MB',
          duration: '3:45',
          uploadedAt: new Date('2025-10-20T10:32:00'),
          status: 'ready',
        },
      ],
      createdAt: new Date('2025-10-20T09:00:00'),
      deliveredAt: new Date('2025-10-20T11:00:00'),
    },
  ]);

  // Auto-create session from completed booking
  const createSessionFromBooking = (booking) => {
    const newSession = {
      id: Date.now(),
      userId: booking.userId || 'user1',
      userName: booking.user,
      bookingId: booking.id,
      sessionName: `${booking.type === 'music' ? 'Music' : 'Podcast'} Session - ${booking.date}`,
      sessionType: booking.type,
      sessionDate: booking.date,
      status: 'draft',
      files: [],
      createdAt: new Date(),
      deliveredAt: null,
    };

    setSessions([newSession, ...sessions]);
    return newSession;
  };

  // Manually create session
  const createSession = (userId, userName, sessionType, sessionName, sessionDate) => {
    const newSession = {
      id: Date.now(),
      userId: userId,
      userName: userName,
      bookingId: null, // No associated booking
      sessionName: sessionName || `${sessionType === 'music' ? 'Music' : 'Podcast'} Session`,
      sessionType: sessionType,
      sessionDate: sessionDate || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'draft',
      files: [],
      createdAt: new Date(),
      deliveredAt: null,
    };

    setSessions([newSession, ...sessions]);
    return newSession;
  };

  // Update session details (name, date)
  const updateSession = (sessionId, updates) => {
    setSessions(sessions.map(session =>
      session.id === sessionId
        ? { ...session, ...updates }
        : session
    ));
  };

  // Delete session
  const deleteSession = (sessionId) => {
    setSessions(sessions.filter(session => session.id !== sessionId));
  };

  // Add file to session (mock upload)
  const addFileToSession = (sessionId, file) => {
    const mockFile = {
      id: Date.now(),
      fileName: file.fileName || `File_${Date.now()}.mp3`,
      fileType: file.fileType || 'audio',
      fileSize: file.fileSize || '5.2 MB',
      duration: file.duration || '2:30',
      uploadedAt: new Date(),
      status: 'ready',
    };

    setSessions(sessions.map(session => {
      if (session.id === sessionId) {
        const updatedFiles = [...session.files, mockFile];
        const newStatus = updatedFiles.length > 0 && session.status === 'draft'
          ? 'ready_to_deliver'
          : session.status;

        return {
          ...session,
          files: updatedFiles,
          status: newStatus,
        };
      }
      return session;
    }));

    return mockFile;
  };

  // Remove file from session
  const removeFileFromSession = (sessionId, fileId) => {
    setSessions(sessions.map(session => {
      if (session.id === sessionId) {
        const updatedFiles = session.files.filter(file => file.id !== fileId);
        const newStatus = updatedFiles.length === 0 ? 'draft' : session.status;

        return {
          ...session,
          files: updatedFiles,
          status: newStatus,
        };
      }
      return session;
    }));
  };

  // Deliver session to user (makes files visible in their library)
  const deliverSession = (sessionId) => {
    setSessions(sessions.map(session =>
      session.id === sessionId
        ? {
            ...session,
            status: 'delivered',
            deliveredAt: new Date(),
          }
        : session
    ));
  };

  // Get sessions by status
  const getSessionsByStatus = (status) => {
    return sessions.filter(session => session.status === status);
  };

  // Get sessions by user
  const getSessionsByUser = (userId) => {
    return sessions.filter(session => session.userId === userId);
  };

  // Get delivered sessions for user library
  const getDeliveredSessionsForUser = (userId) => {
    return sessions.filter(session =>
      session.userId === userId && session.status === 'delivered'
    );
  };

  // Get all delivered sessions (for all users' libraries)
  const getAllDeliveredSessions = () => {
    return sessions.filter(session => session.status === 'delivered');
  };

  // Check if booking has session
  const hasSessionForBooking = (bookingId) => {
    return sessions.some(session => session.bookingId === bookingId);
  };

  // Get session by booking ID
  const getSessionByBooking = (bookingId) => {
    return sessions.find(session => session.bookingId === bookingId);
  };

  // Get sessions stats
  const getSessionsStats = () => {
    return {
      total: sessions.length,
      draft: sessions.filter(s => s.status === 'draft').length,
      readyToDeliver: sessions.filter(s => s.status === 'ready_to_deliver').length,
      delivered: sessions.filter(s => s.status === 'delivered').length,
      totalFiles: sessions.reduce((sum, s) => sum + s.files.length, 0),
    };
  };

  const value = {
    sessions,
    createSessionFromBooking,
    createSession,
    updateSession,
    deleteSession,
    addFileToSession,
    removeFileFromSession,
    deliverSession,
    getSessionsByStatus,
    getSessionsByUser,
    getDeliveredSessionsForUser,
    getAllDeliveredSessions,
    hasSessionForBooking,
    getSessionByBooking,
    getSessionsStats,
  };

  return (
    <SessionsContext.Provider value={value}>
      {children}
    </SessionsContext.Provider>
  );
};
