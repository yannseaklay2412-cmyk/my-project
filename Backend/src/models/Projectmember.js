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
    SELECT
      project_members.id,
      project_members.project_id,
      project_members.user_id,
      project_members.role,
      project_members.joined_at,
      users.full_name AS name,
      users.university,
      users.major
    FROM project_members
    JOIN users ON project_members.user_id = users.id
    WHERE project_members.project_id = $1
    ORDER BY project_members.joined_at ASC
  `;
  const result = await pool.query(query, [projectId]);
  return result.rows;
};

