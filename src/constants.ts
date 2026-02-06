
import { LucideIcon, Music, FileAudio, Settings, Zap } from 'lucide-react';

export const SUPPORTED_MIME_TYPES = {
  'audio/mpeg': '.mp3',
  'audio/mp4': '.m4b',
  'audio/x-m4b': '.m4b',
};

export const STAGE_MESSAGES = {
  analyzing: "Analyzing audio streams...",
  transcoding: "Transcoding audio data...",
  merging: "Concatenating segments...",
  finalizing: "Writing metadata and finalizing container...",
};

// Simulation constants
export const SPEED_MULTIPLIER_MP3_COPY = 50; // MB per second simulated
export const SPEED_MULTIPLIER_M4B_CONVERT = 5; // MB per second simulated (slower)

export const APP_NAME = "AudioForge Pro";
export const APP_VERSION = "1.7";
