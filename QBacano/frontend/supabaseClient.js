import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js'

/**
 * Cliente de Supabase configurado
 * 
 * NOTA DE SEGURIDAD:
 * - Usamos la clave ANÓNIMA (anonKey) que es segura para el frontend
 * - Esta clave tiene permisos limitados por las Row Level Security (RLS) policies
 * - La clave SERVICE_ROLE (secreta) NUNCA debe exponerse en el frontend
 * 
 * Para mayor seguridad en producción:
 * 1. Configurar correctamente las RLS policies en Supabase
 * 2. Usar un backend para operaciones sensibles
 * 3. Implementar autenticación de usuarios
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)