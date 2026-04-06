import { supabase } from './supabaseClient.js'

// ===== VARIABLES GLOBALES =====
const STORAGE_CART = 'qbacano_cart';
const STORAGE_PRODUCTS = 'qbacano_products';
const STORAGE_ADMIN = 'qbacano_admin_settings';

let cart = [];
let products = [];
let isAdmin = false;
let deferredPrompt = null;

const defaultProducts = [
  {
    id: 'emp1',
    category: 'empanadas',
    name: 'Empanada Carne',
    description: 'Carne molida jugosa con cebolla, pimiento y un toque de comino.',
    price: 2.5,
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80',
    available: true,
  },
  {
    id: 'emp2',
    category: 'empanadas',
    name: 'Empanada Queso',
    description: 'Queso derretido y jamón de primera, horneadas a la perfección.',
    price: 2.5,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80',
    available: true,
  },
  {
    id: 'emp3',
    category: 'empanadas',
    name: 'Empanada Pollo',
    description: 'Pollo desmenuzado con champiñones salteados y hierbas frescas.',
    price: 2.75,
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80',
    available: true,
  },
  {
    id: 'sal1',
    category: 'salchipapas',
    name: 'Salchipapa Clásica',
    description: 'Papas crujientes, salchicha premium, queso costeño, salsas y huevo.',
    price: 6.5,
    image: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=600&q=80',
    available: true,
  },
  {
    id: 'sal2',
    category: 'salchipapas',
    name: 'Salchipapa Especial',
    description: 'Doble salchicha, tocino, maíz, piña, queso mozzarella y salsa secreta.',
    price: 8.9,
    image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=600&q=80',
    available: true,
  },
  {
    id: 'pos1',
    category: 'postres',
    name: 'Torta de Chocolate',
    description: 'Esponjoso bizcocho de chocolate con frosting de crema y nueces.',
    price: 3.5,
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=600&q=80',
    available: true,
  },
  {
    id: 'pos2',
    category: 'postres',
    name: 'Brownies con Nueces',
    description: 'Intenso chocolate con nueces caramelizadas. Servido con helado.',
    price: 4.0,
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80',
    available: true,
  },
  {
    id: 'pos3',
    category: 'postres',
    name: 'Helado Artesanal',
    description: 'Variedades: Vainilla, Chocolate, Fresa o Maracuyá. Bola grande.',
    price: 2.5,
    image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=600&q=80',
    available: true,
  },
  {
    id: 'pos4',
    category: 'postres',
    name: 'Donas Glaseadas',
    description: 'Donas esponjosas con glaseado de chocolate o vainilla. Caja x3.',
    price: 5.0,
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=600&q=80',
    available: true,
  },
];

function getElement(id) {
  return document.getElementById(id);
}

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
  const saved = JSON.parse(localStorage.getItem(STORAGE_ADMIN) || '{}');
  const globalToggle = getElement('globalToggle');
  if (saved.showAll) {
    globalToggle.checked = true;
  }
}

function saveAdminSettings() {
  const globalToggle = getElement('globalToggle');
  localStorage.setItem(STORAGE_ADMIN, JSON.stringify({
    showAll: globalToggle.checked,
  }));
}

async function fetchProductsFromDB() {
  console.log('🔄 Conectando a Supabase...');
  console.log('URL:', 'https://iuaqxtadhkgcsjhyeybk.supabase.co');
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('❌ Error de Supabase:', error);
    throw error;
  }

  console.log('✅ Conexión exitosa! Productos encontrados:', data.length);
  console.log('📊 Datos:', data);

  return data.map(product => ({
    id: String(product.id),
    category: String(product.category || '').toLowerCase().trim(),
    name: product.name,
    description: product.description,
    price: parseFloat(product.price),
    image: product.image_url || 'img/LOGO.jpg',
    available: product.available ?? true,
  }));
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
      saveProducts();
    } else if (!products.length) {
      products = defaultProducts.slice();
      saveProducts();
      showNotification('No hay productos en la base de datos. Usando menú local.');
    }
  } catch (error) {
    console.error('Error cargando productos desde Supabase:', error);
    if (!products.length) {
      products = defaultProducts.slice();
      saveProducts();
    }
    showNotification('No fue posible cargar los productos desde Supabase. Usando datos locales.');
  }
}

async function createProductInDB(product) {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select();

  if (error) {
    throw error;
  }

  return data[0];
}

async function updateProductInDB(product) {
  const { error } = await supabase
    .from('products')
    .update({
      category: product.category,
      name: product.name,
      description: product.description,
      price: product.price,
      image_url: product.image,
      available: product.available,
    })
    .eq('id', product.id);

  if (error) {
    throw error;
  }
}

