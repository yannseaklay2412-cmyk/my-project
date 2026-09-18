import {
  getAllResources,
  createResource as createResourceInDb,
  toggleResourceVote,
} from '../models/Resource.js';

export async function getResources(req, res) {
  const userId = req.user?.id || null;
  const { category, sort } = req.query;

  try {
    const resources = await getAllResources({ userId, category, sort });
    res.status(200).json(resources);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function createResource(req, res) {
  const { name, category, description, url } = req.body;
  const user_id = req.user.id;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Resource name is required' });
  }
  if (!url || !url.trim()) {
    return res.status(400).json({ error: 'Resource URL is required' });
  }

  try {
    const newResource = await createResourceInDb(name.trim(), category, description?.trim() || '', url.trim(), user_id);
    res.status(201).json({ message: 'Resource created successfully', resource: newResource });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function voteResource(req, res) {
  const resourceId = req.params.id;
  const userId = req.user.id;

  try {
    const result = await toggleResourceVote(resourceId, userId);
    if (!result) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    res.status(200).json({
      message: result.hasVoted ? 'Resource upvoted' : 'Resource upvote removed',
      ...result,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
