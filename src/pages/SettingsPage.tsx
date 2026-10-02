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
  KeyRound,
  Trash2,
  Lock,
  Check,
  Sparkles
} from 'lucide-react';
import { downloadFile } from '../utils/githubExporter';
import { verifyPassword, updateAdminPassword } from '../utils/auth';

interface SettingsPageProps {
  settings: SiteSettings;
  apps: AppRecord[];
  onSaveSettings: (settings: SiteSettings) => void;
  onResetCleanSlate: () => void;
  onLoadDemoApps: () => void;
  onImportData: (apps: AppRecord[]) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  apps,
  onSaveSettings,
  onResetCleanSlate,
  onLoadDemoApps,
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

  // Password change state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passLoading, setPassLoading] = useState(false);

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
      siteName: siteName.trim() || 'PdzOS App Update',
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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPass) {
      showToast({ type: 'error', title: 'Please enter current password' });
      return;
    }
    if (newPass.length < 4) {
      showToast({ type: 'error', title: 'New password must be at least 4 characters' });
      return;
    }
    if (newPass !== confirmPass) {
      showToast({ type: 'error', title: 'New passwords do not match' });
      return;
    }

    setPassLoading(true);
    try {
      const isCurrentValid = await verifyPassword(currentPass);
      if (!isCurrentValid) {
        showToast({ type: 'error', title: 'Current password is incorrect' });
        setPassLoading(false);
        return;
      }

      await updateAdminPassword(newPass);
      showToast({ type: 'success', title: 'Admin Password Changed Successfully!' });
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
    } catch {
      showToast({ type: 'error', title: 'Failed to update password' });
    } finally {
      setPassLoading(false);
    }
  };

  const handleExportBackup = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      architecture: 'PdzOS Free Architecture',
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
      `pdzos-app-update-backup-${new Date().toISOString().split('T')[0]}.json`,
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
      } catch {
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
          <span>System & Security Settings</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure security password, custom domain, and clean slate data management.
        </p>
      </div>

      {/* Admin Password Security Form */}
      <div className="p-6 rounded-2xl bg-[#0e1019] border border-blue-500/30 space-y-4">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-cyan-400" />
          <span>Admin Password & Access Control</span>
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Change your dashboard login password. Protected with SHA-256 encryption.
        </p>

        <form onSubmit={handleChangePassword} className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300 font-mono">Current Password</label>
            <input
              type="password"
              required
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              placeholder="Current password..."
              className="w-full px-3 py-2 bg-[#121422] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300 font-mono">New Password</label>
            <input
              type="password"
              required
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="New password..."
              className="w-full px-3 py-2 bg-[#121422] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300 font-mono">Confirm New Password</label>
            <div className="flex gap-2">
              <input
                type="password"
                required
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="Confirm new password..."
                className="w-full px-3 py-2 bg-[#121422] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
              <button
                type="submit"
                disabled={passLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shrink-0 transition-colors shadow-md disabled:opacity-50"
              >
                {passLoading ? 'Saving...' : 'Update'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Main Settings Form */}
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
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                  Current / Custom Domain
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== 'undefined' && window.location.host) {
                      handleDomainChange(window.location.host);
                      showToast({ type: 'info', title: 'Auto-detected Live Domain', message: window.location.host });
                    }
                  }}
                  className="text-[10px] text-blue-400 hover:text-blue-300 font-mono underline"
                >
                  Auto-Detect Live Domain
                </button>
              </div>
              <input
                type="text"
                value={customDomain}
                onChange={(e) => handleDomainChange(e.target.value)}
                placeholder="pdzosupdate.pages.dev"
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
                placeholder="https://github.com/pdzos/pdzosupdate"
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

      {/* Data Management: Clean Slate & Backups */}
      <div className="p-6 rounded-2xl bg-[#0e1019] border border-slate-800 space-y-4">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-400" />
          <span>Data Storage & Clean Slate Management</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Clean Slate Button */}
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Wipe all apps and start with a 100% clean empty dashboard (0 apps)?')) {
                onResetCleanSlate();
                showToast({ type: 'info', title: 'Dashboard Cleared to Clean Slate' });
              }
            }}
            className="p-3 rounded-xl bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/30 text-left space-y-1 transition-colors"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
              <Trash2 className="w-4 h-4" />
              <span>Clean Slate (0 Apps)</span>
            </div>
            <p className="text-[10px] text-slate-400">Wipe all apps and remove any sample data.</p>
          </button>

          {/* Optional Load Sample Demo Apps */}
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Load sample apps for testing purposes?')) {
                onLoadDemoApps();
                showToast({ type: 'success', title: 'Sample Apps Loaded' });
              }
            }}
            className="p-3 rounded-xl bg-[#121422] hover:bg-[#181b2e] border border-slate-800 text-left space-y-1 transition-colors"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
              <Sparkles className="w-4 h-4" />
              <span>Load Sample Apps</span>
            </div>
            <p className="text-[10px] text-slate-400">Optional: Load 2 sample apps for test.</p>
          </button>

          {/* Export Backup */}
          <button
            type="button"
            onClick={handleExportBackup}
            className="p-3 rounded-xl bg-[#121422] hover:bg-[#181b2e] border border-slate-800 text-left space-y-1 transition-colors"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
              <Download className="w-4 h-4" />
              <span>Export Backup</span>
            </div>
            <p className="text-[10px] text-slate-400">Download metadata backup JSON.</p>
          </button>

          {/* Import Backup */}
          <label className="p-3 rounded-xl bg-[#121422] hover:bg-[#181b2e] border border-slate-800 text-left space-y-1 transition-colors cursor-pointer block">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <Upload className="w-4 h-4" />
              <span>Import Backup</span>
            </div>
            <p className="text-[10px] text-slate-400">Restore your JSON backup.</p>
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
};
