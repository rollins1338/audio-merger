
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
  Trash2,
  FileWarning,
  Check
} from 'lucide-react';

interface FileListProps {
  files: AudioFile[];
  onRemove: (id: string) => void;
  onReorder: (sourceIndex: number, destinationIndex: number) => void;
  readOnly: boolean;
  onClear: () => void;
  onKeep?: (id: string) => void;
}

export const FileList: React.FC<FileListProps> = ({ files, onRemove, onReorder, readOnly, onClear, onKeep }) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // Calculate stats
  const stats = useMemo(() => {
    if (files.length === 0) return { majorityRate: 44100, maxDuration: 0, totalSize: 0 };
    
    const counts: Record<number, number> = {};
    let maxCount = 0;
    let majority = 44100;
    let maxDur = 0;
    let size = 0;
    
    files.forEach(f => {
      // Only aggregate stats for valid files
      if (f.status === 'error') return;

      size += f.size;
      const dur = f.metadata?.duration || 0;
      if (dur > maxDur) maxDur = dur;

      if (f.metadata?.sampleRate) {
        const rate = f.metadata.sampleRate;
        counts[rate] = (counts[rate] || 0) + 1;
        if (counts[rate] > maxCount) {
          maxCount = counts[rate];
          majority = rate;
        }
      }
    });
    return { majorityRate: majority, maxDuration: maxDur, totalSize: size };
  }, [files]);

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500">
        <Music className="w-12 h-12 mb-4 opacity-20" />
        <p className="text-sm">Queue is empty</p>
      </div>
    );
  }

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    e.stopPropagation();
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (readOnly || !draggedId) return;
    
    const sourceIndex = files.findIndex(f => f.id === draggedId);
    if (sourceIndex === -1 || sourceIndex === targetIndex) return;

    // "Physical Push" - Swap instantly
    onReorder(sourceIndex, targetIndex);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  }

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Header Section */}
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-slate-950/30 backdrop-blur-sm">
        <div className="flex items-center gap-4">
           <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
             Queue <span className="ml-1 text-slate-300">{files.length}</span>
           </span>
           
           <div className="h-4 w-px bg-white/10 mx-1"></div>

           <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500">
               <span className="flex items-center gap-1.5" title="Majority Sample Rate">
                 <Activity className="w-3 h-3 text-slate-600" />
                 {stats.majorityRate}Hz
               </span>
               <span className="flex items-center gap-1.5" title="Total Size">
                 <Disc className="w-3 h-3 text-slate-600" />
                 {formatFileSize(stats.totalSize)}
               </span>
           </div>
        </div>

        {!readOnly && (
          <button 
            onClick={onClear}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:text-white hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all group"
          >
            <Trash2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            <span>Clear Queue</span>
          </button>
        )}
      </div>

      <div className="overflow-y-auto flex-1 p-3 space-y-2 custom-scrollbar">
        {files.map((file, index) => {
          const isMp3 = file.type === FileType.MP3;
          const meta = file.metadata;
          const isError = file.status === 'error';
          const isWarning = isError && file.errorDetails === 'Large File Warning';
          
          // Determine if draggable: Red (Corrupt/Mismatch) cannot move. Orange (Warning) can move.
          const isRed = isError && !isWarning;
          const isDraggable = !readOnly && !isRed;
          const isDragged = draggedId === file.id;

          // Conflict Detection for UI
          const isRateMismatch = meta && meta.sampleRate !== stats.majorityRate;

          // Calculate visual width for duration bar
          const durationPercent = stats.maxDuration > 0 ? ((meta?.duration || 0) / stats.maxDuration) * 100 : 0;
          
          return (
            <div 
              key={file.id}
              draggable={isDraggable}
              onDragStart={(e) => handleDragStart(e, file.id)}
              onDragEnter={(e) => handleDragEnter(e, index)}
              onDragOver={(e) => e.preventDefault()} // Essential for drop targets
              onDragEnd={handleDragEnd}
              className={`
                group relative flex flex-col p-3 rounded-xl border transition-colors duration-200 overflow-hidden
                ${isDragged 
                    ? 'opacity-40 bg-slate-800 border-dashed border-cyan-500/50 scale-95' 
                    : ''}
                ${file.status === 'processing' 
                  ? 'bg-primary-500/5 border-primary-500/30' 
                  : file.status === 'done'
                    ? 'bg-green-500/5 border-green-500/20'
                    : isWarning
                        ? 'bg-amber-500/10 border-amber-500/40 hover:bg-amber-500/15'
                        : isError 
                           ? 'bg-red-500/10 border-red-500/50 hover:bg-red-500/15'
                           : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600'
                }
                ${isDraggable ? 'cursor-move' : 'cursor-default'}
              `}
            >
              {/* Visual Duration Bar Background */}
              {meta && !isError && (
                 <div 
                    className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-cyan-500/20 to-transparent transition-all duration-500" 
                    style={{ width: `${durationPercent}%` }}
                 />
              )}

              {/* Main Row */}
              <div className={`flex items-center w-full relative z-10 ${isDragged ? 'pointer-events-none' : ''}`}>
                <div className={`mr-3 ${!isDraggable ? 'opacity-30' : 'text-slate-600 group-hover:text-slate-400'}`}>
                  <GripVertical className="w-4 h-4" />
                </div>
                
                {/* Distinct Icon Container */}
                <div className={`p-2.5 rounded-lg mr-3 shadow-inner ${
                  isWarning
                    ? 'bg-amber-500/20 text-amber-500'
                    : isError
                        ? 'bg-red-500/20 text-red-500'
                        : isMp3 
                            ? 'bg-blue-500/10 text-blue-400' 
                            : 'bg-purple-500/10 text-purple-400'
                }`}>
                  {isWarning 
                    ? <AlertTriangle className="w-5 h-5" /> 
                    : isError 
                        ? <FileWarning className="w-5 h-5" /> 
                        : (isMp3 ? <Music className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />)
                  }
                </div>

                <div className="flex-1 min-w-0 pointer-events-none">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className={`text-sm font-medium truncate pr-2 ${
                        isWarning ? 'text-amber-200' : isError ? 'text-red-300' : 'text-slate-200'
                    }`}>
                        {file.name}
                        {isError && (
                          <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold ${
                              isWarning ? 'bg-amber-500 text-slate-900' : 'bg-red-500 text-white'
                          }`}>
                             {file.errorDetails || "Corrupt"}
                          </span>
                        )}
                    </p>
                    {file.status === 'done' && <CheckCircle2 className="w-4 h-4 text-green-500 ml-2 shrink-0" />}
                  </div>
                  
                  {/* TECH BADGES ROW */}
                  <div className="flex flex-wrap items-center gap-2">
                    {meta && (!isError || isWarning) ? (
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

                        {/* Duration */}
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-mono ml-auto bg-white/5 border-white/10 text-slate-400">
                          <Clock className="w-3 h-3" />
                          <span>{formatTime(meta.duration)}</span>
                        </div>
                      </>
                    ) : (
                      <span className={`flex items-center gap-2 text-[10px] font-mono py-1 ${isError ? 'text-red-400' : 'text-slate-500'}`}>
                        {isError ? (
                            <>
                                <X className="w-3 h-3" />
                                {file.errorDetails === 'Corrupt' 
                                  ? "Metadata unreadable - Remove file" 
                                  : "Incompatible format - Remove or Fix"}
                            </>
                        ) : (
                            <>
                                <span className="w-2 h-2 rounded-full bg-slate-600 animate-pulse"></span>
                                Scanning metadata...
                            </>
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {!readOnly && (
                   <div className="flex items-center gap-2 ml-3">
                       {isWarning && onKeep && (
                           <button
                             onClick={(e) => { e.stopPropagation(); onKeep(file.id); }}
                             className="p-2 rounded-lg text-amber-500 bg-amber-500/10 hover:bg-amber-500/30 hover:text-white transition-all ring-1 ring-amber-500/20"
                             title="Keep File (Ignore Warning)"
                           >
                              <Check className="w-4 h-4" />
                           </button>
                       )}
                      <button
                        onClick={(e) => { e.stopPropagation(); onRemove(file.id); }}
                        className={`p-2 rounded-lg transition-colors focus:opacity-100 ${
                            isWarning 
                             ? 'text-amber-500/70 hover:text-red-400 hover:bg-red-500/20' 
                             : isError 
                                ? 'text-red-400 bg-red-500/20 hover:bg-red-500/40 opacity-100' 
                                : 'text-slate-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100'
                        }`}
                        aria-label="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                   </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
