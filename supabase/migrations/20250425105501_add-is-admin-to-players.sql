ALTER TABLE players
ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- Ensure only one admin can promote others to admin
CREATE POLICY "Admins can update is_admin"
ON players
FOR UPDATE
TO authenticated
USING (auth.uid() = auth_id AND is_admin = TRUE)
WITH CHECK (is_admin = TRUE);