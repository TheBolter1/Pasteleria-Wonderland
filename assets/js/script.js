//Funcionalidades de la página
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.submenu-toggle');
  const nav = e.target.closest('.nav');

  if (!nav) {
    document.querySelectorAll('.menu-item.has-children.is-open')
      .forEach(li => li.classList.remove('is-open'));
    return;
  }

  // Toggle del submenú al pulsar el botón
  if (btn) {
    const li = btn.closest('.menu-item.has-children');
    const isOpen = li.classList.toggle('is-open');
    
    // cerrar otros submenús abiertos, no se si esta bien, pero Chat GPT me ayudo a sacar esta lógica
    if (isOpen) {
      document.querySelectorAll('.menu-item.has-children.is-open')
        .forEach(other => { if (other !== li) other.classList.remove('is-open'); });
    }
  }
});

// Cerrar con el esc, será buena idea?
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.menu-item.has-children.is-open')
      .forEach(li => li.classList.remove('is-open'));
  }
});

//Carousel (solo si existe y si está bootstrap disponible)
(function () {
  const myCarousel = document.querySelector('#Carousel');
  if (myCarousel && window.bootstrap?.Carousel) {
    new bootstrap.Carousel(myCarousel, {
      interval: 2000,
      touch: false
    });
  }
})();

 // --- Carrito usando localStorage ---
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(product) {
  let cart = getCart(); 

  let existing = cart.find(item => item.id === product.id);

  if (existing) {
    if (existing.cantidad + product.cantidad > 8) {
      alert(`⚠️ Máximo 8 unidades de ${product.nombre}. Contáctanos para más información.`);
      return;
    }
    existing.cantidad += product.cantidad;
  } else {
    if (product.cantidad > 8) {
      alert(`⚠️ Máximo 8 unidades de ${product.nombre}. Contáctanos para más información.`);
      return;
    }
    cart.push(product);
  }

  saveCart(cart);
  alert(`${product.nombre} agregado al carrito 🛒`);
}


// Eliminar producto del carrito
// Eliminar una unidad de un producto del carrito
function removeFromCart(id) {
  let cart = getCart();
  let item = cart.find(p => p.id === id);

  if (item) {
    if (item.cantidad > 1) {
      item.cantidad -= 1; // resta solo una unidad
    } else {
      // si queda en 0, lo eliminamos del carrito
      cart = cart.filter(p => p.id !== id);
    }
  }

  saveCart(cart);
  renderCart();
  
}

function increaseQuantity(id) {
  let cart = getCart();
  let item = cart.find(p => p.id === id);
  if (item) {
    if (item.cantidad >= 8) {
      alert(`⚠️ Máximo 8 unidades de ${item.nombre}. Contáctanos para más información.`);
      return;
    }
    item.cantidad += 1;
  }
  saveCart(cart);
  renderCart();
}

function decreaseQuantity(id) {
  let cart = getCart();
  let item = cart.find(p => p.id === id);
  if (item) {
    if (item.cantidad > 1) {
      item.cantidad -= 1;
    } else {
      cart = cart.filter(p => p.id !== id);
    }
  }
  saveCart(cart);
  renderCart();
}

// Eliminar el producto completo (todas las cantidades)
function removeProduct(id) {
  let cart = getCart().filter(p => p.id !== id);
  saveCart(cart);
  renderCart();
}

// Mostrar carrito 
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
      const subtotal = item.precio * item.cantidad;
      total += subtotal;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.nombre}</td>
        <td>$${item.precio.toLocaleString('es-CL')}</td>
        <td class="cantidad-td">
          <button class="btn btn-sm btn-secondary cantidad-btn"
            onclick="decreaseQuantity('${item.id}')">−</button>
          <span class="cantidad-badge" id="cant-${item.id}">${item.cantidad}</span>
          <button class="btn btn-sm btn-secondary cantidad-btn"
            onclick="increaseQuantity('${item.id}')">+</button>
        </td>
        <td>$<span id="sub-${item.id}">
            ${(item.precio * item.cantidad).toLocaleString('es-CL')}
        </span></td>
        <td>
          <button class="btn btn-danger btn-sm"
            onclick="removeProduct('${item.id}')">Eliminar todo</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  totalSpan.textContent = total.toLocaleString('es-CL');
}

//----------------------------------------------------------------------------------------
//Carrito de compras
document.addEventListener("DOMContentLoaded", renderCart);

