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
document.addEventListener("DOMContentLoaded", renderCart);

function renderProductos() {
  const catalogo = JSON.parse(localStorage.getItem("catalogoProductos")) || [];
  const contenedor = document.getElementById("productos-container");
  if (!contenedor) return;

  // Leer categoría desde URL
  const params = new URLSearchParams(window.location.search);
  const categoria = params.get("categoria");
  const productosMostrar = categoria ? catalogo.filter(p => p.categoria === categoria) : catalogo;

  // Título dinámico
  const titulo = document.querySelector('main h2');
  if (titulo) titulo.textContent = categoria ? categoria : 'Nuestros Productos';

  contenedor.innerHTML = "";

  productosMostrar.forEach((prod, index) => {
  const muestraTortas = document.createElement("div");
  muestraTortas.className = "col-12 col-sm-6 col-md-4 col-lg-3";

  // Botón de agregar al carrito
  let boton = `<button class="btn btn-primary mt-auto text-white w-100" onclick="addToCart({
    id: '${prod.id}',
    nombre: '${prod.nombre}',
    precio: ${prod.precio},
    cantidad: 1
  })">Agregar al carrito</button>`;

  muestraTortas.innerHTML = `
    <div class="card h-100 shadow-sm">
      <img src="${prod.imagen}" class="card-img-top" alt="${prod.nombre}">
      <div class="card-body d-flex flex-column">
        <h5 class="card-title">${prod.nombre}</h5>
        <p class="card-text">$${prod.precio.toLocaleString()}</p>
        ${boton}
      </div>
    </div>
  `;
  contenedor.appendChild(muestraTortas);
});

}


/* =========================================================================
   TIENDA / CATÁLOGO (productos.html)
   ========================================================================= */
/* =========================================================================
   TIENDA / CATÁLOGO (productos.html)
   ========================================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const catalogo = JSON.parse(localStorage.getItem("catalogoProductos")) || [];
  const container = document.getElementById("top-ventas-container");

  if (!container) return;

  // tomamos los primeros 4 productos
  const topProductos = catalogo.slice(0, 4);

  topProductos.forEach((prod, index) => {
    const crearElemento = document.createElement("div");
    crearElemento.className = "col-12 col-sm-6 col-md-4 col-lg-3";

    // Solo los primeros 2 productos tendrán el link funcional usando viewProduct()
    let botonDetalle = '';
    if(index === 0 || index === 1) {
      botonDetalle = `<button class="btn btn-primary mt-auto text-white w-100" onclick="viewProduct('${prod.id}')">Ver Producto</button>`;
    } else {
      botonDetalle = `<button class="btn btn-secondary mt-auto text-white w-100" disabled>Ver Producto</button>`;
    }

    crearElemento.innerHTML = `
      <div class="card h-100 shadow-sm">
        <img src="${prod.imagen}" class="card-img-top" alt="${prod.nombre}">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${prod.nombre}</h5>
          <p class="card-text">$${prod.precio.toLocaleString()}</p>
          ${botonDetalle}
        </div>
      </div>
    `;

    container.appendChild(crearElemento);
  });
});

// Función para redireccionar al detalle
function viewProduct(id) {
  localStorage.setItem("productoSeleccionado", id);
  window.location.href = "detalle.html";
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
  document.getElementById('menu-edit-product')?.addEventListener('click', (e) => {
    e.preventDefault();
    // TODO: navega a tu pestaña/listado de productos en modo edición:
    // location.href = 'administrador.html#productos?mode=edit';
    // o dispara un modal de edición si lo tienes:
    // new bootstrap.Modal(document.getElementById('modalEditarProducto')).show();
  });

  document.getElementById('menu-show-product')?.addEventListener('click', (e) => {
    e.preventDefault();
    // TODO: mostrar listado de productos:
    // location.href = 'administrador.html#productos';
  });

  document.getElementById('menu-show-emp')?.addEventListener('click', () => {
    window.location.href = 'personal.html';
  });

  document.getElementById('menu-show-emp')?.addEventListener('click', () => {
    window.location.href = 'personal.html';
  });

  document.getElementById('menu-show-emp')?.addEventListener('click', () => {
    window.location.href = 'personal.html';
  });

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

if (!localStorage.getItem('catalogoProductos')) {
    const productos = [ 
      { id: "TC001", nombre: "Torta Cuadrada de Chocolate", precio: 45000, categoria: "Tortas Cuadradas", imagen: "assets/img/catalogo/tortas-cuadradas/cuadrada-chocolate.jpg" },
      { id: "TC002", nombre: "Torta Cuadrada de Frutas", precio: 50000, categoria: "Tortas Cuadradas", imagen: "assets/img/catalogo/tortas-cuadradas/cuadrada-frutas.jpg" },
      // ... resto de productos
    ];
    localStorage.setItem('catalogoProductos', JSON.stringify(productos));
}


                // Función para mostrar el detalle de un producto
function renderDetalle(product) {
  const contenedor = document.getElementById("detalle-producto");
  if (!contenedor) return;

  contenedor.innerHTML = `
    <div class="col-md-6">
      <img src="${product.imagen}" alt="${product.nombre}" class="img-fluid rounded shadow">
    </div>
    <div class="col-md-6">
      <h2 class="mb-3">${product.nombre}</h2>
      <p>${product.descripcion || "Una mezcla de frutas frescas y crema chantilly sobre un suave bizcocho de vainilla, ideal para celebraciones."}</p>
      <h4 class="text-success mb-4">$${product.precio.toLocaleString()}</h4>
      <button class="btn btn-primary w-100" onclick="addToCart({
        id:'${product.id}', nombre:'${product.nombre}', precio:${product.precio}, cantidad:1
      })">Agregar al carrito</button>
    </div>
  `;
}

// Cargar detalle al entrar a detalle.html
document.addEventListener("DOMContentLoaded", () => {
  const id = localStorage.getItem("productoSeleccionado");
  if (!id) return;

  const catalogo = JSON.parse(localStorage.getItem("catalogoProductos")) || [];
  const producto = catalogo.find(p => p.id === id);
  if (!producto) return;

  renderDetalle(producto);
});

function viewProduct(id) {
  localStorage.setItem("productoSeleccionado", id);

  // Redireccionar según el id del producto
  if (id === "TC001") {
    window.location.href = "detalle1.html";
  } else if (id === "TC002") {
    window.location.href = "detalle2.html";
  } else {
    alert("Producto sin detalle disponible.");
  }
}
document.addEventListener("DOMContentLoaded", () => {
    renderProductos();
});
