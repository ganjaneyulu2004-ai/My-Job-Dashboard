import React, { useState } from 'react';
import {
  LayoutDashboard,
  CheckCircle2,
  Clock,
  Users,
  Briefcase,
  Building,
  Sparkles,
  Layers,
  ListChecks,
  Search,
  Filter,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Task, Client, WorkType } from '../../types';

export const OverviewTab: React.FC = () => {
  const { tasks, clients, assignedClients, user, toggleTaskStatus } = useApp();

  const isAdmin = user?.role === 'admin';
  const todayStr = new Date().toISOString().slice(0, 10);

  // Grouping mode for Admin (by client or by employee)
  const [groupBy, setGroupBy] = useState<'client' | 'employee'>('client');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'done'>('all');

  // Scope clients and tasks based on user role
  const userAssignedClientIds = assignedClients.map(c => c.id);

  const scopedTodayTasks = tasks.filter(t => {
    if (t.date !== todayStr) return false;
    if (isAdmin) return true;
    return (
      t.client_id === 'all' ||
      t.client_id === 'general' ||
      userAssignedClientIds.includes(t.client_id)
    );
  });

  // Filter tasks by search query and status filter
  const filteredTasks = scopedTodayTasks.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const clientObj = clients.find(c => c.id === t.client_id);
      const clientName = clientObj ? clientObj.name.toLowerCase() : '';
      const empName = (t.assigned_employee || '').toLowerCase();
      const taskTitle = t.title.toLowerCase();
      return taskTitle.includes(q) || clientName.includes(q) || empName.includes(q);
    }
    return true;
  });

  // Today Summary Metrics
  const totalCount = scopedTodayTasks.length;
  const completedCount = scopedTodayTasks.filter(t => t.status === 'done').length;
  const pendingCount = scopedTodayTasks.filter(t => t.status === 'pending').length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Grouping logic
  const groupMap: Record<string, Task[]> = {};

  if (groupBy === 'client') {
    filteredTasks.forEach(t => {
      const key = t.client_id || 'general';
      if (!groupMap[key]) groupMap[key] = [];
      groupMap[key].push(t);
    });
  } else {
    filteredTasks.forEach(t => {
      const key = t.assigned_employee?.trim() || 'General / Agency';
      if (!groupMap[key]) groupMap[key] = [];
      groupMap[key].push(t);
    });
  }

  const groupKeys = Object.keys(groupMap);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-teal-500/15 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-teal-100 text-xs font-bold uppercase tracking-widest mb-1.5">
            <LayoutDashboard className="w-4 h-4" />
            <span>Consolidated Daily Operations</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Today's Agency Overview
          </h2>
          <p className="text-teal-100 text-sm mt-1 max-w-xl leading-relaxed">
            {isAdmin
              ? "Real-time summary of all deliverables across every client account and team member today."
              : `All today's tasks across your assigned clients consolidated in one live workspace.`}
          </p>
        </div>

        {/* Actionable Grouping & Filter Controls for Admin / Employee */}
        {isAdmin && (
          <div className="flex items-center bg-white/10 backdrop-blur-md border border-white/20 p-1.5 rounded-2xl shrink-0 self-start md:self-auto">
            <button
              onClick={() => setGroupBy('client')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                groupBy === 'client'
                  ? 'bg-white text-teal-900 shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              🏢 Group by Client
            </button>
            <button
              onClick={() => setGroupBy('employee')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                groupBy === 'employee'
                  ? 'bg-white text-teal-900 shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              👥 Group by Employee
            </button>
          </div>
        )}
      </div>

      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        {/* Total Tasks Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <ListChecks className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Today's Tasks</span>
            <span className="text-2xl font-black text-slate-900">{totalCount}</span>
          </div>
        </div>

        {/* Completed Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Completed</span>
            <span className="text-2xl font-black text-emerald-600">{completedCount}</span>
          </div>
        </div>

        {/* Pending Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Pending</span>
            <span className="text-2xl font-black text-amber-600">{pendingCount}</span>
          </div>
        </div>

        {/* Progress Bar Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-card flex flex-col justify-center space-y-2">
          <div className="flex items-center justify-between text-xs font-extrabold text-slate-700">
            <span>Today's Progress</span>
            <span className="text-teal-600 font-black">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5">
            <div
              className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks, clients, or employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 shadow-xs"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto bg-white p-1.5 border border-slate-200 rounded-2xl shrink-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'all'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All ({scopedTodayTasks.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'pending'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Pending ({scopedTodayTasks.filter(t => t.status === 'pending').length})
          </button>
          <button
            onClick={() => setStatusFilter('done')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'done'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Done ({scopedTodayTasks.filter(t => t.status === 'done').length})
          </button>
        </div>

      </div>

      {/* Main Consolidated Deliverables List */}
      {groupKeys.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-3 shadow-card">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-lg">No Deliverables Found Today</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'all'
              ? 'No tasks match your current search/status filters.'
              : 'All daily tasks for today are either complete or no active templates are scheduled for today.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupKeys.map(key => {
            const groupTasks = groupMap[key];
            const groupPending = groupTasks.filter(t => t.status === 'pending').length;
            const groupDone = groupTasks.filter(t => t.status === 'done').length;

            let groupTitle = '';
            let groupSubtitle = '';
            let avatarColor = '#0d9488';

            if (groupBy === 'client') {
              const clientObj = clients.find(c => c.id === key);
              if (clientObj) {
                groupTitle = clientObj.name;
                groupSubtitle = `${clientObj.business_type} • ${groupTasks.length} Deliverable${groupTasks.length > 1 ? 's' : ''}`;
                avatarColor = clientObj.avatar_color || '#0d9488';
              } else {
                groupTitle = key === 'all' || key === 'general' ? '🌐 General / All Clients' : key;
                groupSubtitle = `${groupTasks.length} Deliverable${groupTasks.length > 1 ? 's' : ''}`;
                avatarColor = '#64748b';
              }
            } else {
              groupTitle = key;
              groupSubtitle = `Team Member • ${groupTasks.length} Task${groupTasks.length > 1 ? 's' : ''}`;
              avatarColor = '#4f46e5';
            }

            return (
              <div
                key={key}
                className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-card space-y-4"
              >
                {/* Group Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-2xl text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0"
                      style={{ backgroundColor: avatarColor }}
                    >
                      {groupTitle.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base">{groupTitle}</h3>
                      <p className="text-xs font-semibold text-slate-400">{groupSubtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200/60">
                      {groupPending} Pending
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                      {groupDone} Done
                    </span>
                  </div>
                </div>

                {/* Tasks List inside Group */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {groupTasks.map(task => {
                    const taskClient = clients.find(c => c.id === task.client_id);
                    const isDone = task.status === 'done';

                    return (
                      <div
                        key={task.id}
                        onClick={() => toggleTaskStatus(task.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                          isDone
                            ? 'bg-slate-50/80 border-slate-200/60 opacity-75 hover:opacity-100'
                            : 'bg-white border-slate-200 hover:border-teal-400 hover:shadow-md'
                        }`}
                      >
                        {/* Interactive Checkbox */}
                        <div className="pt-0.5 shrink-0">
                          <input
                            type="checkbox"
                            checked={isDone}
                            onChange={() => {}} // Handled by div onClick
                            className="w-5 h-5 rounded-lg text-teal-600 focus:ring-teal-500 border-slate-300 cursor-pointer"
                          />
                        </div>

                        {/* Task Info */}
                        <div className="flex-1 min-w-0 space-y-1.5">
                          
                          {/* Badges */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            
                            {/* Category Badge */}
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-teal-100 text-teal-800">
                              {task.work_type}
                            </span>

                            {/* Client Pill if Grouped by Employee */}
                            {groupBy === 'employee' && taskClient && (
                              <span
                                className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white shrink-0"
                                style={{ backgroundColor: taskClient.avatar_color }}
                              >
                                {taskClient.name}
                              </span>
                            )}

                            {/* Employee Pill if Grouped by Client */}
                            {groupBy === 'client' && task.assigned_employee && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                                👤 {task.assigned_employee}
                              </span>
                            )}

                            {/* Recurrence Rule Pill if applicable */}
                            {task.is_recurring && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800">
                                🔄 {task.recurrence_rule === 'custom' && task.recurrence_days
                                  ? task.recurrence_days.map(d => d.slice(0, 3).toUpperCase()).join(', ')
                                  : task.recurrence_rule || 'recurring'}
                              </span>
                            )}

                          </div>

                          {/* Task Title */}
                          <h4 className={`text-sm font-extrabold leading-snug ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                            {task.title}
                          </h4>

                          {/* Time & Tags */}
                          <div className="flex items-center gap-3 text-xs font-semibold text-slate-400">
                            <span className="flex items-center gap-1 text-slate-500">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{task.time || '09:30 AM'}</span>
                            </span>
                            {task.tags && task.tags.length > 0 && (
                              <span className="text-[11px] text-slate-400 truncate">
                                #{task.tags.join(' #')}
                              </span>
                            )}
                          </div>

                        </div>

                        {/* Status Toggle Button */}
                        <div className="shrink-0 self-center">
                          <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase transition-all ${
                            isDone
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {isDone ? '✓ Completed' : '● Pending'}
                          </span>
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

export default OverviewTab;
