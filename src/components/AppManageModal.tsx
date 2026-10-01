import React, { useState } from 'react';
import { AppRecord, ChannelType } from '../types';
import { Modal } from './Modal';
import { useToast } from './Toast';
import { Settings2, Trash2, Save, ExternalLink, RotateCcw } from 'lucide-react';

interface AppManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  app: AppRecord | null;
  onUpdateApp: (updated: AppRecord) => void;
  onDeleteApp: (packageName: string) => void;
  onRollback: (packageName: string, releaseId: string, version: string) => void;
}

export const AppManageModal: React.FC<AppManageModalProps> = ({
  isOpen,
  onClose,
  app,
  onUpdateApp,
  onDeleteApp,
  onRollback
}) => {
  const { showToast } = useToast();

  if (!app) return null;

  const [name, setName] = useState(app.name);
  const [description, setDescription] = useState(app.description);
  const [icon, setIcon] = useState(app.icon);
  const [developer, setDeveloper] = useState(app.developer);
  const [website, setWebsite] = useState(app.website);
  const [defaultChannel, setDefaultChannel] = useState<ChannelType>(app.defaultChannel);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: AppRecord = {
      ...app,
      name: name.trim() || app.name,
      description: description.trim(),
      icon: icon.trim() || app.icon,
      developer: developer.trim() || app.developer,
      website: website.trim(),
      defaultChannel,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    onUpdateApp(updated);
    showToast({ type: 'success', title: 'App Details Updated' });
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${app.name} (${app.packageName})?`)) {
      onDeleteApp(app.packageName);
      showToast({ type: 'info', title: `Deleted ${app.name}` });
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Manage ${app.name}`}
      subtitle={`Application ID: ${app.packageName}`}
      maxWidth="xl"
    >
      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">App Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-[#121422] border border-slate-700 rounded-lg text-xs text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Default Channel</label>
            <select
              value={defaultChannel}
              onChange={(e) => setDefaultChannel(e.target.value as ChannelType)}
              className="w-full px-3 py-2 bg-[#121422] border border-slate-700 rounded-lg text-xs text-white"
            >
              <option value="stable">Stable</option>
              <option value="beta">Beta</option>
              <option value="alpha">Alpha</option>
            </select>
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-semibold text-slate-300">Icon URL</label>
            <input
              type="url"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full px-3 py-2 bg-[#121422] border border-slate-700 rounded-lg text-xs text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Developer</label>
            <input
              type="text"
              value={developer}
              onChange={(e) => setDeveloper(e.target.value)}
              className="w-full px-3 py-2 bg-[#121422] border border-slate-700 rounded-lg text-xs text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Website</label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full px-3 py-2 bg-[#121422] border border-slate-700 rounded-lg text-xs text-white"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-semibold text-slate-300">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-[#121422] border border-slate-700 rounded-lg text-xs text-white"
            />
          </div>
        </div>

        {/* Release Version Rollback shortcut */}
        <div className="pt-3 border-t border-slate-800 space-y-2">
          <span className="text-xs font-bold text-white uppercase tracking-wider block">
            Releases ({app.releases.length})
          </span>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {app.releases.map(rel => (
              <div
                key={rel.id}
                className="flex items-center justify-between p-2 rounded-lg bg-[#090a10] border border-slate-800 text-xs"
              >
                <div className="flex items-center gap-2 font-mono">
                  <span className="font-bold text-white">v{rel.version}</span>
                  <span className="text-[10px] text-slate-400">({rel.versionCode})</span>
                  {rel.isCurrentActive ? (
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                      ACTIVE
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 uppercase">{rel.channel}</span>
                  )}
                </div>

                {!rel.isCurrentActive && (
                  <button
                    type="button"
                    onClick={() => {
                      onRollback(app.packageName, rel.id, rel.version);
                      onClose();
                    }}
                    className="px-2 py-0.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded text-[10px] flex items-center gap-1 font-mono"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Rollback to this
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={handleDelete}
            className="px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete App</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
