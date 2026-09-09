import pool from '../config/db.js';

export const getTasksByProjectId = async (projectId) => {
  const query = `
    SELECT
      tasks.id,
      tasks.project_id,
      tasks.title,
      tasks.description,
      tasks.assignee_id,
      tasks.status,
      tasks.created_at,
      tasks.updated_at,
      users.full_name AS assignee_name,
      users.university AS assignee_university
    FROM tasks
    LEFT JOIN users ON tasks.assignee_id = users.id
    WHERE tasks.project_id = $1
    ORDER BY tasks.id ASC
  `;
  const result = await pool.query(query, [projectId]);
  return result.rows.map((row) => ({
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    description: row.description || '',
    assigneeId: row.assignee_id,
    assignee: row.assignee_name || 'Unassigned',
    status: row.status || 'To Do',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
};

export const createTask = async (projectId, title, description, assigneeId, status = 'To Do') => {
  const query = `
    INSERT INTO tasks (project_id, title, description, assignee_id, status)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const result = await pool.query(query, [projectId, title, description, assigneeId || null, status]);
  const task = result.rows[0];

  let assigneeName = 'Unassigned';
  if (task.assignee_id) {
    const userRes = await pool.query('SELECT full_name FROM users WHERE id = $1', [task.assignee_id]);
    if (userRes.rows.length > 0) {
      assigneeName = userRes.rows[0].full_name;
    }
  }

  return {
    id: task.id,
    projectId: task.project_id,
    title: task.title,
    description: task.description || '',
    assigneeId: task.assignee_id,
    assignee: assigneeName,
    status: task.status,
    createdAt: task.created_at,
    updatedAt: task.updated_at,
  };
};

export const updateTask = async (taskId, updates) => {
  const { title, description, assigneeId, status } = updates;
  const fields = [];
  const values = [];
  let index = 1;

  if (title !== undefined) {
    fields.push(`title = $${index++}`);
    values.push(title);
  }
  if (description !== undefined) {
    fields.push(`description = $${index++}`);
    values.push(description);
  }
  if (assigneeId !== undefined) {
    fields.push(`assignee_id = $${index++}`);
    values.push(assigneeId);
  }
  if (status !== undefined) {
    fields.push(`status = $${index++}`);
    values.push(status);
  }
  fields.push(`updated_at = NOW()`);

  values.push(taskId);
  const query = `
    UPDATE tasks
    SET ${fields.join(', ')}
    WHERE id = $${index}
    RETURNING *
  `;
  const result = await pool.query(query, values);
  if (result.rows.length === 0) return null;
  const task = result.rows[0];

  let assigneeName = 'Unassigned';
  if (task.assignee_id) {
    const userRes = await pool.query('SELECT full_name FROM users WHERE id = $1', [task.assignee_id]);
    if (userRes.rows.length > 0) {
      assigneeName = userRes.rows[0].full_name;
    }
  }

  return {
    id: task.id,
    projectId: task.project_id,
    title: task.title,
    description: task.description || '',
    assigneeId: task.assignee_id,
    assignee: assigneeName,
    status: task.status,
    createdAt: task.created_at,
    updatedAt: task.updated_at,
  };
};

export const deleteTask = async (taskId) => {
  const query = `DELETE FROM tasks WHERE id = $1 RETURNING id`;
  const result = await pool.query(query, [taskId]);
  return result.rows[0];
};
