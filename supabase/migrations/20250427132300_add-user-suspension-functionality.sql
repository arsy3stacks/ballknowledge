/*
  # Add user suspension functionality

  1. Changes
    - Add `is_suspended` column to players table
    - Update RLS policies to prevent suspended users from making predictions
*/

-- Add is_suspended column with default value of false
ALTER TABLE players
ADD COLUMN is_suspended BOOLEAN DEFAULT FALSE;

-- Update RLS policies to prevent suspended users from making predictions
CREATE POLICY "Suspended users cannot make predictions"
ON predictions
FOR INSERT
TO authenticated
WITH CHECK (
  NOT EXISTS (
    SELECT 1 FROM players
    WHERE auth_id = auth.uid()
    AND is_suspended = true
  )
);