-- ============================================================================
-- Security Hardening Migration
-- Fixes RLS vulnerabilities, adds input validation constraints, and hardens
-- the database schema for production deployment.
-- ============================================================================

-- ──────────────────────────────────────────────────────────────────────────────
-- FIX 1: sync_queue — Replace overly broad FOR ALL policy
--
-- The original "FOR ALL ... USING(auth.uid() = user_id)" has no WITH CHECK
-- clause, which means INSERT operations are not validated. Split into
-- explicit per-operation policies with proper ownership enforcement.
-- ──────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can manage own sync queue" ON sync_queue;

CREATE POLICY "Users can view own sync queue"
  ON sync_queue FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sync queue"
  ON sync_queue FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sync queue"
  ON sync_queue FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sync queue"
  ON sync_queue FOR DELETE
  USING (auth.uid() = user_id);


-- ──────────────────────────────────────────────────────────────────────────────
-- FIX 2: activities — Add WITH CHECK to UPDATE policy
--
-- Without WITH CHECK, a user who owns a row can change user_id to another
-- user's ID, effectively transferring ownership. The WITH CHECK clause
-- ensures the updated row still belongs to the authenticated user.
-- ──────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can update own activities" ON activities;

CREATE POLICY "Users can update own activities"
  ON activities FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ──────────────────────────────────────────────────────────────────────────────
-- FIX 3: goals — Add WITH CHECK to UPDATE policy (same as activities)
-- ──────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can update own goals" ON goals;

CREATE POLICY "Users can update own goals"
  ON goals FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ──────────────────────────────────────────────────────────────────────────────
-- FIX 3.5: user_profiles — Add WITH CHECK to UPDATE policy
--
-- Same ownership-transfer vulnerability as activities and goals.
-- ──────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);


-- ──────────────────────────────────────────────────────────────────────────────
-- FIX 4: Storage — Add WITH CHECK to profile picture UPDATE policy
--
-- Without WITH CHECK, a user could rename their file path to target another
-- user's folder, overwriting their profile picture.
-- ──────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can update own profile picture" ON storage.objects;

CREATE POLICY "Users can update own profile picture"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'profile-pictures'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'profile-pictures'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );


-- ──────────────────────────────────────────────────────────────────────────────
-- FIX 5: Input validation constraints
--
-- Enforce valid enum values at the database level so a compromised client
-- cannot insert arbitrary text into type/status/period columns.
-- ──────────────────────────────────────────────────────────────────────────────

-- activities.type must be a known value
ALTER TABLE activities
  DROP CONSTRAINT IF EXISTS chk_activities_type;
ALTER TABLE activities
  ADD CONSTRAINT chk_activities_type
  CHECK (type IN ('activity', 'walk', 'run', 'hike', 'cycle'));

-- activities.status must be a known value
ALTER TABLE activities
  DROP CONSTRAINT IF EXISTS chk_activities_status;
ALTER TABLE activities
  ADD CONSTRAINT chk_activities_status
  CHECK (status IN ('active', 'paused', 'completed', 'discarded'));

-- goals.type must be a known value
ALTER TABLE goals
  DROP CONSTRAINT IF EXISTS chk_goals_type;
ALTER TABLE goals
  ADD CONSTRAINT chk_goals_type
  CHECK (type IN ('distance', 'frequency', 'duration'));

-- goals.period must be a known value
ALTER TABLE goals
  DROP CONSTRAINT IF EXISTS chk_goals_period;
ALTER TABLE goals
  ADD CONSTRAINT chk_goals_period
  CHECK (period IN ('weekly', 'monthly'));

-- sync_queue.operation_type must be a known value
ALTER TABLE sync_queue
  DROP CONSTRAINT IF EXISTS chk_sync_queue_operation;
ALTER TABLE sync_queue
  ADD CONSTRAINT chk_sync_queue_operation
  CHECK (operation_type IN ('create', 'update', 'delete'));

-- sync_queue.entity_type must be a known value
ALTER TABLE sync_queue
  DROP CONSTRAINT IF EXISTS chk_sync_queue_entity;
ALTER TABLE sync_queue
  ADD CONSTRAINT chk_sync_queue_entity
  CHECK (entity_type IN ('activity', 'profile', 'goal'));


-- ──────────────────────────────────────────────────────────────────────────────
-- FIX 6: Numeric range constraints
--
-- Prevent negative or unreasonable values from being stored.
-- ──────────────────────────────────────────────────────────────────────────────

