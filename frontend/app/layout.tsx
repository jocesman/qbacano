import './globals.css';

export const metadata = {
  title: 'Qbacano - Pedidos por WhatsApp',
  description: 'Selecciona productos y finaliza tu pedido por WhatsApp',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
