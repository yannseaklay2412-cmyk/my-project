import { getAllProjects } from '../models/Project.js';
import { createProjectWithOwner } from '../services/projectService.js';

export async function getProjects(req, res) {
  try {
    const projects = await getAllProjects();
    res.status(200).json(projects);
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