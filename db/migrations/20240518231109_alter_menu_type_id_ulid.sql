-- migrate:up
TRUNCATE menu_types CASCADE;

ALTER TABLE menu_types DROP COLUMN id;
ALTER TABLE menu_types ADD COLUMN id BYTEA PRIMARY KEY;

-- migrate:down
ALTER TABLE menu_types DROP COLUMN id;
ALTER TABLE menu_types ADD COLUMN id SERIAL PRIMARY KEY;
