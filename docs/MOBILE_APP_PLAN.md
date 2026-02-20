# Mobile App Implementation Plan (Capacitor)

## Overview
- **Framework:** Capacitor (wraps existing Next.js app)
- **Features:** Full web app + native features
- **Build:** Free Capacitor Cloud tier
- **Estimated Time:** 3-5 hours

---

## Phase 1: Setup & Installation

### 1.1 Install Capacitor Dependencies
- [ ] `npm install @capacitor/core @capacitor/cli`
- [ ] `npm install @capacitor/android @capacitor/ios`

### 1.2 Initialize Capacitor
- [ ] Run `npx cap init`
- [ ] App name: [TBD - user to decide]
- [ ] Bundle ID: [TBD - user to decide]
- [ ] Create `capacitor.config.ts`

### 1.3 Add Platforms
- [ ] `npx cap add android`
- [ ] `npx cap add ios`
- [ ] Generate `android/` and `ios/` folders

### 1.4 Install Core Plugins
- [ ] `@capacitor/app` - App lifecycle
- [ ] `@capacitor/haptics` - Haptic feedback
- [ ] `@capacitor/device` - Device info
- [ ] `@capacitor/push-notifications` - Push notifications
- [ ] `@capacitor/local-notifications` - Local notifications
- [ ] `@capacitor/splash-screen` - Splash screen

---

## Phase 2: Configuration

### 2.1 App Metadata
- [ ] Configure app name in capacitor.config.ts
- [ ] Set bundle ID
- [ ] Set version number

### 2.2 Icons & Splash Screens
- [ ] Create app icons (1024x1024 for iOS, various sizes for Android)
- [ ] Configure splash screen images
- [ ] Add icons to `public/` folder
- [ ] Update `capacitor.config.ts` with icon paths

### 2.3 Status Bar
- [ ] Configure status bar appearance (light/dark)
- [ ] Enable/disable status bar overlay
- [ ] Set preferred status bar style

### 2.4 Next.js Configuration
- [ ] Update `next.config.ts` for mobile build
- [ ] Configure headers for Capacitor
- [ ] Ensure proper asset handling

---

## Phase 3: Native Features Integration

### 3.1 Push Notifications
- [ ] Set up Firebase project (free)
- [ ] Configure FCM for Android
- [ ] Configure APNs for iOS
- [ ] Add `lib/push-notifications.ts` helper
- [ ] Update auth to handle push tokens

### 3.2 Deep Linking
- [ ] Configure URL schemes (aviationhub://)
- [ ] Handle universal links
- [ ] Add deep link handler in app

### 3.3 Offline Support Enhancement
- [ ] Add service worker for offline
- [ ] Configure cache strategies
- [ ] Test offline functionality

### 3.4 Native UI Improvements
- [ ] Add haptic feedback to interactions
- [ ] Configure back button handling
- [ ] Add pull-to-refresh support
- [ ] Configure safe area insets

---

## Phase 4: Testing & Building

### 4.1 Android Testing
- [ ] Run `npx cap sync android`
- [ ] Build debug APK: `npx cap run android`
- [ ] Test on physical Android device
- [ ] Verify all features work

### 4.2 iOS Build (Cloud)
- [ ] Run `npx cap sync ios`
- [ ] Upload to Capacitor Cloud Build (free tier)
- [ ] Download .ipa file
- [ ] Test on iOS device (requires testflight later)

### 4.3 APK Generation
- [ ] Build release APK for Android
- [ ] Verify APK installs and runs
- [ ] Test all major features

---

## Phase 5: Publishing Preparation

### 5.1 App Store Prep (When Ready)
- [ ] Sign up for Apple Developer ($99/year)
- [ ] Create App Store listing
- [ ] Prepare screenshots
- [ ] Write app description

### 5.2 Play Store Prep (When Ready)
- [ ] Sign up for Google Play Developer ($25)
- [ ] Create Play Store listing
- [ ] Prepare screenshots
- [ ] Write app description

---

## New Files to Create

```
capacitor.config.ts          # Capacitor configuration
lib/capacitor.ts             # Native feature helpers
lib/push-notifications.ts    # Push notification logic
android/                     # Android native project
ios/                         # iOS native project
public/
  icons/
    icon-192.png
    icon-512.png
    android/
      drawable-xxxhdpi/
        icon.png
    ios/
      AppIcon.appiconset/
        Icon-1024.png
  splash/
    splash.png
```

## Modified Files

```
package.json                  # Add Capacitor dependencies
next.config.ts              # Mobile build config
app/layout.tsx              # Add Capacitor initialization
```

---

## Notes

- Uses free Capacitor Cloud for iOS builds (limited builds/month)
- Android builds can run locally on Windows
- All existing web features preserved
- Push notifications require Firebase setup (free tier)

---

## Bundle ID Recommendation

Format: `com.[company].[appname]`

Examples:
- `com.aviationhub.app`
- `com.koster.aviationhub`
- `io.aviationhub.mobile`

---

Last Updated: 2026-02-20
Status: Ready to Start
