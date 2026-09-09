import { getAllProjects, getProjectById, updateProject } from '../models/Project.js';
import { getCommentsByProjectId, createComment } from '../models/Comment.js';
import { createProjectWithOwner } from '../services/projectService.js';
import {
  getSavedProjectsByUserId,
  isProjectSavedByUser,
  addSavedProject,
  deleteSavedProject,
} from '../models/SavedProject.js';


export async function getProjects(req, res) {
  try {
    const projects = await getAllProjects();
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getProject(req, res) {
  try {
    const project = await getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.status(200).json({ project });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
 
export async function createProject(req, res) {
  const { title, description, problem, tech_tags, status, github_url } = req.body;
  const owner_id = req.user.id;

  try {
    const newProject = await createProjectWithOwner(
      { title, description, problem, tech_tags, status, github_url },
      owner_id
    );
    res.status(201).json({ message: 'Project created successfully', project: newProject });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getComments(req, res) {
  try {
    const comments = await getCommentsByProjectId(req.params.id);
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function addComment(req, res) {
  const { body } = req.body;
  const projectId = req.params.id;
  const userId = req.user.id;

  if (!body || !body.trim()) {
    return res.status(400).json({ error: 'Comment text is required' });
  }

  try {
    const comment = await createComment(projectId, userId, body.trim());
    res.status(201).json({ message: 'Comment posted successfully', comment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function patchProject(req, res) {
  const { id } = req.params;
  const userId = req.user.id;
  const { status, title, description, problem, tech_tags, github_url } = req.body;

  try {
    const project = await getProjectById(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (String(project.owner_id) !== String(userId)) {
      return res.status(403).json({ error: 'Only the project owner can update this project' });
    }

    const updated = await updateProject(id, {
      ...(status !== undefined && { status }),
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(problem !== undefined && { problem }),
      ...(tech_tags !== undefined && { tech_tags }),
      ...(github_url !== undefined && { github_url }),
    });

    res.status(200).json({ message: 'Project updated successfully', project: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getSavedProjects(req, res) {
  const userId = req.user.id;
  try {
    const projects = await getSavedProjectsByUserId(userId);
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function toggleSaveProject(req, res) {
  const userId = req.user.id;
  const projectId = req.params.id;

  try {
    const project = await getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const alreadySaved = await isProjectSavedByUser(userId, projectId);
    if (alreadySaved) {
      await deleteSavedProject(userId, projectId);
      return res.status(200).json({ saved: false, message: 'Project removed from saved' });
    } else {
      await addSavedProject(userId, projectId);
      return res.status(200).json({ saved: true, message: 'Project saved successfully' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function removeSavedProject(req, res) {
  const userId = req.user.id;
  const projectId = req.params.id;

  try {
    await deleteSavedProject(userId, projectId);
    res.status(200).json({ saved: false, message: 'Project removed from saved' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}