import { API_BASE_URL } from './api.js';

export async function getResources(token = null, { category = null, sort = null } = {}) {
  const params = new URLSearchParams();
  if (category && category !== 'All' && category !== 'Category') {
    params.set('category', category);
  }
  if (sort) {
    params.set('sort', sort);
  }

  const queryString = params.toString() ? `?${params.toString()}` : '';
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/resources${queryString}`, { headers });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to load resources');
  }

  return result;
}

export async function toggleResourceVote(resourceId, token) {
  const response = await fetch(`${API_BASE_URL}/resources/${resourceId}/vote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to toggle vote');
  }

  return result;
}
