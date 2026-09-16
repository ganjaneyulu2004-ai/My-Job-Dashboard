import React, { useState } from 'react';
import {
  ChevronDown,
  Plus,
  Filter,
  Check,
  Send,
  Settings,
  CheckCircle2,
  LogOut
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { shareOrDownloadFullDayReport } from '../../utils/pdfReport';
import { sanitizePhoneNumber } from '../../utils/whatsapp';

interface NavbarProps {
  onOpenAddClient: () => void;
  onOpenAddTask: () => void;
  onOpenSupabase: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAddClient,
  onOpenAddTask,
  onOpenSupabase,
  onOpenSettings
}) => {
  const {
    clients,
    assignedClients,
    activeClientId,
    setActiveClientId,
    activeClient,
    isFilterOpen,
    setIsFilterOpen,
    tasks,
    gmbSeoEntries,
    subashGlobalPhone,
    reportSentAtToday,
    markReportSentToday,
    user,
    logout
  } = useApp();

  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const [fallbackNotice, setFallbackNotice] = useState(false);

  const isAdmin = user?.role === 'admin';
  const availableClients = isAdmin ? clients : assignedClients;

  const todayStr = new Date().toISOString().slice(0, 10);
  const formattedToday = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Handler for Global End of Day WhatsApp Report across ALL clients
  const handleSendFullDayReport = async () => {
    const result = await shareOrDownloadFullDayReport(
      clients,
      todayStr,
      formattedToday,
      tasks,
      gmbSeoEntries,
      subashGlobalPhone
    );

    if (result.fallbackUsed) {
      setFallbackNotice(true);
      setTimeout(() => setFallbackNotice(false), 8000);
    }

    markReportSentToday();
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-2.5 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: iBrain Labs Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="h-10 px-2.5 rounded-2xl bg-white border border-slate-200 p-1 flex items-center justify-center shadow-xs overflow-hidden shrink-0">
            <img
              src="/ibrain-logo.png"
              alt="iBrain Labs"
              className="h-full w-auto object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-xl leading-none tracking-tight text-slate-950 uppercase font-sans">
                iBrain Labs
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                {isAdmin ? 'Admin' : `Employee (${user?.username})`}
              </span>
            </div>
            <p className="text-[11px] font-semibold text-slate-500 hidden sm:block mt-0.5">
              AI Automations & Digital Marketing
            </p>
          </div>
        </div>

        {/* Center: Global Client Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200 text-slate-800 transition-all font-medium text-sm shadow-xs focus:ring-2 focus:ring-purple-500/30"
          >
            {activeClientId === 'all' ? (
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                ALL
              </div>
            ) : availableClients.length === 0 ? (
              <div className="w-7 h-7 rounded-xl bg-amber-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                !
              </div>
            ) : (
              <div
                className="w-7 h-7 rounded-xl text-white font-bold text-xs flex items-center justify-center shadow-xs"
                style={{ backgroundColor: activeClient?.avatar_color || '#0d9488' }}
              >
                {activeClient?.name.charAt(0).toUpperCase() || 'C'}
              </div>
            )}

            <div className="text-left hidden sm:block">
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider leading-none">
                Active Client
              </div>
              <div className="font-bold text-slate-900 max-w-[150px] md:max-w-[200px] truncate leading-tight">
                {activeClientId === 'all'
                  ? (isAdmin ? '✨ All Clients (Combined)' : `✨ All Assigned Clients (${availableClients.length})`)
                  : availableClients.length === 0
                  ? 'No clients assigned'
                  : activeClient?.name || 'Select Client'}
              </div>
            </div>

            <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isClientDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Client Switcher Dropdown */}
          {isClientDropdownOpen && (
            <div
              className="absolute left-0 sm:left-auto right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              onClick={() => setIsClientDropdownOpen(false)}
            >
              <div className="px-3 py-1.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase border-b border-slate-100">
                Select Client Workspace
              </div>

              {/* Show "All Clients" / "All Assigned Clients" option for all users */}
              <button
                onClick={() => setActiveClientId('all')}
                className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between hover:bg-purple-50/60 transition-colors ${
                  activeClientId === 'all' ? 'bg-purple-50 font-semibold text-purple-700' : 'text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    ALL
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">
                      {isAdmin ? 'All Clients' : 'All Assigned Clients'}
                    </div>
                    <div className="text-xs text-slate-500">
                      {isAdmin ? 'Combined Today & Upcoming view' : `View tasks across all ${availableClients.length} assigned clients`}
                    </div>
                  </div>
                </div>
                {activeClientId === 'all' && <Check className="w-4 h-4 text-purple-600" />}
              </button>
              <div className="my-1 border-t border-slate-100" />

              <div className="max-h-60 overflow-y-auto py-1">
                {availableClients.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-amber-700 font-semibold bg-amber-50 rounded-xl m-2 border border-amber-200">
                    No clients assigned — contact your admin.
                  </div>
                ) : (
                  availableClients.map(client => (
                    <button
                      key={client.id}
                      onClick={() => setActiveClientId(client.id)}
                      className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                        activeClientId === client.id ? 'bg-teal-50/70 font-semibold text-agency-teal' : 'text-slate-700'
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
                          <div className="text-sm font-bold text-slate-900 truncate">{client.name}</div>
                          <div className="text-[11px] text-slate-500 truncate">{client.business_type} • {client.phone_number}</div>
                        </div>
                      </div>
                      {activeClientId === client.id && <Check className="w-4 h-4 text-agency-teal shrink-0" />}
                    </button>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsClientDropdownOpen(false);
                    onOpenAddClient();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-white hover:bg-purple-50 text-agency-purple border border-purple-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add New Client
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Actions & GLOBAL END-OF-DAY WHATSAPP REPORT BUTTON */}
        <div className="flex items-center gap-2">
          
          {/* THE ONLY WHATSAPP BUTTON IN THE WHOLE APP - GLOBAL FULL DAY REPORT */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleSendFullDayReport}
              className="px-3.5 py-2 rounded-full bg-whatsapp hover:bg-whatsapp-dark text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
              title="Generate PDF & Send Full Day Report to Subash Sir"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Send Full Day Report to Subash Sir</span>
              <span className="md:hidden">Send Report</span>
            </button>

            {reportSentAtToday && (
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold border border-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Sent at {reportSentAtToday}</span>
              </span>
            )}
          </div>

          {fallbackNotice && (
            <div className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200 animate-in fade-in">
              ℹ️ Your browser can't auto-share files — please attach the downloaded PDF manually.
            </div>
          )}

          {/* Global Filter Toggle */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
              isFilterOpen
                ? 'bg-agency-purple text-white border-agency-purple shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
            }`}
            title="Filter tasks"
          >
            <Filter className="w-4 h-4" />
          </button>

          {/* Quick Add Task Button */}
          <button
            onClick={onOpenAddTask}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-agency-teal to-teal-600 hover:from-teal-600 hover:to-agency-teal text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-teal-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Task</span>
          </button>

          {/* Settings Modal Trigger (Gear Icon) */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 transition-all"
            title="iBrain Labs Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all font-bold text-xs flex items-center gap-1.5"
            title={`Log out (${user?.username || 'User'})`}
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>

        </div>

      </div>
    </header>
  );
};
