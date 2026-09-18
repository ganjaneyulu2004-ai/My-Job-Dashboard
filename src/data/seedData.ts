import { Client, Task, WorkLog, GmbSeoEntry, Keyword, Goal, RecurringTaskTemplate, DailyTaskTemplate, InstagramAccount, ClientAssignment, BlogPost, ScheduledPost, SpecialDayContent, Backlink } from '../types';

export const INITIAL_BACKLINKS: Backlink[] = [];

export const INITIAL_SPECIAL_DAYS: SpecialDayContent[] = [
  {
    id: 'sd-1',
    client_id: 'client-6',
    occasion_name: 'World Wildlife Day Tiger Safari Promotion',
    date: '2026-09-20',
    media_urls: [
      'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=600&q=80'
    ],
    created_at: new Date().toISOString().slice(0, 10)
  }
];

export const INITIAL_SCHEDULED_POSTS: ScheduledPost[] = [
  {
    id: 'sp-1',
    client_id: 'client-6',
    media_url: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=600&q=80',
    media_type: 'image',
    caption: 'Experience luxury tiger safari packages this season at Avani Tiger Resorts! Book early 🐯 #AvaniResorts #TigerSafari',
    scheduled_datetime: new Date(Date.now() + 3600000).toISOString(),
    status: 'pending',
    created_at: new Date().toISOString().slice(0, 10)
  },
  {
    id: 'sp-2',
    client_id: 'client-5',
    media_url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=600&q=80',
    media_type: 'image',
    caption: 'Admissions open for 2026-27 batch! Empowering young minds for a brighter future 🎓 #RaosSchools #Education',
    scheduled_datetime: new Date(Date.now() - 7200000).toISOString(),
    status: 'posted',
    created_at: new Date().toISOString().slice(0, 10)
  }
];

export const INITIAL_BLOGS: BlogPost[] = [
  {
    id: 'blog-1',
    client_id: 'client-7',
    primary_keyword: 'pediatric health checkup guide',
    secondary_keywords: ['child vaccination schedule', 'pediatrician near me', 'child immunity tips'],
    content: `# Pediatric Health Checkup Guide\n\nRegular child health checkups are essential for tracking growth milestones and ensuring timely vaccinations.\n\n## Key Recommendations\n- Annual routine physical exam\n- Growth and development monitoring\n- Immunization updates`,
    images: [],
    status: 'draft',
    created_at: '2026-09-15'
  },
  {
    id: 'blog-2',
    client_id: 'client-6',
    primary_keyword: 'best time tiger safari',
    secondary_keywords: ['monsoon safari timing', 'winter safari schedule', 'national park booking'],
    content: `# Ultimate Guide: Best Time for Tiger Safari\n\nPlanning a tiger safari requires timing your visit with optimal weather and animal activity. Winter months offer pleasant weather, while summer months yield higher sighting frequencies near water holes.\n\n## Recommended Months\n- November to February: Comfortable weather\n- March to June: Peak wildlife sightings`,
    images: [],
    status: 'published',
    live_url: 'https://avanitigerresorts.com/blogs/best-time-tiger-safari',
    published_date: '2026-09-16',
    created_at: '2026-09-10'
  }
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'client-5',
    name: 'Raos Group Schools',
    phone_number: '+19876543214',
    business_type: 'Education',
    avatar_color: '#2563eb', // Blue
    created_at: '2026-07-25',
  },
  {
    id: 'client-6',
    name: 'Avani Tiger Resorts',
    phone_number: '+19876543215',
    business_type: 'Hospitality',
    avatar_color: '#059669', // Emerald
    created_at: '2026-08-01',
  },
  {
    id: 'client-7',
    name: 'Ved Children Clinic',
    phone_number: '+19876543216',
    business_type: 'Clinic',
    avatar_color: '#0284c7', // Sky Blue
    created_at: '2026-08-05',
  },
];

const TODAY = '2026-09-11';
const YESTERDAY = '2026-09-10';
const TOMORROW = '2026-09-12';

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    client_id: 'client-5',
    title: 'Publish GMB Post: Academic Excellence & Admissions 2026',
    date: TODAY,
    time: '09:30 AM',
    status: 'pending',
    is_recurring: true,
    recurrence_rule: 'weekly',
    tags: ['GMB', 'Admissions'],
    work_type: 'GMB Post',
    reminder_enabled: true,
  },
  {
    id: 'task-2',
    client_id: 'client-6',
    title: 'Publish SEO Blog: Best Season for Wildlife & Tiger Sightings',
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
    client_id: 'client-7',
    title: 'Respond to Google Patient Reviews & Inquiries',
    date: TODAY,
    time: '02:00 PM',
    status: 'pending',
    is_recurring: true,
    recurrence_rule: 'daily',
    tags: ['Reviews', 'Reputation'],
    work_type: 'Review Response',
    reminder_enabled: true,
  },
  {
    id: 'task-4',
    client_id: 'client-6',
    title: 'Upload GMB Photos: Luxury Villa Suites & Resort Amenities',
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
    client_id: 'client-5',
    title: 'Set up Meta Local Ad Campaign for Admissions Campaign',
    date: TODAY,
    time: '03:30 PM',
    status: 'pending',
    is_recurring: false,
    tags: ['Ads', 'Meta', 'PPC'],
    work_type: 'Ad Campaign',
    reminder_enabled: true,
  },
  {
    id: 'task-6',
    client_id: 'client-7',
    title: 'Audit Google Maps Local Pack Position for "Pediatrician Near Me"',
    date: TODAY,
    time: '04:00 PM',
    status: 'pending',
    is_recurring: true,
    recurrence_rule: 'weekly',
    tags: ['SEO', 'Local SEO', 'Maps'],
    work_type: 'SEO Blog',
    reminder_enabled: true,
  },
  {
    id: 'task-7',
    client_id: 'client-5',
    title: 'Submit Monthly SEO Keyword Ranking Report to Management',
    date: TOMORROW,
    time: '10:00 AM',
    status: 'pending',
    is_recurring: false,
    tags: ['Report', 'SEO'],
    work_type: 'General',
    reminder_enabled: true,
  }
];

