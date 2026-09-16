import React, { useState } from 'react';
import {
  Sun,
  CheckCircle2,
  Clock,
  Send,
  Plus,
  Trash2,
  Tag,
  Sparkles,
  CalendarCheck,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Download,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { shareOrDownloadFullDayReport } from '../../utils/pdfReport';
import { sanitizePhoneNumber } from '../../utils/whatsapp';


export const TodayTab: React.FC = () => {
  const {
    tasks,
    clients,
    activeClientId,
    activeClient,
    toggleTaskStatus,
    deleteTask,
    addTask,
    filters,
    gmbSeoEntries,
    subashGlobalPhone,
    reportSentAtToday,
    markReportSentToday
  } = useApp();

  const [quickTitle, setQuickTitle] = useState('');
  const [quickWorkType, setQuickWorkType] = useState<WorkType>('GMB Post');
  const [quickTime, setQuickTime] = useState('10:00 AM');
  
  // Section collapsible state
  const [isCompletedCollapsed, setIsCompletedCollapsed] = useState(true);

  const todayStr = new Date().toISOString().slice(0, 10);
  const formattedToday = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // Filter tasks for Today
  let todayTasks = tasks.filter(t => t.date === todayStr);

  // Scoped to active client if specific client chosen
  if (activeClientId !== 'all') {
    todayTasks = todayTasks.filter(t => t.client_id === activeClientId);
  }

  // Apply global filters
  if (filters.selectedWorkType && filters.selectedWorkType !== 'all') {
    todayTasks = todayTasks.filter(t => t.work_type === filters.selectedWorkType);
  }
  if (filters.selectedTag) {
    todayTasks = todayTasks.filter(t => t.tags.includes(filters.selectedTag!));
  }
  if (filters.searchQuery) {
    const q = filters.searchQuery.toLowerCase();
    todayTasks = todayTasks.filter(t => t.title.toLowerCase().includes(q));
  }

  // Split into Pending and Completed lists
  const pendingTasks = todayTasks.filter(t => t.status === 'pending');
  const completedTasks = todayTasks.filter(t => t.status === 'done');

  // Stats calculation
  const totalTasks = todayTasks.length;
  const doneTasksCount = completedTasks.length;
  const pendingTasksCount = pendingTasks.length;
  const gmbPostsDue = todayTasks.filter(t => t.work_type === 'GMB Post' && t.status === 'pending').length;

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    const clientIdToUse = activeClientId === 'all' ? clients[0]?.id || 'client-1' : activeClientId;

    addTask({
      client_id: clientIdToUse,
      title: quickTitle.trim(),
      date: todayStr,
      time: quickTime,
      is_recurring: false,
      tags: [quickWorkType.replace(' ', '')],
      work_type: quickWorkType,
      reminder_enabled: true
    });

    setQuickTitle('');
  };

  // Handler to Send Full Day Report across ALL clients
  const handleSendFullDayReport = async () => {
    const result = await shareOrDownloadFullDayReport(
      clients,
      todayStr,
      formattedToday,
      tasks,
      gmbSeoEntries,
      subashGlobalPhone
    );

    markReportSentToday();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-orange-500/15 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-100 text-xs font-bold uppercase tracking-widest mb-1">
              <Sun className="w-4 h-4 animate-spin-slow" />
              <span>Today's Work Deck</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {formattedToday}
            </h2>
            <p className="text-amber-100 text-sm mt-1">
              {activeClientId === 'all'
                ? 'Showing tasks across all active clients'
                : `Managing daily work for ${activeClient?.name || 'Selected Client'}`}
            </p>
          </div>

          <div className="bg-white/20 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-center">
            <div className="text-2xl font-black">{doneTasksCount}/{totalTasks}</div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-100">Tasks Finished</div>
          </div>
        </div>
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Card 1: Pending Tasks */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-card flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xl shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{pendingTasksCount}</div>
            <div className="text-xs font-bold text-slate-500">Tasks Left Today</div>
          </div>
        </div>

        {/* Card 2: Done Tasks */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-card flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xl shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{doneTasksCount}</div>
            <div className="text-xs font-bold text-slate-500">Done Today</div>
          </div>
        </div>

        {/* Card 3: GMB Posts Due */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-card flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xl shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{gmbPostsDue}</div>
            <div className="text-xs font-bold text-slate-500">GMB Post Due</div>
          </div>
        </div>

        {/* Card 4: Active Clients */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-card flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 text-agency-teal flex items-center justify-center font-bold text-xl shrink-0">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{clients.length}</div>
            <div className="text-xs font-bold text-slate-500">Total Clients</div>
          </div>
        </div>

      </div>



      {/* Inline Quick Add Task Form */}
      <form onSubmit={handleQuickAdd} className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-2">
        <input
          type="text"
          placeholder="Add a new task for today (e.g. Publish GMB offer post)..."
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
        />

        <select
          value={quickWorkType}
          onChange={(e) => setQuickWorkType(e.target.value as WorkType)}
          className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none"
        >
          <option value="GMB Post">GMB Post</option>
          <option value="SEO Blog">SEO Blog</option>
          <option value="Review Response">Review Response</option>
          <option value="Ad Campaign">Ad Campaign</option>
          <option value="Social Media">Social Media</option>
          <option value="Design">Design</option>
          <option value="General">General</option>
        </select>

        <input
          type="text"
          value={quickTime}
          onChange={(e) => setQuickTime(e.target.value)}
          className="w-full sm:w-28 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 text-center"
        />

        <button
          type="submit"
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </form>

      {/* SECTION 1: PENDING TASKS (FIRST) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
              <span>🟡 Pending Tasks</span>
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
              {pendingTasks.length}
            </span>
          </div>
        </div>

        {pendingTasks.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <h4 className="font-extrabold text-slate-800 text-base">No Pending Tasks Left for Today!</h4>
            <p className="text-slate-500 text-xs mt-1">All work items for today have been completed.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {pendingTasks.map(task => {
              const taskClient = clients.find(c => c.id === task.client_id);

              return (
                <div
                  key={task.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-amber-400 transition-all duration-200 shadow-card flex items-center justify-between gap-4"
                >
                  {/* Task Row Contents (Checkbox, Tags, Title, Time, Delete) */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <button
                      onClick={() => toggleTaskStatus(task.id)}
                      className="w-6 h-6 rounded-lg border-2 mt-0.5 border-slate-300 hover:border-amber-500 bg-white flex items-center justify-center shrink-0 transition-all"
                      title="Click to mark complete"
                    />

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

                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-purple-100 text-purple-700 border border-purple-200">
                          {task.work_type}
                        </span>

                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800">
                          Pending
                        </span>

                        {task.is_recurring && (
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            🔄 {task.recurrence_rule}
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-bold text-slate-900 leading-snug">
                        {task.title}
                      </h4>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">⏰ {task.time}</span>
                        {task.tags.map(t => (
                          <span key={t} className="text-slate-400 font-medium">#{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Task Action: Delete only */}
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all shrink-0"
                    title="Delete Task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: COMPLETED TASKS (SECOND, COLLAPSIBLE / COLLAPSED BY DEFAULT) */}
      <div className="space-y-3 pt-4 border-t border-slate-200">
        <button
          onClick={() => setIsCompletedCollapsed(!isCompletedCollapsed)}
          className="w-full flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-xs text-left"
        >
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <span>✅ Completed Tasks</span>
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
              {completedTasks.length}
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-slate-500">
            <span>{isCompletedCollapsed ? 'Show Completed' : 'Hide Completed'}</span>
            {isCompletedCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </div>
        </button>

        {!isCompletedCollapsed && (
          <div>
            {completedTasks.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center border border-slate-100">
                <p className="text-slate-400 text-xs font-medium">No tasks completed today yet.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {completedTasks.map(task => {
                  const taskClient = clients.find(c => c.id === task.client_id);

                  return (
                    <div
                      key={task.id}
                      className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 opacity-80 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <button
                          onClick={() => toggleTaskStatus(task.id)}
                          className="w-6 h-6 rounded-lg border-2 mt-0.5 bg-emerald-500 border-emerald-500 text-white flex items-center justify-center shrink-0 transition-all"
                          title="Click to uncheck"
                        >
                          <CheckCircle2 className="w-4 h-4" />
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

                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-100 text-purple-700 border border-purple-200">
                              {task.work_type}
                            </span>

                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-700">
                              Completed
                            </span>
                          </div>

                          <h4 className="text-base font-bold text-slate-500 line-through leading-snug">
                            {task.title}
                          </h4>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                            <span>⏰ {task.time}</span>
                            {task.tags.map(t => (
                              <span key={t}>#{t}</span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* FEATURE 3: GLOBAL END OF DAY WHATSAPP REPORT CARD */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 rounded-3xl p-6 text-white shadow-xl space-y-4 border border-emerald-800/40">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-extrabold uppercase tracking-widest mb-1">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Global Multi-Client Executive Reporting</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Full Day Work Report to Subash Sir
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm mt-0.5">
              Generates a PDF work summary covering all client accounts today and opens WhatsApp chat ({subashGlobalPhone}).
            </p>
          </div>

          {reportSentAtToday && (
            <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1.5 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 shrink-0">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Report Sent Today at {reportSentAtToday}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
          <div className="text-xs text-slate-300 space-y-1">
            <div className="font-bold text-white flex items-center gap-1.5">
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Unified 1-Click Action</span>
            </div>
            <p className="text-slate-400 leading-relaxed max-w-lg">
              Auto-generates multi-client PDF ({doneTasksCount} completed, {pendingTasksCount} pending across agency) & opens WhatsApp chat to Subash Sir.
            </p>
          </div>

          <button
            onClick={handleSendFullDayReport}
            className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-whatsapp hover:bg-whatsapp-dark text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            <Send className="w-4 h-4" />
            <span>📤 Send Full Day Report to Subash Sir</span>
          </button>
        </div>

        <p className="text-[11px] font-semibold text-slate-400 text-center italic">
          ℹ️ PDF report will download automatically — attach it in the WhatsApp chat that opens.
        </p>

      </div>

    </div>
  );
};
