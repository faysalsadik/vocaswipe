# VocaSwipe - Quranic Arabic Vocabulary Learning App

**VocaSwipe** is a mobile app for learning Quranic Arabic vocabulary through an engaging swipe-based flashcard system.

## Features

- **Flow Mode**: Swipe through vocabulary cards in a flow
- **Flashcard Mode**: Classic flip cards for memorization  
- **Root Explorer**: Explore Arabic word roots and their derivatives
- **Progress Tracking**: Track learning progress (New, Learned, Review)
- **Swipe Gestures**: Tinder-like swipe animations to mark words as Learned (right) or Review (left)
- **Dark Mode**: Full dark mode support with customized overlays
- **Customizable Settings**: Font size (S/M/L/XL), Auto-reveal meaning, Focus range (1 to total word count)

## Screenshots

The app features:
- Beautiful Arabic word cards with meaning and example ayahs
- Tinder-style swipe interactions with color overlays and labels
- Progress tracking at the top
- Bottom navigation for easy mode switching

## Tech Stack

- **Frontend**: Vue 3 + Vite
- **Mobile Framework**: Capacitor 8
- **Platform**: Android (iOS support can be added)
- **Language**: JavaScript/TypeScript
- **Plugins**: @capacitor/haptics, @capacitor/status-bar

## Vocabulary Data

- ~1,475 Quranic Arabic words
- Each word includes: Arabic text, root, meaning, frequency, and example ayah
- Words sourced from Quran with example verses

## App ID & Package

- **App ID**: com.vocaswipe.app
- **App Name**: VocaSwipe

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

## Getting Started

### Prerequisites

- Node.js 18+
- Android Studio with Android SDK (for Android builds)

### Installation

```bash
# Install dependencies
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

```bash
# Sync web assets to Android
npm run cap:sync

# Build debug APK
cd android && ./gradlew.bat assembleDebug

# Build release APK (requires signing config)
cd android && ./gradlew.bat assembleRelease
```

### Run on Device

```bash
# Run on Android device/emulator
npm run cap:run
```

## Output APK

- **Debug APK**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Release APK**: `android/app/build/outputs/apk/release/app-release.apk`

## Settings

- **Font Size**: Small, Medium, Large, Extra Large
- **Auto Reveal**: Toggle to automatically show meaning
- **Show Example**: Toggle to show example ayah
- **Focus Range**: Set vocabulary range (1 to total word count)
- **Dark Mode**: Toggle dark theme
- **Reset Progress**: Clear all learning progress

## Swipe Interactions

- **Swipe Right**: Mark word as "Learned" (green overlay)
- **Swipe Left**: Mark word for "Review" (yellow overlay)
- **Labels appear** at ~50% swipe threshold
- **Haptic feedback** on swipe direction change and completion

## License

This project is for educational purposes. The vocabulary data is derived from Quranic sources.

## Version

Current version: 1.0.0
