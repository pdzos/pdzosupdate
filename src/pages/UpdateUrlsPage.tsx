import React, { useState } from 'react';
import { AppRecord, SiteSettings } from '../types';
import { generatePermanentJsonPayload } from '../utils/storage';
import { useToast } from '../components/Toast';
import {
  Link2,
  Copy,
  Check,
  ExternalLink,
  Code,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Terminal,
  Sparkles
} from 'lucide-react';

interface UpdateUrlsPageProps {
  apps: AppRecord[];
  settings: SiteSettings;
  onViewJson: (payload: any) => void;
}

export const UpdateUrlsPage: React.FC<UpdateUrlsPageProps> = ({
  apps,
  settings,
  onViewJson
}) => {
  const { showToast } = useToast();
  const [copiedMap, setCopiedMap] = useState<Record<string, boolean>>({});
  const [selectedQrPackage, setSelectedQrPackage] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string, title = 'Copied') => {
    navigator.clipboard.writeText(text);
    setCopiedMap(prev => ({ ...prev, [id]: true }));
    showToast({ type: 'success', title });
    setTimeout(() => {
      setCopiedMap(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Link2 className="w-5 h-5 text-blue-400" />
          <span>Permanent Update Endpoints</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          These URLs never change when releasing new versions. Only the internal JSON payload updates.
        </p>
      </div>

      {/* Critical Core Concept Box */}
      <div className="p-5 rounded-2xl bg-[#0e111d] border border-blue-500/30 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-400 font-mono uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>Core Architectural Guarantee</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          {/* Wrong way */}
          <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-1.5">
            <div className="flex items-center gap-1.5 text-rose-400 font-bold">
              <XCircle className="w-4 h-4" />
              <span>WRONG (Version in URL)</span>
            </div>
            <code className="block bg-[#090a0f] p-2 rounded text-[11px] text-rose-300 break-all border border-rose-950">
              /api/com.hexos.zyra/1.6.0.json
            </code>
            <p className="text-[10px] text-slate-400 font-sans">
              Breaks client update check whenever you release v1.7.0. Client app has to be hardcoded with new URL.
            </p>
          </div>

          {/* Correct way */}
          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1.5">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>CORRECT (Permanent Endpoint)</span>
            </div>
            <code className="block bg-[#090a0f] p-2 rounded text-[11px] text-emerald-300 break-all border border-emerald-950">
              /api/com.hexos.zyra.json
            </code>
            <p className="text-[10px] text-slate-400 font-sans">
              Permanent and immutable. When v1.7.0 is released, Android apps query the same URL and automatically detect the new APK!
            </p>
          </div>
        </div>
      </div>

      {/* Endpoints List */}
      <div className="space-y-4">
        {apps.map((app) => {
          const endpointUrl = `${settings.apiBaseUrl}/${app.packageName}.json`;
          const curlSnippet = `curl -s "${endpointUrl}"`;
          const isCopiedUrl = copiedMap[app.id + '_url'];
          const isCopiedCurl = copiedMap[app.id + '_curl'];
          const activeRelease = app.releases.find(r => r.isCurrentActive) || app.releases[0];

          return (
            <div
              key={app.id}
              className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={app.icon}
                    alt={app.name}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=160&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div>
                    <h3 className="font-bold text-white text-sm flex items-center gap-2">
                      <span>{app.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        v{app.currentVersion} (code: {app.currentVersionCode})
                      </span>
                    </h3>
                    <p className="text-[11px] font-mono text-slate-400">
                      {app.packageName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const payload = generatePermanentJsonPayload(app);
                      onViewJson(payload);
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors"
                  >
                    <Code className="w-3.5 h-3.5 text-blue-400" />
                    <span>View JSON</span>
                  </button>

                  <button
                    onClick={() => setSelectedQrPackage(selectedQrPackage === app.packageName ? null : app.packageName)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs transition-colors"
                    title="Toggle QR Code preview for phone test"
                  >
                    <QrCode className="w-4 h-4 text-cyan-400" />
                  </button>
                </div>
              </div>

              {/* Endpoint URL Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-400 uppercase font-mono tracking-wider block">
                  Permanent HTTPS JSON Endpoint:
                </label>
                <div className="flex items-center gap-2 bg-[#090a0f] p-2.5 rounded-xl border border-slate-800 font-mono text-xs text-slate-200">
                  <span className="text-emerald-400 font-bold text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 select-none">
                    GET
                  </span>
                  <span className="truncate flex-1 select-all text-blue-300 font-medium">
                    {endpointUrl}
                  </span>
                  <button
                    onClick={() => copyToClipboard(endpointUrl, app.id + '_url', 'Permanent URL Copied')}
                    className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-xs flex items-center gap-1 transition-colors shrink-0"
                  >
                    {isCopiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy</span>
                  </button>
                  <a
                    href={endpointUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors shrink-0"
                    title="Open in Browser"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* cURL Snippet */}
              <div className="flex items-center gap-2 bg-[#08090e] px-3 py-1.5 rounded-lg border border-slate-900 font-mono text-[11px] text-slate-400">
                <Terminal className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="truncate flex-1 select-all">{curlSnippet}</span>
                <button
                  onClick={() => copyToClipboard(curlSnippet, app.id + '_curl', 'cURL Snippet Copied')}
                  className="hover:text-white transition-colors p-1"
                  title="Copy cURL"
                >
                  {isCopiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* QR Code preview drawer */}
              {selectedQrPackage === app.packageName && (
                <div className="p-4 rounded-xl bg-[#090b12] border border-blue-500/20 flex flex-col sm:flex-row items-center gap-4 animate-in fade-in">
                  <div className="p-2 bg-white rounded-xl shadow-lg shrink-0">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(endpointUrl)}`}
                      alt="Endpoint QR Code"
                      className="w-28 h-28"
                    />
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-300">
                    <h4 className="font-bold text-white flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-cyan-400" />
                      Scan on Android Phone
                    </h4>
                    <p className="text-slate-400 leading-relaxed text-[11px]">
                      Open the Camera app on your Android testing device and scan this QR code to view the live JSON response
                      directly on the phone browser.
                    </p>
                    <p className="text-[10px] font-mono text-cyan-400 truncate max-w-sm">
                      {endpointUrl}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
