-- Seed data: 5 users (via auth.users + profiles), 10 settings, 15 audit log entries
-- Note: In local Supabase, we seed auth.users directly for dev convenience.
-- The trigger auto-creates profiles, then we update roles.

-- Create test users in auth.users
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, aud, role)
VALUES
  ('d0d0d0d0-0001-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000',
   'admin@example.com', crypt('password123', gen_salt('bf')),
   NOW(), '{"full_name":"Sarah Admin"}'::jsonb, NOW() - INTERVAL '90 days', NOW(), 'authenticated', 'authenticated'),
  ('d0d0d0d0-0002-4000-8000-000000000002', '00000000-0000-0000-0000-000000000000',
   'editor@example.com', crypt('password123', gen_salt('bf')),
   NOW(), '{"full_name":"Mike Editor"}'::jsonb, NOW() - INTERVAL '60 days', NOW(), 'authenticated', 'authenticated'),
  ('d0d0d0d0-0003-4000-8000-000000000003', '00000000-0000-0000-0000-000000000000',
   'viewer@example.com', crypt('password123', gen_salt('bf')),
   NOW(), '{"full_name":"Jane Viewer"}'::jsonb, NOW() - INTERVAL '30 days', NOW(), 'authenticated', 'authenticated'),
  ('d0d0d0d0-0004-4000-8000-000000000004', '00000000-0000-0000-0000-000000000000',
   'editor2@example.com', crypt('password123', gen_salt('bf')),
   NOW(), '{"full_name":"Alex Editor"}'::jsonb, NOW() - INTERVAL '45 days', NOW(), 'authenticated', 'authenticated'),
  ('d0d0d0d0-0005-4000-8000-000000000005', '00000000-0000-0000-0000-000000000000',
   'viewer2@example.com', crypt('password123', gen_salt('bf')),
   NOW(), '{"full_name":"Chris Viewer"}'::jsonb, NOW() - INTERVAL '15 days', NOW(), 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- Also insert identities so Supabase auth login works
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES
  ('d0d0d0d0-0001-4000-8000-000000000001', 'd0d0d0d0-0001-4000-8000-000000000001',
   '{"sub":"d0d0d0d0-0001-4000-8000-000000000001","email":"admin@example.com"}'::jsonb,
   'email', 'd0d0d0d0-0001-4000-8000-000000000001', NOW(), NOW() - INTERVAL '90 days', NOW()),
  ('d0d0d0d0-0002-4000-8000-000000000002', 'd0d0d0d0-0002-4000-8000-000000000002',
   '{"sub":"d0d0d0d0-0002-4000-8000-000000000002","email":"editor@example.com"}'::jsonb,
   'email', 'd0d0d0d0-0002-4000-8000-000000000002', NOW(), NOW() - INTERVAL '60 days', NOW()),
  ('d0d0d0d0-0003-4000-8000-000000000003', 'd0d0d0d0-0003-4000-8000-000000000003',
   '{"sub":"d0d0d0d0-0003-4000-8000-000000000003","email":"viewer@example.com"}'::jsonb,
   'email', 'd0d0d0d0-0003-4000-8000-000000000003', NOW(), NOW() - INTERVAL '30 days', NOW()),
  ('d0d0d0d0-0004-4000-8000-000000000004', 'd0d0d0d0-0004-4000-8000-000000000004',
   '{"sub":"d0d0d0d0-0004-4000-8000-000000000004","email":"editor2@example.com"}'::jsonb,
   'email', 'd0d0d0d0-0004-4000-8000-000000000004', NOW(), NOW() - INTERVAL '45 days', NOW()),
  ('d0d0d0d0-0005-4000-8000-000000000005', 'd0d0d0d0-0005-4000-8000-000000000005',
   '{"sub":"d0d0d0d0-0005-4000-8000-000000000005","email":"viewer2@example.com"}'::jsonb,
   'email', 'd0d0d0d0-0005-4000-8000-000000000005', NOW(), NOW() - INTERVAL '15 days', NOW())
ON CONFLICT DO NOTHING;

-- Update profiles with roles (trigger creates them with default 'viewer')
UPDATE profiles SET role = 'admin',  last_login = NOW() - INTERVAL '1 hour'  WHERE id = 'd0d0d0d0-0001-4000-8000-000000000001';
UPDATE profiles SET role = 'editor', last_login = NOW() - INTERVAL '3 hours' WHERE id = 'd0d0d0d0-0002-4000-8000-000000000002';
UPDATE profiles SET role = 'viewer', last_login = NOW() - INTERVAL '1 day'   WHERE id = 'd0d0d0d0-0003-4000-8000-000000000003';
UPDATE profiles SET role = 'editor', last_login = NOW() - INTERVAL '5 hours' WHERE id = 'd0d0d0d0-0004-4000-8000-000000000004';
UPDATE profiles SET role = 'viewer', last_login = NOW() - INTERVAL '2 days'  WHERE id = 'd0d0d0d0-0005-4000-8000-000000000005';

-- Settings entries (10)
INSERT INTO settings (key, value, updated_by, updated_at) VALUES
  ('site.name', '"Admin Panel"'::jsonb, 'd0d0d0d0-0001-4000-8000-000000000001', NOW() - INTERVAL '30 days'),
  ('site.description', '"Back-office administration dashboard"'::jsonb, 'd0d0d0d0-0001-4000-8000-000000000001', NOW() - INTERVAL '30 days'),
  ('site.maintenance_mode', 'false'::jsonb, 'd0d0d0d0-0001-4000-8000-000000000001', NOW() - INTERVAL '7 days'),
  ('auth.session_timeout_minutes', '60'::jsonb, 'd0d0d0d0-0001-4000-8000-000000000001', NOW() - INTERVAL '14 days'),
  ('auth.max_login_attempts', '5'::jsonb, 'd0d0d0d0-0001-4000-8000-000000000001', NOW() - INTERVAL '14 days'),
  ('email.smtp_host', '"smtp.example.com"'::jsonb, 'd0d0d0d0-0001-4000-8000-000000000001', NOW() - INTERVAL '20 days'),
  ('email.from_address', '"noreply@example.com"'::jsonb, 'd0d0d0d0-0001-4000-8000-000000000001', NOW() - INTERVAL '20 days'),
  ('ui.items_per_page', '25'::jsonb, 'd0d0d0d0-0002-4000-8000-000000000002', NOW() - INTERVAL '5 days'),
  ('ui.theme', '"light"'::jsonb, 'd0d0d0d0-0001-4000-8000-000000000001', NOW() - INTERVAL '2 days'),
  ('notifications.enabled', 'true'::jsonb, 'd0d0d0d0-0001-4000-8000-000000000001', NOW() - INTERVAL '10 days')
ON CONFLICT (key) DO NOTHING;

-- Audit log entries (15)
INSERT INTO audit_log (user_id, action, resource_type, resource_id, details, ip_address, created_at) VALUES
  ('d0d0d0d0-0001-4000-8000-000000000001', 'user.login', 'user', 'd0d0d0d0-0001-4000-8000-000000000001', '{"method":"password"}'::jsonb, '192.168.1.10', NOW() - INTERVAL '1 hour'),
  ('d0d0d0d0-0001-4000-8000-000000000001', 'user.role_change', 'user', 'd0d0d0d0-0002-4000-8000-000000000002', '{"old_role":"viewer","new_role":"editor"}'::jsonb, '192.168.1.10', NOW() - INTERVAL '2 hours'),
  ('d0d0d0d0-0002-4000-8000-000000000002', 'user.login', 'user', 'd0d0d0d0-0002-4000-8000-000000000002', '{"method":"password"}'::jsonb, '192.168.1.20', NOW() - INTERVAL '3 hours'),
  ('d0d0d0d0-0001-4000-8000-000000000001', 'settings.update', 'setting', 'ui.theme', '{"old_value":"dark","new_value":"light"}'::jsonb, '192.168.1.10', NOW() - INTERVAL '4 hours'),
  ('d0d0d0d0-0001-4000-8000-000000000001', 'settings.update', 'setting', 'site.maintenance_mode', '{"old_value":true,"new_value":false}'::jsonb, '192.168.1.10', NOW() - INTERVAL '1 day'),
  ('d0d0d0d0-0003-4000-8000-000000000003', 'user.login', 'user', 'd0d0d0d0-0003-4000-8000-000000000003', '{"method":"password"}'::jsonb, '192.168.1.30', NOW() - INTERVAL '1 day'),
  ('d0d0d0d0-0001-4000-8000-000000000001', 'user.create', 'user', 'd0d0d0d0-0005-4000-8000-000000000005', '{"email":"viewer2@example.com","role":"viewer"}'::jsonb, '192.168.1.10', NOW() - INTERVAL '2 days'),
  ('d0d0d0d0-0004-4000-8000-000000000004', 'user.login', 'user', 'd0d0d0d0-0004-4000-8000-000000000004', '{"method":"password"}'::jsonb, '192.168.1.40', NOW() - INTERVAL '2 days'),
  ('d0d0d0d0-0001-4000-8000-000000000001', 'settings.create', 'setting', 'notifications.enabled', '{"value":true}'::jsonb, '192.168.1.10', NOW() - INTERVAL '3 days'),
  ('d0d0d0d0-0002-4000-8000-000000000002', 'settings.update', 'setting', 'ui.items_per_page', '{"old_value":20,"new_value":25}'::jsonb, '192.168.1.20', NOW() - INTERVAL '3 days'),
  ('d0d0d0d0-0001-4000-8000-000000000001', 'user.login', 'user', 'd0d0d0d0-0001-4000-8000-000000000001', '{"method":"password"}'::jsonb, '192.168.1.10', NOW() - INTERVAL '4 days'),
  ('d0d0d0d0-0001-4000-8000-000000000001', 'user.role_change', 'user', 'd0d0d0d0-0004-4000-8000-000000000004', '{"old_role":"viewer","new_role":"editor"}'::jsonb, '192.168.1.10', NOW() - INTERVAL '5 days'),
  ('d0d0d0d0-0005-4000-8000-000000000005', 'user.login', 'user', 'd0d0d0d0-0005-4000-8000-000000000005', '{"method":"password"}'::jsonb, '192.168.1.50', NOW() - INTERVAL '5 days'),
  ('d0d0d0d0-0001-4000-8000-000000000001', 'settings.update', 'setting', 'auth.session_timeout_minutes', '{"old_value":30,"new_value":60}'::jsonb, '192.168.1.10', NOW() - INTERVAL '6 days'),
  ('d0d0d0d0-0001-4000-8000-000000000001', 'system.backup', 'system', NULL, '{"type":"full","duration_ms":4500}'::jsonb, '192.168.1.10', NOW() - INTERVAL '7 days')
ON CONFLICT DO NOTHING;
