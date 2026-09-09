import {
  createCollaborationRequest,
  getRequestByProjectAndUser,
  getRequestsForProject,
  getRequestById,
  updateRequestStatus,
} from '../models/CollaborationRequest.js';
import { getProjectById } from '../models/Project.js';
import { addProjectMember, removeProjectMember } from '../models/Projectmember.js';
import { createNotification } from '../models/Notification.js';
import { sendNotificationToUser } from '../socket.js';

export async function submitRequest(req, res) {
  const { projectId } = req.params;
  const requesterId = req.user.id;
  const { message, preferred_role, skills, portfolio_url } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const project = await getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (String(project.owner_id) === String(requesterId)) {
      return res.status(400).json({ error: 'You cannot request to collaborate on your own project' });
    }

    const existing = await getRequestByProjectAndUser(projectId, requesterId);
    if (existing) {
      return res.status(400).json({ error: 'You have already submitted a request for this project' });
    }

    const request = await createCollaborationRequest({
      project_id: projectId,
      requester_id: requesterId,
      message: message.trim(),
      preferred_role: preferred_role ? preferred_role.trim() : null,
      skills: Array.isArray(skills) ? skills : [],
      portfolio_url: portfolio_url ? portfolio_url.trim() : null,
    });

    // Notify project owner of new collaboration request
    try {
      const requesterName = req.user.full_name || 'A student';
      const roleText = preferred_role ? preferred_role.trim() : 'a collaborator';
      const notification = await createNotification({
        user_id: project.owner_id,
        sender_id: requesterId,
        project_id: projectId,
        type: 'collaboration_request',
        title: 'New Collaboration Request',
        message: `${requesterName} has requested to join "${project.title}" as ${roleText}.`,
        link: `/projects/${projectId}/overview`,
      });
      sendNotificationToUser(project.owner_id, {
        ...notification,
        sender_name: requesterName,
        project_title: project.title,
      });
    } catch (notifErr) {
      console.warn('Could not create/send request notification:', notifErr.message);
    }

    res.status(201).json({
      message: 'Collaboration request submitted successfully',
      request,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getMyRequest(req, res) {
  const { projectId } = req.params;
  const requesterId = req.user.id;

  try {
    const request = await getRequestByProjectAndUser(projectId, requesterId);
    res.status(200).json({ request: request || null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getProjectRequests(req, res) {
  const { projectId } = req.params;
  const userId = req.user.id;

  try {
    const project = await getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (String(project.owner_id) !== String(userId)) {
      return res.status(403).json({ error: 'Only the project owner can view collaboration requests' });
    }

    const requests = await getRequestsForProject(projectId);
    res.status(200).json({ requests });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function respondToRequest(req, res) {
  const { projectId, requestId } = req.params;
  const userId = req.user.id;
  const { status } = req.body;

  if (!['accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Status must be either accepted or rejected' });
  }

  try {
    const project = await getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (String(project.owner_id) !== String(userId)) {
      return res.status(403).json({ error: 'Only the project owner can accept or reject requests' });
    }

    const request = await getRequestById(requestId);
    if (!request || String(request.project_id) !== String(projectId)) {
      return res.status(404).json({ error: 'Collaboration request not found for this project' });
    }

    const updated = await updateRequestStatus(requestId, status);

    if (status === 'accepted') {
      await addProjectMember(
        projectId,
        request.requester_id,
        request.preferred_role || 'Member'
      );
    } else if (status === 'rejected' && request.status === 'accepted') {
      await removeProjectMember(projectId, request.requester_id);
    }

    // Notify requester of decision (e.g. congratulations when accepted)
    try {
      const isAccepted = status === 'accepted';
      const notification = await createNotification({
        user_id: request.requester_id,
        sender_id: userId,
        project_id: projectId,
        type: isAccepted ? 'request_accepted' : 'request_rejected',
        title: isAccepted ? 'Congratulations! 🎉' : 'Request Update',
        message: isAccepted
          ? `Congratulations! Your request to join "${project.title}" has been accepted! You are now a member of the project.`
          : `Your collaboration request to join "${project.title}" was declined.`,
        link: `/projects/${projectId}`,
      });
      sendNotificationToUser(request.requester_id, {
        ...notification,
        sender_name: req.user.full_name || 'Project Owner',
        project_title: project.title,
      });
    } catch (notifErr) {
      console.warn('Could not create/send response notification:', notifErr.message);
    }

    res.status(200).json({
      message: `Collaboration request ${status} successfully`,
      request: {
        ...request,
        status: updated.status,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

