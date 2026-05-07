import React from 'react';
import * as LucideIcons from 'lucide-react';

export type IconName = keyof typeof LucideIcons;

interface AppIconProps {
  name: string;
  size?: number;
  className?: string;
}

/**
 * Utility component to match the original landing-page Icon interface
 * Maps HeroIcon-like names to Lucide names for consistency.
 */
const AppIcon: React.FC<AppIconProps> = ({ name, size = 24, className = "" }) => {
  // Mapping some common HeroIcon names to Lucide equivalents
  const iconMap: Record<string, keyof typeof LucideIcons> = {
    'MagnifyingGlassIcon': 'Search',
    'UserGroupIcon': 'Users',
    'CheckBadgeIcon': 'ShieldCheck',
    'MapPinIcon': 'MapPin',
    'StarIcon': 'Star',
    'ArrowRightIcon': 'ArrowRight',
    'ArrowDownTrayIcon': 'Download'
  };

  const lucideName = iconMap[name] || (name.replace('Icon', '') as keyof typeof LucideIcons);
  const LucideIcon = (LucideIcons[lucideName] || LucideIcons.HelpCircle) as any;

  return <LucideIcon size={size} className={className} />;
};

export default AppIcon;
