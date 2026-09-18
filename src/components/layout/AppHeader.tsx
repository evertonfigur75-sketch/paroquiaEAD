import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppSettings } from '../../context/AppSettingsContext';
import { AppLogo } from '../common/AppLogo';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { NotificationCenter } from '../student/NotificationCenter';
import { LogOut, User, ShieldCheck, Bell } from 'lucide-react';

interface AppHeaderProps {
  title?: string;
  onOpenProfile?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ title, onOpenProfile }) => {
  const { currentUser, isAdmin, logout } = useAuth();
  const { settings } = useAppSettings();

  return (
    <header
      className="text-white sticky top-0 z-40 shadow-md border-b border-black/10 transition-colors"
      style={{ backgroundColor: settings.primaryColor || '#1e3a5f' }}
    >
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AppLogo size={36} />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold font-display tracking-wider uppercase leading-tight truncate">
                {title || settings.appName || 'Plataforma de Ensino Luterano'}
              </h1>
              {isAdmin && (
                <span
                  className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: settings.accentColor || '#f59e0b',
                    color: '#0f172a',
                  }}
                >
                  <ShieldCheck className="w-3 h-3" />
                  Pastor
                </span>
              )}
            </div>
            <p className="text-[10px] opacity-90 truncate max-w-[280px]">
              {isAdmin
                ? `Administrador — ${currentUser?.name || 'Pastor Everton Figur'}`
                : currentUser?.congregationName || settings.appSubtitle || 'Paróquia Luterana'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <PWAInstallButton compact={true} />
          
          {!isAdmin && currentUser && <NotificationCenter />}

          {/* User profile button */}
          <button
            id="btn-header-profile"
            onClick={onOpenProfile}
            className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition text-xs font-medium cursor-pointer"
            title="Meu Perfil"
          >
            {currentUser?.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover border border-amber-400"
              />
            ) : (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs"
                style={{
                  backgroundColor: settings.accentColor || '#f59e0b',
                  color: '#0f172a',
                }}
              >
                {currentUser?.name.charAt(0) || 'U'}
              </div>
            )}
            <span className="hidden md:inline truncate max-w-[120px]">
              {currentUser?.name.split(' ')[0]}
            </span>
          </button>

          {/* Logout button */}
          <button
            id="btn-header-logout"
            onClick={logout}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-red-500/20 transition cursor-pointer"
            title="Sair da Plataforma"
          >
            <LogOut className="w-4 h-4 text-red-300" />
          </button>
        </div>
      </div>
    </header>
  );
};
