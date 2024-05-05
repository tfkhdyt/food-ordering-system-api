-- migrate:up
CREATE TABLE menu_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT
);

-- migrate:down
DROP TABLE menu_types;
