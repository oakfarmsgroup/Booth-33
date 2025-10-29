import React, { createContext, useContext, useState } from 'react';

const ProfileContext = createContext();

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

export const ProfileProvider = ({ children }) => {
  // Artist Profiles
  const [profiles, setProfiles] = useState([
    {
      id: 'user_1',
      name: 'Alex Rivera',
      username: '@alexrivera',
      avatar: require('../assets/images/Artist.png'),
      bio: 'Multi-instrumentalist & producer. Creating soundscapes that blend acoustic warmth with electronic textures. Available for session work & collaborations.',
      location: 'Los Angeles, CA',
      genre: 'Alternative / Electronic',
      joinDate: new Date(2024, 0, 15),
      followers: 847,
      following: 234,
      isFollowing: false,
      verified: true,

      // Social Links
      socialLinks: {
        instagram: '@alexrivera',
        twitter: '@alexrivera',
        soundcloud: 'alexrivera',
        spotify: 'alexrivera',
      },

      // Stats
      stats: {
        totalTracks: 24,
        totalBookings: 12,
        totalCollaborations: 8,
        avgRating: 4.8,
      },

      // Portfolio Items
      portfolio: [
        {
          id: 'portfolio_1',
          type: 'track',
          title: 'Acoustic Soul',
          description: 'Intimate acoustic session recorded at Booth 33',
          thumbnail: '🎵',
          plays: 890,
          likes: 45,
          date: new Date(2025, 8, 15),
        },
        {
          id: 'portfolio_2',
          type: 'track',
          title: 'Night Drive',
          description: 'Lo-fi beats for late night vibes',
          thumbnail: '🎧',
          plays: 1240,
          likes: 78,
          date: new Date(2025, 7, 22),
        },
        {
          id: 'portfolio_3',
          type: 'video',
          title: 'Studio Session - Behind the Scenes',
          description: 'Recording process at Booth 33',
          thumbnail: '🎬',
          views: 523,
          likes: 34,
          date: new Date(2025, 7, 10),
        },
        {
          id: 'portfolio_4',
          type: 'image',
          title: 'EP Cover Art - "Midnight Sessions"',
          description: 'Album artwork collaboration',
          thumbnail: '🖼️',
          likes: 92,
          date: new Date(2025, 6, 5),
        },
      ],

      // Recent Activity
      recentActivity: [
        { type: 'track_upload', content: 'Released "Acoustic Soul"', date: new Date(2025, 8, 15) },
        { type: 'booking', content: 'Booked a session at Booth 33', date: new Date(2025, 8, 10) },
        { type: 'collaboration', content: 'Collaborated with Mike Soundz', date: new Date(2025, 7, 28) },
      ],
    },
    {
      id: 'user_2',
      name: 'Mike Soundz',
      username: '@mikesoundz',
      avatar: require('../assets/images/Artist.png'),
      bio: '🎤 Hip-Hop Producer & Beatmaker. Crafting hard-hitting beats with soul. Hit me up for production work or studio time.',
      location: 'Atlanta, GA',
      genre: 'Hip-Hop / Trap',
      joinDate: new Date(2023, 5, 10),
      followers: 2400,
      following: 456,
      isFollowing: false,
      verified: true,

      socialLinks: {
        instagram: '@mikesoundz',
        twitter: '@mikesoundz',
        soundcloud: 'mikesoundz',
        spotify: 'mikesoundz',
      },

      stats: {
        totalTracks: 67,
        totalBookings: 45,
        totalCollaborations: 23,
        avgRating: 4.9,
      },

      portfolio: [
        {
          id: 'portfolio_5',
          type: 'track',
          title: 'Midnight Vibes',
          description: 'Dark trap beat with atmospheric pads',
          thumbnail: '🎵',
          plays: 2420,
          likes: 156,
          date: new Date(2025, 9, 12),
        },
        {
          id: 'portfolio_6',
          type: 'track',
          title: 'City Lights',
          description: 'Upbeat hip-hop instrumental',
          thumbnail: '🎧',
          plays: 2100,
          likes: 134,
          date: new Date(2025, 9, 1),
        },
        {
          id: 'portfolio_7',
          type: 'video',
          title: 'Beat Making Tutorial',
          description: 'How I made "Midnight Vibes"',
          thumbnail: '🎬',
          views: 3200,
          likes: 245,
          date: new Date(2025, 8, 20),
        },
      ],

      recentActivity: [
        { type: 'track_upload', content: 'Released "Midnight Vibes"', date: new Date(2025, 9, 12) },
        { type: 'event', content: 'Attended Beat Making Workshop', date: new Date(2025, 9, 5) },
        { type: 'collaboration', content: 'Collaborated with Sarah J', date: new Date(2025, 8, 28) },
      ],
    },
    {
      id: 'user_3',
      name: 'Sarah J',
      username: '@sarahj',
      avatar: require('../assets/images/Artist.png'),
      bio: 'Pop artist & vocalist. Bringing emotion to every note. Open for features, collabs, and session vocals.',
      location: 'Nashville, TN',
      genre: 'Pop / R&B',
      joinDate: new Date(2023, 8, 22),
      followers: 1850,
      following: 389,
      isFollowing: true,
      verified: true,

      socialLinks: {
        instagram: '@sarahj',
        twitter: '@sarahj',
        soundcloud: 'sarahj',
        spotify: 'sarahj',
      },

      stats: {
        totalTracks: 34,
        totalBookings: 28,
        totalCollaborations: 15,
        avgRating: 4.7,
      },

      portfolio: [
        {
          id: 'portfolio_8',
          type: 'track',
          title: 'Summer Dreams',
          description: 'Uplifting pop anthem for the summer',
          thumbnail: '🎵',
          plays: 1850,
          likes: 98,
          date: new Date(2025, 8, 5),
        },
        {
          id: 'portfolio_9',
          type: 'video',
          title: 'Live Performance - Open Mic Night',
          description: 'Performing at Booth 33',
          thumbnail: '🎬',
          views: 1200,
          likes: 67,
          date: new Date(2025, 7, 15),
        },
      ],

      recentActivity: [
        { type: 'track_upload', content: 'Released "Summer Dreams"', date: new Date(2025, 8, 5) },
        { type: 'event', content: 'Performed at Open Mic Night', date: new Date(2025, 7, 30) },
      ],
    },
    {
      id: 'user_4',
      name: 'Jay Beats',
      username: '@jaybeats',
      avatar: require('../assets/images/Artist.png'),
      bio: '🎧 DJ & Electronic Music Producer. Specializing in house, techno, and experimental sounds. Let\'s create something unique.',
      location: 'Miami, FL',
      genre: 'Electronic / House',
      joinDate: new Date(2023, 2, 8),
      followers: 3200,
      following: 512,
      isFollowing: false,
      verified: true,

      socialLinks: {
        instagram: '@jaybeats',
        twitter: '@jaybeats',
        soundcloud: 'jaybeats',
        spotify: 'jaybeats',
      },

      stats: {
        totalTracks: 89,
        totalBookings: 34,
        totalCollaborations: 28,
        avgRating: 4.9,
      },

      portfolio: [
        {
          id: 'portfolio_10',
          type: 'track',
          title: 'Electric Pulse',
          description: 'High-energy techno banger',
          thumbnail: '🎵',
          plays: 3200,
          likes: 201,
          date: new Date(2025, 9, 8),
        },
        {
          id: 'portfolio_11',
          type: 'track',
          title: 'Deep Waters',
          description: 'Progressive house journey',
          thumbnail: '🎧',
          plays: 2890,
          likes: 178,
          date: new Date(2025, 8, 22),
        },
      ],

      recentActivity: [
        { type: 'track_upload', content: 'Released "Electric Pulse"', date: new Date(2025, 9, 8) },
        { type: 'event', content: 'Headlined at Jazz Listening Party', date: new Date(2025, 9, 1) },
      ],
    },
    {
      id: 'user_5',
      name: 'Lisa Chen',
      username: '@lisachen',
      avatar: require('../assets/images/Artist.png'),
      bio: 'R&B singer-songwriter. Telling stories through melodies. Available for collaborations and vocal sessions.',
      location: 'New York, NY',
      genre: 'R&B / Soul',
      joinDate: new Date(2024, 1, 14),
      followers: 1920,
      following: 301,
      isFollowing: false,
      verified: false,

      socialLinks: {
        instagram: '@lisachen',
        soundcloud: 'lisachen',
        spotify: 'lisachen',
      },

      stats: {
        totalTracks: 18,
        totalBookings: 15,
        totalCollaborations: 9,
        avgRating: 4.6,
      },

      portfolio: [
        {
          id: 'portfolio_12',
          type: 'track',
          title: 'Late Night Session',
          description: 'Smooth R&B vibes for the evening',
          thumbnail: '🎵',
          plays: 1920,
          likes: 112,
          date: new Date(2025, 8, 18),
        },
      ],

      recentActivity: [
        { type: 'track_upload', content: 'Released "Late Night Session"', date: new Date(2025, 8, 18) },
        { type: 'booking', content: 'Booked a recording session', date: new Date(2025, 8, 15) },
      ],
    },
  ]);

  // Current user's following list
  const [following, setFollowing] = useState(['user_3']); // Following Sarah J by default

  // Follow/Unfollow a user
  const toggleFollow = (userId) => {
    setProfiles(profiles.map(profile => {
      if (profile.id === userId) {
        const isNowFollowing = !profile.isFollowing;
        return {
          ...profile,
          isFollowing: isNowFollowing,
          followers: isNowFollowing ? profile.followers + 1 : profile.followers - 1,
        };
      }
      return profile;
    }));

    setFollowing(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  // Get profile by ID
  const getProfile = (userId) => {
    return profiles.find(profile => profile.id === userId);
  };

  // Get profile by username
  const getProfileByUsername = (username) => {
    return profiles.find(profile => profile.username === username);
  };

  // Get following profiles
  const getFollowingProfiles = () => {
    return profiles.filter(profile => following.includes(profile.id));
  };

  // Get popular profiles
  const getPopularProfiles = (limit = 5) => {
    return [...profiles].sort((a, b) => b.followers - a.followers).slice(0, limit);
  };

  // Get profiles by genre
  const getProfilesByGenre = (genre) => {
    return profiles.filter(profile =>
      profile.genre.toLowerCase().includes(genre.toLowerCase())
    );
  };

  // Search profiles
  const searchProfiles = (query) => {
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase();
    return profiles.filter(profile =>
      profile.name.toLowerCase().includes(lowerQuery) ||
      profile.username.toLowerCase().includes(lowerQuery) ||
      profile.genre.toLowerCase().includes(lowerQuery) ||
      profile.bio.toLowerCase().includes(lowerQuery)
    );
  };

  const value = {
    profiles,
    following,
    toggleFollow,
    getProfile,
    getProfileByUsername,
    getFollowingProfiles,
    getPopularProfiles,
    getProfilesByGenre,
    searchProfiles,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};
