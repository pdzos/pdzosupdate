import React, { useState } from 'react';
import { analyzeApkUrl, GDriveAnalysis } from '../utils/googleDrive';
import { CheckCircle2, AlertTriangle, ExternalLink, Copy, Check, Info, Sparkles } from 'lucide-react';
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

  const handleValidate = () => {
    const res = analyzeApkUrl(url);
    setAnalysis(res);
    if (res.isValid && res.directDownloadUrl && onDirectUrlChange) {
      onDirectUrlChange(res.directDownloadUrl);
    }

    if (res.isValid) {
      showToast({
        type: res.isGoogleDrive ? 'info' : 'success',
        title: res.isGoogleDrive ? 'Google Drive Link Analyzed' : 'Direct URL Validated',
        message: res.isGoogleDrive ? 'Extracted File ID and generated direct endpoint.' : 'Ready for APK download.'
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

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="url"
            value={url}
            onChange={(e) => {
              onChange(e.target.value);
              if (analysis) setAnalysis(null);
            }}
            placeholder="https://drive.google.com/file/d/1ZyRa_.../view?usp=sharing"
            className="w-full px-4 py-2.5 bg-[#0a0b11] border border-slate-700/70 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm font-mono transition-colors"
          />
        </div>
        <button
          type="button"
          onClick={handleValidate}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold tracking-wide uppercase flex items-center gap-1.5 transition-all shadow-md shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Validate Link
        </button>
      </div>

      {/* Validation Result Box */}
      {analysis && (
        <div className={`p-4 rounded-xl border ${
          analysis.isValid 
            ? 'bg-blue-950/20 border-blue-500/30' 
            : 'bg-amber-950/20 border-amber-500/30'
        } text-xs space-y-2.5 animate-in fade-in`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-medium">
              {analysis.isValid ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              )}
              <span className={analysis.isValid ? 'text-blue-300' : 'text-amber-300'}>
                {analysis.isGoogleDrive ? 'Google Drive Source' : 'Direct HTTPS Source'}
              </span>
            </div>
            {analysis.fileId && (
              <span className="font-mono text-[11px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                File ID: {analysis.fileId.substring(0, 14)}...
              </span>
            )}
          </div>

          {analysis.directDownloadUrl && (
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
                Generated Direct APK Endpoint:
              </label>
              <div className="flex items-center gap-2 bg-[#090a0f] p-2 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-200 break-all">
                <span className="flex-1 select-all">{analysis.directDownloadUrl}</span>
                <button
                  type="button"
                  onClick={() => copyDirect(analysis.directDownloadUrl!)}
                  className="p-1 hover:text-blue-400 text-slate-400 transition-colors shrink-0"
                  title="Copy Direct URL"
                >
                  {hasCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <a
                  href={analysis.directDownloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 hover:text-blue-400 text-slate-400 transition-colors shrink-0"
                  title="Test in new tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
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

          <div className="border-t border-slate-800 pt-2 text-[11px] text-slate-400 space-y-1">
            <span className="font-semibold text-slate-300">Google Drive Verification Checklist:</span>
            <ul className="list-disc list-inside space-y-0.5">
              {analysis.tips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
