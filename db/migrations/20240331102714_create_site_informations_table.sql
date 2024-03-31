-- migrate:up
CREATE TABLE site_informations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  contact_info VARCHAR(50) NOT NULL,
  address TEXT NOT NULL,
  user_id INTEGER NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_site_info_user_id FOREIGN KEY(user_id) REFERENCES users(id)
    ON DELETE CASCADE
);

-- migrate:down
DROP TABLE site_informations;
