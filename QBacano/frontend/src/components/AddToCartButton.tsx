'use client';

import { useCart } from '@/hooks/useCart';

export function AddToCartButton({ product }: any) {
  const { add } = useCart();

  return (
    <button onClick={() => add(product)}>
      Agregar
    </button>
  );
}