import { API_BASE_URL } from './api.js';

export async function getMessages(token, projectId) {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/messages`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to load messages');
  }

  return result;
}
