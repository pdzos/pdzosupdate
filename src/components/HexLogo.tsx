import React from 'react';

interface HexLogoProps {
  size?: 'sm' | 'md' | 'lg';
  withText?: boolean;
  subtitle?: string;
}

export const HexLogo: React.FC<HexLogoProps> = ({ size = 'md', withText = true, subtitle }) => {
  const sizeMap = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  return (
    <div className="flex items-center gap-3 select-none">
      <div className={`relative ${sizeMap[size]} flex items-center justify-center`}>
        {/* Hexagon SVG */}
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_12px_rgba(59,130,246,0.5)]">
          <polygon
            points="50 3, 93 25, 93 75, 50 97, 7 75, 7 25"
            fill="#0f1424"
            stroke="#3b82f6"
            strokeWidth="6"
            className="transition-all duration-300"
          />
          <polygon
            points="50 20, 80 35, 80 65, 50 80, 20 65, 20 35"
            fill="none"
            stroke="#06b6d4"
            strokeWidth="3.5"
            strokeDasharray="4 2"
          />
          <circle cx="50" cy="50" r="10" fill="#3b82f6" className="animate-pulse" />
        </svg>
      </div>

      {withText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 font-bold tracking-tight text-white leading-tight">
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent font-extrabold text-base md:text-lg">
              PdzOS
            </span>
            <span className="text-slate-300 font-semibold text-sm md:text-base">
              App Update
            </span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono uppercase bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded">
              v1.0
            </span>
          </div>
          {subtitle ? (
            <span className="text-[11px] text-slate-400 font-mono">{subtitle}</span>
          ) : (
            <span className="text-[10px] text-slate-500 font-medium tracking-wide">
              CENTRAL ANDROID APP UPDATER
            </span>
          )}
        </div>
      )}
    </div>
  );
};
