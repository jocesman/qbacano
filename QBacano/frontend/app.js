import * as api from './api.js';
import {
  API_BASE_URL,
  WHATSAPP_PHONE,
  SESSION_DURATION,
  IMAGE_FALLBACK
} from './config/index.js';

// ===== VARIABLES GLOBALES =====
const STORAGE_CART = 'qbacano_cart';
const STORAGE_PRODUCTS = 'qbacano_products';
const STORAGE_ADMIN = 'qbacano_admin_settings';
const STORAGE_ADMIN_TOKEN = 'qbacano_admin_token';
const MAX_IMAGE_UPLOAD_BYTES = 2 * 1024 * 1024;

let cart = [];
let products = [];
let isAdmin = false;
let deferredPrompt = null;
let adminSessionTimeout = null;
let sourceProducts = [];
let categories = [];

// ===== UTILIDADES =====
function getElement(id) {
  return document.getElementById(id);
}

function isMobile() {
  return window.innerWidth <= 768;
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const subirImagenCloudinary = async (file) => {
  if (!file) return null;
  if (!file.type.startsWith('image/')) {
    throw new Error('Solo se permiten archivos de imagen.');
  }
  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    throw new Error('La imagen supera 2MB.');
  }

  const signature = await api.getUploadSignature();
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', signature.apiKey);
  formData.append('timestamp', String(signature.timestamp));
  formData.append('signature', signature.signature);
  formData.append('folder', signature.folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`,
    { method: 'POST', body: formData },
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'No se pudo subir imagen');

  return { secureUrl: data.secure_url, publicId: data.public_id };
};

function adjustTouchTargets() {
  const buttons = document.querySelectorAll('button, .btn, [role=\"button\"]');
  buttons.forEach(btn => {
    const style = window.getComputedStyle(btn);
    if (parseInt(style.minHeight) < 44 || parseInt(style.minWidth) < 44) {
      btn.style.minHeight = '44px';
      btn.style.minWidth = '44px';
    }
  });
}

window.addEventListener('load', adjustTouchTargets);
window.addEventListener('resize', () => {
  clearTimeout(window.resizeTimer);
  window.resizeTimer = setTimeout(adjustTouchTargets, 250);
});

// ===== PRODUCTOS POR DEFECTO (FALLBACK) =====
const defaultProducts = [
  {
    id: 'emp1',
    category: 'empanadas',
    name: 'Empanada Carne',
    description: 'Carne molida jugosa con cebolla, pimiento y un toque de comino.',
    price: 2.5,
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80',
    available: true,
    is_combo: false,
  },
  {
    id: 'emp2',
    category: 'empanadas',
    name: 'Empanada Queso',
    description: 'Queso derretido y jamón de primera, horneadas a la perfección.',
    price: 2.5,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80',
    available: true,
    is_combo: false,
  },
];

const defaultCategories = [
  { id: 'cat-empanadas', slug: 'empanadas', title: 'Empanadas Artesanales', is_active: true },
  { id: 'cat-salchipapas', slug: 'salchipapas', title: "Salchipapas Q'Bacano", is_active: true },
  { id: 'cat-postres', slug: 'postres', title: 'Postres Caseros', is_active: true },
  { id: 'cat-extras', slug: 'extras', title: 'Extras', is_active: true },
  { id: 'cat-bebidas', slug: 'bebidas', title: 'Bebidas', is_active: true },
];

// ===== STORAGE =====
function loadCart() {
  const saved = localStorage.getItem(STORAGE_CART);
  cart = saved ? JSON.parse(saved) : [];
}

function saveCart() {
  localStorage.setItem(STORAGE_CART, JSON.stringify(cart));
}

function saveProducts() {
  localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(products));
}

function loadAdminSettings() {
  const token = localStorage.getItem(STORAGE_ADMIN_TOKEN) || '';
  if (token) {
    api.setAdminToken(token);
  }
}

function saveAdminSettings() {
  // reservado para configuraciones futuras
}

// ===== CARGA DE PRODUCTOS (BACKEND) =====
async function fetchProductsFromDB() {
  console.log('🔄 Conectando al backend...');
  
  try {
    const data = await api.fetchProducts();
    console.log('✅ Productos cargados:', data.length);
    
    return data.map(product => ({
      id: String(product.id),
      category: String(product.category || '').toLowerCase().trim(),
      name: product.name,
      description: product.description,
      price: parseFloat(product.price),
      image: product.image_url || IMAGE_FALLBACK,
      available: product.available ?? true,
      is_combo: product.is_combo ?? false,
    }));
  } catch (error) {
    console.error('❌ Error conectando al backend:', error);
    throw error;
  }
}

async function loadProducts() {
  const saved = localStorage.getItem(STORAGE_PRODUCTS);
  if (saved) {
    products = JSON.parse(saved);
  }

  try {
    const dbProducts = await fetchProductsFromDB();
    if (dbProducts.length > 0) {
      products = dbProducts;
      sourceProducts = dbProducts.slice();
      saveProducts();
    } else if (!products.length) {
      products = defaultProducts.slice();
      sourceProducts = products.slice();
      saveProducts();
      showNotification('No hay productos en la base de datos. Usando menú local.');
    }
  } catch (error) {
    console.error('Error cargando productos:', error);
    if (!products.length) {
      products = defaultProducts.slice();
      sourceProducts = products.slice();
      saveProducts();
    }
    showNotification('No fue posible conectar con el servidor. Usando datos locales.');
  }
  sourceProducts = products.slice();
}

async function loadCategories() {
  try {
    const data = isAdmin ? await api.fetchAllCategories() : await api.fetchCategories();
    categories = (data || []).map((category) => ({
      id: String(category.id),
      slug: String(category.slug || '').toLowerCase().trim(),
      title: category.title || category.slug,
      is_active: category.is_active !== false,
    }));
    if (!categories.length) {
      categories = defaultCategories.slice();
    }
  } catch (error) {
    console.error('Error cargando categorías:', error);
    categories = defaultCategories.slice();
  }
}

// ===== CRUD PRODUCTOS (BACKEND) =====
async function createProductInDB(product) {
  const data = await api.createProduct(product);
  return data;
}

async function updateProductInDB(product) {
  await api.updateProduct(product.id, {
    category: product.category,
    name: product.name,
    description: product.description,
    price: product.price,
    image_url: product.image,
    image_public_id: product.image_public_id,
    available: product.available,
    is_combo: product.is_combo,
  });
}

async function deleteProductInDB(productId) {
  await api.deleteProduct(productId);
}

async function updateProductAvailabilityInDB(productId, available) {
  await api.updateProductAvailability(productId, available);
}

async function createCategoryInDB(category) {
  return api.createCategory(category);
}

async function updateCategoryStatusInDB(categoryId, isActive) {
  return api.updateCategoryStatus(categoryId, isActive);
}



// ===== RENDERIZADO =====
function renderMenu() {
  const searchInput = getElement('searchInput');
  const searchTerm = (searchInput?.value || '').toLowerCase().trim();
  const searchResultsContainer = getElement('search-results-container');
  const menuCategories = getElement('menu-categories');
  const activeCategorySlugs = new Set(
    categories.filter((category) => category.is_active).map((category) => category.slug),
  );
  const visibleProducts = products.filter((product) =>
    activeCategorySlugs.has(String(product.category)),
  );

  if (searchTerm.length > 0) {
    if (menuCategories) menuCategories.classList.add('hidden');
    if (searchResultsContainer) {
      searchResultsContainer.classList.remove('hidden');
      
      const filteredProducts = visibleProducts
        .map(product => {
          const name = (product.name || '').toLowerCase();
          const desc = (product.description || '').toLowerCase();
          const category = (product.category || '').toLowerCase();

          let score = 0;
          if (name.includes(searchTerm)) score += 5;
          if (desc.includes(searchTerm)) score += 3;
          if (category.includes(searchTerm)) score += 2;
          if (product.available) score += 2;
          if (product.is_combo) score += 1;

          return { ...product, score };
        })
        .filter(p => p.score > 0)
        .sort((a, b) => b.score - a.score);

      const searchResultsGrid = getElement('searchResultsGrid');
      const noResultsMsg = getElement('noResultsMsg');

      if (filteredProducts.length > 0) {
        if (noResultsMsg) noResultsMsg.classList.add('hidden');
        if (searchResultsGrid) {
          searchResultsGrid.innerHTML = filteredProducts.map(product => createProductCardHTML(product)).join('');
        }
      } else {
        if (searchResultsGrid) searchResultsGrid.innerHTML = '';
        if (noResultsMsg) noResultsMsg.classList.remove('hidden');
      }
    }
  } else {
    if (menuCategories) menuCategories.classList.remove('hidden');
    if (searchResultsContainer) searchResultsContainer.classList.add('hidden');
    renderDynamicCategorySections(visibleProducts);
  }
  
  renderAdminProductList();
  renderAdminCategoryList();
  renderCategoryOptions();
}

function createProductCardHTML(product, isTop = false) {
  const isAvailable = product.available !== false;
  const isCombo = product.is_combo === true;
  
  return `
    <div class="menu-item ${!isAvailable ? 'unavailable' : ''}" data-product-id="${product.id}">
      ${isTop ? '<div class="product-badge available-badge">🔥 Más Popular</div>' : ''}
      <img 
        src="${product.image || IMAGE_FALLBACK}" 
        alt="${escapeHtml(product.name)}" 
        loading="lazy"
        decoding="async"
        onerror="this.src='${IMAGE_FALLBACK}'"
      >
      <div class="menu-content">
        <h3>${escapeHtml(product.name)}</h3>
        <p>${escapeHtml(product.description)}</p>
        <div class="price">$${product.price.toFixed(2)}</div>
        <div class="product-actions">
          <button type="button" class="btn-add-cart" data-action="add-to-cart" data-product-id="${product.id}" ${isAvailable ? '' : 'disabled'}>🔥 Pedir ahora</button>
          <button type="button" class="toggle-availability admin-only hidden" data-action="toggle-availability" data-product-id="${product.id}">🔘 Activar/Desactivar</button>
          <button type="button" class="btn btn-secondary admin-only hidden" data-action="edit" data-product-id="${product.id}">✏️ Editar</button>
          <button type="button" class="btn btn-danger admin-only hidden" data-action="delete" data-product-id="${product.id}">🗑️ Eliminar</button>
        </div>
      </div>
    </div>
  `;
}

function renderDynamicCategorySections(visibleProducts) {
  const menuCategories = getElement('menu-categories');
  if (!menuCategories) return;

  const activeCategories = categories.filter((category) => category.is_active);

  if (!activeCategories.length) {
    menuCategories.innerHTML = '<p class="empty-message">No hay categorías activas en este momento.</p>';
    return;
  }

  menuCategories.innerHTML = activeCategories
    .map((category) => {
      const categoryProducts = visibleProducts
        .filter((product) => product.category === category.slug)
        .sort((a, b) => b.price - a.price);

      const cards =
        categoryProducts.length > 0
          ? categoryProducts
              .map((product, index) => createProductCardHTML(product, index === 0))
              .join('')
          : '<p class="empty-message">No hay productos en esta categoría todavía.</p>';

      return `
        <h2 class="section-title">${escapeHtml(category.title)}</h2>
        <div class="menu-grid">${cards}</div>
      `;
    })
    .join('');
}

function renderAdminProductList() {
  const list = getElement('adminProductList');
  if (!list) return;
  if (!products.length) {
    list.innerHTML = '<p style="text-align:center;color:var(--gray);padding:2rem;font-size:0.9rem;">No hay productos para administrar.</p>';
    return;
  }
  list.innerHTML = products.map(product => `
    <div class="admin-item" data-product-id="${product.id}">
      <img
        class="admin-item__thumb"
        src="${product.image || IMAGE_FALLBACK}"
        alt="${escapeHtml(product.name)}"
        onerror="this.src='${IMAGE_FALLBACK}'"
      >
      <div class="admin-item__body">
        <div class="admin-item__name">
          ${escapeHtml(product.name)}
          ${product.is_combo ? '<span class="admin-item__badge">🔥 Combo</span>' : ''}
        </div>
        <div class="admin-item__meta">${escapeHtml(product.category)}</div>
        <div class="admin-item__price">$${product.price.toFixed(2)}</div>
      </div>
      <div class="admin-item__actions">
        <button type="button" class="aib aib--edit" data-action="edit" data-product-id="${product.id}">✏️ Editar</button>
        <button type="button" class="aib aib--delete" data-action="delete" data-product-id="${product.id}">🗑️ Eliminar</button>
        <button type="button" class="aib ${product.available ? 'aib--on' : 'aib--off'}" data-action="toggle-availability" data-product-id="${product.id}">
          ${product.available ? '✅ Disponible' : '⛔ Agotado'}
        </button>
      </div>
    </div>
  `).join('');
}

function renderAdminCategoryList() {
  const list = getElement('adminCategoryList');
  if (!list) return;

  if (!categories.length) {
    list.innerHTML = '<p style="text-align:center;color:var(--gray);padding:2rem;font-size:0.9rem;">No hay categorías registradas.</p>';
    return;
  }

  list.innerHTML = categories.map(category => `
    <div class="admin-item" data-category-id="${category.id}">
      <div class="admin-item__icon">${getCategoryIcon(category.slug)}</div>
      <div class="admin-item__body">
        <div class="admin-item__name">
          ${escapeHtml(category.title)}
          ${!category.is_active ? '<span class="admin-item__badge admin-item__badge--inactive">Inactiva</span>' : ''}
        </div>
        <div class="admin-item__meta">/${escapeHtml(category.slug)}</div>
      </div>
      <div class="admin-item__actions">
        <button type="button" class="aib aib--edit" data-action="edit-category" data-category-id="${category.id}" data-category-title="${category.title}" data-category-slug="${category.slug}">✏️ Editar</button>
        <button type="button" class="aib aib--delete" data-action="delete-category" data-category-id="${category.id}" data-category-title="${category.title}">🗑️ Eliminar</button>
        <button type="button" class="aib ${category.is_active ? 'aib--on' : 'aib--off'}" data-action="toggle-category" data-category-id="${category.id}" data-category-active="${category.is_active}">
          ${category.is_active ? '✅ Activa' : '⛔ Inactiva'}
        </button>
      </div>
    </div>
  `).join('');
}

function getCategoryIcon(slug) {
  const icons = {
    'empanadas': '🥟',
    'salchipapas': '🍟',
    'postres': '🍮',
    'bebidas': '🥤',
    'extras': '➕',
    'combos': '🔥',
    'desayunos': '🍳',
    'almuerzos': '🍽️',
    'snacks': '🧆',
    'ensaladas': '🥗',
    'sopas': '🍲',
    'carnes': '🥩',
    'mariscos': '🦐',
    'vegetariano': '🥦',
  };
  return icons[slug] || '🏷️';
}

function renderCategoryOptions() {
  const categorySelect = getElement('productCategory');
  if (!categorySelect) return;

  const selected = categorySelect.value;

  categorySelect.innerHTML = categories
    .map(
      (category) =>
        `<option value="${escapeHtml(category.slug)}">${escapeHtml(category.title)}${category.is_active ? '' : ' (inactiva)'}</option>`,
    )
    .join('');

  if (selected && categories.some((category) => category.slug === selected)) {
    categorySelect.value = selected;
  } else if (categories.length > 0) {
    categorySelect.value = categories[0].slug;
  }
}

// ===== BÚSQUEDA =====
function setupSearch() {
  const input = getElement('searchInput');
  const clearBtn = getElement('clearSearch');

  if (!input) return;

  input.addEventListener('input', async () => {
  const value = input.value.trim();

  if (clearBtn) {
    clearBtn.classList.toggle('hidden', value.length === 0);
  }

  if (value.length === 0) {
    products = sourceProducts.slice();
    renderMenu();
    return;
  }

  try {
    const results = await api.searchProducts(value);
    const normalized = results.map(product => ({
      id: String(product.id),
      category: String(product.category || '').toLowerCase().trim(),
      name: product.name,
      description: product.description,
      price: parseFloat(product.price),
      image: product.image_url || IMAGE_FALLBACK,
      available: product.available ?? true,
      is_combo: product.is_combo ?? false,
    }));
    products = normalized;
    renderMenu();
  } catch (error) {
    console.error('Error en búsqueda:', error);
  }
});

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      input.value = '';
      clearBtn.classList.add('hidden');
      products = sourceProducts.slice();
      renderMenu();
      input.focus();
    });
  }
}

// ===== CARRITO =====
function addToCart(productId) {
  const product = products.find(item => item.id === productId);

  if (!product) {
    alert('Producto no encontrado');
    return;
  }

  if (!product.available) {
    alert('Este producto no está disponible');
    return;
  }

  const existingItem = cart.find(item => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ 
      id: product.id, 
      name: product.name, 
      price: product.price, 
      quantity: 1 
    });
  }

  saveCart();
  updateCartUI();
  showNotification(`${product.name} agregado al carrito`);

  // Sugerir combo
  if (!product.is_combo) {
    const combo = products.find(p => 
      p.is_combo &&
      p.category === product.category &&
      p.price > product.price
    );

    if (combo) {
      setTimeout(() => {
        const confirmUpgrade = confirm(
          `🔥 Mejora tu pedido

Por solo $${(combo.price - product.price).toFixed(2)} más puedes llevar:
${combo.name}

¿Quieres cambiarlo?`
        );

        if (confirmUpgrade) {
          cart = cart.filter(item => item.id !== product.id);
          cart.push({ 
            id: combo.id, 
            name: combo.name, 
            price: combo.price, 
            quantity: 1 
          });

          saveCart();
          updateCartUI();
        }
      }, 500);
    }
  }

  // Extras
  const activeCategorySlugs = new Set(
    categories.filter((category) => category.is_active).map((category) => category.slug),
  );
  const extras = products.filter(
    (p) =>
      (p.category === 'extras' || p.category === 'bebidas') &&
      activeCategorySlugs.has(String(p.category)),
  );
  if (extras.length > 0) {
    setTimeout(async () => {
      const selectedExtras = await showExtrasModal(extras);
      
      if (selectedExtras && selectedExtras.length > 0) {
        selectedExtras.forEach(extra => {
          const existingExtra = cart.find(item => item.id === extra.id);
          
          if (existingExtra) {
            existingExtra.quantity += 1;
          } else {
            cart.push({
              id: extra.id,
              name: extra.name,
              price: extra.price,
              quantity: 1
            });
          }
        });
        
        saveCart();
        updateCartUI();
        showNotification(`${selectedExtras.length} extra(s) agregado(s) 🔥`);
      }
    }, 800);
  }
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
  updateCartUI();
}

function updateQuantity(index, change) {
  cart[index].quantity += change;
  if (cart[index].quantity <= 0) {
    removeFromCart(index);
  } else {
    saveCart();
    updateCartUI();
  }
}

function updateCartUI() {
  const cartItems = getElement('cartItems');
  const cartTotal = getElement('cartTotal');
  const totalAmount = getElement('totalAmount');
  const cartEmpty = document.querySelector('.cart-empty');
  const paymentMethods = getElement('paymentMethods');

  if (cart.length === 0) {
    cartEmpty?.classList.remove('hidden');
    cartItems?.classList.add('hidden');
    cartTotal?.classList.add('hidden');
    paymentMethods?.classList.add('hidden');
    return;
  }

  cartEmpty?.classList.add('hidden');
  cartItems?.classList.remove('hidden');
  cartTotal?.classList.remove('hidden');

  if (cartItems) {
    cartItems.innerHTML = cart.map((item, index) => `
      <div class=\"cart-item\">
        <div class=\"cart-item-info\">
          <h4>${item.name}</h4>
          <div class=\"cart-item-price\">$${item.price.toFixed(2)} c/u</div>
        </div>
        <div class=\"cart-item-controls\">
          <button class=\"qty-btn\" onclick=\"updateQuantity(${index}, -1)\">-</button>
          <span>${item.quantity}</span>
          <button class=\"qty-btn\" onclick=\"updateQuantity(${index}, 1)\">+</button>
          <button class=\"remove-btn\" onclick=\"removeFromCart(${index})\">Eliminar</button>
        </div>
      </div>
    `).join('');
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (totalAmount) totalAmount.textContent = total.toFixed(2);
  paymentMethods?.classList.remove('hidden');
  updateWhatsAppLink(total);
}

function updateWhatsAppLink(total) {
  const customerName = getElement('customerName')?.value.trim() || 'No especificado';
  const customerPhone = getElement('customerPhone')?.value.trim() || 'No especificado';
  const customerAddress = getElement('customerAddress')?.value.trim() || 'No especificado';
  
  // Generar fecha y hora actual
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  
  // Formatear items con mejor estructura
  const items = cart.map((item, index) => {
    const itemTotal = (item.price * item.quantity).toFixed(2);
    return `${index + 1}. ${item.name}\n   ${item.quantity}x $${item.price.toFixed(2)} = $${itemTotal}`;
  }).join('\n\n');

  const message = `*Sabores Q'Bacano - Nuevo Pedido* 

*Fecha:* ${dateStr} | ${timeStr}
*Pedido ID:* #${Date.now().toString().slice(-6)}

*Datos del Cliente:*
*Nombre:* ${customerName}
*Teléfono:* ${customerPhone}
*Dirección:* ${customerAddress}

*Detalles del Pedido:*
${items}

*Resumen:*
*Subtotal Productos:* $${total.toFixed(2)}
*Costo de Envío:* Según zona (confirmar al momento)
*Forma de Pago:* Efectivo / Transferencia

*Total Estimado:* $${total.toFixed(2)} + envío

---

*Tiempo estimado de preparación:* 25-35 minutos
*Medio de entrega:* Delivery (Mandadito) / Recoger en local

*Por favor confirma tu pedido para comenzar con la preparación.*
*¡Gracias por tu preferencia!* 

*Sabores Q'Bacano - Street Food*`;

  const waUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
  
  const paymentWhatsAppBtn = getElement('paymentWhatsAppBtn');
  if (paymentWhatsAppBtn) paymentWhatsAppBtn.href = waUrl;
}

// ===== WHATSAPP MODAL =====
function isContactDataValid() {
  const name = getElement('customerName')?.value.trim();
  const phone = getElement('customerPhone')?.value.trim();
  const address = getElement('customerAddress')?.value.trim();
  return Boolean(name && phone && address);
}

function getContactValidationMessage() {
  const missing = [];
  if (!getElement('customerName')?.value.trim()) missing.push('Nombre');
  if (!getElement('customerPhone')?.value.trim()) missing.push('Teléfono / WhatsApp');
  if (!getElement('customerAddress')?.value.trim()) missing.push('Dirección');

  return missing.length
    ? `Faltan datos: ${missing.join(', ')}. Completa los campos antes de enviar.`
    : 'Revisa tu pedido y confirma para enviarlo por WhatsApp.';
}

function populateWhatsAppModal() {
  const summaryList = getElement('whatsapp-order-summary');
  const summaryTotal = getElement('whatsapp-summary-total');
  const message = getElement('whatsapp-confirm-message');

  if (!summaryList || !summaryTotal || !message) return;

  if (cart.length === 0) {
    summaryList.innerHTML = '<li>Tu carrito está vacío.</li>';
    summaryTotal.textContent = '0.00';
  } else {
    summaryList.innerHTML = cart.map(item => `
      <li>${item.quantity} x ${item.name} - $${(item.price * item.quantity).toFixed(2)}</li>
    `).join('');
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    summaryTotal.textContent = total.toFixed(2);
  }

  message.textContent = getContactValidationMessage();
}

function openWhatsAppConfirmModal() {
  const modal = getElement('whatsapp-confirm-modal');
  if (!modal) return;
  populateWhatsAppModal();
  modal.classList.remove('hidden');
}

function closeWhatsAppConfirmModal() {
  const modal = getElement('whatsapp-confirm-modal');
  if (modal) modal.classList.add('hidden');
}

function handleWhatsAppOrder(event) {
  event.preventDefault();
  if (cart.length === 0) {
    alert('Tu carrito está vacío');
    return;
  }
  openWhatsAppConfirmModal();
}

async function handleWhatsAppConfirm() {
  if (!isContactDataValid()) {
    const message = getElement('whatsapp-confirm-message');
    if (message) message.textContent = getContactValidationMessage();
    showNotification('Por favor completa los datos de contacto antes de enviar.');
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  updateWhatsAppLink(total);

  // Guardar pedido en backend
  await saveOrderToBackend();

  const paymentWhatsAppBtn = getElement('paymentWhatsAppBtn');
  if (paymentWhatsAppBtn && paymentWhatsAppBtn.href) {
    window.open(paymentWhatsAppBtn.href, '_blank');
    showNotification('✅ Pedido guardado y enviado. Abriendo WhatsApp...');
    
    cart = [];
    saveCart();
    updateCartUI();
    getElement('customerName').value = '';
    getElement('customerPhone').value = '';
    getElement('customerAddress').value = '';
  }
  closeWhatsAppConfirmModal();
}

// ===== GUARDAR PEDIDO (BACKEND) =====
async function saveOrderToBackend() {
  const customerName = getElement('customerName')?.value.trim() || 'No especificado';
  const customerPhone = getElement('customerPhone')?.value.trim() || 'No especificado';
  const customerAddress = getElement('customerAddress')?.value.trim() || 'No especificado';
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const orderData = {
    customer_name: customerName,
    customer_phone: customerPhone,
    customer_address: customerAddress,
    items: cart.map(item => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity
    })),
    total: total,
    payment_method: 'whatsapp'
  };

  try {
    await api.createOrder(orderData);
    console.log('✅ Pedido guardado en backend');
    return true;
  } catch (err) {
    console.error('❌ Error guardando pedido:', err);
    showNotification('⚠️ Error al guardar en el servidor. El pedido se enviará igual.');
    return false;
  }
}

