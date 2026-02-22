# VocaScroll - Project Agent Guidelines

## Project Overview

VocaScroll is a Quranic Arabic vocabulary learning mobile app built with Vue 3 and Capacitor. Users learn Arabic words as they scroll through flashcards, with features like:
- **Flow Mode**: Swipe through vocabulary cards in a flow
- **Flashcard Mode**: Classic flip cards for memorization
- **Root Explorer**: Explore Arabic word roots and their derivatives
- **Progress Tracking**: Track learning progress
- **Settings**: Customize the learning experience

## Tech Stack

- **Frontend**: Vue 3 + Vite
- **Mobile Framework**: Capacitor 8
- **Platform**: Android (iOS support can be added)
- **Language**: TypeScript/JavaScript

## Build Commands

### Prerequisites
- Node.js 18+
- Android Studio with Android SDK (for Android builds)

### Development
```bash
cd vocascroll-app

# Start dev server
npm run dev

# Build web assets
npm run build
```

### Android Build

1. **Sync web assets to Android**:
```bash
npm run cap:sync
# or
npx cap sync android
```

2. **Build debug APK**:
```bash
cd android
./gradlew.bat assembleDebug
```

3. **Build release APK** (requires signing config):
```bash
cd android
./gradlew.bat assembleRelease
```

### Direct Capacitor Commands
```bash
# Open Android Studio
npm run cap:run
# or
npx cap run android

# Open Android project in IDE
npx cap open android
```

## Project Structure

```
vocascroll-app/
├── src/
│   ├── assets/          # CSS and static assets
│   ├── components/       # Vue components
│   ├── composables/     # Vue composables (useWords, etc.)
│   ├── App.vue          # Main app component
│   └── main.ts          # Entry point
├── public/
│   └── words.json       # Vocabulary data
├── android/             # Android native project
├── dist/                # Built web assets
├── package.json
├── vite.config.ts
└── capacitor.config.json
```

## Output APK Location

- Debug APK: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release APK: `android/app/build/outputs/apk/release/app-release.apk`

## Key Files

- `capacitor.config.json`: App ID (com.vocascroll.app), app name, plugins config
- `public/words.json`: Quranic Arabic vocabulary data
- `src/composables/useWords.ts`: Word loading and state management

## Notes

- The app uses Capacitor 8 with Vue 3 + Vite
- Android SDK API 34+ recommended
- The `www` folder is the web build output, synced to Android assets
