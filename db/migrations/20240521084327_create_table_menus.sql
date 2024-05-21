-- migrate:up
CREATE TYPE menu_status AS ENUM ('available', 'out_of_stock');

CREATE TABLE menus (
  id BYTEA PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  price REAL NOT NULL,
  type_id BYTEA NOT NULL,
  image VARCHAR(100),
  ingredients TEXT,
  status menu_status NOT NULL DEFAULT 'available'::menu_status,
  CONSTRAINT fk_menu_type_id FOREIGN KEY(type_id) REFERENCES menu_types(id)
    ON DELETE CASCADE
);

-- migrate:down
DROP TABLE menus;
DROP TYPE menu_status;