// ===== ADMIN - PRODUCTOS =====
async function toggleProduct(productId) {
  const product = products.find(item => item.id === productId);
  if (!product) return;

  try {
    await updateProductAvailabilityInDB(productId, !product.available);
    await loadProducts();
    renderMenu();
    showNotification(`${product.name} ${product.available ? 'marcado como agotado' : 'disponible'}`);
  } catch (error) {
    console.error('Error al cambiar estado del producto:', error);
    showNotification('Error al actualizar disponibilidad del producto.');
  }
}

async function deleteProduct(productId) {
  const product = products.find(item => item.id === productId);
  if (!product) return;
  if (!confirm(`¿Eliminar ${product.name}?`)) return;

  try {
    await deleteProductInDB(productId);
    await loadProducts();
    renderMenu();
    showNotification(`${product.name} eliminado`);
  } catch (error) {
    console.error('Error eliminando producto:', error);
    showNotification('Error al eliminar el producto.');
  }
}

async function deleteCategory(categoryId, categoryTitle) {
  if (!confirm(`¿Eliminar la categoría "${categoryTitle}"? Esta acción no se puede deshacer.`)) return;

  try {
    await api.deleteCategory(categoryId);
    await loadCategories();
    renderMenu();
    showNotification(`Categoría "${categoryTitle}" eliminada`);
  } catch (error) {
    console.error('Error eliminando categoría:', error);
    showNotification(error.message || 'Error al eliminar la categoría.');
  }
}

