import React, { useState } from 'react';
import { SiteSettings, ChannelType, AppRecord } from '../types';
import { useToast } from '../components/Toast';
import {
  Settings,
  Globe,
  GitBranch,
  Shield,
  Smartphone,
  Save,
  RotateCcw,
  Download,
  Upload,
  AlertTriangle,
  Lock
} from 'lucide-react';
import { downloadFile } from '../utils/githubExporter';

interface SettingsPageProps {
  settings: SiteSettings;
  apps: AppRecord[];
  onSaveSettings: (settings: SiteSettings) => void;
  onResetDemoData: () => void;
  onImportData: (apps: AppRecord[]) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  apps,
  onSaveSettings,
  onResetDemoData,
  onImportData
}) => {
  const { showToast } = useToast();

  const [siteName, setSiteName] = useState(settings.siteName);
  const [customDomain, setCustomDomain] = useState(settings.customDomain);
  const [apiBaseUrl, setApiBaseUrl] = useState(settings.apiBaseUrl);
  const [githubRepo, setGithubRepo] = useState(settings.githubRepo);
  const [githubBranch, setGithubBranch] = useState(settings.githubBranch);
  const [defaultChannel, setDefaultChannel] = useState<ChannelType>(settings.defaultChannel);
  const [defaultAndroidVersion, setDefaultAndroidVersion] = useState<number>(settings.defaultAndroidVersion);
  const [publicPagesEnabled, setPublicPagesEnabled] = useState(settings.publicPagesEnabled);

  const handleDomainChange = (domain: string) => {
    setCustomDomain(domain);
    const cleaned = domain.trim().replace(/^https?:\/\//, '').replace(/\/+$/, '');
    if (cleaned) {
      setApiBaseUrl(`https://${cleaned}/api`);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: SiteSettings = {
      siteName: siteName.trim() || 'HexOS Update Center',
      customDomain: customDomain.trim(),
      apiBaseUrl: apiBaseUrl.trim(),
      githubRepo: githubRepo.trim(),
      githubBranch: githubBranch.trim() || 'main',
      defaultChannel,
      defaultAndroidVersion,
      publicPagesEnabled,
      googleDriveFallbackAdvice: true,
    };

    onSaveSettings(updated);
    showToast({ type: 'success', title: 'Settings Saved', message: 'Domain and base URLs updated.' });
  };

  const handleExportBackup = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      architecture: 'HexOS Free Architecture',
      apps,
      settings: {
        siteName,
        customDomain,
        apiBaseUrl,
        githubRepo,
        githubBranch,
        defaultChannel,
        defaultAndroidVersion,
        publicPagesEnabled
      }
    };
    downloadFile(
      `hexos-update-center-backup-${new Date().toISOString().split('T')[0]}.json`,
      JSON.stringify(backupData, null, 2)
    );
    showToast({ type: 'success', title: 'Backup Downloaded' });
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.apps && Array.isArray(parsed.apps)) {
          onImportData(parsed.apps);
          showToast({ type: 'success', title: 'Data Restored Successfully', message: `Imported ${parsed.apps.length} apps.` });
        } else {
          showToast({ type: 'error', title: 'Invalid backup JSON file' });
        }
      } catch (err) {
        showToast({ type: 'error', title: 'Failed to parse JSON file' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-400" />
          <span>System & Architecture Settings</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure domain endpoints, GitHub repository linkage, and public portal visibility.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Domain & Endpoints */}
        <div className="p-6 rounded-2xl bg-[#0e1019] border border-slate-800 space-y-4">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>Permanent Domain Configuration</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                Site / Dashboard Name
              </label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#121422] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                Custom Domain (e.g. updates.hexos.in)
              </label>
              <input
                type="text"
                value={customDomain}
                onChange={(e) => handleDomainChange(e.target.value)}
                placeholder="updates.hexos.in or YOUR-APP.pages.dev"
                className="w-full px-3.5 py-2.5 bg-[#121422] border border-slate-700 rounded-xl text-xs font-mono text-cyan-300 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                API Base URL
              </label>
              <input
                type="url"
                value={apiBaseUrl}
                onChange={(e) => setApiBaseUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#121422] border border-slate-700 rounded-xl text-xs font-mono text-blue-300 focus:outline-none focus:border-blue-500"
              />
              <p className="text-[10px] text-slate-500 font-mono">
                Example permanent endpoint: <code className="text-slate-400">{apiBaseUrl}/com.hexos.zyra.json</code>
              </p>
            </div>
          </div>
        </div>

        {/* GitHub Free Metadata Integration */}
        <div className="p-6 rounded-2xl bg-[#0e1019] border border-slate-800 space-y-4">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-emerald-400" />
            <span>GitHub Metadata Repository</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                GitHub Repository URL
              </label>
              <input
                type="url"
                value={githubRepo}
                onChange={(e) => setGithubRepo(e.target.value)}
                placeholder="https://github.com/hexos-team/hexos-updates"
                className="w-full px-3.5 py-2.5 bg-[#121422] border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                Repository Branch
              </label>
              <input
                type="text"
                value={githubBranch}
                onChange={(e) => setGithubBranch(e.target.value)}
                placeholder="main"
                className="w-full px-3.5 py-2.5 bg-[#121422] border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Security Notice: Section 36 */}
          <div className="p-3.5 rounded-xl bg-[#121422] border border-slate-800 flex items-start gap-2.5 text-[11px] text-slate-400">
            <Lock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <span>
              <strong>Zero Credential Storage Guarantee:</strong> Personal Access Tokens and passwords are never requested or stored
              in frontend code or client browser storage. Sync your JSON files directly via git commits or GitHub Actions.
            </span>
          </div>
        </div>

        {/* Global App Defaults */}
        <div className="p-6 rounded-2xl bg-[#0e1019] border border-slate-800 space-y-4">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-purple-400" />
            <span>Application Defaults</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase font-mono">
                Default Channel
              </label>
              <select
                value={defaultChannel}
                onChange={(e) => setDefaultChannel(e.target.value as ChannelType)}
                className="w-full px-3 py-2 bg-[#121422] border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-blue-500"
              >
                <option value="stable">Stable</option>
                <option value="beta">Beta</option>
                <option value="alpha">Alpha</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase font-mono">
                Default Minimum Android API
              </label>
              <select
                value={defaultAndroidVersion}
                onChange={(e) => setDefaultAndroidVersion(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-[#121422] border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-blue-500"
              >
                <option value={24}>Android 7.0 (API 24)</option>
                <option value={26}>Android 8.0 (API 26)</option>
                <option value={28}>Android 9.0 (API 28)</option>
                <option value={30}>Android 11 (API 30)</option>
                <option value={33}>Android 13 (API 33)</option>
                <option value={34}>Android 14 (API 34)</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={publicPagesEnabled}
                onChange={(e) => setPublicPagesEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-slate-800 border-slate-700"
              />
              <span className="text-xs text-slate-300 font-medium">
                Enable Public App Download Portals (<code className="text-blue-400 font-mono text-[11px]">/apps/:packageName</code>)
              </span>
            </label>
          </div>
        </div>

        {/* Save Settings Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>

      {/* Data Management: Backup & Restore & Demo Seed */}
      <div className="p-6 rounded-2xl bg-[#0e1019] border border-slate-800 space-y-4">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-400" />
          <span>Data Backup, Restore & Demo Reset</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={handleExportBackup}
            className="p-3 rounded-xl bg-[#121422] hover:bg-[#181b2e] border border-slate-800 text-left space-y-1 transition-colors"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
              <Download className="w-4 h-4" />
              <span>Export Full Backup</span>
            </div>
            <p className="text-[10px] text-slate-400">Download complete app and release metadata as JSON.</p>
          </button>

          <label className="p-3 rounded-xl bg-[#121422] hover:bg-[#181b2e] border border-slate-800 text-left space-y-1 transition-colors cursor-pointer block">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <Upload className="w-4 h-4" />
              <span>Import Backup</span>
            </div>
            <p className="text-[10px] text-slate-400">Upload and restore your exported metadata JSON.</p>
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('Reset all apps and releases to the original seed demo data (ZYRA, WinArt, Tredmpt, etc.)?')) {
                onResetDemoData();
                showToast({ type: 'info', title: 'Reset to Demo Data Completed' });
              }
            }}
            className="p-3 rounded-xl bg-[#121422] hover:bg-[#181b2e] border border-slate-800 text-left space-y-1 transition-colors"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <RotateCcw className="w-4 h-4" />
              <span>Reset to Demo Data</span>
            </div>
            <p className="text-[10px] text-slate-400">Restore factory sample apps (ZYRA, WinArt, Tredmpt).</p>
          </button>
        </div>
      </div>
    </div>
  );
};
