import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Client,
  Task,
  WorkLog,
  GmbSeoEntry,
  Keyword,
  Goal,
  RecurringTaskTemplate,
  DailyTaskTemplate,
  UserRole,
  ClientAssignment,
  TabType,
  TagFilter,
  TaskStatus,
  WorkType,
  GmbSeoType
} from '../types';
import {
  INITIAL_CLIENTS,
  INITIAL_TASKS,
  INITIAL_WORK_LOGS,
  INITIAL_GMB_SEO_ENTRIES,
  INITIAL_KEYWORDS,
  INITIAL_GOALS,
  INITIAL_RECURRING_TASKS,
  INITIAL_DAILY_TASK_TEMPLATES,
  INITIAL_CLIENT_ASSIGNMENTS,
  INITIAL_INSTAGRAM_ACCOUNTS
} from '../data/seedData';
import { InstagramAccount, InstagramConnection } from '../types';

interface SupabaseConfig {
  url: string;
  key: string;
  connected: boolean;
}

interface AppUser {
  username: string;
  email: string;
  role: UserRole;
}

interface AppContextType {
  isAuthenticated: boolean;
  user: AppUser | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;

  clients: Client[];
  assignedClients: Client[];
  clientAssignments: ClientAssignment[];
  assignClientsToEmployee: (employeeUsername: string, clientIds: string[]) => void;

  activeClientId: string; // 'all' or client.id
  setActiveClientId: (id: string) => void;
  activeClient: Client | undefined;
  
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;

  tasks: Task[];
  workLogs: WorkLog[];
  gmbSeoEntries: GmbSeoEntry[];
  keywords: Keyword[];
  goals: Goal[];
  recurringTasks: RecurringTaskTemplate[];
  dailyTaskTemplates: DailyTaskTemplate[];
  instagramAccounts: InstagramAccount[];
  instagramConnections: Record<string, InstagramConnection>;

  filters: TagFilter;
  setFilters: React.Dispatch<React.SetStateAction<TagFilter>>;
  isFilterOpen: boolean;
  setIsFilterOpen: (open: boolean) => void;

  subashGlobalPhone: string;
  setSubashGlobalPhone: (phone: string) => void;

  reportSentAtToday: string | null;
  markReportSentToday: () => void;

  supabaseConfig: SupabaseConfig;
  setSupabaseConfig: React.Dispatch<React.SetStateAction<SupabaseConfig>>;

  // Actions
  addClient: (client: Omit<Client, 'id' | 'created_at'>) => { success: boolean; error?: string };
  addTask: (task: Omit<Task, 'id' | 'status'>) => void;
  toggleTaskStatus: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  toggleTaskReminder: (taskId: string) => void;
  
  addWorkLogNote: (clientId: string, note: string) => void;
  
  addGmbSeoEntry: (entry: Omit<GmbSeoEntry, 'id' | 'next_check_date'>) => void;
  updateGmbSeoEntryMetrics: (entryId: string, searchPos: number, mapsPos: number, views: number, clicks: number) => void;
  
  addKeyword: (clientId: string, keyword: string, currentPos: number, targetPos: number, searchVolume?: string) => void;
  updateKeywordPosition: (keywordId: string, newPosition: number) => void;
  deleteKeyword: (keywordId: string) => void;

  addGoal: (goal: Omit<Goal, 'id' | 'status'>) => void;
  updateGoalProgress: (goalId: string, currentValue: number) => void;

  addRecurringTask: (rec: Omit<RecurringTaskTemplate, 'id' | 'active'>) => void;
  toggleRecurringTask: (recId: string) => void;

  addDailyTaskTemplate: (tpl: Omit<DailyTaskTemplate, 'id' | 'created_at'>) => void;
  updateDailyTaskTemplate: (id: string, updated: Partial<DailyTaskTemplate>) => void;
  deleteDailyTaskTemplate: (id: string) => void;
  toggleDailyTaskTemplate: (id: string) => void;

  toggleInstagramConnect: (clientId: string) => void;
  saveInstagramConnection: (clientId: string, accountId: string, accessToken: string) => void;
  disconnectInstagramConnection: (clientId: string) => void;

