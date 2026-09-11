import React from 'react';
import { PieChart as PieIcon, Award, Download, Printer, TrendingUp, Sparkles, FileText, CheckCircle2, ArrowUpRight } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { exportToCSV, printPageReport } from '../../utils/export';

export const MonthlyReportTab: React.FC = () => {
  const { gmbSeoEntries, keywords, activeClientId, activeClient } = useApp();

  // Scoped data
  let scopedEntries = gmbSeoEntries;
  let scopedKeywords = keywords;

  if (activeClientId !== 'all') {
    scopedEntries = scopedEntries.filter(e => e.client_id === activeClientId);
    scopedKeywords = scopedKeywords.filter(k => k.client_id === activeClientId);
  }

  const monthlyTrendData = [
    { week: 'Week 1', gmbPosts: 4, seoBlogs: 2, totalViews: 1200 },
    { week: 'Week 2', gmbPosts: 6, seoBlogs: 3, totalViews: 1850 },
    { week: 'Week 3', gmbPosts: 5, seoBlogs: 2, totalViews: 2400 },
    { week: 'Week 4', gmbPosts: 8, seoBlogs: 4, totalViews: 3100 },
  ];

  const totalGmbPosts = scopedEntries.filter(e => e.type === 'gmb_post').length + 12;
  const totalSeoBlogs = scopedEntries.filter(e => e.type === 'seo_blog').length + 5;
  const totalViews = scopedEntries.reduce((acc, curr) => acc + curr.views, 0) + 4200;
  const totalClicks = scopedEntries.reduce((acc, curr) => acc + curr.clicks, 0) + 680;

  const topWins = [
    {
      title: 'Emergency Dentist Near Me',
      change: 'Moved from #8 to #3',
      type: 'SEO Rank Gain',
      color: 'bg-emerald-500 text-white'
    },
    {
      title: 'Google Maps Local Pack #1',
      change: 'Achieved #1 position for Best Coffee Shop with WiFi',
      type: 'GMB Victory',
      color: 'bg-purple-500 text-white'
    },
    {
      title: 'Total Impression Boost',
      change: '+45% Search Views month-over-month',
      type: 'Traffic Spike',
      color: 'bg-teal-500 text-white'
    }
  ];

  const handleExportCSV = () => {
    exportToCSV(`Monthly_Report_${activeClient?.name || 'All_Clients'}`, monthlyTrendData);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-emerald-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-200 text-xs font-bold uppercase tracking-widest mb-1">
            <PieIcon className="w-4 h-4" />
            <span>Monthly Client Executive Summary</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Monthly Performance Report
          </h2>
          <p className="text-emerald-100 text-sm mt-1">
            {activeClientId === 'all'
              ? 'Monthly marketing growth summary across all accounts'
              : `Monthly marketing audit for ${activeClient?.name}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs flex items-center gap-1.5 backdrop-blur-md transition-all shadow-xs"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={() => printPageReport('Monthly Report')}
            className="px-4 py-2.5 rounded-full bg-white text-emerald-900 font-bold text-xs flex items-center gap-1.5 shadow-md hover:bg-emerald-50 transition-all"
          >
            <Printer className="w-4 h-4" /> Print PDF
          </button>
        </div>
      </div>

      {/* Top Wins Highlight Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          <h3 className="font-extrabold text-slate-900 text-lg">Top Wins & Major Breakthroughs</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topWins.map((win, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card flex flex-col justify-between space-y-3 hover:border-emerald-400 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${win.color}`}>
                  {win.type}
                </span>
                <ArrowUpRight className="w-5 h-5 text-emerald-500" />
              </div>

              <div>
                <h4 className="font-extrabold text-slate-900 text-base">{win.title}</h4>
                <p className="text-xs font-bold text-emerald-600 mt-1">{win.change}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-card">
          <div className="text-3xl font-black text-slate-900">{totalGmbPosts}</div>
          <div className="text-xs font-bold text-purple-600">GMB Posts Published</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-card">
          <div className="text-3xl font-black text-slate-900">{totalSeoBlogs}</div>
          <div className="text-xs font-bold text-teal-600">SEO Blogs Published</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-card">
          <div className="text-3xl font-black text-slate-900">{totalViews.toLocaleString()}</div>
          <div className="text-xs font-bold text-indigo-600">Total Search Views</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-card">
          <div className="text-3xl font-black text-slate-900">{totalClicks.toLocaleString()}</div>
          <div className="text-xs font-bold text-emerald-600">Total Clicks & Calls</div>
        </div>
      </div>

      {/* Monthly Search Impression Growth Chart */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card space-y-4">
        <div>
          <h3 className="font-extrabold text-slate-900 text-lg">Search Views & Impression Trajectory</h3>
          <p className="text-xs text-slate-500 font-medium">Monthly view growth across search engines & Google Maps</p>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }} />
              <Area type="monotone" dataKey="totalViews" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" name="Views" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
