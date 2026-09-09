-- Migration: Update collaboration_requests table schema
-- Applied: 2026-09-05

BEGIN;

-- 1. Rename user_id to requester_id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'collaboration_requests' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE collaboration_requests RENAME COLUMN user_id TO requester_id;
  END IF;
END $$;

-- 2. Rename role_wanted to preferred_role
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'collaboration_requests' AND column_name = 'role_wanted'
  ) THEN
    ALTER TABLE collaboration_requests RENAME COLUMN role_wanted TO preferred_role;
  END IF;
END $$;

-- 3. Ensure preferred_role is TEXT
ALTER TABLE collaboration_requests ALTER COLUMN preferred_role TYPE TEXT;

-- 4. Add skills array column
ALTER TABLE collaboration_requests ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}';

-- 5. Add optional portfolio_url column
ALTER TABLE collaboration_requests ADD COLUMN IF NOT EXISTS portfolio_url TEXT;

-- 6. Enforce required message
ALTER TABLE collaboration_requests ALTER COLUMN message SET NOT NULL;

-- 7. Set default status and timestamp
ALTER TABLE collaboration_requests ALTER COLUMN status SET DEFAULT 'pending';
ALTER TABLE collaboration_requests ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;

COMMIT;
