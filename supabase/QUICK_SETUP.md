# 🚀 Quick Supabase Setup (5 Minutes)

## Step 1: Run SQL Script (2 minutes)

1. Go to your Supabase project: https://app.supabase.com/project/hpzgthczonihcghxorxb
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open `supabase/setup.sql` in this project
5. **Copy ALL the SQL** (Ctrl+A, Ctrl+C)
6. **Paste into Supabase** SQL Editor
7. Click **RUN** (bottom right)
8. Wait ~30 seconds for completion ✅

## Step 2: Create Storage Buckets (2 minutes)

1. Click **Storage** in left sidebar
2. Click **New Bucket**
3. Create these 3 buckets:

### Bucket 1: profiles
- Name: `profiles`
- Public: ✅ Yes
- File size limit: 5MB
- Allowed MIME types: `image/jpeg, image/png, image/webp`

### Bucket 2: audio
- Name: `audio`
- Public: ✅ Yes
- File size limit: 50MB
- Allowed MIME types: `audio/mpeg, audio/wav, audio/ogg, audio/mp3`

### Bucket 3: posts
- Name: `posts`
- Public: ✅ Yes
- File size limit: 10MB
- Allowed MIME types: `image/jpeg, image/png, image/gif, image/webp`

## Step 3: Install Dependencies (1 minute)

```bash
cd "C:\Users\chris\Desktop\Booth 33\Booth33"
npm install @supabase/supabase-js
npm install expo-constants
```

## Step 4: Restart App

```bash
npx expo start --clear
```

## ✅ Done!

Your app is now connected to Supabase backend!

### What You Just Set Up:

✅ 11 Database Tables (profiles, bookings, posts, likes, comments, follows, reviews, messages, events, rsvps, notifications)
✅ Row Level Security (RLS) policies
✅ Automatic triggers (profile creation, like counts, comment counts)
✅ 3 Storage buckets for files
✅ Real-time subscriptions ready

### Test It:

1. Open app
2. Try signing up - creates real user!
3. Try creating a booking - saves to database!
4. Try posting - real post in feed!

All mock data is now replaced with real backend! 🎉
