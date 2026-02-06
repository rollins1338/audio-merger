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

## ✨ Features

- **⚡ Lightning Fast** - Stream-copy merging without re-encoding
- **📚 Smart Chapters** - Auto-detects intros, epilogues, and chapter structures
- **🔒 100% Private** - All processing happens locally on your machine
- **🎨 Beautiful UI** - Modern dark theme with real-time progress tracking
- **📂 Flexible Input** - Drag & drop files or folders
- **🛡️ Robust** - Automatic corrupt file detection and conflict resolution

---

## 📸 Screenshots

<div align="center">

### Main Interface
<img src="https://github.com/user-attachments/assets/3af8709b-ecaa-4582-8344-84c587e68817" alt="AudioForge Pro - Main Interface" width="100%" />

<br/>

### File Queue & Metadata View
<img src="https://github.com/user-attachments/assets/aa16d94a-34ed-477c-a6d0-5828f2642853" alt="AudioForge Pro - Queue Management" width="100%" />

</div>

---

## 🚀 Installation

### Windows
Download `AudioForge-Pro-Setup-1.3.0.exe` from [Releases](https://github.com/rollins1338/audio-merger/releases)

### macOS & Linux
See [Build Guide](https://github.com/rollins1338/linuxmacguide-for-af/blob/main/README.md)

**Requirements:**
- Windows 10+, macOS 10.13+, or Ubuntu 18.04+
- 4GB RAM (8GB recommended)
- FFmpeg (auto-bundled)

---

## 📚 Quick Start

1. **Add Files** - Drag & drop files/folders or click "Select Files"
2. **Review Queue** - Check metadata, reorder if needed, remove corrupted files
3. **Configure**
   - Format: MP3 or M4B
   - Mode: Stream Copy (fast) or Re-Encode (custom quality)
   - Bitrate: 64k-192k (re-encode only)
4. **Merge** - Click "Merge X Files" and wait for completion

**Merge Modes:**
```
Stream Copy          Re-Encode
━━━━━━━━━━          ━━━━━━━━━━
⚡ Instant           🎚️ Custom Quality
🎯 Lossless          📉 Smaller Size
✅ Recommended       🔧 Advanced
```

---

## 🔧 Technical Details

**Stack:**
- Frontend: React 18 + TypeScript
- Desktop: Electron 28
- Audio: FFmpeg (fluent-ffmpeg)
- UI: Tailwind CSS + Lucide Icons

**Processing:**
```bash
# Stream Copy (Lossless)
ffmpeg -f concat -safe 0 -i filelist.txt -c copy output.m4b

# Re-Encode (Custom Bitrate)
ffmpeg -f concat -safe 0 -i filelist.txt -c:a aac -b:a 64k output.m4b
```

---

## 💻 Development

```bash
# Clone and install
git clone https://github.com/rollins1338/audio-merger.git
cd audio-merger
npm install

# Development mode
npm run electron:dev

# Build for production
npm run electron:build
```

**Project Structure:**
```
src/
├── components/        # UI components
├── utils/            # Helper functions
└── App.tsx           # Main app
electron/
├── main.js           # IPC & FFmpeg logic
└── preload.js        # Context bridge
```

---

## 🐛 Troubleshooting

**FFmpeg Not Detected**
- App auto-bundles FFmpeg
- Or install: `brew install ffmpeg` (macOS), `sudo apt install ffmpeg` (Linux)
- Or manually select path in Settings

**Sample Rate Mismatch**
- Use "Auto-fix" mode (auto-resamples)
- Or enable "Re-Encode" mode

**Corrupt Files**
- Files marked with ⚠️ red badge
- Remove from queue or use Auto-fix

---

## 🤝 Contributing

Bug reports and feature requests welcome! [Open an issue](https://github.com/rollins1338/audio-merger/issues)

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file

---

<div align="center">

**Built with ❤️ by [RxxFii](https://github.com/rollins1338)**

⭐ Star this repo if you find it useful!

</div>
