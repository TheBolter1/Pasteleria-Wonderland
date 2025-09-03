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
  let cart = getCart();
  let existing = cart.find(item => item.id === product.id);

  if (existing) {
    existing.cantidad += product.cantidad;
  } else {
    cart.push(product);
  }

  saveCart(cart);
  alert(`${product.nombre} agregado al carrito 🛒`);
}

// Eliminar producto del carrito
function removeFromCart(id) {
  let cart = getCart().filter(item => item.id !== id);
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
        <td>${item.cantidad}</td>
        <td>$${subtotal}</td>
        <td><button class="btn btn-danger btn-sm" onclick="removeFromCart(${item.id})">Eliminar</button></td>
      `;
      tbody.appendChild(row);
    });
  }

  totalSpan.textContent = total;
}


document.addEventListener("DOMContentLoaded", renderCart);
