-- SQL Schema & RLS Policies for AgencyOps Multi-Client Agency Work Management Dashboard
-- Designed for shared agency access across all authenticated team members

-- 1. Clients Table
CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  business_type TEXT NOT NULL DEFAULT 'Other',
  avatar_color TEXT NOT NULL DEFAULT '#0d9488',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_rule TEXT,
  tags TEXT[] DEFAULT '{}',
  work_type TEXT NOT NULL DEFAULT 'General',
  reminder_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Work Logs Table
CREATE TABLE IF NOT EXISTS work_logs (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  task_id TEXT,
  note TEXT NOT NULL,
  auto_generated BOOLEAN DEFAULT FALSE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. GMB & SEO Entries Table
CREATE TABLE IF NOT EXISTS gmb_seo_entries (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL, -- 'gmb_post' or 'seo_blog'
  date_posted DATE NOT NULL,
  search_position INT NOT NULL DEFAULT 1,
  prev_search_position INT,
  maps_position INT,
  prev_maps_position INT,
  views INT DEFAULT 0,
  clicks INT DEFAULT 0,
  next_check_date DATE NOT NULL,
  url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Keywords Table
CREATE TABLE IF NOT EXISTS keywords (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  keyword TEXT NOT NULL,
  current_position INT NOT NULL DEFAULT 1,
  target_position INT NOT NULL DEFAULT 1,
  search_volume TEXT DEFAULT '1,000/mo',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Keyword History Table
CREATE TABLE IF NOT EXISTS keyword_history (
  id TEXT PRIMARY KEY,
  keyword_id TEXT NOT NULL,
  position INT NOT NULL,
  recorded_at DATE NOT NULL DEFAULT CURRENT_DATE
);

-- 7. Goals Table
CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  description TEXT NOT NULL,
  target_date DATE NOT NULL,
  target_value INT NOT NULL,
  current_value INT NOT NULL DEFAULT 0,
  unit TEXT DEFAULT 'Units',
  status TEXT NOT NULL DEFAULT 'on_track',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Instagram Connections Table (Shared across all agency team members)
CREATE TABLE IF NOT EXISTS instagram_connections (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  client_id TEXT NOT NULL UNIQUE,
  ig_business_account_id TEXT NOT NULL,
  is_connected BOOLEAN DEFAULT TRUE,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  access_token_masked TEXT DEFAULT '••••••••',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_tasks_client_date ON tasks(client_id, date);
CREATE INDEX IF NOT EXISTS idx_gmb_seo_next_check ON gmb_seo_entries(next_check_date);
CREATE INDEX IF NOT EXISTS idx_keywords_client ON keywords(client_id);
CREATE INDEX IF NOT EXISTS idx_ig_conn_client ON instagram_connections(client_id);

-- ROW LEVEL SECURITY (RLS) POLICIES FOR SHARED AGENCY WORKSPACE ACCESS
-- Allows any authenticated team member / anon key full read & write access across all clients
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE gmb_seo_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow shared agency access on clients" ON clients;
CREATE POLICY "Allow shared agency access on clients" ON clients FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow shared agency access on tasks" ON tasks;
CREATE POLICY "Allow shared agency access on tasks" ON tasks FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow shared agency access on work_logs" ON work_logs;
CREATE POLICY "Allow shared agency access on work_logs" ON work_logs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow shared agency access on gmb_seo_entries" ON gmb_seo_entries;
CREATE POLICY "Allow shared agency access on gmb_seo_entries" ON gmb_seo_entries FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow shared agency access on keywords" ON keywords;
CREATE POLICY "Allow shared agency access on keywords" ON keywords FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow shared agency access on goals" ON goals;
CREATE POLICY "Allow shared agency access on goals" ON goals FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow shared agency access on instagram_connections" ON instagram_connections;
CREATE POLICY "Allow shared agency access on instagram_connections" ON instagram_connections FOR ALL USING (true) WITH CHECK (true);
