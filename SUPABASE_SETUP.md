# Supabase Backend Setup for Booth 33

## 📋 Overview

This document explains how Booth 33 integrates with Supabase for backend services including authentication, database, and storage.

## 🔐 Credentials

Your Supabase credentials are stored in the `.env` file (which is gitignored for security):

```
SUPABASE_URL=https://hpzgthczonihcghxorxb.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📦 Installation

Install the Supabase JavaScript client:

```bash
npm install @supabase/supabase-js
```

For environment variables in Expo:

```bash
npm install expo-constants
npm install react-native-dotenv
```

## 🗄️ Database Schema

### Recommended Tables

Create these tables in your Supabase dashboard:

#### 1. **profiles** (User Profiles)
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

#### 2. **bookings** (Studio Bookings)
```sql
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  session_type TEXT NOT NULL, -- 'music' or 'podcast'
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration INTEGER NOT NULL, -- in hours
  price DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, cancelled, completed
  notes TEXT,
  cancellation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
  ON bookings FOR UPDATE
  USING (auth.uid() = user_id);
```

#### 3. **posts** (Social Feed Posts)
```sql
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  content TEXT NOT NULL,
  audio_url TEXT,
  image_url TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Posts are viewable by everyone"
  ON posts FOR SELECT
  USING (true);

CREATE POLICY "Users can create posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE
  USING (auth.uid() = user_id);
```

#### 4. **follows** (User Follows)
```sql
CREATE TABLE follows (
  follower_id UUID REFERENCES auth.users,
  following_id UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);

-- Enable RLS
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Follows are viewable by everyone"
  ON follows FOR SELECT
  USING (true);

CREATE POLICY "Users can follow others"
  ON follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
  ON follows FOR DELETE
  USING (auth.uid() = follower_id);
```

#### 5. **reviews** (Session Reviews)
```sql
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES bookings,
  reviewer_id UUID REFERENCES auth.users NOT NULL,
  reviewee_id UUID REFERENCES auth.users NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);
```

#### 6. **messages** (Direct Messages)
```sql
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES auth.users NOT NULL,
  recipient_id UUID REFERENCES auth.users NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view messages they sent or received"
  ON messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);
```

## 🗂️ Storage Buckets

Create these storage buckets in Supabase Storage:

1. **profiles** - User avatars and profile images
   - Make public
   - File size limit: 5MB
   - Allowed types: image/jpeg, image/png, image/webp

2. **audio** - Audio files for posts
   - Make public
   - File size limit: 50MB
   - Allowed types: audio/mpeg, audio/wav, audio/ogg

3. **posts** - Post images and media
   - Make public
   - File size limit: 10MB
   - Allowed types: image/jpeg, image/png, image/gif

## 🔧 Configuration Files

### 1. **config/supabase.js**
Initializes the Supabase client:
```javascript
import { createClient } from '@supabase/supabase-js';
import { supabase } from './config/supabase';
```

### 2. **services/authService.js**
Authentication functions:
- signUp, signIn, signOut
- requestPasswordReset, updatePassword
- OAuth support (Google, Apple)

### 3. **services/bookingsService.js**
Booking management:
- createBooking, getUserBookings
- updateBookingStatus, cancelBooking
- checkAvailability, getBookingStats

### 4. **services/profileService.js**
User profile operations:
- getUserProfile, updateUserProfile
- uploadAvatar, followUser, unfollowUser
- searchUsers, getUserStats

## 🚀 Usage Examples

### Authentication
```javascript
import { signIn, signUp } from './services/authService';

// Sign up
const result = await signUp(email, password, fullName);
if (result.success) {
  console.log('User created:', result.data.user);
}

// Sign in
const result = await signIn(email, password);
if (result.success) {
  console.log('Logged in:', result.data.user);
}
```

### Creating a Booking
```javascript
import { createBooking } from './services/bookingsService';

const booking = await createBooking({
  userId: user.id,
  sessionType: 'music',
  date: '2025-11-15',
  time: '14:00',
  duration: 2,
  price: 150,
  notes: 'Need mixing and mastering',
});
```

### Updating Profile
```javascript
import { updateUserProfile } from './services/profileService';

const result = await updateUserProfile(userId, {
  bio: 'Music producer from LA',
  username: 'newusername',
});
```

## 🔒 Security Best Practices

1. **Never commit .env files** - Already in .gitignore
2. **Use Row Level Security (RLS)** - Enable on all tables
3. **Validate on backend** - Don't trust client-side validation alone
4. **Use service role key server-side only** - Never expose in mobile app
5. **Implement rate limiting** - Protect against abuse
6. **Sanitize user input** - Prevent SQL injection

## 📱 Real-time Subscriptions

Supabase supports real-time updates:

```javascript
// Subscribe to new messages
const subscription = supabase
  .channel('messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `recipient_id=eq.${userId}`
  }, (payload) => {
    console.log('New message:', payload.new);
  })
  .subscribe();

// Cleanup
subscription.unsubscribe();
```

## 🔄 Next Steps

1. **Run the SQL scripts** in your Supabase SQL editor
2. **Create storage buckets** in Storage settings
3. **Set up authentication providers** (Google, Apple) in Authentication settings
4. **Test the connection** using the service functions
5. **Implement real-time features** for chat and notifications
6. **Add indexes** for better query performance
7. **Set up backups** in Supabase project settings

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)

## 🐛 Troubleshooting

### Issue: "Missing Supabase environment variables"
- Check `.env` file exists in project root
- Verify variables are correctly named
- Restart Metro bundler: `npx expo start --clear`

### Issue: RLS prevents data access
- Check RLS policies are created
- Verify user is authenticated
- Check user ID matches policy filters

### Issue: File upload fails
- Verify bucket exists and is public
- Check file size limits
- Ensure correct MIME type

## 💡 Tips

- Use Supabase Studio (web UI) to view and edit data during development
- Enable "Show system schemas" to see auth.users table
- Use Supabase logs to debug issues
- Test RLS policies in SQL editor before implementing
