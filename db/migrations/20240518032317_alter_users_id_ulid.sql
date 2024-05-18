-- migrate:up
TRUNCATE users CASCADE;

ALTER TABLE site_informations DROP COLUMN user_id;
ALTER TABLE site_informations ADD COLUMN user_id BYTEA NOT NULL;

ALTER TABLE users DROP COLUMN id;
ALTER TABLE users ADD COLUMN id BYTEA PRIMARY KEY;

-- migrate:down
ALTER TABLE site_informations DROP COLUMN user_id;
ALTER TABLE site_informations ADD COLUMN user_id INTEGER NOT NULL;

ALTER TABLE users DROP COLUMN id;
ALTER TABLE users ADD COLUMN id SERIAL PRIMARY KEY;
