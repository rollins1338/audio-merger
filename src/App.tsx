
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Upload, Settings, Info, Github, AudioWaveform, Zap, Activity, Type, AlertTriangle, XCircle, CheckCircle2, ArrowRight, Gauge, Scissors, FolderOpen, Moon, FileAudio, Folder, Plus, Cpu, HardDrive, HelpCircle } from 'lucide-react';
import { FileList } from './components/FileList';
import { Button } from './components/Button';
import { ProcessingOverlay } from './components/ProcessingOverlay';
import { FFmpegModal } from './components/FFmpegModal';
import { ConflictModal } from './components/ConflictModal';
import { AboutPanel } from './components/AboutPanel';
import { HelpModal } from './components/HelpModal';
import { WindowControls } from './components/WindowControls';
import { AudioFile, FileType, AppStatus, MergeOptions, ProcessingState, ConflictData, SystemSpecs } from './types';
import { processIncomingFiles, formatFileSize, scanDroppedItems } from './utils/formatters';
import { APP_NAME, APP_VERSION } from './constants';

// Add webkitdirectory to React Input attributes to suppress TS errors
declare module 'react' {
  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    webkitdirectory?: string | boolean;
    directory?: string | boolean;
  }
}

const suggestFilename = (originalName: string): string => {
  // 1. Remove extension
  let name = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;

  // 2. Remove specific unwanted patterns (case insensitive)
  name = name.replace(/[-_.\s]*(opening|ending|credits|intro|outro|prologue|epilogue).*/gi, '');
  name = name.replace(/[-_.\s]*(chapter|part|track)\s*[\d.]+/gi, '');

  // 3. Remove leading/trailing sort numbers and brackets
  name = name.replace(/^\d+[\s._-]+/g, '');
  name = name.replace(/[\s._-]+\d+$/g, '');
  name = name.replace(/\[.*?\]/g, '');
  name = name.replace(/\(\d{4}\)/g, '');

  // 4. Clean up punctuation
  name = name.replace(/[._]/g, ' '); 
  name = name.replace(/[^a-zA-Z0-9\s]+$/g, ''); 
  name = name.replace(/^[^a-zA-Z0-9\s]+/g, '');
  
  // 5. Collapse spaces
  name = name.replace(/\s{2,}/g, ' ');

  return name.trim() || "Audio";
};

// --- Sorting Logic: Errors/Warnings First, then Alphabetical ---
const sortFiles = (list: AudioFile[]): AudioFile[] => {
  return [...list].sort((a, b) => {
    const aIsBad = a.status === 'error';
    const bIsBad = b.status === 'error';
    
    // 1. Errors/Warnings come first
    if (aIsBad && !bIsBad) return -1;
    if (!aIsBad && bIsBad) return 1;
    
    // 2. Then alphabetical by name
    return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
  });
};

