export type BusinessType = 'Clinic' | 'Shop' | 'Local Business' | 'Restaurant' | 'E-commerce' | 'Service Provider' | 'Real Estate' | 'Other';

export type UserRole = 'admin' | 'employee';

export interface AppUser {
  username: string;
  email: string;
  role: UserRole;
}

export interface ClientAssignment {
  id: string;
  employee_username: string;
  client_id: string;
  assigned_at?: string;
}

export interface Client {
  id: string;
  name: string;
  phone_number: string;
  subash_phone_number?: string; // Subash Sir's WhatsApp number
  business_type: BusinessType | string;
  avatar_color: string; // e.g. '#0d9488', '#7c3aed', '#f59e0b', '#f43f5e'
  instagram_handle?: string;
  contact_notes?: string;
  created_by?: string;
  created_at: string;
}

export type TaskStatus = 'pending' | 'done';
export type WorkType = 'GMB Post' | 'SEO Blog' | 'Social Media' | 'Design' | 'Ad Campaign' | 'Review Response' | 'Website Update' | 'General';

export type RecurrenceRule = 'daily' | 'weekly' | 'monthly' | 'custom';

export interface Task {
  id: string;
  client_id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "10:30 AM"
  status: TaskStatus;
  is_recurring: boolean;
  recurrence_rule?: RecurrenceRule;
  recurrence_days?: string[]; // e.g. ["mon", "wed", "fri"]
  tags: string[];
  work_type: WorkType;
  reminder_enabled?: boolean;
  template_id?: string;
  assigned_employee?: string;
}

export interface WorkLog {
  id: string;
  client_id: string;
  task_id?: string;
  note: string;
  auto_generated: boolean;
  created_at: string; // ISO string or format
  date: string; // YYYY-MM-DD
}

export type GmbSeoType = 'gmb_post' | 'seo_blog';

export interface GmbSeoEntry {
  id: string;
  client_id: string;
  title: string;
  type: GmbSeoType;
  date_posted: string; // YYYY-MM-DD
  search_position: number;
  prev_search_position?: number;
  maps_position?: number;
  prev_maps_position?: number;
  views: number;
  clicks: number;
  next_check_date: string; // YYYY-MM-DD (auto 7 days later)
  url?: string;
  notes?: string;
}

export interface KeywordHistory {
  id: string;
  keyword_id: string;
  position: number;
  recorded_at: string; // YYYY-MM-DD
}

export interface Keyword {
  id: string;
  client_id: string;
  keyword: string;
  current_position: number;
  target_position: number;
  search_volume?: string;
  history: KeywordHistory[];
}

export type GoalStatus = 'on_track' | 'behind' | 'achieved';

export interface Goal {
  id: string;
  client_id: string;
  description: string;
  target_date: string; // YYYY-MM-DD
  target_value: number;
  current_value: number;
  unit?: string; // e.g. "Posts", "Calls", "Rank #1", "Reviews"
  status: GoalStatus;
}

export interface RecurringTaskTemplate {
  id: string;
  client_id: string;
  title: string;
  recurrence: RecurrenceRule;
  recurrence_days?: string[];
  work_type: WorkType;
  tags: string[];
  time: string;
  active: boolean;
}

export interface DailyTaskTemplate {
  id: string;
  title: string;
  assigned_employee: string; // Employee name (e.g. "Subash", "Anjaneyulu", "Priya", "Rahul")
  client_id: string; // Specific client.id or 'all' / 'general'
  time?: string; // e.g. "09:30 AM"
  work_type: WorkType;
  recurrence: RecurrenceRule;
  recurrence_days?: string[];
  active: boolean;
  created_at: string;
}

export type BlogStatus = 'draft' | 'published';

export interface BlogImage {
  name: string;
  url: string;
}

export interface BlogPost {
  id: string;
  client_id: string;
  primary_keyword: string;
  secondary_keywords: string[];
  content: string;
  images: BlogImage[];
  status: BlogStatus;
  live_url?: string;
  published_date?: string;
  created_at: string;
}

export interface TagFilter {
  selectedTag?: string;
  selectedStatus?: TaskStatus | 'all';
  selectedWorkType?: WorkType | 'all';
  searchQuery?: string;
}

export interface InstagramPost {
  id: string;
  caption: string;
  image_url: string;
  likes_count: number;
  comments_count: number;
  posted_at: string;
  engagement_rate: string;
}

export interface InstagramConnection {
  client_id: string;
  ig_business_account_id: string;
  is_connected: boolean;
  connected_at?: string;
  access_token_masked?: string;
  access_token?: string;
}

export interface InstagramAccount {
  id: string;
  client_id: string;
  username: string;
  connected: boolean;
  profile_picture?: string;
  followers_count: number;
  follower_change: string; // e.g. "+3.4%"
  reach: number;
  impressions: number;
  engagement_rate: string;
  posts_this_month: number;
  follower_history: { date: string; followers: number }[];
  top_post?: InstagramPost;
}

export type TabType = 
  | 'overview'
  | 'today'
  | 'content_vault'
  | 'upcoming'
  | 'calendar'
  | 'weekly_report'
  | 'monthly_report'
  | 'work_log'
  | 'employee'
  | 'gmb_seo'
  | 'instagram'
  | 'keywords'
  | 'filters'
  | 'recurring'
  | 'goals';
