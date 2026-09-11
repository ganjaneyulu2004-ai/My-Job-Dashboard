import React from 'react';
import { Filter, X, Tag, CheckCircle2, Clock, Layers } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WorkType, TaskStatus } from '../../types';

export const GlobalFilterBar: React.FC = () => {
  const { filters, setFilters, isFilterOpen, setIsFilterOpen, tasks, clients } = useApp();

  // Collect unique tags across all tasks
  const allTags = Array.from(new Set(tasks.flatMap(t => t.tags)));

  const workTypes: WorkType[] = [
    'GMB Post',
    'SEO Blog',
    'Social Media',
    'Design',
    'Ad Campaign',
    'Review Response',
    'Website Update',
    'General'
  ];

  const handleResetFilters = () => {
    setFilters({
      selectedTag: undefined,
      selectedStatus: 'all',
      selectedWorkType: 'all',
      searchQuery: ''
    });
  };

  if (!isFilterOpen) return null;

  return (
    <div className="bg-white border-b border-slate-200 p-4 animate-in fade-in slide-in-from-top-1 duration-200">
      <div className="max-w-7xl mx-auto flex flex-col gap-4">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <Filter className="w-4 h-4 text-agency-purple" />
            <span>Global Filter & Tag Selector</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetFilters}
              className="text-xs text-slate-500 hover:text-slate-800 underline font-medium"
            >
              Reset Filters
            </button>
            <button
              onClick={() => setIsFilterOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Rows */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Status Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Task Status
            </label>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setFilters(f => ({ ...f, selectedStatus: 'all' }))}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                  filters.selectedStatus === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Status
              </button>
              <button
                onClick={() => setFilters(f => ({ ...f, selectedStatus: 'pending' }))}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                  filters.selectedStatus === 'pending'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilters(f => ({ ...f, selectedStatus: 'done' }))}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                  filters.selectedStatus === 'done'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Completed
              </button>
            </div>
          </div>

          {/* Work Type Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Work Category
            </label>
            <select
              value={filters.selectedWorkType || 'all'}
              onChange={(e) => setFilters(f => ({ ...f, selectedWorkType: e.target.value as any }))}
              className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
            >
              <option value="all">All Categories</option>
              {workTypes.map(wt => (
                <option key={wt} value={wt}>{wt}</option>
              ))}
            </select>
          </div>

          {/* Search Query */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Search Title
            </label>
            <input
              type="text"
              placeholder="Search tasks or keywords..."
              value={filters.searchQuery || ''}
              onChange={(e) => setFilters(f => ({ ...f, searchQuery: e.target.value }))}
              className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
            />
          </div>

        </div>

        {/* Tag Chips */}
        {allTags.length > 0 && (
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Popular Tags
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setFilters(f => ({ ...f, selectedTag: undefined }))}
                className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                  !filters.selectedTag
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Tags
              </button>
              {allTags.map(tag => {
                const isSelected = filters.selectedTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => setFilters(f => ({ ...f, selectedTag: isSelected ? undefined : tag }))}
                    className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                      isSelected
                        ? 'bg-agency-purple text-white shadow-xs'
                        : 'bg-purple-50 text-agency-purple hover:bg-purple-100'
                    }`}
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
