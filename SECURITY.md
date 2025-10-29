# Booth 33 Studio - Security Guide

This document outlines security best practices and implementation guidelines for the Booth 33 Studio app.

---

## Table of Contents
1. [Environment Variables](#environment-variables)
2. [Authentication & Authorization](#authentication--authorization)
3. [Payment Security](#payment-security)
4. [Data Protection](#data-protection)
5. [API Security](#api-security)
6. [File Storage Security](#file-storage-security)
7. [Security Checklist](#security-checklist)

---

## Environment Variables

### Setup
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your actual API keys and secrets in `.env`

3. **NEVER commit `.env` to git** - it's already in `.gitignore`

### Usage
After installing `react-native-dotenv`, access environment variables:

```javascript
import { STRIPE_PUBLISHABLE_KEY, API_BASE_URL } from '@env';

// Use in your code
const stripeKey = STRIPE_PUBLISHABLE_KEY;
```

### Installation
```bash
npm install react-native-dotenv
# or
yarn add react-native-dotenv
```

Then add to `babel.config.js`:
```javascript
module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    ['module:react-native-dotenv', {
      moduleName: '@env',
      path: '.env',
    }]
  ]
};
```

---

## Authentication & Authorization

### Token Storage
**CRITICAL**: Use secure storage for authentication tokens.

```bash
npm install react-native-keychain
# or
yarn add react-native-keychain
```

**✅ DO THIS:**
```javascript
import * as Keychain from 'react-native-keychain';

// Store token securely
await Keychain.setGenericPassword('authToken', token);

// Retrieve token
const credentials = await Keychain.getGenericPassword();
if (credentials) {
  const token = credentials.password;
}

// Delete token on logout
await Keychain.resetGenericPassword();
```

**❌ NEVER DO THIS:**
```javascript
// INSECURE - Don't store sensitive data in AsyncStorage!
AsyncStorage.setItem('authToken', token); // ❌ BAD!
```

### JWT Best Practices
- **Expiration**: Set short expiration times (7 days max)
- **Refresh Tokens**: Implement refresh token rotation
- **Signature Verification**: Always verify JWT signatures on backend
- **Payload**: Never put sensitive data in JWT payload (it's base64, not encrypted)

---

## Payment Security

### Stripe Integration

**CRITICAL RULES:**
1. **NEVER store credit card numbers** - let Stripe handle it
2. **Use Stripe Elements** - they're PCI compliant
3. **Publishable key only** in mobile app (secret key stays on server)
4. **Webhook verification** - always verify webhook signatures

### Implementation

```bash
npm install @stripe/stripe-react-native
# or
yarn add @stripe/stripe-react-native
```

**Secure Payment Flow:**

```javascript
import { StripeProvider, CardField, confirmPayment } from '@stripe/stripe-react-native';
import { STRIPE_PUBLISHABLE_KEY } from '@env';

function PaymentScreen() {
  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      {/* Your payment UI */}
      <CardField
        postalCodeEnabled={true}
        onCardChange={(cardDetails) => {
          // Card data is tokenized by Stripe
          // You never see the actual card number
        }}
      />
    </StripeProvider>
  );
}

// Process payment on your backend
async function processPayment(amount) {
  // 1. Create PaymentIntent on your secure backend
  const response = await fetch('YOUR_BACKEND_URL/create-payment-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount }),
  });

  const { clientSecret } = await response.json();

  // 2. Confirm payment on mobile (Stripe handles card data)
  const { error, paymentIntent } = await confirmPayment(clientSecret, {
    type: 'Card',
  });

  if (error) {
    console.error('Payment failed:', error);
  } else {
    console.log('Payment successful:', paymentIntent.id);
  }
}
```

**Webhook Signature Verification (Backend):**
```javascript
// Your backend must verify webhook signatures
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // Process verified event
    if (event.type === 'payment_intent.succeeded') {
      // Update booking status, send confirmation, etc.
    }

    res.json({ received: true });
  } catch (err) {
    // Signature verification failed - reject it
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
});
```

---

## Data Protection

### Sensitive Data Encryption

For sensitive user data (not including passwords - use auth providers for that):

```bash
npm install react-native-encrypted-storage
# or
yarn add react-native-encrypted-storage
```

**Usage:**
```javascript
import EncryptedStorage from 'react-native-encrypted-storage';

// Store encrypted data
await EncryptedStorage.setItem('user_preferences', JSON.stringify({
  privateInfo: 'data'
}));

// Retrieve encrypted data
const data = await EncryptedStorage.getItem('user_preferences');
const parsed = JSON.parse(data);
```

### What to Encrypt:
✅ Authentication tokens
✅ User payment methods (if storing any metadata)
✅ Private user settings
✅ Session data

### What NOT to Store:
❌ Credit card numbers (Stripe handles this)
❌ Plain-text passwords (use auth providers)
❌ API secret keys (only in backend)

---

## API Security

### HTTPS Only
```javascript
// All API calls must use HTTPS
const API_BASE_URL = process.env.API_BASE_URL; // https://api.booth33.com

// ❌ NEVER use HTTP in production
const BAD_URL = 'http://api.booth33.com'; // Insecure!
```

### Input Validation
Always validate and sanitize user input:

```javascript
// Validate email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Sanitize input (remove potentially dangerous characters)
function sanitizeInput(input) {
  return input.replace(/[<>]/g, ''); // Remove HTML tags
}

// Usage
const userEmail = sanitizeInput(emailInput);
if (!isValidEmail(userEmail)) {
  Alert.alert('Error', 'Invalid email address');
  return;
}
```

### Rate Limiting
Implement rate limiting to prevent abuse:

```javascript
// Example: Limit booking requests
const RATE_LIMIT = {
  maxRequests: 5,
  windowMs: 60000, // 1 minute
};

let requestCount = 0;
let windowStart = Date.now();

async function makeBooking() {
  const now = Date.now();

  // Reset window
  if (now - windowStart > RATE_LIMIT.windowMs) {
    requestCount = 0;
    windowStart = now;
  }

  // Check limit
  if (requestCount >= RATE_LIMIT.maxRequests) {
    Alert.alert('Error', 'Too many requests. Please try again later.');
    return;
  }

  requestCount++;

  // Proceed with booking
  await createBooking();
}
```

### API Key Protection
```javascript
import { API_KEY } from '@env';

// ✅ Good: Use environment variables
const headers = {
  'Authorization': `Bearer ${API_KEY}`,
};

// ❌ Bad: Hardcoded API keys
const headers = {
  'Authorization': 'Bearer sk_live_abc123...', // NEVER DO THIS!
};
```

---

## File Storage Security

### Audio File Storage (AWS S3 or similar)

**Presigned URLs** for secure file uploads:

```javascript
// 1. Request presigned URL from your backend
async function uploadAudioFile(file) {
  // Get presigned URL from your secure backend
  const response = await fetch('YOUR_BACKEND_URL/get-upload-url', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      fileName: file.name,
      fileType: file.type,
    }),
  });

  const { uploadUrl } = await response.json();

  // 2. Upload directly to S3 using presigned URL
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  });

  if (uploadResponse.ok) {
    console.log('File uploaded successfully');
  }
}
```

### File Access Control
- **Private files**: Require authentication
- **Public files**: Use CDN with proper caching headers
- **Temporary access**: Use presigned URLs with expiration

---

## Security Checklist

### Before Development
- [ ] Copy `.env.example` to `.env` and fill in values
- [ ] Verify `.env` is in `.gitignore`
- [ ] Install `react-native-keychain` for secure token storage
- [ ] Install `react-native-dotenv` for environment variables

### Before Production
- [ ] All API keys in environment variables (not hardcoded)
- [ ] HTTPS only for all API calls
- [ ] Stripe test mode keys replaced with live keys
- [ ] Input validation on all user inputs
- [ ] Rate limiting implemented
- [ ] Error messages don't leak sensitive info
- [ ] Audit dependencies: `npm audit`
- [ ] Remove all console.log() statements with sensitive data
- [ ] Test payment flow thoroughly in Stripe test mode
- [ ] Set up error tracking (Sentry or similar)
- [ ] Implement proper error handling (no app crashes)

### Regular Maintenance
- [ ] Update dependencies monthly: `npm update`
- [ ] Run security audit: `npm audit`
- [ ] Rotate API keys every 90 days
- [ ] Review access logs for suspicious activity
- [ ] Test backup/restore procedures
- [ ] Review and update this security guide

---

## Common Vulnerabilities to Avoid

### ❌ Don't Do This:
1. **Storing secrets in code**
   ```javascript
   const API_KEY = 'sk_live_abc123'; // BAD!
   ```

2. **Using AsyncStorage for sensitive data**
   ```javascript
   AsyncStorage.setItem('password', pw); // BAD!
   ```

3. **Exposing error details to users**
   ```javascript
   Alert.alert('Error', error.stack); // BAD! Leaks internal info
   ```

4. **Trusting user input**
   ```javascript
   const query = `SELECT * FROM users WHERE id=${userInput}`; // SQL Injection!
   ```

5. **Logging sensitive data**
   ```javascript
   console.log('User password:', password); // BAD!
   ```

### ✅ Do This Instead:
1. **Use environment variables**
   ```javascript
   import { API_KEY } from '@env';
   ```

2. **Use secure storage**
   ```javascript
   await Keychain.setGenericPassword('user', token);
   ```

3. **Generic error messages**
   ```javascript
   Alert.alert('Error', 'Something went wrong. Please try again.');
   ```

4. **Parameterized queries**
   ```javascript
   const query = 'SELECT * FROM users WHERE id = ?';
   db.query(query, [userId]);
   ```

5. **Never log secrets**
   ```javascript
   console.log('Login successful for user:', username); // OK
   // Never log: password, tokens, API keys, card numbers
   ```

---

## Getting Help

- **Stripe Security**: https://stripe.com/docs/security
- **React Native Security**: https://reactnative.dev/docs/security
- **OWASP Mobile Security**: https://owasp.org/www-project-mobile-security/

---

## Report Security Issues

If you discover a security vulnerability:
- **DO NOT** open a public issue
- Email: security@booth33.com
- Include: description, steps to reproduce, potential impact
