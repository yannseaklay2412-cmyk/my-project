import { API_BASE_URL } from './api.js';

export async function getProjects() {
  const response = await fetch(`${API_BASE_URL}/projects`);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to load projects');
  }

  return result;
}

export async function createProject(token, data) {
  const response = await fetch(`${API_BASE_URL}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to create project');
  }

  return result.project;
}
