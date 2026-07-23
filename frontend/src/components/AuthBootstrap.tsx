import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export default function AuthBootstrap() {
  const loadUser = useAuthStore((s) => s.loadUser);

  useEffect(() => {
    if (localStorage.getItem('accessToken')) {
      loadUser();
    }
  }, [loadUser]);

  return null;
}
