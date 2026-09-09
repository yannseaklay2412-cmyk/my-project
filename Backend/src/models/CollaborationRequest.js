import pool from '../config/db.js';

export const createCollaborationRequest = async ({
  project_id,
  requester_id,
  message,
  preferred_role,
  skills,
  portfolio_url,
}) => {
  const query = `
    INSERT INTO collaboration_requests (
      project_id,
      requester_id,
      message,
      preferred_role,
      skills,
      portfolio_url,
      status
    )
    VALUES ($1, $2, $3, $4, $5, $6, 'pending')
    RETURNING *;
  `;
  const values = [
    project_id,
    requester_id,
    message,
    preferred_role || null,
    skills || [],
    portfolio_url || null,
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const getRequestByProjectAndUser = async (project_id, requester_id) => {
  const query = `
    SELECT * FROM collaboration_requests
    WHERE project_id = $1 AND requester_id = $2;
  `;
  const result = await pool.query(query, [project_id, requester_id]);
  return result.rows[0];
};

export const getRequestsForProject = async (project_id) => {
  const query = `
    SELECT
      cr.*,
      u.full_name AS requester_name,
      u.university AS requester_university,
      u.major AS requester_major,
      u.year AS requester_year
    FROM collaboration_requests cr
    JOIN users u ON cr.requester_id = u.id
    WHERE cr.project_id = $1
    ORDER BY cr.created_at DESC;
  `;
  const result = await pool.query(query, [project_id]);
  return result.rows;
};

export const getRequestById = async (id) => {
  const query = `
    SELECT
      cr.*,
      u.full_name AS requester_name,
      u.university AS requester_university,
      u.major AS requester_major,
      u.year AS requester_year
    FROM collaboration_requests cr
    JOIN users u ON cr.requester_id = u.id
    WHERE cr.id = $1;
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

export const updateRequestStatus = async (id, status) => {
  const query = `
    UPDATE collaboration_requests
    SET status = $1
    WHERE id = $2
    RETURNING *;
  `;
  const result = await pool.query(query, [status, id]);
  return result.rows[0];
};

