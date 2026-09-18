import { getMessagesByProject } from '../models/Message.js';
import { getProjectById } from '../models/Project.js';
import { getProjectMembers } from '../models/Projectmember.js';
import { getRequestByProjectAndUser } from '../models/CollaborationRequest.js';

export async function getMessages(req, res) {
  const { projectId } = req.params;
  const userId = req.user.id;

  try {
    const project = await getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const isOwner = String(project.owner_id) === String(userId);
    const members = await getProjectMembers(projectId);
    const reqStatus = await getRequestByProjectAndUser(projectId, userId);
    const isAccepted = reqStatus?.status === 'accepted';
    const isMember = isOwner || isAccepted || members.some((m) => String(m.user_id) === String(userId));

    if (!isMember) {
      return res.status(403).json({ error: 'Only project members can access project chat' });
    }

    const messages = await getMessagesByProject(projectId);
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
