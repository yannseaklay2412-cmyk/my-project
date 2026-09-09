import { getTasksByProjectId, createTask, updateTask, deleteTask } from '../models/Task.js';
import { getProjectMembers } from '../models/Projectmember.js';
import { getProjectById } from '../models/Project.js';

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
  const { title, description, assigneeId, status } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Task title is required' });
  }

  try {
    const task = await createTask(projectId, title.trim(), description?.trim() || '', assigneeId || null, status || 'To Do');
    res.status(201).json({ message: 'Task created successfully', task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function patchTask(req, res) {
  const { taskId } = req.params;
  const { title, description, assigneeId, status } = req.body;

  try {
    const updated = await updateTask(taskId, { title, description, assigneeId, status });
    if (!updated) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json({ message: 'Task updated successfully', task: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function removeTask(req, res) {
  const { taskId } = req.params;
  try {
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