function openEditCategory(categoryId, categoryTitle, categorySlug) {
  getElement('categoryId').value = categoryId;
  getElement('categoryTitle').value = categoryTitle;
  getElement('categorySlug').value = categorySlug;
  getElement('categorySubmitBtn').textContent = 'Actualizar categoría';
  getElement('cancelCategoryEdit').style.display = 'block';
  
  getElement('categoryModal')?.classList.remove('hidden');
}

function resetCategoryForm() {
  getElement('categoryId').value = '';
  getElement('categoryTitle').value = '';
  getElement('categorySlug').value = '';
  getElement('categorySubmitBtn').textContent = 'Crear categoría';
  getElement('cancelCategoryEdit').style.display = 'none';
  delete getElement('categorySlug').dataset.edited;
}

function openEditProduct(productId) {
  const product = products.find(item => item.id === productId);
  if (!product) return;

  const modalTitle = getElement('productModalTitle');
  if (modalTitle) {
    modalTitle.textContent = '✏️ Editar Producto';
  }
  
  getElement('productId').value = product.id;
  getElement('productCategory').value = product.category;
  getElement('productName').value = product.name;
  getElement('productDescription').value = product.description;
  getElement('productPrice').value = product.price;
  getElement('productImage').value = product.image || '';
  const imagePreview = getElement('productImagePreview');
  if (imagePreview) imagePreview.src = product.image || IMAGE_FALLBACK;
  const imageInput = getElement('productImageFile');
  if (imageInput) imageInput.value = '';

  const availableInput = getElement('productAvailable');
  if (availableInput) availableInput.checked = product.available !== false;

  const comboInput = getElement('is_combo');
  if (comboInput) comboInput.checked = product.is_combo === true;

  getElement('productName').focus();
}

