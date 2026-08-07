import React, { useState, useEffect } from 'react';
import { MFE_REGISTRY } from '../../mfe/mfeRegistry';
import { mfeEventBus } from '../../mfe/eventBus';
import { MfeEvent } from '../../mfe/types';
import {
  Layers,
  Cpu,
  Wifi,
  Activity,
  Send,
  X,
  CheckCircle2,
  Terminal,
  Server,
  Zap,
  Globe,
  Database,
  ArrowRightLeft,
  Trash2,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const MfeInspectorModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [eventHistory, setEventHistory] = useState<MfeEvent[]>(mfeEventBus.getEventHistory());
  const [testEventName, setTestEventName] = useState('CUSTOM_CROSS_MFE_SIGNAL');
  const [testPayload, setTestPayload] = useState('{"message": "Halo dari Shell MFE Inspector!"}');
  const [activeTab, setActiveTab] = useState<'REMOTES' | 'EVENT_BUS' | 'ARCHITECTURE'>('REMOTES');

  useEffect(() => {
    if (!isOpen) return;

    // Subscribe to all events on event bus
    const unsubscribe = mfeEventBus.subscribe('*', (event) => {
      setEventHistory(mfeEventBus.getEventHistory());
    });

    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleEmitCustomEvent = () => {
    try {
      const parsed = JSON.parse(testPayload);
      mfeEventBus.publish('mfe-shell-host', testEventName, parsed);
      setEventHistory(mfeEventBus.getEventHistory());
    } catch {
      alert('Payload JSON tidak valid!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#101014] border border-zinc-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-[#0b0b0e]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-zinc-100 tracking-tight">
                  Micro-Frontend (MFE) Inspector & DevTools
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  HOST SHELL ACTIVE
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Arsitektur Decoupled Module Federation & Event Bus Cross-MFE
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 p-2 rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 px-6 py-3 bg-[#0d0d10] border-b border-zinc-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('REMOTES')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'REMOTES'
                ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Remote Micro-Apps ({MFE_REGISTRY.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('EVENT_BUS')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'EVENT_BUS'
                ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Cross-MFE Event Bus ({eventHistory.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ARCHITECTURE')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'ARCHITECTURE'
                ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Diagram Blueprint Arsitektur</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          {activeTab === 'REMOTES' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {MFE_REGISTRY.map((mfe) => (
                  <div
                    key={mfe.id}
                    className="bg-[#08080a] border border-zinc-800 rounded-2xl p-5 space-y-3 relative overflow-hidden flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-800 text-emerald-400 border border-zinc-700">
                          {mfe.scope}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> {mfe.status}
                        </span>
                      </div>

                      <h3 className="font-bold text-zinc-100 text-sm">{mfe.title}</h3>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">{mfe.description}</p>
                    </div>

                    <div className="pt-3 border-t border-zinc-800/80 space-y-1.5 font-mono text-[10px]">
                      <div className="flex justify-between text-zinc-500">
                        <span>App ID:</span>
                        <span className="text-zinc-300 font-bold">{mfe.id}</span>
                      </div>
                      <div className="flex justify-between text-zinc-500">
                        <span>Versi Remote:</span>
                        <span className="text-emerald-400 font-bold">{mfe.version}</span>
                      </div>
                      <div className="flex justify-between text-zinc-500">
                        <span>Ukuran Bundle:</span>
                        <span className="text-zinc-300">{mfe.bundleSizeKb} KB</span>
                      </div>
                      <div className="flex justify-between text-zinc-500">
                        <span>Latency Lat:</span>
                        <span className="text-zinc-300">{mfe.latencyMs} ms</span>
                      </div>
                      <div className="pt-1 text-[9px] text-zinc-600 truncate">
                        {mfe.remoteEntryUrl}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'EVENT_BUS' && (
            <div className="space-y-6">
              {/* Event Dispatcher Box */}
              <div className="bg-[#08080a] border border-zinc-800 p-4 rounded-2xl space-y-3">
                <h3 className="font-bold text-zinc-200 text-xs flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>Kirim Event Percobaan (Broadcast to All MFEs)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={testEventName}
                    onChange={(e) => setTestEventName(e.target.value)}
                    placeholder="Nama Event (e.g. USER_STATUS_UPDATED)"
                    className="bg-zinc-950 border border-zinc-800 text-zinc-100 font-mono rounded-xl p-2.5 outline-none text-xs"
                  />
                  <button
                    onClick={handleEmitCustomEvent}
                    className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
                  >
                    <Send className="w-4 h-4" />
                    <span>Publish Signal to Event Bus</span>
                  </button>
                </div>

                <textarea
                  rows={2}
                  value={testPayload}
                  onChange={(e) => setTestPayload(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-emerald-400 font-mono text-[11px] rounded-xl p-2.5 outline-none resize-none"
                />
              </div>

              {/* Event History Stream */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-zinc-300 text-xs flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span>Live Event Bus Log History ({eventHistory.length})</span>
                  </h3>
                  <button
                    onClick={() => {
                      mfeEventBus.clearHistory();
                      setEventHistory([]);
                    }}
                    className="text-[10px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" /> Clear Logs
                  </button>
                </div>

                <div className="bg-[#050507] border border-zinc-800/80 rounded-2xl p-4 font-mono space-y-2 max-h-60 overflow-y-auto">
                  {eventHistory.length === 0 ? (
                    <p className="text-zinc-600 text-center py-6">Belum ada event yang dipublish di Event Bus.</p>
                  ) : (
                    eventHistory.map((evt) => (
                      <div
                        key={evt.id}
                        className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-400 font-bold">[{evt.eventName}]</span>
                            <span className="text-zinc-500">from</span>
                            <span className="text-indigo-400 font-bold">{evt.sourceMfeId}</span>
                          </div>
                          <pre className="text-zinc-400 mt-1 text-[10px] overflow-x-auto">
                            {JSON.stringify(evt.payload)}
                          </pre>
                        </div>
                        <span className="text-[9px] text-zinc-600 shrink-0">
                          {new Date(evt.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ARCHITECTURE' && (
            <div className="space-y-6">
              <div className="bg-[#08080a] border border-zinc-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span>Konsep Arsitektur Micro-Frontend di Aplikasi Ini</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-zinc-900/80 rounded-2xl border border-emerald-500/30 space-y-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400">
                      LAYER 1: SHELL ORCHESTRATOR
                    </span>
                    <p className="font-bold text-zinc-200">Host Application</p>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Mengelola autentikasi global, Shell Layout, RBAC Menu Router, dan MFE Error Isolation Boundaries.
                    </p>
                  </div>

                  <div className="p-4 bg-zinc-900/80 rounded-2xl border border-indigo-500/30 space-y-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-400">
                      LAYER 2: EVENT BUS BRIDGE
                    </span>
                    <p className="font-bold text-zinc-200">Cross-MFE Event Bus</p>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Mengirim sinyal & domain events secara async antar modul tanpa saling melakukan import langsung.
                    </p>
                  </div>

                  <div className="p-4 bg-zinc-900/80 rounded-2xl border border-purple-500/30 space-y-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-400">
                      LAYER 3: REMOTE MICRO-APPS
                    </span>
                    <p className="font-bold text-zinc-200">Decoupled Modules</p>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Modul Employee, HRD Analytics, dan Admin Governance dikembangkan, di-bundle, dan dimuat secara terpisah.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
