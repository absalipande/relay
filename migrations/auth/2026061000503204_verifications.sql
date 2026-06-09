-- +goose Up
CREATE TABLE IF NOT EXISTS verifications (
  id UUID,
  subject VARCHAR(255) NOT NULL,
  value VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (id)
);
CREATE UNIQUE INDEX idx_verifications_value ON verifications (value);
CREATE INDEX idx_verifications_subject ON verifications (subject);

-- +goose Down
DROP TABLE IF EXISTS verifications;