ALTER TABLE activities
  DROP CONSTRAINT IF EXISTS chk_activities_duration_positive;
ALTER TABLE activities
  ADD CONSTRAINT chk_activities_duration_positive
  CHECK (duration >= 0);

ALTER TABLE activities
  DROP CONSTRAINT IF EXISTS chk_activities_distance_positive;
ALTER TABLE activities
  ADD CONSTRAINT chk_activities_distance_positive
  CHECK (distance >= 0);

ALTER TABLE activities
  DROP CONSTRAINT IF EXISTS chk_activities_steps_positive;
ALTER TABLE activities
  ADD CONSTRAINT chk_activities_steps_positive
  CHECK (steps >= 0);

ALTER TABLE activities
  DROP CONSTRAINT IF EXISTS chk_activities_calories_positive;
ALTER TABLE activities
  ADD CONSTRAINT chk_activities_calories_positive
  CHECK (calories >= 0);

ALTER TABLE goals
  DROP CONSTRAINT IF EXISTS chk_goals_target_positive;
ALTER TABLE goals
  ADD CONSTRAINT chk_goals_target_positive
  CHECK (target > 0);

ALTER TABLE goals
  DROP CONSTRAINT IF EXISTS chk_goals_progress_range;
ALTER TABLE goals
  ADD CONSTRAINT chk_goals_progress_range
  CHECK (progress >= 0);

ALTER TABLE user_profiles
  DROP CONSTRAINT IF EXISTS chk_profiles_weight_range;
ALTER TABLE user_profiles
  ADD CONSTRAINT chk_profiles_weight_range
  CHECK (weight IS NULL OR (weight > 0 AND weight < 700));

ALTER TABLE user_profiles
  DROP CONSTRAINT IF EXISTS chk_profiles_height_range;
ALTER TABLE user_profiles
  ADD CONSTRAINT chk_profiles_height_range
  CHECK (height IS NULL OR (height > 0 AND height < 300));

ALTER TABLE user_profiles
  DROP CONSTRAINT IF EXISTS chk_profiles_name_length;
ALTER TABLE user_profiles
  ADD CONSTRAINT chk_profiles_name_length
  CHECK (char_length(name) >= 1 AND char_length(name) <= 100);


-- ──────────────────────────────────────────────────────────────────────────────
-- FIX 7: Limit route JSONB size
--
-- Prevent storage abuse via massive route arrays. 50,000 GPS points is
-- ~24 hours of continuous tracking at 1-second intervals — more than enough.
-- Uses a trigger instead of a CHECK constraint because jsonb_array_length
-- is not immutable.
-- ──────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION check_route_size()
RETURNS TRIGGER AS $$
BEGIN
  IF jsonb_typeof(NEW.route) != 'array' THEN
    RAISE EXCEPTION 'Route must be a JSON array';
  END IF;
  
  IF jsonb_array_length(NEW.route) > 50000 THEN
    RAISE EXCEPTION 'Route array exceeds maximum of 50,000 points (got %)', jsonb_array_length(NEW.route);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_route_size ON activities;
CREATE TRIGGER trg_check_route_size
  BEFORE INSERT OR UPDATE ON activities
  FOR EACH ROW
  EXECUTE FUNCTION check_route_size();


-- ──────────────────────────────────────────────────────────────────────────────
-- FIX 8: Limit sync_queue rows per user
--
-- Prevent queue flooding attacks. Each user can have at most 1000 queued
-- operations. A trigger enforces this on INSERT.
-- ──────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION check_sync_queue_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM sync_queue WHERE user_id = NEW.user_id) >= 1000 THEN
    RAISE EXCEPTION 'Sync queue limit exceeded (max 1000 per user)';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_sync_queue_limit ON sync_queue;
CREATE TRIGGER trg_check_sync_queue_limit
  BEFORE INSERT ON sync_queue
  FOR EACH ROW
  EXECUTE FUNCTION check_sync_queue_limit();


-- ──────────────────────────────────────────────────────────────────────────────
-- FIX 9: updated_at auto-update trigger
--
-- Automatically set updated_at on row modifications to prevent clients
-- from lying about timestamps.
-- ──────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_activities_updated_at ON activities;
CREATE TRIGGER trg_activities_updated_at
  BEFORE UPDATE ON activities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON user_profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
