import React, { useState } from 'react';
import { AppRecord } from '../types';
import { generateGitHubRepoFiles, ExportedFile, downloadFile } from '../utils/githubExporter';
import { Modal } from './Modal';
import { useToast } from './Toast';
import { GitBranch, Download, Copy, Check, FileJson, CheckCircle2, Terminal } from 'lucide-react';

interface GitHubExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  apps: AppRecord[];
}

export const GitHubExportModal: React.FC<GitHubExportModalProps> = ({
  isOpen,
  onClose,
  apps
}) => {
  const { showToast } = useToast();
  const files: ExportedFile[] = generateGitHubRepoFiles(apps);

  const [selectedFile, setSelectedFile] = useState<ExportedFile>(files[0] || null);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const handleCopy = (file: ExportedFile) => {
    navigator.clipboard.writeText(file.content);
    setCopiedPath(file.path);
    showToast({ type: 'success', title: `Copied ${file.path}` });
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const handleDownload = (file: ExportedFile) => {
    const filename = file.path.split('/').pop() || 'metadata.json';
    downloadFile(filename, file.content);
    showToast({ type: 'success', title: `Downloaded ${filename}` });
  };

  const handleDownloadAll = () => {
    files.forEach(f => {
      const filename = f.path.replace(/\//g, '_');
      downloadFile(filename, f.content);
    });
    showToast({ type: 'success', title: 'Exported all repository JSON files' });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="GitHub Metadata Repository Exporter"
      subtitle="Free Tier: Copy or download the exact JSON files to commit to your GitHub repository"
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Intro Banner */}
        <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-500/20 text-xs text-slate-300 leading-relaxed">
          <strong className="text-blue-400">Zero-Cost Architecture:</strong> Your GitHub repository holds the update metadata files.
          Commit these files to <code className="text-cyan-400 font-mono">apps/</code> and <code className="text-cyan-400 font-mono">releases/</code> in your repo.
          Cloudflare Pages will serve them directly from the static build!
        </div>

        {/* File Browser Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border border-slate-800 rounded-xl overflow-hidden bg-[#0a0b12]">
          {/* File List */}
          <div className="p-2 border-r border-slate-800 max-h-80 overflow-y-auto space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-500 px-2 py-1 block">
              Files ({files.length})
            </span>
            {files.map(f => (
              <button
                key={f.path}
                type="button"
                onClick={() => setSelectedFile(f)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono truncate transition-colors flex items-center gap-2 ${
                  selectedFile?.path === f.path
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <FileJson className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                <span className="truncate">{f.path}</span>
              </button>
            ))}
          </div>

          {/* Code Viewer */}
          <div className="md:col-span-2 p-3 space-y-2 flex flex-col justify-between">
            {selectedFile ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <span className="font-mono text-xs font-bold text-white truncate block">
                      {selectedFile.path}
                    </span>
                    <span className="text-[10px] text-slate-500">{selectedFile.description}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedFile)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono flex items-center gap-1 transition-colors border border-slate-700"
                    >
                      {copiedPath === selectedFile.path ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>Copy</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownload(selectedFile)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors border border-slate-700"
                      title="Download file"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <pre className="p-3 bg-[#06070a] border border-slate-900 rounded-lg font-mono text-[11px] text-cyan-300 max-h-60 overflow-y-auto leading-relaxed">
                  {selectedFile.content}
                </pre>
              </>
            ) : null}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] text-slate-500 font-mono">
            {files.length} JSON configuration and workflow files generated
          </span>
          <button
            type="button"
            onClick={handleDownloadAll}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>Download All JSON Files</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
