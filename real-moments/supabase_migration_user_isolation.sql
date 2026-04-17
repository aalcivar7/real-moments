-- Add user_id to all data tables
ALTER TABLE montajes ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE packages ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE inventory_movements ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Drop old open policies
DROP POLICY IF EXISTS "team_access" ON montajes;
DROP POLICY IF EXISTS "team_access" ON packages;
DROP POLICY IF EXISTS "team_access" ON inventory_items;
DROP POLICY IF EXISTS "team_access" ON inventory_movements;
DROP POLICY IF EXISTS "team_access" ON suppliers;
DROP POLICY IF EXISTS "team_access" ON app_settings;

-- New policies: each user sees only their own data
CREATE POLICY "owner_access" ON montajes FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "owner_access" ON packages FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "owner_access" ON inventory_items FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "owner_access" ON inventory_movements FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "owner_access" ON suppliers FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- app_settings is shared (event types, payment statuses) — keep open
CREATE POLICY "team_access" ON app_settings FOR ALL TO authenticated
  USING (true) WITH CHECK (true);
