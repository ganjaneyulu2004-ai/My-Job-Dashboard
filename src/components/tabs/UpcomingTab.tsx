import React from 'react';
import { CalendarDays, Clock, Send, CheckCircle2, Trash2, Tag, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getWhatsAppTaskLink } from '../../utils/whatsapp';
import { Task } from '../../types';

export const UpcomingTab: React.FC = () => {
  const {
    tasks,
    clients,
    activeClientId,
    activeClient,
    toggleTaskStatus,
    deleteTask,
    filters
  } = useApp();

  const todayStr = new Date().toISOString().slice(0, 10);

  // Filter future pending tasks (date > today)
  let upcomingTasks = tasks.filter(t => t.date > todayStr);

  if (activeClientId !== 'all') {
    upcomingTasks = upcomingTasks.filter(t => t.client_id === activeClientId);
  }

  // Apply filters
  if (filters.selectedStatus && filters.selectedStatus !== 'all') {
    upcomingTasks = upcomingTasks.filter(t => t.status === filters.selectedStatus);
  }
  if (filters.selectedWorkType && filters.selectedWorkType !== 'all') {
    upcomingTasks = upcomingTasks.filter(t => t.work_type === filters.selectedWorkType);
  }
  if (filters.selectedTag) {
    upcomingTasks = upcomingTasks.filter(t => t.tags.includes(filters.selectedTag!));
  }
  if (filters.searchQuery) {
    const q = filters.searchQuery.toLowerCase();
    upcomingTasks = upcomingTasks.filter(t => t.title.toLowerCase().includes(q));
  }

  // Sort by date ascending
  upcomingTasks.sort((a, b) => a.date.localeCompare(b.date));

  // Group tasks by date
  const groupedTasks: { [date: string]: Task[] } = {};
  upcomingTasks.forEach(task => {
    if (!groupedTasks[task.date]) {
      groupedTasks[task.date] = [];
    }
    groupedTasks[task.date].push(task);
  });

  const dates = Object.keys(groupedTasks);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-agency-teal via-cyan-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-teal-500/15">
        <div className="flex items-center gap-2 text-teal-100 text-xs font-bold uppercase tracking-widest mb-1">
          <CalendarDays className="w-4 h-4" />
          <span>Timeline View</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Upcoming Works Pipeline
        </h2>
        <p className="text-teal-100 text-sm mt-1">
          {activeClientId === 'all'
            ? 'Scheduled future deliverables across all clients'
            : `Scheduled deliverables for ${activeClient?.name || 'Selected Client'}`}
        </p>
      </div>

      {dates.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
          <Clock className="w-12 h-12 text-agency-teal/40 mx-auto mb-3" />
          <h4 className="font-extrabold text-slate-800 text-lg">No Upcoming Works Scheduled</h4>
          <p className="text-slate-500 text-sm max-w-md mx-auto mt-1">
            You are all clear for future dates! Use the Add Task button in the navbar to queue future deliverables.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {dates.map((dateStr) => {
            const formattedDate = new Date(dateStr).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });

            const dayTasks = groupedTasks[dateStr];

            return (
              <div key={dateStr} className="space-y-3">
                {/* Date Divider Header */}
                <div className="flex items-center gap-3">
                  <div className="px-3.5 py-1.5 rounded-xl bg-agency-teal-light text-agency-teal font-extrabold text-xs tracking-wide shadow-xs border border-agency-teal/20 flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5" />
                    <span>{formattedDate}</span>
                  </div>
                  <div className="h-px bg-slate-200 flex-1" />
                  <span className="text-xs text-slate-400 font-bold">
                    {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
                  </span>
                </div>

                {/* Day Task Cards */}
                <div className="grid gap-3 pl-2 sm:pl-4 border-l-2 border-slate-200">
                  {dayTasks.map(task => {
                    const taskClient = clients.find(c => c.id === task.client_id);
                    const waLink = getWhatsAppTaskLink(task, taskClient);

                    return (
                      <div
                        key={task.id}
                        className="bg-white rounded-2xl p-4 border border-slate-200 shadow-card hover:border-agency-teal transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <button
                            onClick={() => toggleTaskStatus(task.id)}
                            className={`w-6 h-6 rounded-lg border-2 mt-0.5 flex items-center justify-center shrink-0 transition-all ${
                              task.status === 'done'
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : 'border-slate-300 hover:border-agency-teal bg-white'
                            }`}
                          >
                            {task.status === 'done' && <CheckCircle2 className="w-4 h-4" />}
                          </button>

                          <div className="space-y-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              {activeClientId === 'all' && taskClient && (
                                <span
                                  className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white shrink-0"
                                  style={{ backgroundColor: taskClient.avatar_color }}
                                >
                                  {taskClient.name}
                                </span>
                              )}
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-teal-100 text-agency-teal border border-teal-200">
                                {task.work_type}
                              </span>
                              {task.is_recurring && (
                                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                  🔄 {task.recurrence_rule}
                                </span>
                              )}
                            </div>

                            <h4 className="text-base font-bold text-slate-900">{task.title}</h4>

                            <div className="flex items-center gap-3 text-xs text-slate-500">
                              <span className="font-semibold text-slate-700">⏰ {task.time}</span>
                              {task.tags.map(t => (
                                <span key={t} className="text-slate-400 font-medium">#{t}</span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-whatsapp hover:bg-whatsapp-dark text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>

                          <button
                            onClick={() => deleteTask(task.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
