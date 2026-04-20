'use client';

import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from '@/components/LoginForm';

export default function AdminPage() {
  const { isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div>
      <h1>Panel Admin</h1>

      <button onClick={logout}>Cerrar sesión</button>

      <p>Aquí irá tu dashboard</p>
    </div>
  );
}