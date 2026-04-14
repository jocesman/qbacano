import { CONFIG as devConfig } from './config.dev.js';
import { CONFIG as prodConfig } from './config.prod.js';

const isLocalhost =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1';

export const CONFIG = isLocalhost ? devConfig : prodConfig;
export const API_BASE_URL = CONFIG.api.baseUrl;
export const WHATSAPP_PHONE = CONFIG.whatsapp.businessPhone;
export const SESSION_DURATION = CONFIG.session.duration;
export const IMAGE_FALLBACK = CONFIG.images.fallback;