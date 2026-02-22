# VocaSwipe - Project Agent Guidelines

## Project Overview

VocaSwipe is a Quranic Arabic vocabulary learning mobile app built with Vue 3 and Capacitor. Users learn Arabic words as they scroll through flashcards, with features like:
- **Flow Mode**: Swipe through vocabulary cards in a flow
- **Flashcard Mode**: Classic flip cards for memorization
- **Root Explorer**: Explore Arabic word roots and their derivatives
- **Progress Tracking**: Track learning progress (New, Learned, Review)
- **Swipe Gestures**: Tinder-like swipe animations to mark words
- **Dark Mode**: Full dark mode support
- **Settings**: Customize font size, auto-reveal, focus range

## Tech Stack

- **Frontend**: Vue 3 + Vite
- **Mobile Framework**: Capacitor 8
- **Platform**: Android (iOS support can be added)
- **Language**: JavaScript/TypeScript
- **Plugins**: @capacitor/haptics, @capacitor/status-bar

## Build Commands

### Prerequisites
- Node.js 18+
- Android Studio with Android SDK (for Android builds)

### Installation
```bash
npm install
```

### Development
```bash
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
# Run on Android device/emulator
npm run cap:run
# or
npx cap run android

# Open Android project in IDE
npx cap open android
```

## Project Structure

```
vocaswipe/
├── public/
│   └── words.json       # Vocabulary data (~1,475 words)
├── src/
│   ├── assets/
│   │   ├── base.css     # Global styles
│   │   └── variables.css # CSS variables & themes
│   ├── components/
│   │   ├── CardStack.vue    # Swipeable card stack
│   │   ├── SettingsPanel.vue # Settings panel
│   │   └── WordCard.vue      # Word card component
│   ├── composables/
│   │   └── useWords.js   # Word state management
│   ├── App.vue           # Main app component
│   └── main.ts          # Entry point
├── android/             # Android native project
├── dist/                # Built web assets
├── package.json
├── vite.config.js
├── capacitor.config.json
└── README.md
```

## Output APK Location

- Debug APK: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release APK: `android/app/build/outputs/apk/release/app-release.apk`

## Key Files

- `capacitor.config.json`: App ID (com.vocaswipe.app), app name, plugins config
- `public/words.json`: Quranic Arabic vocabulary data
- `src/composables/useWords.js`: Word loading and state management

## Notes

- The app uses Capacitor 8 with Vue 3 + Vite
- Android SDK API 34+ recommended
- The `dist` folder is the web build output, synced to Android assets
