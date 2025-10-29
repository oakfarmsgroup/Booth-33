# Booth 33 Studio - Setup Instructions

Follow these steps to set up your development environment securely.

---

## 1. Install Security Dependencies

Run these commands in your project directory:

```bash
# Environment variable management
npm install react-native-dotenv

# Secure storage for auth tokens
npm install react-native-keychain

# Encrypted storage for sensitive data
npm install react-native-encrypted-storage

# Stripe payment processing
npm install @stripe/stripe-react-native

# Development tools (optional but recommended)
npm install --save-dev eslint prettier eslint-plugin-react eslint-plugin-react-native
```

Or if using yarn:

```bash
yarn add react-native-dotenv
yarn add react-native-keychain
yarn add react-native-encrypted-storage
yarn add @stripe/stripe-react-native
yarn add --dev eslint prettier eslint-plugin-react eslint-plugin-react-native
```

---

## 2. Configure Environment Variables

### Step 1: Create your .env file
```bash
cp .env.example .env
```

### Step 2: Fill in your API keys

Open `.env` and add your actual keys:

```env
# Start with Stripe test mode keys
STRIPE_PUBLISHABLE_KEY=pk_test_51...
STRIPE_SECRET_KEY=sk_test_51...  # This stays on backend only!

# Add other services as you integrate them
```

**Where to get Stripe keys:**
1. Go to https://dashboard.stripe.com/register
2. Create an account (it's free)
3. Go to Developers > API keys
4. Copy the **Test** publishable key (starts with `pk_test_`)
5. Only use **Live** keys when ready to go to production

### Step 3: Verify .env is protected

Check that `.gitignore` includes `.env`:
```bash
cat .gitignore | grep .env
```

You should see:
```
.env
.env.local
.env*.local
```

---

## 3. TypeScript Definitions (for environment variables)

Create a type definition file for better autocomplete:

Create `types/env.d.ts`:
```typescript
declare module '@env' {
  export const NODE_ENV: string;
  export const API_BASE_URL: string;
  export const STRIPE_PUBLISHABLE_KEY: string;
  export const STRIPE_SECRET_KEY: string;
  export const FIREBASE_API_KEY: string;
  export const AWS_ACCESS_KEY_ID: string;
  export const AWS_SECRET_ACCESS_KEY: string;
  export const AWS_S3_BUCKET: string;
  // Add other env vars as you need them
}
```

---

## 4. Restart Metro Bundler

After installing dependencies and creating `.env`, **you must restart Metro**:

```bash
# Stop the current dev server (Ctrl+C)
# Then clear the cache and restart:
npm start -- --clear

# Or with Expo:
expo start -c
```

---

## 5. Test Environment Variables

Create a test file to verify everything works:

```javascript
// test-env.js
import { STRIPE_PUBLISHABLE_KEY, API_BASE_URL } from '@env';

console.log('Testing environment variables...');
console.log('Stripe key starts with pk_test:', STRIPE_PUBLISHABLE_KEY?.startsWith('pk_test_'));
console.log('API URL:', API_BASE_URL);

// NEVER log the full key in production!
if (STRIPE_PUBLISHABLE_KEY) {
  console.log('✅ Environment variables loaded successfully');
} else {
  console.error('❌ Environment variables not loaded. Did you restart Metro?');
}
```

Run it:
```bash
node test-env.js
```

---

## 6. Update PaymentContext to Use Stripe

Replace the mock payment system with real Stripe integration.

See `SECURITY.md` for detailed Stripe implementation examples.

---

## 7. Security Checklist

Before committing any code:

- [ ] `.env` is in `.gitignore`
- [ ] No API keys hardcoded in any files
- [ ] Babel config includes react-native-dotenv plugin
- [ ] All sensitive data uses secure storage (Keychain/EncryptedStorage)
- [ ] Metro bundler restarted after .env changes
- [ ] Test mode Stripe keys (not live keys) in `.env`

---

## 8. Common Issues & Solutions

### Issue: "Cannot find module '@env'"
**Solution:**
1. Make sure `react-native-dotenv` is installed
2. Check `babel.config.js` includes the plugin
3. Restart Metro bundler with cache clear: `npm start -- --clear`

### Issue: Environment variables are undefined
**Solution:**
1. Check `.env` file exists and has values
2. Restart Metro bundler
3. Make sure variable names match exactly

### Issue: "Module 'react-native-keychain' not found"
**Solution:**
```bash
# For Expo projects, you might need to rebuild
expo prebuild
npx pod-install  # iOS only
```

### Issue: Stripe integration not working
**Solution:**
1. Verify you're using `pk_test_` key (not `pk_live_`)
2. Check Stripe dashboard for errors
3. Make sure you're using `@stripe/stripe-react-native` (not old `tipsi-stripe`)

---

## 9. Next Steps

After setup is complete:

1. **Replace mock payment system** with Stripe integration
2. **Set up Firebase** (or your backend) for user authentication
3. **Configure AWS S3** for audio file storage
4. **Add error tracking** (Sentry recommended)
5. **Set up analytics** (optional)

Refer to `SECURITY.md` for detailed security guidelines.

---

## 10. Development Workflow

### Daily development:
```bash
# Start the app
npm start

# iOS
npm run ios

# Android
npm run android
```

### Before committing:
```bash
# Check for security issues
npm audit

# Fix if possible
npm audit fix

# Commit your changes
git add .
git commit -m "Your message"
```

### Before deploying:
1. Run full test suite
2. Switch to production environment variables
3. Test payment flow with Stripe test cards
4. Review error logs
5. Deploy to staging first

---

## Getting Help

- **Stripe Docs**: https://stripe.com/docs/payments
- **React Native Keychain**: https://github.com/oblador/react-native-keychain
- **Expo Docs**: https://docs.expo.dev/
- **Security Guide**: See `SECURITY.md` in this repo

---

**Ready to go!** 🚀

Your app now has:
✅ Secure environment variable management
✅ Protected API keys
✅ Proper .gitignore configuration
✅ Stripe SDK ready to integrate
✅ Comprehensive security documentation
