import React, { useState } from 'react';
import { MapPin, Search, Plus, ArrowUpRight, ArrowDownRight, LayoutGrid, Table, Eye, MousePointer, Calendar, RefreshCw, Sparkles, ExternalLink } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GmbSeoEntry } from '../../types';

interface GmbSeoTrackingTabProps {
  onOpenLogModal: () => void;
}

export const GmbSeoTrackingTab: React.FC<GmbSeoTrackingTabProps> = ({ onOpenLogModal }) => {
  const { gmbSeoEntries, activeClientId, activeClient, clients, updateGmbSeoEntryMetrics } = useApp();

  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [updatingEntry, setUpdatingEntry] = useState<GmbSeoEntry | null>(null);
  const [newSearchPos, setNewSearchPos] = useState<number>(1);
  const [newMapsPos, setNewMapsPos] = useState<number>(1);
  const [newViews, setNewViews] = useState<number>(100);
  const [newClicks, setNewClicks] = useState<number>(20);

  const todayStr = new Date().toISOString().slice(0, 10);

  // Scoped entries
  let scopedEntries = gmbSeoEntries;
  if (activeClientId !== 'all') {
    scopedEntries = scopedEntries.filter(e => e.client_id === activeClientId);
  }

  const handleOpenUpdateModal = (entry: GmbSeoEntry) => {
    setUpdatingEntry(entry);
    setNewSearchPos(entry.search_position);
    setNewMapsPos(entry.maps_position || 1);
    setNewViews(entry.views);
    setNewClicks(entry.clicks);
  };

  const handleSaveUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingEntry) return;
    updateGmbSeoEntryMetrics(updatingEntry.id, Number(newSearchPos), Number(newMapsPos), Number(newViews), Number(newClicks));
    setUpdatingEntry(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-500 via-pink-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-rose-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-100 text-xs font-bold uppercase tracking-widest mb-1">
            <MapPin className="w-4 h-4" />
            <span>Local SEO & GMB Rank Monitor</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            GMB & SEO Performance Tracking
          </h2>
          <p className="text-rose-100 text-sm mt-1">
            {activeClientId === 'all'
              ? 'Tracking rankings, impressions & local pack positions across all clients'
              : `Tracking GMB posts & SEO blog rankings for ${activeClient?.name}`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Card / Table Toggle */}
          <div className="bg-white/10 backdrop-blur-md p-1 rounded-2xl border border-white/20 flex items-center gap-1">
            <button
              onClick={() => setViewMode('card')}
              className={`p-2 rounded-xl transition-all ${
                viewMode === 'card' ? 'bg-white text-rose-600 font-bold shadow-xs' : 'text-white hover:bg-white/10'
              }`}
              title="Card View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-xl transition-all ${
                viewMode === 'table' ? 'bg-white text-rose-600 font-bold shadow-xs' : 'text-white hover:bg-white/10'
              }`}
              title="Table View"
            >
              <Table className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onOpenLogModal}
            className="px-4 py-2.5 rounded-full bg-white text-rose-700 font-bold text-xs flex items-center gap-1.5 shadow-md hover:bg-rose-50 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" /> Log New Post/Blog
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {scopedEntries.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
          <MapPin className="w-12 h-12 text-rose-300 mx-auto mb-3" />
          <h4 className="font-extrabold text-slate-800 text-lg">No GMB or SEO Entries Logged</h4>
          <p className="text-slate-500 text-sm max-w-md mx-auto mt-1 mb-4">
            Start tracking GMB posts and blog ranks to monitor position improvements over 7-day intervals!
          </p>
          <button
            onClick={onOpenLogModal}
            className="px-4 py-2.5 rounded-xl bg-rose-500 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add First Entry
          </button>
        </div>
      ) : viewMode === 'card' ? (
        /* CARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scopedEntries.map(entry => {
            const client = clients.find(c => c.id === entry.client_id);
            const isRecheckDue = entry.next_check_date <= todayStr;
            
            // Calculate trend deltas
            const searchDelta = entry.prev_search_position ? entry.prev_search_position - entry.search_position : 0;
            const mapsDelta = entry.prev_maps_position && entry.maps_position ? entry.prev_maps_position - entry.maps_position : 0;

            return (
              <div
                key={entry.id}
                className={`bg-white rounded-3xl p-5 border shadow-card transition-all flex flex-col justify-between space-y-4 ${
                  isRecheckDue ? 'border-rose-300 ring-2 ring-rose-500/10' : 'border-slate-200 hover:border-rose-400'
                }`}
              >
                {/* Entry Top Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {activeClientId === 'all' && client && (
                        <span
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white shrink-0"
                          style={{ backgroundColor: client.avatar_color }}
                        >
                          {client.name}
                        </span>
                      )}
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          entry.type === 'gmb_post'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-teal-100 text-teal-800 border border-teal-200'
                        }`}
                      >
                        {entry.type === 'gmb_post' ? 'GMB Post' : 'SEO Blog'}
                      </span>

                      {/* 7-Day Recheck Due Badge */}
                      {isRecheckDue && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-100 text-rose-700 border border-rose-200 animate-pulse">
                          ⚠️ Recheck Due!
                        </span>
                      )}
                    </div>

                    <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-1.5">
                      <span>{entry.title}</span>
                      {entry.url && (
                        <a href={entry.url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-600">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </h4>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">Posted: {entry.date_posted}</p>
                  </div>
                </div>

                {/* Metrics Box */}
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  
                  {/* Search Rank */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Search Position
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-2xl font-black text-slate-900">#{entry.search_position}</span>
                      {searchDelta !== 0 && (
                        <span className={`text-xs font-bold flex items-center ${searchDelta > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {searchDelta > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                          {Math.abs(searchDelta)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Maps Position */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Local Maps Pack
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-2xl font-black text-slate-900">
                        {entry.maps_position ? `#${entry.maps_position}` : 'N/A'}
                      </span>
                      {mapsDelta !== 0 && (
                        <span className={`text-xs font-bold flex items-center ${mapsDelta > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {mapsDelta > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                          {Math.abs(mapsDelta)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Views */}
                  <div className="border-t border-slate-200/60 pt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Eye className="w-3 h-3 text-indigo-500" /> Impressions
                    </span>
                    <span className="text-sm font-extrabold text-slate-800">{entry.views.toLocaleString()}</span>
                  </div>

                  {/* Clicks */}
                  <div className="border-t border-slate-200/60 pt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <MousePointer className="w-3 h-3 text-emerald-500" /> Clicks / Calls
                    </span>
                    <span className="text-sm font-extrabold text-slate-800">{entry.clicks.toLocaleString()}</span>
                  </div>

                </div>

                {/* Card Footer Actions */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] font-bold text-slate-400">
                    Next Audit: <strong className="text-slate-700">{entry.next_check_date}</strong>
                  </span>

                  <button
                    onClick={() => handleOpenUpdateModal(entry)}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1 transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Log 7-Day Update
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
                  <th className="py-3.5 px-4">Title / Post</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Search Rank</th>
                  <th className="py-3.5 px-4">Maps Rank</th>
                  <th className="py-3.5 px-4">Views</th>
                  <th className="py-3.5 px-4">Clicks</th>
                  <th className="py-3.5 px-4">Recheck Due</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {scopedEntries.map(entry => {
                  const isRecheckDue = entry.next_check_date <= todayStr;
                  return (
                    <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 max-w-xs truncate">
                        {entry.title}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${entry.type === 'gmb_post' ? 'bg-purple-100 text-purple-700' : 'bg-teal-100 text-teal-700'}`}>
                          {entry.type === 'gmb_post' ? 'GMB' : 'SEO'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-black text-slate-900">#{entry.search_position}</td>
                      <td className="py-3.5 px-4 font-black text-slate-900">{entry.maps_position ? `#${entry.maps_position}` : '-'}</td>
                      <td className="py-3.5 px-4">{entry.views}</td>
                      <td className="py-3.5 px-4">{entry.clicks}</td>
                      <td className="py-3.5 px-4">
                        {isRecheckDue ? (
                          <span className="text-rose-600 font-extrabold">⚠️ Due Now</span>
                        ) : (
                          <span className="text-slate-400">{entry.next_check_date}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenUpdateModal(entry)}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 font-bold hover:bg-rose-100"
                        >
                          Update
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Metrics Update Modal */}
      {updatingEntry && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveUpdate} className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-lg text-slate-900">Update Performance Audit</h3>
              <button type="button" onClick={() => setUpdatingEntry(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <p className="text-xs font-bold text-slate-500">
              Logging updated metrics for: <strong className="text-slate-800">{updatingEntry.title}</strong>
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Google Search Rank (#)
                </label>
                <input
                  type="number"
                  min={1}
                  value={newSearchPos}
                  onChange={(e) => setNewSearchPos(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Google Maps Pack (#)
                </label>
                <input
                  type="number"
                  min={1}
                  value={newMapsPos}
                  onChange={(e) => setNewMapsPos(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Total Views / Impressions
                </label>
                <input
                  type="number"
                  value={newViews}
                  onChange={(e) => setNewViews(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Clicks / Calls
                </label>
                <input
                  type="number"
                  value={newClicks}
                  onChange={(e) => setNewClicks(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-bold text-slate-900"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setUpdatingEntry(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-rose-500 text-white font-bold text-xs shadow-sm"
              >
                Save 7-Day Update
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
