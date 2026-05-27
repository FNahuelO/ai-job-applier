CREATE TABLE IF NOT EXISTS app_settings (
  id VARCHAR(32) PRIMARY KEY DEFAULT 'default',
  job_search_title VARCHAR(255) NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO app_settings (id, job_search_title)
VALUES ('default', '')
ON CONFLICT (id) DO NOTHING;
