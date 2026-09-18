import { getTasksByProjectId, createTask, updateTask, deleteTask } from '../models/Task.js';
import { getProjectMembers } from '../models/Projectmember.js';
import { getProjectById } from '../models/Project.js';
import { createNotification } from '../models/Notification.js';
import { sendNotificationToUser } from '../socket.js';

export async function getTasks(req, res) {
  try {
    const tasks = await getTasksByProjectId(req.params.id);
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function addTask(req, res) {
  const projectId = req.params.id;
  const { title, description, assigneeId, status, dueDate, priority } = req.body;
  const userId = req.user.id;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Task title is required' });
  }

  try {
    const project = await getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const isOwner = String(project.owner_id) === String(userId);
    const members = await getProjectMembers(projectId);
    const isMember = isOwner || members.some((m) => String(m.user_id) === String(userId));

    if (!isMember) {
      return res.status(403).json({ error: 'Only project members can manage tasks' });
    }

    // Rule: Members are not allowed to assign tasks to other members (only to themselves)
    let finalAssigneeId = assigneeId;
    if (!isOwner) {
      if (assigneeId && String(assigneeId) !== String(userId)) {
        return res.status(403).json({ error: 'Members are not allowed to assign tasks to other members' });
      }
      finalAssigneeId = userId;
    }

    const task = await createTask(
      projectId,
      title.trim(),
      description?.trim() || '',
      finalAssigneeId || null,
      status || 'To Do',
      dueDate || null,
      priority || 'Medium'
    );

    // Notify assignee if assigned to someone else
    if (finalAssigneeId && String(finalAssigneeId) !== String(userId)) {
      try {
        const assignerName = req.user.full_name || 'Project Owner';
        const notification = await createNotification({
          user_id: finalAssigneeId,
          sender_id: userId,
          project_id: projectId,
          type: 'task_assigned',
          title: 'New Task Assigned 📋',
          message: `${assignerName} assigned you a task: "${title.trim()}" in "${project.title}".`,
          link: `/projects/${projectId}/tasks`,
        });
        sendNotificationToUser(finalAssigneeId, {
          ...notification,
          sender_name: assignerName,
          project_title: project.title,
        });
      } catch (notifErr) {
        console.warn('Could not create/send task notification:', notifErr.message);
      }
    }

    res.status(201).json({ message: 'Task created successfully', task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function patchTask(req, res) {
  const { id: projectId, taskId } = req.params;
  const { title, description, assigneeId, status, dueDate, priority } = req.body;
  const userId = req.user.id;

  try {
    const project = await getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const isOwner = String(project.owner_id) === String(userId);
    const members = await getProjectMembers(projectId);
    const isMember = isOwner || members.some((m) => String(m.user_id) === String(userId));

    if (!isMember) {
      return res.status(403).json({ error: 'Only project members can update tasks' });
    }

    // Rule: Members are not allowed to assign tasks to other members
    if (!isOwner && assigneeId !== undefined && assigneeId !== null && String(assigneeId) !== String(userId)) {
      return res.status(403).json({ error: 'Members are not allowed to assign tasks to other members' });
    }

    const updated = await updateTask(taskId, { title, description, assigneeId, status, dueDate, priority });
    if (!updated) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Notify new assignee if reassigned to someone else
    if (assigneeId && String(assigneeId) !== String(userId)) {
      try {
        const assignerName = req.user.full_name || 'Project Owner';
        const notification = await createNotification({
          user_id: assigneeId,
          sender_id: userId,
          project_id: projectId,
          type: 'task_assigned',
          title: 'Task Assigned 📋',
          message: `${assignerName} assigned you a task: "${updated.title}" in "${project.title}".`,
          link: `/projects/${projectId}/tasks`,
        });
        sendNotificationToUser(assigneeId, {
          ...notification,
          sender_name: assignerName,
          project_title: project.title,
        });
      } catch (notifErr) {
        console.warn('Could not create/send task notification:', notifErr.message);
      }
    }

    res.status(200).json({ message: 'Task updated successfully', task: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function removeTask(req, res) {
  const { id: projectId, taskId } = req.params;
  const userId = req.user.id;

  try {
    const project = await getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const isOwner = String(project.owner_id) === String(userId);
    if (!isOwner) {
      return res.status(403).json({ error: 'Only the project owner can delete tasks' });
    }

    const deleted = await deleteTask(taskId);
    if (!deleted) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getMembers(req, res) {
  try {
    const projectId = req.params.id;
    const project = await getProjectById(projectId);
    const members = await getProjectMembers(projectId);

    // Make sure owner is in members list if not already
    const hasOwner = members.some((m) => String(m.user_id) === String(project?.owner_id));
    const fullList = [...members];

    if (!hasOwner && project?.owner_id) {
      fullList.unshift({
        user_id: project.owner_id,
        name: project.owner_name,
        university: project.owner_university,
        role: 'owner',
      });
    }

    res.status(200).json(fullList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
