import React, { useState, useEffect } from 'react';
import { analyzeApkUrl, GDriveAnalysis, toDirectDownloadUrl } from '../utils/googleDrive';
import { CheckCircle2, AlertTriangle, ExternalLink, Copy, Check, Info, Sparkles, Download } from 'lucide-react';
import { useToast } from './Toast';

interface GoogleDriveValidatorProps {
  url: string;
  onChange: (url: string) => void;
  onDirectUrlChange?: (directUrl: string) => void;
}

export const GoogleDriveValidator: React.FC<GoogleDriveValidatorProps> = ({
  url,
  onChange,
  onDirectUrlChange
}) => {
  const { showToast } = useToast();
  const [analysis, setAnalysis] = useState<GDriveAnalysis | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  // Auto-analyze in real time as the user types or pastes
  useEffect(() => {
    if (!url || !url.trim()) {
      setAnalysis(null);
      return;
    }

    const res = analyzeApkUrl(url);
    setAnalysis(res);

    if (res.isValid && res.directDownloadUrl && onDirectUrlChange) {
      onDirectUrlChange(res.directDownloadUrl);
    }
  }, [url, onDirectUrlChange]);

  const handleValidate = () => {
    const res = analyzeApkUrl(url);
    setAnalysis(res);
    if (res.isValid && res.directDownloadUrl && onDirectUrlChange) {
      onDirectUrlChange(res.directDownloadUrl);
    }

    if (res.isValid) {
      showToast({
        type: 'success',
        title: res.isGoogleDrive ? 'Google Drive Link Processed' : 'Direct URL Validated',
        message: res.isGoogleDrive ? 'Direct download endpoint active. Users will NOT see the Drive web preview!' : 'Ready for direct APK download.'
      });
    } else {
      showToast({
        type: 'warning',
        title: 'URL Check Notice',
        message: res.warning || 'Please verify the link format.'
      });
    }
  };

  const copyDirect = (text: string) => {
    navigator.clipboard.writeText(text);
    setHasCopied(true);
    showToast({ type: 'success', title: 'Copied Direct Download URL' });
    setTimeout(() => setHasCopied(false), 2000);
  };

  const directUrl = analysis?.directDownloadUrl || toDirectDownloadUrl(url);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="url"
            value={url}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste Google Drive share link (e.g. https://drive.google.com/file/d/.../view?usp=sharing)"
            className="w-full px-4 py-2.5 bg-[#0a0b11] border border-slate-700/70 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm font-mono transition-colors"
          />
        </div>
        <button
          type="button"
          onClick={handleValidate}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold tracking-wide uppercase flex items-center gap-1.5 transition-all shadow-md shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Analyze Link
        </button>
      </div>

      {/* Validation Result Box */}
      {analysis && analysis.isValid && (
        <div className="p-4 rounded-xl border bg-emerald-950/20 border-emerald-500/30 text-xs space-y-2.5 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-300">
                {analysis.isGoogleDrive ? 'Google Drive (Direct Download Activated)' : 'Direct HTTPS APK Source'}
              </span>
            </div>
            {analysis.fileId && (
              <span className="font-mono text-[11px] text-slate-300 bg-slate-800/90 px-2.5 py-0.5 rounded border border-slate-700">
                File ID: {analysis.fileId}
              </span>
            )}
          </div>

          {directUrl && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">
                  Direct Download Link (No Google Drive Page):
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  Direct Binary Stream
                </span>
              </div>
              <div className="flex items-center gap-2 bg-[#090a0f] p-2 rounded-lg border border-emerald-500/30 font-mono text-[11px] text-emerald-200 break-all">
                <span className="flex-1 select-all">{directUrl}</span>
                <button
                  type="button"
                  onClick={() => copyDirect(directUrl)}
                  className="p-1 hover:text-emerald-300 text-slate-400 transition-colors shrink-0"
                  title="Copy Direct URL"
                >
                  {hasCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <a
                  href={directUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 hover:text-emerald-300 text-slate-400 transition-colors shrink-0 flex items-center gap-1 text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20"
                  title="Test Direct Download in browser"
                >
                  <Download className="w-3 h-3" />
                  <span>Test Download</span>
                </a>
              </div>
            </div>
          )}

          {analysis.warning && (
            <div className="flex items-start gap-2 text-amber-300/90 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20 text-[11px] leading-relaxed">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <span>{analysis.warning}</span>
            </div>
          )}

          <div className="border-t border-slate-800/80 pt-2 text-[11px] text-slate-400 space-y-1">
            <span className="font-semibold text-slate-300">Direct Download Features:</span>
            <ul className="list-disc list-inside space-y-0.5 text-slate-400">
              <li>Automatic bypass of Google Drive preview page and virus scan prompt.</li>
              <li>Android apps and browser downloads start the APK file transfer instantly.</li>
              <li>Make sure Google Drive link access is set to <strong>"Anyone with the link can view"</strong>.</li>
            </ul>
          </div>
        </div>
      )}

      {analysis && !analysis.isValid && (
        <div className="p-3.5 rounded-xl border bg-amber-950/20 border-amber-500/30 text-xs space-y-1.5 animate-in fade-in">
          <div className="flex items-center gap-2 text-amber-400 font-medium">
            <AlertTriangle className="w-4 h-4" />
            <span>Invalid URL</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            {analysis.warning || 'Please provide a valid Google Drive sharing link or HTTPS URL.'}
          </p>
        </div>
      )}
    </div>
  );
};