function renderProductos() {
  const catalogo = JSON.parse(localStorage.getItem("catalogoProductos")) || [];
  const contenedor = document.getElementById("productos-container");
  if (!contenedor) return;

  contenedor.innerHTML = "";

  // --- leer categoría desde la URL ---
  const params = new URLSearchParams(window.location.search);
  const categoria = params.get("categoria"); 

  let productosMostrar = catalogo;
  if (categoria) {
    productosMostrar = catalogo.filter(prod => prod.categoria.includes(categoria));
    const titulo = document.querySelector("main h2");
    if (titulo) titulo.textContent = `Productos: ${categoria}`;
  }

  if (productosMostrar.length === 0) {
    contenedor.innerHTML = `<p>No hay productos en esta categoría</p>`;
    return;
  }

  productosMostrar.forEach(prod => {
    const muestraTortas = document.createElement("div");
    muestraTortas.className = "col-12 col-sm-6 col-md-4 col-lg-3";

    muestraTortas.innerHTML = `
      <div class="card h-100 shadow-sm">
        <img src="${prod.imagen}" class="card-img-top" alt="${prod.nombre}" id="productos-card">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${prod.nombre}</h5>
          <p class="card-text">$${prod.precio.toLocaleString()}</p>
          <button class="btn btn-primary mt-auto" onclick="addToCart({
            id: '${prod.id}', 
            nombre: '${prod.nombre}', 
            precio: ${prod.precio}, 
            cantidad: 1
          })">
            Agregar al carrito
          </button>
        </div>
      </div>
    `;
    contenedor.appendChild(muestraTortas);
  });
}

// Vaciar todo el carrito
function clearCart() {
  localStorage.removeItem("cart"); // elimina el carrito del localStorage
  renderCart(); // vuelve a pintar la tabla (queda vacía)
}

// Llamar solo si estamos en productos.html
document.addEventListener("DOMContentLoaded", () => {
  renderProductos();
});
//--------------------------------------------------------------------
//Productos de mayor venta 
document.addEventListener("DOMContentLoaded", () => {
  const catalogo = JSON.parse(localStorage.getItem("catalogoProductos")) || [];
  const container = document.getElementById("top-ventas-container");

  // tome los primeros 3 jijis 
  const topProductos = catalogo.slice(0, 4);

  topProductos.forEach(prod => {
    const crearElemento = document.createElement("div");
    crearElemento.className = "col-12 col-sm-6 col-md-4 col-lg-3";

    crearElemento.innerHTML = `
      <div class="card h-100 shadow-sm">
        <img src="${prod.imagen}" class="card-img-top" alt="${prod.nombre}">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${prod.nombre}</h5>
          <p class="card-text">$${prod.precio.toLocaleString()}</p>
          <a href="productos.html#${prod.id}" class="btn btn-primary mt-auto">Ver Producto</a>
        </div>
      </div>
    `;
    container.appendChild(crearElemento);
  });
});

//Contacto.html
  (function contacto() {
    const formContacto = document.getElementById('form-contacto');
    if (!formContacto) return; // si no estamos en contacto.html, salir

    // Mostrar/ocultar Nº de orden según "Soporte de pedido"
    const ordenInput   = document.getElementById('orden');
    const radiosMotivo = document.querySelectorAll('input[name="motivo"]');

    const toggleOrden = () => {
      if (!ordenInput) return;
      const esSoporte = [...radiosMotivo].some(r => r.checked && r.id === 'motivo-pedido');
      const grupoOrden = ordenInput.closest('.mb-3'); // tu markup
      if (grupoOrden) grupoOrden.style.display = esSoporte ? '' : 'none';
    };
    radiosMotivo.forEach(r => r.addEventListener('change', toggleOrden));
    toggleOrden();

    // Guardar en localStorage
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
      toggleOrden(); // para ocultar orden si vuelve a "Otros"
      alert('¡Mensaje enviado!');
    });

    // (Opcional) Si tienes una tabla de “admin” para ver mensajes:
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
  })();

  //SideBar
  const sidebar   = document.getElementById('sidebar');
  const main      = document.getElementById('main');
  const btnToggle = document.getElementById('sidebarToggle');
  const isDesktop = () => window.matchMedia('(min-width: 992px)').matches;

  // Restaurar preferencia (solo escritorio)
  if (localStorage.getItem('sb-collapsed') === '1') {
    document.body.classList.add('sidebar-collapsed');
  }

  btnToggle?.addEventListener('click', () => {
    if (isDesktop()) {
      document.body.classList.toggle('sidebar-collapsed');
      localStorage.setItem(
        'sb-collapsed',
        document.body.classList.contains('sidebar-collapsed') ? '1' : '0'
      );
    } else {
      // Comportamiento móvil (off-canvas)
      sidebar.classList.toggle('is-open');
    }
  });

  // Cerrar off-canvas al hacer click fuera en móvil (opcional)
  document.addEventListener('click', (e) => {
    if (!isDesktop() && sidebar.classList.contains('is-open')) {
      const clickInside = e.target.closest('#sidebar') || e.target.closest('#sidebarToggle');
      if (!clickInside) sidebar.classList.remove('is-open');
    }
  });
