-- Add `kickoff_time` column to the `fixtures` table
ALTER TABLE fixtures
ADD COLUMN kickoff_time TIME NOT NULL;

-- Add `status` column to the `fixtures` table
ALTER TABLE fixtures
ADD COLUMN status VARCHAR(10) CHECK (status IN ('upcoming', 'live', 'finished')) NOT NULL DEFAULT 'upcoming';