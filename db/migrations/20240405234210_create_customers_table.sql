-- migrate:up
CREATE TYPE account_status AS ENUM ('unverified', 'verified', 'inactive');
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(25) NOT NULL,
  middle_name VARCHAR(25),
  last_name VARCHAR(25),
  email VARCHAR(50) NOT NULL UNIQUE,
  phone_number VARCHAR(15) NOT NULL UNIQUE,
  address TEXT NOT NULL,
  profile_image TEXT,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  account_status account_status NOT NULL DEFAULT 'unverified'::account_status,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- migrate:down
DROP TABLE customers;
DROP TYPE account_status;

