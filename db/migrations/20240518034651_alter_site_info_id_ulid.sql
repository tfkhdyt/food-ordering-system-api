-- migrate:up
TRUNCATE site_informations CASCADE;

ALTER TABLE site_informations DROP COLUMN id;
ALTER TABLE site_informations ADD COLUMN id BYTEA PRIMARY KEY;

-- migrate:down
ALTER TABLE site_informations DROP COLUMN id;
ALTER TABLE site_informations ADD COLUMN id SERIAL PRIMARY KEY;
