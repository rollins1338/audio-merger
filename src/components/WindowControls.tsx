
import React from 'react';
import { Minus, X } from 'lucide-react';

export const WindowControls: React.FC = () => {
  if (!window.electron) return null;

  return (
    <div className="flex items-center -mr-2 pointer-events-auto no-drag">
      <button 
        onClick={() => window.electron?.minimizeWindow()}
        className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        title="Minimize"
      >
        <Minus className="w-4 h-4" />
      </button>
      <button 
        onClick={() => window.electron?.closeWindow()}
        className="p-2 text-slate-400 hover:text-white hover:bg-red-500 rounded-lg transition-colors group"
        title="Close"
      >
        <X className="w-4 h-4 group-hover:text-white" />
      </button>
    </div>
  );
};
