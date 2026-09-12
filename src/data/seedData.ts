import { Client, Task, WorkLog, GmbSeoEntry, Keyword, Goal, RecurringTaskTemplate, DailyTaskTemplate, InstagramAccount } from '../types';

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'client-1',
    name: 'SmileCare Dental Clinic',
    phone_number: '+19876543210',
    business_type: 'Clinic',
    avatar_color: '#0d9488', // Teal
    created_at: '2026-08-01',
  },
  {
    id: 'client-2',
    name: 'Urban Grind Coffee Co.',
    phone_number: '+19876543211',
    business_type: 'Shop',
    avatar_color: '#7c3aed', // Purple
    created_at: '2026-08-05',
  },
  {
    id: 'client-3',
    name: 'Aura Wellness Spa',
    phone_number: '+19876543212',
    business_type: 'Local Business',
    avatar_color: '#f59e0b', // Amber
    created_at: '2026-08-10',
  },
  {
    id: 'client-4',
    name: 'Apex Motors Auto Repair',
    phone_number: '+19876543213',
    business_type: 'Service Provider',
    avatar_color: '#f43f5e', // Coral / Rose
    created_at: '2026-08-15',
  },
];

const TODAY = '2026-09-11';
const YESTERDAY = '2026-09-10';
const TOMORROW = '2026-09-12';

export const INITIAL_TASKS: Task[] = [
  // Today tasks for SmileCare Dental
  {
    id: 'task-1',
    client_id: 'client-1',
    title: 'Publish GMB Post: Weekend Dental Checkup Special Offer',
    date: TODAY,
    time: '09:30 AM',
    status: 'pending',
    is_recurring: true,
    recurrence_rule: 'weekly',
    tags: ['GMB', 'Offer', 'Promo'],
    work_type: 'GMB Post',
    reminder_enabled: true,
  },
  {
    id: 'task-2',
    client_id: 'client-1',
    title: 'Publish SEO Blog: Top 5 Benefits of Teeth Whitening in 2026',
    date: TODAY,
    time: '11:00 AM',
    status: 'done',
    is_recurring: false,
    tags: ['SEO', 'Content', 'Blog'],
    work_type: 'SEO Blog',
    reminder_enabled: false,
  },
  {
    id: 'task-3',
    client_id: 'client-1',
    title: 'Respond to 6 new Google 5-Star Reviews',
    date: TODAY,
    time: '02:00 PM',
    status: 'pending',
    is_recurring: true,
    recurrence_rule: 'daily',
    tags: ['Reviews', 'Reputation'],
    work_type: 'Review Response',
    reminder_enabled: true,
  },

  // Today tasks for Urban Grind Coffee
  {
    id: 'task-4',
    client_id: 'client-2',
    title: 'Upload GMB Photo: Autumn Espresso Special Menu',
    date: TODAY,
    time: '10:00 AM',
    status: 'done',
    is_recurring: false,
    tags: ['GMB', 'Photos'],
    work_type: 'GMB Post',
    reminder_enabled: true,
  },
  {
    id: 'task-5',
    client_id: 'client-2',
    title: 'Set up Meta Local Ad Campaign for Downtown Location',
    date: TODAY,
    time: '03:30 PM',
    status: 'pending',
    is_recurring: false,
    tags: ['Ads', 'Meta', 'PPC'],
    work_type: 'Ad Campaign',
    reminder_enabled: true,
  },

  // Today tasks for Aura Wellness Spa
  {
    id: 'task-6',
    client_id: 'client-3',
    title: 'Audit Google Maps Local Pack Position for "Aromatherapy Spa"',
    date: TODAY,
    time: '04:00 PM',
    status: 'pending',
    is_recurring: true,
    recurrence_rule: 'weekly',
    tags: ['SEO', 'Local SEO', 'Maps'],
    work_type: 'SEO Blog',
    reminder_enabled: true,
  },

  // Upcoming Tasks
  {
    id: 'task-7',
    client_id: 'client-1',
    title: 'Submit Monthly SEO Keyword Ranking Report to Client',
    date: TOMORROW,
    time: '10:00 AM',
    status: 'pending',
    is_recurring: false,
    tags: ['Report', 'SEO'],
    work_type: 'General',
    reminder_enabled: true,
  },
  {
    id: 'task-8',
    client_id: 'client-2',
    title: 'Publish Blog: Artisanal Coffee Brewing Guide for Beginners',
    date: '2026-09-14',
    time: '11:30 AM',
    status: 'pending',
    is_recurring: false,
    tags: ['Blog', 'SEO'],
    work_type: 'SEO Blog',
    reminder_enabled: true,
  },
  {
    id: 'task-9',
    client_id: 'client-4',
    title: 'GMB Post: Brake Inspection Safety Package \$49',
    date: '2026-09-15',
    time: '09:00 AM',
    status: 'pending',
    is_recurring: true,
    recurrence_rule: 'weekly',
    tags: ['GMB', 'Promo'],
    work_type: 'GMB Post',
    reminder_enabled: true,
  },
  {
    id: 'task-10',
    client_id: 'client-3',
    title: 'Design Instagram Story Graphics for Massage Discount',
    date: '2026-09-16',
    time: '01:00 PM',
    status: 'pending',
    is_recurring: false,
    tags: ['Design', 'Social'],
    work_type: 'Design',
    reminder_enabled: false,
  }
];

