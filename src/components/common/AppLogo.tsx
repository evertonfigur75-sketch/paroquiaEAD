import React from 'react';
import { useAppSettings } from '../../context/AppSettingsContext';
import { LutherRoseIcon } from './LutherRoseIcon';

interface AppLogoProps {
  size?: number;
  className?: string;
  forceLutherRose?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 36,
  className = '',
  forceLutherRose = false,
}) => {
  const { settings } = useAppSettings();

  if (!forceLutherRose && settings.logoUrl && (settings.logoType === 'custom_upload' || settings.logoType === 'url')) {
    return (
      <img
        src={settings.logoUrl}
        alt={settings.appName}
        style={{ width: size, height: size }}
        className={`rounded-xl object-cover shadow-xs border border-white/20 shrink-0 ${className}`}
      />
    );
  }

  return <LutherRoseIcon size={size} className={className} />;
};
