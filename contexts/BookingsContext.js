import React, { createContext, useContext, useState } from 'react';

const BookingsContext = createContext();

export const useBookings = () => {
  const context = useContext(BookingsContext);
  if (!context) {
    throw new Error('useBookings must be used within BookingsProvider');
  }
  return context;
};

export const BookingsProvider = ({ children }) => {
  const [bookings, setBookings] = useState([
    // Mock existing booking for demo
    {
      id: 1,
      type: 'music',
      date: new Date(2025, 9, 28), // Oct 28, 2025
      timeSlot: '11:00 AM',
      duration: 2,
      price: 120,
      notes: 'Recording new single',
      status: 'confirmed', // 'pending', 'confirmed', 'cancelled', 'completed'
      createdAt: new Date(),
    },
  ]);

  const [events, setEvents] = useState([
    // Mock event for demo
    {
      id: 'evt1',
      name: 'Open Mic Night',
      type: 'open-mic', // 'open-mic', 'listening-party', 'workshop', 'private'
      description: 'Join us for an evening of live performances! All skill levels welcome.',
      date: new Date(2025, 9, 30), // Oct 30, 2025
      timeSlot: '7:00 PM',
      duration: 3,
      maxAttendees: 50,
      currentAttendees: 12,
      price: 0, // Free event
      imageUrl: null,
      autoPostToFeed: true,
      createdAt: new Date(),
      rsvps: [], // Array of user IDs who RSVP'd
    },
  ]);

  const addBooking = (booking) => {
    const newBooking = {
      ...booking,
      id: Date.now(),
      status: 'pending',
      createdAt: new Date(),
    };
    setBookings([...bookings, newBooking]);
    return newBooking;
  };

  const cancelBooking = (bookingId) => {
    setBookings(bookings.map(booking =>
      booking.id === bookingId
        ? { ...booking, status: 'cancelled' }
        : booking
    ));
  };

  const completeBooking = (bookingId) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return null;

    setBookings(bookings.map(b =>
      b.id === bookingId
        ? { ...b, status: 'completed' }
        : b
    ));

    return booking; // Return booking for session auto-creation
  };

  const getUpcomingBookings = () => {
    const now = new Date();
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.date);
      return bookingDate >= now && booking.status !== 'cancelled';
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const getPastBookings = () => {
    const now = new Date();
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.date);
      return bookingDate < now || booking.status === 'cancelled';
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const addEvent = (event) => {
    const newEvent = {
      ...event,
      id: 'evt' + Date.now(),
      createdAt: new Date(),
      rsvps: [],
      currentAttendees: 0,
    };
    setEvents([...events, newEvent]);
    return newEvent;
  };

  const cancelEvent = (eventId) => {
    setEvents(events.filter(event => event.id !== eventId));
  };

  const rsvpToEvent = (eventId, userId = 'current-user') => {
    setEvents(events.map(event => {
      if (event.id === eventId) {
        if (!event.rsvps.includes(userId)) {
          return {
            ...event,
            rsvps: [...event.rsvps, userId],
            currentAttendees: event.currentAttendees + 1,
          };
        }
      }
      return event;
    }));
  };

  const unrsvpFromEvent = (eventId, userId = 'current-user') => {
    setEvents(events.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          rsvps: event.rsvps.filter(id => id !== userId),
          currentAttendees: Math.max(0, event.currentAttendees - 1),
        };
      }
      return event;
    }));
  };

  const getUpcomingEvents = () => {
    const now = new Date();
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= now;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const isUserRSVPd = (eventId, userId = 'current-user') => {
    const event = events.find(e => e.id === eventId);
    return event ? event.rsvps.includes(userId) : false;
  };

  const getEventForTimeSlot = (date, timeSlot) => {
    const checkDate = new Date(date);
    const dateEvents = events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === checkDate.toDateString();
    });

    const timeSlots = [
      '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
      '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
      '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM'
    ];

    for (const event of dateEvents) {
      const eventStartIndex = timeSlots.indexOf(event.timeSlot);
      const eventSlots = [];
      for (let i = 0; i < event.duration; i++) {
        if (eventStartIndex + i < timeSlots.length) {
          eventSlots.push(timeSlots[eventStartIndex + i]);
        }
      }
      if (eventSlots.includes(timeSlot)) {
        return event;
      }
    }
    return null;
  };

  const isTimeSlotBooked = (date, timeSlot, duration) => {
    // Check if there's an event at this time
    const event = getEventForTimeSlot(date, timeSlot);
    if (event) return true;

    // Get all bookings for this date
    const dateBookings = bookings.filter(booking => {
      if (booking.status === 'cancelled') return false;
      const bookingDate = new Date(booking.date);
      const checkDate = new Date(date);
      return bookingDate.toDateString() === checkDate.toDateString();
    });

    // Check if the requested time slot conflicts with any existing bookings
    const timeSlots = [
      '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
      '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
      '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM'
    ];

    const requestedStartIndex = timeSlots.indexOf(timeSlot);
    if (requestedStartIndex === -1) return false;

    // Get all slots that would be occupied by this booking
    const requestedSlots = [];
    for (let i = 0; i < duration; i++) {
      if (requestedStartIndex + i < timeSlots.length) {
        requestedSlots.push(timeSlots[requestedStartIndex + i]);
      }
    }

    // Check each existing booking for conflicts
    for (const booking of dateBookings) {
      const bookingStartIndex = timeSlots.indexOf(booking.timeSlot);
      const bookingSlots = [];
      for (let i = 0; i < booking.duration; i++) {
        if (bookingStartIndex + i < timeSlots.length) {
          bookingSlots.push(timeSlots[bookingStartIndex + i]);
        }
      }

      // Check if any requested slots overlap with this booking's slots
      const hasConflict = requestedSlots.some(slot => bookingSlots.includes(slot));
      if (hasConflict) return true;
    }

    return false;
  };

  const value = {
    bookings,
    addBooking,
    cancelBooking,
    completeBooking,
    getUpcomingBookings,
    getPastBookings,
    isTimeSlotBooked,
    // Events
    events,
    addEvent,
    cancelEvent,
    rsvpToEvent,
    unrsvpFromEvent,
    getUpcomingEvents,
    isUserRSVPd,
    getEventForTimeSlot,
  };

  return (
    <BookingsContext.Provider value={value}>
      {children}
    </BookingsContext.Provider>
  );
};
