import pool from '../config/db.js';

export const createNotification = async ({
  user_id,
  sender_id = null,
  project_id = null,
  type,
  title,
  message,
  link = null,
}) => {
  const query = `
    INSERT INTO notifications (user_id, sender_id, project_id, type, title, message, link)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  const values = [user_id, sender_id, project_id, type, title, message, link];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const getNotificationsByUserId = async (userId) => {
  const query = `
    SELECT
      n.id,
      n.user_id,
      n.sender_id,
      n.project_id,
      n.type,
      n.title,
      n.message,
      n.link,
      n.is_read,
      n.created_at,
      u.full_name AS sender_name,
      p.title AS project_title
    FROM notifications n
    LEFT JOIN users u ON n.sender_id = u.id
    LEFT JOIN projects p ON n.project_id = p.id
    WHERE n.user_id = $1
    ORDER BY n.created_at DESC
    LIMIT 50
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
};

export const markNotificationAsRead = async (id, userId) => {
  const query = `
    UPDATE notifications
    SET is_read = TRUE
    WHERE id = $1 AND user_id = $2
    RETURNING *
  `;
  const result = await pool.query(query, [id, userId]);
  return result.rows[0];
};

export const markAllNotificationsAsRead = async (userId) => {
  const query = `
    UPDATE notifications
    SET is_read = TRUE
    WHERE user_id = $1 AND is_read = FALSE
    RETURNING id
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
};

export const getUnreadNotificationCount = async (userId) => {
  const query = `
    SELECT COUNT(*)::int AS count
    FROM notifications
    WHERE user_id = $1 AND is_read = FALSE
  `;
  const result = await pool.query(query, [userId]);
  return result.rows[0]?.count || 0;
};
