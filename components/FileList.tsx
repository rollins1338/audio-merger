import React, { useState, useMemo } from 'react';
import { AudioFile, FileType } from '../types';
import { formatFileSize, formatTime } from '../utils/formatters';
import { 
  Music, 
  X, 
  GripVertical, 
  CheckCircle2, 
  BookOpen, 
  Disc, 
  Activity, 
  Zap, 
  Volume2, 
  AlertTriangle, 
  Clock,
  Trash2
} from 'lucide-react';

interface FileListProps {
  files: AudioFile[];
  onRemove: (id: string) => void;
  onReorder: (sourceIndex: number, destinationIndex: number) => void;
  readOnly: boolean;
  onClear: () => void;
}

export const FileList: React.FC<FileListProps> = ({ files, onRemove, onReorder, readOnly, onClear }) => {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Calculate Majority Sample Rate to highlight outliers, defaulting to standard 44.1kHz if empty
  const majoritySampleRate = useMemo(() => {
    if (files.length === 0) return 44100;
    const counts: Record<number, number> = {};
    let maxCount = 0;
    let majority = 44100;
    
    files.forEach(f => {
      if (f.metadata?.sampleRate) {
        const rate = f.metadata.sampleRate;
        counts[rate] = (counts[rate] || 0) + 1;
        if (counts[rate] > maxCount) {
          maxCount = counts[rate];
          majority = rate;
        }
      }
    });
    return majority;
  }, [files]);

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full border-2 border-dashed rounded-xl min-h-[250px] border-slate-800 bg-slate-900/50 text-slate-500">
        <Music className="w-12 h-12 mb-4 opacity-20" />
        <p className="text-sm">No audio files added yet.</p>
      </div>
    );
  }

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (readOnly) return;
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    if (readOnly) return;

    const sourceIndexStr = e.dataTransfer.getData('text/plain');
    if (sourceIndexStr) {
      const sourceIndex = parseInt(sourceIndexStr, 10);
      onReorder(sourceIndex, index);
    }
  };

  const handleDragEnd = () => {
    setDragOverIndex(null);
  }

  return (
    <div className="flex flex-col h-full rounded-xl border overflow-hidden shadow-inner bg-slate-900 border-slate-800">
      <div className="px-4 py-3 border-b flex justify-between items-center backdrop-blur-sm bg-slate-950/50 border-slate-800">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            Queue <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">{files.length}</span>
          </span>
          {files.length > 0 && !readOnly && (
            <button 
              onClick={onClear}
              className="p-1.5 rounded-md text-red-500 hover:bg-red-500/10 hover:scale-105 transition-all focus:outline-none focus:ring-1 focus:ring-red-500/50"
              title="Clear Queue"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex gap-4 text-[10px] text-slate-500 font-mono">
           <span className="flex items-center gap-1.5">
             <Activity className="w-3 h-3" />
             TARGET: <span className="text-slate-300">{majoritySampleRate}Hz</span>
           </span>
           <span className="flex items-center gap-1.5">
             <Disc className="w-3 h-3" />
             SIZE: <span className="text-slate-300">{formatFileSize(files.reduce((acc, f) => acc + f.size, 0))}</span>
           </span>
        </div>
      </div>
      
      <div className="overflow-y-auto flex-1 p-2 space-y-2 custom-scrollbar">
        {files.map((file, index) => {
          const isMp3 = file.type === FileType.MP3;
          const isDraggingOver = dragOverIndex === index;
          const meta = file.metadata;
          
          // Conflict Detection for UI - Highlight if it deviates from majority
          const isRateMismatch = meta && meta.sampleRate !== majoritySampleRate;
          
          return (
            <div 
              key={file.id}
              draggable={!readOnly}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`
                group relative flex flex-col p-3 rounded-xl border transition-all duration-200
                ${isDraggingOver 
                    ? 'border-primary-500 bg-primary-500/10 scale-[1.01] z-10 shadow-xl' 
                    : ''}
                ${file.status === 'processing' 
                  ? 'bg-primary-500/5 border-primary-500/30' 
                  : file.status === 'done'
                    ? 'bg-green-500/5 border-green-500/20'
                    : isDraggingOver
                      ? '' 
                      : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600'
                }
                ${readOnly ? 'cursor-default' : 'cursor-move'}
              `}
            >
              {/* Main Row */}
              <div className="flex items-center w-full">
                <div className={`mr-3 ${readOnly ? 'opacity-30' : 'text-slate-600 group-hover:text-slate-400'}`}>
                  <GripVertical className="w-4 h-4" />
                </div>
                
                {/* Distinct Icon Container */}
                <div className={`p-2.5 rounded-lg mr-3 shadow-inner ${
                  isMp3 
                    ? 'bg-blue-500/10 text-blue-400' 
                    : 'bg-purple-500/10 text-purple-400'
                }`}>
                  {isMp3 ? <Music className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                </div>

                <div className="flex-1 min-w-0 pointer-events-none">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-medium truncate pr-2 text-slate-200">{file.name}</p>
                    {file.status === 'done' && <CheckCircle2 className="w-4 h-4 text-green-500 ml-2 shrink-0" />}
                  </div>
                  
                  {/* TECH BADGES ROW */}
                  <div className="flex flex-wrap items-center gap-2">
                    {meta ? (
                      <>
                        {/* Codec */}
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-mono bg-white/5 border-white/10 text-slate-300">
                          <Disc className="w-3 h-3 text-blue-400" />
                          <span>{meta.codec}</span>
                        </div>

                        {/* Sample Rate (with Mismatch Alert) */}
                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-mono border transition-all ${
                          isRateMismatch 
                            ? 'bg-red-500/20 border-red-500/50 text-red-400 animate-pulse' 
                            : 'bg-white/5 border-white/10 text-slate-300'
                        }`}>
                          {isRateMismatch ? <AlertTriangle className="w-3 h-3 text-red-400" /> : <Activity className="w-3 h-3 text-purple-400" />}
                          <span className={isRateMismatch ? 'font-bold' : ''}>{meta.sampleRate}Hz</span>
                        </div>

                        {/* Bitrate */}
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-mono bg-white/5 border-white/10 text-slate-300">
                          <Zap className="w-3 h-3 text-yellow-400" />
                          <span>{meta.bitrate}</span>
                        </div>
                        
                        {/* Channels */}
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-mono bg-white/5 border-white/10 text-slate-300">
                          <Volume2 className="w-3 h-3 text-green-400" />
                          <span>{meta.channels}</span>
                        </div>

                        {/* Duration (Right Aligned in flex flow or just next) */}
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-mono ml-auto bg-white/5 border-white/10 text-slate-400">
                          <Clock className="w-3 h-3" />
                          <span>{formatTime(meta.duration)}</span>
                        </div>
                      </>
                    ) : (
                      <span className="flex items-center gap-2 text-[10px] text-slate-500 font-mono py-1">
                        <span className="w-2 h-2 rounded-full bg-slate-600 animate-pulse"></span>
                        Scanning metadata...
                      </span>
                    )}
                  </div>
                </div>

                {!readOnly && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemove(file.id); }}
                    className="ml-3 p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    aria-label="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};