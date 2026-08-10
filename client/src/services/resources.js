import { API_BASE_URL } from './api.js';

export async function getResources() {
  const response = await fetch(`${API_BASE_URL}/resources`);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to load resources');
  }

  return result;
}
