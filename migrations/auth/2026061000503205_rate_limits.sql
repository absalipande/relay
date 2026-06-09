-- +goose Up
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID,
  key VARCHAR(255) NOT NULL,
  count INTEGER NOT NULL,
  last_request_at BIGINT NOT NULL,
  PRIMARY KEY (id)
);
CREATE UNIQUE INDEX idx_rate_limits_key ON rate_limits (key);

-- +goose Down
DROP TABLE IF EXISTS rate_limits;