function resetProductForm() {
  const modalTitle = getElement('productModalTitle');
  if (modalTitle) {
    modalTitle.textContent = '📦 Nuevo Producto';
  }
  getElement('productId').value = '';
  const categorySelect = getElement('productCategory');
  if (categorySelect && categories.length > 0) {
    categorySelect.value = categories[0].slug;
  }
  getElement('productName').value = '';
  getElement('productDescription').value = '';
  getElement('productPrice').value = '';
  getElement('productImage').value = '';
  getElement('productImageFile').value = '';
  getElement('productImagePreview').src = 'img/logo.png';
  getElement('productAvailable').checked = true;
  getElement('is_combo').checked = false;
}

async function handleProductFormSubmit(event) {
  event.preventDefault();
  const id = getElement('productId').value;
  const category = getElement('productCategory').value;
  const name = getElement('productName').value.trim();
  const description = getElement('productDescription').value.trim();
  const price = parseFloat(getElement('productPrice').value);
  const imageInput = getElement('productImageFile');
  const selectedImageFile = imageInput?.files?.[0];
  let image = getElement('productImage').value.trim();
  const available = getElement('productAvailable')?.checked ?? true;
  const is_combo = getElement('is_combo')?.checked ?? false;

  if (!name || !description || Number.isNaN(price)) {
    alert('Completa todos los campos del producto.');
    return;
  }

  try {
    if (selectedImageFile) {
      showNotification('⏳ Subiendo imagen...');
      const uploadResult = await subirImagenCloudinary(selectedImageFile);
      image = uploadResult.secureUrl;
      getElement('productImage').value = image;
    }

    if (id) {
      const updatePayload = {
        id,
        category,
        name,
        description,
        price,
        available,
        is_combo,
      };
      if (image) {
        updatePayload.image = image;
      }

      await updateProductInDB({
        ...updatePayload,
      });
      showNotification(`${name} actualizado`);
    } else {
      const createPayload = {
        category,
        name,
        description,
        price,
        available,
        is_combo,
      };
      if (image) {
        createPayload.image_url = image;
      }

      await createProductInDB(createPayload);
      showNotification(`${name} agregado al menú`);
    }

    await loadProducts();
    renderMenu();
    resetProductForm();
  } catch (error) {
    console.error('Error guardando producto:', error);
    showNotification('Error al guardar el producto.');
  }
}

