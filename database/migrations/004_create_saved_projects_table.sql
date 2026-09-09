-- Migration: Create saved_projects table for user saved/favorite projects
CREATE TABLE IF NOT EXISTS saved_projects (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, project_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_projects_user_id ON saved_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_projects_project_id ON saved_projects(project_id);
