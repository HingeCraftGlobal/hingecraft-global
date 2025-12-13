-- Create payment_routes table (canonical routing map)
CREATE TABLE IF NOT EXISTS payment_routes (
  id SERIAL PRIMARY KEY,
  version BIGINT NOT NULL,
  routes JSONB NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_routes_version ON payment_routes(version DESC);
