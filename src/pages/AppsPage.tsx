import React, { useState } from 'react';
import { AppRecord, ChannelType } from '../types';
import { AppCard } from '../components/AppCard';
import { PlusCircle, Search, Filter, Layers, Sparkles } from 'lucide-react';

interface AppsPageProps {
  apps: AppRecord[];
  apiBaseUrl: string;
  onNavigate: (tab: any) => void;
  onManageApp: (app: AppRecord) => void;
  onNewReleaseForApp: (app: AppRecord) => void;
  onViewPublic: (packageName: string) => void;
}

export const AppsPage: React.FC<AppsPageProps> = ({
  apps,
  apiBaseUrl,
  onNavigate,
  onManageApp,
  onNewReleaseForApp,
  onViewPublic
}) => {
  const [search, setSearch] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');

  const filteredApps = apps.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.packageName.toLowerCase().includes(search.toLowerCase()) ||
      app.currentVersion.toLowerCase().includes(search.toLowerCase());

    const matchesChannel =
      selectedChannel === 'all' || app.defaultChannel === selectedChannel;

    return matchesSearch && matchesChannel;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            <span>Applications ({apps.length})</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your Android apps, configure channels, and generate permanent endpoints.
          </p>
        </div>

        <button
          onClick={() => onNavigate('add-app')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold tracking-wide flex items-center gap-2 transition-all shadow-md self-start sm:self-auto shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New App</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-[#0e1019] p-3 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, package..."
            className="w-full pl-9 pr-4 py-2 bg-[#121422] border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Channel Filter Pills */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <span className="text-[11px] text-slate-500 mr-1 flex items-center gap-1 font-mono uppercase">
            <Filter className="w-3 h-3" /> Channel:
          </span>
          {['all', 'stable', 'beta', 'alpha'].map((ch) => (
            <button
              key={ch}
              onClick={() => setSelectedChannel(ch)}
              className={`px-3 py-1 rounded-lg text-xs font-medium uppercase font-mono transition-colors ${
                selectedChannel === ch
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              {ch}
            </button>
          ))}
        </div>
      </div>

      {/* Apps Grid */}
      {filteredApps.length === 0 ? (
        <div className="p-12 text-center bg-[#0d0f17] border border-slate-800 rounded-2xl space-y-3">
          <Layers className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">No applications match your filter</h3>
          <p className="text-xs text-slate-500">Try changing your search terms or register a new app.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredApps.map((app) => (
            <AppCard
              key={app.id}
              app={app}
              apiBaseUrl={apiBaseUrl}
              onManage={onManageApp}
              onNewRelease={onNewReleaseForApp}
              onViewPublic={onViewPublic}
            />
          ))}
        </div>
      )}
    </div>
  );
};
