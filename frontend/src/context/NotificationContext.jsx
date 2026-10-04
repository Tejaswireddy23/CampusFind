import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import API from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { getSockJsUrl } from '../config/env';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const { info } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastEvent, setLastEvent] = useState(null);

  // Request browser notification permission when user is authenticated
  useEffect(() => {
    if (!user) return;
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().catch((err) => {
          console.warn('Browser notification permission request error:', err);
        });
      }
    }
  }, [user]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await API.get('/notifications');
      setNotifications(res.data);
      const unreadRes = await API.get('/notifications/unread-count');
      setUnreadCount(unreadRes.data.count || 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // STOMP WebSocket connection
  useEffect(() => {
    if (!user) return;

    let stompClient = null;
    try {
      stompClient = new Client({
        webSocketFactory: () => new SockJS(getSockJsUrl()),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          // Subscribe to user personal notifications
          stompClient.subscribe(`/topic/notifications/${user.id}`, (message) => {
            if (message.body) {
              const newNotif = JSON.parse(message.body);
              setNotifications((prev) => [newNotif, ...prev]);
              setUnreadCount((c) => c + 1);
              setLastEvent({
                type: newNotif.type,
                timestamp: Date.now(),
                data: newNotif,
              });

              // 1. In-app toast notification
              info(`🔔 ${newNotif.title}: ${newNotif.message}`);

              // 2. Browser native notification if permission granted
              if (
                typeof window !== 'undefined' &&
                'Notification' in window &&
                Notification.permission === 'granted'
              ) {
                try {
                  const browserTitle =
                    (newNotif.type === 'MATCH' || newNotif.type === 'MATCH_ALERT')
                      ? 'CampusFind — Potential Match Found'
                      : `CampusFind: ${newNotif.title}`;

                  const notificationInstance = new Notification(browserTitle, {
                    body: newNotif.message,
                    icon: '/vite.svg',
                  });

                  if (newNotif.link) {
                    notificationInstance.onclick = () => {
                      window.focus();
                      window.location.href = newNotif.link;
                    };
                  }
                } catch (bErr) {
                  console.warn('Failed to display browser notification:', bErr);
                }
              }
            }
          });
        },
        onStompError: (frame) => {
          console.warn('STOMP protocol error:', frame);
        },
      });

      stompClient.activate();
    } catch (e) {
      console.warn('WebSocket connection not initialized:', e);
    }

    return () => {
      if (stompClient) {
        try {
          stompClient.deactivate();
        } catch (e) {}
      }
    };
  }, [user, info]);

  const markAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await API.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await API.delete(`/notifications/${id}`);
      setNotifications((prev) => {
        const item = prev.find((n) => n.id === id);
        if (item && !item.isRead) {
          setUnreadCount((c) => Math.max(0, c - 1));
        }
        return prev.filter((n) => n.id !== id);
      });
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        lastEvent,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refreshNotifications: fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
