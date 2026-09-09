import {
  getNotificationsByUserId,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount,
} from '../models/Notification.js';

export async function getNotifications(req, res) {
  const userId = req.user.id;
  try {
    const [notifications, unreadCount] = await Promise.all([
      getNotificationsByUserId(userId),
      getUnreadNotificationCount(userId),
    ]);
    res.status(200).json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function markRead(req, res) {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const notification = await markNotificationAsRead(id, userId);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    const unreadCount = await getUnreadNotificationCount(userId);
    res.status(200).json({ success: true, notification, unreadCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function markAllRead(req, res) {
  const userId = req.user.id;

  try {
    await markAllNotificationsAsRead(userId);
    res.status(200).json({ success: true, unreadCount: 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
