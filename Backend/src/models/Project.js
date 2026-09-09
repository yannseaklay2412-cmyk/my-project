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
      projects.owner_id,
      users.full_name AS owner_name,
      users.university AS owner_university,
      COALESCE((SELECT COUNT(*) FROM comments WHERE comments.project_id = projects.id), 0)::int AS comments_count,
      COALESCE((SELECT COUNT(*) FROM project_members WHERE project_members.project_id = projects.id), 0)::int AS collaborators_count
    FROM projects
    JOIN users ON projects.owner_id = users.id
    ORDER BY projects.created_at DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

export const getProjectById = async (id) => {
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
      COALESCE((SELECT COUNT(*) FROM comments WHERE comments.project_id = projects.id), 0)::int AS comments_count,
      COALESCE((SELECT COUNT(*) FROM project_members WHERE project_members.project_id = projects.id), 0)::int AS collaborators_count
    FROM projects
    JOIN users ON projects.owner_id = users.id
    WHERE projects.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
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

export const updateProject = async (id, fields) => {
  const allowed = ['title', 'description', 'problem', 'status', 'tech_tags', 'github_url'];
  const setClauses = [];
  const values = [];
  let paramIndex = 1;

  for (const [key, val] of Object.entries(fields)) {
    if (allowed.includes(key)) {
      setClauses.push(`${key} = $${paramIndex}`);
      values.push(val);
      paramIndex++;
    }
  }

  if (setClauses.length === 0) {
    return null;
  }

  values.push(id);
  const query = `
    UPDATE projects
    SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${paramIndex}
    RETURNING *;
  `;
  const result = await pool.query(query, values);
  return result.rows[0];
};