function setupProductForm() {
  const form = getElement('productForm');
  const cancelEdit = getElement('cancelEdit');
  const imageInput = getElement('productImageFile');
  const imageUrlInput = getElement('productImage');
  const imagePreview = getElement('productImagePreview');
  form?.addEventListener('submit', handleProductFormSubmit);
  cancelEdit?.addEventListener('click', resetProductForm);

  imageInput?.addEventListener('change', () => {
    const selected = imageInput.files?.[0];
    if (!selected || !imagePreview) return;
    const objectUrl = URL.createObjectURL(selected);
    imagePreview.src = objectUrl;
  });

  imageUrlInput?.addEventListener('input', () => {
    if (!imagePreview) return;
    imagePreview.src = imageUrlInput.value.trim() || IMAGE_FALLBACK;
  });

  resetProductForm();
}

function slugifyCategory(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function setupCategoryForm() {
  const form = getElement('categoryForm');
  const titleInput = getElement('categoryTitle');
  const slugInput = getElement('categorySlug');
  const idInput = getElement('categoryId');
  const cancelBtn = getElement('cancelCategoryEdit');

  if (!form || !titleInput || !slugInput) return;

  titleInput.addEventListener('input', () => {
    if (!slugInput.dataset.edited) {
      slugInput.value = slugifyCategory(titleInput.value);
    }
  });

  slugInput.addEventListener('input', () => {
    slugInput.dataset.edited = 'true';
    slugInput.value = slugifyCategory(slugInput.value);
  });

  cancelBtn?.addEventListener('click', resetCategoryForm);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const title = titleInput.value.trim();
    const slug = slugifyCategory(slugInput.value.trim() || title);
    const categoryId = idInput.value.trim();

    // Validaciones mejoradas
    if (!title) {
      showNotification('⚠️ El nombre de la categoría es obligatorio.');
      titleInput.focus();
      return;
    }

    if (title.length < 2) {
      showNotification('⚠️ El nombre debe tener al menos 2 caracteres.');
      titleInput.focus();
      return;
    }

    if (title.length > 50) {
      showNotification('⚠️ El nombre no puede exceder 50 caracteres.');
      titleInput.focus();
      return;
    }

    if (!slug) {
      showNotification('⚠️ El slug (URL) es obligatorio.');
      slugInput.focus();
      return;
    }

    if (slug.length < 2) {
      showNotification('⚠️ El slug debe tener al menos 2 caracteres.');
      slugInput.focus();
      return;
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      showNotification('⚠️ El slug solo puede contener letras minúsculas, números y guiones.');
      slugInput.focus();
      return;
    }

    try {
      if (categoryId) {
        // Editar categoría existente
        await api.updateCategory(categoryId, { title, slug });
        showNotification('✅ Categoría actualizada correctamente.');
      } else {
        // Crear nueva categoría
        await createCategoryInDB({ title, slug, is_active: true });
        showNotification('✅ Categoría creada correctamente.');
      }
      
      resetCategoryForm();
      await loadCategories();
      renderMenu();
    } catch (error) {
      console.error('Error guardando categoría:', error);
      showNotification(error.message || '❌ No se pudo guardar la categoría.');
    }
  });
}

async function toggleCategory(categoryId, activeValue) {
  const isActive = activeValue === true || activeValue === 'true';
  try {
    await updateCategoryStatusInDB(categoryId, !isActive);
    await loadCategories();
    await loadProducts();
    renderMenu();
    showNotification(`Categoría ${isActive ? 'desactivada' : 'activada'} correctamente.`);
  } catch (error) {
    console.error('Error actualizando categoría:', error);
    showNotification(error.message || 'No se pudo actualizar la categoría.');
  }
}

