import React, { useState } from 'react';
import { AppRecord } from '../types';
import { Copy, Check, ExternalLink, Plus, Settings2, Shield, Calendar, ArrowUpRight } from 'lucide-react';
import { useToast } from './Toast';

interface AppCardProps {
  app: AppRecord;
  apiBaseUrl: string;
  onManage: (app: AppRecord) => void;
  onNewRelease: (app: AppRecord) => void;
  onViewPublic: (packageName: string) => void;
}

export const AppCard: React.FC<AppCardProps> = ({
  app,
  apiBaseUrl,
  onManage,
  onNewRelease,
  onViewPublic
}) => {
  const { showToast } = useToast();
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Permanent update URL for this app
  const permanentUrl = `${apiBaseUrl}/${app.packageName}.json`;

  const copyUpdateUrl = () => {
    navigator.clipboard.writeText(permanentUrl);
    setCopiedUrl(true);
    showToast({
      type: 'success',
      title: 'Permanent Update URL Copied',
      message: permanentUrl
    });
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const channelBadgeStyles = {
    stable: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    beta: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    alpha: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  }[app.defaultChannel] || 'bg-slate-800 text-slate-300';

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col justify-between group relative overflow-hidden">
      {/* Top Bar: Icon + Titles + Channel */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-800 border border-slate-700/80 shrink-0 shadow-inner">
              <img
                src={app.icon}
                alt={app.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=160&auto=format&fit=crop&q=80';
                }}
              />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-white text-base truncate group-hover:text-blue-400 transition-colors">
                {app.name}
              </h3>
              <p className="text-[11px] font-mono text-slate-400 truncate max-w-[190px]">
                {app.packageName}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${channelBadgeStyles}`}>
              {app.defaultChannel}
            </span>
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              {app.status}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {app.description}
        </p>

        {/* Metric Badges */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-[#090a0f]/80 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
              Current Version
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-sm font-bold text-white font-mono">v{app.currentVersion}</span>
              <span className="text-[10px] font-mono text-slate-400">({app.currentVersionCode})</span>
            </div>
          </div>

          <div className="bg-[#090a0f]/80 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
              Releases
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-sm font-bold text-white font-mono">{app.releases.length}</span>
              <span className="text-[10px] text-slate-400">total</span>
            </div>
          </div>
        </div>

        {/* Permanent Update URL preview */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">
            <span>Permanent Endpoint</span>
            <span className="text-blue-400 font-mono text-[9px] lowercase">never changes</span>
          </div>
          <div className="flex items-center gap-2 bg-[#090a0f] px-3 py-1.5 rounded-lg border border-slate-800/80 text-[11px] font-mono text-slate-300">
            <span className="truncate flex-1 select-all">{permanentUrl}</span>
            <button
              onClick={copyUpdateUrl}
              className="text-slate-400 hover:text-blue-400 transition-colors p-0.5"
              title="Copy Permanent URL"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onManage(app)}
            className="px-2.5 py-1.5 bg-slate-800/60 hover:bg-slate-800 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700/50"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Manage</span>
          </button>
          <button
            onClick={() => onNewRelease(app)}
            className="px-2.5 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Release</span>
          </button>
        </div>

        <button
          onClick={() => onViewPublic(app.packageName)}
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition-colors flex items-center gap-1 text-xs"
          title="Open Public App Download Page"
        >
          <span className="text-[11px] hidden sm:inline">Public</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
