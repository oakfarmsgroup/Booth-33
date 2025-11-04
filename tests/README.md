# Playwright Tests for Booth 33

This directory contains end-to-end tests for the Booth 33 application using Playwright.

## Important Note

**This is a React Native application.** Playwright is designed for web testing, so these tests will only work when running the **web version** of the app via Expo.

## Running Tests

### Prerequisites

Make sure you have the web version of the app running:

```bash
npm run web
# or
npx expo start --web
```

The app should be accessible at `http://localhost:19006`

### Run All Tests

```bash
npm test
```

### Run Tests in Headed Mode (See Browser)

```bash
npm run test:headed
```

### Run Tests with UI Mode (Interactive)

```bash
npm run test:ui
```

### Debug Tests

```bash
npm run test:debug
```

### View Test Report

After running tests, view the HTML report:

```bash
npm run test:report
```

## Test Organization

- `example.spec.js` - Sample tests demonstrating basic navigation and authentication flows

## Writing Tests

Playwright tests follow this general pattern:

```javascript
import { test, expect } from '@playwright/test';

test('test description', async ({ page }) => {
  // Navigate to page
  await page.goto('/');

  // Interact with elements
  await page.click('text=Button Text');

  // Make assertions
  await expect(page.locator('text=Expected Text')).toBeVisible();
});
```

## Important Considerations for React Native

Since this is a React Native app running on web:

1. **Web version may differ** from native iOS/Android apps
2. **Some features** may not be available or work differently on web
3. **Mobile simulators** are not supported - Playwright tests web browsers only
4. Consider using **Detox** or **Appium** for native mobile testing if needed

## Configuration

Test configuration is in `playwright.config.js` at the project root.

Key settings:
- **Base URL**: `http://localhost:19006` (Expo web default)
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari viewports
- **Auto-start**: Automatically starts `npm run web` before tests

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Test API](https://playwright.dev/docs/api/class-test)
- [Expo Web Documentation](https://docs.expo.dev/workflow/web/)
