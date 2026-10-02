import React from 'react';
import { AppRecord, ReleaseInfo } from '../types';
import { toDirectDownloadUrl } from '../utils/googleDrive';
import { Download, ArrowLeft, Calendar, HardDrive, Smartphone, ShieldCheck, CheckCircle2, ExternalLink } from 'lucide-react';
import { HexLogo } from '../components/HexLogo';

interface PublicAppPageProps {
  app: AppRecord;
  onBack: () => void;
}

export const PublicAppPage: React.FC<PublicAppPageProps> = ({ app, onBack }) => {
  const activeRelease: ReleaseInfo | undefined =
    app.releases.find(r => r.isCurrentActive) || app.releases[0];

  const historicalReleases = app.releases.filter(r => r.id !== activeRelease?.id);

  const getAndroidName = (api: number) => {
    const map: Record<number, string> = {
      24: 'Android 7.0 (Nougat)',
      26: 'Android 8.0 (Oreo)',
      28: 'Android 9.0 (Pie)',
      29: 'Android 10',
      30: 'Android 11',
      31: 'Android 12',
      33: 'Android 13 (Tiramisu)',
      34: 'Android 14 (Upside Down Cake)',
      35: 'Android 15',
    };
    return map[api] || `Android API ${api}+`;
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 font-sans selection:bg-blue-600 selection:text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation / Header */}
        <div className="flex items-center justify-between py-2 border-b border-slate-800">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </button>

          <HexLogo size="sm" withText={true} />
        </div>

        {/* Hero Card */}
        <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#121524] via-[#0e101b] to-[#0a0b12] border border-blue-500/20 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start md:items-center gap-5">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden bg-slate-800 border-2 border-slate-700/80 shrink-0 shadow-xl">
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

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                    {app.name}
                  </h1>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Official Release
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-400">{app.packageName}</p>
                <p className="text-xs text-slate-300 max-w-xl pt-1 leading-relaxed">
                  {app.description}
                </p>
                <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
                  <span>By <strong className="text-white">{app.developer}</strong></span>
                  {app.website && (
                    <a
                      href={app.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      <span>Website</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Direct Download Button */}
            {activeRelease && (
              <div className="flex flex-col gap-2 shrink-0">
                <a
                  href={toDirectDownloadUrl(activeRelease.directDownloadUrl || activeRelease.apkUrl)}
                  download={`${app.packageName}-v${activeRelease.version}.apk`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-2xl font-bold text-sm tracking-wide flex items-center justify-center gap-2.5 transition-all shadow-xl shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Download className="w-5 h-5" />
                  <span>Download APK ({activeRelease.fileSize})</span>
                </a>
                <span className="text-[10px] text-center text-slate-400 font-mono">
                  Hosted on Google Drive • Direct Download
                </span>
              </div>
            )}
          </div>

          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Quick Specs Grid */}
        {activeRelease && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-[#0e1019] border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Version</span>
              <div className="text-base font-bold text-white font-mono">v{activeRelease.version}</div>
              <span className="text-[10px] text-slate-400 font-mono">code: {activeRelease.versionCode}</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0e1019] border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Required Android</span>
              <div className="text-base font-bold text-white font-mono">
                {getAndroidName(activeRelease.minimumAndroid)}
              </div>
              <span className="text-[10px] text-slate-400 font-mono">API {activeRelease.minimumAndroid}+</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0e1019] border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Release Date</span>
              <div className="text-base font-bold text-white font-mono">{activeRelease.releaseDate}</div>
              <span className="text-[10px] text-emerald-400 font-mono">Verified build</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0e1019] border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Channel</span>
              <div className="text-base font-bold text-cyan-400 font-mono uppercase">{activeRelease.channel}</div>
              <span className="text-[10px] text-slate-400 font-mono">Continuous delivery</span>
            </div>
          </div>
        )}

        {/* What's New in this Version */}
        {activeRelease && (
          <div className="p-6 rounded-2xl bg-[#0e1019] border border-slate-800 space-y-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>What's New in Version {activeRelease.version}</span>
            </h2>
            <ul className="space-y-2 text-xs text-slate-300">
              {activeRelease.changelog.map((c, i) => (
                <li key={i} className="flex items-start gap-2 bg-[#121422] p-2.5 rounded-xl border border-slate-800/80">
                  <span className="text-blue-400 font-bold">•</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Installation Instructions */}
        <div className="p-5 rounded-2xl bg-[#0e1019] border border-slate-800 text-xs text-slate-300 space-y-2.5">
          <h3 className="font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
            <Smartphone className="w-4 h-4 text-purple-400" />
            <span>How to Install on Android</span>
          </h3>
          <ol className="list-decimal list-inside space-y-1.5 text-slate-400 text-[11px] leading-relaxed">
            <li>Click <strong>Download APK</strong> above to download the APK binary from Google Drive.</li>
            <li>When prompt appears on Android, tap <strong>Open</strong> or find the file in your <em>Downloads</em> folder.</li>
            <li>If prompted with "Install unknown apps", grant permission to your browser or file manager.</li>
            <li>Tap <strong>Install</strong> to complete the application installation.</li>
          </ol>
        </div>

        {/* Historical Releases */}
        {historicalReleases.length > 0 && (
          <div className="p-6 rounded-2xl bg-[#0e1019] border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-slate-400" />
              <span>Previous Version Archives</span>
            </h2>
            <div className="space-y-2">
              {historicalReleases.map(rel => (
                <div
                  key={rel.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#121422] border border-slate-800 text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold font-mono text-white">v{rel.version}</span>
                    <span className="text-[11px] text-slate-400 ml-2 font-mono">Released {rel.releaseDate}</span>
                  </div>
                  <a
                    href={rel.directDownloadUrl || rel.apkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>APK ({rel.fileSize})</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
