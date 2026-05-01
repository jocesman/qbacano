import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-700">🛒 Qbacano</h1>
          <div className="flex gap-2">
            <Link 
              href="/login"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded"
            >
              Iniciar Sesión
            </Link>
            <Link 
              href="/register"
              className="border border-emerald-600 text-emerald-700 px-4 py-2 rounded hover:bg-emerald-50"
            >
              Registrarse
            </Link>
          </div>
        </header>

        {/* Contenido principal */}
        <section className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🍽️ Nuestros Restaurantes</h2>
          <p className="text-gray-600 mb-4">
            Selecciona productos, agrégalos al carrito y finaliza tu pedido por WhatsApp.
          </p>
          
          <div className="flex gap-3">
            <Link
              href="/test-whatsapp"
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              📱 Probar WhatsApp
            </Link>
            <Link
              href="/products"
              className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-4 py-2 rounded"
            >
              🛍️ Ver Productos
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm mt-8">
          <p>© 2026 Qbacano - Pedidos fáciles por WhatsApp</p>
        </footer>
      </div>
    </main>
  );
}
