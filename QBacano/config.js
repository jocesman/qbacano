/**
 * CONFIGURACIÓN DE LA APLICACIÓN
 * 
 * IMPORTANTE: En producción, estas credenciales deberían estar en variables de entorno
 * y ser servidas a través de un backend seguro, NO expuestas en el frontend.
 * 
 * Para desarrollo local, puedes modificar estos valores aquí.
 * Para producción, considera:
 * 1. Usar un backend (Node.js, PHP, etc.) que gestione las credenciales
 * 2. Usar Netlify/Vercel functions para proxies de API
 * 3. Implementar autenticación del lado del servidor
 */

export const CONFIG = {
  // ===== SUPABASE =====
  supabase: {
    url: 'https://iuaqxtadhkgcsjhyeybk.supabase.co',
    // ⚠️ Esta es la clave ANÓNIMA (pública), segura para usar en frontend
    // La clave SERVICE_ROLE (secreta) NUNCA debe estar en el frontend
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1YXF4dGFkaGtnY3NqaHlleWJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzNTQ1NzIsImV4cCI6MjA5MDkzMDU3Mn0.9i8pbPKA7QqQqkssZnVZpeO-_hhLeNLUPl_KSIEouFs'
  },

  // ===== WHATSAPP =====
  whatsapp: {
    businessPhone: '529812100778' // Número de la empresa
  },

  // ===== MERCADO PAGO (CREDENCIALES DE PRUEBA) =====
  // ⚠️ En producción, usar credenciales REALES y gestionarlas desde backend
  mercadoPago: {
    publicKey: 'TEST-1234567890123456-123456-1234567890123456789012345678901234567890',
    accessToken: 'TEST-123456789012345678901234567890-123456789'
  },

  // ===== SESIÓN DE ADMINISTRADOR =====
  session: {
    duration: 10 * 60 * 1000, // 10 minutos (en milisegundos)
    warningTime: 2 * 60 * 1000 // Advertir 2 minutos antes de expirar
  },

  // ===== IMÁGENES =====
  images: {
    fallback: 'img/logo.png',
    placeholder: 'img/logo.png'
  }
};

// Exportar configuraciones individuales para facilitar el uso
export const SUPABASE_URL = CONFIG.supabase.url;
export const SUPABASE_ANON_KEY = CONFIG.supabase.anonKey;
export const WHATSAPP_PHONE = CONFIG.whatsapp.businessPhone;
export const MP_PUBLIC_KEY = CONFIG.mercadoPago.publicKey;
export const MP_ACCESS_TOKEN = CONFIG.mercadoPago.accessToken;
export const SESSION_DURATION = CONFIG.session.duration;
export const IMAGE_FALLBACK = CONFIG.images.fallback;