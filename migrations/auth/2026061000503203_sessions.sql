-- +goose Up
CREATE TABLE IF NOT EXISTS sessions (
  id UUID,
  token VARCHAR(255) NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMPTZ NOT NULL,
  last_access TIMESTAMPTZ NOT NULL,
  metadata JSONB,
  PRIMARY KEY (id),
CONSTRAINT fk_sessions_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX idx_sessions_token ON sessions (token);
CREATE INDEX idx_sessions_user_id ON sessions (user_id);

-- +goose Down
DROP TABLE IF EXISTS sessions;