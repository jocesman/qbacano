import { request } from './api';

export async function getProducts() {
  return request('/products');
}   