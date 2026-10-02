import React, { useState } from 'react';
import { AppRecord, ReleaseInfo } from '../types';
import { RecentReleasesTable } from '../components/RecentReleasesTable';
import { Sparkles, PlusCircle, Filter, RotateCcw, Search, Layers } from 'lucide-react';

interface ReleasesPageProps {
  apps: AppRecord[];
  onNavigate: (tab: any) => void;
  onRollback: (packageName: string, releaseId: string, version: string) => void;
  onViewJson: (release: ReleaseInfo) => void;
  onNewRelease: (app?: AppRecord) => void;
}

export const ReleasesPage: React.FC<ReleasesPageProps> = ({
  apps,
  onNavigate,
  onRollback,
  onViewJson,
  onNewRelease
}) => {
  const [selectedApp, setSelectedApp] = useState<string>('all');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Collect all releases
  const allReleases = apps.flatMap(a =>
    a.releases.map(r => ({ ...r, appName: a.name, appIcon: a.icon }))
  );

  const filteredReleases = allReleases.filter(r => {
    const matchesApp = selectedApp === 'all' || r.appPackageName === selectedApp;
    const matchesChannel = selectedChannel === 'all' || r.channel === selectedChannel;
    const matchesSearch =
      r.appName.toLowerCase().includes(search.toLowerCase()) ||
      r.appPackageName.toLowerCase().includes(search.toLowerCase()) ||
      r.version.toLowerCase().includes(search.toLowerCase());

    return matchesApp && matchesChannel && matchesSearch;
  });

  const sortedReleases = [...filteredReleases].sort(
    (a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span>Release Management & History</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Complete version history across all channels. Rollback active builds with zero downtime.
          </p>
        </div>

        <button
          onClick={() => onNewRelease()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold tracking-wide flex items-center gap-2 transition-all shadow-md self-start sm:self-auto shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Release</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap gap-3 items-center justify-between bg-[#0e1019] p-3 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap gap-2 items-center flex-1">
          {/* App filter dropdown */}
          <div className="flex items-center gap-1.5 bg-[#121422] px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <select
              value={selectedApp}
              onChange={(e) => setSelectedApp(e.target.value)}
              className="bg-transparent text-white focus:outline-none text-xs font-mono"
            >
              <option value="all" className="bg-[#121422]">All Applications</option>
              {apps.map(a => (
                <option key={a.packageName} value={a.packageName} className="bg-[#121422]">
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Channel selector */}
          <div className="flex items-center gap-1">
            {['all', 'stable', 'beta', 'alpha'].map(ch => (
              <button
                key={ch}
                onClick={() => setSelectedChannel(ch)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono uppercase transition-colors ${
                  selectedChannel === ch
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                {ch}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search version, package..."
            className="w-full pl-8 pr-3 py-1.5 bg-[#121422] border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Rollback Info Alert */}
      <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/20 flex items-start gap-3 text-xs text-slate-300 leading-relaxed">
        <RotateCcw className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-blue-300">How Rollback Works in PdzOS:</span> When you click{' '}
          <code className="text-amber-400 font-mono bg-black/40 px-1 rounded">Rollback</code> next to an older build (e.g. 1.5.0),
          the permanent update endpoint is immediately updated to point to that version. The newer build (1.6.0) is{' '}
          <strong>never deleted</strong>; it remains archived in release history for when you're ready to re-activate it.
        </div>
      </div>

      {/* Table */}
      <RecentReleasesTable
        releases={sortedReleases}
        onRollback={onRollback}
        onViewJson={onViewJson}
      />
    </div>
  );
};
