'use client';

import { useState } from 'react';
import { login } from '@/services/auth';
import { useAuth } from '@/hooks/useAuth';

export function LoginForm() {
  const { login: saveToken } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e: any) {
    e.preventDefault();

    try {
      const res = await login(email, password);

      // 👇 ajusta según tu backend
      saveToken(res.access_token);

      alert('Login correcto');
    } catch (err) {
      alert('Error login');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Admin Login</h2>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button type="submit">Entrar</button>
    </form>
  );
}