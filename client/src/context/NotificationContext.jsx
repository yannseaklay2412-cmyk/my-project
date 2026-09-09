import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext.jsx';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../services/notifications.js';
import { createSocket } from '../services/socket.js';

const NotificationContext = createContext(null);

export function formatTimeAgo(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffSeconds = Math.max(0, Math.floor((now - date) / 1000));

  if (diffSeconds < 60) return 'Just now';
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function NotificationProvider({ children }) {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeToast, setActiveToast] = useState(null);

  const fetchUserNotifications = useCallback(async () => {
    if (!user?.id || !token) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      setLoading(true);
      const data = await getNotifications(token);
      setNotifications(data.notifications || []);
      setUnreadCount(Number(data.unreadCount || 0));
    } catch (err) {
      console.warn('Could not fetch notifications:', err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id, token]);

  // Initial fetch and user changes
  useEffect(() => {
    if (!user?.id || !token) {
      setNotifications([]);
      setUnreadCount(0);
      setActiveToast(null);
      return;
    }

    fetchUserNotifications();
  }, [user?.id, token, fetchUserNotifications]);

  // Real-time socket listener for live notifications
  useEffect(() => {
    if (!user?.id || !token) return;

    const socket = createSocket(token);

    socket.on('connect', () => {
      // socket connected and user room joined automatically on backend
    });

    socket.on('new_notification', (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);
      setActiveToast(newNotif);
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.id, token]);

  // Auto-dismiss floating toast after 6s
  useEffect(() => {
    if (!activeToast) return;
    const timer = setTimeout(() => {
      setActiveToast(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [activeToast]);

  const markAsRead = useCallback(
    async (notificationId) => {
      if (!user?.id || !token) return;

      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      try {
        await markNotificationAsRead(notificationId, token);
      } catch (err) {
        console.error('Failed to mark notification as read:', err);
      }
    },
    [user?.id, token]
  );

  const markAllAsRead = useCallback(async () => {
    if (!user?.id || !token) return;

    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);

    try {
      await markAllNotificationsAsRead(token);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  }, [user?.id, token]);

  const dismissToast = useCallback(() => {
    setActiveToast(null);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        activeToast,
        markAsRead,
        markAllAsRead,
        dismissToast,
        refreshNotifications: fetchUserNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
