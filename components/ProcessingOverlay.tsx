import React from 'react';
import { ProcessingState, AudioFile } from '../types';
import { STAGE_MESSAGES } from '../constants';
import { Loader, CheckCircle, AlertTriangle, RotateCcw, FileAudio, Activity } from 'lucide-react';
import { formatTime } from '../utils/formatters';

interface ProcessingOverlayProps {
  state: ProcessingState;
  isComplete: boolean;
  isError?: boolean;
  errorMessage?: string | null;
  skippedFiles?: string[];
  onReset: () => void;
  onRetry?: () => void;
  onCancel?: () => void;
  fileName: string;
  files: AudioFile[];
}

export const ProcessingOverlay: React.FC<ProcessingOverlayProps> = ({ state, isComplete, isError, errorMessage, skippedFiles = [], onReset, onRetry, onCancel, fileName, files }) => {
  
  // Calculate specific file progress
  const totalFiles = files.length;
  const currentFile = files[state.currentFileIndex];
  
  // Logic from App.tsx assumes roughly equal time per file for the simulation
  const progressPerFile = 100 / totalFiles;
  const rangeStart = state.currentFileIndex * progressPerFile;
  
  let fileProgress = 0;
  if (totalFiles > 0) {
    // Normalizing the total progress to 0-100 for the current file
    const rawFileProgress = (state.totalProgress - rangeStart) / progressPerFile;
    fileProgress = Math.max(0, Math.min(100, rawFileProgress * 100));
  }
  
  // Hard override for completion
  if (state.stage === 'finalizing' || state.totalProgress >= 100) {
    fileProgress = 100;
  }

  // Format ETA (seconds -> "2m 30s")
  const formatETA = (seconds: number) => {
    if (seconds <= 0) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-8 text-center relative overflow-hidden">
        
        {/* Background Decorative Gradient */}
        <div className={`absolute top-0 left-0 w-full h-1 ${isError ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500'}`} />
        
        {isError ? (
          <div className="space-y-6">
            <div className="mx-auto w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-4 animate-in zoom-in duration-300">
              <AlertTriangle className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-white">Merge Failed</h3>
            <div className="bg-red-500/5 rounded-lg p-4 border border-red-500/20">
                <p className="text-sm text-red-400 font-mono">
                  {errorMessage || "An unexpected error occurred during processing."}
                </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-8">
                <button
                  onClick={onCancel || onReset}
                  className="py-3 px-4 bg-slate-800 text-slate-300 rounded-lg font-medium hover:bg-slate-700 hover:text-white transition-colors border border-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={onRetry}
                  className="flex items-center justify-center py-3 px-4 bg-white text-slate-900 rounded-lg font-bold hover:bg-slate-200 transition-colors"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retry
                </button>
            </div>
          </div>
        ) : isComplete ? (
          <div className="space-y-6">
            <div className="mx-auto w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 mb-4 animate-in zoom-in duration-300">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-white">Merge Complete!</h3>
            <p className="text-slate-400">Your audio files have been successfully processed.</p>
            
            {/* Warning Section for Skipped Files */}
            {skippedFiles.length > 0 && (
               <div className="bg-amber-500/10 rounded-lg p-4 border border-amber-500/20 text-left">
                  <div className="flex items-center gap-2 mb-2 text-amber-500">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm font-bold">Files Skipped due to Errors</span>
                  </div>
                  <ul className="text-xs text-amber-200/80 list-disc list-inside space-y-1 max-h-24 overflow-y-auto">
                      {skippedFiles.map((f, i) => (
                          <li key={i} className="truncate">{f}</li>
                      ))}
                  </ul>
               </div>
            )}

            <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 text-sm text-slate-300 font-mono break-all">
              {fileName}
            </div>
            <button
              onClick={onReset}
              className="mt-6 w-full py-3 bg-white text-slate-900 rounded-lg font-bold hover:bg-slate-200 transition-colors"
            >
              Start New Merge
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-3 text-primary-400">
                <Loader className="w-6 h-6 animate-spin" />
                <span className="font-semibold tracking-wider uppercase text-sm">Processing</span>
              </div>
              <h3 className="text-xl font-medium text-white">
                {STAGE_MESSAGES[state.stage]}
              </h3>
            </div>

            {/* Progress Bar Container */}
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary-600 bg-primary-200/10">
                    Total Progress
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-primary-400 font-mono">
                    {Math.round(state.totalProgress)}%
                  </span>
                </div>
              </div>
              
              {/* Main Progress Bar */}
              <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-slate-800 border border-slate-700">
                <div 
                  style={{ width: `${state.totalProgress}%` }} 
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-primary-600 to-purple-600 transition-all duration-300 ease-out relative"
                >
                  <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite] w-full h-full" style={{ backgroundImage: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)', backgroundSize: '200% 100%' }}></div>
                </div>
              </div>

               {/* Rich Data Info */}
               <div className="flex justify-between mt-2 text-xs font-mono text-slate-500 border-t border-slate-800 pt-3">
                <span className="flex items-center gap-1.5">
                    <Activity className="w-3 h-3 text-primary-500" />
                    {state.speed && state.speed !== '0.0x' ? `Processing at ${state.speed}` : 'Calculating speed...'}
                </span>
                <span className="text-slate-400">
                    {state.estimatedTimeRemaining > 0 
                    ? `~${formatETA(state.estimatedTimeRemaining)} remaining` 
                    : 'Calculating ETA...'}
                </span>
               </div>

              {/* Current File Info */}
              <div className="mt-4 bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                 <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2 truncate max-w-[70%]">
                      <FileAudio className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="text-xs text-slate-300 font-medium truncate">
                        {currentFile ? currentFile.name : 'Initializing...'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono uppercase">
                      File {state.currentFileIndex + 1} of {totalFiles}
                    </span>
                 </div>
                 
                 {/* Secondary Micro Progress Bar for File */}
                 <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-slate-400 transition-all duration-300"
                      style={{ width: `${fileProgress}%` }}
                    />
                 </div>
              </div>
            </div>

            <div className="p-4 bg-slate-950/50 rounded-lg border border-slate-800/50 text-left">
              <p className="text-xs text-slate-500 font-mono mb-2">LOG OUTPUT:</p>
              <div className="text-xs text-slate-300 font-mono space-y-1">
                <p>&gt; Initializing virtual output stream...</p>
                {state.totalProgress > 10 && <p>&gt; Analyzing input bitrates...</p>}
                {state.totalProgress > 30 && <p>&gt; Concatenating audio packets...</p>}
                {state.totalProgress > 60 && <p className="text-yellow-500/80">&gt; Re-encoding to AAC (M4B container)...</p>}
                {state.totalProgress > 90 && <p className="text-green-500/80">&gt; Writing atomic metadata...</p>}
                <span className="inline-block w-2 h-4 bg-primary-500 animate-pulse align-middle ml-1"></span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};