# Booth 33 Studio 🎵

A modern React Native app for booking studio time, discovering music, and connecting with artists.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

1. **Clone and install dependencies:**
   ```bash
   cd "C:\Users\chris\Desktop\Booth 33\Booth33"
   npm install
   ```

2. **Set up security (IMPORTANT!):**

   **Windows:**
   ```bash
   install-security.bat
   ```

   **Mac/Linux:**
   ```bash
   chmod +x install-security.sh
   ./install-security.sh
   ```

3. **Configure environment variables:**
   ```bash
   # Edit .env and add your API keys
   # See .env.example for all available options
   ```

4. **Start the development server:**
   ```bash
   npm start
   ```

5. **Run on your device:**
   ```bash
   # iOS
   npm run ios

   # Android
   npm run android
   ```

---

## 📚 Documentation

- **[SETUP.md](./SETUP.md)** - Complete setup instructions
- **[SECURITY.md](./SECURITY.md)** - Security best practices and implementation guide
- **[.env.example](./.env.example)** - Environment variables template

---

## 🏗️ Project Structure

```
Booth33/
├── screens/          # Main app screens
│   ├── HomeScreen.js
│   ├── BookScreen.js
│   ├── LibraryScreen.js
│   └── ProfileScreen.js
├── contexts/         # React Context providers
│   ├── AudioContext.js
│   ├── BookingsContext.js
│   ├── CreditsContext.js
│   ├── PaymentContext.js
│   ├── NotificationsContext.js
│   ├── MessagingContext.js
│   ├── SearchContext.js
│   └── ProfileContext.js
├── components/       # Reusable components
│   ├── AudioPlayer.js
│   └── MiniPlayer.js
├── admin/           # Admin panel screens
│   ├── AdminMainApp.js
│   ├── AdminOverviewScreen.js
│   ├── AdminBookingsScreen.js
│   ├── AdminContentScreen.js
│   └── AdminEventsScreen.js
├── assets/          # Images, fonts, etc.
├── .env             # Environment variables (DO NOT COMMIT)
├── .env.example     # Environment template
├── .gitignore       # Git ignore rules
└── MainApp.js       # Main app entry point
```

---

## ✨ Features

### User Features
- 🎵 **Music Discovery** - Browse and play tracks from artists
- 📅 **Studio Booking** - Book recording sessions with real-time availability
- 💳 **Payment Processing** - Secure payments via Stripe
- 🔔 **Notifications** - Real-time updates for bookings, payments, and social activity
- 💬 **Messaging** - Direct messaging between artists
- 🔍 **Search** - Find tracks, users, and events
- 👤 **Artist Profiles** - Portfolios with tracks, stats, and social links
- 🎟️ **Events** - Discover and RSVP to studio events
- ⭐ **Credits System** - Earn and use credits for bookings

### Admin Features
- 📊 **Dashboard** - Revenue analytics and user metrics
- 📅 **Booking Management** - Approve/reject booking requests
- 📱 **Content Moderation** - Review flagged posts
- 🎉 **Event Management** - Create and manage studio events
- 💰 **Payment Management** - Process refunds and view transactions

---

## 🔒 Security

This app implements industry-standard security practices:

✅ **Environment Variables** - All API keys in .env (never committed)
✅ **Secure Storage** - Tokens stored in device Keychain (encrypted)
✅ **HTTPS Only** - All API calls use secure HTTPS
✅ **Input Validation** - All user input sanitized
✅ **PCI Compliance** - Stripe handles all payment data
✅ **Rate Limiting** - Prevent API abuse

See [SECURITY.md](./SECURITY.md) for complete security documentation.

---

## 🛠️ Tech Stack

- **Framework:** React Native + Expo
- **Navigation:** React Navigation (Bottom Tabs)
- **State Management:** React Context API
- **Payments:** Stripe
- **UI Components:** React Native built-in components
- **Gradients:** expo-linear-gradient
- **Audio:** expo-av
- **Secure Storage:** react-native-keychain
- **Environment:** react-native-dotenv

---

## 🎨 Design System

### Colors
- **Primary:** Purple (#8B5CF6) to Pink (#EC4899) gradient
- **Secondary:** Gold (#F59E0B) for events
- **Success:** Green (#10B981) for credits
- **Background:** Dark (#0F0F0F, #1A1A1A)
- **Text:** White (#FFFFFF), Gray (#888)

### Typography
- **Headers:** Bold, 20-28px
- **Body:** Regular, 14-16px
- **Captions:** 12-14px

---

## 📦 Environment Variables

Required environment variables (see `.env.example`):

```env
# Stripe (Payment Processing)
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# API Configuration
API_BASE_URL=https://api.booth33.com

# Firebase (Optional)
FIREBASE_API_KEY=...
FIREBASE_PROJECT_ID=...

# AWS S3 (Optional - for file storage)
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=booth33-audio-files
```

---

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Test Payment Flow
Use Stripe test cards:
- **Success:** 4242 4242 4242 4242
- **Decline:** 4000 0000 0000 0002
- **Requires Auth:** 4000 0025 0000 3155

See: https://stripe.com/docs/testing

---

## 🚢 Deployment

### Before Deploying:

1. **Security Checklist:**
   - [ ] All secrets in environment variables
   - [ ] .env not committed to git
   - [ ] Switch to Stripe live keys
   - [ ] Run `npm audit` and fix issues
   - [ ] Test payment flow thoroughly
   - [ ] Remove all console.log with sensitive data

2. **Build for Production:**
   ```bash
   # iOS
   expo build:ios

   # Android
   expo build:android
   ```

3. **Deploy:**
   - Follow Expo's deployment guide
   - Set up production environment variables
   - Configure app store listings

---

## 🐛 Troubleshooting

### Common Issues

**"Cannot find module '@env'"**
```bash
# Solution: Restart Metro with cache clear
npm start -- --clear
```

**"Environment variables undefined"**
```bash
# Solution:
1. Check .env file exists and has values
2. Restart Metro bundler
3. Verify babel.config.js has dotenv plugin
```

**"Payment not processing"**
```bash
# Solution:
1. Verify Stripe test keys in .env
2. Check Stripe dashboard for errors
3. Ensure using pk_test_ key (not pk_live_)
```

See [SETUP.md](./SETUP.md) for more troubleshooting tips.

---

## 📄 License

Private - All Rights Reserved

---

## 🤝 Contributing

This is a private project. For security issues, see [SECURITY.md](./SECURITY.md).

---

## 📞 Support

- **Documentation:** See SETUP.md and SECURITY.md
- **Issues:** Check troubleshooting section above
- **Stripe Help:** https://stripe.com/docs
- **React Native:** https://reactnative.dev/docs

---

## 🗺️ Roadmap

### Planned Features
- [ ] Calendar sync (Google/Apple Calendar)
- [ ] Collaboration requests
- [ ] Review/rating system
- [ ] User engagement analytics
- [ ] Automated email/SMS notifications
- [ ] Streaming platform integration
- [ ] Session recording upload

### In Progress
- [x] Artist profiles with portfolios ✅
- [x] Search functionality ✅
- [x] Payment integration ✅
- [x] Notifications system ✅
- [x] Messaging system ✅

---

**Built with ❤️ for the music community**
