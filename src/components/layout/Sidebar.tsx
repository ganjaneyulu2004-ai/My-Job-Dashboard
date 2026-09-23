import React from 'react';
import {
  LayoutDashboard,
  Sun,
  Clock,
  Calendar,
  BarChart3,
  PieChart,
  FileText,
  Link2,
  Instagram,
  KeyRound,
  Repeat,
  ChevronRight,
  Database,
  BookmarkPlus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TabType } from '../../types';

interface SidebarItem {
  id: TabType;
  label: string;
  icon: React.FC<{ className?: string }>;
  accentColor: string; // Tailored highlight color
  badge?: string;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, getTodayTasks, backlinks, user, clients, assignedClients } = useApp();

  const allowedClients = (!user || user.role === 'admin') ? clients : (assignedClients.length > 0 ? assignedClients : clients);
  const allowedClientIds = allowedClients.map(c => c.id);

  // Calculate quick notification badges using getTodayTasks('all') for 100% consistency
  const todayTaskCount = getTodayTasks('all').filter(t => t.status === 'pending').length;
  const pendingBacklinkCount = backlinks.filter(b => b.status === 'pending' && allowedClientIds.includes(b.client_id)).length;

  const sidebarItems: SidebarItem[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, accentColor: 'bg-teal-600 text-white shadow-teal-500/20' },
    { id: 'today', label: 'Today Work', icon: Sun, accentColor: 'bg-amber-500 text-white shadow-amber-500/20', badge: todayTaskCount > 0 ? `${todayTaskCount}` : undefined },
    { id: 'content_vault', label: 'Content Vault', icon: Database, accentColor: 'bg-purple-600 text-white shadow-purple-500/20' },
    { id: 'upcoming_blog_keywords', label: 'Upcoming Blog Keywords', icon: BookmarkPlus, accentColor: 'bg-pink-600 text-white shadow-pink-500/20' },
    { id: 'backlinks', label: 'Backlinks', icon: Link2, accentColor: 'bg-indigo-600 text-white shadow-indigo-500/20', badge: pendingBacklinkCount > 0 ? `${pendingBacklinkCount}` : undefined },
    { id: 'upcoming', label: 'Upcoming Works', icon: Clock, accentColor: 'bg-agency-teal text-white shadow-teal-500/20' },
    { id: 'calendar', label: 'Monthly Calendar', icon: Calendar, accentColor: 'bg-agency-purple text-white shadow-purple-500/20' },
    { id: 'weekly_report', label: 'Weekly Report', icon: BarChart3, accentColor: 'bg-indigo-600 text-white shadow-indigo-500/20' },
    { id: 'monthly_report', label: 'Monthly Report', icon: PieChart, accentColor: 'bg-emerald-600 text-white shadow-emerald-500/20' },
    { id: 'work_log', label: 'Daily Work Log', icon: FileText, accentColor: 'bg-slate-800 text-white shadow-slate-500/20' },
    { id: 'instagram', label: 'Instagram', icon: Instagram, accentColor: 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white shadow-rose-500/20' },
    { id: 'keywords', label: 'Keyword Bank', icon: KeyRound, accentColor: 'bg-cyan-600 text-white shadow-cyan-500/20' },
    { id: 'recurring', label: 'Recurring Tasks', icon: Repeat, accentColor: 'bg-orange-500 text-white shadow-orange-500/20' },
  ];

  return (
    <aside className="w-full lg:w-64 bg-white border-r border-slate-200/80 p-3 flex flex-col shrink-0">
      <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        Navigation Tabs
      </div>

      <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-y-auto py-1 scrollbar-none">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 whitespace-nowrap lg:whitespace-normal group ${
                isActive
                  ? `${item.accentColor} shadow-md scale-[1.01]`
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span>{item.label}</span>
              </div>

              <div className="flex items-center gap-1">
                {item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isActive
                        ? 'bg-white text-slate-900'
                        : 'bg-rose-100 text-rose-600 border border-rose-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                <ChevronRight
                  className={`w-3.5 h-3.5 hidden lg:block transition-transform ${
                    isActive ? 'text-white/80 translate-x-0.5' : 'text-slate-300 group-hover:text-slate-400'
                  }`}
                />
              </div>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
