import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const SocketContext = createContext(null);

export const SocketProvider = ({ children, userId }) => {
  const socketRef  = useRef(null);
  const [onlineUsers,   setOnlineUsers]   = useState([]);
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notif) => {
    setNotifications(prev => [notif, ...prev].slice(0, 50)); // keep last 50
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  useEffect(() => {
    if (!userId) return;

    const serverUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api')
      .replace('/api', '');

    socketRef.current = io(serverUrl, { withCredentials: true });
    const socket = socketRef.current;

    socket.emit('user:online', userId);

    socket.on('online:list', (list) => setOnlineUsers(list));

    socket.on('user:status', ({ userId: uid, isOnline }) => {
      setOnlineUsers(prev =>
        isOnline
          ? [...new Set([...prev, uid])]
          : prev.filter(id => id !== uid)
      );
    });

    // Friend request received → toast + store
    socket.on('friend:request:received', ({ message }) => {
      toast(`👋 ${message}`, { duration: 4000 });
      addNotification({ type: 'friend_request', message });
    });

    // Friend accepted → toast + store
    socket.on('friend:accepted:notify', ({ message }) => {
      toast.success(`✅ ${message}`);
      addNotification({ type: 'friend_accepted', message });
    });

    // Post liked / commented → toast + store
    socket.on('notification:new', ({ type, message }) => {
      const icon = type === 'like' ? '❤️' : '💬';
      toast(`${icon} ${message}`, { duration: 3000 });
      addNotification({ type, message });
    });

    return () => socket.disconnect();
  }, [userId, addNotification]);

  const isUserOnline = (uid) => onlineUsers.includes(uid);
  const emit = (event, data) => socketRef.current?.emit(event, data);

  return (
    <SocketContext.Provider value={{
      onlineUsers,
      isUserOnline,
      emit,
      notifications,
      clearNotifications
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
};