// ===== MODAL DE LOGIN ADMIN =====
function openAdminLoginModal() {
  const modal = getElement('adminLoginModal');
  if (!modal) {
    createAdminLoginModal();
    setTimeout(() => openAdminLoginModal(), 100);
    return;
  }
  
  modal.classList.remove('hidden');
  const keyInput = getElement('adminKey');
  if (keyInput) {
    keyInput.value = '';
    keyInput.focus();
  }
}

function closeAdminLoginModal() {
  const modal = getElement('adminLoginModal');
  if (modal) modal.classList.add('hidden');
}

function createAdminLoginModal() {
  const modalHTML = `
    <div id="adminLoginModal" class="admin-login-modal hidden">
      <div class="admin-login-content">
        <div class="admin-login-header">
          <div class="admin-login-logo">
            <img src="img/logo.png" alt="Q'Bacano" width="48" height="48">
            <div>
              <h3>Panel Administrativo</h3>
              <p>Sabores Q'Bacano</p>
            </div>
          </div>
          <button type="button" class="admin-login-close" aria-label="Cerrar">×</button>
        </div>
        
        <div class="admin-login-body">
          <div class="admin-login-icon">🔐</div>
          <h4>Acceso Seguro</h4>
          <p>Ingresa tu clave de administrador para acceder al panel de control</p>
          
          <form id="adminLoginForm" class="admin-login-form">
            <div class="admin-input-group">
              <label for="adminKey">Clave de acceso</label>
              <div class="admin-input-wrapper">
                <input 
                  type="password" 
                  id="adminKey" 
                  name="adminKey"
                  placeholder="Ingresa tu clave"
                  required
                  autocomplete="current-password"
                  minlength="4"
                  maxlength="50"
                >
                <button type="button" class="admin-toggle-password" aria-label="Mostrar/ocultar contraseña">
                  <span class="eye-icon">👁️</span>
                </button>
              </div>
            </div>
            
            <div class="admin-login-actions">
              <button type="button" class="btn btn-secondary" id="adminLoginCancel">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary" id="adminLoginSubmit">
                <span class="btn-text">Acceder</span>
                <span class="btn-loading hidden">⏳ Verificando...</span>
              </button>
            </div>
          </form>
          
          <div class="admin-login-footer">
            <small>La sesión expirará automáticamente por seguridad</small>
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  setupAdminLoginModal();
}

function setupAdminLoginModal() {
  const modal = getElement('adminLoginModal');
  const form = getElement('adminLoginForm');
  const closeBtn = getElement('adminLoginClose');
  const cancelBtn = getElement('adminLoginCancel');
  const toggleBtn = getElement('adminTogglePassword');
  const keyInput = getElement('adminKey');
  
  // Cerrar modal
  closeBtn?.addEventListener('click', closeAdminLoginModal);
  cancelBtn?.addEventListener('click', closeAdminLoginModal);
  
  // Cerrar al hacer click fuera
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeAdminLoginModal();
  });
  
  // Toggle password visibility
  toggleBtn?.addEventListener('click', () => {
    if (keyInput.type === 'password') {
      keyInput.type = 'text';
      toggleBtn.querySelector('.eye-icon').textContent = '👁️‍🗨️';
    } else {
      keyInput.type = 'password';
      toggleBtn.querySelector('.eye-icon').textContent = '👁️';
    }
  });
  
  // Submit form
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleAdminLogin();
  });
  
  // Enter key submit
  keyInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdminLogin();
    }
  });
}

async function handleAdminLogin() {
  const keyInput = getElement('adminKey');
  const submitBtn = getElement('adminLoginSubmit');
  const key = keyInput?.value?.trim();
  
  if (!key) {
    showNotification('⚠️ La clave de acceso es obligatoria');
    keyInput?.focus();
    return;
  }
  
  // Loading state
  submitBtn?.classList.add('loading');
  submitBtn?.querySelector('.btn-text')?.classList.add('hidden');
  submitBtn?.querySelector('.btn-loading')?.classList.remove('hidden');
  if (submitBtn) submitBtn.disabled = true;
  keyInput?.setAttribute('disabled', 'true');
  
  try {
    showNotification('⏳ Verificando clave...');
    const result = await api.validateAdminKey(key);
    
    if (result.valid) {
      isAdmin = true;
      if (result.token) {
        localStorage.setItem(STORAGE_ADMIN_TOKEN, result.token);
        api.setAdminToken(result.token);
      }
      
      await loadCategories();
      toggleAdminMode(true);
      getElement('adminPanel')?.classList.remove('hidden');
      renderMenu();
      
      closeAdminLoginModal();
      showNotification('✅ Acceso concedido. Sesión expira en 10 min');
      resetAdminSessionTimer();
    } else {
      showNotification('❌ Clave incorrecta, no activa o no existe.');
      keyInput?.focus();
      keyInput?.select();
    }
  } catch (err) {
    console.error('Error verificando admin:', err);
    showNotification('❌ Error de conexión con el servidor.');
  } finally {
    // Reset loading state
    submitBtn?.classList.remove('loading');
    submitBtn?.querySelector('.btn-text')?.classList.remove('hidden');
    submitBtn?.querySelector('.btn-loading')?.classList.add('hidden');
    if (submitBtn) submitBtn.disabled = false;
    keyInput?.removeAttribute('disabled');
  }
}

// ===== ADMIN PANEL =====
function setupAdminPanel() {
  const adminToggle = getElement('adminToggle');
  const adminPanel = getElement('adminPanel');
  const closeAdmin = getElement('closeAdmin');

  adminToggle?.addEventListener('click', async () => {
    if (isAdmin) {
      logoutAdmin();
      return;
    }
    openAdminLoginModal();
  });

  closeAdmin?.addEventListener('click', () => {
    adminPanel?.classList.add('hidden');
  });

  // Botón de estadísticas
  const viewStatsBtn = getElement('viewStatsBtn');
  if (viewStatsBtn) {
    viewStatsBtn.addEventListener('click', () => {
      const container = getElement('adminStatsContainer');
      container?.classList.toggle('hidden');
      if (!container?.classList.contains('hidden')) {
        setupAdminFilters();
        loadAdminStats(currentFilters);
      }
    });
  }

  // Delegación de eventos para cambios de estado
  document.addEventListener('change', async (e) => {
    if (e.target.classList.contains('status-dropdown')) {
      const select = e.target;
      const orderId = select.dataset.orderId;
      const newStatus = select.value;
      const prevStatus = select.dataset.prev;
      
      select.disabled = true;
      
      try {
        await api.updateOrderStatus(orderId, newStatus);
        select.dataset.prev = newStatus;
        showNotification(`✅ Pedido #${orderId} actualizado a: ${newStatus}`);
      } catch (error) {
        select.value = prevStatus;
        showNotification('❌ Error al actualizar estado');
      }
      select.disabled = false;
    }
  });
}

function toggleAdminMode(active) {
  const adminToggle = getElement('adminToggle');
  const adminIcon = adminToggle?.querySelector('.admin-icon');
  if (active) {
    document.body.classList.add('admin-mode');
    if (adminIcon) adminIcon.textContent = '';
    showNotification('Modo administrador activado');
  } else {
    document.body.classList.remove('admin-mode');
    if (adminIcon) adminIcon.textContent = '';
    showNotification('Modo administrador desactivado');
  }
}

