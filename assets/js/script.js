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

//Carousel
const myCarousel = document.querySelector('#Carousel');
if (myCarousel) {
  new bootstrap.Carousel(myCarousel, {
    interval: 2000,  
    touch: false     
  });
}

 // --- Carrito usando localStorage ---
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(product) {
  let cart = getCart(); // ✅ obtener carrito actual

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
    tbody.innerHTML = `<tr><td colspan="5">Tu carrito está vacío 🛍️</td></tr>`;
  } else {
    cart.forEach(item => {
      const subtotal = item.precio * item.cantidad;
      total += subtotal;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.nombre}</td>
        <td>$${item.precio}</td>
        <td>
          <button class="btn btn-sm btn-secondary" onclick="decreaseQuantity('${item.id}')">-</button>
          ${item.cantidad}
          <button class="btn btn-sm btn-secondary" onclick="increaseQuantity('${item.id}')">+</button>
        </td>
        <td>$${subtotal}</td>
        <td><button class="btn btn-danger btn-sm" onclick="removeProduct('${item.id}')">Eliminar todo</button></td>
      `;
      tbody.appendChild(row);
    });
  }

  totalSpan.textContent = total;
}

document.addEventListener("DOMContentLoaded", renderCart);


function renderProductos() {
  const catalogo = JSON.parse(localStorage.getItem("catalogoProductos")) || [];
  const contenedor = document.getElementById("productos-container");
  if (!contenedor) return; // por si no estamos en productos.html

  contenedor.innerHTML = "";

  catalogo.forEach(prod => {
    const muestraTortas = document.createElement("div");
    muestraTortas.className = "col-md-4 col-lg-3";

    muestraTortas.innerHTML = `
      <div class="card h-100 shadow-sm">
        <img src="${prod.imagen}" class="card-img-top" alt="${prod.nombre}">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${prod.nombre}</h5>
          <p class="card-text">$${prod.precio.toLocaleString()}</p>
          <button class="btn btn-primary mt-auto" onclick="addToCart({
            id: '${prod.id}', 
            nombre: '${prod.nombre}', 
            precio: ${prod.precio}, 
            cantidad: 1
          })">
            Agregar al carrito 🛒
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