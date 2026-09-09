import { API_BASE_URL } from './api.js';

export async function getNotifications(token) {
  const response = await fetch(`${API_BASE_URL}/notifications`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to fetch notifications');
  }

  return result;
}

export async function markNotificationAsRead(id, token) {
  const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to mark notification as read');
  }

  return result;
}

export async function markAllNotificationsAsRead(token) {
  const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to mark all notifications as read');
  }

  return result;
}