async function deleteProductInDB(productId) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) {
    throw error;
  }
}

async function updateProductAvailabilityInDB(productId, available) {
  const { error } = await supabase
    .from('products')
    .update({ available })
    .eq('id', productId);

  if (error) {
    throw error;
  }
}

async function applyGlobalAvailability() {
  const { error } = await supabase
    .from('products')
    .update({ available: true });

  if (error) {
    console.error('Error actualizando disponibilidad global:', error);
    showNotification('Error al activar todos los productos.');
    return;
  }

  products = products.map(product => ({ ...product, available: true }));
  saveProducts();
  renderMenu();
}

function renderMenu() {
  renderProductGrid('empanadas', 'empanadasGrid');
  renderProductGrid('salchipapas', 'salchipapasGrid');
  renderProductGrid('postres', 'postresGrid');
  renderAdminProductList();
}

function renderProductGrid(category, gridId) {
  const grid = getElement(gridId);
  if (!grid) return;
  const items = products.filter(product => product.category === category);
  if (items.length === 0) {
    grid.innerHTML = '<p class="empty-message">No hay productos en esta categoría todavía.</p>';
    return;
  }

  grid.innerHTML = items.map(product => `
    <div class="menu-item${product.available ? '' : ' unavailable'}" data-id="${product.id}" data-available="${product.available}">
      <div class="product-badge unavailable-badge${product.available ? ' hidden' : ''}">Agotado</div>
      <img src="${product.image || 'img/LOGO.jpg'}" alt="${product.name}" loading="lazy" onerror="this.src='img/LOGO.jpg'">
      <div class="menu-content">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="price">$${product.price.toFixed(2)}${category === 'empanadas' ? ' c/u' : ''}</div>
        <div class="product-actions">
          <button type="button" class="btn-add-cart" data-action="add" data-product-id="${product.id}" ${product.available ? '' : 'disabled'}>🛒 Agregar</button>
          <button type="button" class="toggle-availability admin-only hidden" data-action="toggle-availability" data-product-id="${product.id}">🔘 Activar/Desactivar</button>
          <button type="button" class="btn btn-secondary admin-only hidden" data-action="edit" data-product-id="${product.id}">✏️ Editar</button>
          <button type="button" class="btn btn-danger admin-only hidden" data-action="delete" data-product-id="${product.id}">🗑️ Eliminar</button>
        </div>
      </div>
    </div>
  `).join('');
}

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
    cart.push({ id: product.id, name: product.name, price: product.price, quantity: 1 });
  }

  saveCart();
  updateCartUI();
  showNotification(`${product.name} agregado al carrito`);
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
  const whatsappOrder = getElement('whatsappOrder');

  if (cart.length === 0) {
    cartEmpty.classList.remove('hidden');
    cartItems.classList.add('hidden');
    cartTotal.classList.add('hidden');
    paymentMethods.classList.add('hidden');
    whatsappOrder.classList.add('hidden');
    return;
  }

  cartEmpty.classList.add('hidden');
  cartItems.classList.remove('hidden');
  cartTotal.classList.remove('hidden');

  cartItems.innerHTML = cart.map((item, index) => `
    <div class="cart-item">
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <div class="cart-item-price">$${item.price.toFixed(2)} c/u</div>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn" onclick="updateQuantity(${index}, -1)">-</button>
        <span>${item.quantity}</span>
        <button class="qty-btn" onclick="updateQuantity(${index}, 1)">+</button>
        <button class="remove-btn" onclick="removeFromCart(${index})">Eliminar</button>
      </div>
    </div>
  `).join('');

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  totalAmount.textContent = total.toFixed(2);
  paymentMethods.classList.remove('hidden');
  whatsappOrder.classList.remove('hidden');
  updateWhatsAppLink(total);
}

function updateWhatsAppLink(total) {
  const customerName = getElement('customerName')?.value.trim() || 'No especificado';
  const customerPhone = getElement('customerPhone')?.value.trim() || 'No especificado';
  const customerAddress = getElement('customerAddress')?.value.trim() || 'No especificado';
  const items = cart.map(item => `${item.quantity}x ${item.name} ($${(item.price * item.quantity).toFixed(2)})`).join('\n');

  const message = `Hola! 👋\n\nMi nombre es: ${customerName}\nMi teléfono: ${customerPhone}\nDirección: ${customerAddress}\n\nQuisiera hacer un pedido:\n\n${items}\n\nTotal: $${total.toFixed(2)}\n\n*Método de pago: [Indicar al confirmar]*`;
  const businessPhone = '529812100778';
  const waUrl = `https://wa.me/${businessPhone}?text=${encodeURIComponent(message)}`;
  getElement('whatsappLink').href = waUrl;
  const paymentWhatsAppBtn = getElement('paymentWhatsAppBtn');
  if (paymentWhatsAppBtn) {
    paymentWhatsAppBtn.href = waUrl;
  }
}

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

