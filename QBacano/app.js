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
  {
    id: 'emp3',
    category: 'empanadas',
    name: 'Empanada Pollo',
    description: 'Pollo desmenuzado con champiñones salteados y hierbas frescas.',
    price: 2.75,
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80',
    available: true,
    is_combo: false,
  },
  {
    id: 'sal1',
    category: 'salchipapas',
    name: 'Salchipapa Clásica',
    description: 'Papas crujientes, salchicha premium, queso costeño, salsas y huevo.',
    price: 6.5,
    image: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=600&q=80',
    available: true,
    is_combo: false,
  },
  {
    id: 'sal2',
    category: 'salchipapas',
    name: 'Salchipapa Especial',
    description: 'Doble salchicha, tocino, maíz, piña, queso mozzarella y salsa secreta.',
    price: 8.9,
    image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=600&q=80',
    available: true,
    is_combo: false,
  },
  {
    id: 'pos1',
    category: 'postres',
    name: 'Torta de Chocolate',
    description: 'Esponjoso bizcocho de chocolate con frosting de crema y nueces.',
    price: 3.5,
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=600&q=80',
    available: true,
    is_combo: false,
  },
  {
    id: 'pos2',
    category: 'postres',
    name: 'Brownies con Nueces',
    description: 'Intenso chocolate con nueces caramelizadas. Servido con helado.',
    price: 4.0,
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80',
    available: true,
    is_combo: false,
  },
  {
    id: 'pos3',
    category: 'postres',
    name: 'Helado Artesanal',
    description: 'Variedades: Vainilla, Chocolate, Fresa o Maracuyá. Bola grande.',
    price: 2.5,
    image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=600&q=80',
    available: true,
    is_combo: false,
  },
  {
    id: 'pos4',
    category: 'postres',
    name: 'Donas Glaseadas',
    description: 'Donas esponjosas con glaseado de chocolate o vainilla. Caja x3.',
    price: 5.0,
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=600&q=80',
    available: true,
    is_combo: false,
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
    is_combo: product.is_combo ?? false,
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
      is_combo: product.is_combo,
    })
    .eq('id', product.id);

  if (error) {
    console.error('Error en update:', error);
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
  items.sort((a, b) => b.price - a.price);
  if (items.length === 0) {
    grid.innerHTML = '<p class="empty-message">No hay productos en esta categoría todavía.</p>';
    return;
  }

  grid.innerHTML = items.map(product => {
  const isTop = product.price === items[0].price;

  return`
    <div class="menu-item${product.available ? '' : ' unavailable'} ${isTop ? 'top-product' : ''}" data-id="${product.id}" data-available="${product.available}">
      <div class="product-badge unavailable-badge${product.available ? ' hidden' : ''}">Agotado</div>
      <img src="${product.image || 'img/LOGO.jpg'}" alt="${product.name}" loading="lazy" onerror="this.src='img/LOGO.jpg'">
      <div class="menu-content">
        <h3>
            ${product.name}
            ${product.name.toLowerCase().includes('combo') ? '🔥' : ''}
        </h3>
        <p>${product.description}</p>
        <div class="price">$${product.price.toFixed(2)}${category === 'empanadas' ? ' c/u' : ''}</div>
        <div class="product-actions">
          <button type="button" class="btn-add-cart" data-action="add" data-product-id="${product.id}" ${product.available ? '' : 'disabled'}>🔥Pedir ahora</button>
          <button type="button" class="toggle-availability admin-only hidden" data-action="toggle-availability" data-product-id="${product.id}">🔘 Activar/Desactivar</button>
          <button type="button" class="btn btn-secondary admin-only hidden" data-action="edit" data-product-id="${product.id}">✏️ Editar</button>
          <button type="button" class="btn btn-danger admin-only hidden" data-action="delete" data-product-id="${product.id}">🗑️ Eliminar</button>
        </div>
      </div>
    </div>
  `}).join('');
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

  // 🛒 PRIMERO agregar al carrito
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

  // 🔥 SUGERIR COMBO (si no es combo)
  if (!product.is_combo) {
    const combo = products.find(p => 
      p.is_combo &&
      p.category === product.category &&
      p.price > product.price
    );

    if (combo) {
      setTimeout(() => {
        const confirmUpgrade = confirm(
          `🔥 Mejora tu pedido\n\nPor solo $${combo.price - product.price} más puedes llevar:\n${combo.name}\n\n¿Quieres cambiarlo?`
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

  // 🧀 EXTRAS PARA TODOS LOS PRODUCTOS (SELECCIÓN MÚLTIPLE)
const extras = products.filter(p =>
  p.category === 'extras' || p.category === 'bebidas'
);

if (extras.length > 0) {
  setTimeout(async () => {
    // Crear modal personalizado para selección múltiple
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
    cartEmpty.classList.remove('hidden');
    cartItems.classList.add('hidden');
    cartTotal.classList.add('hidden');
    paymentMethods.classList.add('hidden');
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
  updateWhatsAppLink(total);
}

function updateWhatsAppLink(total) {
  const customerName = getElement('customerName')?.value.trim() || 'No especificado';
  const customerPhone = getElement('customerPhone')?.value.trim() || 'No especificado';
  const customerAddress = getElement('customerAddress')?.value.trim() || 'No especificado';
  const items = cart.map(item => `${item.quantity}x ${item.name} ($${(item.price * item.quantity).toFixed(2)})`).join('\n');

  const message = ` *Nuevo pedido - Q'Bacano* 
    - Nombre: ${customerName}
    - Teléfono: ${customerPhone}
    - Dirección: ${customerAddress}

    - *Pedido:*
      ${items}

    *Total: $${total.toFixed(2)}*

    _Listo para confirmar_`;
  const businessPhone = '529812100778';
  const waUrl = `https://wa.me/${businessPhone}?text=${encodeURIComponent(message)}`;
  const whatsappLink = getElement('whatsappLink');
  if (whatsappLink) {
    whatsappLink.href = waUrl;
  }
  const paymentWhatsAppBtn = getElement('paymentWhatsAppBtn');
  if (paymentWhatsAppBtn) {
    paymentWhatsAppBtn.href = waUrl;
  }
}

function isContactDataValid() {
  const name = getElement('customerName')?.value.trim();
  const phone = getElement('customerPhone')?.value.trim();
  const address = getElement('customerAddress')?.value.trim();
  return Boolean(name && phone && address);
}

function getContactValidationMessage() {
  const missing = [];
  const name = getElement('customerName')?.value.trim();
  const phone = getElement('customerPhone')?.value.trim();
  const address = getElement('customerAddress')?.value.trim();

  if (!name) missing.push('Nombre');
  if (!phone) missing.push('Teléfono / WhatsApp');
  if (!address) missing.push('Dirección');

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

  // 📥 Guardar pedido en Supabase (no bloquea WhatsApp si falla)
  await saveOrderToSupabase();

  const paymentWhatsAppBtn = getElement('paymentWhatsAppBtn');
  if (paymentWhatsAppBtn && paymentWhatsAppBtn.href) {
    window.open(paymentWhatsAppBtn.href, '_blank');
    showNotification('✅ Pedido guardado y enviado. Abriendo WhatsApp...');
    
    // 🧼 Limpiar carrito y formulario
    cart = [];
    saveCart();
    updateCartUI();
    getElement('customerName').value = '';
    getElement('customerPhone').value = '';
    getElement('customerAddress').value = '';
  }
  closeWhatsAppConfirmModal();
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
  getElement('productImage').value = product.image || '';

  // ✅ Lectura segura desde BD (maneja null, strings, booleans)
  const availableInput = getElement('productAvailable');
  if (availableInput) availableInput.checked = product.available !== false; // Si es null/undefined, asume true

  const comboInput = getElement('is_combo');
  if (comboInput) comboInput.checked = product.is_combo === true || product.is_combo === 'true' || product.is_combo === 1;

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

  // ✅ Por defecto: Disponible SÍ, Combo NO
  const availableInput = getElement('productAvailable');
  if (availableInput) availableInput.checked = true;

  const comboInput = getElement('is_combo');
  if (comboInput) comboInput.checked = false;
}

async function handleProductFormSubmit(event) {
  event.preventDefault();
  const id = getElement('productId').value;
  const category = getElement('productCategory').value;
  const name = getElement('productName').value.trim();
  const description = getElement('productDescription').value.trim();
  const price = parseFloat(getElement('productPrice').value);
  const image = getElement('productImage').value.trim() || 'img/LOGO.jpg';
  const availableInput = getElement('productAvailable');
  const available = availableInput ? availableInput.checked : true;
  const comboInput = getElement('is_combo');
  const is_combo = comboInput ? comboInput.checked : false;

  if (!name || !description || Number.isNaN(price)) {
    alert('Completa todos los campos del producto.');
    return;
  }

  console.log('DATA A GUARDAR:', {
    available,
    is_combo
  });

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
        is_combo,
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
        is_combo,
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

  adminToggle.addEventListener('click', async () => {
    // Si ya está logueado, cerrar sesión
    if (isAdmin) {
      logoutAdmin();
      return;
    }
    
    const key = prompt('Ingrese la clave de acceso de administrador:');
    if (!key || key.trim() === '') return;

    showNotification('⏳ Verificando clave...');
    
    try {
      const { data, error } = await supabase
        .from('admin_access')
        .select('id')
        .eq('access_key', key.trim())
        .eq('is_active', true)
        .single();

      if (data && !error) {
        isAdmin = true;
        toggleAdminMode(true);
        adminPanel.classList.remove('hidden');
        showNotification('✅ Acceso concedido. Sesión expira en 10 min');
        resetAdminSessionTimer(); // Iniciar timer
      } else {
        alert('❌ Clave incorrecta, no activa o no existe.');
      }
    } catch (err) {
      console.error('Error verificando admin:', err);
      alert('❌ Error de conexión con la base de datos.');
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

  // Botón de estadísticas
  const viewStatsBtn = getElement('viewStatsBtn');
  if (viewStatsBtn) {
    viewStatsBtn.addEventListener('click', () => {
      const container = getElement('adminStatsContainer');
      container.classList.toggle('hidden');
      if (!container.classList.contains('hidden')) {
        loadAdminStats();
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
      
      select.disabled = true; // Evita doble clic
      
      const success = await updateOrderStatus(orderId, newStatus);
      if (success) {
        select.dataset.prev = newStatus;
        showNotification(`✅ Pedido #${orderId} actualizado a: ${newStatus}`);
        // Opcional: recargar historial para mantener sincronía
        // loadAdminStats(); 
      } else {
        select.value = prevStatus; // Revierte si falla
      }
      select.disabled = false;
    }
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
    } else if (action === 'whatsapp-order') {
      handleWhatsAppOrder(event);
    } else if (action === 'confirm-whatsapp') {
      handleWhatsAppConfirm();
    } else if (action === 'cancel-whatsapp') {
      closeWhatsAppConfirmModal();
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

// ===== VARIABLES DE SESIÓN =====
let adminSessionTimeout = null;
const SESSION_DURATION = 10 * 60 * 1000; // 30 minutos en milisegundos

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
  toggleAdminMode(false);
  getElement('adminPanel').classList.add('hidden');
  showNotification('🔒 Sesión de administrador expirada por inactividad');
  
  if (adminSessionTimeout) {
    clearTimeout(adminSessionTimeout);
  }
}

// Resetear timer en cualquier interacción del usuario
document.addEventListener('click', () => {
  if (isAdmin) resetAdminSessionTimer();
});

document.addEventListener('keypress', () => {
  if (isAdmin) resetAdminSessionTimer();
});

function showExtrasModal(extras) {
  return new Promise((resolve) => {
    // Crear elementos del modal
    const modal = document.createElement('div');
    modal.className = 'extras-modal';
    modal.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 1rem;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: white;
      border-radius: 16px;
      padding: 2rem;
      max-width: 500px;
      width: 100%;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    `;
    
    // Título
    const title = document.createElement('h3');
    title.textContent = '🔥 ¿Quieres agregar algo más?';
    title.style.cssText = 'margin-bottom: 1.5rem; color: var(--primary); font-size: 1.5rem;';
    
    // Lista de checkboxes
    const list = document.createElement('div');
    list.style.cssText = 'margin-bottom: 1.5rem;';
    
    extras.forEach((extra, index) => {
      const item = document.createElement('label');
      item.style.cssText = `
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        margin-bottom: 0.75rem;
        background: #f8f9fa;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.2s;
        border: 2px solid transparent;
      `;
      
      item.onmouseenter = () => item.style.borderColor = 'var(--primary)';
      item.onmouseleave = () => item.style.borderColor = 'transparent';
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = index;
      checkbox.style.cssText = 'width: 20px; height: 20px; cursor: pointer;';
      
      const info = document.createElement('div');
      info.style.cssText = 'flex: 1;';
      
      const name = document.createElement('div');
      name.textContent = extra.name;
      name.style.cssText = 'font-weight: 600; color: var(--dark);';
      
      const price = document.createElement('div');
      price.textContent = `+$${extra.price.toFixed(2)}`;
      price.style.cssText = 'color: var(--primary); font-weight: 700;';
      
      info.appendChild(name);
      info.appendChild(price);
      item.appendChild(checkbox);
      item.appendChild(info);
      list.appendChild(item);
    });
    
    // Botones
    const buttons = document.createElement('div');
    buttons.style.cssText = 'display: flex; gap: 1rem; justify-content: flex-end;';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.style.cssText = `
      padding: 0.75rem 1.5rem;
      border: 2px solid #ddd;
      background: white;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
    `;
    cancelBtn.onclick = () => {
      modal.remove();
      resolve([]);
    };
    
    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = 'Agregar seleccionados';
    confirmBtn.style.cssText = `
      padding: 0.75rem 1.5rem;
      background: var(--success);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
    `;
    confirmBtn.onmouseenter = () => confirmBtn.style.background = '#219a52';
    confirmBtn.onmouseleave = () => confirmBtn.style.background = 'var(--success)';
    confirmBtn.onclick = () => {
      const checkboxes = list.querySelectorAll('input[type="checkbox"]:checked');
      const selected = Array.from(checkboxes).map(cb => extras[parseInt(cb.value)]);
      modal.remove();
      resolve(selected);
    };
    
    buttons.appendChild(cancelBtn);
    buttons.appendChild(confirmBtn);
    
    // Ensamblar modal
    modalContent.appendChild(title);
    modalContent.appendChild(list);
    modalContent.appendChild(buttons);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Cerrar al hacer clic fuera
    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.remove();
        resolve([]);
      }
    };
  });
}

// ===== GUARDAR PEDIDO EN SUPABASE =====
async function saveOrderToSupabase() {
  const customerName = getElement('customerName')?.value.trim() || 'No especificado';
  const customerPhone = getElement('customerPhone')?.value.trim() || 'No especificado';
  const customerAddress = getElement('customerAddress')?.value.trim() || 'No especificado';
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const orderData = {
    customer_name: customerName,
    customer_phone: customerPhone,
    customer_address: customerAddress,
    items: cart.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    })),
    total: total,
    status: 'pending',
    payment_method: 'whatsapp'
  };

  try {
    const { error } = await supabase.from('orders').insert([orderData]);
    if (error) throw error;
    console.log('✅ Pedido guardado en Supabase');
    return true;
  } catch (err) {
    console.error('❌ Error guardando pedido:', err);
    showNotification('⚠️ Error al guardar en la nube. El pedido se enviará igual.');
    return false;
  }
}

// ===== ESTADÍSTICAS E HISTORIAL PARA ADMIN =====
async function loadAdminStats() {
  const container = getElement('adminStatsContainer');
  if (!container) return;
  container.innerHTML = '<p style="text-align:center; padding:2rem;">⏳ Cargando estadísticas...</p>';

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    if (!data || data.length === 0) {
      container.innerHTML = '<p class="empty-history">No hay pedidos registrados aún.</p>';
      return;
    }

    // 📊 Cálculos en memoria (rápido y seguro con JSONB)
    let totalSales = 0;
    let todaySales = 0;
    const productCounts = {};
    const today = new Date().toDateString();

    data.forEach(order => {
      totalSales += order.total || 0;
      if (new Date(order.created_at).toDateString() === today) todaySales += order.total || 0;
      
      if (Array.isArray(order.items)) {
        order.items.forEach(item => {
          productCounts[item.name] = (productCounts[item.name] || 0) + item.quantity;
        });
      }
    });

    const topProducts = Object.entries(productCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, qty]) => `${name} (${qty}x)`);

    renderStatsUI({ totalSales, todaySales, topProducts, recentOrders: data });
  } catch (err) {
    console.error('Error cargando estadísticas:', err);
    container.innerHTML = '<p class="empty-history">❌ Error al cargar datos.</p>';
  }
}

function renderStatsUI(stats) {
  const container = getElement('adminStatsContainer');
  container.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card"><h4>💰 Ventas Totales</h4><p class="stat-value">$${stats.totalSales.toFixed(2)}</p></div>
      <div class="stat-card"><h4>📅 Ventas Hoy</h4><p class="stat-value">$${stats.todaySales.toFixed(2)}</p></div>
      <div class="stat-card full-width"><h4>🔥 Top 5 Productos</h4><p class="stat-list">${stats.topProducts.join(' • ') || 'Sin datos aún'}</p></div>
    </div>
    <h4 style="margin: 1.5rem 0 1rem; color: var(--primary);">📜 Gestión de Pedidos</h4>
    <div class="history-scroll">
      <table class="admin-history-table">
        <thead><tr><th>Fecha</th><th>Cliente</th><th>Productos</th><th>Total</th><th>Estado</th></tr></thead>
        <tbody>
          ${stats.recentOrders.map(order => {
            const status = order.status || 'pending';
            return `
              <tr>
                <td><small>${new Date(order.created_at).toLocaleDateString()}</small></td>
                <td><strong>${order.customer_name}</strong><br><small>${order.customer_phone}</small></td>
                <td>${Array.isArray(order.items) ? order.items.map(i => `${i.quantity}x ${i.name}`).join(', ') : '-'}</td>
                <td class="price-cell">$${(order.total || 0).toFixed(2)}</td>
                <td>
                  <select class="status-dropdown" data-order-id="${order.id}" data-prev="${status}">
                    <option value="pending" ${status === 'pending' ? 'selected' : ''}>⏳ Pendiente</option>
                    <option value="confirmed" ${status === 'confirmed' ? 'selected' : ''}>✅ Confirmado</option>
                    <option value="delivered" ${status === 'delivered' ? 'selected' : ''}>📦 Entregado</option>
                    <option value="cancelled" ${status === 'cancelled' ? 'selected' : ''}>❌ Cancelado</option>
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

// ===== ACTUALIZAR ESTADO DEL PEDIDO =====
async function updateOrderStatus(orderId, newStatus) {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);
    
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error actualizando estado:', err);
    showNotification('❌ Error al actualizar el estado del pedido.');
    return false;
  }
}

document.addEventListener('DOMContentLoaded', init);
