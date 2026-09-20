import React from 'react';
import { BookOpen, Sparkles } from 'lucide-react';

interface BibleFloatingLauncherProps {
  onOpen: () => void;
  isOpen: boolean;
}

export const BibleFloatingLauncher: React.FC<BibleFloatingLauncherProps> = ({
  onOpen,
  isOpen,
}) => {
  if (isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 print:hidden">
      <button
        onClick={onOpen}
        className="group flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-[#1e3a5f] hover:bg-[#162a45] text-white shadow-xl hover:shadow-2xl border border-amber-400/40 transition-all duration-300 active:scale-95 cursor-pointer"
        title="Consultar a Bíblia Sagrada & Citações sem sair do aplicativo"
      >
        <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
          <BookOpen className="w-3.5 h-3.5" />
        </div>
        <span className="text-xs font-bold font-display tracking-wide text-white">
          Bíblia Sagrada
        </span>
        <span className="hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30">
          Citações
        </span>
      </button>
    </div>
  );
};
