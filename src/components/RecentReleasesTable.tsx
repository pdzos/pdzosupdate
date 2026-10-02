import React, { useState } from 'react';
import { ReleaseInfo, AppRecord } from '../types';
import { toDirectDownloadUrl } from '../utils/googleDrive';
import { Download, RotateCcw, Code, ExternalLink, ShieldAlert, CheckCircle, Copy } from 'lucide-react';
import { useToast } from './Toast';

interface RecentReleasesTableProps {
  releases: (ReleaseInfo & { appName: string; appIcon: string })[];
  onRollback: (packageName: string, releaseId: string, version: string) => void;
  onViewJson: (release: ReleaseInfo) => void;
}

export const RecentReleasesTable: React.FC<RecentReleasesTableProps> = ({
  releases,
  onRollback,
  onViewJson,
}) => {
  const { showToast } = useToast();

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    showToast({ type: 'success', title: 'APK URL Copied to Clipboard' });
  };

  if (!releases.length) {
    return (
      <div className="p-8 text-center text-slate-500 bg-[#0e1019] rounded-2xl border border-slate-800">
        No releases found. Create your first release!
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-800/80 bg-[#0e1019]">
      <table className="w-full text-left text-xs">
        <thead className="bg-[#131622] text-slate-400 border-b border-slate-800 uppercase font-mono text-[10px] tracking-wider">
          <tr>
            <th className="py-3 px-4">App</th>
            <th className="py-3 px-4">Package</th>
            <th className="py-3 px-4">Version</th>
            <th className="py-3 px-4">Version Code</th>
            <th className="py-3 px-4">Channel</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Release Date</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {releases.map((rel) => {
            const isGoogleDrive = rel.apkUrl.includes('drive.google.com');

            return (
              <tr key={rel.id} className="hover:bg-slate-800/30 transition-colors">
                {/* App */}
                <td className="py-3 px-4 font-semibold text-white flex items-center gap-2.5">
                  <img
                    src={rel.appIcon}
                    alt={rel.appName}
                    className="w-6 h-6 rounded-md object-cover border border-slate-700 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=160&auto=format&fit=crop&q=80';
                    }}
                  />
                  <span>{rel.appName}</span>
                </td>

                {/* Package */}
                <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                  {rel.appPackageName}
                </td>

                {/* Version */}
                <td className="py-3 px-4 font-mono font-bold text-white">
                  v{rel.version}
                  {rel.forceUpdate && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-[9px] bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded font-sans uppercase">
                      FORCE
                    </span>
                  )}
                </td>

                {/* Version Code */}
                <td className="py-3 px-4 font-mono text-cyan-400 font-semibold">
                  {rel.versionCode}
                </td>

                {/* Channel */}
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold border ${
                      rel.channel === 'stable'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : rel.channel === 'beta'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                    }`}
                  >
                    {rel.channel}
                  </span>
                </td>

                {/* Status */}
                <td className="py-3 px-4">
                  {rel.isCurrentActive ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 font-mono">
                      <CheckCircle className="w-3.5 h-3.5" />
                      ACTIVE
                    </span>
                  ) : (
                    <span className="text-slate-500 font-mono text-[11px]">ARCHIVED</span>
                  )}
                </td>

                {/* Release Date */}
                <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                  {rel.releaseDate}
                </td>

                {/* Actions */}
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {/* View JSON */}
                    <button
                      onClick={() => onViewJson(rel)}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                      title="Inspect Release JSON"
                    >
                      <Code className="w-3.5 h-3.5" />
                    </button>

                    {/* Copy APK link */}
                    <button
                      onClick={() => handleCopyLink(toDirectDownloadUrl(rel.directDownloadUrl || rel.apkUrl))}
                      className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded transition-colors"
                      title="Copy Direct APK Link"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {/* Download test */}
                    <a
                      href={toDirectDownloadUrl(rel.directDownloadUrl || rel.apkUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded transition-colors"
                      title="Direct Download APK / Test Link"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>

                    {/* Rollback button: if not current active, allow making it active */}
                    {!rel.isCurrentActive && (
                      <button
                        onClick={() => onRollback(rel.appPackageName, rel.id, rel.version)}
                        className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded text-[10px] font-mono flex items-center gap-1 transition-colors"
                        title="Rollback active permanent endpoint to this version"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Rollback
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