export const INITIAL_WORK_LOGS: WorkLog[] = [
  {
    id: 'log-1',
    client_id: 'client-1',
    task_id: 'task-2',
    note: 'Published blog article "Top 5 Benefits of Teeth Whitening in 2026" on main site with internal links to appointment page.',
    auto_generated: true,
    created_at: `${TODAY}T11:05:00.000Z`,
    date: TODAY,
  },
  {
    id: 'log-2',
    client_id: 'client-2',
    task_id: 'task-4',
    note: 'Uploaded 4 high-resolution photos of Autumn Espresso menu to GMB photos gallery.',
    auto_generated: true,
    created_at: `${TODAY}T10:12:00.000Z`,
    date: TODAY,
  },
  {
    id: 'log-3',
    client_id: 'client-1',
    note: 'Client called requesting additional focus on "Emergency Dentist" keywords for upcoming ad campaign.',
    auto_generated: false,
    created_at: `${YESTERDAY}T16:30:00.000Z`,
    date: YESTERDAY,
  }
];

export const INITIAL_GMB_SEO_ENTRIES: GmbSeoEntry[] = [
  {
    id: 'entry-1',
    client_id: 'client-1',
    title: 'Emergency Dentist Near Me Guide',
    type: 'seo_blog',
    date_posted: '2026-09-04',
    search_position: 3,
    prev_search_position: 8,
    maps_position: 2,
    prev_maps_position: 4,
    views: 1420,
    clicks: 184,
    next_check_date: TODAY, // Recheck due today!
    url: 'https://smilecaredental.com/blog/emergency-dentist',
    notes: 'Major position boost following schema markup update.'
  },
  {
    id: 'entry-2',
    client_id: 'client-1',
    title: 'Free Dental Consultation September Special',
    type: 'gmb_post',
    date_posted: '2026-09-07',
    search_position: 4,
    prev_search_position: 6,
    maps_position: 3,
    prev_maps_position: 3,
    views: 890,
    clicks: 92,
    next_check_date: '2026-09-14',
    notes: 'Generated 14 direct phone calls from Maps call button.'
  },
  {
    id: 'entry-3',
    client_id: 'client-2',
    title: 'Best Coffee Shop with Free WiFi in Downtown',
    type: 'seo_blog',
    date_posted: '2026-09-02',
    search_position: 2,
    prev_search_position: 5,
    maps_position: 1,
    prev_maps_position: 2,
    views: 2100,
    clicks: 340,
    next_check_date: TODAY, // Recheck due today!
    url: 'https://urbangrindcoffee.com/best-wifi-coffee-downtown',
    notes: '#1 ranking achieved on Google Local Pack!'
  },
  {
    id: 'entry-4',
    client_id: 'client-3',
    title: 'Deep Tissue Massage vs Swedish Massage Comparison',
    type: 'seo_blog',
    date_posted: '2026-09-05',
    search_position: 5,
    prev_search_position: 9,
    maps_position: 4,
    prev_maps_position: 7,
    views: 950,
    clicks: 110,
    next_check_date: '2026-09-12',
    notes: 'Ranking climbing steadily on organic search.'
  }
];

export const INITIAL_KEYWORDS: Keyword[] = [
  {
    id: 'kw-1',
    client_id: 'client-1',
    keyword: 'emergency dentist near me',
    current_position: 3,
    target_position: 1,
    search_volume: '2,400/mo',
    history: [
      { id: 'h1', keyword_id: 'kw-1', position: 12, recorded_at: '2026-08-15' },
      { id: 'h2', keyword_id: 'kw-1', position: 9, recorded_at: '2026-08-22' },
      { id: 'h3', keyword_id: 'kw-1', position: 8, recorded_at: '2026-08-29' },
      { id: 'h4', keyword_id: 'kw-1', position: 5, recorded_at: '2026-09-05' },
      { id: 'h5', keyword_id: 'kw-1', position: 3, recorded_at: '2026-09-11' },
    ]
  },
  {
    id: 'kw-2',
    client_id: 'client-1',
    keyword: 'teeth whitening dentist',
    current_position: 4,
    target_position: 2,
    search_volume: '1,800/mo',
    history: [
      { id: 'h6', keyword_id: 'kw-2', position: 14, recorded_at: '2026-08-15' },
      { id: 'h7', keyword_id: 'kw-2', position: 10, recorded_at: '2026-08-22' },
      { id: 'h8', keyword_id: 'kw-2', position: 7, recorded_at: '2026-08-29' },
      { id: 'h9', keyword_id: 'kw-2', position: 6, recorded_at: '2026-09-05' },
      { id: 'h10', keyword_id: 'kw-2', position: 4, recorded_at: '2026-09-11' },
    ]
  },
  {
    id: 'kw-3',
    client_id: 'client-2',
    keyword: 'best espresso bar downtown',
    current_position: 1,
    target_position: 1,
    search_volume: '3,100/mo',
    history: [
      { id: 'h11', keyword_id: 'kw-3', position: 6, recorded_at: '2026-08-15' },
      { id: 'h12', keyword_id: 'kw-3', position: 4, recorded_at: '2026-08-22' },
      { id: 'h13', keyword_id: 'kw-3', position: 2, recorded_at: '2026-08-29' },
      { id: 'h14', keyword_id: 'kw-3', position: 1, recorded_at: '2026-09-05' },
      { id: 'h15', keyword_id: 'kw-3', position: 1, recorded_at: '2026-09-11' },
    ]
  },
  {
    id: 'kw-4',
    client_id: 'client-3',
    keyword: 'organic aromatherapy massage',
    current_position: 5,
    target_position: 3,
    search_volume: '950/mo',
    history: [
      { id: 'h16', keyword_id: 'kw-4', position: 15, recorded_at: '2026-08-15' },
      { id: 'h17', keyword_id: 'kw-4', position: 11, recorded_at: '2026-08-22' },
      { id: 'h18', keyword_id: 'kw-4', position: 8, recorded_at: '2026-08-29' },
      { id: 'h19', keyword_id: 'kw-4', position: 6, recorded_at: '2026-09-05' },
      { id: 'h20', keyword_id: 'kw-4', position: 5, recorded_at: '2026-09-11' },
    ]
  }
];

