-- Allow admins to update any data in the players table
CREATE POLICY "Admins can update any player data"
ON players
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM players
    WHERE auth.uid() = auth_id
    AND is_admin = TRUE
  )
);

-- Allow admins to delete any data in the players table
CREATE POLICY "Admins can delete any player data"
ON players
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM players
    WHERE auth.uid() = auth_id
    AND is_admin = TRUE
  )
);