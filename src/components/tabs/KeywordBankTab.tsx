import React, { useState } from 'react';
import { KeyRound, Plus, Trash2, TrendingUp, RefreshCw, Target, LineChart as LineChartIcon } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { Keyword } from '../../types';

export const KeywordBankTab: React.FC = () => {
  const { keywords, activeClientId, activeClient, addKeyword, updateKeywordPosition, deleteKeyword, clients } = useApp();

  const [isAddKwOpen, setIsAddKwOpen] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  const [newCurrentPos, setNewCurrentPos] = useState(10);
  const [newTargetPos, setNewTargetPos] = useState(1);
  const [newSearchVol, setNewSearchVol] = useState('1,500/mo');

  const [updatingKw, setUpdatingKw] = useState<Keyword | null>(null);
  const [updatedPosInput, setUpdatedPosInput] = useState<number>(1);

  // Scoped keywords
  let scopedKeywords = keywords;
  if (activeClientId !== 'all') {
    scopedKeywords = scopedKeywords.filter(k => k.client_id === activeClientId);
  }

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;

    const clientIdToUse = activeClientId === 'all' ? clients[0]?.id || 'client-1' : activeClientId;
    addKeyword(clientIdToUse, newKeyword.trim(), Number(newCurrentPos), Number(newTargetPos), newSearchVol);

    setNewKeyword('');
    setIsAddKwOpen(false);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingKw) return;
    updateKeywordPosition(updatingKw.id, Number(updatedPosInput));
    setUpdatingKw(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-cyan-600 via-teal-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-cyan-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-200 text-xs font-bold uppercase tracking-widest mb-1">
            <KeyRound className="w-4 h-4" />
            <span>SEO Keyword Command Center</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Target Keyword Bank & Rank Trends
          </h2>
          <p className="text-cyan-100 text-sm mt-1">
            {activeClientId === 'all'
              ? 'Monitoring rank position trajectories across all clients'
              : `Target keywords & rank position charts for ${activeClient?.name}`}
          </p>
        </div>

        <button
          onClick={() => setIsAddKwOpen(true)}
          className="px-4 py-2.5 rounded-full bg-white text-cyan-900 font-bold text-xs flex items-center gap-1.5 shadow-md hover:bg-cyan-50 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Keyword
        </button>
      </div>

      {/* Keywords Cards Grid */}
      {scopedKeywords.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
          <KeyRound className="w-12 h-12 text-cyan-300 mx-auto mb-3" />
          <h4 className="font-extrabold text-slate-800 text-lg">No Keywords Being Tracked</h4>
          <p className="text-slate-500 text-sm max-w-md mx-auto mt-1 mb-4">
            Add target search queries to track position rank curves over time with inverted Y-axis charts!
          </p>
          <button
            onClick={() => setIsAddKwOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-cyan-600 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add First Keyword
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {scopedKeywords.map(kw => {
            const client = clients.find(c => c.id === kw.client_id);
            
            // Format history for Recharts with inverted Y-axis representation
            const chartData = kw.history.map(h => ({
              date: h.recorded_at,
              position: h.position,
            }));

            const isAchievedTarget = kw.current_position <= kw.target_position;

            return (
              <div
                key={kw.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card flex flex-col justify-between space-y-4 hover:border-cyan-400 transition-all"
              >
                {/* Top Info */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {activeClientId === 'all' && client && (
                        <span
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white shrink-0"
                          style={{ backgroundColor: client.avatar_color }}
                        >
                          {client.name}
                        </span>
                      )}
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                        Vol: {kw.search_volume || '1,000/mo'}
                      </span>
                    </div>

                    <h4 className="font-black text-slate-900 text-lg">"{kw.keyword}"</h4>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setUpdatingKw(kw);
                        setUpdatedPosInput(kw.current_position);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-cyan-50 text-cyan-700 hover:bg-cyan-100 font-bold text-xs flex items-center gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Update Rank
                    </button>
                    <button
                      onClick={() => deleteKeyword(kw.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-600 rounded-xl"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Positions Header */}
                <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Rank</span>
                    <span className="text-2xl font-black text-slate-900">#{kw.current_position}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-right">Target Rank</span>
                    <span className="text-2xl font-black text-cyan-600 text-right block">#{kw.target_position}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${isAchievedTarget ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}>
                      {isAchievedTarget ? '🎯 Target Hit' : 'Climbing'}
                    </span>
                  </div>
                </div>

                {/* Inverted Y-Axis Position Chart (#1 at top) */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                    <span>Rank Trend over Time</span>
                    <span className="text-cyan-600">Lower # is Better (#1 Top)</span>
                  </div>

                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id={`grad-${kw.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0891b2" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#0891b2" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                        {/* Reversed Y Axis so #1 is at the top */}
                        <YAxis reversed domain={[1, 'auto']} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                        <Area type="monotone" dataKey="position" stroke="#0891b2" strokeWidth={3} fillOpacity={1} fill={`url(#grad-${kw.id})`} name="Rank Position" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Add Keyword Modal */}
      {isAddKwOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleAddSubmit} className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-lg text-slate-900">Add Target Keyword</h3>
              <button type="button" onClick={() => setIsAddKwOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Target Keyword / Search Query
              </label>
              <input
                type="text"
                required
                placeholder="e.g. best dental clinic near me"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-bold text-slate-900"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Current Rank
                </label>
                <input
                  type="number"
                  min={1}
                  value={newCurrentPos}
                  onChange={(e) => setNewCurrentPos(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-bold text-slate-900 text-center"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Goal Rank
                </label>
                <input
                  type="number"
                  min={1}
                  value={newTargetPos}
                  onChange={(e) => setNewTargetPos(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-bold text-slate-900 text-center"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Search Vol.
                </label>
                <input
                  type="text"
                  value={newSearchVol}
                  onChange={(e) => setNewSearchVol(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 text-center"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddKwOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-cyan-600 text-white font-bold text-xs shadow-sm"
              >
                Track Keyword
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Update Position Modal */}
      {updatingKw && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleUpdateSubmit} className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-lg text-slate-900">Update Keyword Rank</h3>
              <button type="button" onClick={() => setUpdatingKw(null)} className="text-slate-400">✕</button>
            </div>

            <p className="text-xs font-bold text-slate-500">
              Keyword: <strong className="text-slate-900">"{updatingKw.keyword}"</strong>
            </p>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                New Recorded Position (#)
              </label>
              <input
                type="number"
                min={1}
                value={updatedPosInput}
                onChange={(e) => setUpdatedPosInput(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-lg font-black text-slate-900 text-center"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setUpdatingKw(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-cyan-600 text-white font-bold text-xs"
              >
                Record Position
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
