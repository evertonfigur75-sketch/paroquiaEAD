import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { AppNotification } from '../../types';
import { 
  Bell, 
  CheckCheck, 
  Activity, 
  Award, 
  MessageSquare, 
  Info,
  Clock,
  X,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const NotificationCenter: React.FC = () => {
  const { studentProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    const refresh = () => {
      if (studentProfile) {
        setNotifications(dbService.getNotifications(studentProfile.id));
      }
    };

    refresh();
    
    window.addEventListener('notifications_updated', refresh);
    return () => window.removeEventListener('notifications_updated', refresh);
  }, [studentProfile]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (id: string) => {
    await dbService.markNotificationAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllAsRead = async () => {
    if (!studentProfile) return;
    await dbService.markAllNotificationsAsRead(studentProfile.id);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'activity': return <Activity className="w-4 h-4 text-emerald-600" />;
      case 'grade': return <Award className="w-4 h-4 text-amber-600" />;
      case 'announcement': return <MessageSquare className="w-4 h-4 text-blue-600" />;
      default: return <Info className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all active:scale-95"
        title="Notificações"
      >
        <Bell className="w-5 h-5 text-white" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#1e3a5f]">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            <div 
              className="fixed inset-0 z-[60] lg:hidden" 
              onClick={() => setIsOpen(false)} 
            />
            
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-3 w-[320px] sm:w-[380px] bg-white rounded-3xl shadow-2xl border border-slate-200 z-[70] overflow-hidden"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    Notificações
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold">
                        {unreadCount} novas
                      </span>
                    )}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 uppercase tracking-wider"
                    >
                      <CheckCheck className="w-3 h-3" />
                      Lidas
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-lg hover:bg-slate-200 transition text-slate-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="max-h-[400px] overflow-y-auto overscroll-contain custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
                      <Bell className="w-8 h-8 text-slate-200" />
                    </div>
                    <p className="text-sm font-medium text-slate-400">Nenhuma notificação por aqui.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => handleMarkAsRead(notif.id)}
                        className={`p-4 flex gap-3 transition cursor-pointer hover:bg-slate-50 ${
                          !notif.read ? 'bg-amber-50/30' : ''
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                          !notif.read ? 'bg-white shadow-sm border border-slate-100' : 'bg-slate-50'
                        }`}>
                          {getIcon(notif.type)}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-sm text-slate-800 leading-tight">
                              {notif.title}
                            </span>
                            {!notif.read && (
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {notif.message}
                          </p>
                          <div className="flex items-center gap-3 pt-1">
                            <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1 uppercase tracking-tighter">
                              <Clock className="w-3 h-3" />
                              {new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {notif.link && (
                              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter flex items-center gap-0.5">
                                Ver detalhe <ChevronRight className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-3 bg-slate-50/80 border-t border-slate-100 text-center">
                  <p className="text-[10px] text-slate-400 font-medium italic">
                    Notificações são mantidas por 30 dias
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
