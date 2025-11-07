import React, { createContext, useContext, useState, useEffect } from 'react';
import * as searchService from '../services/searchService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SearchContext = createContext();

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

export const SearchProvider = ({ children }) => {
  const [recentSearches, setRecentSearches] = useState([]);
  const [trendingTracks, setTrendingTracks] = useState([]);
  const [popularUsers, setPopularUsers] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load recent searches and trending content on mount
  useEffect(() => {
    loadRecentSearches();
    loadTrendingContent();
  }, []);

  // Load recent searches from AsyncStorage
  const loadRecentSearches = async () => {
    try {
      const stored = await AsyncStorage.getItem('@recent_searches');
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  // Load trending content
  const loadTrendingContent = async () => {
    try {
      const [tracks, users, events] = await Promise.all([
        searchService.getTrendingTracks(10),
        searchService.getPopularUsers(10),
        searchService.getUpcomingEvents(10)
      ]);

      if (tracks.success) setTrendingTracks(tracks.data);
      if (users.success) setPopularUsers(users.data);
      if (events.success) setUpcomingEvents(events.data);
    } catch (error) {
      console.error('Error loading trending content:', error);
    }
  };

  // Save recent searches to AsyncStorage
  const saveRecentSearches = async (searches) => {
    try {
      await AsyncStorage.setItem('@recent_searches', JSON.stringify(searches));
    } catch (error) {
      console.error('Error saving recent searches:', error);
    }
  };

  // Add search to recent searches
  const addToRecentSearches = async (query, type = 'all') => {
    if (!query || query.trim() === '') return;

    const newSearch = {
      id: Date.now().toString(),
      query: query.trim(),
      type,
      timestamp: new Date().toISOString(),
    };

    // Remove duplicate if exists
    const filtered = recentSearches.filter(
      search => search.query.toLowerCase() !== query.toLowerCase()
    );

    // Add new search to beginning and limit to 20
    const updated = [newSearch, ...filtered].slice(0, 20);
    setRecentSearches(updated);
    await saveRecentSearches(updated);
  };

  // Wrapper for backward compatibility
  const addRecentSearch = (query) => {
    addToRecentSearches(query);
  };

  // Remove a recent search
  const removeRecentSearch = async (searchId) => {
    const updated = recentSearches.filter(search => search.id !== searchId);
    setRecentSearches(updated);
    await saveRecentSearches(updated);
  };

  // Clear all recent searches
  const clearRecentSearches = async () => {
    setRecentSearches([]);
    await AsyncStorage.removeItem('@recent_searches');
  };

  // Search tracks/posts
  const searchTracks = async (query) => {
    if (!query || query.trim() === '') {
      return [];
    }

    setLoading(true);
    try {
      const result = await searchService.searchTracks(query, 20);
      await addToRecentSearches(query, 'tracks');
      return result.success ? result.data : [];
    } catch (error) {
      console.error('Error searching tracks:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Search users
  const searchUsers = async (query) => {
    if (!query || query.trim() === '') {
      return [];
    }

    setLoading(true);
    try {
      const result = await searchService.searchUsers(query, 20);
      await addToRecentSearches(query, 'users');
      return result.success ? result.data : [];
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Search events
  const searchEvents = async (query) => {
    if (!query || query.trim() === '') {
      return [];
    }

    setLoading(true);
    try {
      const result = await searchService.searchEvents(query, 20);
      await addToRecentSearches(query, 'events');
      return result.success ? result.data : [];
    } catch (error) {
      console.error('Error searching events:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Search all content types
  const searchAll = async (query) => {
    if (!query || query.trim() === '') {
      return { tracks: [], users: [], events: [] };
    }

    setLoading(true);
    try {
      const result = await searchService.searchAll(query, 10);
      await addToRecentSearches(query, 'all');
      return result.success ? result.data : { tracks: [], users: [], events: [] };
    } catch (error) {
      console.error('Error searching all:', error);
      return { tracks: [], users: [], events: [] };
    } finally {
      setLoading(false);
    }
  };

  // Get trending tracks
  const getTrendingTracks = () => {
    return trendingTracks;
  };

  // Get popular users
  const getPopularUsers = () => {
    return popularUsers;
  };

  // Get upcoming events
  const getUpcomingEvents = () => {
    return upcomingEvents;
  };

  // Refresh trending content
  const refreshTrendingContent = async () => {
    await loadTrendingContent();
  };

  const value = {
    loading,
    recentSearches,
    trendingTracks,
    popularUsers,
    upcomingEvents,
    searchTracks,
    searchUsers,
    searchEvents,
    searchAll,
    getTrendingTracks,
    getPopularUsers,
    getUpcomingEvents,
    addRecentSearch,
    addToRecentSearches,
    removeRecentSearch,
    clearRecentSearches,
    refreshTrendingContent,
    searchQuery,
    setSearchQuery,
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};
