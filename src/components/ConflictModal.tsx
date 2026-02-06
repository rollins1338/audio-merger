import React from 'react';
import { FileConflict, ConflictData } from '../types';
import { AlertTriangle, Wrench, X, FileWarning } from 'lucide-react';
import { Button } from './Button';

interface ConflictModalProps {
  data: ConflictData | null;
  onCancel: () => void;
  onAutoFix: () => void;
}

export const ConflictModal: React.FC<ConflictModalProps> = ({ data, onCancel, onAutoFix }) => {
  if (!data) return null;

  const corruptCount = data.conflicts.filter(c => c.reason === 'CORRUPT' || c.reason === 'EMPTY').length;
  const mismatchCount = data.conflicts.filter(c => c.reason === 'SAMPLE_RATE_MISMATCH').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-red-500/5 flex items-start gap-4">
          <div className="p-3 bg-red-500/10 rounded-full border border-red-500/20 shrink-0">
             <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Merge Conflicts Detected</h2>
            <p className="text-sm text-slate-400 mt-1">
              Issues were found in {data.conflicts.length} of your files that prevent a clean merge.
            </p>
          </div>
        </div>

        <div className="p-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
             <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                <span className="block text-xs font-bold text-slate-500 uppercase">Corrupt / Empty</span>
                <span className="text-lg font-mono text-white">{corruptCount} files</span>
             </div>
             <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                <span className="block text-xs font-bold text-slate-500 uppercase">Sample Rate Mismatch</span>
                <span className="text-lg font-mono text-white">{mismatchCount} files</span>
             </div>
          </div>

          {/* List */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden flex flex-col max-h-[250px] mb-6">
             <div className="px-4 py-2 bg-slate-800/50 border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
               Problematic Files
             </div>
             <div className="overflow-y-auto custom-scrollbar p-2 space-y-2">
                {data.conflicts.map((c, i) => (
                   <div key={i} className="flex items-start gap-3 p-2 rounded hover:bg-slate-800/50 transition-colors">
                      <FileWarning className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                         <p className="text-sm text-slate-300 font-medium truncate">{c.fileName}</p>
                         <div className="flex items-center gap-2 mt-0.5">
                             <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${
                                 c.reason === 'SAMPLE_RATE_MISMATCH' 
                                 ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                 : 'bg-red-500/10 text-red-500 border-red-500/20'
                             }`}>
                                {c.reason.replace(/_/g, ' ')}
                             </span>
                             <span className="text-xs text-slate-500 truncate">{c.details}</span>
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 text-sm text-slate-300 mb-6">
            <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-primary-400" />
                Recommended Action: Auto-Fix
            </h4>
            <p className="mb-2">AudioForge can automatically resolve these issues:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 ml-1">
                {corruptCount > 0 && <li><strong className="text-red-400">Skip</strong> files that are empty or corrupt.</li>}
                {mismatchCount > 0 && <li><strong className="text-amber-400">Re-encode</strong> mismatched files to {data.targetSampleRate}Hz (slower process).</li>}
            </ul>
          </div>

          <div className="flex justify-end gap-3">
             <Button variant="ghost" onClick={onCancel}>
                Cancel Merge
             </Button>
             <Button variant="primary" onClick={onAutoFix} icon={<Wrench className="w-4 h-4" />}>
                Auto-Fix & Merge
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
};