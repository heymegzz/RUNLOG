import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export const useSocket = (workspaceId) => {
  const [liveLogs, setLiveLogs] = useState([]);

  useEffect(() => {
    if (!workspaceId) return;

    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: { token: localStorage.getItem('accessToken') },
    });

    socket.emit('join:workspace', workspaceId);

    socket.on('execution:done', (data) => {
      setLiveLogs((prev) => [data, ...prev].slice(0, 50));
    });

    return () => socket.disconnect();
  }, [workspaceId]);

  return liveLogs;
};
