import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppSettings } from '../types';
import { dbService, DEFAULT_APP_SETTINGS } from '../services/db';

interface AppSettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<AppSettings>;
  resetSettings: () => Promise<void>;
  isLoading: boolean;
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export const AppSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  const applyDomStyles = useCallback((s: AppSettings) => {
    if (typeof document !== 'undefined') {
      document.title = s.appName || 'Plataforma de Ensino Luterano';
      document.documentElement.style.setProperty('--theme-primary', s.primaryColor || '#1e3a5f');
      document.documentElement.style.setProperty('--theme-accent', s.accentColor || '#f59e0b');
    }
  }, []);

  useEffect(() => {
    const initSettings = async () => {
      await dbService.init();
      const fresh = dbService.getAppSettings();
      setSettings(fresh);
      applyDomStyles(fresh);
      setIsLoading(false);
    };

    initSettings();

    const handleSettingsChanged = (e: Event) => {
      const customEvent = e as CustomEvent<AppSettings>;
      if (customEvent.detail) {
        setSettings(customEvent.detail);
        applyDomStyles(customEvent.detail);
      } else {
        const fresh = dbService.getAppSettings();
        setSettings(fresh);
        applyDomStyles(fresh);
      }
    };

    window.addEventListener('app_settings_changed', handleSettingsChanged);
    return () => {
      window.removeEventListener('app_settings_changed', handleSettingsChanged);
    };
  }, [applyDomStyles]);

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const updated = await dbService.saveAppSettings(newSettings);
    setSettings(updated);
    applyDomStyles(updated);
    return updated;
  };

  const resetSettings = async () => {
    const reset = await dbService.saveAppSettings(DEFAULT_APP_SETTINGS);
    setSettings(reset);
    applyDomStyles(reset);
  };

  return (
    <AppSettingsContext.Provider value={{ settings, updateSettings, resetSettings, isLoading }}>
      {children}
    </AppSettingsContext.Provider>
  );
};

export const useAppSettings = (): AppSettingsContextType => {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }
  return context;
};
