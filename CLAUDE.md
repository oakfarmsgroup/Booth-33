# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Booth 33 is a React Native mobile application for a recording studio booking platform. The app allows users to book music or podcast recording sessions and share audio content on a social feed. It includes dual portals: a client-facing app and an admin dashboard for studio management.

## Running the Application

```bash
# Start the Expo development server
npm start

# Run on specific platforms
npm run android    # Android device/emulator
npm run ios        # iOS device/simulator
npm run web        # Web browser
```

## Architecture

### Navigation Structure

The app uses a **screen-based state navigation** pattern in `App.js` rather than a traditional navigation library for the authentication flow:
- `App.js` manages top-level screen state (`welcome`, `login`, `signup`, `main`, `adminLogin`, `admin`)
- Once authenticated, users enter either `MainApp.js` or `AdminMainApp.js`, which use React Navigation's tab navigator

### Dual Portal System

**Client Portal** (`MainApp.js`):
- Bottom tab navigation with 4 tabs: Home, Book, Library, Profile
- Screens located in `/screens/` directory
- Primary color scheme: Purple (#8B5CF6) and Pink (#EC4899)

**Admin Portal** (`AdminMainApp.js`):
- Bottom tab navigation with 4 tabs plus logout action: Overview, Bookings, Content, Users
- Screens located in `/admin/` directory
- Admin color scheme: Amber (#F59E0B) with accent colors
- "Settings" tab acts as logout button (see AdminMainApp.js:101-106)

### Authentication Flow

Both login flows (`LoginScreen.js` and `AdminLoginScreen.js`) currently use placeholder authentication:
- Client login: No validation, directly navigates to main app
- Admin login: Simple check for "admin" in email (AdminLoginScreen.js:11)
- Real authentication integration will be needed in the future

### Screen Organization

**Client Screens** (`/screens/`):
- `HomeScreen.js`: Social feed with audio posts, create post modal with audio/text toggle
- `BookScreen.js`: Studio booking interface with date/time selection, session type tabs (music/podcast), expandable pro tips
- `LibraryScreen.js`: User's saved/created content
- `ProfileScreen.js`: User profile and settings

**Admin Screens** (`/admin/`):
- `AdminOverviewScreen.js`: Dashboard with stats, revenue, recent bookings
- `AdminBookingsScreen.js`: Booking management with filter tabs and approval/rejection
- `AdminContentScreen.js`: Content moderation with flagged/removed posts

## Styling Patterns

The app uses a **dark theme** with consistent design patterns:

- Base background: `#0F0F0F`
- Gradient overlays: `LinearGradient` from `expo-linear-gradient`
- Cards use `rgba(255, 255, 255, 0.03)` backgrounds with colored borders
- All main CTAs use purple-to-pink gradient: `['#8B5CF6', '#EC4899']`
- Admin CTAs use amber gradient: `['#F59E0B', '#EF4444']`

Common style patterns:
- Border radius for cards: 12-16px
- Border radius for buttons: 28px (half of 56px height)
- Shadow/glow effects on key elements using `shadowColor`, `shadowOpacity`, `shadowRadius`

## Data Management

Currently, the app uses **mock/hardcoded data** throughout:
- No backend integration yet
- No real user authentication
- File uploads are simulated (HomeScreen.js:13-21)
- All booking and content data is static

When integrating a backend:
- Replace mock data in screen components
- Implement real file upload for audio posts
- Add proper authentication flows
- Connect booking system to backend API
- Implement real-time updates for admin dashboard

## Key Components & Patterns

### Modal Usage
Modals are used extensively for confirmations and forms:
- Create post modal (HomeScreen.js:225-328)
- Booking success modal (BookScreen.js:304-362)
- Content moderation details (AdminContentScreen.js)

### Independent Navigation Containers
Both `MainApp.js` and `AdminMainApp.js` use `independent={true}` on NavigationContainer (line 14) to avoid conflicts since both are conditionally rendered from the same app.

### Tab Bar Customization
Both tab navigators customize the tab bar heavily:
- Custom `TabIcon` component using emoji (not icon libraries)
- Tab bar badges for notifications (AdminMainApp.js:65-69, 79-83)
- The admin "Settings" tab is repurposed as a logout button using `tabBarButton` override

### Refresh Patterns
Pull-to-refresh implemented using `RefreshControl`:
- HomeScreen feed refresh (HomeScreen.js:85-92)
- Admin screens for real-time updates

## Image Assets

Images are stored in `/assets/images/`:
- `Booth_33.png`: Main app logo
- `Artist.png`: Profile/creator image example
- `Artist_Locs.png`: Another profile example

When adding new images, use `require('./assets/images/filename.png')` pattern.

## Common Workflow Patterns

When adding new features:
1. Use the existing color schemes (purple/pink for client, amber for admin)
2. Follow the card-based UI pattern with dark backgrounds and colored borders
3. Use LinearGradient for important CTAs
4. Keep emoji-based iconography consistent
5. Add proper loading states and error handling (currently minimal)

When modifying booking flow:
- Update time slots in `BookScreen.js:23-37`
- Modify pricing in `BookScreen.js:264`
- Session duration is hardcoded to 2 hours (BookScreen.js:259)

When adding social features:
- Post interaction logic in `HomeScreen.js` (likes, comments, shares)
- Content moderation hooks in admin screens
- Consider adding real-time updates for feed