function resetAdminSessionTimer() {
  if (adminSessionTimeout) {
    clearTimeout(adminSessionTimeout);
  }
  
  if (isAdmin) {
    adminSessionTimeout = setTimeout(() => {
      logoutAdmin();
    }, SESSION_DURATION);
  }
}



function logoutAdmin() {
  isAdmin = false;
  localStorage.removeItem(STORAGE_ADMIN_TOKEN);
  api.setAdminToken('');
  loadCategories().then(() => renderMenu());
  toggleAdminMode(false);
  getElement('adminPanel')?.classList.add('hidden');
  showNotification('🔒 Sesión de administrador expirada por inactividad');
  
  if (adminSessionTimeout) {
    clearTimeout(adminSessionTimeout);
  }
}

document.addEventListener('click', () => {
  if (isAdmin) resetAdminSessionTimer();
});

document.addEventListener('keypress', () => {
  if (isAdmin) resetAdminSessionTimer();
});

// ===== ESTADÍSTICAS (BACKEND) =====
let currentFilters = {
  status: 'all',
  dateFrom: null,
  dateTo: null
};

async function loadAdminStats(filters = currentFilters) {
  const statsOutput = getElement('statsOutput');
  if (!statsOutput) return;
  
  statsOutput.innerHTML = '<p style=\"text-align:center; padding:2rem;\">⏳ Cargando estadísticas...</p>';

  try {
    const [stats, orders] = await Promise.all([
      api.fetchStats({ dateFrom: filters.dateFrom, dateTo: filters.dateTo }),
      api.fetchOrders(filters)
    ]);

    renderStatsUI({ ...stats, recentOrders: orders, filters });
  } catch (err) {
    console.error('Error cargando estadísticas:', err);
    statsOutput.innerHTML = '<p class=\"empty-history\">❌ Error al cargar datos del servidor.</p>';
  }
}

function renderStatsUI(stats) {
  const container = getElement('statsOutput');
  if (!container) return;

  const dateLabel = (stats.filters?.dateFrom || stats.filters?.dateTo) 
    ? ` (${stats.filters.dateFrom || '...'} a ${stats.filters.dateTo || '...'})` 
    : '';

  container.innerHTML = `
    <div class=\"stats-grid\">
      <div class=\"stat-card success\">
        <h4>✅ Entregados${dateLabel}</h4>
        <p class=\"stat-value\">$${(stats.totalSales || 0).toFixed(2)}</p>
        <small class=\"stat-sub\">Ingresos reales</small>
      </div>
      <div class=\"stat-card warning\">
        <h4>⏳ Pendientes</h4>
        <p class=\"stat-value\">$${(stats.pendingAmount || 0).toFixed(2)}</p>
        <small class=\"stat-sub\">Por confirmar/entregar</small>
      </div>
      <div class=\"stat-card danger\">
        <h4>❌ Cancelados</h4>
        <p class=\"stat-value\">$${(stats.cancelledAmount || 0).toFixed(2)}</p>
        <small class=\"stat-sub\">No generaron ingreso</small>
      </div>
      <div class=\"stat-card full-width\">
        <h4>🔥 Top 5 Productos</h4>
        <p class=\"stat-list\">${stats.topProducts?.map(p => `${p.name} (${p.quantity}x)`).join(' • ') || 'Sin datos aún'}</p>
      </div>
    </div>
    
    <h4 style=\"margin: 1.5rem 0 1rem; color: var(--primary);\">📜 Pedidos (${stats.recentOrders?.length || 0})</h4>
    <div class=\"history-scroll\">
      <table class=\"admin-history-table\">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>Productos</th>
            <th>Total</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          ${(stats.recentOrders || []).map(order => {
            const status = order.status || 'pending';
            return `
              <tr>
                <td><small>${new Date(order.created_at).toLocaleString()}</small></td>
                <td><strong>${order.customer_name}</strong><br><small>${order.customer_phone}</small></td>
                <td>${Array.isArray(order.items) ? order.items.map(i => `${i.quantity}x ${i.name}`).join(', ') : '-'}</td>
                <td class=\"price-cell\">$${(order.total || 0).toFixed(2)}</td>
                <td>
                  <select class=\"status-dropdown\" data-order-id=\"${order.id}\" data-prev=\"${status}\">
                    <option value=\"pending\" ${status === 'pending' ? 'selected' : ''}>⏳ Pendiente</option>
                    <option value=\"confirmed\" ${status === 'confirmed' ? 'selected' : ''}>✅ Confirmado</option>
                    <option value=\"delivered\" ${status === 'delivered' ? 'selected' : ''}>📦 Entregado</option>
                    <option value=\"cancelled\" ${status === 'cancelled' ? 'selected' : ''}>❌ Cancelado</option>
                  </select>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function setupAdminFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilters.status = btn.dataset.filterStatus;
    });
  });

  const applyBtn = getElement('applyFilters');
  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      currentFilters.dateFrom = getElement('filterDateFrom')?.value || null;
      currentFilters.dateTo = getElement('filterDateTo')?.value || null;
      
      loadAdminStats(currentFilters);
      showNotification('🔍 Filtros aplicados');
    });
  }

  const clearBtn = getElement('clearDateFilter');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      getElement('filterDateFrom').value = '';
      getElement('filterDateTo').value = '';
      currentFilters.dateFrom = null;
      currentFilters.dateTo = null;
      loadAdminStats(currentFilters);
      showNotification('🗑️ Filtros de fecha limpiados');
    });
  }

  loadAdminStats(currentFilters);
}

// ===== EVENTOS =====
function setupMenuEvents() {
  // ── Botones Nueva Categoría y Nuevo Producto ──
  getElement('createCategoryBtn')?.addEventListener('click', () => {
    resetCategoryForm();
    getElement('categoryModal')?.classList.remove('hidden');
  });

  getElement('closeCategoryModal')?.addEventListener('click', () => {
    getElement('categoryModal')?.classList.add('hidden');
    resetCategoryForm();
  });

  getElement('categoryModal')?.addEventListener('click', (e) => {
    if (e.target === getElement('categoryModal')) {
      getElement('categoryModal').classList.add('hidden');
      resetCategoryForm();
    }
  });

  getElement('createProductBtn')?.addEventListener('click', () => {
    resetProductForm();
    getElement('productModal')?.classList.remove('hidden');
  });

  getElement('closeProductModal')?.addEventListener('click', () => {
    getElement('productModal')?.classList.add('hidden');
    resetProductForm();
  });

  getElement('productModal')?.addEventListener('click', (e) => {
    if (e.target === getElement('productModal')) {
      getElement('productModal').classList.add('hidden');
      resetProductForm();
    }
  });

  // ── Cerrar panel de Estadísticas ──
  getElement('closeStatsBtn')?.addEventListener('click', () => {
    getElement('adminStatsContainer')?.classList.add('hidden');
  });

  document.body.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) return;

    const action = button.dataset.action;
    const productId = button.dataset.productId;
    const categoryId = button.dataset.categoryId;
    const categoryActive = button.dataset.categoryActive === 'true';
    const categoryTitle = button.dataset.categoryTitle;
    const categorySlug = button.dataset.categorySlug;

    switch (action) {
      case 'add-to-cart': addToCart(productId); break;
      case 'toggle-availability': toggleProduct(productId); break;
      case 'edit': openEditProduct(productId); break;
      case 'delete': deleteProduct(productId); break;
      case 'toggle-category': toggleCategory(categoryId, categoryActive); break;
      case 'edit-category': openEditCategory(categoryId, categoryTitle, categorySlug); break;
      case 'delete-category': deleteCategory(categoryId, categoryTitle); break;
      case 'pay': handlePayment(method); break;
      case 'whatsapp-order': handleWhatsAppOrder(event); break;
      case 'confirm-whatsapp': handleWhatsAppConfirm(); break;
      case 'cancel-whatsapp': closeWhatsAppConfirmModal(); break;
      case 'close-paypal-modal': closePayPalModal(); break;
      case 'install-pwa': installPWA(); break;
      case 'close-install': closeInstallPrompt(); break;
    }
  });

  const paypalModal = getElement('paypal-modal');
  if (paypalModal) {
    paypalModal.addEventListener('click', (event) => {
      if (event.target === paypalModal) {
        closePayPalModal();
      }
    });
  }
}

