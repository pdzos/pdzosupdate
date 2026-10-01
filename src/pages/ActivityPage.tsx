import React, { useState } from 'react';
import { ActivityEvent } from '../types';
import { Activity, Clock, Trash2, Layers, Sparkles, RotateCcw, PlusCircle, CheckCircle } from 'lucide-react';
import { useToast } from '../components/Toast';

interface ActivityPageProps {
  activity: ActivityEvent[];
  onClearActivity: () => void;
}

export const ActivityPage: React.FC<ActivityPageProps> = ({
  activity,
  onClearActivity
}) => {
  const { showToast } = useToast();
  const [filterType, setFilterType] = useState<string>('all');

  const filteredEvents = activity.filter(ev => {
    if (filterType === 'all') return true;
    return ev.type === filterType;
  });

  const getIconForType = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'app_created':
        return <PlusCircle className="w-4 h-4 text-emerald-400" />;
      case 'release_published':
        return <Sparkles className="w-4 h-4 text-cyan-400" />;
      case 'release_rollback':
        return <RotateCcw className="w-4 h-4 text-amber-400" />;
      default:
        return <CheckCircle className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <span>Activity & Event Stream</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Transparent event trail maintained directly in your browser and Git commit logs.
          </p>
        </div>

        {activity.length > 0 && (
          <button
            onClick={() => {
              onClearActivity();
              showToast({ type: 'info', title: 'Activity Log Cleared' });
            }}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-slate-700 self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Clear Log</span>
          </button>
        )}
      </div>

      {/* Zero Database Transparency Banner */}
      <div className="p-4 rounded-xl bg-[#0e1019] border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
        <Clock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Zero Database Guarantee:</strong> In accordance with the HexOS free architecture, audit entries are
          recorded in browser local state and reflected in GitHub repository commit history. No paid database or background tracker is invoked.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All Events' },
          { id: 'release_published', label: 'Releases' },
          { id: 'release_rollback', label: 'Rollbacks' },
          { id: 'app_created', label: 'Apps Added' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
              filterType === tab.id
                ? 'bg-blue-600 text-white font-semibold'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Timeline List */}
      <div className="space-y-3">
        {filteredEvents.length === 0 ? (
          <div className="p-8 text-center bg-[#0d0f17] border border-slate-800 rounded-2xl text-slate-500 text-xs">
            No activity events recorded yet.
          </div>
        ) : (
          filteredEvents.map(event => (
            <div
              key={event.id}
              className="p-4 rounded-xl bg-[#0e1019] border border-slate-800 flex items-start gap-3.5 hover:border-slate-700 transition-colors"
            >
              <div className="p-2 rounded-lg bg-[#141724] border border-slate-800 shrink-0 mt-0.5">
                {getIconForType(event.type)}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-baseline justify-between gap-2">
                  <h4 className="text-xs font-bold text-white truncate">{event.title}</h4>
                  <span className="text-[10px] font-mono text-slate-500 shrink-0">
                    {event.timestamp}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {event.description}
                </p>
                <div className="flex items-center gap-2 pt-1 font-mono text-[10px] text-slate-400">
                  <span className="text-cyan-400">{event.packageName}</span>
                  {event.version && (
                    <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                      v{event.version}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
