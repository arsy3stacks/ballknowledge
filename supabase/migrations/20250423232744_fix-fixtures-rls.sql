-- Add a policy for allowing users to delete fixtures
-- In a production app, add admin-specific policy for managing points
CREATE POLICY "Users can delete fixtures"
ON fixtures
FOR DELETE
TO authenticated
USING (true);
