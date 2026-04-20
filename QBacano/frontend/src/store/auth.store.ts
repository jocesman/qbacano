const STORAGE_KEY = 'admin_token';

let token: string | null =
  typeof window !== 'undefined'
    ? localStorage.getItem(STORAGE_KEY)
    : null;

let listeners: Function[] = [];

function notify() {
  listeners.forEach((l) => l(token));
}

export const authStore = {
  getToken: () => token,

  setToken(newToken: string) {
    token = newToken;
    localStorage.setItem(STORAGE_KEY, newToken);
    notify();
  },

  logout() {
    token = null;
    localStorage.removeItem(STORAGE_KEY);
    notify();
  },

  subscribe(listener: Function) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },
};