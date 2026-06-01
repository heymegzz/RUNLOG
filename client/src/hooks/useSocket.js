import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import { getSocketOrigin } from '../config/api.js';

export const useSocket = () => {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const workspaceId = user?.activeWorkspace;
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [liveExecutions, setLiveExecutions] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!workspaceId || !token) return;

    const newSocket = io(getSocketOrigin(), {
      auth: { token },
      withCredentials: true,
    });
    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      newSocket.emit('join:workspace', workspaceId);
    });

    newSocket.on('execution:done', (payload) => {
      // Add to live executions log
      setLiveExecutions((prev) => [payload, ...prev].slice(0, 50));
      
      // Add to notifications
      setNotifications((prev) => [
        {
          id: Date.now().toString(),
          type: payload.status,
          message: `Job "${payload.jobName}" finished with status ${payload.status} (${payload.statusCode}) in ${payload.durationMs}ms`,
          time: new Date().toISOString(),
        },
        ...prev,
      ].slice(0, 20)); // Keep last 20
    });

    // We can also listen for 'job:updated' if we want to live-update the jobs list
    // newSocket.on('job:updated', (payload) => { ... });

    setSocket(newSocket);

    return () => {
      newSocket.emit('leave:workspace', workspaceId);
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [workspaceId, token]);

  const clearNotifications = () => setNotifications([]);

  return { socket, notifications, liveExecutions, clearNotifications };
};
