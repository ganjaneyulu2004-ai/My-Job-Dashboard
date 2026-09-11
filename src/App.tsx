import React, { useState, Component, ErrorInfo, ReactNode } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { GlobalFilterBar } from './components/common/GlobalFilterBar';
import { DailyReminderBanner } from './components/common/DailyReminderBanner';

// 11 Tab Components
import { TodayTab } from './components/tabs/TodayTab';
import { UpcomingTab } from './components/tabs/UpcomingTab';
import { CalendarTab } from './components/tabs/CalendarTab';
import { WeeklyReportTab } from './components/tabs/WeeklyReportTab';
import { MonthlyReportTab } from './components/tabs/MonthlyReportTab';
import { DailyWorkLogTab } from './components/tabs/DailyWorkLogTab';
import { GmbSeoTrackingTab } from './components/tabs/GmbSeoTrackingTab';
import { InstagramTab } from './components/tabs/InstagramTab';
import { KeywordBankTab } from './components/tabs/KeywordBankTab';
import { TagsFiltersTab } from './components/tabs/TagsFiltersTab';
import { RecurringTasksTab } from './components/tabs/RecurringTasksTab';
import { GoalTrackingTab } from './components/tabs/GoalTrackingTab';

import { LoginScreen } from './components/auth/LoginScreen';

// Modals
import { AddClientModal } from './components/modals/AddClientModal';
import { AddTaskModal } from './components/modals/AddTaskModal';
import { LogGmbSeoModal } from './components/modals/LogGmbSeoModal';
import { SupabaseConfigModal } from './components/modals/SupabaseConfigModal';
import { SettingsModal } from './components/modals/SettingsModal';

// Error Boundary to prevent any blank screen
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AgencyOps Error Boundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-slate-800 rounded-3xl p-8 border border-slate-700 space-y-4 shadow-2xl">
            <div className="w-16 h-16 bg-white border border-slate-700 rounded-2xl p-2 flex items-center justify-center font-bold text-3xl mx-auto overflow-hidden">
              <img src="/antic-logo.png" alt="Antic AI" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-2xl font-extrabold">Antic AI Recovered</h2>
            <p className="text-slate-400 text-xs font-medium">
              An unexpected error occurred: {this.state.error?.message || 'State mismatch'}
            </p>
            <button
              onClick={this.handleReset}
              className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-lg transition-all"
            >
              Reset Cache & Reload Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const DashboardContent: React.FC = () => {
  const { activeTab } = useApp();

  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isLogGmbSeoOpen, setIsLogGmbSeoOpen] = useState(false);
  const [isSupabaseOpen, setIsSupabaseOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'today':
        return <TodayTab />;
      case 'upcoming':
        return <UpcomingTab />;
      case 'calendar':
        return <CalendarTab />;
      case 'weekly_report':
        return <WeeklyReportTab />;
      case 'monthly_report':
        return <MonthlyReportTab />;
      case 'work_log':
        return <DailyWorkLogTab />;
      case 'gmb_seo':
        return <GmbSeoTrackingTab onOpenLogModal={() => setIsLogGmbSeoOpen(true)} />;
      case 'instagram':
        return <InstagramTab />;
      case 'keywords':
        return <KeywordBankTab />;
      case 'filters':
        return <TagsFiltersTab />;
      case 'recurring':
        return <RecurringTasksTab />;
      case 'goals':
        return <GoalTrackingTab />;
      default:
        return <TodayTab />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      
      {/* 6:00 PM Persistent Amber Reminder Banner */}
      <DailyReminderBanner />

      {/* Top Navbar with Permanent Client Switcher & Global Report Button */}
      <Navbar
        onOpenAddClient={() => setIsAddClientOpen(true)}
        onOpenAddTask={() => setIsAddTaskOpen(true)}
        onOpenSupabase={() => setIsSupabaseOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Global Collapsible Filter Bar */}
      <GlobalFilterBar />

      {/* Main Workspace Layout (Sidebar + Content Area) */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row gap-0 py-4 px-4 sm:px-6 lg:px-8">
        
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Dynamic Tab Area */}
        <main className="flex-1 p-3 sm:p-6 min-w-0 print-area">
          {renderActiveTab()}
        </main>
      </div>

      {/* Modals */}
      <AddClientModal
        isOpen={isAddClientOpen}
        onClose={() => setIsAddClientOpen(false)}
      />

      <AddTaskModal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
      />

      <LogGmbSeoModal
        isOpen={isLogGmbSeoOpen}
        onClose={() => setIsLogGmbSeoOpen(false)}
      />

      <SupabaseConfigModal
        isOpen={isSupabaseOpen}
        onClose={() => setIsSupabaseOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

    </div>
  );
};

const MainAppContent: React.FC = () => {
  const { isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <DashboardContent />;
};

export function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainAppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