const App: React.FC = () => {
  const [showToast, setShowToast] = useState(false);
  const [files, setFiles] = useState<AudioFile[]>([]);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [lastOutputPath, setLastOutputPath] = useState<string | null>(null);
  const [finalFilename, setFinalFilename] = useState<string>(''); 
  
  const [options, setOptions] = useState<MergeOptions>({ 
    outputFormat: 'MP3', 
    bitrate: '64k', 
    filename: '' 
  });

  const [useCustomBitrate, setUseCustomBitrate] = useState(false);
  
  const [dragActive, setDragActive] = useState(false);
  const [ffmpegVersion, setFfmpegVersion] = useState<string | null>(null);
  const [checkingFfmpeg, setCheckingFfmpeg] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);
  const [showFfmpegModal, setShowFfmpegModal] = useState(false);
  const [skippedFiles, setSkippedFiles] = useState<string[]>([]);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [conflictData, setConflictData] = useState<ConflictData | null>(null);
  const [systemSpecs, setSystemSpecs] = useState<SystemSpecs | null>(null);

  // Refs for dual input method
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const [processingState, setProcessingState] = useState<ProcessingState>({
    currentFileIndex: 0,
    totalProgress: 0,
    stage: 'analyzing',
    startTime: 0,
    estimatedTimeRemaining: 0,
    speed: '0.0x',
    currentSeconds: 0,
    totalSeconds: 0,
    mergeMode: 'Stream Copy'
  });

  // Check first time launch logic
  useEffect(() => {
    const hasSeenHelp = localStorage.getItem('audioforge_has_seen_help');
    if (!hasSeenHelp) {
      setShowHelpModal(true);
      localStorage.setItem('audioforge_has_seen_help', 'true');
    }
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showInfoPanel) setShowInfoPanel(false);
        if (showHelpModal) setShowHelpModal(false);
        if (showFfmpegModal) setShowFfmpegModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showInfoPanel, showHelpModal, showFfmpegModal]);

  // Check if forced transcoding will occur (MP3 -> M4B)
  const isForcedTranscode = useMemo(() => {
     if (options.outputFormat !== 'M4B') return false;
     return files.some(f => f.type === FileType.MP3 && f.status !== 'error');
  }, [options.outputFormat, files]);

  // Calculate Display Bitrate
  const displayedBitrate = useMemo(() => {
    if (useCustomBitrate || isForcedTranscode) {
        return options.bitrate;
    }
    const validFiles = files.filter(f => f.status !== 'error');
    if (validFiles.length === 0) return 'Original';

    const totalDuration = validFiles.reduce((acc, f) => acc + (f.metadata?.duration || 0), 0);
    if (totalDuration === 0) return '...';

    const totalSize = validFiles.reduce((acc, f) => acc + f.size, 0);
    const bps = (totalSize * 8) / totalDuration;
    const kbps = Math.round(bps / 1000);

    return `~${kbps}k`;
  }, [files, useCustomBitrate, isForcedTranscode, options.bitrate]);

  // Stats Calculation for UI
  const estimatedOutputSize = useMemo(() => {
    const validFiles = files.filter(f => f.status !== 'error');
    if (validFiles.length === 0) return '0 Bytes';
    
    if (!useCustomBitrate && !isForcedTranscode) {
        const total = validFiles.reduce((acc, f) => acc + f.size, 0);
        return formatFileSize(total);
    } 
    
    const totalDuration = validFiles.reduce((acc, f) => acc + (f.metadata?.duration || 0), 0);
    if (totalDuration === 0) return 'Calculating...';

    let currentBitrate = options.bitrate || '64k';
    if (!useCustomBitrate && isForcedTranscode) {
        currentBitrate = '64k';
    }
    
    const bitrateVal = parseInt(currentBitrate.replace('k', '')) * 1000;
    const sizeInBits = totalDuration * bitrateVal;
    const sizeInBytes = sizeInBits / 8;
    
    return formatFileSize(sizeInBytes);
  }, [files, useCustomBitrate, options.bitrate, isForcedTranscode]);

  const checkFfmpeg = async () => {
    if (!window.electron) return;
    setCheckingFfmpeg(true);
    const savedPath = localStorage.getItem('custom_ffmpeg_path');
    if (savedPath) {
      await window.electron.setFfmpegPath(savedPath);
    }
    const v = await window.electron.getFfmpegVersion();
    setFfmpegVersion(v);
    setCheckingFfmpeg(false);

    if (window.electron.getSystemSpecs) {
        const specs = await window.electron.getSystemSpecs();
        setSystemSpecs(specs);
    }
  };

  useEffect(() => {
    checkFfmpeg();
    return () => { 
        if (window.electron) window.electron.removeAllListeners(); 
    };
  }, []);

  useEffect(() => {
    if (ffmpegVersion) setShowFfmpegModal(false);
  }, [ffmpegVersion]);

  // --- Strict Consistency & Status Logic ---
  const enforceFileConsistency = useCallback((fileList: AudioFile[]): AudioFile[] => {
    const counts = { [FileType.MP3]: 0, [FileType.M4B]: 0, [FileType.UNKNOWN]: 0 };
    fileList.forEach(f => {
      if (f.errorDetails !== 'Corrupt') {
         counts[f.type] = (counts[f.type] || 0) + 1;
      }
    });

    let majorityType: FileType | null = null;
    if (counts[FileType.MP3] > counts[FileType.M4B]) majorityType = FileType.MP3;
    else if (counts[FileType.M4B] > counts[FileType.MP3]) majorityType = FileType.M4B;
    else {
       const firstValid = fileList.find(f => f.errorDetails !== 'Corrupt');
       if (firstValid) majorityType = firstValid.type;
    }

    const validDurations = fileList
        .filter(f => f.metadata && f.metadata.duration > 0 && f.errorDetails !== 'Corrupt')
        .map(f => f.metadata!.duration)
        .sort((a, b) => a - b);
    
    let medianDuration = 0;
    if (validDurations.length > 0) {
        const mid = Math.floor(validDurations.length / 2);
        medianDuration = validDurations.length % 2 !== 0 
            ? validDurations[mid] 
            : (validDurations[mid - 1] + validDurations[mid]) / 2;
    }

    // 1. Process files to assign statuses
    const processed = fileList.map(f => {
       if (f.errorDetails === 'Corrupt') return f;

       // If user explicitly ignored warning, clear any non-corrupt error statuses
       if (f.ignoreWarning) {
           if (f.status === 'error' && f.errorDetails !== 'Corrupt') {
               return { ...f, status: f.metadata ? 'done' as const : 'pending' as const, errorDetails: undefined };
           }
           return f;
       }

       if (majorityType && f.type !== majorityType) {
           return { ...f, status: 'error' as const, errorDetails: 'Format Mismatch' };
       } 
       
       if (validDurations.length > 2 && f.metadata && medianDuration > 0) {
           const duration = f.metadata.duration;
           const nameSuspicious = f.name.toLowerCase().includes('merged');
           const isSignificantlyLarger = duration > (medianDuration * 3);
           const isAbsurdlyLarger = duration > (medianDuration * 15);

           if ((nameSuspicious && isSignificantlyLarger) || isAbsurdlyLarger) {
               return { ...f, status: 'error' as const, errorDetails: 'Large File Warning' };
           }
       }

       // Auto-resolve if conditions no longer apply
       if (f.status === 'error' && (f.errorDetails === 'Format Mismatch' || f.errorDetails === 'Already Merged?' || f.errorDetails === 'Large File Warning')) {
           return { ...f, status: f.metadata ? 'done' as const : 'pending' as const, errorDetails: undefined };
       }
       return f;
    });

    // 2. Sort the result: Errors at Top, then Alphabetical
    return sortFiles(processed);
  }, []);

  const scanFileMetadata = useCallback(async (filesToScan: AudioFile[]) => {
    if (!window.electron || !filesToScan.length) return;
    
    const identifiers = filesToScan.map(f => (f.file as any).path || f.name);

    try {
      const results = await window.electron.scanFiles(identifiers);
      setFiles(prevFiles => {
         const withMetadata = prevFiles.map((file): AudioFile => {
            const id = (file.file as any).path || file.name;
            const result = results.find(r => r.path === id);
            
            if (result) {
                 if (result.error) {
                     return { ...file, status: 'error', metadata: undefined, errorDetails: 'Corrupt' };
                 }
                 if (result.metadata) {
                     const nextStatus: AudioFile['status'] = file.status === 'error' ? 'error' : 'done';
                     return { ...file, metadata: result.metadata, status: nextStatus };
                 }
            }
            return file;
         });
         // Apply consistency and sort immediately after scan
         return enforceFileConsistency(withMetadata);
      });
    } catch (error) { console.error(error); }
  }, [enforceFileConsistency]);

  useEffect(() => {
    if (ffmpegVersion) {
      const filesToScan = files.filter(f => !f.metadata && f.errorDetails !== 'Corrupt');
      if (filesToScan.length > 0) {
        const timer = setTimeout(() => scanFileMetadata(filesToScan), 100);
        return () => clearTimeout(timer);
      }
    }
  }, [ffmpegVersion, files, scanFileMetadata]);

  // Clean queue state on empty
  useEffect(() => {
    if (files.length === 0) {
       setOptions(prev => ({ ...prev, filename: '' }));
       setErrorMessage(null); 
       setUploadError(null);
       setSkippedFiles([]);
       setConflictData(null);
    }
  }, [files.length]);

  const handleLocateFfmpeg = async () => {
    if (!window.electron) return;
    setConfigError(null);
    const path = await window.electron.selectCustomFfmpegPath();
    if (path) {
      const result = await window.electron.setFfmpegPath(path);
      if (result.success) {
        localStorage.setItem('custom_ffmpeg_path', path);
        checkFfmpeg(); 
      } else {
        setConfigError(result.error || "Failed to set FFmpeg path.");
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    if (status !== AppStatus.IDLE) return;
    
    const isFileDrag = e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('Files');
    if (!isFileDrag) return;

    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (status !== AppStatus.IDLE) return;

    let incomingFiles: File[] = [];
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      try {
        incomingFiles = await scanDroppedItems(e.dataTransfer.items);
      } catch (err) {
        console.error("Scanning error:", err);
        setUploadError("Failed to scan folder structure.");
        return;
      }
    } else if (e.dataTransfer.files?.length > 0) {
      incomingFiles = Array.from(e.dataTransfer.files);
    }

    if (incomingFiles.length > 0) {
      handleFiles(incomingFiles);
    }
  };

  const handleFiles = async (incomingFiles: File[]) => {
    setUploadError(null);
    const validFiles = processIncomingFiles(incomingFiles);
    
    if (validFiles.length === 0) {
        if (incomingFiles.length > 0 && incomingFiles.length < 5) {
             setUploadError("No supported audio files (MP3/M4B) found in selection.");
        }
        return;
    }

    setFiles(prev => {
      const combined = [...prev, ...validFiles];
      // Apply consistency check which will also sort (Errors to top, then Alpha)
      return enforceFileConsistency(combined);
    });
  };

  const clearQueue = () => {
    setFiles([]);
    setLastOutputPath(null);
    setFinalFilename('');
  };

  const resetApp = () => {
    if (window.electron) window.electron.removeAllListeners();
    setStatus(AppStatus.IDLE);
    clearQueue();
    setProcessingState({
      currentFileIndex: 0,
      totalProgress: 0,
      stage: 'analyzing',
      startTime: 0,
      estimatedTimeRemaining: 0,
      speed: '0.0x',
      currentSeconds: 0,
      totalSeconds: 0,
      mergeMode: 'Stream Copy'
    });
  };

  const handleCancel = () => {
    if (window.electron?.cancelMerge) window.electron.cancelMerge();
    if (window.electron) window.electron.removeAllListeners();
    setStatus(AppStatus.IDLE);
    setConflictData(null);
    setErrorMessage(null);
  };

  const handleLocateFile = () => {
      if (lastOutputPath && window.electron && window.electron.showItemInFolder) {
          window.electron.showItemInFolder(lastOutputPath);
      }
  };

  // Resolve Keep: Mark as ignored, then re-run consistency to clear error status and re-sort
  const handleKeepFile = (id: string) => {
    setFiles(prev => {
        const updated = prev.map(f => {
            if (f.id === id) {
                return { ...f, ignoreWarning: true };
            }
            return f;
        });
        return enforceFileConsistency(updated);
    });
  };

  // Proper Delete: Remove file, then re-run consistency to update warnings on remaining files
  const handleRemoveFile = (id: string) => {
      setFiles(prev => {
          const remaining = prev.filter(f => f.id !== id);
          return enforceFileConsistency(remaining);
      });
  };

  const getEffectiveFilename = () => {
    if (options.filename.trim()) return options.filename;
    const validFiles = files.filter(f => f.status !== 'error');
    if (validFiles.length > 0) return `[MERGED] ${suggestFilename(validFiles[0].name)}`;
    return '[MERGED] Audio';
  };

  const startMerge = async (autoFix = false, fileListOverride?: AudioFile[]) => {
    const filesToMerge = fileListOverride || files;
    const validFilesToMerge = filesToMerge.filter(f => f.status !== 'error');

    if (!window.electron || validFilesToMerge.length === 0 || !ffmpegVersion) {
        if (filesToMerge.length > 0 && validFilesToMerge.length === 0) {
             setUploadError("All files are flagged as errors or incompatible.");
        }
        return; 
    }

    const effectiveName = getEffectiveFilename();
    const finalFilename = options.filename.trim() || effectiveName;
    
    const savePath = await window.electron.selectSaveLocation(finalFilename, options.outputFormat);
    if (!savePath) return;
    
    const savedName = savePath.split(/[/\\]/).pop() || savePath;
    setLastOutputPath(savePath);
    setFinalFilename(savedName);

    const filePaths = validFilesToMerge.map(f => (f.file as any).path || f.name);

    const effectiveReEncode = useCustomBitrate || isForcedTranscode;
    const mergeMode = effectiveReEncode ? 'Re-encode' : 'Stream Copy';

    setProcessingState({
      currentFileIndex: 0,
      totalProgress: 0,
      stage: 'analyzing',
      startTime: Date.now(),
      estimatedTimeRemaining: 0,
      speed: '0.0x',
      currentSeconds: 0,
      totalSeconds: 0,
      mergeMode: mergeMode
    });
    setErrorMessage(null);
    setSkippedFiles([]);
    setStatus(AppStatus.PROCESSING);

    window.electron.onProgress((data) => {
      let calculatedIndex = 0;
      const currentSec = data.currentSeconds || 0;
      let accumulatedDuration = 0;

      for (let i = 0; i < validFilesToMerge.length; i++) {
        const dur = validFilesToMerge[i].metadata?.duration || 0;
        accumulatedDuration += dur;
        if (currentSec < accumulatedDuration) {
          calculatedIndex = i;
          break;
        }
        if (i === validFilesToMerge.length - 1) calculatedIndex = i;
      }

      setProcessingState(prev => ({
        ...prev,
        totalProgress: data.percent,
        stage: data.stage as any,
        estimatedTimeRemaining: data.eta || 0,
        speed: data.speed,
        currentSeconds: data.currentSeconds,
        totalSeconds: data.totalSeconds,
        currentFileIndex: calculatedIndex
      }));
    });

    window.electron.onComplete((path) => {
      setProcessingState(prev => ({ ...prev, totalProgress: 100, stage: 'finalizing', currentSeconds: prev.totalSeconds }));
      setTimeout(() => setStatus(AppStatus.COMPLETED), 800);
    });

    window.electron.onCompleteWithWarning((data) => {
      setSkippedFiles(data.skipped);
      setProcessingState(prev => ({ ...prev, totalProgress: 100, stage: 'finalizing', currentSeconds: prev.totalSeconds }));
      setTimeout(() => setStatus(AppStatus.COMPLETED), 800);
    });

    window.electron.onConflictsDetected((data) => {
      setStatus(AppStatus.CONFLICT);
      setConflictData(data);
    });

    window.electron.onError((err) => {
      setStatus(AppStatus.ERROR);
      setErrorMessage(err);
    });

    window.electron.startMerge(filePaths, savePath, {
      bitrate: options.bitrate,
      outputFormat: options.outputFormat,
      autoFix: autoFix, 
      useCustomBitrate: effectiveReEncode 
    });
  };

  const handleAutoFixAction = () => {
    if (!conflictData) return;

    const corruptedFileNames = conflictData.conflicts
        .filter(c => c.reason === 'CORRUPT' || c.reason === 'EMPTY')
        .map(c => c.fileName);
    
    const cleanFiles = files.filter(f => !corruptedFileNames.includes(f.name));
    setFiles(enforceFileConsistency(cleanFiles));
    setConflictData(null);
    startMerge(true, cleanFiles);
  };

  useEffect(() => {
    const hasM4B = files.some(f => f.type === FileType.M4B && f.status !== 'error');
    if (hasM4B && options.outputFormat === 'MP3') {
      setOptions(prev => ({ ...prev, outputFormat: 'M4B' }));
    }
  }, [files]);

  const bitrateSteps = ['64k', '128k', '192k', '320k'];
  
  const handleOpenGithub = () => {
    const url = 'https://github.com/rollins1338/audio-merger';
    if (window.electron && window.electron.openExternal) {
      window.electron.openExternal(url);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleThemeClick = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="min-h-screen font-sans selection:bg-cyan-500/30 flex flex-col bg-slate-950 text-slate-200"
         onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
      
      {/* Hidden Global Inputs for Drop Zone */}
      <input 
        type="file" 
        id="file-upload" 
        ref={fileInputRef}
        multiple 
        accept=".mp3,.m4b" 
        className="hidden" 
        onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
                 handleFiles(Array.from(e.target.files));
            }
            e.target.value = '';
        }} 
      />
      <input 
        type="file" 
        id="folder-upload"
        ref={folderInputRef}
        {...{ webkitdirectory: "", directory: "" }}
        className="hidden" 
        onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
                 handleFiles(Array.from(e.target.files));
            }
            e.target.value = ''; 
        }} 
      />
      
      <AboutPanel 
         isOpen={showInfoPanel} 
         onClose={() => setShowInfoPanel(false)}
         ffmpegVersion={ffmpegVersion}
         systemSpecs={systemSpecs}
         onSetupFfmpeg={() => setShowFfmpegModal(true)}
      />

      {/* Sticky Header Wrapper */}
      <div className="sticky top-0 z-30 flex flex-col backdrop-blur-md bg-slate-950/80 border-b border-white/5 transition-all app-drag-region">
          {/* Custom Drag Style Block */}
          <style>{`.app-drag-region { -webkit-app-region: drag; } .no-drag { -webkit-app-region: no-drag; }`}</style>
          
          <header className="max-w-6xl mx-auto w-full px-6 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3 no-drag">
              <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-white/10 group cursor-default">
                <AudioWaveform className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <h1 className="font-bold text-lg tracking-tight text-white">{APP_NAME}</h1>
                <p className="text-[10px] text-cyan-500 font-mono leading-none tracking-widest uppercase opacity-80">
                  Pro v{APP_VERSION}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 no-drag">
               <button
                  onClick={handleThemeClick}
                  className="p-2 rounded-lg transition-all cursor-pointer text-slate-400 hover:text-white hover:bg-white/5 relative group"
                >
                  <Moon className="w-5 h-5" />
                  {showToast && (
                     <div className="absolute top-full right-0 mt-2 w-max px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl text-xs font-bold text-white animate-in fade-in slide-in-from-top-1 z-50 pointer-events-none">
                        Light mode sucks
                        <div className="absolute -top-1 right-2.5 w-2 h-2 bg-slate-800 border-t border-l border-slate-700 transform rotate-45"></div>
                     </div>
                  )}
               </button>
               <button 
                  onClick={() => setShowHelpModal(true)} 
                  className={`p-2 rounded-lg transition-colors ${showHelpModal ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                  title="Quick Guide"
               >
                 <HelpCircle className="w-5 h-5" />
               </button>
               <button 
                  onClick={() => setShowInfoPanel(!showInfoPanel)} 
                  className={`p-2 rounded-lg transition-all ${showInfoPanel ? 'bg-cyan-500/10 text-cyan-500 ring-1 ring-cyan-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
               >
                 <Info className="w-5 h-5" />
               </button>
               <button onClick={handleOpenGithub} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5">
                <Github className="w-5 h-5" />
              </button>

              <div className="w-px h-5 bg-white/10 mx-2"></div>
              
              <WindowControls />
            </div>
          </header>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-8 flex-1 w-full">
        {(status === AppStatus.PROCESSING || status === AppStatus.COMPLETED || status === AppStatus.ERROR) && (
          <ProcessingOverlay 
            state={processingState} 
            isComplete={status === AppStatus.COMPLETED}
            isError={status === AppStatus.ERROR}
            errorMessage={errorMessage}
            skippedFiles={skippedFiles}
            onReset={resetApp}
            onCancel={handleCancel}
            onRetry={() => startMerge(false)}
            fileName={finalFilename || `${getEffectiveFilename()}.${options.outputFormat.toLowerCase()}`}
            files={files.filter(f => f.status !== 'error')}
            onLocate={handleLocateFile}
          />
        )}
        
        <FFmpegModal isOpen={showFfmpegModal} onClose={() => setShowFfmpegModal(false)} onLocate={handleLocateFfmpeg} configError={configError} />
        <ConflictModal data={conflictData} onCancel={handleCancel} onAutoFix={handleAutoFixAction} />
        <HelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {uploadError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start justify-between animate-in fade-in">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <div><h4 className="text-sm font-semibold text-red-400">Error</h4><p className="text-xs text-red-200/60 mt-1">{uploadError}</p></div>
                </div>
                <button onClick={() => setUploadError(null)} className="text-red-400 hover:text-white"><XCircle className="w-5 h-5" /></button>
              </div>
            )}

            {files.length === 0 ? (
                <div 
                  className={`
                    flex-1 min-h-[500px] border-2 border-dashed rounded-xl transition-all duration-300 ease-in-out
                    flex flex-col items-center justify-center text-center p-12 group cursor-pointer
                    ${dragActive 
                      ? 'border-cyan-500 bg-cyan-500/10 shadow-[0_0_30px_rgba(6,182,212,0.15)]' 
                      : 'border-white/10 bg-white/5 hover:border-cyan-500/50 hover:bg-white/[0.07]'}
                  `}
                  onClick={() => fileInputRef.current?.click()}
                  onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                >
                  <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 transition-transform duration-300 shadow-2xl border bg-slate-900 border-white/5 ${dragActive ? 'scale-110 rotate-3' : 'group-hover:scale-110 group-hover:-rotate-3'}`}>
                    {dragActive ? <FolderOpen className="w-10 h-10 text-cyan-500" /> : <Upload className="w-10 h-10 text-slate-400" />}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-3">
                    {dragActive ? "Drop files now" : "Drop audio files here"}
                  </h3>
                  <p className="text-base text-slate-500 mb-8 max-w-sm">
                    Drag and drop your <span className="text-slate-300">MP3</span> or <span className="text-slate-300">M4B</span> files directly into this area to start queuing.
                  </p>
                  
                  <div className="flex items-center gap-4 relative z-10">
                     <button 
                       onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                       className="flex items-center px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/20 transition-all transform hover:scale-105"
                     >
                        <FileAudio className="w-5 h-5 mr-2" />
                        Select Files
                     </button>
                     <button 
                       onClick={(e) => { e.stopPropagation(); folderInputRef.current?.click(); }}
                       className="flex items-center px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold border border-slate-700 transition-all transform hover:scale-105"
                     >
                        <Folder className="w-5 h-5 mr-2" />
                        Select Folder
                     </button>
                  </div>
                </div>
            ) : (
                <div className="flex-1 min-h-[600px] flex flex-col relative rounded-xl overflow-hidden border border-white/10 bg-slate-900/50">
                    <div className="p-4 border-b border-white/5 bg-slate-950/50 backdrop-blur-md flex justify-between items-center z-10">
                         <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 text-cyan-500">
                                 <Scissors className="w-4 h-4" />
                             </div>
                             <h3 className="font-bold text-white text-sm">Merge Queue</h3>
                         </div>
                         <div className="flex gap-2">
                             <button 
                               onClick={() => fileInputRef.current?.click()}
                               disabled={status !== AppStatus.IDLE}
                               className="flex items-center px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 transition-colors"
                             >
                                <Plus className="w-3.5 h-3.5 mr-1.5" />
                                Add Files
                             </button>
                             <button 
                               onClick={() => folderInputRef.current?.click()}
                               disabled={status !== AppStatus.IDLE}
                               className="flex items-center px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 transition-colors"
                             >
                                <FolderOpen className="w-3.5 h-3.5 mr-1.5" />
                                Add Folder
                             </button>
                         </div>
                    </div>

                    <div className="flex-1 overflow-hidden relative">
                        {dragActive && (
                            <div className="absolute inset-0 z-50 bg-cyan-500/20 backdrop-blur-sm border-2 border-dashed border-cyan-500 m-2 rounded-xl flex items-center justify-center animate-in fade-in duration-200 pointer-events-none">
                                <h3 className="text-xl font-bold text-cyan-400 drop-shadow-md">Drop to Add More Files</h3>
                            </div>
                        )}
                        <FileList 
                            files={files} 
                            onRemove={handleRemoveFile} 
                            onReorder={(s, d) => {
                                const newFiles = [...files];
                                const [moved] = newFiles.splice(s, 1);
                                newFiles.splice(d, 0, moved);
                                setFiles(newFiles);
                            }} 
                            readOnly={status !== AppStatus.IDLE}
                            onClear={clearQueue}
                            onKeep={handleKeepFile}
                        />
                    </div>
                </div>
            )}
          </div>

          {/* RIGHT COLUMN - SETTINGS */}
          <div className="lg:col-span-4 space-y-6">
            <div className="backdrop-blur-sm rounded-xl border p-6 shadow-xl sticky top-24 bg-slate-900/80 border-white/10">
              <div className="flex items-center space-x-2 mb-6 pb-4 border-b border-white/5">
                <Settings className="w-5 h-5 text-cyan-500" />
                <h2 className="font-semibold text-white">Configuration</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2"><Type className="w-3 h-3" /> Output Filename</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={options.filename}
                      onChange={(e) => setOptions({ ...options, filename: e.target.value })}
                      disabled={status !== AppStatus.IDLE}
                      onDragStart={(e) => { e.stopPropagation(); e.preventDefault(); }} 
                      className="block w-full pl-4 pr-16 py-3 rounded-lg text-sm transition-all disabled:opacity-50 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 bg-slate-950 border-white/10 text-white placeholder-slate-600 select-text cursor-text"
                      placeholder={getEffectiveFilename()}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                      <span className="text-slate-500 text-xs font-mono">.{options.outputFormat.toLowerCase()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Format</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['MP3', 'M4B'].map(fmt => {
                      const isBlocked = fmt === 'MP3' && files.some(f => f.type === FileType.M4B && f.status !== 'error');
                      return (
                        <button
                          key={fmt}
                          onClick={() => setOptions({ ...options, outputFormat: fmt as any })}
                          disabled={status !== AppStatus.IDLE || isBlocked}
                          className={`
                            px-4 py-3 rounded-lg text-xs font-bold transition-all border
                            disabled:opacity-50 disabled:cursor-not-allowed
                            ${options.outputFormat === fmt 
                              ? 'bg-cyan-600 border-cyan-500 text-white shadow-lg shadow-cyan-500/20' 
                              : 'bg-slate-950 border-white/10 text-slate-400 hover:bg-slate-900'
                            }
                            ${isBlocked ? 'hover:bg-slate-950 cursor-not-allowed opacity-50' : ''}
                          `}
                        >
                          <div className="flex items-center justify-center gap-2">
                             {isBlocked && <XCircle className="w-3 h-3 text-red-500" />}
                             {fmt}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Scissors className="w-3 h-3" /> Merge Mode
                  </label>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                      onClick={() => setUseCustomBitrate(false)}
                      disabled={status !== AppStatus.IDLE}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 ${!useCustomBitrate ? 'bg-cyan-500/10 border-cyan-500 text-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'bg-slate-950 border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-400'}`}
                    >
                      <Zap className="w-5 h-5" />
                      <div className="text-center">
                        <div className="text-xs font-bold">Stream Copy</div>
                        <div className="text-[10px] opacity-70">Fastest • No Quality Loss</div>
                      </div>
                    </button>
                    <button
                      onClick={() => setUseCustomBitrate(true)}
                      disabled={status !== AppStatus.IDLE}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 ${useCustomBitrate ? 'bg-cyan-500/10 border-cyan-500 text-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'bg-slate-950 border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-400'}`}
                    >
                      <Gauge className="w-5 h-5" />
                      <div className="text-center">
                        <div className="text-xs font-bold">Re-Encode</div>
                        <div className="text-[10px] opacity-70">Custom Bitrate</div>
                      </div>
                    </button>
                  </div>

                  {!useCustomBitrate && isForcedTranscode && (
                     <div className="mb-4 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <div className="text-xs text-amber-200/80 leading-snug">
                            <strong>Note:</strong> MP3 files cannot be stream-copied to M4B (AAC). Re-encoding will be applied automatically.
                        </div>
                     </div>
                  )}

                  <div className="flex justify-between items-center text-xs px-1 mb-2">
                      <span className="text-slate-500 font-medium">Est. Output Size</span>
                      <div className="text-right">
                          <span className="font-mono text-cyan-500 font-bold block">{estimatedOutputSize}</span>
                          <div className="mt-1 px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 inline-block">
                             <span className="text-[10px] text-slate-400 font-mono">
                                Quality: <span className="text-slate-200">{displayedBitrate}</span>
                             </span>
                          </div>
                      </div>
                  </div>

                  {useCustomBitrate && (
                    <div className="animate-in slide-in-from-top-2 pt-2 border-t mt-3 border-white/5">
                      <div className="flex items-center justify-between mb-4">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"><Activity className="w-3 h-3" /> Bitrate</label>
                        <span className="text-xs font-mono text-cyan-500">{options.bitrate}</span>
                      </div>
                      <input
                        type="range"
                        min="0" max="3" step="1"
                        value={bitrateSteps.indexOf(options.bitrate)}
                        onChange={(e) => setOptions({ ...options, bitrate: bitrateSteps[parseInt(e.target.value)] })}
                        disabled={status !== AppStatus.IDLE}
                        className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-cyan-500"
                      />
                      <div className="flex justify-between mt-2">
                          {bitrateSteps.map(r => <span key={r} className="text-[10px] font-mono text-slate-600">{r}</span>)}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-6">
                  {!ffmpegVersion ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-stretch gap-3 h-12">
                        <button 
                          onClick={() => setShowFfmpegModal(true)}
                          className="w-12 shrink-0 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 hover:bg-amber-500/20 transition-all hover:scale-105 active:scale-95"
                          title="Setup Required"
                        >
                          <AlertTriangle className="w-6 h-6" />
                        </button>
                        <div className="flex-1 rounded-lg border flex items-center justify-center opacity-50 cursor-not-allowed bg-slate-800 border-slate-700/50">
                           <span className="flex items-center gap-2 text-slate-400 font-bold">
                              <Zap className="w-5 h-5 fill-current" />
                              <span>Merge Audio Files</span>
                           </span>
                        </div>
                      </div>
                      <div 
                        onClick={() => setShowFfmpegModal(true)}
                        className="flex items-center justify-center gap-2 cursor-pointer group mt-1"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse group-hover:scale-125 transition-transform" />
                        <span className="text-xs font-mono text-amber-500 group-hover:text-amber-400 group-hover:underline decoration-amber-500/30 underline-offset-4 transition-colors">
                          FFmpeg Setup Required
                        </span>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      variant="primary" 
                      className="w-full h-12 text-base shadow-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500" 
                      disabled={files.filter(f => f.status !== 'error').length === 0 || status !== AppStatus.IDLE}
                      onClick={() => startMerge(false)}
                      icon={<Zap className="w-5 h-5 fill-current" />}
                    >
                       {files.filter(f => f.status !== 'error').length > 0 ? `Merge ${files.filter(f => f.status !== 'error').length} Files` : 'Start Merge'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
