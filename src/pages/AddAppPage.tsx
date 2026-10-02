import React, { useState } from 'react';
import { AppRecord, ChannelType } from '../types';
import { validatePackageName, validateVersionString } from '../utils/version';
import { toDirectDownloadUrl } from '../utils/googleDrive';
import { GoogleDriveValidator } from '../components/GoogleDriveValidator';
import { useToast } from '../components/Toast';
import { Link2, Copy, Check, PlusCircle, ArrowLeft, ShieldCheck, Sparkles, Smartphone, Eye, HardDrive } from 'lucide-react';

interface AddAppPageProps {
  apiBaseUrl: string;
  onSaveApp: (newApp: AppRecord) => void;
  onCancel: () => void;
  onViewPublic: (packageName: string) => void;
}

export const AddAppPage: React.FC<AddAppPageProps> = ({
  apiBaseUrl,
  onSaveApp,
  onCancel,
  onViewPublic
}) => {
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [packageName, setPackageName] = useState('');
  const [icon, setIcon] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=160&auto=format&fit=crop&q=80');
  const [description, setDescription] = useState('');
  const [developer, setDeveloper] = useState('PdzOS Systems');
  const [website, setWebsite] = useState('https://pdzos.pages.dev');
  const [initialVersion, setInitialVersion] = useState('1.0.0');
  const [initialVersionCode, setInitialVersionCode] = useState(1);
  const [minimumAndroid, setMinimumAndroid] = useState(26);
  const [defaultChannel, setDefaultChannel] = useState<ChannelType>('stable');
  const [copiedUrl, setCopiedUrl] = useState(false);

  const [apkUrl, setApkUrl] = useState('');
  const [fileSize, setFileSize] = useState('45 MB');
  const [category, setCategory] = useState('Tools');
  const [tags, setTags] = useState('Tools, Android');
  const [screenshots, setScreenshots] = useState('');
  const [featured, setFeatured] = useState(false);

  // Live permanent update URL calculation
  const cleanedPackageName = packageName.trim().toLowerCase();
  const permanentUrl = `${apiBaseUrl}/${cleanedPackageName || 'com.example.app'}.json`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(permanentUrl);
    setCopiedUrl(true);
    showToast({ type: 'success', title: 'Permanent URL Copied', message: permanentUrl });
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast({ type: 'error', title: 'App Name is required' });
      return;
    }

    const pkgValidation = validatePackageName(cleanedPackageName);
    if (!pkgValidation.isValid) {
      showToast({ type: 'error', title: 'Invalid Package Name', message: pkgValidation.error });
      return;
    }

    const verValidation = validateVersionString(initialVersion);
    if (!verValidation.isValid) {
      showToast({ type: 'error', title: 'Invalid Version', message: verValidation.error });
      return;
    }

    if (initialVersionCode <= 0) {
      showToast({ type: 'error', title: 'Version Code must be a positive integer (> 0)' });
      return;
    }

    const effectiveDirectUrl = toDirectDownloadUrl(apkUrl.trim());

    const newApp: AppRecord = {
      id: 'app-' + Date.now(),
      name: name.trim(),
      packageName: cleanedPackageName,
      icon: icon.trim() || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=160&auto=format&fit=crop&q=80',
      description: description.trim(),
      developer: developer.trim(),
      website: website.trim(),
      category: category.trim() || 'Tools',
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      screenshots: screenshots.split(',').map(s => s.trim()).filter(Boolean),
      featured,
      currentVersion: initialVersion.trim(),
      currentVersionCode: Number(initialVersionCode),
      minimumAndroid: Number(minimumAndroid),
      defaultChannel,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      totalReleases: 1,
      releases: [
        {
          id: 'rel-' + Date.now(),
          appPackageName: cleanedPackageName,
          version: initialVersion.trim(),
          versionCode: Number(initialVersionCode),
          apkUrl: effectiveDirectUrl || '',
          apkSource: effectiveDirectUrl.includes('drive.google.com') ? 'gdrive' : 'direct',
          directDownloadUrl: effectiveDirectUrl || '',
          fileSize: fileSize.trim() || '45 MB',
          minimumAndroid: Number(minimumAndroid),
          forceUpdate: false,
          channel: defaultChannel,
          releaseDate: new Date().toISOString().split('T')[0],
          changelog: ['Initial app registration.'],
          status: 'published',
          isCurrentActive: true,
        }
      ]
    };

    onSaveApp(newApp);
    showToast({
      type: 'success',
      title: 'App Created Successfully!',
      message: `Permanent endpoint created at /api/${cleanedPackageName}.json`
    });
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
            <h1 className="text-xl font-bold text-white tracking-tight">Add New Application</h1>
            <p className="text-xs text-slate-400">
              Register an Android application to get its permanent zero-change update endpoint.
            </p>
          </div>
        </div>
      </div>

      {/* Permanent URL Showcase Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 to-slate-900 border border-blue-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider font-mono">
            <Link2 className="w-4 h-4" />
            <span>Permanent Update Endpoint (Never Changes)</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            AUTO-GENERATED
          </span>
        </div>

        <div className="flex items-center gap-2 bg-[#080a11] p-3 rounded-xl border border-slate-800 text-xs font-mono text-slate-200">
          <span className="text-blue-400 select-none">GET</span>
          <span className="truncate flex-1 select-all font-semibold">
            {permanentUrl}
          </span>
          <button
            type="button"
            onClick={handleCopyUrl}
            className="px-2.5 py-1.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors shrink-0"
          >
            {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy URL</span>
          </button>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed">
          Embed this exact URL inside your Android Kotlin app code. When you publish version 1.1.0 or 2.0.0,
          the Android app will continue requesting this exact same URL!
        </p>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-[#0e1019] border border-slate-800 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* App Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              App Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. ZYRA"
              className="w-full px-3.5 py-2.5 bg-[#121422] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Package Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Package Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              placeholder="e.g. com.hexos.zyra"
              className="w-full px-3.5 py-2.5 bg-[#121422] border border-slate-700 rounded-xl text-xs font-mono text-cyan-300 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <p className="text-[10px] text-slate-500 font-mono">
              Android Application ID (e.g. com.company.app)
            </p>
          </div>

          {/* Icon URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              App Icon URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="https://example.com/icon.png"
                className="w-full px-3.5 py-2.5 bg-[#121422] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden shrink-0">
                <img src={icon} alt="Icon Preview" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          {/* Developer Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Developer / Organization
            </label>
            <input
              type="text"
              value={developer}
              onChange={(e) => setDeveloper(e.target.value)}
              placeholder="PdzOS Systems"
              className="w-full px-3.5 py-2.5 bg-[#121422] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Website */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Official Website / Support Link
            </label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://pdzos.pages.dev"
              className="w-full px-3.5 py-2.5 bg-[#121422] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              App Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the application features, audience and purpose..."
              className="w-full px-3.5 py-2.5 bg-[#121422] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* PDzOS Store Integration Fields */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Store Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#121422] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="AI">AI &amp; Assistant</option>
              <option value="Tools">Tools &amp; Utilities</option>
              <option value="Productivity">Productivity</option>
              <option value="Creative">Creative &amp; Design</option>
              <option value="Games">Games</option>
              <option value="Customization">Customization</option>
              <option value="Launcher">Launcher</option>
              <option value="Education">Education</option>
              <option value="Experimental">Experimental</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Store Tags (Comma-separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. AI, Assistant, Voice"
              className="w-full px-3.5 py-2.5 bg-[#121422] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Screenshots URLs (Optional, comma-separated)
            </label>
            <input
              type="text"
              value={screenshots}
              onChange={(e) => setScreenshots(e.target.value)}
              placeholder="e.g. https://.../screen1.png, https://.../screen2.png"
              className="w-full px-3.5 py-2.5 bg-[#121422] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="md:col-span-2 flex items-center gap-2 p-3 rounded-xl bg-blue-950/20 border border-blue-500/20">
            <input
              type="checkbox"
              id="featuredStore"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-700 bg-slate-800"
            />
            <label htmlFor="featuredStore" className="text-xs text-slate-200 cursor-pointer font-medium">
              Featured on PDzOS Store (Highlight this app on the marketplace homepage)
            </label>
          </div>
        </div>

        {/* Initial Release Parameters */}
        <div className="pt-4 border-t border-slate-800">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <span>Initial Release Parameters</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Version String */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-300 uppercase font-mono">
                Initial Version Name
              </label>
              <input
                type="text"
                required
                value={initialVersion}
                onChange={(e) => setInitialVersion(e.target.value)}
                placeholder="1.0.0"
                className="w-full px-3 py-2 bg-[#121422] border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Version Code */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-300 uppercase font-mono">
                Version Code (Int)
              </label>
              <input
                type="number"
                min="1"
                required
                value={initialVersionCode}
                onChange={(e) => setInitialVersionCode(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-[#121422] border border-slate-700 rounded-lg text-xs font-mono text-cyan-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Minimum Android SDK */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-300 uppercase font-mono">
                Min Android SDK (API)
              </label>
              <select
                value={minimumAndroid}
                onChange={(e) => setMinimumAndroid(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-[#121422] border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
              >
                <option value={24}>API 24 (Android 7.0)</option>
                <option value={26}>API 26 (Android 8.0 Oreo)</option>
                <option value={28}>API 28 (Android 9.0 Pie)</option>
                <option value={30}>API 30 (Android 11)</option>
                <option value={33}>API 33 (Android 13)</option>
                <option value={34}>API 34 (Android 14)</option>
                <option value={35}>API 35 (Android 15)</option>
              </select>
            </div>

            {/* Default Channel */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-300 uppercase font-mono">
                Default Channel
              </label>
              <select
                value={defaultChannel}
                onChange={(e) => setDefaultChannel(e.target.value as ChannelType)}
                className="w-full px-3 py-2 bg-[#121422] border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
              >
                <option value="stable">Stable</option>
                <option value="beta">Beta</option>
                <option value="alpha">Alpha</option>
              </select>
            </div>
          </div>

          {/* Initial APK Binary (Google Drive / Direct URL) */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-emerald-400" />
                <span>Initial APK Download Link (Google Drive / Direct HTTPS)</span>
              </label>
              <div className="flex items-center gap-2">
                <label className="text-[11px] text-slate-400 font-mono">File Size:</label>
                <input
                  type="text"
                  value={fileSize}
                  onChange={(e) => setFileSize(e.target.value)}
                  placeholder="e.g. 45 MB"
                  className="w-24 px-2 py-1 bg-[#121422] border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <GoogleDriveValidator
              url={apkUrl}
              onChange={setApkUrl}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2.5">
            {cleanedPackageName && (
              <button
                type="button"
                onClick={() => onViewPublic(cleanedPackageName)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview Public Page</span>
              </button>
            )}

            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Register & Generate Endpoint</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
