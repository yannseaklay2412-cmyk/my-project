import pool from '../config/db.js';

export const getAllProjects = async () => {
  const query = `
    SELECT
      projects.id,
      projects.title,
      projects.description,
      projects.tech_tags,
      projects.status,
      projects.created_at,
      users.full_name AS owner_name,
      users.university AS owner_university
    FROM projects
    JOIN users ON projects.owner_id = users.id
    ORDER BY projects.created_at DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};


export const createProject = async (title, description, problem, tech_tags, status, github_url, owner_id) => {
  const query = `
    INSERT INTO projects (title, description, problem, tech_tags, status, github_url, owner_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  const values = [title, description, problem, tech_tags, status, github_url, owner_id];
  const result = await pool.query(query, values);
  return result.rows[0];
};



