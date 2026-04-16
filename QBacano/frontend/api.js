/**
 * API CLIENT - Conecta el frontend con el backend
 */
import { API_BASE_URL } from './config/index.js';

let adminToken = '';

export function setAdminToken(token = '') {
  adminToken = token;
}

function authHeaders(extraHeaders = {}) {
  return adminToken
    ? { ...extraHeaders, Authorization: `Bearer ${adminToken}` }
    : extraHeaders;
}

async function readErrorMessage(response, fallbackMessage) {
  let message = fallbackMessage;
  try {
    const payload = await response.json();
    if (payload?.message) {
      message = Array.isArray(payload.message)
        ? payload.message.join(', ')
        : payload.message;
    }
  } catch {
    // noop
  }
  return message;
}

// ===== PRODUCTOS =====
export async function fetchProducts() {
  const response = await fetch(`${API_BASE_URL}/products`);
  if (!response.ok) throw new Error('Error al obtener productos');
  return response.json();
}

export async function fetchProductById(id) {
  const response = await fetch(`${API_BASE_URL}/products/${id}`);
  if (!response.ok) throw new Error('Error al obtener producto');
  return response.json();
}

export async function searchProducts(query) {
  const response = await fetch(`${API_BASE_URL}/products/search/${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error('Error al buscar productos');
  return response.json();
}

export async function createProduct(product) {
  const response = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(product)
  });
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Error al crear producto'));
  }
  return response.json();
}

export async function updateProduct(id, product) {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'PUT',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(product)
  });
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Error al actualizar producto'));
  }
  return response.json();
}

export async function updateProductAvailability(id, available) {
  const response = await fetch(`${API_BASE_URL}/products/${id}/availability`, {
    method: 'PUT',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ available })
  });
  if (!response.ok) throw new Error('Error al actualizar disponibilidad');
  return response.json();
}

export async function deleteProduct(id) {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error('Error al eliminar producto');
  return response.json();
}

// ===== ÓRDENES =====
export async function fetchOrders(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.append('dateTo', filters.dateTo);
  
  const response = await fetch(`${API_BASE_URL}/orders?${params}`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error('Error al obtener órdenes');
  return response.json();
}

export async function createOrder(orderData) {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  });
  if (!response.ok) throw new Error('Error al crear orden');
  return response.json();
}

export async function updateOrderStatus(id, status) {
  const response = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
    method: 'PUT',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ status })
  });
  if (!response.ok) throw new Error('Error al actualizar estado');
  return response.json();
}

// ===== ADMIN =====
export async function validateAdminKey(key) {
  const response = await fetch(`${API_BASE_URL}/admin/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key })
  });
  if (!response.ok) throw new Error('Error de conexión');
  return response.json();
}

// ===== ESTADÍSTICAS =====
export async function fetchStats(filters = {}) {
  const params = new URLSearchParams();
  if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.append('dateTo', filters.dateTo);
  
  const response = await fetch(`${API_BASE_URL}/stats?${params}`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error('Error al obtener estadísticas');
  return response.json();
}

export async function setAllProductsAvailable() {
  const response = await fetch(`${API_BASE_URL}/products/all/available`, {
    method: 'PUT',
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error('Error al actualizar disponibilidad global');
  return response.json();
}

export async function getUploadSignature(folder = 'qbacano/products') {
  const response = await fetch(`${API_BASE_URL}/uploads/sign`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ folder }),
  });

  if (!response.ok) {
    let message = 'Error al firmar subida de imagen';
    try {
      const payload = await response.json();
      if (payload?.message) {
        message = Array.isArray(payload.message)
          ? payload.message.join(', ')
          : payload.message;
      }
    } catch {
      // noop
    }
    throw new Error(message);
  }
  return response.json();
}
