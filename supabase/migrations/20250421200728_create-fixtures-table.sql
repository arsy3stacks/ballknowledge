/*
  # Create fixtures table

  1. New Tables
    - `fixtures`
      - `id` (uuid, primary key)
      - `match_day` (date)
      - `home_team` (text)
      - `away_team` (text)
      - `outcome` (enum: H/D/A/null)
      - `created_at` (timestamp)
  2. Security
    - Enable RLS on `fixtures` table
    - Add policy for all users to read fixtures
    - Add policy for admins to manage fixtures
*/

CREATE TABLE IF NOT EXISTS fixtures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_day date NOT NULL,
  home_team text NOT NULL,
  away_team text NOT NULL,
  outcome text CHECK (outcome IN ('H', 'D', 'A')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE fixtures ENABLE ROW LEVEL SECURITY;

-- Allow all users to read fixtures
CREATE POLICY "All users can read fixtures"
  ON fixtures
  FOR SELECT
  TO authenticated
  USING (true);

-- In a production app, you would add admin-specific policies
-- For this example, we'll allow all authenticated users to manage fixtures
-- In a real app, you would check against an admin role
CREATE POLICY "Admins can insert fixtures"
  ON fixtures
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update fixtures"
  ON fixtures
  FOR UPDATE
  TO authenticated
  USING (true);