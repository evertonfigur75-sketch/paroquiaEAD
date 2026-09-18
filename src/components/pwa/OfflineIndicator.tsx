import React from 'react';
import { useOnlineStatus } from './usePWAInstall';
import { WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const OfflineIndicator: React.FC = () => {
  const { isOnline } = useOnlineStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 rounded-2xl bg-amber-600 px-5 py-3 text-sm font-bold text-white shadow-2xl border border-amber-500/30 backdrop-blur-md"
        >
          <div className="relative">
            <WifiOff className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-200 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-100"></span>
            </span>
          </div>
          <div className="flex flex-col">
            <span>Você está offline</span>
            <span className="text-[10px] font-medium opacity-90">Suas respostas estão sendo salvas localmente e serão sincronizadas automaticamente.</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
