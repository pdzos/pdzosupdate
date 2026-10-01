import React from 'react';
import { HexLogo } from './HexLogo';
import { Search, Bell, Menu, ShieldCheck, Terminal, HelpCircle } from 'lucide-react';

interface NavbarProps {
  onToggleMobileMenu: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenDocs: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobileMenu,
  searchQuery,
  onSearchChange,
  onOpenDocs
}) => {
  return (
    <header className="sticky top-0 z-40 w-full h-16 border-b border-slate-800 bg-[#090a0f]/90 backdrop-blur-md px-4 lg:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger + Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <HexLogo size="sm" withText={true} />
      </div>

      {/* Middle: Global Search */}
      <div className="flex-1 max-w-md hidden sm:block">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search apps, package names, versions..."
            className="w-full pl-10 pr-4 py-1.5 bg-[#11131c] border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/30 transition-all font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Right: Quick actions & Admin profile */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onOpenDocs}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition-colors font-medium"
        >
          <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
          <span>Docs</span>
        </button>

        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-[11px] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="hidden md:inline">SYSTEM:</span> LIVE
        </div>

        {/* Notifications button */}
        <div className="relative">
          <button
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="System Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
          </button>
        </div>

        {/* Admin profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shadow-md ring-2 ring-slate-800">
            H
          </div>
          <div className="hidden xl:flex flex-col text-left">
            <span className="text-xs font-bold text-slate-200 leading-none">HexOS Admin</span>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5">Free Tier (No DB)</span>
          </div>
        </div>
      </div>
    </header>
  );
};
