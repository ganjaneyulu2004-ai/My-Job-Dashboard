import React, { useState } from 'react';
import { Target, Plus, Trophy, CheckCircle2, AlertTriangle, TrendingUp, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Goal, GoalStatus } from '../../types';

export const GoalTrackingTab: React.FC = () => {
  const { goals, activeClientId, activeClient, clients, addGoal, updateGoalProgress } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('2026-09-30');
  const [targetValue, setTargetValue] = useState<number>(10);
  const [currentValue, setCurrentValue] = useState<number>(0);
  const [unit, setUnit] = useState('Posts');

  const [updatingGoal, setUpdatingGoal] = useState<Goal | null>(null);
  const [progressValInput, setProgressValInput] = useState<number>(0);

  // Scoped goals
  let scopedGoals = goals;
  if (activeClientId !== 'all') {
    scopedGoals = scopedGoals.filter(g => g.client_id === activeClientId);
  }

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const clientIdToUse = activeClientId === 'all' ? clients[0]?.id || 'client-1' : activeClientId;

    addGoal({
      client_id: clientIdToUse,
      description: description.trim(),
      target_date: targetDate,
      target_value: Number(targetValue),
      current_value: Number(currentValue),
      unit
    });

    setDescription('');
    setIsAddModalOpen(false);
  };

  const handleUpdateProgressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingGoal) return;
    updateGoalProgress(updatingGoal.id, Number(progressValInput));
    setUpdatingGoal(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-teal-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-100 text-xs font-bold uppercase tracking-widest mb-1">
            <Target className="w-4 h-4" />
            <span>Monthly Client Milestones</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Goal Tracking & Target Progress
          </h2>
          <p className="text-teal-100 text-sm mt-1">
            {activeClientId === 'all'
              ? 'Monthly client targets & goal progress cards across all clients'
              : `Monthly performance targets for ${activeClient?.name}`}
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-full bg-white text-teal-900 font-bold text-xs flex items-center gap-1.5 shadow-md hover:bg-teal-50 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" /> Set New Goal
        </button>
      </div>

      {/* Goal Progress Cards */}
      {scopedGoals.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
          <Target className="w-12 h-12 text-teal-300 mx-auto mb-3" />
          <h4 className="font-extrabold text-slate-800 text-lg">No Monthly Goals Set</h4>
          <p className="text-slate-500 text-sm max-w-md mx-auto mt-1 mb-4">
            Set target milestones for posts, rank positions, or review collection per client!
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Set First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scopedGoals.map(goal => {
            const client = clients.find(c => c.id === goal.client_id);
            const percentage = Math.min(100, Math.round((goal.current_value / (goal.target_value || 1)) * 100));

            let statusColor = 'bg-teal-100 text-teal-800 border-teal-200';
            let statusText = 'On Track';

            if (goal.status === 'achieved' || percentage >= 100) {
              statusColor = 'bg-emerald-500 text-white border-emerald-600';
              statusText = '🎉 Achieved!';
            } else if (goal.status === 'behind' || percentage < 40) {
              statusColor = 'bg-amber-100 text-amber-800 border-amber-200';
              statusText = 'Behind Target';
            }

            return (
              <div
                key={goal.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card flex flex-col justify-between space-y-4 hover:border-teal-400 transition-all"
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
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${statusColor}`}>
                        {statusText}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-slate-900 text-base">{goal.description}</h4>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">Target Date: {goal.target_date}</p>
                  </div>

                  <button
                    onClick={() => {
                      setUpdatingGoal(goal);
                      setProgressValInput(goal.current_value);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-teal-50 text-agency-teal font-bold text-xs shrink-0 hover:bg-teal-100"
                  >
                    Update Progress
                  </button>
                </div>

                {/* Progress Bar & Counter */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Progress: {goal.current_value} / {goal.target_value} {goal.unit || ''}</span>
                    <span className="text-agency-teal font-black">{percentage}%</span>
                  </div>

                  {/* Colorful Progress Bar */}
                  <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-agency-teal via-emerald-500 to-cyan-500 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Add Goal Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleAddSubmit} className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-lg text-slate-900">Set Monthly Client Goal</h3>
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-slate-400">✕</button>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Goal Description
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Generate 500 Google Maps Direct Calls"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-bold text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Target Value
                </label>
                <input
                  type="number"
                  required
                  value={targetValue}
                  onChange={(e) => setTargetValue(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Unit (e.g. Calls, Posts)
                </label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900"
                />
              </div>
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
                className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs shadow-sm"
              >
                Save Goal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Update Progress Modal */}
      {updatingGoal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleUpdateProgressSubmit} className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-lg text-slate-900">Update Goal Progress</h3>
              <button type="button" onClick={() => setUpdatingGoal(null)} className="text-slate-400">✕</button>
            </div>

            <p className="text-xs font-bold text-slate-500">
              Goal: <strong className="text-slate-900">{updatingGoal.description}</strong>
            </p>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Current Achieved Value (Target: {updatingGoal.target_value})
              </label>
              <input
                type="number"
                value={progressValInput}
                onChange={(e) => setProgressValInput(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-lg font-black text-slate-900 text-center"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setUpdatingGoal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs"
              >
                Update Progress
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
