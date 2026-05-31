import { useEffect, useState } from 'react';
import { getMe } from '../api/auth.api';
import useAuthStore from '../store/authStore';

export const useAuth = () => {
  const { user, isAuthenticated, setUser, logout } = useAuthStore();
  const [loading, setLoading] = useState(!user && isAuthenticated);

  useEffect(() => {
    if (isAuthenticated && !user) {
      getMe()
        .then((res) => setUser(res.data.data))
        .catch(() => logout())
        .finally(() => setLoading(false));
    }
  }, [isAuthenticated, user, setUser, logout]);

  return { user, isAuthenticated, loading };
};
