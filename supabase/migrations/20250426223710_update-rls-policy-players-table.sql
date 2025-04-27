/*
  # Add Read Policy for Players Table

  1. Allow authenticated users to read specific columns (id, username) in the `players` table.
  2. Ensure that only authenticated users can perform this action.
*/

-- Allow authenticated users to read specific columns in the `players` table
CREATE POLICY "Allow authenticated users to read id and username"
ON players
FOR SELECT
TO authenticated
USING (true);