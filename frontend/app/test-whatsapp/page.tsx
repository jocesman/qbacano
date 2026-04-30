'use client';

import WhatsAppButton from '../../components/WhatsAppButton';

export default function TestPage() {
  // Reemplaza con un ID de pedido real de tu base de datos
  const orderId = 'pon-aqui-un-id-de-pedido-real';
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">🛒 Prueba de WhatsApp</h1>
      <p className="mb-6 text-gray-600">
        Pedido ID: <code className="bg-gray-100 px-2 py-1 rounded">{orderId}</code>
      </p>
      <WhatsAppButton orderId={orderId} storePhone="573001234567" />
      <p className="mt-4 text-sm text-gray-500">
        Nota: Debes haber iniciado sesión para que funcione el token.
      </p>
    </div>
  );
}
