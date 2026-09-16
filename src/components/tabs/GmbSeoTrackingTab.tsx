import React, { useState } from 'react';
import { MapPin, Plus, Search, Eye, MousePointer, Calendar, Edit3, Filter } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GmbSeoEntry, GmbSeoType } from '../../types';

interface GmbSeoTrackingTabProps {
  onOpenLogModal: (entry?: GmbSeoEntry) => void;
}

export const GmbSeoTrackingTab: React.FC<GmbSeoTrackingTabProps> = ({ onOpenLogModal }) => {
  const { gmbSeoEntries, clients, activeClientId } = useApp();

  const [typeFilter, setTypeFilter] = useState<'all' | GmbSeoType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const todayStr = new Date().toISOString().slice(0, 10);

  // Filter entries by active client, type, search query
  let scopedEntries = gmbSeoEntries;
  if (activeClientId !== 'all') {
    scopedEntries = scopedEntries.filter(e => e.client_id === activeClientId);
  }
  if (typeFilter !== 'all') {
    scopedEntries = scopedEntries.filter(e => e.type === typeFilter);
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    scopedEntries = scopedEntries.filter(e => e.title.toLowerCase().includes(q));
  }

  const dueCount = scopedEntries.filter(e => e.next_check_date <= todayStr).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-500 via-pink-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-rose-500/15 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-rose-100 text-xs font-bold uppercase tracking-widest mb-1.5">
            <MapPin className="w-4 h-4" />
            <span>SEO & Local Pack Visibility</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            GMB & SEO Rank Tracking
          </h2>
          <p className="text-rose-100 text-sm mt-1 max-w-xl">
            Monitor Google Maps pack positions, organic search ranks, impressions, and scheduled rechecks for all marketing content.
          </p>
        </div>

        <button
          onClick={() => onOpenLogModal()}
          className="px-5 py-3 rounded-2xl bg-white text-rose-600 hover:bg-rose-50 font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 shrink-0 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log New GMB / SEO Post</span>
        </button>
      </div>

      {/* Filter & Search Control Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-card flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search titles or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Type:
          </span>
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              typeFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Entries ({gmbSeoEntries.length})
          </button>
          <button
            onClick={() => setTypeFilter('gmb_post')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              typeFilter === 'gmb_post'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            📍 GMB Posts
          </button>
          <button
            onClick={() => setTypeFilter('seo_blog')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              typeFilter === 'seo_blog'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            📝 SEO Blogs
          </button>
        </div>
      </div>

      {/* CARD GRID LAYOUT (Requirement 2) */}
      {scopedEntries.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
          <MapPin className="w-12 h-12 text-rose-300 mx-auto mb-3" />
          <h4 className="font-extrabold text-slate-800 text-lg">No GMB / SEO Entries Found</h4>
          <p className="text-slate-500 text-sm max-w-md mx-auto mt-1">
            No tracking entries match your current client or filter criteria. Click "+ Log New GMB / SEO Post" to start tracking.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scopedEntries.map((entry) => {
            const clientObj = clients.find(c => c.id === entry.client_id);
            const isDue = entry.next_check_date <= todayStr;

            return (
              <div
                key={entry.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-card hover:border-rose-300 transition-all flex flex-col justify-between space-y-4"
              >
                {/* TOP: Title / Post name (bold) + Type badge */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-extrabold text-slate-900 text-base leading-snug line-clamp-2">
                      {entry.title}
                    </h4>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide shrink-0 ${
                        entry.type === 'gmb_post'
                          ? 'bg-purple-100 text-purple-700 border border-purple-200'
                          : 'bg-teal-100 text-teal-700 border border-teal-200'
                      }`}
                    >
                      {entry.type === 'gmb_post' ? '📍 GMB' : '📝 Blog'}
                    </span>
                  </div>

                  {activeClientId === 'all' && clientObj && (
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: clientObj.avatar_color }}
                      />
                      <span className="text-xs font-bold text-slate-600">
                        {clientObj.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* MIDDLE: Search Rank and Maps Rank as two side-by-side stat tiles with large numbers */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Search Rank
                    </span>
                    <div className="flex items-center justify-center gap-1 mt-0.5">
                      <span className="text-2xl font-black text-slate-900">
                        #{entry.search_position}
                      </span>
                      {entry.prev_search_position && entry.prev_search_position !== entry.search_position && (
                        <span
                          className={`text-[11px] font-extrabold ${
                            entry.search_position < entry.prev_search_position
                              ? 'text-emerald-600'
                              : 'text-rose-500'
                          }`}
                        >
                          {entry.search_position < entry.prev_search_position
                            ? `↑${entry.prev_search_position - entry.search_position}`
                            : `↓${entry.search_position - entry.prev_search_position}`}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Maps Rank
                    </span>
                    <div className="flex items-center justify-center gap-1 mt-0.5">
                      <span className="text-2xl font-black text-slate-900">
                        {entry.maps_position ? `#${entry.maps_position}` : 'N/A'}
                      </span>
                      {entry.prev_maps_position && entry.maps_position && entry.prev_maps_position !== entry.maps_position && (
                        <span
                          className={`text-[11px] font-extrabold ${
                            entry.maps_position < entry.prev_maps_position
                              ? 'text-emerald-600'
                              : 'text-rose-500'
                          }`}
                        >
                          {entry.maps_position < entry.prev_maps_position
                            ? `↑${entry.prev_maps_position - entry.maps_position}`
                            : `↓${entry.maps_position - entry.prev_maps_position}`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* BELOW: Views and Clicks as smaller stat numbers side by side */}
                <div className="grid grid-cols-2 gap-3 bg-slate-50/70 p-2.5 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <Eye className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>{entry.views.toLocaleString()} Views</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <MousePointer className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                    <span>{entry.clicks.toLocaleString()} Clicks</span>
                  </div>
                </div>

                {/* BOTTOM: Recheck Due date (muted, small) + "Update" button (right-aligned) */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Recheck:{' '}
                      <strong
                        className={
                          isDue
                            ? 'text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-200/60'
                            : 'text-slate-600 font-semibold'
                        }
                      >
                        {entry.next_check_date}
                      </strong>
                    </span>
                  </div>

                  <button
                    onClick={() => onOpenLogModal(entry)}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs shadow-sm transition-all flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Update</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
