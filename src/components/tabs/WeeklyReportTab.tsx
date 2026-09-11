import React from 'react';
import { BarChart3, Download, Printer, TrendingUp, CheckCircle2, Clock, Calendar } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { exportToCSV, printPageReport } from '../../utils/export';

export const WeeklyReportTab: React.FC = () => {
  const { tasks, activeClientId, activeClient } = useApp();

  // Weekly data structure for current week (Mon-Sun)
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Sample weekly metrics computation
  let scopedTasks = tasks;
  if (activeClientId !== 'all') {
    scopedTasks = scopedTasks.filter(t => t.client_id === activeClientId);
  }

  const weeklyData = [
    { day: 'Mon', completed: 4, pending: 1, total: 5 },
    { day: 'Tue', completed: 3, pending: 2, total: 5 },
    { day: 'Wed', completed: 5, pending: 0, total: 5 },
    { day: 'Thu', completed: 2, pending: 3, total: 5 },
    { day: 'Fri', completed: 4, pending: 2, total: 6 },
    { day: 'Sat', completed: 1, pending: 1, total: 2 },
    { day: 'Sun', completed: 0, pending: 0, total: 0 },
  ];

  const totalCompleted = weeklyData.reduce((acc, curr) => acc + curr.completed, 0);
  const totalPending = weeklyData.reduce((acc, curr) => acc + curr.pending, 0);
  const completionRate = Math.round((totalCompleted / (totalCompleted + totalPending || 1)) * 100);

  const handleExportCSV = () => {
    exportToCSV(`Weekly_Report_${activeClient?.name || 'All_Clients'}`, weeklyData);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-agency-teal rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-indigo-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Weekly Analytics & Velocity</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Weekly Performance Report
          </h2>
          <p className="text-indigo-100 text-sm mt-1">
            {activeClientId === 'all'
              ? 'Task completion velocity across all client projects'
              : `Weekly throughput for ${activeClient?.name}`}
          </p>
        </div>

        {/* Pill Buttons for Export & Print */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs flex items-center gap-1.5 backdrop-blur-md transition-all shadow-xs"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={() => printPageReport('Weekly Report')}
            className="px-4 py-2.5 rounded-full bg-white text-indigo-900 font-bold text-xs flex items-center gap-1.5 shadow-md hover:bg-indigo-50 transition-all"
          >
            <Printer className="w-4 h-4" /> Print PDF
          </button>
        </div>
      </div>

      {/* Readable Summary Numbers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-card flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-2xl shrink-0">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900">{totalCompleted}</div>
            <div className="text-xs font-bold text-slate-500">Tasks Completed This Week</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-card flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-black text-2xl shrink-0">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900">{totalPending}</div>
            <div className="text-xs font-bold text-slate-500">Pending Tasks Left</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-card flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-2xl shrink-0">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900">{completionRate}%</div>
            <div className="text-xs font-bold text-slate-500">Weekly Efficiency Rate</div>
          </div>
        </div>

      </div>

      {/* Main Bar Chart Component */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">Completed vs Pending Tasks</h3>
            <p className="text-xs text-slate-500 font-medium">Daily work distribution for the current week</p>
          </div>
          <div className="flex items-center gap-3 text-xs font-bold">
            <span className="flex items-center gap-1 text-emerald-600">● Completed</span>
            <span className="flex items-center gap-1 text-amber-500">● Pending</span>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                cursor={{ fill: '#f8fafc' }}
              />
              <Bar dataKey="completed" fill="#10b981" radius={[8, 8, 0, 0]} name="Completed" />
              <Bar dataKey="pending" fill="#f59e0b" radius={[8, 8, 0, 0]} name="Pending" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
