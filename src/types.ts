
export enum FileType {
  MP3 = 'MP3',
  M4B = 'M4B',
  UNKNOWN = 'UNKNOWN'
}

export enum AppStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
  CONFLICT = 'CONFLICT'
}

export interface AudioMetadata {
  codec: string;
  sampleRate: number;
  bitrate: string;
  channels: string;
  duration: number;
}

export interface AudioFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: FileType;
  status: 'pending' | 'processing' | 'done' | 'error';
  metadata?: AudioMetadata; 
  errorDetails?: string; 
  ignoreWarning?: boolean;
}

export interface MergeOptions {
  outputFormat: 'MP3' | 'M4B';
  bitrate: string;
  filename: string;
  autoFix?: boolean;
  useCustomBitrate?: boolean;
}

export interface ProcessingState {
  currentFileIndex: number;
  totalProgress: number; // 0-100
  stage: 'analyzing' | 'transcoding' | 'merging' | 'finalizing';
  startTime: number;
  estimatedTimeRemaining: number;
  speed?: string;
  currentSeconds: number; // Raw seconds processed
  totalSeconds: number;   // Total duration expected
  mergeMode?: 'Stream Copy' | 'Re-encode'; // New field for UI clarity
}

export interface FileConflict {
  fileName: string;
  reason: 'CORRUPT' | 'EMPTY' | 'SAMPLE_RATE_MISMATCH';
  details: string;
}

export interface ConflictData {
  conflicts: FileConflict[];
  targetSampleRate: number;
}

export interface SystemSpecs {
    cpu: string;
    memory: string;
    platform: string;
}

export interface ElectronAPI {
  selectSaveLocation: (defaultName: string, extension: string) => Promise<string | null>;
  getFfmpegVersion: () => Promise<string | null>;
  selectCustomFfmpegPath: () => Promise<string | null>;
  setFfmpegPath: (path: string) => Promise<{ success: boolean; error?: string }>;
  getSystemSpecs: () => Promise<SystemSpecs>;
  startMerge: (files: string[], outputPath: string, options: any) => void;
  cancelMerge: () => void;
  scanFiles: (files: string[]) => Promise<any[]>;
  openExternal: (url: string) => Promise<{ success: boolean; error?: string }>;
  showItemInFolder: (path: string) => Promise<void>;
  
  // Window Controls
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;

  onProgress: (callback: (data: any) => void) => void;
  onComplete: (callback: (path: string) => void) => void;
  onCompleteWithWarning: (callback: (data: { path: string, skipped: string[] }) => void) => void;
  onConflictsDetected: (callback: (data: ConflictData) => void) => void;
  onError: (callback: (error: string) => void) => void;
  removeAllListeners: () => void;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}
