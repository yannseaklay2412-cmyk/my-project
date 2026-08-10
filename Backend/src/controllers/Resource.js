import { getAllResources } from '../models/Resource.js';

export async function getResources(req, res) {
  try {
    const resources = await getAllResources();
    res.status(200).json(resources);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
