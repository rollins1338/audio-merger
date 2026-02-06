
import React, { useEffect, useState } from 'react';
import { 
  AudioWaveform, 
  Cpu, 
  HardDrive, 
  Zap, 
  BookOpen, 
  FileAudio, 
  Shield, 
  Github, 
  Globe, 
  Bug, 
  Activity, 
  Lightbulb,
  Code,
  ExternalLink,
  X,
  Copy
} from 'lucide-react';
import { APP_NAME, APP_VERSION } from '../constants';
import { SystemSpecs } from '../types';

interface AboutPanelProps {
  isOpen: boolean;
  onClose: () => void;
  ffmpegVersion: string | null;
  systemSpecs: SystemSpecs | null;
  onSetupFfmpeg: () => void;
}

export const AboutPanel: React.FC<AboutPanelProps> = ({ 
  isOpen, 
  onClose,
  ffmpegVersion, 
  systemSpecs,
  onSetupFfmpeg
}) => {
  const [shouldRender, setShouldRender] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  // robust mount/unmount animation logic
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Small delay to allow DOM render before starting CSS transition
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimateIn(true);
        });
      });
      document.body.style.overflow = 'hidden';
    } else {
      setAnimateIn(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 500); // Match transition duration
      document.body.style.overflow = '';
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Global scroll/wheel listener to close panel
  useEffect(() => {
    if (!isOpen) return;
    
    const handleWheel = (e: WheelEvent) => {
        // If scrolling down significantly or up significantly, close it.
        // Or just any substantial scroll interaction outside the content?
        // Since panel is full screen, let's allow close on scroll if users requested it.
        if (Math.abs(e.deltaY) > 30) {
            onClose();
        }
    };
    
    window.addEventListener('wheel', handleWheel);
    return () => window.removeEventListener('wheel', handleWheel);
  }, [isOpen, onClose]);

  if (!shouldRender) return null;

  const features = [
    { icon: <BookOpen className="w-4 h-4 text-cyan-400" />, title: "Smart Chapters", desc: "Auto-detects intros & outros" },
    { icon: <Zap className="w-4 h-4 text-yellow-400" />, title: "Lossless Merge", desc: "Stream copy without re-encoding" },
    { icon: <FileAudio className="w-4 h-4 text-purple-400" />, title: "Multi-Format", desc: "Full MP3 & M4B support" },
    { icon: <Shield className="w-4 h-4 text-green-400" />, title: "Privacy First", desc: "100% Local processing" },
  ];

  const cleanCpuName = (name: string) => {
    return name
      .replace(/\(R\)/g, '')
      .replace(/\(TM\)/g, '')
      .replace(/CPU/g, '')
      .replace(/@.*/, '')
      .trim();
  };

  const handleCopyVersion = () => {
    navigator.clipboard.writeText(`${APP_NAME} v${APP_VERSION}`);
  };

  return (
    <div 
      className={`fixed inset-0 z-[60] flex flex-col pt-0 transition-all duration-500 ease-in-out ${animateIn ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
    >
       {/* Backdrop */}
       <div 
         className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-500"
         onClick={onClose} 
       />

       {/* Sliding Panel */}
       <div 
         className={`
            relative w-full border-b border-white/10 bg-slate-900/90 backdrop-blur-xl shadow-2xl 
            transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
            ${animateIn ? 'translate-y-0' : '-translate-y-full'}
         `}
       >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-50" />
          
          <div className="max-w-6xl mx-auto p-8 relative">
              {/* Close Button */}
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-full bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-white transition-all border border-slate-700 hover:border-slate-600 z-[70] shadow-lg active:scale-95 backdrop-blur-md"
                aria-label="Close Info"
              >
                 <X className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-4">
                <div className="lg:col-span-7 space-y-8">
                  <div className="flex items-start gap-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-3xl flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-white/10 shrink-0 transform rotate-3">
                      <AudioWaveform className="w-10 h-10 text-white" />
                    </div>
                    <div className="space-y-3">
                      <div>
                        <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                          {APP_NAME}
                          <button 
                            onClick={handleCopyVersion}
                            className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono text-cyan-400 cursor-pointer hover:bg-cyan-500/20 transition-colors flex items-center gap-1.5 active:scale-95"
                            title="Copy Version"
                          >
                            v{APP_VERSION}
                            <Copy className="w-3 h-3 opacity-50" />
                          </button>
                        </h2>
                        <p className="text-base text-slate-400 mt-2 max-w-lg leading-relaxed">
                          A professional-grade audio merger designed for audiobookworms. 
                          Built for speed, precision, and privacy using advanced FFmpeg orchestration.
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm font-mono text-slate-500">
                         <Code className="w-4 h-4" />
                         <div className="flex items-center gap-1.5">
                            <span>Vibe Coded by <span className="text-cyan-400 font-bold">RxxFii</span></span>
                            <a 
                                href="https://github.com/rollins1338" 
                                target="_blank" 
                                rel="noreferrer"
                                className="inline-flex items-center justify-center p-0.5 rounded hover:bg-white/10 hover:text-white text-slate-500 transition-colors"
                                title="GitHub Profile"
                            >
                                <Github className="w-4 h-4" />
                            </a>
                         </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Zap className="w-4 h-4" /> Core Capabilities
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {features.map((f, i) => (
                        <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors group">
                          <div className="p-2.5 rounded-lg bg-slate-900 border border-white/5 group-hover:scale-105 transition-transform group-hover:bg-slate-800">
                            {f.icon}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-200">{f.title}</div>
                            <div className="text-xs text-slate-500">{f.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 flex flex-col gap-6">
                  <div className="bg-slate-900/40 rounded-2xl p-6 border border-white/5 shadow-inner backdrop-blur-md">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Activity className="w-4 h-4" /> System Status
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                        <div className="flex items-center gap-3">
                          <div className={`w-2.5 h-2.5 rounded-full ${ffmpegVersion ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500 animate-pulse'}`} />
                          <div className="flex flex-col">
                             <span className="text-sm font-medium text-slate-200">FFmpeg</span>
                             {ffmpegVersion && <span className="text-[10px] text-slate-500 font-mono">{ffmpegVersion.split(' ')[0]}</span>}
                          </div>
                        </div>
                        {ffmpegVersion ? (
                          <span className="text-xs font-mono text-green-400 bg-green-500/10 px-2 py-1 rounded border border-green-500/20">
                            Linked
                          </span>
                        ) : (
                          <button 
                            onClick={onSetupFfmpeg}
                            className="text-xs font-bold text-slate-900 bg-cyan-500 hover:bg-cyan-400 px-3 py-1.5 rounded transition-colors"
                          >
                            Connect
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                          <div className="flex items-center gap-2 mb-1.5">
                            <Cpu className="w-4 h-4 text-cyan-500" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase">CPU</span>
                          </div>
                          <div className="text-xs font-mono text-slate-300 truncate" title={systemSpecs?.cpu}>
                            {systemSpecs ? cleanCpuName(systemSpecs.cpu) : 'Scanning...'}
                          </div>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                          <div className="flex items-center gap-2 mb-1.5">
                            <HardDrive className="w-4 h-4 text-purple-500" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Memory</span>
                          </div>
                          <div className="text-xs font-mono text-slate-300">
                            {systemSpecs ? systemSpecs.memory : '...'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-slate-900/40 rounded-xl p-4 border border-white/5">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                           <Lightbulb className="w-3 h-3" /> Tips
                        </h4>
                        <ul className="space-y-2">
                           <li className="text-xs text-slate-400 leading-tight">
                              Use <strong className="text-slate-300">Stream Copy</strong> for instant merges.
                           </li>
                           <li className="text-xs text-slate-400 leading-tight">
                              Drag <strong className="text-slate-300">Folders</strong> to auto-scan chapters.
                           </li>
                        </ul>
                     </div>

                     <div className="bg-slate-900/40 rounded-xl p-4 border border-white/5">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                           <Globe className="w-3 h-3" /> Links
                        </h4>
                        <div className="space-y-2">
                          <a href="https://github.com/rollins1338/audio-merger" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-slate-400 hover:text-cyan-400 transition-colors group">
                            <Github className="w-4 h-4" />
                            <span>GitHub Repo</span>
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                          </a>
                          <a 
                            href="https://github.com/rollins1338/audio-merger/issues" 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex items-center gap-2 text-xs text-slate-400 hover:text-cyan-400 transition-colors w-full text-left group"
                          >
                            <Bug className="w-4 h-4" />
                            <span>Report Issue</span>
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                          </a>
                        </div>
                     </div>
                  </div>

                </div>
              </div>
          </div>
       </div>
    </div>
  );
};
