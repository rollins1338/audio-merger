<div align="center">

<img src="https://github.com/user-attachments/assets/c845d7b0-3ee9-4b52-8f15-e40ee1b20790" alt="AudioForge Pro" width="160" height="160" />

# 🎵 AudioForge Pro

**Professional Audio Merger & Converter for Audiobook Enthusiasts**

[![Version](https://img.shields.io/badge/version-1.7.0-cyan.svg?style=flat-square)](https://github.com/rollins1338/audio-merger/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg?style=flat-square)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-8A2BE2?style=flat-square)](https://github.com/rollins1338/audio-merger/releases)

[![Electron](https://img.shields.io/badge/Electron-28.0-47848F?style=flat-square&logo=electron)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![FFmpeg](https://img.shields.io/badge/FFmpeg-Powered-00D300?style=flat-square)](https://ffmpeg.org/)

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
- [Building from Source](#building-from-source)
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

<div align="center">

### Main Interface
<img src="https://github.com/user-attachments/assets/3af8709b-ecaa-4582-8344-84c587e68817" alt="AudioForge Pro - Main Interface" width="100%" />

<br/>

### File Queue & Metadata View
<img src="https://github.com/user-attachments/assets/aa16d94a-34ed-477c-a6d0-5828f2642853" alt="AudioForge Pro - Queue Management" width="100%" />

</div>

<details>
<summary>🎨 <strong>View More Interface Details</strong></summary>

<br/>

**Key Interface Features:**
- ⚡ **Drag & Drop Zone** - Simple file/folder uploads with visual feedback
- 📊 **Real-time Queue** - Live metadata scanning with color-coded status
- 🎯 **Smart Controls** - One-click format selection and bitrate adjustment  
- 📈 **Progress Tracking** - Detailed merge progress with ETA and speed metrics
- 🎨 **Dark Theme** - Eye-friendly interface optimized for extended sessions

</details>


---

## 🚀 Installation

### Pre-built Releases (Only Windows Available)

- **Windows**: `AudioForge-Pro-Setup-1.3.0.exe` (NSIS Installer)

> [Download Latest Release](https://github.com/rollins1338/audio-merger/releases)

- **macOS**: `AudioForge-Pro-1.3.0.dmg`
- **Linux**: `AudioForge-Pro-1.3.0.AppImage`
👉 [Building from Source](#building-from-source)

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

### Detailed Workflow

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

<table>
<tr>
<th>Setting</th>
<th>Options</th>
<th>Recommendation</th>
</tr>
<tr>
<td><strong>Format</strong></td>
<td>MP3 / M4B</td>
<td>M4B for chapter support</td>
</tr>
<tr>
<td><strong>Merge Mode</strong></td>
<td>Stream Copy / Re-Encode</td>
<td>Stream Copy for speed & quality</td>
</tr>
<tr>
<td><strong>Bitrate</strong></td>
<td>64k / 96k / 128k / 192k</td>
<td>Use only with Re-Encode mode</td>
</tr>
</table>

**Merge Mode Comparison:**
```
Stream Copy         Re-Encode
━━━━━━━━━━         ━━━━━━━━━━
⚡ Instant          🎚️ Custom Quality
🎯 Lossless         📉 Smaller Size
✅ Recommended      🔧 Advanced Users
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

## Building from Source

```bash
npm install
```

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
