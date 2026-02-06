import React from 'react';
import { X, ExternalLink, Search, AlertTriangle, Download, FolderOpen, Terminal } from 'lucide-react';

interface FFmpegModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocate: () => void;
  configError: string | null;
}

export const FFmpegModal: React.FC<FFmpegModalProps> = ({ isOpen, onClose, onLocate, configError }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-inner">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">FFmpeg Setup Required</h2>
              <p className="text-xs text-slate-400 font-medium">Core audio engine missing</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          <div className="bg-blue-500/5 rounded-xl p-4 border border-blue-500/10 text-sm text-slate-300 leading-relaxed flex gap-3">
            <Terminal className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <p>
              <strong className="text-blue-200">System Requirement:</strong> AudioForge uses <strong>FFmpeg</strong> to process high-fidelity audio. This is a one-time setup to link the engine to the app.
            </p>
          </div>

          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex gap-5 group">
              <div className="flex-none flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-slate-400 font-bold flex items-center justify-center text-sm group-hover:border-primary-500 group-hover:text-primary-400 transition-colors shadow-lg">1</div>
                <div className="w-0.5 h-full bg-slate-800 my-2 group-hover:bg-slate-700 transition-colors"></div>
              </div>
              <div className="pb-2 w-full">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  Install FFmpeg
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">Required</span>
                </h3>
                
                <div className="mt-3 grid grid-cols-1 gap-3">
                    {/* Windows */}
                    <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                        <p className="text-xs text-slate-300 font-bold mb-1">Windows</p>
                        <p className="text-xs text-slate-500 mb-2">Download "release-essentials" from gyan.dev</p>
                        <a 
                          href="https://www.gyan.dev/ffmpeg/builds/" 
                          target="_blank" 
                          rel="noreferrer" 
                          className="inline-flex items-center text-primary-400 hover:text-primary-300 text-xs font-bold"
                        >
                          Download <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                    </div>

                    {/* Mac & Linux */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                            <p className="text-xs text-slate-300 font-bold mb-1">macOS</p>
                            <code className="block bg-slate-900 px-2 py-1.5 rounded text-[10px] font-mono text-green-400 border border-slate-800">
                                brew install ffmpeg
                            </code>
                        </div>
                        <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                            <p className="text-xs text-slate-300 font-bold mb-1">Linux (Ubuntu/Debian)</p>
                            <code className="block bg-slate-900 px-2 py-1.5 rounded text-[10px] font-mono text-green-400 border border-slate-800">
                                sudo apt install ffmpeg
                            </code>
                        </div>
                    </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-5 group">
               <div className="flex-none flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-slate-400 font-bold flex items-center justify-center text-sm group-hover:border-primary-500 group-hover:text-primary-400 transition-colors shadow-lg">2</div>
              </div>
              <div className="w-full">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  Link to AudioForge
                </h3>
                <p className="text-sm text-slate-400 mt-1 mb-4">
                  If installed globally (Mac/Linux), restart the app. For Windows portable builds, locate <strong>ffmpeg.exe</strong>.
                </p>
                
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={onLocate}
                    className="flex items-center justify-center w-full space-x-2 px-5 py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white rounded-xl font-bold shadow-lg shadow-primary-500/20 transition-all transform hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <Search className="w-4 h-4" />
                    <span>Locate ffmpeg Binary</span>
                  </button>
                  
                  {configError && (
                    <div className="w-full p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 animate-in slide-in-from-top-2">
                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                        <span className="text-xs font-medium text-red-300">{configError}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};