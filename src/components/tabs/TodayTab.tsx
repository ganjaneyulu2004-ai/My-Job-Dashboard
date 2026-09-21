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
  Check,
  Copy,
  Globe,
  ExternalLink,
  Save,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WorkType, Task } from '../../types';
import { shareOrDownloadFullDayReport } from '../../utils/pdfReport';
import { sanitizePhoneNumber } from '../../utils/whatsapp';
import { copyArticleToClipboard } from '../../utils/backlinkUtils';

export const TodayTab: React.FC = () => {
  const {
    tasks,
    clients,
    activeClientId,
    activeClient,
    getTodayTasks,
    toggleTaskStatus,
    deleteTask,
    addTask,
    filters,
    gmbSeoEntries,
    subashGlobalPhone,
    reportSentAtToday,
    markReportSentToday,
    backlinks,
    generateBacklinkBlogContent,
    updateBacklinkLiveUrl
  } = useApp();

  const [quickTitle, setQuickTitle] = useState('');
  const [quickWorkType, setQuickWorkType] = useState<WorkType>('GMB Post');
  const [quickTime, setQuickTime] = useState('10:00 AM');

  // Section collapsible state
  const [isCompletedCollapsed, setIsCompletedCollapsed] = useState(true);

  // Backlink Modal & Card State
  const [activeBacklinkId, setActiveBacklinkId] = useState<string | null>(null);
  const [isGeneratingBlog, setIsGeneratingBlog] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [liveUrlInput, setLiveUrlInput] = useState('');
  const [isSubmittingLive, setIsSubmittingLive] = useState(false);
  const [cardLiveUrls, setCardLiveUrls] = useState<Record<string, string>>({});
  const [copiedCardId, setCopiedCardId] = useState<string | null>(null);
  const [modalArticleExpanded, setModalArticleExpanded] = useState(false);

  // Report sharing modal / phone state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Get Today's tasks safely
  let todayTasks = getTodayTasks(activeClientId);

  // Apply filters if set
  if (filters.selectedStatus && filters.selectedStatus !== 'all') {
    todayTasks = todayTasks.filter(t => t.status === filters.selectedStatus);
  }
  if (filters.selectedWorkType && filters.selectedWorkType !== 'all') {
    todayTasks = todayTasks.filter(t => t.work_type === filters.selectedWorkType);
  }
  if (filters.searchQuery && filters.searchQuery.trim()) {
    const q = filters.searchQuery.toLowerCase();
    todayTasks = todayTasks.filter(t => {
      const client = clients.find(c => c.id === t.client_id);
      return (
        t.title.toLowerCase().includes(q) ||
        (t.assigned_employee && t.assigned_employee.toLowerCase().includes(q)) ||
        (client && client.name.toLowerCase().includes(q)) ||
        (t.tags && t.tags.some(tag => tag.toLowerCase().includes(q)))
      );
    });
  }

  const pendingTasks = todayTasks.filter(t => t.status === 'pending');
  const doneTasks = todayTasks.filter(t => t.status === 'done');

  // Stats calculation
  const totalTasks = todayTasks.length;
  const pendingTasksCount = pendingTasks.length;
  const doneTasksCount = doneTasks.length;
  const gmbPostsDue = pendingTasks.filter(t => t.work_type === 'GMB Post').length;

  const handleQuickAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    const clientIdToUse = activeClientId === 'all' ? clients[0]?.id || 'client-1' : activeClientId;
    const todayStr = new Date().toISOString().slice(0, 10);

    addTask({
      client_id: clientIdToUse,
      title: quickTitle.trim(),
      date: todayStr,
      time: quickTime,
      is_recurring: false,
      tags: ['QuickTask'],
      work_type: quickWorkType,
      reminder_enabled: true
    });

    setQuickTitle('');
  };

  // Group pending tasks by Client for clear client headers
  const pendingTasksByClient = pendingTasks.reduce((acc, task) => {
    const cid = task.client_id || 'general';
    if (!acc[cid]) acc[cid] = [];
    acc[cid].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const pendingClientGroups = Object.entries(pendingTasksByClient).map(([cid, groupTasks]) => {
    const clientObj = clients.find(c => c.id === cid);
    return {
      clientId: cid,
      clientName: clientObj ? clientObj.name : 'General / All Clients',
      clientColor: clientObj?.avatar_color || '#64748b',
      tasks: groupTasks
    };
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-orange-500/15 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-100 text-xs font-bold uppercase tracking-widest mb-1">
              <Sun className="w-4 h-4" />
              <span>Today's Execution Checklist</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Daily Operations Hub
            </h2>
            <p className="text-amber-100 text-sm mt-1">
              {activeClientId === 'all'
                ? `Managing deliverables across all ${clients.length} active client accounts`
                : `Active task checklist for ${activeClient?.name}`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsReportModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white font-extrabold text-xs transition-all shadow-sm cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Send Full Day Report to Subash Sir</span>
            </button>

            <div className="bg-white/20 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-center">
              <div className="text-2xl font-black">{doneTasksCount}/{totalTasks}</div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-100">Tasks Finished</div>
            </div>
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
            <div className="text-xs font-bold text-slate-500">Active Clients</div>
          </div>
        </div>

      </div>

      {/* Quick Add Task Form */}
      <form onSubmit={handleQuickAddTask} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-card space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <Plus className="w-4 h-4 text-orange-500" />
          <span>Quick Add Task to Today's Deck</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            required
            placeholder="e.g. Upload GMB offer post & photos for today..."
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
          />

          <select
            value={quickWorkType}
            onChange={(e) => setQuickWorkType(e.target.value as WorkType)}
            className="w-full sm:w-48 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
          >
            <option value="GMB Post">GMB Post</option>
            <option value="SEO Blog">SEO Blog</option>
            <option value="Review Response">Review Response</option>
            <option value="Ad Campaign">Ad Campaign</option>
            <option value="General">General</option>
          </select>

          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs shadow-md shadow-orange-500/20 transition-all shrink-0 cursor-pointer"
          >
            + Add Task
          </button>
        </div>
      </form>

      {/* PENDING TASKS SECTION (Grouped by Client) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" /> Pending Work Items
          </h3>
          <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
            {pendingTasksCount} Pending
          </span>
        </div>

        {pendingClientGroups.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-800">All Tasks Finished for Today! 🎉</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Great work! No pending tasks remaining for this client view. Click "Send Full Day Report to Subash Sir" above to share your work summary.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingClientGroups.map(group => (
              <div key={group.clientId} className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-card space-y-4">
                
                {/* Client Header Bar */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: group.clientColor }}
                    />
                    <h4 className="font-extrabold text-slate-900 text-base">
                      {group.clientName}
                    </h4>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                      {group.tasks.length} {group.tasks.length === 1 ? 'Deliverable' : 'Deliverables'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-extrabold text-amber-600">
                    <span>{group.tasks.filter(t => t.status === 'pending').length} Pending</span>
                  </div>
                </div>

                {/* Tasks List */}
                <div className="space-y-3">
                  {group.tasks.map(task => {
                    const taskClient = clients.find(c => c.id === task.client_id);
                    const isBacklinkTask = Boolean(task.backlink_id);
                    const bl = isBacklinkTask ? backlinks.find(b => b.id === task.backlink_id) : null;
                    const currentCardInput = bl ? (cardLiveUrls[bl.id] !== undefined ? cardLiveUrls[bl.id] : (bl.live_url || '')) : '';

                    if (isBacklinkTask && bl) {
                      return (
                        <div
                          key={task.id}
                          className="bg-white rounded-3xl p-5 border border-indigo-100 hover:border-indigo-300 transition-all duration-200 shadow-card space-y-4"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                            <div className="flex items-start gap-3 min-w-0 flex-1">
                              <button
                                onClick={async () => {
                                  if (!currentCardInput.trim() && !bl.live_url) {
                                    alert('Please enter or paste the Live Published URL to mark this backlink task as Completed!');
                                    return;
                                  }
                                  const urlToUse = currentCardInput.trim() || bl.live_url || '';
                                  await updateBacklinkLiveUrl(bl.id, urlToUse);
                                }}
                                className="w-6 h-6 rounded-lg border-2 mt-0.5 border-slate-300 hover:border-emerald-500 bg-white flex items-center justify-center shrink-0 transition-all cursor-pointer"
                                title="Click to mark complete with Live URL"
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
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-indigo-100 text-indigo-800 border border-indigo-200">
                                    🔗 Backlink Placement
                                  </span>
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800">
                                    Pending
                                  </span>
                                </div>

                                <div className="pt-0.5">
                                  {(() => {
                                    const webHref = bl.website_name.startsWith('http://') || bl.website_name.startsWith('https://')
                                      ? bl.website_name
                                      : `https://${bl.website_name}`;
                                    return (
                                      <a
                                        href={webHref}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-base font-extrabold text-blue-600 hover:text-blue-800 underline flex items-center gap-1.5"
                                      >
                                        🌐 {bl.website_name} <ExternalLink className="w-3.5 h-3.5 shrink-0 text-blue-500" />
                                      </a>
                                    );
                                  })()}
                                </div>

                                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-0.5">
                                  <span className="font-semibold text-indigo-600">
                                    Anchor: <strong className="text-slate-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{bl.anchor_text}</strong>
                                  </span>
                                  <a
                                    href={bl.target_page_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 underline font-bold truncate max-w-xs flex items-center gap-1"
                                  >
                                    Target: {bl.target_page_url} <ExternalLink className="w-3 h-3 shrink-0 text-blue-500" />
                                  </a>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                              {bl.blog_content && (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    await copyArticleToClipboard(bl.blog_content!);
                                    setCopiedCardId(bl.id);
                                    setTimeout(() => setCopiedCardId(null), 2000);
                                  }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-100 font-extrabold text-xs transition-all cursor-pointer"
                                  title="Copy Generated Blog Article to Clipboard"
                                >
                                  {copiedCardId === bl.id ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                                      <span className="text-emerald-600">Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5 text-purple-600" />
                                      <span>📋 Copy Article</span>
                                    </>
                                  )}
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  setLiveUrlInput(bl.live_url || '');
                                  setActiveBacklinkId(bl.id);
                                }}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-xs transition-all cursor-pointer"
                                title="Open Full Workflow Modal"
                              >
                                <Globe className="w-3.5 h-3.5" />
                                <span>Workflow</span>
                              </button>

                              <button
                                onClick={() => deleteTask(task.id)}
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                title="Delete Task"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Inline Live URL Submission Row */}
                          <div className="flex flex-col sm:flex-row items-center gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80">
                            <input
                              type="url"
                              placeholder="Paste Live Published URL (e.g. https://website.com/article)..."
                              value={currentCardInput}
                              onChange={(e) => setCardLiveUrls(prev => ({ ...prev, [bl.id]: e.target.value }))}
                              className="flex-1 w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                            />
                            <button
                              type="button"
                              onClick={async () => {
                                if (!currentCardInput.trim()) return;
                                setIsSubmittingLive(true);
                                await updateBacklinkLiveUrl(bl.id, currentCardInput.trim());
                                setIsSubmittingLive(false);
                              }}
                              disabled={isSubmittingLive || !currentCardInput.trim()}
                              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs disabled:opacity-50 transition-all cursor-pointer shrink-0"
                            >
                              <Save className="w-3.5 h-3.5" />
                              <span>Submit Live URL</span>
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={task.id}
                        className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-amber-400 transition-all duration-200 shadow-card flex items-center justify-between gap-4"
                      >
                        {/* Task Row Contents */}
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <button
                            onClick={() => toggleTaskStatus(task.id)}
                            className="w-6 h-6 rounded-lg border-2 mt-0.5 border-slate-300 hover:border-amber-500 bg-white flex items-center justify-center shrink-0 transition-all cursor-pointer"
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

                              {task.assigned_employee && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                                  👤 {task.assigned_employee}
                                </span>
                              )}
                            </div>

                            <h4 className="font-extrabold text-slate-900 text-sm">{task.title}</h4>

                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 font-semibold">
                              <span>⏰ {task.time}</span>
                              {task.tags && task.tags.map(t => (
                                <span key={t} className="text-slate-400">#{t}</span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer shrink-0"
                          title="Delete task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* COMPLETED TASKS SECTION (Collapsible) */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={() => setIsCompletedCollapsed(!isCompletedCollapsed)}
          className="w-full flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="font-extrabold text-sm text-slate-900">
              Completed Tasks Today ({doneTasksCount})
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <span>{isCompletedCollapsed ? 'Show Finished Tasks' : 'Hide Finished Tasks'}</span>
            {isCompletedCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </div>
        </button>

        {!isCompletedCollapsed && (
          <div className="space-y-3 animate-in fade-in duration-200">
            {doneTasks.length === 0 ? (
              <p className="text-xs text-slate-400 font-semibold text-center py-4">No completed tasks yet today.</p>
            ) : (
              doneTasks.map(task => {
                const taskClient = clients.find(c => c.id === task.client_id);
                return (
                  <div
                    key={task.id}
                    className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex items-center justify-between gap-4 opacity-75"
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <button
                        onClick={() => toggleTaskStatus(task.id)}
                        className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 cursor-pointer mt-0.5"
                        title="Click to unmark"
                      >
                        <Check className="w-4 h-4" />
                      </button>

                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {taskClient && (
                            <span
                              className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white shrink-0"
                              style={{ backgroundColor: taskClient.avatar_color }}
                            >
                              {taskClient.name}
                            </span>
                          )}
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                            ✓ Done
                          </span>
                        </div>
                        <h4 className="font-extrabold text-slate-800 text-sm line-through">{task.title}</h4>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-xl transition-all cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* FULL DAY REPORT WHATSAPP SHARE MODAL */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Send Full Day Report</h3>
                  <p className="text-xs font-semibold text-slate-400">Share today's work summary with Subash Sir</p>
                </div>
              </div>
              <button onClick={() => setIsReportModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between font-bold">
                  <span>📅 Today's Date:</span>
                  <span>{new Date().toISOString().slice(0, 10)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>✅ Completed Tasks:</span>
                  <span className="text-emerald-600">{doneTasksCount}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>⏳ Pending Tasks:</span>
                  <span className="text-amber-600">{pendingTasksCount}</span>
                </div>
              </div>

              {reportSentAtToday && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Report already shared today at {reportSentAtToday}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  shareOrDownloadFullDayReport(
                    todayTasks,
                    clients,
                    gmbSeoEntries,
                    subashGlobalPhone
                  );
                  markReportSentToday();
                  setIsReportModalOpen(false);
                }}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Open WhatsApp Report</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BACKLINK WORKFLOW MODAL */}
      {activeBacklinkId && (() => {
        const bl = backlinks.find(b => b.id === activeBacklinkId);
        if (!bl) return null;

        const clientObj = clients.find(c => c.id === bl.client_id);
        const isLive = bl.status === 'live' || bl.status === 'completed' || Boolean(bl.live_url);

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">
                    🌐
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">
                      Backlink Placement Workflow — {bl.website_name}
                    </h3>
                    {clientObj && (
                      <span className="text-xs font-semibold text-slate-500">
                        Client: {clientObj.name}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setActiveBacklinkId(null)}
                  className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Reference Info Box */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2 text-xs my-4 shrink-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-indigo-600">
                    <Tag className="w-3.5 h-3.5 inline mr-1" /> Anchor Text: <strong className="text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">{bl.anchor_text}</strong>
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${isLive ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-200'}`}>
                    {isLive ? '🟢 Completed' : '⚪ Pending'}
                  </span>
                </div>

                <div className="pt-1">
                  <a
                    href={bl.target_page_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-600 hover:text-indigo-600 underline font-medium truncate block flex items-center gap-1"
                  >
                    Target: {bl.target_page_url} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* COMPLETED WORKFLOW MODAL SUMMARY vs PENDING STEPS */}
              {isLive ? (
                <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 space-y-3 my-2">
                  <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <h4 className="font-extrabold text-sm text-emerald-950">
                          Backlink Placement Completed
                        </h4>
                        <span className="text-[11px] font-bold text-emerald-700">
                          📅 Date Live: {bl.date_live || (bl.completed_at ? bl.completed_at.slice(0, 10) : bl.date_added)}
                        </span>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-emerald-600 text-white">
                      ✅ Completed
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-3 rounded-xl border border-emerald-200/80 text-xs">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-bold text-slate-500 shrink-0">Live URL:</span>
                      <a
                        href={bl.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-extrabold text-blue-600 hover:text-blue-800 underline truncate flex items-center gap-1"
                      >
                        {bl.live_url} <ExternalLink className="w-3.5 h-3.5 shrink-0 text-blue-500" />
                      </a>
                    </div>

                    {bl.blog_content && (
                      <button
                        type="button"
                        onClick={async () => {
                          await copyArticleToClipboard(bl.blog_content!);
                          setCopiedText(true);
                          setTimeout(() => setCopiedText(false), 2000);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 font-bold text-xs transition-colors shrink-0 cursor-pointer"
                      >
                        {copiedText ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-emerald-600" />
                            <span>📋 Copy Article</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {bl.blog_content && (
                    <div className="space-y-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setModalArticleExpanded(!modalArticleExpanded)}
                        className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-800 hover:text-emerald-950 cursor-pointer"
                      >
                        {modalArticleExpanded ? (
                          <>
                            <ChevronUp className="w-4 h-4 text-emerald-600" />
                            <span>Hide Published Article</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4 text-emerald-600" />
                            <span>📄 View Published Article</span>
                          </>
                        )}
                      </button>

                      {modalArticleExpanded && (
                        <div
                          className="text-xs text-slate-800 leading-relaxed max-h-64 overflow-y-auto p-4 bg-white rounded-xl border border-emerald-200/80 scrollbar-thin space-y-3 animate-in fade-in duration-150 [&_h2]:text-base [&_h2]:font-extrabold [&_h2]:text-slate-900 [&_h3]:text-xs [&_h3]:font-extrabold [&_h3]:text-slate-800 [&_p]:text-xs [&_p]:text-slate-700 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_li]:text-xs [&_a]:text-blue-600 [&_a]:font-extrabold [&_a]:underline"
                          dangerouslySetInnerHTML={{ __html: bl.blog_content }}
                        />
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4 overflow-y-auto flex-1 pr-1">
                  {/* STEP 2: Generate Blog Content */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-4 h-4 text-purple-600" /> STEP 2 — Blog Content
                      </span>

                      <button
                        type="button"
                        onClick={async () => {
                          setIsGeneratingBlog(true);
                          await generateBacklinkBlogContent(bl.id);
                          setIsGeneratingBlog(false);
                        }}
                        disabled={isGeneratingBlog}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs disabled:opacity-50 transition-all cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{isGeneratingBlog ? 'Writing Article...' : (bl.blog_content ? 'Re-Generate Article' : 'Generate Blog Content')}</span>
                      </button>
                    </div>

                    {bl.blog_content ? (
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Generated SEO Article (Single Hyperlink + Formatting)
                          </span>

                          <button
                            type="button"
                            onClick={async () => {
                              await copyArticleToClipboard(bl.blog_content!);
                              setCopiedText(true);
                              setTimeout(() => setCopiedText(false), 2000);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs shadow-xs transition-colors cursor-pointer"
                          >
                            {copiedText ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-600">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-slate-500" />
                                <span>📋 Copy Article</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div
                          className="text-xs text-slate-800 leading-relaxed max-h-48 overflow-y-auto p-3 bg-white rounded-xl border border-slate-200/80 scrollbar-thin space-y-2 [&_h2]:text-sm [&_h2]:font-extrabold [&_h3]:text-xs [&_h3]:font-bold [&_p]:text-xs [&_ul]:list-disc [&_ul]:pl-5 [&_a]:text-blue-600 [&_a]:font-bold [&_a]:underline"
                          dangerouslySetInnerHTML={{ __html: bl.blog_content }}
                        />
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-4 text-center">
                        <p className="text-xs text-slate-400 font-medium">
                          Click <strong>"Generate Blog Content"</strong> above to auto-write a structured blog article with the anchor text hyperlink.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* STEP 4: Submit Live URL */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      STEP 4 — Submit Live Published URL (Marks Task & Sheet Row as Completed)
                    </label>

                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <input
                        type="url"
                        placeholder="e.g. https://healthjournal.com/posts/pediatric-care-2026"
                        value={liveUrlInput}
                        onChange={(e) => setLiveUrlInput(e.target.value)}
                        className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />

                      <button
                        type="button"
                        onClick={async () => {
                          if (!liveUrlInput.trim()) return;
                          setIsSubmittingLive(true);
                          await updateBacklinkLiveUrl(bl.id, liveUrlInput.trim());
                          setIsSubmittingLive(false);
                          setActiveBacklinkId(null);
                        }}
                        disabled={isSubmittingLive || !liveUrlInput.trim()}
                        className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 disabled:opacity-50 transition-all cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{isSubmittingLive ? 'Saving Live URL...' : 'Save & Mark Completed'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        );
      })()}

    </div>
  );
};
