import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import { getSocketOrigin } from '../config/api.js';
import * as execApi from '../api/executions.api';

const SocketContext = createContext(null);

export const resolveWorkspaceId = (user) => {
  const raw = user?.activeWorkspace ?? localStorage.getItem('activeWorkspace');
  if (!raw) return null;
  if (typeof raw === 'object' && raw !== null) {
    return String(raw._id ?? raw.id ?? '');
  }
  return String(raw);
};

const toLiveEntry = (payload) => ({
  executionId: payload.executionId,
  jobId: String(payload.jobId),
  jobName: payload.jobName,
  status: payload.status,
  statusCode: payload.statusCode,
  durationMs: payload.durationMs,
  executedAt: payload.executedAt,
});

export const SocketProvider = ({ children }) => {
  const user = useAuthStore((s) => s.user);
  const storeToken = useAuthStore((s) => s.token);
  const workspaceId = resolveWorkspaceId(user);
  const token = storeToken || localStorage.getItem('token');

  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [liveExecutions, setLiveExecutions] = useState([]);
  const [pendingJobs, setPendingJobs] = useState([]);
  const socketRef = useRef(null);

  const upsertLiveExecution = useCallback((payload) => {
    const entry = toLiveEntry(payload);
    setLiveExecutions((prev) => {
      const without = prev.filter(
        (p) => p.executionId !== entry.executionId && String(p.jobId) !== entry.jobId
      );
      return [entry, ...without].slice(0, 50);
    });
    setPendingJobs((prev) => prev.filter((id) => String(id) !== entry.jobId));
  }, []);

  const bootstrapRecentExecutions = useCallback(async () => {
    try {
      const res = await execApi.listExecutions({ limit: 20 });
      const rows = res.data?.executions ?? [];
      const mapped = rows.map((ex) =>
        toLiveEntry({
          executionId: ex._id,
          jobId: ex.job?._id ?? ex.job,
          jobName: ex.job?.name ?? 'Job',
          status: ex.status,
          statusCode: ex.statusCode,
          durationMs: ex.durationMs,
          executedAt: ex.executedAt,
        })
      );
      setLiveExecutions(mapped);
    } catch {
      // Non-fatal — socket may still deliver live events
    }
  }, []);

  useEffect(() => {
    if (!workspaceId || !token) {
      setSocket(null);
      setConnected(false);
      return undefined;
    }

    const origin = getSocketOrigin();
    const newSocket = io(origin, {
      auth: { token },
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
    });
    socketRef.current = newSocket;

    const joinWorkspace = () => {
      newSocket.emit('join:workspace', workspaceId);
    };

    newSocket.on('connect', () => {
      setConnected(true);
      joinWorkspace();
      bootstrapRecentExecutions();
    });

    newSocket.on('reconnect', () => {
      joinWorkspace();
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.warn('[Socket] connect_error:', err.message);
      setConnected(false);
    });

    newSocket.on('execution:queued', ({ jobId, jobName }) => {
      setPendingJobs((prev) => [...new Set([...prev, String(jobId)])]);
      setNotifications((prev) => [
        {
          id: `queued-${jobId}-${Date.now()}`,
          type: 'running',
          message: `Job "${jobName}" queued…`,
          time: new Date().toISOString(),
        },
        ...prev,
      ].slice(0, 20));
    });

    newSocket.on('execution:started', ({ jobId, jobName }) => {
      setPendingJobs((prev) => [...new Set([...prev, String(jobId)])]);
      setNotifications((prev) => [
        {
          id: `started-${jobId}-${Date.now()}`,
          type: 'running',
          message: `Job "${jobName}" running…`,
          time: new Date().toISOString(),
        },
        ...prev,
      ].slice(0, 20));
    });

    newSocket.on('execution:done', (payload) => {
      upsertLiveExecution(payload);
      setNotifications((prev) => [
        {
          id: payload.executionId || Date.now().toString(),
          type: payload.status,
          message: `Job "${payload.jobName}" finished ${payload.status} (${payload.statusCode ?? '—'}) in ${payload.durationMs}ms`,
          time: new Date().toISOString(),
        },
        ...prev,
      ].slice(0, 20));
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit('leave:workspace', workspaceId);
      newSocket.removeAllListeners();
      newSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
      setConnected(false);
    };
  }, [workspaceId, token, bootstrapRecentExecutions, upsertLiveExecution]);

  const clearNotifications = useCallback(() => setNotifications([]), []);

  const value = useMemo(
    () => ({
      socket,
      connected,
      notifications,
      liveExecutions,
      pendingJobs,
      clearNotifications,
      isJobPending: (jobId) => pendingJobs.includes(String(jobId)),
    }),
    [socket, connected, notifications, liveExecutions, pendingJobs, clearNotifications]
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return ctx;
};
