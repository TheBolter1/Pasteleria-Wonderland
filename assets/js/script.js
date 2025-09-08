/* =========================================================================
   UTILIDADES GENERALES
   ========================================================================= */

/* Catálogo (localStorage) */
const CLAVE_CATALOGO = 'catalogoProductos';
const obtenerCatalogo = () => JSON.parse(localStorage.getItem(CLAVE_CATALOGO)) || [];
const guardarCatalogo = (lista) => localStorage.setItem(CLAVE_CATALOGO, JSON.stringify(lista));

/* Fallbacks simples */
window.toast = window.toast || (msg => alert(msg));
window.IMG_FALLBACK = window.IMG_FALLBACK || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

/* Utilidad: archivo -> dataURL (para imagen opcional del modal) */
function archivoADataUrl(archivo) {
  return new Promise((resolver, rechazar) => {
    const lector = new FileReader();
    lector.onload = () => resolver(lector.result);
    lector.onerror = rechazar;
    lector.readAsDataURL(archivo);
  });
}

/* =========================================================================
   UI GLOBAL (menú, submenús, carousel, sidebar)
   ========================================================================= */
function initUIGlobal() {
  document.addEventListener('click', (e) => {
    const btnSubmenu = e.target.closest('.submenu-toggle');
    const esNav = !!e.target.closest('.nav');

    if (!esNav) {
      document.querySelectorAll('.menu-item.has-children.is-open')
        .forEach(li => li.classList.remove('is-open'));
    } else if (btnSubmenu) {
      const li = btnSubmenu.closest('.menu-item.has-children');
      const isOpen = li.classList.toggle('is-open');
      if (isOpen) {
        document.querySelectorAll('.menu-item.has-children.is-open')
          .forEach(other => { if (other !== li) other.classList.remove('is-open'); });
      }
    }

    const sidebar = document.getElementById('sidebar');
    const isDesktop = () => window.matchMedia('(min-width: 992px)').matches;
    if (!isDesktop() && sidebar?.classList.contains('is-open')) {
      const clickInside = e.target.closest('#sidebar') || e.target.closest('#sidebarToggle');
      if (!clickInside) sidebar.classList.remove('is-open');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.menu-item.has-children.is-open')
        .forEach(li => li.classList.remove('is-open'));
    }
  });

  (function () {
    const myCarousel = document.querySelector('#Carousel');
    if (myCarousel && window.bootstrap?.Carousel) {
      new bootstrap.Carousel(myCarousel, { interval: 2000, touch: false });
    }
  })();

  (function () {
    const sidebar   = document.getElementById('sidebar');
    const btnToggle = document.getElementById('sidebarToggle');
    const isDesktop = () => window.matchMedia('(min-width: 992px)').matches;

    if (localStorage.getItem('sb-collapsed') === '1') {
      document.body.classList.add('sidebar-collapsed');
    }

    btnToggle?.addEventListener('click', () => {
      if (isDesktop()) {
        document.body.classList.toggle('sidebar-collapsed');
        localStorage.setItem('sb-collapsed',
          document.body.classList.contains('sidebar-collapsed') ? '1' : '0'
        );
      } else {
        sidebar?.classList.toggle('is-open');
      }
    });
  })();
}

/* =========================================================================
   CARRITO
   ========================================================================= */
function getCart() { return JSON.parse(localStorage.getItem("cart")) || []; }
function saveCart(cart) { localStorage.setItem("cart", JSON.stringify(cart)); }

function addToCart(producto) {
  let cart = getCart();
  let existing = cart.find(i => i.id === producto.id);
  if (existing) {
    if (existing.cantidad + producto.cantidad > 8) { alert(`⚠️ Máximo 8 unidades de ${producto.nombre}.`); return; }
    existing.cantidad += producto.cantidad;
  } else {
    if (producto.cantidad > 8) { alert(`⚠️ Máximo 8 unidades de ${producto.nombre}.`); return; }
    cart.push(producto);
  }
  saveCart(cart);
  alert(`${producto.nombre} agregado al carrito 🛒`);
}