function openEditProduct(productId) {
  const product = products.find(item => item.id === productId);
  if (!product) return;
  getElement('formTitle').textContent = 'Editar producto';
  getElement('productId').value = product.id;
  getElement('productCategory').value = product.category;
  getElement('productName').value = product.name;
  getElement('productDescription').value = product.description;
  getElement('productPrice').value = product.price;
  getElement('productImage').value = product.image;
  getElement('productAvailable').checked = product.available;
  getElement('productName').focus();
}

function resetProductForm() {
  getElement('formTitle').textContent = 'Agregar nuevo producto';
  getElement('productId').value = '';
  getElement('productCategory').value = 'empanadas';
  getElement('productName').value = '';
  getElement('productDescription').value = '';
  getElement('productPrice').value = '';
  getElement('productImage').value = '';
  getElement('productAvailable').checked = true;
}

async function handleProductFormSubmit(event) {
  event.preventDefault();
  const id = getElement('productId').value;
  const category = getElement('productCategory').value;
  const name = getElement('productName').value.trim();
  const description = getElement('productDescription').value.trim();
  const price = parseFloat(getElement('productPrice').value);
  const image = getElement('productImage').value.trim() || 'img/LOGO.jpg';
  const available = getElement('productAvailable').checked;

  if (!name || !description || Number.isNaN(price)) {
    alert('Completa todos los campos del producto.');
    return;
  }

  try {
    if (id) {
      await updateProductInDB({
        id,
        category,
        name,
        description,
        price,
        image,
        available,
      });
      showNotification(`${name} actualizado`);
    } else {
      await createProductInDB({
        category,
        name,
        description,
        price,
        image_url: image,
        available,
      });
      showNotification(`${name} agregado al menú`);
    }

    await loadProducts();
    renderMenu();
    resetProductForm();
  } catch (error) {
    console.error('Error guardando producto:', error);
    showNotification('Error al guardar el producto en Supabase.');
  }
}

function setupProductForm() {
  const form = getElement('productForm');
  const cancelEdit = getElement('cancelEdit');
  form.addEventListener('submit', handleProductFormSubmit);
  cancelEdit.addEventListener('click', resetProductForm);
  resetProductForm();
}

function setupAdminPanel() {
  const adminToggle = getElement('adminToggle');
  const adminPanel = getElement('adminPanel');
  const closeAdmin = getElement('closeAdmin');
  const globalToggle = getElement('globalToggle');

  loadAdminSettings();

  adminToggle.addEventListener('click', () => {
    const password = prompt('Ingrese contraseña de administrador:');
    if (password === 'admin123') {
      isAdmin = !isAdmin;
      toggleAdminMode(isAdmin);
      adminPanel.classList.toggle('hidden');
    } else if (password !== null) {
      alert('Contraseña incorrecta');
    }
  });

  closeAdmin.addEventListener('click', () => {
    adminPanel.classList.add('hidden');
  });

  globalToggle.addEventListener('change', (e) => {
    if (e.target.checked) {
      applyGlobalAvailability();
      showNotification('Todos los productos están disponibles');
    } else {
      showNotification('Ahora puedes cambiar la disponibilidad manualmente');
    }
    saveAdminSettings();
  });
}

function renderAdminProductList() {
  const list = getElement('adminProductList');
  if (!list) return;
  if (!products.length) {
    list.innerHTML = '<p class="empty-message">No hay productos para administrar.</p>';
    return;
  }
  list.innerHTML = products.map(product => `
    <div class="admin-product-item">
      <div>
        <h5>${product.name}</h5>
        <p>${product.category} • $${product.price.toFixed(2)} • ${product.available ? 'Disponible' : 'Agotado'}</p>
      </div>
      <div class="admin-product-actions">
        <button type="button" class="btn btn-secondary" data-action="edit" data-product-id="${product.id}">Editar</button>
        <button type="button" class="btn btn-danger" data-action="delete" data-product-id="${product.id}">Eliminar</button>
      </div>
    </div>
  `).join('');
}

