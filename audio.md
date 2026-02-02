# Audio Implementation Documentation

This document outlines the architecture and implementation details for audio notifications in TimeBox.

## Architecture Overview

Audio in TimeBox is designed to be highly resilient across different operating systems, specifically addressing challenges found in Linux environments (WebKitGTK).

### 1. Base64 Asset Embedding
To bypass protocol-related security restrictions in production builds (where `asset://` or `tauri://` URIs might be blocked by the WebView), all audio assets are embedded directly as Base64 data URIs.

- **Storage**: Audio data is stored in `src/audioAssets.ts`.
- **Why**: This ensures that `new Audio()` calls succeed without needing to fetch external files, eliminating "Operation not supported" errors.

### 2. Global Management
Audio playback is centralized in the top-level `App.tsx` component.

- **Logic**: A global `useEffect` monitors the `isCompleted` state from the `useTimer` hook.
- **Benefit**: Sounds play reliably regardless of the active tab (Timer, History, Settings, etc.).
- **Unlock Mechanism**: Production WebViews often block audio until a user interaction occurs. The app includes an "Audio Unlock" listener on mount to satisfy this requirement.

### 3. Settings Synchronization
Sound settings are managed via Jotai atoms (`soundEnabledAtom`, `soundVolumeAtom`) and persisted to the backend.

- The app fetches these settings on launch to ensure the preferred volume is applied immediately.
- The `SettingsPanel` provides a **"Test Sound"** feature for user diagnostics.

## Linux System Dependencies

Tauri on Linux relies on **GStreamer** for media playback. For the audio to function, the following plugins must be installed on the host system:

- `gstreamer1.0-plugins-base` (Required for `appsink`)
- `gstreamer1.0-plugins-good` (Required for `autoaudiosink`)
- `gstreamer1.0-plugins-bad` / `ugly` (For various codec support)
- `gstreamer1.0-libav`
- Audio backend support: `gstreamer1.0-alsa`, `gstreamer1.0-pulseaudio`, or `gstreamer1.0-pipewire`.

The `./install.sh` script automatically handles these installations on Debian-based systems.

## Key Files

| File | Purpose |
|------|---------|
| `src/audioAssets.ts` | Contains Base64 data for all sounds. |
| `src/App.tsx` | Handles global sound triggers and audio context unlocking. |
| `src/SettingsPanel.tsx` | Manages sound settings UI and diagnostic testing. |
| `src/atoms.ts` | State management for sound preferences. |
| `install.sh` | System-level dependency management for Linux. |
