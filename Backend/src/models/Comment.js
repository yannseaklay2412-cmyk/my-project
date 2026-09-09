import pool from '../config/db.js';

export const getCommentsByProjectId = async (projectId) => {
  const query = `
    SELECT
      comments.id,
      comments.project_id,
      comments.user_id,
      comments.body AS text,
      comments.created_at,
      users.full_name AS author,
      users.university AS author_university
    FROM comments
    JOIN users ON comments.user_id = users.id
    WHERE comments.project_id = $1
    ORDER BY comments.created_at ASC
  `;
  const result = await pool.query(query, [projectId]);
  return result.rows;
};

export const createComment = async (projectId, userId, body) => {
  const insertQuery = `
    INSERT INTO comments (project_id, user_id, body)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  const result = await pool.query(insertQuery, [projectId, userId, body]);
  const comment = result.rows[0];

  const userQuery = `SELECT full_name, university FROM users WHERE id = $1`;
  const userResult = await pool.query(userQuery, [userId]);
  const user = userResult.rows[0];

  return {
    ...comment,
    text: comment.body,
    author: user?.full_name || 'Anonymous',
    author_university: user?.university,
  };
};
