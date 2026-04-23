-- Initial schema for admin panel
-- Tables: profiles, settings, audit_log

-- Profiles (extends auth.users with role-based access)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'viewer'
    CHECK (role IN ('admin', 'editor', 'viewer')),
  avatar_url TEXT,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Application settings (key-value store)
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit log (immutable record of all admin actions)
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource ON audit_log(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at DESC);

-- RLS Policies

-- Profiles: admins can see all, others can only see themselves
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_own ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY profiles_select_admin ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles AS p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    -- Non-admins cannot change their own role
    auth.uid() = id AND (
      role = (SELECT p.role FROM profiles AS p WHERE p.id = auth.uid())
      OR EXISTS (SELECT 1 FROM profiles AS p WHERE p.id = auth.uid() AND p.role = 'admin')
    )
  );

CREATE POLICY profiles_update_admin ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles AS p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY profiles_insert ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Settings: admins and editors can read, only admins can write
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY settings_select ON settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles AS p WHERE p.id = auth.uid() AND p.role IN ('admin', 'editor')
    )
  );

CREATE POLICY settings_insert ON settings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles AS p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY settings_update ON settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles AS p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY settings_delete ON settings
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles AS p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Audit log: admins can read everything, editors can read their own, viewers none
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_log_select_admin ON audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles AS p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY audit_log_select_own ON audit_log
  FOR SELECT USING (
    auth.uid() = user_id AND EXISTS (
      SELECT 1 FROM profiles AS p WHERE p.id = auth.uid() AND p.role = 'editor'
    )
  );

-- Audit log insert: all authenticated users can create entries (via service)
CREATE POLICY audit_log_insert ON audit_log
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to log audit events (callable via RPC)
CREATE OR REPLACE FUNCTION log_audit_event(
  p_action TEXT,
  p_resource_type TEXT DEFAULT NULL,
  p_resource_id TEXT DEFAULT NULL,
  p_details JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO audit_log (user_id, action, resource_type, resource_id, details)
  VALUES (auth.uid(), p_action, p_resource_type, p_resource_id, p_details)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
