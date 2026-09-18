import  pool  from  '../config/db.js';

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


export const addProjectMember = async (project_id, user_id, role) => {
  const query = `
    INSERT INTO project_members (project_id, user_id, role)
    VALUES ($1, $2, $3)
    ON CONFLICT (project_id, user_id) DO UPDATE SET role = EXCLUDED.role
    RETURNING *;
  `;
  const values = [project_id, user_id, role];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const removeProjectMember = async (project_id, user_id) => {
  const query = `
    DELETE FROM project_members
    WHERE project_id = $1 AND user_id = $2
    RETURNING *;
  `;
  const values = [project_id, user_id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const getProjectMembers = async (projectId) => {
  const query = `
    SELECT DISTINCT ON (user_id)
      id,
      project_id,
      user_id,
      role,
      joined_at,
      name,
      university,
      major
    FROM (
      SELECT
        pm.id,
        pm.project_id,
        pm.user_id,
        pm.role,
        pm.joined_at,
        u.full_name AS name,
        u.university,
        u.major
      FROM project_members pm
      JOIN users u ON pm.user_id = u.id
      WHERE pm.project_id = $1
      UNION ALL
      SELECT
        cr.id,
        cr.project_id,
        cr.requester_id AS user_id,
        COALESCE(cr.preferred_role, 'Member') AS role,
        cr.created_at AS joined_at,
        u.full_name AS name,
        u.university,
        u.major
      FROM collaboration_requests cr
      JOIN users u ON cr.requester_id = u.id
      WHERE cr.project_id = $1 AND cr.status = 'accepted'
    ) combined
    ORDER BY user_id, joined_at ASC
  `;
  const result = await pool.query(query, [projectId]);
  return result.rows;
};

