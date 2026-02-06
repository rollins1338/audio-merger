# 🎵 AudioForge Pro

<div align="center">

![AudioForge Pro Banner](https://img.shields.io/badge/AudioForge-Pro-00D9FF?style=for-the-badge&logo=audio&logoColor=white)
![icon](https://github.com/user-attachments/assets/c845d7b0-3ee9-4b52-8f15-e40ee1b20790)
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="brandGradient" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#06b6d4"/> <!-- Cyan 500 -->
      <stop offset="100%" stop-color="#0f766e"/> <!-- Teal 700 -->
    </linearGradient>
    <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="15" stdDeviation="15" flood-color="#000000" flood-opacity="0.25"/>
    </filter>
  </defs>
  
  <!-- Background Container (Squircle) -->
  <rect x="0" y="0" width="512" height="512" rx="120" fill="url(#brandGradient)" />
  
  <!-- Inner Waveform Symbol (Scaled and Centered) -->
  <!-- Original Viewbox 24x24. Scaling by ~14x to fit 512px canvas with padding -->
  <g transform="translate(85, 85) scale(14.25)">
    <path d="M2 13a2 2 0 0 0 2-2V7a2 2 0 0 1 4 0v14a2 2 0 0 1 4 0V9a2 2 0 0 1 4 0v7a2 2 0 0 1 4 0v-2a2 2 0 0 0 2 2" 
          stroke="white" 
          stroke-width="2.5" 
          stroke-linecap="round" 
          stroke-linejoin="round"
          fill="none"/>
  </g>
</svg>


**Professional Audio Merger & Converter for Audiobook Enthusiasts**

[![Version](https://img.shields.io/badge/version-1.3.0-cyan.svg?style=flat-square)](https://github.com/rollins1338/audio-merger/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg?style=flat-square)](LICENSE)
[![Electron](https://img.shields.io/badge/Electron-28.0-47848F?style=flat-square&logo=electron)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Screenshots](#-screenshots)
- [Installation](#-installation)
- [Usage Guide](#-usage-guide)
- [Technical Details](#-technical-details)
- [Development](#-development)
- [Building from Source](#-building-from-source)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**AudioForge Pro** is a desktop application designed specifically for audiobook lovers who need to merge, convert, and organize audio chapter files with professional-grade quality. Built with Electron and React, it provides a beautiful, intuitive interface powered by advanced FFmpeg orchestration for lightning-fast, lossless audio processing.

### Why AudioForge Pro?

- **🔒 100% Private**: All processing happens locally on your machine—no cloud uploads
- **⚡ Lightning Fast**: Smart stream-copy technology merges files instantly without re-encoding
- **📚 Chapter-Aware**: Automatically detects intros, outros, and chapter structures
- **🎨 Beautiful UI**: Modern, dark-themed interface with real-time progress tracking
- **🔧 Professional**: Built on FFmpeg—the industry standard for audio/video processing

---

## ✨ Features

### Core Capabilities

#### 🎧 **Intelligent Audio Merging**
- Merge multiple MP3 or M4B files into a single audiobook file
- **Stream Copy Mode**: Instant merging without quality loss or re-encoding
- **Re-Encode Mode**: Custom bitrate control (64k, 96k, 128k, 192k)
- Automatic format detection and validation

#### 📑 **Smart Chapter Detection**
- Auto-generates chapter markers based on individual files
- Intelligently detects special chapters:
  - **Introductions** (Opening, Foreword, Preface)
  - **Epilogues** (Epilogue, Afterword, Conclusion)
  - **Credits** (Credits, Acknowledgments, About the Author)
- Sequential chapter numbering (excluding special chapters)

#### 🔍 **Advanced File Validation**
- Real-time metadata scanning (codec, sample rate, bitrate, duration)
- **Conflict Detection**:
  - Corrupt/unreadable files (marked in red)
  - Sample rate mismatches (visual alerts)
  - Large file warnings (configurable threshold)
- Drag-and-drop reordering (corrupt files are locked)

#### 📂 **Flexible Input Methods**
1. **File Upload**: Select multiple audio files
2. **Folder Upload**: Auto-scan entire directories for audio files
3. **Drag & Drop**: Drag files or folders directly into the app

#### 🎨 **Modern Interface**
- Dark theme optimized for extended use
- Real-time processing visualization with:
  - Progress bars with precise percentages
  - Speed metrics (transcoding speed in real-time)
  - ETA calculations
  - Current/total duration tracking
- **Queue Management**:
  - Visual duration bars for each file
  - Color-coded status indicators
  - One-click file removal
  - Bulk "Clear Queue" option

#### 🛡️ **Robust Error Handling**
- Three-tier conflict resolution:
  1. **Orange Warning**: Large files (can be kept or removed)
  2. **Red Error**: Corrupt files (must be removed)
  3. **Auto-fix Mode**: Skip problematic files automatically
- Detailed error messages with actionable guidance

---

## 📸 Screenshots

<img width="1192" height="470" alt="image" src="https://github.com/user-attachments/assets/3af8709b-ecaa-4582-8344-84c587e68817" />

<img width="1171" height="890" alt="image" src="https://github.com/user-attachments/assets/aa16d94a-34ed-477c-a6d0-5828f2642853" />


---

## 🚀 Installation

### Pre-built Releases (Recommended)

Download the latest release for your platform:

- **Windows**: `AudioForge-Pro-Setup-1.3.0.exe` (NSIS Installer)
- **macOS**: `AudioForge-Pro-1.3.0.dmg`
- **Linux**: `AudioForge-Pro-1.3.0.AppImage` or `.deb`

👉 [Download Latest Release](https://github.com/rollins1338/audio-merger/releases)

### System Requirements

- **OS**: Windows 10+, macOS 10.13+, Ubuntu 18.04+
- **RAM**: 4GB minimum, 8GB recommended
- **Disk Space**: 200MB for application + space for output files
- **FFmpeg**: Auto-bundled or system installation

---

## 📚 Usage Guide

### First-Time Setup

1. **Launch the app**: Open AudioForge Pro
2. **FFmpeg Check**: If FFmpeg isn't detected, the app will guide you to:
   - Use bundled binaries (automatic)
   - Install system FFmpeg
   - Manually select FFmpeg path

### Basic Workflow

#### 1️⃣ Add Files
```
┌─────────────────────────────────┐
│  Method 1: Click "Upload Files" │
│  Method 2: Click "Upload Folder"│
│  Method 3: Drag & Drop          │
└─────────────────────────────────┘
```

#### 2️⃣ Review Queue
- Check file metadata (codec, sample rate, bitrate)
- Reorder files by dragging (if needed)
- Remove any corrupt or unwanted files
- Resolve conflicts (sample rate mismatches)

#### 3️⃣ Configure Output
```javascript
{
  "Filename": "My Audiobook",      // Auto-suggested from first file
  "Format": "M4B | MP3",           // Choose output format
  "Merge Mode": {
    "Stream Copy": "Fastest, lossless (recommended)",
    "Re-Encode": "Custom bitrate (64k - 192k)"
  }
}
```

#### 4️⃣ Merge
- Click **"Merge X Files"**
- Watch real-time progress
- Locate output file when complete

### Advanced Features

#### Conflict Resolution
When conflicts are detected:

```
🟠 Orange Warning (Large File)
   → Click ✓ to keep, or ✗ to remove

🔴 Red Error (Corrupt/Mismatch)
   → Must remove file to proceed
   → Use "Auto-fix" mode to skip automatically
```

#### Keyboard Shortcuts
- `Esc` - Close modals/panels
- `Ctrl/Cmd + O` - Open files
- `Ctrl/Cmd + F` - Open folder

---

## 🔧 Technical Details

### Architecture

```
┌─────────────────────────────────────────────┐
│           AudioForge Pro Stack              │
├─────────────────────────────────────────────┤
│  Frontend: React 18 + TypeScript            │
│  UI Framework: Tailwind CSS + Lucide Icons │
│  Desktop: Electron 28                       │
│  Audio Engine: FFmpeg via fluent-ffmpeg     │
│  Build System: electron-builder             │
└─────────────────────────────────────────────┘
```

### Key Technologies

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **UI Layer** | React 18 + TypeScript | Modern, type-safe component architecture |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **Icons** | Lucide React | Consistent, scalable icon system |
| **Desktop Runtime** | Electron 28 | Cross-platform native app wrapper |
| **Audio Processing** | FFmpeg (fluent-ffmpeg) | Industry-standard media manipulation |
| **Binary Bundling** | ffmpeg-static, ffprobe-static | Self-contained FFmpeg distribution |
| **Build Pipeline** | electron-builder | Multi-platform packaging |

### Processing Modes

#### Stream Copy (Lossless)
```bash
# MP3 to MP3 (Binary Concatenation)
ffmpeg -f concat -safe 0 -i filelist.txt -c copy -map_metadata 1 output.mp3

# M4B to M4B (Container Remux)
ffmpeg -f concat -safe 0 -i filelist.txt -c copy -movflags +faststart output.m4b
```

#### Re-Encode (Custom Bitrate)
```bash
# MP3 Output
ffmpeg -f concat -safe 0 -i filelist.txt -c:a libmp3lame -b:a 128k output.mp3

# M4B Output
ffmpeg -f concat -safe 0 -i filelist.txt -c:a aac -b:a 96k -movflags +faststart output.m4b
```

### Chapter Metadata Format
```ini
;FFMETADATA1
[CHAPTER]
TIMEBASE=1/1000
START=0
END=123456
title=Introduction

[CHAPTER]
TIMEBASE=1/1000
START=123456
END=456789
title=Chapter 1
```

---

## 💻 Development

### Prerequisites

```bash
Node.js >= 16.x
npm >= 8.x
FFmpeg (system installation or bundled)
```

### Clone & Install

```bash
# Clone repository
git clone https://github.com/rollins1338/audio-merger.git
cd audio-merger

# Install dependencies
npm install
```

### Development Scripts

```bash
# Start React dev server + Electron in dev mode
npm run electron:dev

# Build React app only
npm run build

# Run React tests
npm test

# Clean duplicate dependencies (if needed)
npm run clean-dupes
```

### Project Structure

```
audioforge-pro/
├── src/                    # React source code
│   ├── components/         # UI components
│   │   ├── FileList.tsx   # Queue display with drag-drop
│   │   ├── ProcessingOverlay.tsx
│   │   ├── FFmpegModal.tsx
│   │   ├── ConflictModal.tsx
│   │   └── AboutPanel.tsx
│   ├── utils/             # Helper functions
│   ├── types.ts           # TypeScript definitions
│   ├── constants.ts       # App constants
│   └── App.tsx            # Main app component
├── electron/              # Electron main process
│   ├── main.js           # IPC handlers, FFmpeg logic
│   └── preload.js        # Context bridge
├── public/               # Static assets
│   ├── icon.ico/.icns/.png
│   └── index.html
└── package.json          # Dependencies & scripts
```

### Key Files

#### `App.tsx`
- Main React component
- State management (files, options, processing state)
- Drag-drop handling
- IPC communication with Electron

#### `electron/main.js`
- FFmpeg configuration & detection
- File validation & metadata extraction
- Merge orchestration (stream copy vs. re-encode)
- Chapter detection logic
- Progress tracking & IPC events

#### `FileList.tsx`
- Queue visualization
- Drag-drop reordering
- Conflict indicators
- File metadata badges

---

## 🏗️ Building from Source

### Build for Current Platform

```bash
npm run electron:build
```

Output: `dist/` directory

### Build for Specific Platforms

```bash
# Windows
npm run electron:build -- --win

# macOS
npm run electron:build -- --mac

# Linux
npm run electron:build -- --linux
```

### Build Configuration

Located in `package.json` under `"build"`:

```json
{
  "appId": "com.audioforge.pro",
  "productName": "AudioForge Pro",
  "asar": true,
  "asarUnpack": [
    "node_modules/ffmpeg-static/**",
    "node_modules/ffprobe-static/**"
  ]
}
```

### Custom FFmpeg Paths

If using system FFmpeg instead of bundled binaries:

1. Set environment variable before building:
   ```bash
   export FFMPEG_PATH=/usr/local/bin/ffmpeg
   export FFPROBE_PATH=/usr/local/bin/ffprobe
   ```

2. Or configure in-app via **Settings → FFmpeg Setup**

---

## 🐛 Troubleshooting

### FFmpeg Not Detected

**Symptoms**: "FFmpeg Setup Required" warning on startup

**Solutions**:
1. **Bundled Binaries** (Automatic):
   - App should auto-detect bundled FFmpeg
   - Check `node_modules/ffmpeg-static` exists

2. **System Installation**:
   ```bash
   # macOS
   brew install ffmpeg
   
   # Ubuntu/Debian
   sudo apt install ffmpeg
   
   # Windows
   # Download from https://ffmpeg.org/download.html
   # Add to PATH or use manual path selection in app
   ```

3. **Manual Path**:
   - Click "Setup FFmpeg" → "Locate FFmpeg"
   - Navigate to FFmpeg binary

### Sample Rate Mismatch Warnings

**Symptoms**: Red badges on files showing different sample rates (e.g., 48000Hz vs. 44100Hz)

**Why This Happens**: Mixed-rate files can cause sync issues in final output

**Solutions**:
- **Option 1**: Use "Auto-fix" mode when prompted (re-samples automatically)
- **Option 2**: Pre-convert files to matching sample rate before merge
- **Option 3**: Enable "Re-Encode" mode (forces re-sampling)

### Corrupt File Errors

**Symptoms**: Files marked with red ⚠️ badge, metadata shows "Corrupt"

**Causes**:
- Incomplete downloads
- Damaged files
- Unsupported codecs

**Solutions**:
- Remove corrupted files from queue
- Re-download original files
- Convert to MP3/M4B using external tool first

### Large File Warnings

**Symptoms**: Orange warning badge on files >500MB

**Why**: Large files may impact performance

**Solutions**:
- Click ✓ to acknowledge and keep file
- Or remove and split into smaller files

### Build Errors

```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run electron:build
```

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Reporting Bugs

1. Check [existing issues](https://github.com/rollins1338/audio-merger/issues)
2. Create new issue with:
   - OS and version
   - AudioForge Pro version
   - Steps to reproduce
   - Expected vs. actual behavior
   - Screenshots (if applicable)

### Feature Requests

Open an issue with tag `enhancement`:
- Describe the feature
- Explain use case
- Provide mockups (if UI-related)

### Pull Requests

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Code Style

- TypeScript for type safety
- ESLint configuration (run `npm run lint`)
- Tailwind CSS for styling
- Lucide React for icons

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 RxxFii (Rollins)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software...
```

---

## 🙏 Acknowledgments

- **FFmpeg Team** - For the incredible media processing framework
- **Electron Team** - For cross-platform desktop capabilities
- **React Team** - For the component architecture
- **Audiobook Community** - For inspiration and feedback

---

## 📬 Contact & Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/rollins1338/audio-merger/issues)
- **Developer**: [@rollins1338](https://github.com/rollins1338)
- **Email**: support@audioforge.pro *(if available)*

---

<div align="center">

**Built with ❤️ by [RxxFii](https://github.com/rollins1338)**

⭐ Star this repo if you find it useful!

</div>