export const INITIAL_GOALS: Goal[] = [
  {
    id: 'goal-1',
    client_id: 'client-1',
    description: 'Achieve Top 3 Google Local Pack Ranking for "Emergency Dentist"',
    target_date: '2026-09-30',
    target_value: 3,
    current_value: 3,
    unit: 'Rank Position',
    status: 'achieved'
  },
  {
    id: 'goal-2',
    client_id: 'client-1',
    description: 'Publish 8 GMB Special Offer Posts this month',
    target_date: '2026-09-30',
    target_value: 8,
    current_value: 5,
    unit: 'Posts',
    status: 'on_track'
  },
  {
    id: 'goal-3',
    client_id: 'client-2',
    description: 'Generate 500 Google Maps Direct Call Clicks',
    target_date: '2026-09-30',
    target_value: 500,
    current_value: 340,
    unit: 'Calls/Clicks',
    status: 'on_track'
  },
  {
    id: 'goal-4',
    client_id: 'client-3',
    description: 'Collect 20 New 5-Star Reviews on Google Business Profile',
    target_date: '2026-09-30',
    target_value: 20,
    current_value: 9,
    unit: 'Reviews',
    status: 'behind'
  }
];

export const INITIAL_RECURRING_TASKS: RecurringTaskTemplate[] = [
  {
    id: 'rec-1',
    client_id: 'client-1',
    title: 'Weekly GMB Offer & Service Photo Update',
    recurrence: 'weekly',
    work_type: 'GMB Post',
    tags: ['GMB', 'Weekly'],
    time: '09:30 AM',
    active: true
  },
  {
    id: 'rec-2',
    client_id: 'client-1',
    title: 'Daily Google Business Profile Review Audit & Response',
    recurrence: 'daily',
    work_type: 'Review Response',
    tags: ['Reviews'],
    time: '02:00 PM',
    active: true
  },
  {
    id: 'rec-3',
    client_id: 'client-2',
    title: 'Bi-Weekly SEO Blog Article Publication',
    recurrence: 'weekly',
    work_type: 'SEO Blog',
    tags: ['SEO', 'Content'],
    time: '11:00 AM',
    active: true
  }
];

export const INITIAL_INSTAGRAM_ACCOUNTS: InstagramAccount[] = [];

export const INITIAL_DAILY_TASK_TEMPLATES: DailyTaskTemplate[] = [
  {
    id: 'dt-1',
    title: 'Daily GMB Offer Post & Photo Update',
    assigned_employee: 'Subash',
    client_id: 'client-1',
    time: '09:30 AM',
    work_type: 'GMB Post',
    recurrence: 'daily',
    active: true,
    created_at: '2026-09-01'
  },
  {
    id: 'dt-2',
    title: 'Google Business Review Monitoring & Response',
    assigned_employee: 'Anjaneyulu',
    client_id: 'all',
    time: '11:00 AM',
    work_type: 'Review Response',
    recurrence: 'daily',
    active: true,
    created_at: '2026-09-01'
  },
  {
    id: 'dt-3',
    title: 'Social Media Reel & Story Publishing',
    assigned_employee: 'Priya',
    client_id: 'client-2',
    time: '02:00 PM',
    work_type: 'Social Media',
    recurrence: 'daily',
    active: true,
    created_at: '2026-09-01'
  },
  {
    id: 'dt-4',
    title: 'Daily Ad Campaign Bidding & Keyword Audit',
    assigned_employee: 'Rahul',
    client_id: 'all',
    time: '04:30 PM',
    work_type: 'Ad Campaign',
    recurrence: 'daily',
    active: true,
    created_at: '2026-09-01'
  }
];
