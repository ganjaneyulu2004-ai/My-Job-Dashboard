import React, { useState } from 'react';
import { Repeat, Plus, CheckCircle2, Clock, Trash2, Power, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WorkType } from '../../types';

export const RecurringTasksTab: React.FC = () => {
  const { recurringTasks, activeClientId, activeClient, clients, addRecurringTask, toggleRecurringTask } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [recurrence, setRecurrence] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [workType, setWorkType] = useState<WorkType>('GMB Post');
  const [time, setTime] = useState('09:30 AM');

  // Scoped recurring rules
  let scopedRules = recurringTasks;
  if (activeClientId !== 'all') {
    scopedRules = scopedRules.filter(r => r.client_id === activeClientId);
  }

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const clientIdToUse = activeClientId === 'all' ? clients[0]?.id || 'client-1' : activeClientId;
    addRecurringTask({
      client_id: clientIdToUse,
      title: title.trim(),
      recurrence,
      work_type: workType,
      tags: ['Recurring', recurrence],
      time
    });

    setTitle('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-orange-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-orange-100 text-xs font-bold uppercase tracking-widest mb-1">
            <Repeat className="w-4 h-4" />
            <span>Automated Task Scheduling</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Recurring Task Automation Rules
          </h2>
          <p className="text-orange-100 text-sm mt-1">
            {activeClientId === 'all'
              ? 'Active daily, weekly & monthly repeating schedules across all clients'
              : `Recurring rules for ${activeClient?.name}`}
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-full bg-white text-orange-900 font-bold text-xs flex items-center gap-1.5 shadow-md hover:bg-orange-50 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" /> Create Recurring Rule
        </button>
      </div>

      {/* Rules List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scopedRules.map(rule => {
          const client = clients.find(c => c.id === rule.client_id);
          return (
            <div
              key={rule.id}
              className={`bg-white rounded-3xl p-5 border shadow-card transition-all flex flex-col justify-between space-y-4 ${
                rule.active ? 'border-slate-200 hover:border-orange-400' : 'border-slate-100 opacity-60 bg-slate-50'
              }`}
            >
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
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-orange-100 text-orange-800">
                      🔄 {rule.recurrence}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-100 text-purple-700">
                      {rule.work_type}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-slate-900 text-base">{rule.title}</h4>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">Auto-populates at: ⏰ {rule.time}</p>
                </div>

                <button
                  onClick={() => toggleRecurringTask(rule.id)}
                  className={`p-2 rounded-2xl transition-all ${
                    rule.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                  }`}
                  title={rule.active ? 'Rule Active (Click to disable)' : 'Rule Disabled (Click to activate)'}
                >
                  <Power className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-semibold text-slate-500">
                <span>Status: <strong className={rule.active ? 'text-emerald-600' : 'text-slate-400'}>{rule.active ? 'Active' : 'Paused'}</strong></span>
                <span className="text-slate-400">Auto-Generates to Today</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Recurring Rule Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleAddSubmit} className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-lg text-slate-900">New Recurring Task Template</h3>
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-slate-400">✕</button>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Task Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Weekly GMB Offer Post & Photos"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-bold text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Recurrence Schedule
                </label>
                <select
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Work Category
                </label>
                <select
                  value={workType}
                  onChange={(e) => setWorkType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800"
                >
                  <option value="GMB Post">GMB Post</option>
                  <option value="SEO Blog">SEO Blog</option>
                  <option value="Review Response">Review Response</option>
                  <option value="Ad Campaign">Ad Campaign</option>
                  <option value="General">General</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Default Time
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 text-center"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-orange-500 text-white font-bold text-xs shadow-sm"
              >
                Create Rule
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
