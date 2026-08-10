import pool from '../config/db.js';

export const getAllResources = async () => {
  const query = `
    SELECT
      resources.id,
      resources.title,
      resources.category,
      resources.description,
      resources.link,
      resources.votes,
      resources.created_at,
      users.username AS owner_name
    FROM resources
    JOIN users ON resources.owner_id = users.id
    ORDER BY resources.votes DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};
