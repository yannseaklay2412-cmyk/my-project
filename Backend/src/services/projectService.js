import { createProject } from '../models/Project.js';
import { addProjectMember } from '../models/Projectmember.js';

export async function createProjectWithOwner(projectData, owner_id) {
  const { title, description, problem, tech_tags, status, github_url } = projectData;
  const newProject = await createProject(title, description, problem, tech_tags, status, github_url, owner_id);
  await addProjectMember(newProject.id, owner_id, 'owner');
  return newProject;
}