  triggerConfetti: () => void;
  resetToSeedData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'agencyops_data_v1';

function getInitialData<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_${key}`);
    if (!saved) return fallback;
    const parsed = JSON.parse(saved);
    if (Array.isArray(fallback) && (!Array.isArray(parsed) || parsed.length === 0)) return fallback;
    return parsed ?? fallback;
  } catch (e) {
    return fallback;
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_auth_session`);
      return Boolean(saved);
    } catch {
      return false;
    }
  });

  const [user, setUser] = useState<AppUser | null>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_auth_session`);
      return saved ? JSON.parse(saved).user : null;
    } catch {
      return null;
    }
  });

  // Initialize state safely from LocalStorage or Seed Data
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_supabase`);
    return saved ? JSON.parse(saved) : { url: '', key: '', connected: false };
  });

  const [clients, setClients] = useState<Client[]>(() => getInitialData('clients', INITIAL_CLIENTS));
  const [clientAssignments, setClientAssignments] = useState<ClientAssignment[]>(() =>
    getInitialData('clientAssignments', INITIAL_CLIENT_ASSIGNMENTS)
  );

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_clientAssignments`, JSON.stringify(clientAssignments));
  }, [clientAssignments]);

  const assignedClients = React.useMemo(() => {
    if (!user) return [];
    if (user.role === 'admin') return clients;

    const assignedIds = clientAssignments
      .filter(ca => ca.employee_username.trim().toLowerCase() === user.username.trim().toLowerCase())
      .map(ca => ca.client_id);

    return clients.filter(c => assignedIds.includes(c.id));
  }, [user, clients, clientAssignments]);

  const [activeClientId, setActiveClientId] = useState<string>('client-1');
  const [activeTab, setActiveTab] = useState<TabType>('today');

  // Enforce client access security for employee accounts
  useEffect(() => {
    if (user && user.role === 'employee') {
      const allowedIds = assignedClients.map(c => c.id);
      if (allowedIds.length === 0) {
        if (activeClientId !== '') setActiveClientId('');
      } else if (!allowedIds.includes(activeClientId)) {
        setActiveClientId(allowedIds[0]);
      }
    }
  }, [user, assignedClients, activeClientId]);

  const [tasks, setTasks] = useState<Task[]>(() => getInitialData('tasks', INITIAL_TASKS));
  const [workLogs, setWorkLogs] = useState<WorkLog[]>(() => getInitialData('workLogs', INITIAL_WORK_LOGS));
  const [gmbSeoEntries, setGmbSeoEntries] = useState<GmbSeoEntry[]>(() => getInitialData('gmbSeoEntries', INITIAL_GMB_SEO_ENTRIES));
  const [keywords, setKeywords] = useState<Keyword[]>(() => getInitialData('keywords', INITIAL_KEYWORDS));
  const [goals, setGoals] = useState<Goal[]>(() => getInitialData('goals', INITIAL_GOALS));
  const [recurringTasks, setRecurringTasks] = useState<RecurringTaskTemplate[]>(() => getInitialData('recurringTasks', INITIAL_RECURRING_TASKS));
  const [dailyTaskTemplates, setDailyTaskTemplates] = useState<DailyTaskTemplate[]>(() =>
    getInitialData('dailyTaskTemplates', INITIAL_DAILY_TASK_TEMPLATES)
  );

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_dailyTaskTemplates`, JSON.stringify(dailyTaskTemplates));
  }, [dailyTaskTemplates]);

  // Auto-generate today's tasks from Active daily task templates
  useEffect(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayDayCode = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][new Date().getDay()];
    const activeTemplates = dailyTaskTemplates.filter(t => {
      if (!t.active) return false;
      if (t.recurrence === 'custom') {
        if (!t.recurrence_days || t.recurrence_days.length === 0) return false;
        return t.recurrence_days.some(d => d.toLowerCase() === todayDayCode);
      }
      return true;
    });

    setTasks(prevTasks => {
      let created = false;
      const tasksToAppend: Task[] = [];

      activeTemplates.forEach(tpl => {
        const exists = prevTasks.some(t => t.template_id === tpl.id && t.date === todayStr);
        if (!exists) {
          created = true;
          tasksToAppend.push({
            id: `task-dt-${tpl.id}-${todayStr}`,
            client_id: tpl.client_id,
            title: tpl.title,
            date: todayStr,
            time: tpl.time || '09:30 AM',
            status: 'pending',
            is_recurring: true,
            recurrence_rule: tpl.recurrence,
            recurrence_days: tpl.recurrence_days,
            tags: ['DailyTemplate', tpl.assigned_employee || 'General'],
            work_type: tpl.work_type,
            reminder_enabled: true,
            template_id: tpl.id,
            assigned_employee: tpl.assigned_employee
          });
        }
      });

      if (created && tasksToAppend.length > 0) {
        return [...tasksToAppend, ...prevTasks];
      }
      return prevTasks;
    });
  }, [dailyTaskTemplates]);
  const [instagramAccounts, setInstagramAccounts] = useState<InstagramAccount[]>(() => getInitialData('instagramAccounts', INITIAL_INSTAGRAM_ACCOUNTS));
  const [instagramConnections, setInstagramConnections] = useState<Record<string, InstagramConnection>>(() => {
    const raw = getInitialData<Record<string, InstagramConnection>>('instagramConnections', {});
    // Audit data: ensure client_id matches the map key and remove any misaligned placeholder IDs (e.g. Raos ID on SmileCare)
    const audited: Record<string, InstagramConnection> = {};
    Object.entries(raw).forEach(([clientId, conn]) => {
      if (conn && conn.client_id === clientId && conn.is_connected && conn.ig_business_account_id) {
        // If SmileCare Dental Clinic (client-1) was wrongly assigned Raos ID (17841461175736178), clear it
        if (clientId === 'client-1' && conn.ig_business_account_id === '17841461175736178') {
          return;
        }
        audited[clientId] = conn;
      }
    });
    return audited;
  });

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_instagramConnections`, JSON.stringify(instagramConnections));
  }, [instagramConnections]);

  // Load instagram_connections from Supabase DB table on mount/config change
  useEffect(() => {
    if (supabaseConfig.url && supabaseConfig.key) {
      const restUrl = `${supabaseConfig.url.replace(/\/$/, '')}/rest/v1/instagram_connections?select=*`;
      fetch(restUrl, {
        headers: {
          'apikey': supabaseConfig.key,
          'Authorization': `Bearer ${supabaseConfig.key}`
        }
      })
      .then(res => res.ok ? res.json() : null)
      .then(rows => {
        if (Array.isArray(rows) && rows.length > 0) {
          const dbMap: Record<string, InstagramConnection> = {};
          rows.forEach((row: any) => {
            if (row.client_id && row.ig_business_account_id) {
              dbMap[row.client_id] = {
                client_id: row.client_id,
                ig_business_account_id: row.ig_business_account_id,
                is_connected: Boolean(row.is_connected),
                connected_at: row.connected_at,
                access_token_masked: row.access_token_masked || '••••••••'
              };
            }
          });
          setInstagramConnections(prev => ({ ...prev, ...dbMap }));
        }
      })
      .catch(() => {});
    }
  }, [supabaseConfig.url, supabaseConfig.key]);

  const saveInstagramConnection = (clientId: string, accountId: string, accessToken: string) => {
    const masked = accessToken.length > 8 ? `${accessToken.slice(0, 4)}...${accessToken.slice(-4)}` : '••••••••';
    const connData: InstagramConnection = {
      client_id: clientId,
      ig_business_account_id: accountId,
      is_connected: true,
      connected_at: new Date().toISOString(),
      access_token_masked: masked,
      access_token: accessToken
    };

    setInstagramConnections(prev => ({
      ...prev,
      [clientId]: connData
    }));

    // Persist to Supabase database table `instagram_connections`
    if (supabaseConfig.url && supabaseConfig.key) {
      const restUrl = `${supabaseConfig.url.replace(/\/$/, '')}/rest/v1/instagram_connections`;
      fetch(restUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseConfig.key,
          'Authorization': `Bearer ${supabaseConfig.key}`,
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          client_id: clientId,
          ig_business_account_id: accountId,
          is_connected: true,
          connected_at: connData.connected_at,
          access_token_masked: masked
        })
      }).catch(err => console.warn('Supabase instagram_connections table sync notice:', err));
    }
  };

  const disconnectInstagramConnection = (clientId: string) => {
    setInstagramConnections(prev => {
      const copy = { ...prev };
      delete copy[clientId];
      return copy;
    });

    if (supabaseConfig.url && supabaseConfig.key) {
      const restUrl = `${supabaseConfig.url.replace(/\/$/, '')}/rest/v1/instagram_connections?client_id=eq.${clientId}`;
      fetch(restUrl, {
        method: 'DELETE',
        headers: {
          'apikey': supabaseConfig.key,
          'Authorization': `Bearer ${supabaseConfig.key}`
        }
      }).catch(err => console.warn('Supabase instagram_connections table delete notice:', err));
    }
  };

  const toggleInstagramConnect = (clientId: string) => {
    setInstagramAccounts(prev => prev.map(a => {
      if (a.client_id === clientId) {
        return { ...a, connected: !a.connected };
      }
      return a;
    }));
  };

  const [filters, setFilters] = useState<TagFilter>({
    selectedTag: undefined,
    selectedStatus: 'all',
    selectedWorkType: 'all',
    searchQuery: '',
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const todayStr = new Date().toISOString().slice(0, 10);

  const [reportSentAtToday, setReportSentAtToday] = useState<string | null>(() => {
    return localStorage.getItem(`${LOCAL_STORAGE_KEY}_report_sent_${todayStr}`);
  });

  const markReportSentToday = () => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setReportSentAtToday(timeStr);
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_report_sent_${todayStr}`, timeStr);
  };

  const [subashGlobalPhone, setSubashGlobalPhone] = useState<string>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_subashPhone`);
    return saved || '+19876543210';
  });

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_subashPhone`, subashGlobalPhone);
  }, [subashGlobalPhone]);

  // LocalStorage sync effects
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_clients`, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_tasks`, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_workLogs`, JSON.stringify(workLogs));
  }, [workLogs]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_gmbSeoEntries`, JSON.stringify(gmbSeoEntries));
  }, [gmbSeoEntries]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_keywords`, JSON.stringify(keywords));
  }, [keywords]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_goals`, JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_recurringTasks`, JSON.stringify(recurringTasks));
  }, [recurringTasks]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_instagramAccounts`, JSON.stringify(instagramAccounts));
  }, [instagramAccounts]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_supabase`, JSON.stringify(supabaseConfig));
  }, [supabaseConfig]);

  const activeClient = clients.find(c => c.id === activeClientId);

  const triggerConfetti = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#0d9488', '#7c3aed', '#f59e0b', '#10b981', '#f43f5e']
    });
  };

  const addClient = (newClientData: Omit<Client, 'id' | 'created_at'>): { success: boolean; error?: string } => {
    const trimmedName = newClientData.name.trim();
    if (!trimmedName) {
      return { success: false, error: 'Client name is required.' };
    }

    // Duplicate check (case-insensitive)
    const exists = clients.some(c => c.name.trim().toLowerCase() === trimmedName.toLowerCase());
    if (exists) {
      return { success: false, error: `A client named "${trimmedName}" already exists.` };
    }

    const uniqueId = `client-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const creatorUsername = user?.username ? user.username.trim() : 'Admin';

    const newClient: Client = {
      ...newClientData,
      name: trimmedName,
      id: uniqueId,
      created_by: creatorUsername,
      created_at: new Date().toISOString().slice(0, 10),
    };

    // 1. Update local clients state immediately
    setClients(prev => [...prev, newClient]);

    // 2. Automatically assign this client to creator (if user is logged in)
    if (user && creatorUsername) {
      const newAssignment: ClientAssignment = {
        id: `ca-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        employee_username: creatorUsername,
        client_id: uniqueId,
        assigned_at: new Date().toISOString()
      };
      setClientAssignments(prev => [...prev, newAssignment]);
    }

    // 3. Switch active client workspace immediately
    setActiveClientId(uniqueId);

    // 4. Sync with Supabase DB if connected
    if (supabaseConfig.url && supabaseConfig.key) {
      const clientUrl = `${supabaseConfig.url.replace(/\/$/, '')}/rest/v1/clients`;
      fetch(clientUrl, {
        method: 'POST',
        headers: {
          'apikey': supabaseConfig.key,
          'Authorization': `Bearer ${supabaseConfig.key}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          id: uniqueId,
          name: trimmedName,
          business_type: newClient.business_type,
          phone_number: newClient.phone_number || '+19876543210',
          avatar_color: newClient.avatar_color,
          instagram_handle: newClient.instagram_handle || null,
          contact_notes: newClient.contact_notes || null,
          created_by: creatorUsername,
          created_at: newClient.created_at
        })
      }).catch(err => console.warn('Supabase clients insert warning:', err));

      if (user && creatorUsername) {
        const assignUrl = `${supabaseConfig.url.replace(/\/$/, '')}/rest/v1/client_assignments`;
        fetch(assignUrl, {
          method: 'POST',
          headers: {
            'apikey': supabaseConfig.key,
            'Authorization': `Bearer ${supabaseConfig.key}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            employee_username: creatorUsername,
            client_id: uniqueId
          })
        }).catch(err => console.warn('Supabase client_assignments insert warning:', err));
      }
    }

    triggerConfetti();
    return { success: true };
  };

  const addTask = (taskData: Omit<Task, 'id' | 'status'>) => {
    const newId = `task-${Date.now()}`;
    const newTask: Task = {
      ...taskData,
      id: newId,
      status: 'pending',
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const toggleTaskStatus = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const nextStatus: TaskStatus = t.status === 'pending' ? 'done' : 'pending';
        
        // Auto generate work log entry on task completion
        if (nextStatus === 'done') {
          triggerConfetti();
          const todayStr = new Date().toISOString().slice(0, 10);
          const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const newLog: WorkLog = {
            id: `log-${Date.now()}`,
            client_id: t.client_id,
            task_id: t.id,
            note: `Completed task: "${t.title}" at ${timeStr}`,
            auto_generated: true,
            created_at: new Date().toISOString(),
            date: todayStr
          };
          setWorkLogs(logs => [newLog, ...logs]);
        }

        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const toggleTaskReminder = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, reminder_enabled: !t.reminder_enabled } : t));
  };

  const addWorkLogNote = (clientId: string, note: string) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const newLog: WorkLog = {
      id: `log-${Date.now()}`,
      client_id: clientId,
      note,
      auto_generated: false,
      created_at: new Date().toISOString(),
      date: todayStr
    };
    setWorkLogs(logs => [newLog, ...logs]);
  };

  const addGmbSeoEntry = (entryData: Omit<GmbSeoEntry, 'id' | 'next_check_date'>) => {
    const dateObj = new Date(entryData.date_posted);
    dateObj.setDate(dateObj.getDate() + 7);
    const nextCheck = dateObj.toISOString().slice(0, 10);

    const newEntry: GmbSeoEntry = {
      ...entryData,
      id: `entry-${Date.now()}`,
      next_check_date: nextCheck
    };
    setGmbSeoEntries(prev => [newEntry, ...prev]);
  };

  const updateGmbSeoEntryMetrics = (entryId: string, searchPos: number, mapsPos: number, views: number, clicks: number) => {
    const dateObj = new Date();
    dateObj.setDate(dateObj.getDate() + 7);
    const nextCheck = dateObj.toISOString().slice(0, 10);

    setGmbSeoEntries(prev => prev.map(e => {
      if (e.id === entryId) {
        return {
          ...e,
          prev_search_position: e.search_position,
          search_position: searchPos,
          prev_maps_position: e.maps_position,
          maps_position: mapsPos,
          views,
          clicks,
          next_check_date: nextCheck
        };
      }
      return e;
    }));
  };

  const addKeyword = (clientId: string, keyword: string, currentPos: number, targetPos: number, searchVolume?: string) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const kwId = `kw-${Date.now()}`;
    const newKw: Keyword = {
      id: kwId,
      client_id: clientId,
      keyword,
      current_position: currentPos,
      target_position: targetPos,
      search_volume: searchVolume || '1,000/mo',
      history: [
        { id: `h-${Date.now()}`, keyword_id: kwId, position: currentPos, recorded_at: todayStr }
      ]
    };
    setKeywords(prev => [...prev, newKw]);
  };

  const updateKeywordPosition = (keywordId: string, newPosition: number) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    setKeywords(prev => prev.map(k => {
      if (k.id === keywordId) {
        const newHistory = [
          ...k.history,
          { id: `h-${Date.now()}`, keyword_id: keywordId, position: newPosition, recorded_at: todayStr }
        ];
        return {
          ...k,
          current_position: newPosition,
          history: newHistory
        };
      }
      return k;
    }));
  };

  const deleteKeyword = (keywordId: string) => {
    setKeywords(prev => prev.filter(k => k.id !== keywordId));
  };

  const addGoal = (goalData: Omit<Goal, 'id' | 'status'>) => {
    let status: GoalStatus = 'on_track';
    if (goalData.current_value >= goalData.target_value) {
      status = 'achieved';
    }
    const newGoal: Goal = {
      ...goalData,
      id: `goal-${Date.now()}`,
      status
    };
    setGoals(prev => [...prev, newGoal]);
  };

  const updateGoalProgress = (goalId: string, currentValue: number) => {
    setGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        let status: GoalStatus = g.status;
        if (currentValue >= g.target_value) {
          status = 'achieved';
          triggerConfetti();
        } else if (currentValue < g.target_value / 2) {
          status = 'behind';
        } else {
          status = 'on_track';
        }
        return { ...g, current_value: currentValue, status };
      }
      return g;
    }));
  };

  const addRecurringTask = (recData: Omit<RecurringTaskTemplate, 'id' | 'active'>) => {
    const newRec: RecurringTaskTemplate = {
      ...recData,
      id: `rec-${Date.now()}`,
      active: true
    };
    setRecurringTasks(prev => [...prev, newRec]);
  };

  const toggleRecurringTask = (recId: string) => {
    setRecurringTasks(prev => prev.map(r => r.id === recId ? { ...r, active: !r.active } : r));
  };

  const assignClientsToEmployee = (employeeUsername: string, clientIds: string[]) => {
    const trimmedEmp = employeeUsername.trim();
    setClientAssignments(prev => {
      const filtered = prev.filter(ca => ca.employee_username.trim().toLowerCase() !== trimmedEmp.toLowerCase());
      const newAssignments: ClientAssignment[] = clientIds.map(cId => ({
        id: `ca-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        employee_username: trimmedEmp,
        client_id: cId,
        assigned_at: new Date().toISOString()
      }));
      return [...filtered, ...newAssignments];
    });

    if (supabaseConfig.url && supabaseConfig.key) {
      const restUrl = `${supabaseConfig.url.replace(/\/$/, '')}/rest/v1/client_assignments`;
      fetch(`${restUrl}?employee_username=eq.${encodeURIComponent(trimmedEmp)}`, {
        method: 'DELETE',
        headers: { 'apikey': supabaseConfig.key, 'Authorization': `Bearer ${supabaseConfig.key}` }
      }).then(() => {
        if (clientIds.length > 0) {
          fetch(restUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseConfig.key,
              'Authorization': `Bearer ${supabaseConfig.key}`
            },
            body: JSON.stringify(clientIds.map(cId => ({
              employee_username: trimmedEmp,
              client_id: cId
            })))
          }).catch(err => console.warn('Supabase client_assignments sync warning:', err));
        }
      }).catch(() => {});
    }
  };

  const login = async (inputUsername: string, inputPassword: string): Promise<{ success: boolean; error?: string }> => {
    const normUser = inputUsername.trim().toLowerCase();

    const ACCOUNT_MAP: Record<string, { username: string; email: string; pass: string; role: UserRole }> = {
      subash: { username: 'Subash', email: 'Subash@iBrainLabs', pass: 'Subash@iBrain2026#', role: 'admin' },
      'subash@ibrainlabs': { username: 'Subash', email: 'Subash@iBrainLabs', pass: 'Subash@iBrain2026#', role: 'admin' },
      'subash@anticai.app': { username: 'Subash', email: 'Subash@iBrainLabs', pass: 'Subash@iBrain2026#', role: 'admin' },

      nithin: { username: 'Nithin', email: 'Nithin@iBrainLabs', pass: 'nithin@123', role: 'employee' },
      'nithin@ibrainlabs': { username: 'Nithin', email: 'Nithin@iBrainLabs', pass: 'nithin@123', role: 'employee' },

      bhargavi: { username: 'Bhargavi', email: 'Bhargavi@iBrainLabs', pass: 'bhargavi@123', role: 'employee' },
      'bhargavi@ibrainlabs': { username: 'Bhargavi', email: 'Bhargavi@iBrainLabs', pass: 'bhargavi@123', role: 'employee' },

      anji: { username: 'Anji', email: 'Anji@iBrainLabs', pass: 'anji@123', role: 'employee' },
      'anji@ibrainlabs': { username: 'Anji', email: 'Anji@iBrainLabs', pass: 'anji@123', role: 'employee' },
      anjaneyulu: { username: 'Anji', email: 'Anji@iBrainLabs', pass: 'anji@123', role: 'employee' },
      'anjaneyulu@ibrainlabs': { username: 'Anji', email: 'Anji@iBrainLabs', pass: 'anji@123', role: 'employee' },

      teju: { username: 'Teju', email: 'Teju@iBrainLabs', pass: 'teju@123', role: 'employee' },
      'teju@ibrainlabs': { username: 'Teju', email: 'Teju@iBrainLabs', pass: 'teju@123', role: 'employee' },

      pavani: { username: 'Pavani', email: 'Pavani@iBrainLabs', pass: 'pavani@123', role: 'employee' },
      'pavani@ibrainlabs': { username: 'Pavani', email: 'Pavani@iBrainLabs', pass: 'pavani@123', role: 'employee' },

      sikta: { username: 'Sikta', email: 'Sikta@iBrainLabs', pass: 'sikta@123', role: 'employee' },
      'sikta@ibrainlabs': { username: 'Sikta', email: 'Sikta@iBrainLabs', pass: 'sikta@123', role: 'employee' }
    };

    const matched = ACCOUNT_MAP[normUser];

    if (matched && inputPassword === matched.pass) {
      const sessionUser: AppUser = {
        username: matched.username,
        email: matched.email,
        role: matched.role
      };

      if (sessionUser.role === 'admin') {
        setActiveClientId('all');
      } else {
        const empAssigned = clientAssignments
          .filter(ca => ca.employee_username.trim().toLowerCase() === matched.username.toLowerCase())
          .map(ca => ca.client_id);
        const empClients = clients.filter(c => empAssigned.includes(c.id));
        if (empClients.length > 0) {
          setActiveClientId(empClients[0].id);
        } else {
          setActiveClientId('');
        }
      }

      setUser(sessionUser);
      setIsAuthenticated(true);
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_auth_session`, JSON.stringify({ user: sessionUser }));
      triggerConfetti();
      return { success: true };
    }

    if (supabaseConfig.url && supabaseConfig.key) {
      try {
        const email = normUser.includes('@') ? normUser : `${normUser}@iBrainLabs`;
        const restAuthUrl = `${supabaseConfig.url.replace(/\/$/, '')}/auth/v1/token?grant_type=password`;
        const res = await fetch(restAuthUrl, {
          method: 'POST',
          headers: {
            'apikey': supabaseConfig.key,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password: inputPassword })
        });

        if (res.ok) {
          const authData = await res.json();
          const isSubashAdmin = normUser.includes('subash');
          const sessionUser: AppUser = {
            username: inputUsername.trim(),
            email: authData.user?.email || email,
            role: isSubashAdmin ? 'admin' : 'employee'
          };

          if (sessionUser.role === 'admin') {
            setActiveClientId('all');
          } else {
            const empAssigned = clientAssignments
              .filter(ca => ca.employee_username.trim().toLowerCase() === sessionUser.username.toLowerCase())
              .map(ca => ca.client_id);
            const empClients = clients.filter(c => empAssigned.includes(c.id));
            if (empClients.length > 0) {
              setActiveClientId(empClients[0].id);
            } else {
              setActiveClientId('');
            }
          }

          setUser(sessionUser);
          setIsAuthenticated(true);
          localStorage.setItem(`${LOCAL_STORAGE_KEY}_auth_session`, JSON.stringify({ user: sessionUser, access_token: authData.access_token }));
          triggerConfetti();
          return { success: true };
        }
      } catch (err) {
        console.warn('Supabase Auth notice:', err);
      }
    }

    return { success: false, error: 'Invalid credentials. Valid accounts: Subash (Admin), Nithin, Bhargavi, Anji, Teju, Pavani, Sikta' };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_auth_session`);
  };

  const addDailyTaskTemplate = (tplData: Omit<DailyTaskTemplate, 'id' | 'created_at'>) => {
    const newTpl: DailyTaskTemplate = {
      ...tplData,
      id: `dt-${Date.now()}`,
      created_at: new Date().toISOString().slice(0, 10)
    };
    setDailyTaskTemplates(prev => [newTpl, ...prev]);
  };

  const updateDailyTaskTemplate = (id: string, updated: Partial<DailyTaskTemplate>) => {
    setDailyTaskTemplates(prev => prev.map(t => t.id === id ? { ...t, ...updated } : t));
  };

  const deleteDailyTaskTemplate = (id: string) => {
    setDailyTaskTemplates(prev => prev.filter(t => t.id !== id));
  };

  const toggleDailyTaskTemplate = (id: string) => {
    setDailyTaskTemplates(prev => prev.map(t => t.id === id ? { ...t, active: !t.active } : t));
  };

  const resetToSeedData = () => {
    setClients(INITIAL_CLIENTS);
    setTasks(INITIAL_TASKS);
    setWorkLogs(INITIAL_WORK_LOGS);
    setGmbSeoEntries(INITIAL_GMB_SEO_ENTRIES);
    setKeywords(INITIAL_KEYWORDS);
    setGoals(INITIAL_GOALS);
    setRecurringTasks(INITIAL_RECURRING_TASKS);
    setDailyTaskTemplates(INITIAL_DAILY_TASK_TEMPLATES);
    setClientAssignments(INITIAL_CLIENT_ASSIGNMENTS);
    localStorage.clear();
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        clients,
        assignedClients,
        clientAssignments,
        assignClientsToEmployee,
        activeClientId,
        setActiveClientId,
        activeClient,
        activeTab,
        setActiveTab,
        tasks,
        workLogs,
        gmbSeoEntries,
        keywords,
        goals,
        recurringTasks,
        dailyTaskTemplates,
        addDailyTaskTemplate,
        updateDailyTaskTemplate,
        deleteDailyTaskTemplate,
        toggleDailyTaskTemplate,
        instagramAccounts,
        instagramConnections,
        toggleInstagramConnect,
        saveInstagramConnection,
        disconnectInstagramConnection,
        filters,
        setFilters,
        isFilterOpen,
        setIsFilterOpen,
        subashGlobalPhone,
        setSubashGlobalPhone,
        reportSentAtToday,
        markReportSentToday,
        supabaseConfig,
        setSupabaseConfig,
        addClient,
        addTask,
        toggleTaskStatus,
        deleteTask,
        toggleTaskReminder,
        addWorkLogNote,
        addGmbSeoEntry,
        updateGmbSeoEntryMetrics,
        addKeyword,
        updateKeywordPosition,
        deleteKeyword,
        addGoal,
        updateGoalProgress,
        addRecurringTask,
        toggleRecurringTask,
        triggerConfetti,
        resetToSeedData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
