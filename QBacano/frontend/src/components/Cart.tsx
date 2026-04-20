'use client';

import { useCart } from '@/hooks/useCart';
import { useEffect, useState } from 'react';

export function Cart() {
  const { items, remove, clear } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 🚨 IMPORTANTE: evitar render SSR
  if (!mounted) return null;

  return (
    <div>
      <h2>Carrito</h2>

      {items.length === 0 && <p>Vacío</p>}

      {items.map((item) => (
        <div key={item.id}>
          {item.name} x{item.quantity} - ${item.price}
          <button onClick={() => remove(item.id)}>Eliminar</button>
        </div>
      ))}

      {items.length > 0 && (
        <button onClick={clear}>Vaciar</button>
      )}
    </div>
  );
}