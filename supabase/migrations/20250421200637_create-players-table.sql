/*
  # Create players table

  1. New Tables
    - `players`
      - `id` (uuid, primary key)
      - `auth_id` (uuid, references auth.users)
      - `username` (text, unique)
      - `club_supported` (text)
      - `nationality` (text)
      - `joined_at` (timestamp)
  2. Security
    - Enable RLS on `players` table
    - Add policy for users to read and update their own data
*/

CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id uuid REFERENCES auth.users(id),
  username text UNIQUE NOT NULL,
  club_supported text NOT NULL,
  nationality text NOT NULL,
  joined_at timestamptz DEFAULT now()
);

ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own data
CREATE POLICY "Users can read own data"
  ON players
  FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_id);

-- Allow users to update their own data
CREATE POLICY "Users can update own data"
  ON players
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_id);

-- Allow new user to insert their data once
CREATE POLICY "Users can insert their own data"
  ON players
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = auth_id);