function handlePayment(method) {
  if (cart.length === 0) {
    alert('Tu carrito está vacío');
    return;
  }
  
  if (method === 'mercadopago' || method === 'paypal') {
    alert('Mercado Pago y PayPal estarán habilitados próximamente. Usa WhatsApp para hacer tu pedido.');
    return;
  } else if (method === 'cash') {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    alert(`Pedido confirmado para pago en efectivo/transferencia.

Total: $${total.toFixed(2)}

Te contactaremos por WhatsApp para coordinar la entrega.`);
    cart = [];
    saveCart();
    updateCartUI();
  }
}

function closePayPalModal() {
  const modal = getElement('paypal-modal');
  if (modal) modal.style.display = 'none';
}

// ===== PWA =====
function setupPWA() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.log('SW registrado:', reg))
      .catch(err => console.log('SW error:', err));
  }

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    getElement('installPrompt')?.classList.remove('hidden');
  });

  window.addEventListener('appinstalled', () => {
    getElement('installPrompt')?.classList.add('hidden');
    deferredPrompt = null;
    showNotification('¡App instalada correctamente!');
  });
}

function installPWA() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('Usuario aceptó instalar');
      }
      deferredPrompt = null;
    });
  }
}

function closeInstallPrompt() {
  getElement('installPrompt')?.classList.add('hidden');
}

// ===== NOTIFICACIONES =====
function showNotification(message) {
  const notif = document.createElement('div');
  notif.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: var(--dark);
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  notif.textContent = message;
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 3000);
}

// ===== EXTRAS MODAL =====
function showExtrasModal(extras) {
  return new Promise((resolve) => {
    const modal = document.createElement('div');
    modal.className = 'extras-modal';
    modal.style.cssText = `position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 10000; padding: 1rem;`;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `background: white; border-radius: 16px; padding: 2rem; max-width: 500px; width: 100%; max-height: 80vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3);`;

    const title = document.createElement('h3');
    title.textContent = '🔥 ¿Quieres agregar algo más?';
    title.style.cssText = 'margin-bottom: 1.5rem; color: var(--primary); font-size: 1.5rem;';

    const list = document.createElement('div');
    list.style.cssText = 'margin-bottom: 1.5rem;';

    extras.forEach((extra, index) => {
      const isAvailable = extra.available !== false;
      
      const item = document.createElement('label');
      item.style.cssText = `
        display: flex; align-items: center; gap: 1rem; padding: 1rem; margin-bottom: 0.75rem; 
        background: ${isAvailable ? '#f8f9fa' : '#f0f0f0'}; 
        border-radius: 10px; cursor: ${isAvailable ? 'pointer' : 'not-allowed'}; 
        transition: all 0.2s; border: 2px solid ${isAvailable ? 'transparent' : '#ddd'}; 
        opacity: ${isAvailable ? '1' : '0.6'};
      `;

      if (isAvailable) {
        item.onmouseenter = () => item.style.borderColor = 'var(--primary)';
        item.onmouseleave = () => item.style.borderColor = 'transparent';
      }

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = index;
      checkbox.style.cssText = 'width: 20px; height: 20px; cursor: pointer;';
      if (!isAvailable) {
        checkbox.disabled = true;
        checkbox.style.cursor = 'not-allowed';
      }

      const info = document.createElement('div');
      info.style.cssText = 'flex: 1;';

      const name = document.createElement('div');
      name.textContent = `${extra.name}${!isAvailable ? ' 🚫 Agotado' : ''}`;
      name.style.cssText = `font-weight: 600; color: ${isAvailable ? 'var(--dark)' : '#999'};`;

      const price = document.createElement('div');
      price.textContent = isAvailable ? `+$${extra.price.toFixed(2)}` : 'No disponible';
      price.style.cssText = `color: ${isAvailable ? 'var(--primary)' : '#999'}; font-weight: 700;`;

      info.appendChild(name);
      info.appendChild(price);
      item.appendChild(checkbox);
      item.appendChild(info);
      list.appendChild(item);
    });

    const buttons = document.createElement('div');
    buttons.style.cssText = 'display: flex; gap: 1rem; justify-content: flex-end;';

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.style.cssText = `padding: 0.75rem 1.5rem; border: 2px solid #ddd; background: white; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s;`;
    cancelBtn.onclick = () => { modal.remove(); resolve([]); };

    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = 'Agregar seleccionados';
    confirmBtn.style.cssText = `padding: 0.75rem 1.5rem; background: var(--success); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s;`;
    confirmBtn.onclick = () => {
      const checkboxes = list.querySelectorAll('input[type=\"checkbox\"]:checked');
      const selected = Array.from(checkboxes).map(cb => extras[parseInt(cb.value)]);
      modal.remove();
      resolve(selected);
    };

    buttons.appendChild(cancelBtn);
    buttons.appendChild(confirmBtn);
    modalContent.appendChild(title);
    modalContent.appendChild(list);
    modalContent.appendChild(buttons);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    modal.onclick = (e) => { 
      if (e.target === modal) { modal.remove(); resolve([]); } 
    };
  });
}

// ===== CAMPOS DE CONTACTO =====
function setupContactFields() {
  const customerInputs = [
    getElement('customerName'),
    getElement('customerPhone'),
    getElement('customerAddress')
  ].filter(Boolean);

  customerInputs.forEach(input => {
    input.addEventListener('input', () => {
      const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      updateWhatsAppLink(total);
    });
  });
}

// ===== INICIALIZACIÓN =====
async function init() {
  window.updateQuantity = updateQuantity;
  window.removeFromCart = removeFromCart;

  loadCart();
  await loadCategories();
  await loadProducts();
  setupAdminPanel();
  setupProductForm();
  setupCategoryForm();
  setupMenuEvents();
  setupContactFields();
  setupPWA();
  setupSearch();
  renderMenu();
  updateCartUI();
  adjustTouchTargets();
}

document.addEventListener('DOMContentLoaded', init);
