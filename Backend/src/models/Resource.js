import pool from '../config/db.js';

export const getAllResources = async () => {
  const query = `
    SELECT
      resources.id,
      resources.name,
      resources.category,
      resources.description,
      resources.url,
      resources.created_at,
      users.full_name AS owner_name
    FROM resources
    JOIN users ON resources.user_id = users.id
    ORDER BY resources.created_at DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};


export const createResource = async (name, category, description, url, user_id) => {
  const query = `
    INSERT INTO resources (name, category, description, url, user_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const values = [name, category, description, url, user_id];
  const result = await pool.query(query, values);
  return result.rows[0];
};
