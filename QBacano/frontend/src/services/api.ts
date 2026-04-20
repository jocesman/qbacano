import { authStore } from '@/store/auth.store';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
export async function request(path: string, options?: RequestInit) {
  const token = authStore.getToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Error en API');
  }

  return res.json();
}