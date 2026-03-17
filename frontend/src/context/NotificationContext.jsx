import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export function useNotifications() {
    return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const { user, token, api, logout } = useAuth();

    const handleRequestError = useCallback((error, fallbackMessage) => {
        const status = error?.response?.status;

        if (status === 401) {
            setNotifications([]);
            setUnreadCount(0);
            if (token) {
                logout();
            }
            return;
        }

        if (status === 403) {
            return;
        }

        console.error(fallbackMessage, error);
    }, [logout, token]);

    // Fetch notifications
    const fetchNotifications = useCallback(async (options = {}) => {
        if (!token) return;

        try {
            setLoading(true);
            const { limit = 20, skip = 0, unreadOnly = false } = options;
            
            const response = await api.get('/notifications', {
                params: { limit, skip, unreadOnly }
            });

            if (response.data.success) {
                setNotifications(response.data.notifications);
                setUnreadCount(response.data.unreadCount);
            }
        } catch (error) {
            handleRequestError(error, 'Error fetching notifications:');
        } finally {
            setLoading(false);
        }
    }, [api, handleRequestError, token]);

    // Fetch unread count only
    const fetchUnreadCount = useCallback(async () => {
        if (!token) return;

        try {
            const response = await api.get('/notifications/unread-count');

            if (response.data.success) {
                setUnreadCount(response.data.count);
            }
        } catch (error) {
            handleRequestError(error, 'Error fetching unread count:');
        }
    }, [api, handleRequestError, token]);

    // Mark as read
    const markAsRead = useCallback(async (notificationId) => {
        if (!token) return;

        try {
            const response = await api.put(`/notifications/${notificationId}/read`, {});

            if (response.data.success) {
                setNotifications(prev =>
                    prev.map(notif =>
                        notif._id === notificationId ? { ...notif, isRead: true } : notif
                    )
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            handleRequestError(error, 'Error marking notification as read:');
        }
    }, [api, handleRequestError, token]);

    // Mark all as read
    const markAllAsRead = useCallback(async () => {
        if (!token) return;

        try {
            const response = await api.put('/notifications/mark-all-read', {});

            if (response.data.success) {
                setNotifications(prev =>
                    prev.map(notif => ({ ...notif, isRead: true }))
                );
                setUnreadCount(0);
            }
        } catch (error) {
            handleRequestError(error, 'Error marking all as read:');
        }
    }, [api, handleRequestError, token]);

    // Delete notification
    const deleteNotification = useCallback(async (notificationId) => {
        if (!token) return;

        try {
            const response = await api.delete(`/notifications/${notificationId}`);

            if (response.data.success) {
                setNotifications(prev =>
                    prev.filter(notif => notif._id !== notificationId)
                );
                // Recalculate unread count
                const deletedNotif = notifications.find(n => n._id === notificationId);
                if (deletedNotif && !deletedNotif.isRead) {
                    setUnreadCount(prev => Math.max(0, prev - 1));
                }
            }
        } catch (error) {
            handleRequestError(error, 'Error deleting notification:');
        }
    }, [api, handleRequestError, notifications, token]);

    // Auto-fetch when user logs in
    useEffect(() => {
        if (user && token) {
            fetchNotifications();
            // Poll for new notifications every 30 seconds
            const interval = setInterval(fetchUnreadCount, 30000);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, token]);

    const value = {
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}