function removeFromCart(id) {
  let cart = getCart();
  let item = cart.find(p => p.id === id);
  if (item) { if (item.cantidad > 1) item.cantidad -= 1; else cart = cart.filter(p => p.id !== id); }
  saveCart(cart); renderCart();
}
function increaseQuantity(id) {
  let cart = getCart(); let item = cart.find(p => p.id === id);
  if (item) { if (item.cantidad >= 8) { alert(`⚠️ Máximo 8 unidades de ${item.nombre}.`); return; } item.cantidad += 1; }
  saveCart(cart); renderCart();
}
function decreaseQuantity(id) {
  let cart = getCart(); let item = cart.find(p => p.id === id);
  if (item) { if (item.cantidad > 1) item.cantidad -= 1; else cart = cart.filter(p => p.id !== id); }
  saveCart(cart); renderCart();
}
function removeProduct(id) { saveCart(getCart().filter(p => p.id !== id)); renderCart(); }
function clearCart() { localStorage.removeItem("cart"); renderCart(); }

function renderCart() {
  const cart = getCart();
  const tbody = document.getElementById("cart-items");
  const totalSpan = document.getElementById("cart-total");
  if (!tbody || !totalSpan) return;

  tbody.innerHTML = "";
  let total = 0;

  if (cart.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5">Tu carrito está vacío</td></tr>`;
  } else {
    cart.forEach(item => {
      const subtotal = item.precio * item.cantidad; total += subtotal;
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.nombre}</td>
        <td>$${item.precio.toLocaleString('es-CL')}</td>
        <td class="cantidad-td">
          <button class="btn btn-sm btn-secondary" onclick="decreaseQuantity('${item.id}')">−</button>
          <span class="cantidad-badge" id="cant-${item.id}">${item.cantidad}</span>
          <button class="btn btn-sm btn-secondary" onclick="increaseQuantity('${item.id}')">+</button>
        </td>
        <td>$<span id="sub-${item.id}">${(item.precio * item.cantidad).toLocaleString('es-CL')}</span></td>
        <td><button class="btn btn-danger btn-sm" onclick="removeProduct('${item.id}')">Eliminar todo</button></td>
      `;
      tbody.appendChild(row);
    });
  }
  totalSpan.textContent = total.toLocaleString('es-CL');
}

/* =========================================================================
   TIENDA / CATÁLOGO (productos.html)
   ========================================================================= */
function renderProductos() {
  const cont = document.getElementById('productos-container');
  if (!cont) return;

  const params = new URLSearchParams(location.search);
  const filtroCat = params.get('categoria'); // ?categoria=...

  const lista = obtenerCatalogo();
  const mostrar = filtroCat ? lista.filter(p => p.categoria === filtroCat) : lista;

  cont.innerHTML = mostrar.length
    ? mostrar.map(p => `
      <div class="col-12 col-sm-6 col-md-4 col-lg-3">
        <div class="card h-100 shadow-sm">
          <img src="${p.imagen || ''}" class="card-img-top" alt="${p.nombre}">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${p.nombre}</h5>
            <p class="card-text">$${Number(p.precio).toLocaleString('es-CL')}</p>
            ${p.categoria ? `<small class="text-muted">${p.categoria}</small>` : ''}
          </div>
        </div>
      </div>`).join('')
    : '<p class="text-muted">No hay productos.</p>';
}
function initProductosPage() {
  if (document.getElementById("productos-container")) renderProductos();
}

/* =========================================================================
   HOME: TOP VENTAS
   ========================================================================= */
function initTopVentas() {
  const cont = document.getElementById("top-ventas-container");
  if (!cont) return;

  const catalogo = obtenerCatalogo();
  const topProductos = catalogo.slice(0, 4);

  cont.innerHTML = "";
  topProductos.forEach(prod => {
    const el = document.createElement("div");
    el.className = "col-12 col-sm-6 col-md-4 col-lg-3";
    el.innerHTML = `
      <div class="card h-100 shadow-sm">
        <img src="${prod.imagen || IMG_FALLBACK}" class="card-img-top" alt="${prod.nombre}">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${prod.nombre}</h5>
          <p class="card-text">$${prod.precio.toLocaleString('es-CL')}</p>
          <a href="productos.html#${prod.id}" class="btn btn-primary mt-auto">Ver Producto</a>
        </div>
      </div>`;
    cont.appendChild(el);
  });
}

/* =========================================================================
   CONTACTO (contacto.html)
   ========================================================================= */
function initContactoPage() {
  const formContacto = document.getElementById('form-contacto');
  if (!formContacto) return;

  const ordenInput   = document.getElementById('orden');
  const radiosMotivo = document.querySelectorAll('input[name="motivo"]');

  const toggleOrden = () => {
    if (!ordenInput) return;
    const esSoporte = [...radiosMotivo].some(r => r.checked && r.id === 'motivo-pedido');
    const grupoOrden = ordenInput.closest('.mb-3');
    if (grupoOrden) grupoOrden.style.display = esSoporte ? '' : 'none';
  };
  radiosMotivo.forEach(r => r.addEventListener('change', toggleOrden));
  toggleOrden();

  const STORAGE_KEY = 'pw_contactos';
  formContacto.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(formContacto);
    const nuevo = {
      nombre : (fd.get('nombre')  || '').trim(),
      email  : (fd.get('correo')  || '').trim(),
      orden  : (fd.get('orden')   || '').trim(),
      mensaje: (fd.get('mensaje') || '').trim(),
      fecha  : Date.now()
    };
    const lista = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    lista.unshift(nuevo);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    formContacto.reset();
    toggleOrden();
    alert('¡Mensaje enviado!');
  });

  const tablaCuerpo = document.getElementById('tabla-contactos-body');
  if (tablaCuerpo) {
    const escapar = (t='') => t.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    tablaCuerpo.innerHTML = items.length
      ? items.map((c,i)=>`
          <tr>
            <td>${i+1}</td>
            <td>${new Date(c.fecha).toLocaleString('es-CL')}</td>
            <td>${escapar(c.nombre)}</td>
            <td><a href="mailto:${escapar(c.email)}">${escapar(c.email)}</a></td>
            <td>${escapar(c.orden || '')}</td>
            <td style="white-space:pre-wrap;max-width:480px">${escapar(c.mensaje)}</td>
          </tr>`).join('')
      : `<tr><td colspan="6" class="text-muted text-center">Sin mensajes.</td></tr>`;
  }
}

/* =========================================================================
   ADMINISTRADOR (administrador.html): modal y guardado de productos
   ========================================================================= */
async function guardarProducto(e) {
  e.preventDefault();
  const $ = id => document.getElementById(id);

  const nombre    = $('p-nombre')?.value?.trim() ?? '';
  const precio    = Number($('p-precio')?.value ?? NaN);
  const categoria = $('p-categoria')?.value?.trim() ?? '';
  const urlImg    = $('p-imagen-url')?.value?.trim() ?? '';
  const fileImg   = $('p-imagen-archivo')?.files?.[0];

  if (!nombre || Number.isNaN(precio)) {
    toast('Completa nombre y  precio válidos');
    return;
  }

  let imagen = urlImg;
  if (!imagen && fileImg) {
    try { imagen = await archivoADataUrl(fileImg); }
    catch { imagen = IMG_FALLBACK; }
  }
  if (!imagen) imagen = IMG_FALLBACK;

  const catalogo = obtenerCatalogo();
  catalogo.push({
    id: Date.now().toString(),
    nombre,
    precio,
    categoria,
    imagen
  });
  guardarCatalogo(catalogo);

  $('formProducto')?.reset();
  const modalEl = $('modalProducto');
  if (modalEl && window.bootstrap) {
    bootstrap.Modal.getOrCreateInstance(modalEl).hide();
  }
  toast(`Producto "${nombre}" agregado`);

  if (typeof renderProductos === 'function') renderProductos();
  if (typeof renderTablaProductosAdmin === 'function') renderTablaProductosAdmin();
}

function initAdminPage() {
  const form = document.getElementById('formProducto');
  if (form && !form.dataset.bound) {
    form.addEventListener('submit', guardarProducto);
    form.dataset.bound = '1';
  }
  if (typeof renderTablaProductosAdmin === 'function') renderTablaProductosAdmin();
}

/* =========================================================================
   ARRANQUE ÚNICO
   ========================================================================= */
document.addEventListener("DOMContentLoaded", () => {
  initUIGlobal();
  renderCart();
  initProductosPage();
  initTopVentas();
  initContactoPage();
  initAdminPage();
});

/* =========================================================================
   COMPAT / NO-OP
   ========================================================================= */
function initCarrito() { /* reservado por si luego separas vistas */ }
