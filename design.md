# DawnDream Waker — Interface Design Plan

## Brand Identity

**Color Palette:**
- Sunrise gradient: `#FF4500` (deep red-orange) → `#FF8C00` (amber) → `#FFD700` (golden) → `#FFFFFF` (white)
- Primary accent: `#FF6B35` (warm orange — sunrise tone)
- Background light: `#FAFAFA`
- Background dark: `#0D0D0D`
- Surface light: `#FFFFFF`
- Surface dark: `#1A1A1A`
- Text light: `#1A1A1A`
- Text dark: `#F0F0F0`
- Muted light: `#6B7280`
- Muted dark: `#9CA3AF`
- Recording active: `#EF4444` (red)
- Success: `#22C55E`

## Screen List

1. **Home** — Alarm status, sunrise countdown, dream recording button
2. **Recordings** — Date-grouped list of audio recordings with waveform visualization
3. **Sleep Tips** — 5 evidence-based tips with YouTube links
4. **Settings** — Language selector, dark/light mode toggle, alarm configuration

## Primary Content & Functionality

### Home Screen
- **Sunrise Status Card**: Shows next alarm time, countdown to sunrise start, animated gradient preview
- **Sunrise Progress Bar**: Visual indicator of current sunrise simulation progress (0–100%)
- **Dream Recording Button**: Large circular button (200px diameter) — "Start Dream Recording" / "Stop Recording"
- **Recording Status**: Shows delay countdown (30 min), active recording indicator, auto-stop time
- **Active Alarm Display**: Shows the earliest upcoming alarm time imported from system

### Recordings Screen
- **Date-grouped FlatList**: Sections by YYYY-MM-DD
- **Recording Card**: Filename, duration, timestamp, waveform visualization (SVG bars), play/pause button
- **Empty state**: Illustration + "No recordings yet. Start your first dream recording tonight."
- **Delete swipe action**: Swipe left to delete a recording

### Sleep Tips Screen
- **ScrollView** with 5 tip cards
- Each card: tip number badge, title, 1–2 sentence description, source citation, YouTube link button
- YouTube links open in in-app browser (expo-web-browser)

### Settings Screen
- **Appearance section**: Dark/Light/System toggle (segmented control)
- **Language section**: EN / DE / UK picker
- **Alarm section**: Manual alarm time override (if system import unavailable)
- **Permissions section**: Shows microphone and notification permission status with re-request button
- **About section**: App version, privacy note ("All data stays on your device")

## Key User Flows

### Dream Recording Flow
1. User opens Home → taps "Start Dream Recording"
2. App shows 30-minute countdown timer
3. After 30 min → microphone activates, threshold detection begins
4. Sound > 40dB → recording segment saved as .m4a
5. Auto-stop 1 hour before earliest alarm (or manual stop)
6. User navigates to Recordings tab → sees new date folder with segments

### Sunrise Simulation Flow
1. App reads earliest active alarm (or user-set time)
2. 30 min before alarm → sunrise begins automatically
3. Screen brightness ramps 0→100%, background color shifts warm→white
4. User wakes up naturally; sunrise ends at alarm time

### Settings Flow
1. User opens Settings → taps language → selects DE/UK/EN
2. All UI text updates immediately
3. User toggles dark mode → entire app theme switches

## Navigation Structure

Bottom Tab Bar (4 tabs):
- **Home** (house icon) — primary screen
- **Recordings** (mic icon) — dream recordings list
- **Sleep Tips** (moon icon) — static tips
- **Settings** (gear icon) — app configuration

## Typography

- Headings: System font bold, 28–32pt
- Body: System font regular, 16–17pt
- Captions: System font, 13pt, muted color
- Tab labels: 11pt

## Component Patterns

- **Cards**: `rounded-2xl`, `shadow-sm`, `border border-border`, `p-4`
- **Primary Button**: `rounded-full`, `bg-primary`, `py-4 px-8`
- **Recording Button**: Large circle, 200px, gradient border when active, pulsing animation
- **Waveform**: SVG bar chart, 40 bars, height proportional to amplitude data
- **Section Headers**: Bold 18pt, `mb-3 mt-6`
