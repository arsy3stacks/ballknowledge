-- Allow unauthenticated users to insert rows into the "players" table
CREATE POLICY "Allow insert during signup"
ON players
FOR INSERT
WITH CHECK (true); -- allow all inserted values by anyone
