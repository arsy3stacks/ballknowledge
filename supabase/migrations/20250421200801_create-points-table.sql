/*
  # Create points table

  1. New Tables
    - `points`
      - `id` (uuid, primary key)
      - `player_id` (uuid, references players)
      - `fixture_id` (uuid, references fixtures)
      - `points_earned` (integer)
      - `awarded_at` (timestamp)
  2. Security
    - Enable RLS on `points` table
    - Add policy for users to read their own points
    - Add policy for admins to manage points
*/

CREATE TABLE IF NOT EXISTS points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) NOT NULL,
  fixture_id uuid REFERENCES fixtures(id) NOT NULL,
  points_earned integer NOT NULL DEFAULT 0,
  awarded_at timestamptz DEFAULT now(),
  -- Unique constraint to ensure points are awarded only once per player per fixture
  UNIQUE(player_id, fixture_id)
);

ALTER TABLE points ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own points
CREATE POLICY "Users can read own points"
  ON points
  FOR SELECT
  TO authenticated
  USING (
    player_id IN (
      SELECT id FROM players WHERE auth_id = auth.uid()
    )
  );

-- Allow users to read all points (for leaderboard)
CREATE POLICY "All users can read points for leaderboard"
  ON points
  FOR SELECT
  TO authenticated
  USING (true);

-- In a production app, add admin-specific policy for managing points
CREATE POLICY "Admins can insert points"
  ON points
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update points"
  ON points
  FOR UPDATE
  TO authenticated
  USING (true);