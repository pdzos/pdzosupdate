import React from 'react';
import {
  LayoutDashboard,
  Layers,
  Sparkles,
  PlusCircle,
  Link2,
  Terminal,
  BookOpen,
  Activity,
  Settings,
  HardDrive,
  X
} from 'lucide-react';

export type NavigationTab =
  | 'dashboard'
  | 'apps'
  | 'releases'
  | 'add-app'
  | 'create-release'
  | 'update-urls'
  | 'api-tester'
  | 'docs'
  | 'activity'
  | 'settings';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  appsCount: number;
  releasesCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isMobileOpen,
  onCloseMobile,
  appsCount,
  releasesCount,
}) => {
  const navItems: {
    id: NavigationTab;
    label: string;
    icon: React.ReactNode;
    badge?: string | number;
    badgeColor?: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'apps',
      label: 'My Apps',
      icon: <Layers className="w-4 h-4" />,
      badge: appsCount,
      badgeColor: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    },
    {
      id: 'releases',
      label: 'Releases',
      icon: <Sparkles className="w-4 h-4" />,
      badge: releasesCount,
      badgeColor: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30',
    },
    {
      id: 'add-app',
      label: 'Add App',
      icon: <PlusCircle className="w-4 h-4" />,
    },
    {
      id: 'update-urls',
      label: 'Update URLs',
      icon: <Link2 className="w-4 h-4" />,
    },
    {
      id: 'api-tester',
      label: 'API Tester',
      icon: <Terminal className="w-4 h-4" />,
    },
    {
      id: 'docs',
      label: 'Documentation',
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: 'activity',
      label: 'Activity',
      icon: <Activity className="w-4 h-4" />,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0d0f18] border-r border-slate-800 text-slate-300">
      {/* Mobile top close button */}
      <div className="flex items-center justify-between p-4 lg:hidden border-b border-slate-800">
        <span className="font-bold text-sm text-white">HexOS Navigation</span>
        <button
          onClick={onCloseMobile}
          className="p-1 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          Management
        </div>

        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-blue-400' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${item.badgeColor || 'bg-slate-800 text-slate-400'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Free Architecture Footer Card */}
      <div className="p-3 m-3 rounded-xl bg-[#11131f] border border-slate-800 text-xs space-y-2">
        <div className="flex items-center gap-2 text-slate-300 font-semibold text-[11px]">
          <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
          <span>Free Architecture</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed">
          Zero paid databases. Metadata stored in GitHub JSON. APKs hosted on Google Drive.
        </p>
        <div className="pt-1 flex items-center justify-between text-[10px] text-blue-400 border-t border-slate-800/80">
          <span>Cloudflare Pages</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop static sidebar */}
      <aside className="hidden lg:block w-64 h-[calc(100vh-4rem)] sticky top-16 shrink-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
