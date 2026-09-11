import React from 'react';
import { Filter, Tag, CheckCircle2, Clock, Layers, Building2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const TagsFiltersTab: React.FC = () => {
  const { filters, setFilters, tasks, clients, activeClientId, setActiveClientId, setActiveTab } = useApp();

  const allTags = Array.from(new Set(tasks.flatMap(t => t.tags)));

  const handleApplyFilterAndGoToToday = () => {
    setActiveTab('today');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-violet-500/15">
        <div className="flex items-center gap-2 text-violet-200 text-xs font-bold uppercase tracking-widest mb-1">
          <Filter className="w-4 h-4" />
          <span>Global Workspace Filter Hub</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Tags & Advanced Filters
        </h2>
        <p className="text-violet-100 text-sm mt-1">
          Slice and dice deliverables by tags, work category, status, or specific client accounts.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card space-y-6">
        
        {/* Client Selection */}
        <div>
          <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-violet-500" /> Filter by Client
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => setActiveClientId('all')}
              className={`p-3 rounded-2xl border text-xs font-bold transition-all text-left ${
                activeClientId === 'all'
                  ? 'bg-violet-600 text-white border-violet-600 shadow-md'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
            >
              ✨ All Clients (Combined)
            </button>
            {clients.map(c => (
              <button
                key={c.id}
                onClick={() => setActiveClientId(c.id)}
                className={`p-3 rounded-2xl border text-xs font-bold transition-all text-left flex items-center gap-2 ${
                  activeClientId === c.id
                    ? 'bg-violet-600 text-white border-violet-600 shadow-md'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <div className="w-5 h-5 rounded-lg text-white font-bold text-[10px] flex items-center justify-center shrink-0" style={{ backgroundColor: c.avatar_color }}>
                  {c.name.charAt(0)}
                </div>
                <span className="truncate">{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tag Filters */}
        <div>
          <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-violet-500" /> Filter by Tags
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilters(f => ({ ...f, selectedTag: undefined }))}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                !filters.selectedTag
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Clear Tag Filter
            </button>
            {allTags.map(tag => {
              const isSelected = filters.selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setFilters(f => ({ ...f, selectedTag: isSelected ? undefined : tag }))}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'bg-violet-50 text-violet-700 hover:bg-violet-100'
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={handleApplyFilterAndGoToToday}
            className="px-5 py-2.5 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md transition-all"
          >
            Apply Filters & View Today Deck →
          </button>
        </div>

      </div>

    </div>
  );
};
