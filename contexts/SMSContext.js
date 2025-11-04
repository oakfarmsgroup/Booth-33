import React, { createContext, useContext, useState } from 'react';

const SMSContext = createContext();

export const useSMS = () => {
  const context = useContext(SMSContext);
  if (!context) {
    throw new Error('useSMS must be used within SMSProvider');
  }
  return context;
};

export const SMSProvider = ({ children }) => {
  const [smsHistory, setSmsHistory] = useState([]);
  const [scheduledSMS, setScheduledSMS] = useState([]);

  // Schedule an SMS notification for a booking
  const scheduleSMSNotification = (bookingId, phoneNumber, message, sendTime, type = '1_day_before') => {
    const sms = {
      id: Date.now(),
      bookingId,
      phoneNumber,
      message,
      sendTime,
      type, // '1_day_before' or '1_hour_before'
      status: 'scheduled',
      createdAt: new Date(),
    };

    setScheduledSMS([...scheduledSMS, sms]);
    return sms;
  };

  // Schedule both reminders for a booking (1 day + 1 hour before)
  const scheduleBookingReminders = (bookingId, phoneNumber, sessionDetails) => {
    const { date, timeSlot, type: sessionType } = sessionDetails;
    const bookingDateTime = new Date(date);

    // Parse time slot (e.g., "2:00 PM")
    const [time, period] = timeSlot.split(' ');
    const [hours, minutes] = time.split(':');
    let hour = parseInt(hours);
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    bookingDateTime.setHours(hour, parseInt(minutes), 0, 0);

    // 1 day before
    const oneDayBefore = new Date(bookingDateTime);
    oneDayBefore.setDate(oneDayBefore.getDate() - 1);

    // 1 hour before
    const oneHourBefore = new Date(bookingDateTime);
    oneHourBefore.setHours(oneHourBefore.getHours() - 1);

    const sessionTypeName = sessionType === 'music' ? 'Music Recording' : 'Podcast Recording';

    // Schedule 1 day before SMS
    const dayBeforeSMS = scheduleSMSNotification(
      bookingId,
      phoneNumber,
      `Reminder: Your ${sessionTypeName} session at Booth 33 is tomorrow at ${timeSlot}. We can't wait to see you! 🎵`,
      oneDayBefore,
      '1_day_before'
    );

    // Schedule 1 hour before SMS
    const hourBeforeSMS = scheduleSMSNotification(
      bookingId,
      phoneNumber,
      `Your ${sessionTypeName} session at Booth 33 starts in 1 hour! See you at ${timeSlot}. 🎙️`,
      oneHourBefore,
      '1_hour_before'
    );

    return [dayBeforeSMS, hourBeforeSMS];
  };

  // Mark SMS as sent (mock - in real app this would be triggered by actual SMS service)
  const markAsSent = (smsId) => {
    setScheduledSMS(scheduledSMS.map(sms =>
      sms.id === smsId ? { ...sms, status: 'sent', sentAt: new Date() } : sms
    ));

    // Add to history
    const sentSMS = scheduledSMS.find(sms => sms.id === smsId);
    if (sentSMS) {
      setSmsHistory([{ ...sentSMS, status: 'sent', sentAt: new Date() }, ...smsHistory]);
    }
  };

  // Cancel a scheduled SMS
  const cancelSMS = (smsId) => {
    setScheduledSMS(scheduledSMS.filter(sms => sms.id !== smsId));
  };

  // Cancel all SMS for a booking
  const cancelBookingSMS = (bookingId) => {
    setScheduledSMS(scheduledSMS.filter(sms => sms.bookingId !== bookingId));
  };

  // Get scheduled SMS for a booking
  const getBookingSMS = (bookingId) => {
    return scheduledSMS.filter(sms => sms.bookingId === bookingId);
  };

  // Get SMS history
  const getSMSHistory = () => {
    return smsHistory.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
  };

  // Get all scheduled SMS
  const getScheduledSMS = () => {
    return scheduledSMS.sort((a, b) => new Date(a.sendTime) - new Date(b.sendTime));
  };

  // Mock auto-send function (in real app, this would be handled by backend/cron job)
  // For demo purposes, we can manually trigger this
  const processScheduledSMS = () => {
    const now = new Date();
    const toSend = scheduledSMS.filter(sms =>
      sms.status === 'scheduled' && new Date(sms.sendTime) <= now
    );

    toSend.forEach(sms => {
      markAsSent(sms.id);
      console.log(`[MOCK SMS] Sent to ${sms.phoneNumber}: ${sms.message}`);
    });

    return toSend.length;
  };

  const value = {
    smsHistory,
    scheduledSMS,
    scheduleSMSNotification,
    scheduleBookingReminders,
    markAsSent,
    cancelSMS,
    cancelBookingSMS,
    getBookingSMS,
    getSMSHistory,
    getScheduledSMS,
    processScheduledSMS,
  };

  return (
    <SMSContext.Provider value={value}>
      {children}
    </SMSContext.Provider>
  );
};
