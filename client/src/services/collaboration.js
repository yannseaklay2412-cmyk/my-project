import { API_BASE_URL } from './api.js';

export async function submitCollaborationRequest(projectId, token, data) {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to submit collaboration request');
  }

  return result;
}

export async function getMyCollaborationRequest(projectId, token) {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/requests/my-status`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to check collaboration status');
  }

  return result.request;
}

export async function getProjectCollaborationRequests(projectId, token) {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/requests`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to load collaboration requests');
  }

  return result.requests || [];
}

export async function updateCollaborationRequestStatus(projectId, requestId, status, token) {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/requests/${requestId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || `Failed to ${status} collaboration request`);
  }

  return result.request;
}

