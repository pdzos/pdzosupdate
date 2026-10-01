import React, { useState } from 'react';
import { Modal } from './Modal';
import { useToast } from './Toast';
import { Copy, Check, Download } from 'lucide-react';
import { downloadFile } from '../utils/githubExporter';

interface JsonViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: any;
  filename?: string;
}

export const JsonViewerModal: React.FC<JsonViewerModalProps> = ({
  isOpen,
  onClose,
  title,
  data,
  filename = 'update.json'
}) => {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  const formatted = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    showToast({ type: 'success', title: 'JSON Copied to Clipboard' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadFile(filename, formatted);
    showToast({ type: 'success', title: `Downloaded ${filename}` });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} subtitle="Permanent endpoint API response payload">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400">Content-Type: application/json</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>

        <pre className="p-4 rounded-xl bg-[#08090e] border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto max-h-[60vh] leading-relaxed">
          {formatted}
        </pre>
      </div>
    </Modal>
  );
};
