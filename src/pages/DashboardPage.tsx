import React from 'react';
import { AppRecord, ReleaseInfo, SiteSettings } from '../types';
import { RecentReleasesTable } from '../components/RecentReleasesTable';
import {
  Layers,
  Sparkles,
  Link2,
  CheckCircle2,
  Clock,
  PlusCircle,
  Terminal,
  DownloadCloud,
  HardDrive,
  GitBranch,
  ArrowRight
} from 'lucide-react';

interface DashboardPageProps {
  apps: AppRecord[];
  settings: SiteSettings;
  onNavigate: (tab: any) => void;
  onSelectApp: (app: AppRecord) => void;
  onRollback: (packageName: string, releaseId: string, version: string) => void;
  onViewJson: (release: ReleaseInfo) => void;
  onExportGitHub: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  apps,
  settings,
  onNavigate,
  onSelectApp,
  onRollback,
  onViewJson,
  onExportGitHub
}) => {
  // Aggregate stats
  const totalApps = apps.length;
  const activeApps = apps.filter(a => a.status === 'active').length;
  const allReleases = apps.flatMap(a =>
    a.releases.map(r => ({ ...r, appName: a.name, appIcon: a.icon }))
  );
  const totalReleases = allReleases.length;

  // Sort releases by date desc
  const sortedReleases = [...allReleases].sort(
    (a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
  );
  const latestRelease = sortedReleases[0];
  const lastUpdated = latestRelease?.releaseDate || 'N/A';

  return (
    <div className="space-y-6">
      {/* Top Banner / Architecture Notice */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950/40 via-[#111424] to-[#0c0e17] border border-blue-500/20 p-6 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              FREE ARCHITECTURE — ZERO PAID SERVICES
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
              One Permanent Endpoint. Unlimited Zero-Cost Updates.
            </h1>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Every Android app uses a permanent URL that never changes (e.g.{' '}
              <code className="text-blue-400 font-mono px-1 py-0.5 bg-black/40 rounded border border-blue-900/50">
                /api/{latestRelease?.appPackageName || 'com.pdzos.app'}.json
              </code>
              ). APKs are hosted on Google Drive, metadata in GitHub JSON.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigate('add-app')}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold tracking-wide flex items-center gap-1.5 transition-all shadow-lg shadow-blue-600/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add New App</span>
            </button>
            <button
              onClick={onExportGitHub}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold tracking-wide flex items-center gap-1.5 transition-all"
            >
              <GitBranch className="w-4 h-4 text-cyan-400" />
              <span>Export GitHub JSON</span>
            </button>
          </div>
        </div>

        {/* Ambient subtle light */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Card 1: Total Apps */}
        <div className="glass-card p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">Total Apps</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{totalApps}</div>
          <div className="text-[10px] text-slate-500 font-mono">Installed packages</div>
        </div>

        {/* Card 2: Active Apps */}
        <div className="glass-card p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">Active Apps</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{activeApps}</div>
          <div className="text-[10px] text-slate-500 font-mono">Serving updates</div>
        </div>

        {/* Card 3: Total Releases */}
        <div className="glass-card p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">Total Releases</span>
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{totalReleases}</div>
          <div className="text-[10px] text-slate-500 font-mono">Historical versions</div>
        </div>

        {/* Card 4: Latest Release */}
        <div className="glass-card p-4 rounded-xl space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">Latest Release</span>
            <HardDrive className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-base font-bold text-cyan-400 truncate">
            {latestRelease ? `${latestRelease.appName} ${latestRelease.version}` : 'None'}
          </div>
          <div className="text-[10px] text-slate-500 font-mono truncate">
            code: {latestRelease?.versionCode || '-'}
          </div>
        </div>

        {/* Card 5: API Endpoints */}
        <div className="glass-card p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">Endpoints</span>
            <Link2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-400 font-mono">{totalApps}</div>
          <div className="text-[10px] text-slate-500 font-mono">Permanent JSON URLs</div>
        </div>

        {/* Card 6: Last Updated */}
        <div className="glass-card p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">Last Updated</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-sm font-bold text-white font-mono truncate mt-1">
            {lastUpdated}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">Server synchronized</div>
        </div>
      </div>

      {/* Quick Flow Visualization */}
      <div className="p-4 rounded-2xl bg-[#0b0d15] border border-slate-800 text-xs">
        <div className="flex items-center justify-between mb-3 text-slate-400 font-semibold uppercase font-mono text-[10px] tracking-wider">
          <span>PdzOS Update Architecture Flow</span>
          <span className="text-emerald-400">STATUS: HEALTHY</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-xl bg-[#11131c] border border-slate-800/80">
            <div className="text-blue-400 font-bold font-mono text-xs">1. CLOUDFLARE PAGES</div>
            <p className="text-[11px] text-slate-400 mt-1">Hosts dashboard & permanent endpoints</p>
          </div>
          <div className="p-3 rounded-xl bg-[#11131c] border border-slate-800/80">
            <div className="text-cyan-400 font-bold font-mono text-xs">2. GITHUB REPO</div>
            <p className="text-[11px] text-slate-400 mt-1">Free metadata storage in JSON files</p>
          </div>
          <div className="p-3 rounded-xl bg-[#11131c] border border-slate-800/80">
            <div className="text-emerald-400 font-bold font-mono text-xs">3. GOOGLE DRIVE</div>
            <p className="text-[11px] text-slate-400 mt-1">Stores APK binaries with shareable link</p>
          </div>
          <div className="p-3 rounded-xl bg-[#11131c] border border-slate-800/80">
            <div className="text-purple-400 font-bold font-mono text-xs">4. ANDROID APP</div>
            <p className="text-[11px] text-slate-400 mt-1">Queries permanent URL & downloads update</p>
          </div>
        </div>
      </div>

      {/* Recent Releases Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Recent Releases</h2>
            <p className="text-xs text-slate-400">All published Android builds across channels</p>
          </div>
          {totalReleases > 0 && (
            <button
              onClick={() => onNavigate('releases')}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
            >
              <span>View All ({totalReleases})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {totalApps === 0 ? (
          <div className="p-8 text-center bg-[#0d0f17] border border-slate-800 rounded-2xl space-y-4">
            <Layers className="w-12 h-12 text-slate-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">No Applications Registered Yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Your update center is clean with zero demo data. Click below to register your first Android application and generate its permanent update URL.
              </p>
            </div>
            <button
              onClick={() => onNavigate('add-app')}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 shadow-lg shadow-blue-600/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Your First App</span>
            </button>
          </div>
        ) : (
          <RecentReleasesTable
            releases={sortedReleases.slice(0, 8)}
            onRollback={onRollback}
            onViewJson={onViewJson}
          />
        )}
      </div>
    </div>
  );
};
