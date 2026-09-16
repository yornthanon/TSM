import React, { useState } from 'react';
import { api } from '../services/apiClient';
import { ApiRequestLog } from '../types/index';
import {
  Activity,
  X,
  Trash2,
  ChevronRight,
  ChevronDown,
  Filter,
} from 'lucide-react';

interface ApiLogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  logs: ApiRequestLog[];
  onClear: () => void;
}

export const ApiLogDrawer: React.FC<ApiLogDrawerProps> = ({
  isOpen,
  onClose,
  logs,
  onClear,
}) => {
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [filterMethod, setFilterMethod] = useState<string>('ALL');

  if (!isOpen) return null;

  const toggleExpand = (id: string) => {
    setExpandedLogId((prev) => (prev === id ? null : id));
  };

  const filtered = logs.filter(
    (l) => filterMethod === 'ALL' || l.method === filterMethod
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
      <div
        id="api-traffic-drawer"
        className="bg-slate-900 border-l border-slate-800 w-full max-w-xl h-full flex flex-col text-slate-200 shadow-2xl animate-in slide-in-from-right duration-200"
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="font-bold text-sm text-white">Live API Traffic & Telemetry</h3>
              <p className="text-[11px] text-slate-400">
                End-to-end request tracing with X-Correlation-ID
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClear}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
              title="Clear traffic logs"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter controls */}
        <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-400">Method:</span>
            {['ALL', 'GET', 'POST', 'PUT', 'DELETE'].map((m) => (
              <button
                key={m}
                onClick={() => setFilterMethod(m)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition ${
                  filterMethod === m
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <span className="text-[11px] text-slate-500 font-mono">
            {filtered.length} requests
          </span>
        </div>

        {/* Logs List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 text-xs font-mono">
          {filtered.map((log) => {
            const isExpanded = expandedLogId === log.id;
            const isSuccess = log.statusCode >= 200 && log.statusCode < 300;

            return (
              <div
                key={log.id}
                className="bg-slate-950 border border-slate-800/80 rounded-lg overflow-hidden hover:border-slate-700 transition"
              >
                <div
                  onClick={() => toggleExpand(log.id)}
                  className="p-3 cursor-pointer flex items-center justify-between hover:bg-slate-900/50"
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        log.method === 'GET'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : log.method === 'POST'
                          ? 'bg-indigo-950 text-indigo-400 border border-indigo-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {log.method}
                    </span>
                    <span className="text-slate-200 font-medium truncate">{log.path}</span>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        isSuccess ? 'text-emerald-400 bg-emerald-950/60' : 'text-rose-400 bg-rose-950/60'
                      }`}
                    >
                      {log.statusCode}
                    </span>
                    <span className="text-[11px] text-slate-400">{log.durationMs}ms</span>
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-3 border-t border-slate-800/80 bg-slate-900/90 text-[11px] space-y-2.5">
                    <div className="flex justify-between text-slate-400">
                      <span>Correlation ID:</span>
                      <span className="text-indigo-300 font-semibold">{log.correlationId}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Timestamp:</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>

                    {log.requestPayload && (
                      <div>
                        <div className="text-slate-400 mb-1">Request Payload:</div>
                        <pre className="bg-black/50 p-2 rounded text-slate-300 overflow-x-auto max-h-32 text-[10px]">
                          {JSON.stringify(JSON.parse(log.requestPayload), null, 2)}
                        </pre>
                      </div>
                    )}

                    {log.responsePayload && (
                      <div>
                        <div className="text-slate-400 mb-1">Response Data:</div>
                        <pre className="bg-black/50 p-2 rounded text-emerald-300 overflow-x-auto max-h-36 text-[10px]">
                          {JSON.stringify(JSON.parse(log.responsePayload), null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-16 text-slate-500">
              No API requests logged yet. Perform actions to view live requests.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
