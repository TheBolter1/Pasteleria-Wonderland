const productos = [ 
  { id: "TC001", nombre: "Torta Cuadrada de Chocolate", precio: 45000, categoria: "Tortas Cuadradas", imagen: "assets/img/catalogo/tortas-cuadradas/cuadrada-chocolate.jpg" },
  { id: "TC002", nombre: "Torta Cuadrada de Frutas", precio: 50000, categoria: "Tortas Cuadradas", imagen: "assets/img/catalogo/tortas-cuadradas/cuadrada-frutas.jpg" },
  { id: "TT001", nombre: "Torta Circular de Vainilla", precio: 40000, categoria: "Tortas Circulares", imagen: "assets/img/catalogo/tortas-circulares/circular-vainilla.jpg" },
  { id: "TT002", nombre: "Torta Circular de Manjar", precio: 42000, categoria: "Tortas Circulares", imagen: "assets/img/catalogo/tortas-circulares/circular-manjar.jpeg" },
  { id: "PI001", nombre: "Mousse de Chocolate", precio: 5000, categoria: "Postres Individuales", imagen: "assets/img/catalogo/postres-individuales/mousse-chocolate.jpg" },
  { id: "PI002", nombre: "Tiramisú Clásico", precio: 5500, categoria: "Postres Individuales", imagen: "assets/img/catalogo/postres-individuales/tiramisu.jpg" },
  { id: "PSA001", nombre: "Torta Sin Azúcar de Naranja", precio: 48000, categoria: "Productos Sin Azúcar", imagen: "assets/img/catalogo/sin-azucar/torta-naranja.jpg" },
  { id: "PSA002", nombre: "Cheesecake Sin Azúcar", precio: 47000, categoria: "Productos Sin Azúcar", imagen: "assets/img/catalogo/sin-azucar/cheesecake.jpg" },
  { id: "PT001", nombre: "Empanada de Manzana", precio: 3000, categoria: "Pastelería Tradicional", imagen: "assets/img/catalogo/tradicional/empanada-manzana.jpg" },
  { id: "PT002", nombre: "Tarta de Santiago", precio: 6000, categoria: "Pastelería Tradicional", imagen: "assets/img/catalogo/tradicional/tarta-santiago.jpg" },
  { id: "PG001", nombre: "Brownie Sin Gluten", precio: 4000, categoria: "Productos Sin Gluten", imagen: "assets/img/catalogo/sin-gluten/brownie.webp" },
  { id: "PG002", nombre: "Pan Sin Gluten", precio: 3500, categoria: "Productos Sin Gluten", imagen: "assets/img/catalogo/sin-gluten/pan.webp" },
  { id: "PV001", nombre: "Torta Vegana de Chocolate", precio: 50000, categoria: "Productos Veganos", imagen: "assets/img/catalogo/vegano/torta-chocolate.jpg" },
  { id: "PV002", nombre: "Galletas Veganas de Avena", precio: 4500, categoria: "Productos Veganos", imagen: "assets/img/catalogo/vegano/galletas-avena.jpg" },
  { id: "TE001", nombre: "Torta Especial de Cumpleaños", precio: 55000, categoria: "Tortas Especiales", imagen: "assets/img/catalogo/tortas-especiales/torta-cumpleanos.jpg" },
  { id: "TE002", nombre: "Torta Especial de Boda", precio: 60000, categoria: "Tortas Especiales", imagen: "assets/img/catalogo/tortas-especiales/torta-boda.jpg" },
];

localStorage.setItem('catalogoProductos', JSON.stringify(productos));
const catalogo = JSON.parse(localStorage.getItem('catalogoProductos'));
if (!localStorage.getItem('catalogoProductos')) {
    localStorage.setItem('catalogoProductos', JSON.stringify(productos));
}

const CATEGORIAS = [
  "Tortas Cuadradas",
  "Tortas Circulares",
  "Postres Individuales",
  "Productos Sin Azúcar",
  "Pastelería Tradicional",
  "Productos Sin Gluten",
  "Productos Veganos",
  "Tortas Especiales"
];

const CATEGORY_PREFIX = window.StorageProductos?.CATEGORY_PREFIX || {
  "Tortas Cuadradas": "TC",
  "Tortas Circulares": "TT",
  "Postres Individuales": "PI",
  "Productos Sin Azúcar": "PS",
  "Pastelería Tradicional": "PT",
  "Productos Sin Gluten": "PG",
  "Productos Veganos": "PV",
  "Tortas Especiales": "TE"
};

// -------- utilidades imagen --------
const IMG_FALLBACK = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
function archivoADataUrl(archivo) {
  return new Promise((resolver, rechazar) => {
    const lector = new FileReader();
    lector.onload = () => resolver(lector.result);
    lector.onerror = rechazar;
    lector.readAsDataURL(archivo);
  });
}

// -------- ayuda: generar ID por categoría (prefijo + número incremental) --------
function generarIdPorCategoria(categoria) {
  const prefijo = CATEGORY_PREFIX[categoria] || "PR";
  const catalogo = JSON.parse(localStorage.getItem("catalogoProductos")) || [];
  let max = 0;
  for (const p of catalogo) {
    if (typeof p.id === "string" && p.id.startsWith(prefijo)) {
      const num = parseInt(p.id.slice(prefijo.length), 10);
      if (!Number.isNaN(num)) max = Math.max(max, num);
    }
  }
  return `${prefijo}${String(max + 1).padStart(3, "0")}`;
}

// -------- poblar select categorías e id --------
(function initSelectCategorias() {
  const select = document.getElementById('p-categoria');
  const inputId = document.getElementById('p-id');
  if (!select || !inputId) return;

  // llena opciones
  Object.keys(CATEGORY_PREFIX).forEach(cat => {
    const opt = document.createElement('option');
    opt.value = opt.textContent = cat;
    select.appendChild(opt);
  });

  // genera id al cargar y al cambiar
  function refrescarId() {
    inputId.value = generarIdPorCategoria(select.value);
  }
  select.addEventListener('change', refrescarId);
  document.addEventListener('DOMContentLoaded', refrescarId);
  // por si el modal se abre después de cargar
  setTimeout(() => { if (!inputId.value) refrescarId(); }, 0);
})();

// -------- vista previa imagen --------
(function initVistaPreviaImagen() {
  const urlEl = document.getElementById('p-imagen-url');
  const fileEl = document.getElementById('p-imagen-archivo');
  const preview = document.getElementById('p-vista-previa');
  if (!urlEl || !fileEl || !preview) return;

  function mostrar(src) {
    if (src) { preview.src = src; preview.style.display = 'inline-block'; }
    else { preview.removeAttribute('src'); preview.style.display = 'none'; }
  }
  urlEl.addEventListener('input', () => mostrar(urlEl.value));
  fileEl.addEventListener('change', () => {
    const f = fileEl.files?.[0];
    if (!f) return mostrar('');
    const r = new FileReader();
    r.onload = () => mostrar(r.result);
    r.readAsDataURL(f);
  });
})();


// listener del form
document.getElementById('formProducto')?.addEventListener('submit', guardarProducto);