ALTER TABLE predictions DROP CONSTRAINT predictions_fixture_id_fkey;

ALTER TABLE predictions
ADD CONSTRAINT predictions_fixture_id_fkey
FOREIGN KEY (fixture_id)
REFERENCES fixtures (id)
ON DELETE CASCADE;