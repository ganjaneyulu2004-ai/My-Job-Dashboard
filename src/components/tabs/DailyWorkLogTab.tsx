import React, { useState } from 'react';
import { FileText, Plus, CheckCircle2, MessageSquare, Clock, User, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DailyWorkLogTab: React.FC = () => {
  const { workLogs, activeClientId, activeClient, clients, addWorkLogNote } = useApp();

  const [noteInput, setNoteInput] = useState('');

  // Scoped logs
  let scopedLogs = workLogs;
  if (activeClientId !== 'all') {
    scopedLogs = scopedLogs.filter(l => l.client_id === activeClientId);
  }

  // Sort logs by newest first
  scopedLogs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;

    const clientIdToUse = activeClientId === 'all' ? clients[0]?.id || 'client-1' : activeClientId;
    addWorkLogNote(clientIdToUse, noteInput.trim());
    setNoteInput('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-slate-900/15">
        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
          <FileText className="w-4 h-4 text-purple-400" />
          <span>Audit & Activity Stream</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Daily Work Log & Notes
        </h2>
        <p className="text-slate-300 text-sm mt-1">
          {activeClientId === 'all'
            ? 'Unified real-time activity stream for all clients'
            : `Completed task log & notes for ${activeClient?.name}`}
        </p>
      </div>

      {/* Manual Note Adding Box */}
      <form onSubmit={handleAddNote} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-card space-y-3">
        <label className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-agency-purple" />
          <span>Add Manual Daily Note / Client Call Log</span>
        </label>
        
        <textarea
          rows={3}
          placeholder="Record client discussions, strategy decisions, or custom updates for today..."
          value={noteInput}
          onChange={(e) => setNoteInput(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 resize-none"
        />

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-agency-purple hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> Save Note Entry
          </button>
        </div>
      </form>

      {/* Activity Timeline Feed */}
      <div className="space-y-3">
        <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
          <span>Activity Feed</span>
          <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
            {scopedLogs.length}
          </span>
        </h3>

        {scopedLogs.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="font-extrabold text-slate-800 text-lg">No Activity Logged Yet</h4>
            <p className="text-slate-500 text-sm max-w-md mx-auto mt-1">
              Work log entries are automatically generated when you check off tasks on the Today tab!
            </p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-4 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {scopedLogs.map(log => {
              const logClient = clients.find(c => c.id === log.client_id);
              const formattedTime = new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const formattedDate = new Date(log.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

              return (
                <div key={log.id} className="relative group">
                  {/* Timeline Dot */}
                  <div
                    className={`absolute -left-[27px] top-1.5 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[10px] shadow-xs ${
                      log.auto_generated ? 'bg-emerald-500 text-white' : 'bg-purple-600 text-white'
                    }`}
                  >
                    {log.auto_generated ? '✓' : '✎'}
                  </div>

                  {/* Card Container */}
                  <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-card hover:border-slate-300 transition-all space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {activeClientId === 'all' && logClient && (
                          <span
                            className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white shrink-0"
                            style={{ backgroundColor: logClient.avatar_color }}
                          >
                            {logClient.name}
                          </span>
                        )}

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            log.auto_generated
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {log.auto_generated ? 'Auto Completion' : 'Manual Note'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formattedDate} at {formattedTime}</span>
                      </div>
                    </div>

                    <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                      {log.note}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
