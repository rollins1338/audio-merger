
import React from 'react';
import { 
  X, 
  HelpCircle, 
  FolderOpen, 
  Zap, 
  Gauge, 
  FileAudio, 
  Layers, 
  Cpu, 
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl flex flex-col animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50 rounded-t-2xl">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20 shadow-inner">
              <HelpCircle className="w-7 h-7 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight leading-none">Quick Start Guide</h2>
              <p className="text-sm text-slate-400 font-medium mt-1">Master AudioForge Pro in seconds</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors p-2.5 hover:bg-white/10 rounded-xl"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          <div>
             <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-3 after:content-[''] after:h-px after:flex-1 after:bg-slate-800">
                Workflow
             </h3>
             <div className="grid grid-cols-2 gap-5">
                <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50 flex flex-col gap-2.5">
                   <div className="flex items-center gap-2.5 text-white text-base font-bold">
                      <FolderOpen className="w-5 h-5 text-cyan-400" /> File Selection
                   </div>
                   <p className="text-sm text-slate-400 leading-relaxed">
                      Drag & drop files or folders. App auto-scans subfolders.
                   </p>
                </div>
                <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50 flex flex-col gap-2.5">
                   <div className="flex items-center gap-2.5 text-white text-base font-bold">
                      <Layers className="w-5 h-5 text-purple-400" /> Queue
                   </div>
                   <p className="text-sm text-slate-400 leading-relaxed">
                      Drag list items to reorder the final playback sequence.
                   </p>
                </div>
             </div>
          </div>

          <div>
             <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-3 after:content-[''] after:h-px after:flex-1 after:bg-slate-800">
                Merge Modes
             </h3>
             <div className="grid grid-cols-2 gap-5">
                <div className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 p-5 rounded-2xl border border-green-500/10">
                   <div className="flex items-center gap-2.5 mb-3 text-green-400 text-base font-bold">
                      <Zap className="w-5 h-5" /> Stream Copy
                   </div>
                   <ul className="text-sm text-slate-300 space-y-2 list-disc list-inside marker:text-green-500/50">
                      <li>Lossless & Instant speed</li>
                      <li>Requires identical inputs</li>
                   </ul>
                </div>

                <div className="bg-gradient-to-br from-blue-500/5 to-indigo-500/5 p-5 rounded-2xl border border-blue-500/10">
                   <div className="flex items-center gap-2.5 mb-3 text-blue-400 text-base font-bold">
                      <Gauge className="w-5 h-5" /> Re-Encode
                   </div>
                   <ul className="text-sm text-slate-300 space-y-2 list-disc list-inside marker:text-blue-500/50">
                      <li>Converts formats (MP3→M4B)</li>
                      <li>Customizable bitrate quality</li>
                   </ul>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
             <div className="flex gap-4 items-start p-3 rounded-xl hover:bg-white/5 transition-colors">
                <div className="p-2.5 bg-slate-800 rounded-xl shrink-0 text-slate-400 border border-slate-700">
                   <FileAudio className="w-6 h-6" />
                </div>
                <div>
                   <h4 className="text-base font-bold text-white">MP3 vs M4B</h4>
                   <p className="text-sm text-slate-400 leading-relaxed mt-1">
                      Use <strong>M4B</strong> for audiobooks (bookmarks/chapters). Use MP3 for music.
                   </p>
                </div>
             </div>

             <div className="flex gap-4 items-start p-3 rounded-xl hover:bg-white/5 transition-colors">
                <div className="p-2.5 bg-slate-800 rounded-xl shrink-0 text-slate-400 border border-slate-700">
                   <Cpu className="w-6 h-6" />
                </div>
                <div>
                   <h4 className="text-base font-bold text-white">Local Engine</h4>
                   <p className="text-sm text-slate-400 leading-relaxed mt-1">
                      Powered by FFmpeg. 100% private, local processing. No cloud uploads.
                   </p>
                </div>
             </div>
          </div>

           <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-5 flex items-center gap-4">
              <CheckCircle2 className="w-6 h-6 text-amber-500 shrink-0" />
              <p className="text-sm text-amber-200/90 leading-relaxed">
                 <strong>Pro Tip:</strong> When merging to M4B, filenames are automatically used as Chapter titles.
              </p>
           </div>
        </div>

        <div className="px-6 py-5 border-t border-slate-800 bg-slate-950/30 flex justify-end rounded-b-2xl">
           <button 
             onClick={onClose}
             className="px-7 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2 hover:translate-y-[-1px] active:translate-y-[0px]"
           >
              Got it <ArrowRight className="w-4 h-4" />
           </button>
        </div>
      </div>
    </div>
  );
};
