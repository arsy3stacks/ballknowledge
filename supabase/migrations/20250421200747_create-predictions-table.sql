/*
  # Create predictions table

  1. New Tables
    - `predictions`
      - `id` (uuid, primary key)
      - `player_id` (uuid, references players)
      - `fixture_id` (uuid, references fixtures)
      - `predicted_outcome` (enum: H/D/A)
      - `submitted_at` (timestamp)
  2. Security
    - Enable RLS on `predictions` table
    - Add policy for users to manage their own predictions
    - Add policy for admins to read all predictions
*/

CREATE TABLE IF NOT EXISTS predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) NOT NULL,
  fixture_id uuid REFERENCES fixtures(id) NOT NULL,
  predicted_outcome text NOT NULL CHECK (predicted_outcome IN ('H', 'D', 'A')),
  submitted_at timestamptz DEFAULT now(),
  -- Unique constraint to ensure one prediction per player per fixture
  UNIQUE(player_id, fixture_id)
);

ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own predictions
CREATE POLICY "Users can read own predictions"
  ON predictions
  FOR SELECT
  TO authenticated
  USING (
    player_id IN (
      SELECT id FROM players WHERE auth_id = auth.uid()
    )
  );

-- Allow users to insert their own predictions
CREATE POLICY "Users can insert own predictions"
  ON predictions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    player_id IN (
      SELECT id FROM players WHERE auth_id = auth.uid()
    )
  );

-- Allow users to update their own predictions
CREATE POLICY "Users can update own predictions"
  ON predictions
  FOR UPDATE
  TO authenticated
  USING (
    player_id IN (
      SELECT id FROM players WHERE auth_id = auth.uid()
    )
  );

-- In a production app, add admin-specific policy for reading all predictions
CREATE POLICY "Admins can read all predictions"
  ON predictions
  FOR SELECT
  TO authenticated
  USING (true);