
import { ConflictData } from '../types';

export const setupMockElectron = () => {
  // Only setup if window.electron is missing
  if ((window as any).electron) return;

  console.log('[Preview] Setting up Mock Electron API');

  let progressInterval: any = null;
  const listeners: Record<string, Function[]> = {
    'merge-progress': [],
    'merge-complete': [],
    'merge-error': [],
    'merge-conflicts-detected': [],
    'merge-complete-warning': []
  };

  const emit = (event: string, data: any) => {
    if (listeners[event]) {
      listeners[event].forEach(cb => cb(data));
    }
  };

  (window as any).electron = {
    getFfmpegVersion: async () => {
      await new Promise(r => setTimeout(r, 800)); // Fake delay
      return "6.0 (Preview Mode)";
    },
    selectCustomFfmpegPath: async () => "/usr/bin/ffmpeg",
    setFfmpegPath: async () => ({ success: true }),
    getSystemSpecs: async () => ({ cpu: 'Virtual CPU', memory: '16 GB', platform: 'Web Preview' }),
    
    selectSaveLocation: async (defaultName: string, ext: string) => {
      // In preview, we can't save to disk, so just return a fake path
      return `C:\\Downloads\\${defaultName}.${ext}`;
    },

    openExternal: async (url: string) => { 
      window.open(url, '_blank'); 
      return { success: true }; 
    },

    showItemInFolder: async (path: string) => { 
      alert(`[Preview] Would open folder for: ${path}`); 
    },
    
    scanFiles: async (identifiers: string[]) => {
      // Simulate scanning delay
      await new Promise(r => setTimeout(r, 600));
      
      return identifiers.map((id, index) => {
        // Generate pseudo-random realistic metadata
        const isM4b = id.toLowerCase().endsWith('.m4b');
        const duration = 180 + (index * 45) % 600; // Varying duration
        
        return {
          path: id, // Echo back the identifier so App.tsx can match it
          metadata: {
            codec: isM4b ? 'aac' : 'mp3',
            sampleRate: 44100,
            bitrate: '128k',
            channels: 'Stereo',
            duration: duration,
            size: 1024 * 1024 * (duration / 60) // Rough size approx
          }
        };
      });
    },

    startMerge: (files: string[], output: string, options: any) => {
      if (progressInterval) clearInterval(progressInterval);
      
      console.log('[Preview] Starting simulated merge:', options);
      
      let progress = 0;
      let stage = 'analyzing';
      let currentSec = 0;
      const totalSec = 1000; // Fake total duration
      
      progressInterval = setInterval(() => {
        progress += 0.5 + Math.random(); // Increment progress
        currentSec += 10;
        
        // Simulate stages
        if (progress < 5) stage = 'analyzing';
        else if (progress < 30) stage = 'transcoding';
        else if (progress < 90) stage = 'merging';
        else stage = 'finalizing';

        if (progress >= 100) {
          clearInterval(progressInterval);
          emit('merge-complete', output);
        } else {
          emit('merge-progress', {
            percent: Math.min(99.9, progress),
            stage: stage,
            eta: Math.max(0, Math.floor((100 - progress) / 2)),
            speed: '12.5x',
            currentSeconds: currentSec,
            totalSeconds: totalSec
          });
        }
      }, 100);
    },

    cancelMerge: () => {
      if (progressInterval) clearInterval(progressInterval);
      console.log('[Preview] Merge cancelled');
      emit('merge-error', 'Operation cancelled by user (Preview)');
    },

    onProgress: (cb: any) => listeners['merge-progress'].push(cb),
    onComplete: (cb: any) => listeners['merge-complete'].push(cb),
    onCompleteWithWarning: (cb: any) => listeners['merge-complete-warning'].push(cb),
    onConflictsDetected: (cb: any) => listeners['merge-conflicts-detected'].push(cb),
    onError: (cb: any) => listeners['merge-error'].push(cb),
    removeAllListeners: () => {
       Object.keys(listeners).forEach(k => listeners[k] = []);
    }
  };
};
