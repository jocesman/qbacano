'use client';

import { useEffect, useState } from 'react';
import { cartStore } from '@/store/cart.store';

export function useCart() {
  const [items, setItems] = useState(cartStore.getState().items);

  useEffect(() => {
    const unsubscribe = cartStore.subscribe((state: any) => {
      setItems([...state.items]);
    });

    return unsubscribe;
  }, []);

  function add(product: any) {
    cartStore.add(product);
  }

  function remove(id: string) {
    cartStore.remove(id);
  }

  function clear() {
    cartStore.clear();
  }

  return {
    items,
    add,
    remove,
    clear,
  };
}