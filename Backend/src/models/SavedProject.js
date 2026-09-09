import pool from '../config/db.js';

export const getSavedProjectsByUserId = async (userId) => {
  const query = `
    SELECT
      projects.id,
      projects.title,
      projects.description,
      projects.problem,
      projects.tech_tags,
      projects.status,
      projects.github_url,
      projects.created_at,
      projects.owner_id,
      users.full_name AS owner_name,
      users.university AS owner_university,
      users.year AS owner_year,
      users.major AS owner_major,
      saved_projects.created_at AS saved_at,
      COALESCE((SELECT COUNT(*) FROM comments WHERE comments.project_id = projects.id), 0)::int AS comments_count,
      COALESCE((SELECT COUNT(*) FROM project_members WHERE project_members.project_id = projects.id), 0)::int AS collaborators_count
    FROM saved_projects
    JOIN projects ON saved_projects.project_id = projects.id
    JOIN users ON projects.owner_id = users.id
    WHERE saved_projects.user_id = $1
    ORDER BY saved_projects.created_at DESC
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
};

export const getSavedProjectIdsByUserId = async (userId) => {
  const query = `
    SELECT project_id
    FROM saved_projects
    WHERE user_id = $1
  `;
  const result = await pool.query(query, [userId]);
  return result.rows.map((row) => row.project_id);
};

export const isProjectSavedByUser = async (userId, projectId) => {
  const query = `
    SELECT id
    FROM saved_projects
    WHERE user_id = $1 AND project_id = $2
  `;
  const result = await pool.query(query, [userId, projectId]);
  return result.rows.length > 0;
};

export const addSavedProject = async (userId, projectId) => {
  const query = `
    INSERT INTO saved_projects (user_id, project_id)
    VALUES ($1, $2)
    ON CONFLICT (user_id, project_id) DO NOTHING
    RETURNING *
  `;
  const result = await pool.query(query, [userId, projectId]);
  return result.rows[0];
};

export const deleteSavedProject = async (userId, projectId) => {
  const query = `
    DELETE FROM saved_projects
    WHERE user_id = $1 AND project_id = $2
    RETURNING *
  `;
  const result = await pool.query(query, [userId, projectId]);
  return result.rows[0];
};
