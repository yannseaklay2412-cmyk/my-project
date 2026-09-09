import { getMessagesByProject } from '../models/Message.js';

export async function getMessages(req, res) {
  const { projectId } = req.params;

  try {
    const messages = await getMessagesByProject(projectId);
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
