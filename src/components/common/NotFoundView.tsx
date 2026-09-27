import React from 'react';
import { Compass, ArrowLeft, Home, Sparkles } from 'lucide-react';
import { NexoraLogo } from './NexoraLogo';

interface NotFoundViewProps {
  attemptedPath: string;
  onNavigateHome: () => void;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({
  attemptedPath,
  onNavigateHome,
}) => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-[#0B243D] border border-slate-200 dark:border-[#1D4968] shadow-2xl space-y-6">
        <NexoraLogo size="lg" variant="compact" className="mx-auto" />

        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#E0F4FA] dark:bg-[#061A2E] text-[#0878C9] dark:text-[#35C759] flex items-center justify-center border border-[#0878C9]/30">
          <Compass className="w-8 h-8 animate-spin" style={{ animationDuration: '12s' }} />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#0878C9] dark:text-[#35C759]">
            Error Code 404 · Unmapped Route
          </span>
          <h1 className="text-2xl font-black text-[#061A2E] dark:text-white tracking-tight">
            Asset Not Located
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            The requested location <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#061A2E] font-mono text-[11px] text-[#0878C9]">{attemptedPath}</code> does not match an active tenant workspace, material catalogue, or platform console endpoint.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go Back</span>
          </button>
          <button
            onClick={onNavigateHome}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0878C9] hover:bg-[#0661a3] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md shadow-sky-500/20"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Workspace</span>
          </button>
        </div>
      </div>
    </div>
  );
};
