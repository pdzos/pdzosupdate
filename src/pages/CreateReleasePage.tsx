import React, { useState, useEffect } from 'react';
import { AppRecord, ReleaseInfo, ChannelType } from '../types';
import { GoogleDriveValidator } from '../components/GoogleDriveValidator';
import { validateVersionString } from '../utils/version';
import { useToast } from '../components/Toast';
import {
  Sparkles,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  HardDrive,
  Calendar,
  Layers,
  FileCode,
  Plus,
  Trash2
} from 'lucide-react';

interface CreateReleasePageProps {
  apps: AppRecord[];
  initialApp?: AppRecord | null;
  onSaveRelease: (packageName: string, release: ReleaseInfo, makeActive: boolean) => void;
  onCancel: () => void;
}

export const CreateReleasePage: React.FC<CreateReleasePageProps> = ({
  apps,
  initialApp,
  onSaveRelease,
  onCancel
}) => {
  const { showToast } = useToast();

  const [selectedPackage, setSelectedPackage] = useState<string>(
    initialApp?.packageName || (apps[0]?.packageName || '')
  );

  const currentApp = apps.find(a => a.packageName === selectedPackage);

  const [version, setVersion] = useState(
    currentApp ? getSuggestedNextVersion(currentApp.currentVersion) : '1.1.0'
  );
  const [versionCode, setVersionCode] = useState(
    currentApp ? currentApp.currentVersionCode + 1 : 2
  );
  const [channel, setChannel] = useState<ChannelType>('stable');
  const [apkSource, setApkSource] = useState<'gdrive' | 'direct'>('gdrive');
  const [apkUrl, setApkUrl] = useState('');
  const [directDownloadUrl, setDirectDownloadUrl] = useState('');
  const [fileSize, setFileSize] = useState('45 MB');
  const [minimumAndroid, setMinimumAndroid] = useState(
    currentApp?.minimumAndroid || 26
  );
  const [releaseDate, setReleaseDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [forceUpdate, setForceUpdate] = useState(false);
  const [changelogItems, setChangelogItems] = useState<string[]>([
    'Performance enhancements and stability fixes',
    'Optimized battery consumption in background'
  ]);
  const [newChangelogInput, setNewChangelogInput] = useState('');

  // Update defaults when app selection changes
  useEffect(() => {
    if (currentApp) {
      setVersion(getSuggestedNextVersion(currentApp.currentVersion));
      setVersionCode(currentApp.currentVersionCode + 1);
      setMinimumAndroid(currentApp.minimumAndroid);
      setChannel(currentApp.defaultChannel);
    }
  }, [selectedPackage, currentApp]);

  function getSuggestedNextVersion(current: string): string {
    const parts = current.split('.');
    if (parts.length >= 3 && !isNaN(parseInt(parts[2]))) {
      const patch = parseInt(parts[2]) + 1;
      return `${parts[0]}.${parts[1]}.${patch}`;
    } else if (parts.length === 2 && !isNaN(parseInt(parts[1]))) {
      return `${parts[0]}.${parseInt(parts[1]) + 1}.0`;
    }
    return '1.0.1';
  }

  const handleAddChangelogItem = () => {
    if (!newChangelogInput.trim()) return;
    setChangelogItems(prev => [...prev, newChangelogInput.trim()]);
    setNewChangelogInput('');
  };

  const handleRemoveChangelogItem = (index: number) => {
    setChangelogItems(prev => prev.filter((_, i) => i !== index));
  };

  const handlePublish = (status: 'published' | 'draft') => {
    if (!currentApp) {
      showToast({ type: 'error', title: 'Please select an application' });
      return;
    }

    const verValidation = validateVersionString(version);
    if (!verValidation.isValid) {
      showToast({ type: 'error', title: 'Invalid Version Name', message: verValidation.error });
      return;
    }

    if (versionCode <= 0) {
      showToast({ type: 'error', title: 'Version Code must be a positive integer (> 0)' });
      return;
    }

    if (!apkUrl.trim()) {
      showToast({
        type: 'warning',
        title: 'APK Link Missing',
        message: 'Please provide a Google Drive sharing link or direct APK URL.'
      });
      return;
    }

    if (changelogItems.length === 0 && status === 'published') {
      showToast({ type: 'warning', title: 'Changelog required for published releases' });
      return;
    }

    const newRelease: ReleaseInfo = {
      id: 'rel-' + Date.now(),
      appPackageName: currentApp.packageName,
      version: version.trim(),
      versionCode: Number(versionCode),
      apkUrl: apkUrl.trim(),
      apkSource,
      directDownloadUrl: directDownloadUrl.trim() || apkUrl.trim(),
      fileSize: fileSize.trim() || '45 MB',
      minimumAndroid: Number(minimumAndroid),
      forceUpdate,
      channel,
      releaseDate,
      changelog: changelogItems,
      status,
      isCurrentActive: status === 'published',
    };

    onSaveRelease(currentApp.packageName, newRelease, status === 'published');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span>Create New Android Release</span>
            </h1>
            <p className="text-xs text-slate-400">
              Publishing updates the permanent endpoint without breaking existing installs.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-[#0e1019] border border-slate-800 space-y-6">
        {/* App Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>Select Target Application</span>
          </label>
          <select
            value={selectedPackage}
            onChange={(e) => setSelectedPackage(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#121422] border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-blue-500"
          >
            {apps.map(app => (
              <option key={app.packageName} value={app.packageName}>
                {app.name} ({app.packageName}) — Current v{app.currentVersion} (code: {app.currentVersionCode})
              </option>
            ))}
          </select>
        </div>

        {/* Version Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* Version Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase font-mono">
              Version Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="e.g. 1.6.0"
              className="w-full px-3 py-2.5 bg-[#121422] border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Version Code */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase font-mono">
              Version Code (Int) <span className="text-rose-400">*</span>
            </label>
            <input
              type="number"
              min="1"
              required
              value={versionCode}
              onChange={(e) => setVersionCode(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2.5 bg-[#121422] border border-slate-700 rounded-xl text-xs font-mono text-cyan-400 focus:outline-none focus:border-blue-500"
            />
            {currentApp && versionCode <= currentApp.currentVersionCode && (
              <p className="text-[10px] text-amber-400 font-mono">
                Warning: Should be &gt; current ({currentApp.currentVersionCode})
              </p>
            )}
          </div>

          {/* Release Channel */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase font-mono">
              Release Channel
            </label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value as ChannelType)}
              className="w-full px-3 py-2.5 bg-[#121422] border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-blue-500"
            >
              <option value="stable">Stable (Production)</option>
              <option value="beta">Beta (Preview)</option>
              <option value="alpha">Alpha (Experimental)</option>
            </select>
          </div>

          {/* File Size */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase font-mono">
              File Size
            </label>
            <input
              type="text"
              value={fileSize}
              onChange={(e) => setFileSize(e.target.value)}
              placeholder="e.g. 52 MB"
              className="w-full px-3 py-2.5 bg-[#121422] border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* APK Source & Google Drive Validator */}
        <div className="space-y-3 pt-3 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-emerald-400" />
              <span>APK Binary Storage (Google Drive / Direct URL)</span>
            </label>

            {/* Radio APK Source */}
            <div className="flex items-center gap-3 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                <input
                  type="radio"
                  name="apkSource"
                  checked={apkSource === 'gdrive'}
                  onChange={() => setApkSource('gdrive')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span>Google Drive</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                <input
                  type="radio"
                  name="apkSource"
                  checked={apkSource === 'direct'}
                  onChange={() => setApkSource('direct')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span>Direct URL</span>
              </label>
            </div>
          </div>

          <GoogleDriveValidator
            url={apkUrl}
            onChange={setApkUrl}
            onDirectUrlChange={setDirectDownloadUrl}
          />
        </div>

        {/* System & Policy Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-800">
          {/* Minimum Android SDK */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase font-mono">
              Min Android Version
            </label>
            <select
              value={minimumAndroid}
              onChange={(e) => setMinimumAndroid(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-[#121422] border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-blue-500"
            >
              <option value={24}>Android 7.0 (API 24)</option>
              <option value={26}>Android 8.0 Oreo (API 26)</option>
              <option value={28}>Android 9.0 Pie (API 28)</option>
              <option value={30}>Android 11 (API 30)</option>
              <option value={33}>Android 13 (API 33)</option>
              <option value={34}>Android 14 (API 34)</option>
              <option value={35}>Android 15 (API 35)</option>
            </select>
          </div>

          {/* Release Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase font-mono">
              Release Date
            </label>
            <input
              type="date"
              value={releaseDate}
              onChange={(e) => setReleaseDate(e.target.value)}
              className="w-full px-3 py-2 bg-[#121422] border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Force Update Toggle */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase font-mono flex items-center justify-between">
              <span>Force Update</span>
              <span className={`text-[10px] font-bold ${forceUpdate ? 'text-rose-400' : 'text-slate-500'}`}>
                {forceUpdate ? 'ENABLED' : 'DISABLED'}
              </span>
            </label>
            <button
              type="button"
              onClick={() => setForceUpdate(!forceUpdate)}
              className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                forceUpdate
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm'
                  : 'bg-[#121422] text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{forceUpdate ? 'Users MUST update' : 'Optional update'}</span>
            </button>
          </div>
        </div>

        {/* Changelog Editor */}
        <div className="space-y-2.5 pt-3 border-t border-slate-800">
          <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
            <span>What's New (Changelog)</span>
            <span className="text-[10px] text-slate-400 font-normal">
              {changelogItems.length} bullet points
            </span>
          </label>

          <div className="space-y-2">
            {changelogItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 bg-[#121422] px-3 py-2 rounded-lg border border-slate-800 text-xs text-slate-200"
              >
                <span className="text-blue-400 font-bold">•</span>
                <span className="flex-1">{item}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveChangelogItem(idx)}
                  className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                  title="Remove item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-1">
            <input
              type="text"
              value={newChangelogInput}
              onChange={(e) => setNewChangelogInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddChangelogItem();
                }
              }}
              placeholder="e.g. Faster AI responses, Material You design updates..."
              className="flex-1 px-3 py-2 bg-[#090a10] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="button"
              onClick={handleAddChangelogItem}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Line</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => handlePublish('draft')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors border border-slate-700"
            >
              Save Draft
            </button>

            <button
              type="button"
              onClick={() => handlePublish('published')}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-blue-600/25"
            >
              <Sparkles className="w-4 h-4" />
              <span>Publish Release</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
