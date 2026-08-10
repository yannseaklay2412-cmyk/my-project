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
    RETURNING *
  `;
  const values = [project_id, user_id, role];
  const result = await pool.query(query, values);
  return result.rows[0];
};
