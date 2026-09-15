import React, { useState } from 'react';
import {
  Users,
  Plus,
  Edit3,
  Trash2,
  Power,
  Clock,
  Briefcase,
  UserCheck,
  Search,
  Filter,
  CheckCircle2,
  X,
  Sparkles,
  Building,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DailyTaskTemplate, WorkType } from '../../types';
import { TeamSpiritCard } from '../common/TeamSpiritCard';

interface EmployeeTabProps {
  onOpenAddClient?: () => void;
}

export const EmployeeTab: React.FC<EmployeeTabProps> = ({ onOpenAddClient }) => {
  const {
    dailyTaskTemplates,
    clients,
    clientAssignments,
    assignClientsToEmployee,
    addDailyTaskTemplate,
    updateDailyTaskTemplate,
    deleteDailyTaskTemplate,
    toggleDailyTaskTemplate,
    tasks,
    user
  } = useApp();

  const isAdmin = user?.role === 'admin';

  // State for Add / Edit Template Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<DailyTaskTemplate | null>(null);

  // State for Assign Clients Modal (Admin-only)
  const [assigningEmployee, setAssigningEmployee] = useState<string | null>(null);
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);

  // Form fields
  const [title, setTitle] = useState('');
  const [assignedEmployee, setAssignedEmployee] = useState('Anji');
  const [clientId, setClientId] = useState('all');
  const [time, setTime] = useState('09:30 AM');
  const [workType, setWorkType] = useState<WorkType>('GMB Post');
  const [recurrence, setRecurrence] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [isActive, setIsActive] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');

  // Pre-defined 7 team members
  const defaultEmployees = ['Subash', 'Nithin', 'Bhargavi', 'Anji', 'Teju', 'Pavani', 'Sikta'];

  const openAddModal = () => {
    setEditingTemplate(null);
    setTitle('');
    setAssignedEmployee('Anji');
    setClientId('all');
    setTime('09:30 AM');
    setWorkType('GMB Post');
    setRecurrence('daily');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openAssignClientsModal = (empName: string) => {
    const currentAssigned = clientAssignments
      .filter(ca => ca.employee_name.toLowerCase() === empName.toLowerCase() || (empName.toLowerCase() === 'anji' && ca.employee_name.toLowerCase() === 'anjaneyulu'))
      .map(ca => ca.client_id);
    setSelectedClientIds(currentAssigned);
    setAssigningEmployee(empName);
  };

  const handleSaveClientAssignments = () => {
    if (!assigningEmployee) return;
    assignClientsToEmployee(assigningEmployee, selectedClientIds);
    setAssigningEmployee(null);
  };

  const openEditModal = (tpl: DailyTaskTemplate) => {
    setEditingTemplate(tpl);
    setTitle(tpl.title);
    setAssignedEmployee(tpl.assigned_employee);
    setClientId(tpl.client_id);
    setTime(tpl.time || '09:30 AM');
    setWorkType(tpl.work_type);
    setRecurrence(tpl.recurrence);
    setIsActive(tpl.active);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !assignedEmployee.trim()) return;

    const trimmedEmployee = assignedEmployee.trim();

    if (editingTemplate) {
      updateDailyTaskTemplate(editingTemplate.id, {
        title: title.trim(),
        assigned_employee: trimmedEmployee,
        client_id: clientId,
        time,
        work_type: workType,
        recurrence,
        active: isActive
      });
    } else {
      addDailyTaskTemplate({
        title: title.trim(),
        assigned_employee: trimmedEmployee,
        client_id: clientId,
        time,
        work_type: workType,
        recurrence,
        active: isActive
      });

      // Reset filters so newly added template is immediately visible in the list below
      if (employeeFilter !== 'all' && employeeFilter.toLowerCase() !== trimmedEmployee.toLowerCase()) {
        setEmployeeFilter('all');
      }
      setSearchQuery('');
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, taskTitle: string) => {
    if (confirm(`Are you sure you want to delete template "${taskTitle}"?`)) {
      deleteDailyTaskTemplate(id);
    }
  };

  // Filter templates list dynamically
  let filteredTemplates = dailyTaskTemplates;

  if (clientFilter !== 'all') {
    filteredTemplates = filteredTemplates.filter(
      t => t.client_id === clientFilter || t.client_id === 'all' || t.client_id === 'general'
    );
  }

  if (employeeFilter !== 'all') {
    filteredTemplates = filteredTemplates.filter(
      t => t.assigned_employee.trim().toLowerCase() === employeeFilter.trim().toLowerCase()
    );
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredTemplates = filteredTemplates.filter(
      t => t.title.toLowerCase().includes(q) || t.assigned_employee.toLowerCase().includes(q)
    );
  }

  // Live Recalculations of Counters
  const activeCount = dailyTaskTemplates.filter(t => t.active).length;
  const todayStr = new Date().toISOString().slice(0, 10);
  const autoGeneratedTodayCount = tasks.filter(t => t.date === todayStr && Boolean(t.template_id)).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-500/15 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-100 text-xs font-bold uppercase tracking-widest mb-1.5">
            <Users className="w-4 h-4" />
            <span>Team Management & Work Automation</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Employee Workspace
          </h2>
          <p className="text-indigo-100 text-sm mt-1 max-w-xl leading-relaxed">
            Manage employee assignments and recurring daily task templates. Active templates automatically populate into Today's Work Deck each morning.
          </p>
        </div>

        {/* Live Header Stats Pill Badges & Add Client Button */}
        <div className="flex flex-col sm:flex-row flex-wrap sm:flex-nowrap items-stretch sm:items-center gap-3 shrink-0">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-3 rounded-2xl text-center min-w-[120px]">
            <span className="block text-[10px] uppercase font-bold text-indigo-200 tracking-wider">Active Templates</span>
            <span className="text-2xl font-black text-white">{activeCount}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-3 rounded-2xl text-center min-w-[120px]">
            <span className="block text-[10px] uppercase font-bold text-indigo-200 tracking-wider">Auto Today Tasks</span>
            <span className="text-2xl font-black text-amber-300">{autoGeneratedTodayCount}</span>
          </div>

          {onOpenAddClient && (
            <button
              onClick={onOpenAddClient}
              className="px-4 py-3 rounded-2xl bg-white/20 hover:bg-white/30 border border-white/30 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Client</span>
            </button>
          )}
        </div>
      </div>

      {/* Team Spirit Quote Card */}
      <TeamSpiritCard />

      {/* Team Roster Quick Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {defaultEmployees.map(emp => {
          const empTemplates = dailyTaskTemplates.filter(
            t => t.assigned_employee.trim().toLowerCase() === emp.trim().toLowerCase() ||
                 (emp.toLowerCase() === 'anji' && t.assigned_employee.trim().toLowerCase() === 'anjaneyulu')
          );
          const empActive = empTemplates.filter(t => t.active).length;

          const assignedCount = clientAssignments.filter(
            ca => ca.employee_name.toLowerCase() === emp.toLowerCase() ||
                  (emp.toLowerCase() === 'anji' && ca.employee_name.toLowerCase() === 'anjaneyulu')
          ).length;

          const isSelected = employeeFilter.toLowerCase() === emp.toLowerCase();
          const isEmpAdmin = emp.toLowerCase() === 'subash';

          return (
            <div
              key={emp}
              onClick={() => setEmployeeFilter(isSelected ? 'all' : emp)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                isSelected
                  ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-400/30 shadow-sm'
                  : 'bg-white border-slate-200/80 hover:border-indigo-200 hover:shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0">
                    {emp.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 truncate">
                        <h4 className="font-extrabold text-slate-900 text-sm truncate">{emp}</h4>
                        <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                          isEmpAdmin ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {isEmpAdmin ? 'Admin' : 'Emp'}
                        </span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                    </div>
                    <p className="text-[11px] font-bold text-indigo-600 mt-0.5">
                      {empActive} active task{empActive === 1 ? '' : 's'}
                    </p>
                    {!isEmpAdmin && (
                      <p className="text-[10px] font-extrabold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md inline-block mt-1">
                        {assignedCount} client{assignedCount === 1 ? '' : 's'} assigned
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Assign Clients Button (Admin Only) */}
              {isAdmin && !isEmpAdmin && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openAssignClientsModal(emp);
                  }}
                  className="mt-3 w-full py-1.5 px-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-extrabold text-[11px] flex items-center justify-center gap-1.5 border border-purple-200 transition-all shadow-2xs"
                >
                  <Building className="w-3.5 h-3.5 text-purple-600" />
                  <span>Assign Clients ({assignedCount})</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Main Section: Manage Daily Tasks */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-card space-y-6">
        
        {/* Section Title & Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-600" />
              <h3 className="text-xl font-black text-slate-950">Manage Daily Tasks</h3>
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Daily task templates assigned to employees. Toggle active status or create new task rules.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Task Template
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search daily tasks or employee name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          {/* Employee Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
            <select
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            >
              <option value="all">All Employees</option>
              {defaultEmployees.map(emp => (
                <option key={emp} value={emp}>{emp}</option>
              ))}
            </select>

            {/* Client Filter */}
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            >
              <option value="all">All Clients & General</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Templates Grid List */}
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-3xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-base">No Template Tasks Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No daily task templates match your current search/filter. Click "Add Task Template" to assign a new recurring task.
            </p>
            <button
              onClick={openAddModal}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-sm hover:bg-indigo-700 transition-all cursor-pointer"
            >
              + Add New Task Template
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map(tpl => {
              const assignedClient = clients.find(c => c.id === tpl.client_id);
              const isGeneralClient = tpl.client_id === 'all' || tpl.client_id === 'general';

              return (
                <div
                  key={tpl.id}
                  className={`rounded-3xl p-5 border transition-all flex flex-col justify-between space-y-4 ${
                    tpl.active
                      ? 'bg-white border-slate-200/90 shadow-card hover:border-indigo-300'
                      : 'bg-slate-50/80 border-slate-200/50 opacity-70'
                  }`}
                >
                  {/* Card Top Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 min-w-0">
                      
                      {/* Badges Bar */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {/* Employee Pill */}
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-800 flex items-center gap-1">
                          <Users className="w-3 h-3 text-indigo-600" />
                          <span>{tpl.assigned_employee}</span>
                        </span>

                        {/* Client Pill */}
                        {isGeneralClient ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200">
                            🌐 General (All Clients)
                          </span>
                        ) : assignedClient ? (
                          <span
                            className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold text-white"
                            style={{ backgroundColor: assignedClient.avatar_color }}
                          >
                            {assignedClient.name}
                          </span>
                        ) : null}

                        {/* Work Type */}
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-700">
                          {tpl.work_type}
                        </span>

                        {/* Recurrence */}
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800">
                          🔄 {tpl.recurrence}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="font-extrabold text-slate-900 text-base leading-snug">
                        {tpl.title}
                      </h4>

                      {/* Time */}
                      <div className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Daily Time: {tpl.time || '09:30 AM'}</span>
                      </div>

                    </div>

                    {/* Active Toggle Switch Button */}
                    <button
                      onClick={() => toggleDailyTaskTemplate(tpl.id)}
                      className={`p-2.5 rounded-2xl transition-all shrink-0 cursor-pointer ${
                        tpl.active
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                          : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                      }`}
                      title={tpl.active ? 'Template Active (Click to Deactivate)' : 'Template Inactive (Click to Activate)'}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Card Bottom Action Controls */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <span className="text-slate-400">Status:</span>
                      <span className={tpl.active ? 'text-emerald-600 font-extrabold' : 'text-slate-400 font-semibold'}>
                        {tpl.active ? '🟢 Active (Auto-generates)' : '⚪ Inactive (Paused)'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(tpl)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 font-extrabold text-xs flex items-center gap-1 transition-all cursor-pointer"
                        title="Edit Template Task"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </button>

                      <button
                        onClick={() => handleDelete(tpl.id, tpl.title)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                        title="Delete Template"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Add / Edit Task Template Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleFormSubmit}
            className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-lg text-slate-900">
                  {editingTemplate ? 'Edit Daily Task Template' : 'New Daily Task Template'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Task Name */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Task Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Daily GMB Offer Post & Photo Update"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            {/* Assigned Employee & Client Assignment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Assigned Employee
                </label>
                <div className="space-y-1.5">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anjaneyulu, Subash, Priya..."
                    value={assignedEmployee}
                    onChange={(e) => setAssignedEmployee(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                  {/* Quick Pill Selection Buttons */}
                  <div className="flex flex-wrap gap-1">
                    {defaultEmployees.map(emp => (
                      <button
                        key={emp}
                        type="button"
                        onClick={() => setAssignedEmployee(emp)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors ${
                          assignedEmployee.trim().toLowerCase() === emp.toLowerCase()
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {emp}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Client Assignment
                </label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                >
                  <option value="all">🌐 General (All Clients)</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Work Category, Time, Recurrence */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Work Category
                </label>
                <select
                  value={workType}
                  onChange={(e) => setWorkType(e.target.value as WorkType)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                >
                  <option value="GMB Post">GMB Post</option>
                  <option value="SEO Blog">SEO Blog</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Design">Design</option>
                  <option value="Ad Campaign">Ad Campaign</option>
                  <option value="Review Response">Review Response</option>
                  <option value="Website Update">Website Update</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Daily Time
                </label>
                <input
                  type="text"
                  placeholder="09:30 AM"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Recurrence
                </label>
                <select
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>

            {/* Active Toggle Switch */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
                <span>Template Active Status:</span>
                <span className={isActive ? 'text-emerald-600 font-extrabold' : 'text-slate-400 font-bold'}>
                  {isActive ? 'Active (Auto-Generates)' : 'Inactive'}
                </span>
              </label>

              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  isActive ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isActive ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-extrabold text-xs hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 cursor-pointer"
              >
                {editingTemplate ? 'Save Template Changes' : 'Create Task Template'}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Assign Clients Modal (Admin Only) */}
      {assigningEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-purple-600" />
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    Assign Clients to {assigningEmployee}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Select which client workspaces this employee can access</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAssigningEmployee(null)}
                className="p-1 rounded-xl text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2 py-1">
              {clients.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No clients available.</p>
              ) : (
                clients.map(client => {
                  const isChecked = selectedClientIds.includes(client.id);
                  return (
                    <label
                      key={client.id}
                      className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-purple-50/70 border-purple-300 ring-1 ring-purple-300'
                          : 'bg-slate-50 border-slate-200 hover:border-purple-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-7 h-7 rounded-xl text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs"
                          style={{ backgroundColor: client.avatar_color }}
                        >
                          {client.name.charAt(0)}
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-bold text-slate-900 truncate">{client.name}</div>
                          <div className="text-[10px] text-slate-500 truncate">{client.business_type} • {client.phone_number}</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            setSelectedClientIds(selectedClientIds.filter(id => id !== client.id));
                          } else {
                            setSelectedClientIds([...selectedClientIds, client.id]);
                          }
                        }}
                        className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300 cursor-pointer"
                      />
                    </label>
                  );
                })
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAssigningEmployee(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveClientAssignments}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md shadow-purple-500/20"
              >
                Save Client Assignments
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default EmployeeTab;
