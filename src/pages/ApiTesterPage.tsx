import React, { useState } from 'react';
import { AppRecord, ChannelType, HexOSUpdatePayload } from '../types';
import { compareVersionCode, VersionComparisonResult } from '../utils/version';
import { generatePermanentJsonPayload } from '../utils/storage';
import { useToast } from '../components/Toast';
import {
  Terminal,
  Play,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  Download,
  Smartphone,
  ShieldAlert,
  ArrowRight,
  Code
} from 'lucide-react';

interface ApiTesterPageProps {
  apps: AppRecord[];
  apiBaseUrl: string;
}

export const ApiTesterPage: React.FC<ApiTesterPageProps> = ({
  apps,
  apiBaseUrl
}) => {
  const { showToast } = useToast();

  const [selectedPackage, setSelectedPackage] = useState<string>(
    apps[0]?.packageName || ''
  );
  const currentApp = apps.find(a => a.packageName === selectedPackage) || apps[0];

  const [installedCode, setInstalledCode] = useState<number>(
    currentApp ? Math.max(1, currentApp.currentVersionCode - 1) : 15
  );
  const [channel, setChannel] = useState<ChannelType>('stable');

  const [testResult, setTestResult] = useState<{
    comparison: VersionComparisonResult;
    payload: HexOSUpdatePayload;
    endpointUrl: string;
  } | null>(null);

  const [hasCopiedJson, setHasCopiedJson] = useState(false);

  const handleTest = () => {
    if (!currentApp) {
      showToast({ type: 'error', title: 'No application selected' });
      return;
    }

    const payload = generatePermanentJsonPayload(currentApp, channel);
    const comparison = compareVersionCode(installedCode, payload.update.versionCode);
    const endpointUrl = `${apiBaseUrl}/${currentApp.packageName}.json`;

    setTestResult({
      comparison,
      payload,
      endpointUrl,
    });

    showToast({
      type: comparison.hasUpdate ? 'info' : 'success',
      title: 'Update Check Completed',
      message: comparison.statusText,
    });
  };

  const copyJson = () => {
    if (!testResult) return;
    navigator.clipboard.writeText(JSON.stringify(testResult.payload, null, 2));
    setHasCopiedJson(true);
    showToast({ type: 'success', title: 'Response JSON Copied' });
    setTimeout(() => setHasCopiedJson(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Terminal className="w-5 h-5 text-cyan-400" />
          <span>API Tester & Android Update Simulator</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Simulate an Android client requesting an update check. Test integer versionCode comparison and dialog preview.
        </p>
      </div>

      {/* Simulator Inputs Form */}
      <div className="p-6 rounded-2xl bg-[#0e1019] border border-slate-800 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* App Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
              Target Application
            </label>
            <select
              value={selectedPackage}
              onChange={(e) => {
                setSelectedPackage(e.target.value);
                const app = apps.find(a => a.packageName === e.target.value);
                if (app) {
                  setInstalledCode(Math.max(1, app.currentVersionCode - 1));
                }
                setTestResult(null);
              }}
              className="w-full px-3.5 py-2.5 bg-[#121422] border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-blue-500"
            >
              {apps.map(app => (
                <option key={app.packageName} value={app.packageName}>
                  {app.name} ({app.packageName})
                </option>
              ))}
            </select>
          </div>

          {/* Installed Version Code */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center justify-between">
              <span>Client Installed Code</span>
              <span className="text-slate-500 text-[10px]">versionCode</span>
            </label>
            <input
              type="number"
              min="1"
              value={installedCode}
              onChange={(e) => setInstalledCode(parseInt(e.target.value) || 1)}
              className="w-full px-3.5 py-2.5 bg-[#121422] border border-slate-700 rounded-xl text-xs font-mono text-cyan-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Channel */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
              Channel Header / Query
            </label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value as ChannelType)}
              className="w-full px-3.5 py-2.5 bg-[#121422] border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-blue-500"
            >
              <option value="stable">Stable</option>
              <option value="beta">Beta</option>
              <option value="alpha">Alpha</option>
            </select>
          </div>
        </div>

        {/* Run Test Button */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-[11px] font-mono text-slate-400">
            Endpoint: <span className="text-blue-400">{apiBaseUrl}/{selectedPackage}.json</span>
          </div>

          <button
            onClick={handleTest}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-blue-600/25"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Test Update</span>
          </button>
        </div>
      </div>

      {/* Test Results Output */}
      {testResult && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Comparison Status Card */}
          <div className="p-6 rounded-2xl bg-[#0e1019] border border-slate-800 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                  Android Comparison Engine Result
                </span>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${testResult.comparison.badgeColor}`}>
                    {testResult.comparison.statusText}
                  </span>
                  {testResult.payload.update.forceUpdate && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      FORCE UPDATE MANDATORY
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="text-right">
                  <span className="text-slate-500 block text-[10px]">CLIENT INSTALLED</span>
                  <span className="font-bold text-slate-300">{testResult.comparison.installedCode}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600" />
                <div>
                  <span className="text-slate-500 block text-[10px]">SERVER LATEST</span>
                  <span className="font-bold text-cyan-400">{testResult.comparison.serverCode}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {testResult.comparison.message}
            </p>

            {/* Quick Spec Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-[#121422] border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Latest Version</span>
                <span className="text-sm font-bold text-white font-mono">v{testResult.payload.update.version}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#121422] border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-mono block">APK Target</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">Google Drive</span>
              </div>
              <div className="p-3 rounded-xl bg-[#121422] border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-mono block">File Size</span>
                <span className="text-sm font-bold text-white font-mono">{testResult.payload.update.fileSize}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#121422] border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Min Android</span>
                <span className="text-sm font-bold text-white font-mono">API {testResult.payload.update.minimumAndroid}+</span>
              </div>
            </div>
          </div>

          {/* Dual View: Android Dialog Simulator & Full JSON Response */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Visual Android Dialog Simulator */}
            <div className="p-5 rounded-2xl bg-[#0e1019] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <Smartphone className="w-4 h-4 text-blue-400" />
                  <span>Android Client UI Simulation</span>
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">Pixel Phone Preview</span>
              </div>

              {/* Simulated Phone Frame / Dialog */}
              <div className="p-6 rounded-2xl bg-[#090b12] border border-slate-800 shadow-inner flex flex-col items-center justify-center">
                {testResult.comparison.hasUpdate ? (
                  <div className="w-full max-w-sm bg-[#161928] border border-blue-500/30 rounded-2xl p-5 shadow-2xl space-y-3.5 animate-in zoom-in-95">
                    <div className="flex items-center gap-3">
                      <img
                        src={testResult.payload.app.icon}
                        alt="App"
                        className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                      />
                      <div>
                        <h4 className="font-bold text-white text-sm">
                          {testResult.payload.app.name} Update
                        </h4>
                        <p className="text-[11px] font-mono text-blue-400">
                          v{testResult.payload.update.version} is now available
                        </p>
                      </div>
                    </div>

                    {testResult.payload.update.forceUpdate && (
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px]">
                        <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                        <span>This critical security update is required to continue.</span>
                      </div>
                    )}

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        What's New:
                      </span>
                      <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside max-h-32 overflow-y-auto">
                        {testResult.payload.update.changelog.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-700/60">
                      {!testResult.payload.update.forceUpdate && (
                        <button
                          type="button"
                          className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                        >
                          Later
                        </button>
                      )}
                      <a
                        href={testResult.payload.update.apkUrl}
                        download={`${testResult.payload.app.packageName}-v${testResult.payload.update.version}.apk`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold tracking-wide flex items-center gap-1.5 shadow-md"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Update Now ({testResult.payload.update.fileSize})</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-8 space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                    <h4 className="font-bold text-white text-sm">Application is Up to Date</h4>
                    <p className="text-xs text-slate-400 max-w-xs">
                      The installed build (code {testResult.comparison.installedCode}) matches or exceeds server build ({testResult.comparison.serverCode}).
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Complete JSON Response Viewer */}
            <div className="p-5 rounded-2xl bg-[#0e1019] border border-slate-800 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <Code className="w-4 h-4 text-purple-400" />
                    <span>Permanent Endpoint JSON Response</span>
                  </h3>
                  <button
                    onClick={copyJson}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono flex items-center gap-1 transition-colors border border-slate-700"
                  >
                    {hasCopiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy JSON</span>
                  </button>
                </div>

                <pre className="p-4 rounded-xl bg-[#08090e] border border-slate-800/80 font-mono text-[11px] text-cyan-300 overflow-x-auto max-h-96 leading-relaxed">
                  {JSON.stringify(testResult.payload, null, 2)}
                </pre>
              </div>

              <div className="text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-800">
                HTTP 200 OK • Content-Type: application/json; charset=utf-8 • Cache-Control: no-cache
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
