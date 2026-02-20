# DawnDream Waker — TODO

## Infrastructure
- [x] Install dependencies: expo-brightness, expo-file-system, expo-localization, i18next, react-i18next, date-fns, expo-linear-gradient, expo-keep-awake, expo-web-browser
- [x] Configure theme.config.js with sunrise brand colors
- [x] Set up i18n (EN, DE, UK) with i18next
- [x] Configure 4-tab navigation (Home, Recordings, Sleep Tips, Settings)
- [x] Add icon mappings for all 4 tabs in icon-symbol.tsx
- [x] Set up AsyncStorage context for settings and recording metadata
- [x] Configure app.config.ts with microphone permission and background audio

## Home Screen
- [x] Alarm status card (next alarm time display)
- [x] Sunrise countdown and progress visualization
- [x] Animated sunrise gradient background overlay
- [x] Large dream recording button (circle, 200px)
- [x] Recording state machine (idle → waiting 30min → recording → stopped)
- [x] 30-minute countdown timer display
- [x] Auto-stop logic (1 hour before alarm)
- [x] Manual stop button during recording

## Sunrise Simulation
- [x] expo-brightness integration
- [x] 30-minute linear brightness ramp (0→1)
- [x] Background color animation (#FF4500 → #FFFFFF)
- [x] expo-keep-awake to prevent screen sleep
- [x] Alarm time detection (manual input fallback)
- [x] Scheduled sunrise trigger via expo-notifications

## Dream Recording
- [x] expo-audio recorder setup with HIGH_QUALITY preset
- [x] Microphone permission request
- [x] 30-second metering interval for threshold detection (~40dB)
- [x] Segment-based recording (start/stop per speech burst)
- [x] Save .m4a files to expo-file-system dated folder
- [x] Store metadata in AsyncStorage (date, duration, file path)
- [x] Background audio mode configuration

## Recordings Screen
- [x] Load recordings from AsyncStorage
- [x] Date-grouped FlatList (SectionList)
- [x] Recording card with duration and timestamp
- [x] SVG waveform visualization (static bars from amplitude data)
- [x] Audio playback with play/pause per card
- [x] Delete recording functionality
- [x] Empty state illustration

## Sleep Tips Screen
- [x] 5 tip cards with title, description, source
- [x] YouTube link buttons (open in expo-web-browser)
- [x] Scroll view layout

## Settings Screen
- [x] Dark/Light/System appearance toggle
- [x] Language picker (EN / DE / UK)
- [x] Manual alarm time override input
- [x] Permission status display (microphone, notifications)
- [x] Re-request permissions button
- [x] About section (version, privacy note)

## i18n Translations
- [x] English (en) translations
- [x] German (de) translations
- [x] Ukrainian (uk) translations

## Tests
- [x] Vitest: sunrise timing calculation (9 tests)
- [x] Vitest: language switching (7 tests)
- [x] Vitest: recording threshold logic (20 tests)
- [ ] Vitest: audio start/stop integration test (requires native mocking — deferred)

## Branding
- [x] Generate app logo (sunrise + moon + waveform concept)
- [x] Update app.config.ts with logo and app name
- [x] Copy logo to all required asset locations
