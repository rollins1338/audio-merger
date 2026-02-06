
import React from 'react';
import { ProcessingState, AudioFile } from '../types';
import { STAGE_MESSAGES } from '../constants';
import { Loader, CheckCircle, AlertTriangle, RotateCcw, FileAudio, Activity, Timer, XCircle, FolderOpen, Zap } from 'lucide-react';

interface ProcessingOverlayProps {
  state: ProcessingState;
  isComplete: boolean;
  isError?: boolean;
  errorMessage?: string | null;
  skippedFiles?: string[];
  onReset: () => void;
  onRetry?: () => void;
  onCancel?: () => void;
  onLocate?: () => void;
  fileName: string;
  files: AudioFile[];
}

export const ProcessingOverlay: React.FC<ProcessingOverlayProps> = ({ state, isComplete, isError, errorMessage, skippedFiles = [], onReset, onRetry, onCancel, onLocate, fileName, files }) => {
  
  const currentFile = files[state.currentFileIndex];
  
  let fileProgress = 0;
  
  let currentFileDuration = currentFile?.metadata?.duration || 0;
  let accumulatedPrevDuration = 0;
  
  for(let i = 0; i < state.currentFileIndex; i++) {
     accumulatedPrevDuration += (files[i].metadata?.duration || 0);
  }

  const timeInCurrentFile = Math.max(0, state.currentSeconds - accumulatedPrevDuration);
  
  if (currentFileDuration > 0) {
      fileProgress = (timeInCurrentFile / currentFileDuration) * 100;
  }
  
  if (isNaN(fileProgress)) fileProgress = 0;
  fileProgress = Math.max(0, Math.min(100, fileProgress));

  if (state.stage === 'finalizing' || state.totalProgress >= 100 || isComplete) {
    fileProgress = 100;
  }

  const formatETA = (seconds: number) => {
    if (!seconds || isNaN(seconds) || seconds <= 0) return 'Calculating...';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const formatTimestamp = (seconds: number) => {
      if (!seconds || isNaN(seconds)) return '00:00:00';
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor(seconds % 60);
      
      const parts = [m, s];
      if (h > 0) parts.unshift(h);
      
      return parts.map(v => v.toString().padStart(2, '0')).join(':');
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-8 text-center relative overflow-hidden ring-1 ring-white/10">
        
        <div className={`absolute top-0 left-0 w-full h-1.5 ${isError ? 'bg-red-500' : 'bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500'}`} />
        
        {isError ? (
          <div className="space-y-6">
            <div className="mx-auto w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-4 animate-in zoom-in duration-300 ring-4 ring-red-500/5">
              <AlertTriangle className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">Merge Failed</h3>
            <div className="bg-red-500/5 rounded-xl p-5 border border-red-500/20">
                <p className="text-sm text-red-300 font-mono break-words leading-relaxed">
                  {errorMessage || "An unexpected error occurred during processing."}
                </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-8">
                <button
                  onClick={onCancel || onReset}
                  className="py-3 px-4 bg-slate-800 text-slate-300 rounded-xl font-medium hover:bg-slate-700 hover:text-white transition-colors border border-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={onRetry}
                  className="flex items-center justify-center py-3 px-4 bg-white text-slate-950 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retry
                </button>
            </div>
          </div>
        ) : isComplete ? (
          <div className="space-y-6">
            <div className="mx-auto w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mb-4 animate-in zoom-in duration-300 ring-4 ring-green-500/5">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">Merge Complete!</h3>
            <p className="text-slate-400">Your audio files have been successfully processed.</p>
            
            {skippedFiles.length > 0 && (
               <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/20 text-left">
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

            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 text-sm text-slate-300 font-mono break-all shadow-inner">
              {fileName}
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
                <button
                    onClick={onLocate}
                    className="flex items-center justify-center py-3.5 px-4 bg-slate-800 text-slate-300 hover:text-white rounded-xl font-bold border border-slate-700 hover:bg-slate-700 transition-colors"
                >
                    <FolderOpen className="w-4 h-4 mr-2" />
                    Locate File
                </button>
                <button
                    onClick={onReset}
                    className="flex items-center justify-center py-3.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold shadow-lg hover:shadow-cyan-500/20 transition-all"
                >
                    Start New Merge
                </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="space-y-3">
               <div className="flex flex-col items-center gap-2">
                 <div className="relative">
                    <div className="absolute inset-0 bg-cyan-500/50 blur-xl rounded-full opacity-20 animate-pulse"></div>
                    <Loader className="w-8 h-8 text-cyan-400 animate-spin relative z-10" />
                 </div>
                 <h3 className="text-xl font-bold text-white tracking-tight mt-2">
                    {STAGE_MESSAGES[state.stage]}
                 </h3>
                 <div className="flex gap-2">
                    <div className="flex items-center gap-2 text-xs font-mono text-cyan-500/70 bg-cyan-950/30 px-3 py-1 rounded-full border border-cyan-500/10">
                        <Timer className="w-3 h-3" />
                        <span>{formatTimestamp(state.currentSeconds)} / {formatTimestamp(state.totalSeconds)}</span>
                    </div>
                    {state.mergeMode && (
                        <div className={`flex items-center gap-2 text-xs font-mono px-3 py-1 rounded-full border ${state.mergeMode === 'Stream Copy' ? 'text-green-400 bg-green-900/20 border-green-500/20' : 'text-purple-400 bg-purple-900/20 border-purple-500/20'}`}>
                            <Zap className="w-3 h-3 fill-current" />
                            <span className="font-bold">{state.mergeMode}</span>
                        </div>
                    )}
                 </div>
               </div>
            </div>

            <div className="relative">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-bold inline-block py-1 px-2 uppercase rounded-lg text-cyan-300 bg-cyan-900/20 border border-cyan-500/10 tracking-wider">
                    Total Progress
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold inline-block text-white font-mono tabular-nums">
                    {isNaN(state.totalProgress) ? 0 : Math.round(state.totalProgress)}%
                  </span>
                </div>
              </div>
              
              <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-slate-950 border border-white/5 shadow-inner">
                <div 
                  style={{ width: `${isNaN(state.totalProgress) ? 0 : state.totalProgress}%` }} 
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 transition-all duration-300 ease-out relative"
                >
                  <div className="absolute inset-0 bg-white/30 animate-[shimmer_1.5s_infinite]" style={{ backgroundImage: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)', backgroundSize: '200% 100%' }}></div>
                </div>
              </div>

               <div className="flex justify-between items-center mt-2 text-xs font-mono border-t border-slate-800 pt-3">
                <span className="flex items-center gap-2 bg-slate-800/50 px-2 py-1 rounded border border-slate-700/50 text-slate-400">
                    <Activity className="w-3 h-3 text-cyan-500" />
                    {state.speed && state.speed !== '0.0x' ? `${state.speed}` : '--x'}
                </span>
                <span className="text-slate-400">
                    {state.estimatedTimeRemaining > 0 
                    ? `~${formatETA(state.estimatedTimeRemaining)} remaining` 
                    : 'Calculating...'}
                </span>
               </div>

              <div className="mt-5 bg-slate-800/40 rounded-xl p-4 border border-white/5 backdrop-blur-sm relative overflow-hidden">
                 <div className="flex items-center justify-between mb-3 relative z-10">
                    <div className="flex items-center space-x-3 truncate max-w-[75%]">
                      <div className="p-1.5 bg-slate-900 rounded-md border border-slate-700 shadow-sm">
                        <FileAudio className="w-4 h-4 text-cyan-400 shrink-0" />
                      </div>
                      <span className="text-sm text-slate-200 font-medium truncate">
                        {currentFile ? currentFile.name : 'Initializing...'}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 font-mono uppercase bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
                      {state.currentFileIndex + 1} <span className="text-slate-600">/</span> {files.length}
                    </span>
                 </div>
                 
                 <div className="h-1.5 bg-slate-950/50 rounded-full overflow-hidden border border-white/5 relative z-10">
                    <div 
                      className="h-full bg-slate-500 transition-all duration-300"
                      style={{ width: `${fileProgress}%` }}
                    />
                 </div>

                 <div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500/5 to-transparent transition-all duration-300 pointer-events-none"
                    style={{ width: `${fileProgress}%` }}
                 />
              </div>
            </div>

            <div className="p-4 bg-slate-950/30 rounded-xl border border-white/5 text-left shadow-inner">
              <p className="text-[10px] font-bold text-slate-500 font-mono mb-2 uppercase tracking-wider">Console Output</p>
              <div className="text-xs text-slate-400 font-mono space-y-1.5 h-16 overflow-hidden relative">
                <p className="opacity-40">&gt; Initializing virtual output stream...</p>
                {state.totalProgress > 10 && <p className="opacity-60">&gt; Analyzing input bitrates...</p>}
                
                {(state.stage === 'transcoding' || state.stage === 'merging' || state.totalProgress > 20) && state.stage !== 'finalizing' && (
                   <p className="text-cyan-400 animate-pulse">
                     &gt; Merging...
                   </p>
                )}

                {state.stage === 'finalizing' && <p className="text-green-400">&gt; Writing atomic metadata...</p>}
              </div>
            </div>

            <div className="flex justify-center mt-4">
                <button
                    onClick={onCancel}
                    className="flex items-center px-5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 text-slate-400 border border-slate-700 transition-all text-sm font-bold group"
                >
                    <XCircle className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                    Cancel Operation
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