function toggleAdminMode(active) {
  const adminToggle = getElement('adminToggle');
  if (active) {
    document.body.classList.add('admin-mode');
    adminToggle.textContent = '🔓';
    showNotification('Modo administrador activado');
  } else {
    document.body.classList.remove('admin-mode');
    adminToggle.textContent = '🔒';
    showNotification('Modo administrador desactivado');
  }
}

function setupMenuEvents() {
  document.body.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) return;

    const action = button.dataset.action;
    const productId = button.dataset.productId;
    const method = button.dataset.method;

    if (action === 'add') {
      addToCart(productId);
    } else if (action === 'toggle-availability') {
      toggleProduct(productId);
    } else if (action === 'edit') {
      openEditProduct(productId);
    } else if (action === 'delete') {
      deleteProduct(productId);
    } else if (action === 'pay') {
      handlePayment(method);
    } else if (action === 'close-paypal-modal') {
      closePayPalModal();
    } else if (action === 'install-pwa') {
      installPWA();
    } else if (action === 'close-install') {
      closeInstallPrompt();
    }
  });

  // Cerrar modal de PayPal al hacer clic fuera del contenido
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
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const items = cart.map(item => `${item.quantity}x ${item.name}`).join(', ');

  if (method === 'mercadopago' || method === 'paypal') {
    alert('Mercado Pago y PayPal estarán habilitados próximamente. Usa WhatsApp para hacer tu pedido.');
    return;
  } else if (method === 'cash') {
    alert(`Pedido confirmado para pago en efectivo/transferencia.\n\nTotal: $${total.toFixed(2)}\n\nTe contactaremos por WhatsApp para coordinar la entrega.`);
    cart = [];
    saveCart();
    updateCartUI();
  }
}

// ===== MERCADO PAGO INTEGRATION =====
async function createMercadoPagoPreference(total, items) {
  try {
    // Configura tu Public Key de Mercado Pago aquí
    const mp = new MercadoPago('TEST-1234567890123456-123456-1234567890123456789012345678901234567890', {
      locale: 'es-AR'
    });

    // Crear preferencia de pago
    const preference = {
      items: [
        {
          title: `Pedido - ${items}`,
          quantity: 1,
          currency_id: 'ARS',
          unit_price: total
        }
      ],
      back_urls: {
        success: window.location.href,
        failure: window.location.href,
        pending: window.location.href
      },
      auto_return: 'approved'
    };

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer TEST-123456789012345678901234567890-123456789'
      },
      body: JSON.stringify(preference)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Mercado Pago error ${response.status}: ${data.message || JSON.stringify(data)}`);
    }

    if (data.init_point) {
      window.open(data.init_point, '_blank');
      showNotification('Redirigiendo a Mercado Pago...');
    } else {
      throw new Error('Error al crear preferencia de pago');
    }

  } catch (error) {
    console.error('Error Mercado Pago:', error);
    showNotification('Error al procesar pago con Mercado Pago');
  }
}

// ===== PAYPAL INTEGRATION =====
function renderPayPalButton(total, items) {
  // Mostrar modal de PayPal
  const modal = getElement('paypal-modal');
  const container = getElement('paypal-button-container');

  if (modal && container) {
    modal.style.display = 'flex';

    // Limpiar botón anterior
    container.innerHTML = '';

    // Renderizar botón de PayPal
    paypal.Buttons({
      createOrder: function(data, actions) {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: total.toFixed(2),
              currency_code: 'USD'
            },
            description: `Pedido: ${items}`
          }]
        });
      },
      onApprove: function(data, actions) {
        return actions.order.capture().then(function(details) {
          showNotification('¡Pago completado! Gracias por tu compra.');
          cart = [];
          saveCart();
          updateCartUI();
          closePayPalModal();
        });
      },
      onError: function(err) {
        console.error('Error PayPal:', err);
        showNotification('Error al procesar pago con PayPal');
        closePayPalModal();
      }
    }).render('#paypal-button-container');
  }
}

function closePayPalModal() {
  const modal = getElement('paypal-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

function setupPWA() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.log('SW registrado:', reg))
      .catch(err => console.log('SW error:', err));
  }

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    getElement('installPrompt').classList.remove('hidden');
  });

  window.addEventListener('appinstalled', () => {
    getElement('installPrompt').classList.add('hidden');
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
  getElement('installPrompt').classList.add('hidden');
}

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

async function init() {
  window.updateQuantity = updateQuantity;
  window.removeFromCart = removeFromCart;

  loadCart();
  await loadProducts();
  setupAdminPanel();
  setupProductForm();
  setupMenuEvents();
  setupContactFields();
  setupPWA();
  renderMenu();
  updateCartUI();
}

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

document.addEventListener('DOMContentLoaded', init);
