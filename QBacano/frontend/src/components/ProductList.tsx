import { AddToCartButton } from './AddToCartButton';

type Product = {
  id: string;
  name: string;
  price: number;
};

export function ProductList({ products }: { products: Product[] }) {
  return (
    <div>
      <h1>Productos</h1>

      {products.map((p) => (
        <div key={p.id} style={{ border: '1px solid #ccc', margin: 10, padding: 10 }}>
          <h3>{p.name}</h3>
          <p>${p.price}</p>

          <AddToCartButton product={p} />
        </div>
      ))}
    </div>
  );
}