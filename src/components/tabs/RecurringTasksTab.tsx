import React, { useState } from 'react';
import { Repeat, Plus, CheckCircle2, Clock, Trash2, Power, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WorkType, RecurrenceRule } from '../../types';

const DAYS_OF_WEEK = [
  { id: 'sun', label: 'Sun' },
  { id: 'mon', label: 'Mon' },
  { id: 'tue', label: 'Tue' },
  { id: 'wed', label: 'Wed' },
  { id: 'thu', label: 'Thu' },
  { id: 'fri', label: 'Fri' },
  { id: 'sat', label: 'Sat' },
];

export const RecurringTasksTab: React.FC = () => {
  const { recurringTasks, activeClientId, activeClient, clients, addRecurringTask, toggleRecurringTask, deleteRecurringTask } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [title, setTitle] = useState('');
  const [recurrence, setRecurrence] = useState<RecurrenceRule>('weekly');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [showDaysError, setShowDaysError] = useState(false);
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

    if (recurrence === 'custom' && selectedDays.length === 0) {
      setShowDaysError(true);
      return;
    }

    const clientIdToUse = activeClientId === 'all' ? clients[0]?.id || 'client-1' : activeClientId;
    addRecurringTask({
      client_id: clientIdToUse,
      title: title.trim(),
      recurrence,
      recurrence_days: recurrence === 'custom' ? selectedDays : undefined,
      work_type: workType,
      tags: ['Recurring', recurrence],
      time
    });

    setTitle('');
    setSelectedDays([]);
    setShowDaysError(false);
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
          className="px-4 py-2.5 rounded-full bg-white text-orange-900 font-bold text-xs flex items-center gap-1.5 shadow-md hover:bg-orange-50 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create Recurring Rule
        </button>
      </div>

      {/* Rules List */}
      <div className="grid grid-cols-1 gap-4">
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
                      🔄 {rule.recurrence === 'custom' && rule.recurrence_days && rule.recurrence_days.length > 0
                        ? rule.recurrence_days.map(d => d.slice(0, 3).toUpperCase()).join(', ')
                        : rule.recurrence}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-100 text-purple-700">
                      {rule.work_type}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-slate-900 text-base">{rule.title}</h4>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">Auto-populates at: ⏰ {rule.time}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleRecurringTask(rule.id)}
                    className={`p-2 rounded-2xl transition-all cursor-pointer ${
                      rule.active ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                    }`}
                    title={rule.active ? 'Rule Active (Click to pause)' : 'Rule Paused (Click to activate)'}
                  >
                    <Power className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setDeleteTarget(rule)}
                    className="p-2 rounded-2xl bg-rose-50 text-rose-500 hover:bg-rose-100 hover:text-rose-700 transition-all cursor-pointer"
                    title="Delete Recurring Task Template"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-semibold text-slate-500">
                <span>Status: <strong className={rule.active ? 'text-emerald-600' : 'text-slate-400'}>{rule.active ? 'Active' : 'Paused'}</strong></span>
                <span className="text-slate-400">Auto-Generates to Today</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Dialog for Delete */}
      {deleteTarget && (() => {
        const clientObj = clients.find(c => c.id === deleteTarget.client_id);
        const clientName = clientObj ? clientObj.name : 'Selected Client';

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3 text-rose-600 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    Delete Recurring Task Template
                  </h3>
                  <p className="text-xs font-medium text-slate-500">
                    This action is permanent
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-700 font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                Are you sure you want to permanently delete this recurring task template — <strong className="text-slate-900">"{deleteTarget.title}"</strong> for <strong className="text-slate-900">{clientName}</strong>? This cannot be undone.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteRecurringTask(deleteTarget.id);
                    setDeleteTarget(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md shadow-rose-500/20 transition-all cursor-pointer"
                >
                  Delete Template
                </button>
              </div>
            </div>
          </div>
        );
      })()}

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
                  onChange={(e) => {
                    const rule = e.target.value as RecurrenceRule;
                    setRecurrence(rule);
                    if (rule === 'custom' && selectedDays.length === 0) {
                      setSelectedDays([]);
                    }
                    setShowDaysError(false);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="custom">Custom Days</option>
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

            {recurrence === 'custom' && (
              <div className="p-3 bg-orange-50 border border-orange-100 rounded-2xl space-y-1.5 animate-in fade-in duration-150">
                <label className="text-[11px] font-bold text-orange-900 uppercase tracking-wider block">
                  Select Custom Days <span className="text-rose-500">*</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {DAYS_OF_WEEK.map(day => {
                    const isSelected = selectedDays.includes(day.id);
                    return (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => {
                          setShowDaysError(false);
                          if (isSelected) {
                            setSelectedDays(selectedDays.filter(d => d !== day.id));
                          } else {
                            setSelectedDays([...selectedDays, day.id]);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                          isSelected
                            ? 'bg-orange-500 text-white border-orange-500 shadow-xs scale-105'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-orange-100'
                        }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
                {showDaysError && selectedDays.length === 0 && (
                  <p className="text-[11px] font-bold text-rose-500 mt-1">
                    ⚠️ Please select at least 1 day for custom recurrence.
                  </p>
                )}
              </div>
            )}

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
