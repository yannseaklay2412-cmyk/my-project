import pool from '../config/db.js';

export const getAllResources = async ({ userId = null, category = null, sort = null } = {}) => {
  const values = [];
  let paramIndex = 1;

  let hasVotedSelect = 'FALSE AS has_voted';
  if (userId) {
    hasVotedSelect = `EXISTS(SELECT 1 FROM resource_votes WHERE resource_votes.resource_id = resources.id AND resource_votes.user_id = $${paramIndex}) AS has_voted`;
    values.push(userId);
    paramIndex++;
  }

  let whereClause = '';
  if (category && category !== 'All' && category.trim() !== '') {
    whereClause = `WHERE LOWER(resources.category) = LOWER($${paramIndex})`;
    values.push(category.trim());
    paramIndex++;
  }

  let orderByClause = 'ORDER BY upvotes DESC, resources.created_at DESC';
  if (sort === 'Newest' || sort === 'newest') {
    orderByClause = 'ORDER BY resources.created_at DESC';
  } else if (sort === 'Oldest' || sort === 'oldest') {
    orderByClause = 'ORDER BY resources.created_at ASC';
  }

  const query = `
    SELECT
      resources.id,
      resources.name,
      resources.category,
      resources.description,
      resources.url,
      resources.created_at,
      resources.user_id AS owner_id,
      users.full_name AS owner_name,
      COALESCE((SELECT COUNT(*) FROM resource_votes WHERE resource_votes.resource_id = resources.id), 0)::int AS upvotes,
      ${hasVotedSelect}
    FROM resources
    JOIN users ON resources.user_id = users.id
    ${whereClause}
    ${orderByClause}
  `;

  const result = await pool.query(query, values);
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

export const toggleResourceVote = async (resourceId, userId) => {
  const resCheck = await pool.query('SELECT id FROM resources WHERE id = $1', [resourceId]);
  if (resCheck.rows.length === 0) {
    return null;
  }

  const checkVote = await pool.query(
    'SELECT id FROM resource_votes WHERE resource_id = $1 AND user_id = $2',
    [resourceId, userId]
  );

  let hasVoted = false;
  if (checkVote.rows.length > 0) {
    await pool.query(
      'DELETE FROM resource_votes WHERE resource_id = $1 AND user_id = $2',
      [resourceId, userId]
    );
    hasVoted = false;
  } else {
    await pool.query(
      'INSERT INTO resource_votes (resource_id, user_id) VALUES ($1, $2) ON CONFLICT (resource_id, user_id) DO NOTHING',
      [resourceId, userId]
    );
    hasVoted = true;
  }

  const countRes = await pool.query(
    'SELECT COUNT(*)::int AS count FROM resource_votes WHERE resource_id = $1',
    [resourceId]
  );

  return {
    resourceId: Number(resourceId),
    hasVoted,
    upvotes: countRes.rows[0].count,
  };
};
