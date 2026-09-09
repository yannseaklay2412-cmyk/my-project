import { getAllResources, createResource as createResourceInDb } from '../models/Resource.js';

export async function getResources(req, res) {
  try {
    const resources = await getAllResources();
    res.status(200).json(resources);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function createResource(req, res) {
  const { name, category, description, url } = req.body;
  const user_id = req.user.id;

  try {
    const newResource = await createResourceInDb(name, category, description, url, user_id);
    res.status(201).json({ message: 'Resource created successfully', resource: newResource });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
