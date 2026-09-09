import { API_BASE_URL } from './api.js';

export async function getProjects() {
  const response = await fetch(`${API_BASE_URL}/projects`);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to load projects');
  }

  return result;
}

export async function getProject(id) {
  const response = await fetch(`${API_BASE_URL}/projects/${id}`);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to load project');
  }

  return result.project;
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

export async function getProjectComments(projectId) {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/comments`);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to load comments');
  }

  return result;
}

export async function addProjectComment(projectId, token, body) {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ body }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to post comment');
  }

  return result.comment;
}

export async function getProjectTasks(projectId) {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/tasks`);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to load tasks');
  }

  return result;
}

export async function createProjectTask(projectId, token, data) {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to create task');
  }

  return result.task;
}

export async function updateProjectTask(projectId, taskId, token, updates) {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/tasks/${taskId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to update task');
  }

  return result.task;
}

export async function deleteProjectTask(projectId, taskId, token) {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/tasks/${taskId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to delete task');
  }

  return result;
}

export async function getProjectMembers(projectId) {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/members`);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to load project members');
  }

  return result;
}

export async function updateProject(id, token, data) {
  const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to update project');
  }

  return result.project;
}

export async function getSavedProjects(token) {
  const response = await fetch(`${API_BASE_URL}/projects/saved`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to load saved projects');
  }

  return result;
}

export async function toggleSaveProject(projectId, token) {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/save`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to update saved project');
  }

  return result;
}

export async function removeSavedProject(projectId, token) {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/save`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to remove saved project');
  }

  return result;
}



