-- Update RLS policies for the fixtures table
DROP POLICY IF EXISTS "Admins can manage fixtures" ON fixtures;

CREATE POLICY "Admins can manage fixtures"
ON fixtures
FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM players WHERE auth.uid() = auth_id AND is_admin = TRUE
));

-- Update RLS policies for the predictions table
DROP POLICY IF EXISTS "Admins can view all predictions" ON predictions;

CREATE POLICY "Admins can view all predictions"
ON predictions
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM players WHERE auth.uid() = auth_id AND is_admin = TRUE
));

-- Update RLS policies for the points table
DROP POLICY IF EXISTS "Admins can manage points" ON points;

CREATE POLICY "Admins can manage points"
ON points
FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM players WHERE auth.uid() = auth_id AND is_admin = TRUE
));