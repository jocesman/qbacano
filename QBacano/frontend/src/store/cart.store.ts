type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type CartState = {
  items: CartItem[];
};

const STORAGE_KEY = 'cart';

function loadCart(): CartState {
  if (typeof window === 'undefined') return { items: [] };

  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : { items: [] };
}

function saveCart(state: CartState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state: CartState = loadCart();

// 🔥 listeners (clave)
let listeners: Function[] = [];

function notify() {
  listeners.forEach((l) => l(state));
}

export const cartStore = {
  getState: () => state,

  subscribe(listener: Function) {
    listeners.push(listener);

    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },

  add(product: Omit<CartItem, 'quantity'>) {
    const existing = state.items.find((i) => i.id === product.id);

    if (existing) {
      existing.quantity += 1;
    } else {
      state.items.push({ ...product, quantity: 1 });
    }

    saveCart(state);
    notify(); // 🔥 clave
  },

  remove(id: string) {
    state.items = state.items.filter((i) => i.id !== id);
    saveCart(state);
    notify();
  },

  clear() {
    state.items = [];
    saveCart(state);
    notify();
  },
};