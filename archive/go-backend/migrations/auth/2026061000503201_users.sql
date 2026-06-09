-- +goose Up
CREATE TABLE IF NOT EXISTS users (
  id UUID,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255),
  email_verified_at TIMESTAMPTZ,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (id)
);
CREATE UNIQUE INDEX idx_users_email ON users (email);

-- +goose Down
DROP TABLE IF EXISTS users;