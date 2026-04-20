import { getProducts } from '@/services/products';
import { ProductList } from '@/components/ProductList';
import { Cart } from '@/components/Cart';

export default async function Home() {
  let products = [];

  try {
    products = await getProducts();
  } catch (error) {
    console.error('Error cargando productos:', error);
  }

  return (
    <main>
      <Cart />
      <ProductList products={products} />
    </main>
  );
}