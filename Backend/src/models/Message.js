import pool from '../config/db.js';

export const getMessagesByProject = async (project_id) => {
  const query = `
    SELECT
      messages.id,
      messages.project_id,
      messages.user_id,
      messages.body,
      messages.created_at,
      users.full_name AS sender_name
    FROM messages
    JOIN users ON messages.user_id = users.id
    WHERE messages.project_id = $1
    ORDER BY messages.created_at ASC
  `;
  const result = await pool.query(query, [project_id]);
  return result.rows;
};

export const createMessage = async (project_id, user_id, body) => {
  const query = `
    INSERT INTO messages (project_id, user_id, body)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  const values = [project_id, user_id, body];
  const result = await pool.query(query, values);
  return result.rows[0];
};
