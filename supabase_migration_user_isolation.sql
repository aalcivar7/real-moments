-- ============================================================
-- Real Moments — Complete User Isolation + Schema Fix
-- Run this in: Supabase → SQL Editor → New Query → Run
-- Safe to run multiple times (idempotent)
-- ============================================================

-- 1. Fix packages.precio: was numeric but app stores free-text prices
ALTER TABLE packages ALTER COLUMN precio TYPE text USING precio::text;

-- 2. Add user_id to all data tables (idempotent)
ALTER TABLE montajes         ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE packages         ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE inventory_items  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE inventory_movements ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE suppliers        ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- 3. Drop ALL existing policies (old team_access + any previous owner_access)
DROP POLICY IF EXISTS "team_access"  ON montajes;
DROP POLICY IF EXISTS "team_access"  ON packages;
DROP POLICY IF EXISTS "team_access"  ON inventory_items;
DROP POLICY IF EXISTS "team_access"  ON inventory_movements;
DROP POLICY IF EXISTS "team_access"  ON suppliers;
DROP POLICY IF EXISTS "team_access"  ON app_settings;
DROP POLICY IF EXISTS "owner_access" ON montajes;
DROP POLICY IF EXISTS "owner_access" ON packages;
DROP POLICY IF EXISTS "owner_access" ON inventory_items;
DROP POLICY IF EXISTS "owner_access" ON inventory_movements;
DROP POLICY IF EXISTS "owner_access" ON suppliers;

-- 4. Delete rows with no owner (created before user isolation — data already lost anyway)
DELETE FROM inventory_movements WHERE user_id IS NULL;
DELETE FROM montajes             WHERE user_id IS NULL;
DELETE FROM packages             WHERE user_id IS NULL;
DELETE FROM inventory_items      WHERE user_id IS NULL;
DELETE FROM suppliers            WHERE user_id IS NULL;

-- 5. Create owner policies: each user sees ONLY their own data
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

-- 6. app_settings is shared (event types, payment statuses)
CREATE POLICY "team_access" ON app_settings FOR ALL TO authenticated
  USING (true) WITH CHECK (true);