export const INITIAL_WORK_LOGS: WorkLog[] = [
  {
    id: 'log-1',
    client_id: 'client-6',
    task_id: 'task-2',
    note: 'Published article "Best Season for Wildlife & Tiger Sightings" with resort booking call-to-actions.',
    auto_generated: true,
    created_at: `${TODAY}T11:05:00.000Z`,
    date: TODAY,
  },
  {
    id: 'log-2',
    client_id: 'client-6',
    task_id: 'task-4',
    note: 'Uploaded 5 high-resolution villa photos to Google Business Profile.',
    auto_generated: true,
    created_at: `${TODAY}T10:12:00.000Z`,
    date: TODAY,
  }
];

export const INITIAL_GMB_SEO_ENTRIES: GmbSeoEntry[] = [
  {
    id: 'entry-1',
    client_id: 'client-5',
    title: 'Best CBSE Schools Admission Guide 2026',
    type: 'seo_blog',
    date_posted: '2026-09-04',
    search_position: 2,
    prev_search_position: 5,
    maps_position: 1,
    prev_maps_position: 3,
    views: 2450,
    clicks: 310,
    next_check_date: TODAY,
    url: 'https://raosschools.edu/blogs/best-cbse-schools-guide',
    notes: '#1 ranking achieved on Google Local Pack for school admissions.'
  },
  {
    id: 'entry-2',
    client_id: 'client-6',
    title: 'Best Time for Tiger Safari Resort Stay',
    type: 'seo_blog',
    date_posted: '2026-09-07',
    search_position: 3,
    prev_search_position: 6,
    maps_position: 2,
    prev_maps_position: 4,
    views: 1890,
    clicks: 240,
    next_check_date: TODAY,
    url: 'https://avanitigerresorts.com/blogs/best-time-tiger-safari',
    notes: 'Significant increase in safari package inquiry calls.'
  },
  {
    id: 'entry-3',
    client_id: 'client-7',
    title: 'Child Vaccination Schedule & Pediatric Care',
    type: 'seo_blog',
    date_posted: '2026-09-02',
    search_position: 3,
    prev_search_position: 7,
    maps_position: 2,
    prev_maps_position: 5,
    views: 1210,
    clicks: 165,
    next_check_date: TODAY,
    notes: 'Rank #2 in Maps local pack.'
  }
];

export const INITIAL_KEYWORDS: Keyword[] = [
  {
    id: 'kw-1',
    client_id: 'client-5',
    keyword: 'best cbse school near me',
    current_position: 2,
    target_position: 1,
    search_volume: '4.5k/mo',
    history: [
      { id: 'kh-1', keyword_id: 'kw-1', position: 5, recorded_at: '2026-09-01' },
      { id: 'kh-2', keyword_id: 'kw-1', position: 2, recorded_at: TODAY }
    ]
  },
  {
    id: 'kw-2',
    client_id: 'client-6',
    keyword: 'luxury tiger safari resort',
    current_position: 3,
    target_position: 1,
    search_volume: '3.2k/mo',
    history: [
      { id: 'kh-3', keyword_id: 'kw-2', position: 7, recorded_at: '2026-09-01' },
      { id: 'kh-4', keyword_id: 'kw-2', position: 3, recorded_at: TODAY }
    ]
  },
  {
    id: 'kw-3',
    client_id: 'client-7',
    keyword: 'best pediatrician clinic near me',
    current_position: 3,
    target_position: 1,
    search_volume: '2.8k/mo',
    history: [
      { id: 'kh-5', keyword_id: 'kw-3', position: 6, recorded_at: '2026-09-01' },
      { id: 'kh-6', keyword_id: 'kw-3', position: 3, recorded_at: TODAY }
    ]
  }
];

export const INITIAL_GOALS: Goal[] = [
  {
    id: 'goal-1',
    client_id: 'client-5',
    description: 'Achieve Top 3 Google Local Pack Ranking for "Best Schools"',
    target_date: '2026-09-30',
    target_value: 3,
    current_value: 2,
    unit: 'Rank Position',
    status: 'achieved'
  },
  {
    id: 'goal-2',
    client_id: 'client-6',
    description: 'Generate 300 Safari Inquiry Form Submissions',
    target_date: '2026-09-30',
    target_value: 300,
    current_value: 240,
    unit: 'Inquiries',
    status: 'on_track'
  }
];

export const INITIAL_RECURRING_TASKS: RecurringTaskTemplate[] = [];

export const INITIAL_INSTAGRAM_ACCOUNTS: InstagramAccount[] = [];

export const INITIAL_DAILY_TASK_TEMPLATES: DailyTaskTemplate[] = [];

export const INITIAL_CLIENT_ASSIGNMENTS: ClientAssignment[] = [];
