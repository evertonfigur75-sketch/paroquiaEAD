import React from 'react';
import {
  Home,
  BookOpen,
  CalendarCheck,
  Bookmark,
  Menu,
  Award,
} from 'lucide-react';

interface StudentBottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  pendingWorshipsCount?: number;
  isConfirmatorio?: boolean;
}

export const StudentBottomNav: React.FC<StudentBottomNavProps> = ({
  currentTab,
  onSelectTab,
  pendingWorshipsCount = 0,
  isConfirmatorio = true,
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Início', icon: Home },
    { id: 'curso', label: 'Aulas', icon: BookOpen },
    ...(isConfirmatorio
      ? [
          {
            id: 'cultos',
            label: 'Cultos 24',
            icon: CalendarCheck,
            badge: pendingWorshipsCount > 0 ? pendingWorshipsCount : undefined,
          },
        ]
      : [{ id: 'notas', label: 'Boletim', icon: Award }]),
    { id: 'catecismo', label: 'Catecismo', icon: Bookmark },
    { id: 'mais', label: 'Mais', icon: Menu },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-1.5 px-2 shadow-lg sm:hidden">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition relative min-w-[56px] ${
                isActive
                  ? 'text-[#1e3a5f] font-bold'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-bold text-[9px] flex items-center justify-center shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 ${isActive ? 'font-bold' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
