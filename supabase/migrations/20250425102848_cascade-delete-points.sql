ALTER TABLE points DROP CONSTRAINT points_fixture_id_fkey;

ALTER TABLE points
ADD CONSTRAINT points_fixture_id_fkey
FOREIGN KEY (fixture_id)
REFERENCES fixtures (id)
ON DELETE CASCADE;