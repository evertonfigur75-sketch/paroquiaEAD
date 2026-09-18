import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X } from 'lucide-react';
import { onMessage } from 'firebase/messaging';
import { messaging } from '../../lib/firebase';

export const NotificationToast: React.FC = () => {
  const [notification, setNotification] = useState<{ title: string; body: string } | null>(null);

  useEffect(() => {
    if (!messaging) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Mensagem recebida em primeiro plano:', payload);
      if (payload.notification) {
        setNotification({
          title: payload.notification.title || 'Nova Notificação',
          body: payload.notification.body || '',
        });
        
        // Auto-close after 6 seconds
        setTimeout(() => setNotification(null), 6000);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          className="fixed top-20 right-4 z-[70] max-w-sm w-full bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 flex gap-4 overflow-hidden"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-slate-900 truncate">{notification.title}</h4>
            <p className="text-xs text-slate-600 mt-1 line-clamp-2">{notification.body}</p>
          </div>
          <button 
            onClick={() => setNotification(null)}
            className="p-1 text-slate-400 hover:text-slate-600 transition flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
          <motion.div 
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: 6, ease: "linear" }}
            className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500 origin-left"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
