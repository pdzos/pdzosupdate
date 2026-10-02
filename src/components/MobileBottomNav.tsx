import React from 'react';
import { NavigationTab } from './Sidebar';
import { LayoutDashboard, Layers, PlusCircle, Sparkles, Settings } from 'lucide-react';

interface MobileBottomNavProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  appsCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  appsCount,
}) => {
  const items: {
    id: NavigationTab;
    label: string;
    icon: React.ReactNode;
    isPrimary?: boolean;
    badge?: number;
  }[] = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'apps',
      label: 'Apps',
      icon: <Layers className="w-4 h-4" />,
      badge: appsCount,
    },
    {
      id: 'add-app',
      label: 'Add',
      icon: <PlusCircle className="w-5 h-5" />,
      isPrimary: true,
    },
    {
      id: 'releases',
      label: 'Releases',
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0b0d16]/95 backdrop-blur-lg border-t border-slate-800 lg:hidden px-2 py-1 shadow-2xl safe-area-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {items.map((item) => {
          const isActive = currentTab === item.id;
          if (item.isPrimary) {
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex flex-col items-center justify-center p-1.5 -mt-3 rounded-full transition-transform active:scale-95 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40 ring-4 ring-[#0b0d16]'
                    : 'bg-blue-600/90 hover:bg-blue-500 text-white shadow-md ring-2 ring-[#0b0d16]'
                }`}
                title="Add New App"
              >
                <div className="w-10 h-10 flex items-center justify-center">
                  {item.icon}
                </div>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 relative transition-colors ${
                isActive
                  ? 'text-blue-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-blue-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight truncate max-w-[50px]">
                {item.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-blue-400 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
