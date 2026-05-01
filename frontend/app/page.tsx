'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Verificar si hay sesión
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.refresh();
  };

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-700">🛒 Qbacano</h1>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-gray-700">Hola, {user.name}</span>
              <button 
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                Salir
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button 
                onClick={() => router.push('/login')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded"
              >
                Iniciar Sesión
              </button>
              <button 
                onClick={() => router.push('/register')}
                className="border border-emerald-600 text-emerald-700 px-4 py-2 rounded hover:bg-emerald-50"
              >
                Registrarse
              </button>
            </div>
          )}
        </header>

        {/* Contenido principal */}
        <section className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🍽️ Nuestros Restaurantes</h2>
          <p className="text-gray-600 mb-4">
            Selecciona productos, agrégalos al carrito y finaliza tu pedido por WhatsApp.
          </p>
          
          {/* Botón de prueba rápida */}
          <div className="flex gap-3">
            <button 
              onClick={() => router.push('/test-whatsapp')}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              📱 Probar WhatsApp
            </button>
            <button 
              onClick={() => router.push('/products')}
              className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-4 py-2 rounded"
            >
              🛍️ Ver Productos
            </button>
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
