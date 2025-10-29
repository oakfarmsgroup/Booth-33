import React, { createContext, useContext, useState } from 'react';

const SearchContext = createContext();

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

export const SearchProvider = ({ children }) => {
  // Sample data for search
  const [tracks] = useState([
    { id: 1, title: 'Midnight Vibes', artist: 'Mike Soundz', genre: 'Hip-Hop', plays: 2420 },
    { id: 2, title: 'Summer Dreams', artist: 'Sarah J', genre: 'Pop', plays: 1850 },
    { id: 3, title: 'Electric Pulse', artist: 'Jay Beats', genre: 'Electronic', plays: 3200 },
    { id: 4, title: 'Late Night Session', artist: 'Lisa Chen', genre: 'R&B', plays: 1920 },
    { id: 5, title: 'City Lights', artist: 'Mike Soundz', genre: 'Hip-Hop', plays: 2100 },
    { id: 6, title: 'Acoustic Soul', artist: 'Alex Rivera', genre: 'Acoustic', plays: 890 },
  ]);

  const [users] = useState([
    { id: 1, name: 'Mike Soundz', username: '@mikesoundz', genre: 'Hip-Hop Producer', followers: 2400 },
    { id: 2, name: 'Sarah J', username: '@sarahj', genre: 'Pop Artist', followers: 1850 },
    { id: 3, name: 'Jay Beats', username: '@jaybeats', genre: 'DJ & Producer', followers: 3200 },
    { id: 4, name: 'Lisa Chen', username: '@lisachen', genre: 'R&B Singer', followers: 1920 },
    { id: 5, name: 'Alex Rivera', username: '@alexrivera', genre: 'Multi-Instrumentalist', followers: 847 },
  ]);

  const [events] = useState([
    { id: 1, name: 'Open Mic Night', type: 'open-mic', date: new Date(2025, 9, 30), attendees: 45 },
    { id: 2, name: 'Beat Making Workshop', type: 'workshop', date: new Date(2025, 10, 5), attendees: 20 },
    { id: 3, name: 'Jazz Listening Party', type: 'listening-party', date: new Date(2025, 10, 8), attendees: 30 },
  ]);

  // Recent searches
  const [recentSearches, setRecentSearches] = useState([
    'Mike Soundz',
    'Hip-Hop beats',
    'Open Mic',
  ]);

  // Search query state
  const [searchQuery, setSearchQuery] = useState('');

  // Add to recent searches
  const addRecentSearch = (query) => {
    if (!query.trim()) return;

    // Remove if already exists
    const filtered = recentSearches.filter(s => s.toLowerCase() !== query.toLowerCase());
    // Add to beginning
    const updated = [query, ...filtered].slice(0, 10); // Keep max 10
    setRecentSearches(updated);
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  // Remove single recent search
  const removeRecentSearch = (query) => {
    setRecentSearches(recentSearches.filter(s => s !== query));
  };

  // Search tracks
  const searchTracks = (query) => {
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase();
    return tracks.filter(track =>
      track.title.toLowerCase().includes(lowerQuery) ||
      track.artist.toLowerCase().includes(lowerQuery) ||
      track.genre.toLowerCase().includes(lowerQuery)
    );
  };

  // Search users
  const searchUsers = (query) => {
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase();
    return users.filter(user =>
      user.name.toLowerCase().includes(lowerQuery) ||
      user.username.toLowerCase().includes(lowerQuery) ||
      user.genre.toLowerCase().includes(lowerQuery)
    );
  };

  // Search events
  const searchEvents = (query) => {
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase();
    return events.filter(event =>
      event.name.toLowerCase().includes(lowerQuery) ||
      event.type.toLowerCase().includes(lowerQuery)
    );
  };

  // Search all (unified search)
  const searchAll = (query) => {
    if (!query.trim()) {
      return {
        tracks: [],
        users: [],
        events: [],
        total: 0,
      };
    }

    const trackResults = searchTracks(query);
    const userResults = searchUsers(query);
    const eventResults = searchEvents(query);

    return {
      tracks: trackResults,
      users: userResults,
      events: eventResults,
      total: trackResults.length + userResults.length + eventResults.length,
    };
  };

  // Get trending tracks
  const getTrendingTracks = (limit = 5) => {
    return [...tracks].sort((a, b) => b.plays - a.plays).slice(0, limit);
  };

  // Get popular users
  const getPopularUsers = (limit = 5) => {
    return [...users].sort((a, b) => b.followers - a.followers).slice(0, limit);
  };

  // Get upcoming events
  const getUpcomingEvents = (limit = 5) => {
    return [...events]
      .filter(event => new Date(event.date) > new Date())
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, limit);
  };

  const value = {
    // Search functions
    searchAll,
    searchTracks,
    searchUsers,
    searchEvents,

    // Recent searches
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
    removeRecentSearch,

    // Trending/Popular
    getTrendingTracks,
    getPopularUsers,
    getUpcomingEvents,

    // Query state
    searchQuery,
    setSearchQuery,
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};
