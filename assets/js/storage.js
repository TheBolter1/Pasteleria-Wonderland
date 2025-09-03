const productos = [ 
  { id: "TC001", nombre: "Torta Cuadrada de Chocolate", precio: 45000, categoria: "Tortas Cuadradas", imagen: "assets/img/catalogo/tortas-cuadradas/cuadrada-chocolate.jpg" },
  { id: "TC002", nombre: "Torta Cuadrada de Frutas", precio: 50000, categoria: "Tortas Cuadradas", imagen: "assets/img/catalogo/tortas-cuadradas/cuadrada-frutas.jpg" },
  { id: "TT001", nombre: "Torta Circular de Vainilla", precio: 40000, categoria: "Tortas Circulares", imagen: "assets/img/catalogo/tortas-circulares/circular-vainilla.jpeg" },
  { id: "TT002", nombre: "Torta Circular de Manjar", precio: 42000, categoria: "Tortas Circulares", imagen: "assets/img/catalogo/tortas-circulares/circular-manjar.jpg" },
  { id: "PI001", nombre: "Mousse de Chocolate", precio: 5000, categoria: "Postres Individuales", imagen: "assets/img/catalogo/postres-individuales/mousse-chocolate.jpg" },
  { id: "PI002", nombre: "Tiramisú Clásico", precio: 5500, categoria: "Postres Individuales", imagen: "assets/img/catalogo/postres-individuales/tiramisu.jpg" },
  { id: "PSA001", nombre: "Torta Sin Azúcar de Naranja", precio: 48000, categoria: "Productos Sin Azúcar", imagen: "assets/img/catalogo/sin-azucar/torta-naranja.jpg" },
  { id: "PSA002", nombre: "Cheesecake Sin Azúcar", precio: 47000, categoria: "Productos Sin Azúcar", imagen: "assets/img/catalogo/sin-azucar/cheesecake.jpeg" },
  { id: "PT001", nombre: "Empanada de Manzana", precio: 3000, categoria: "Pastelería Tradicional", imagen: "assets/img/catalogo/tradicional/empanada-manzana.jpg" },
  { id: "PT002", nombre: "Tarta de Santiago", precio: 6000, categoria: "Pastelería Tradicional", imagen: "assets/img/catalogo/tradicional/tarta-santiago.jpg" },
  { id: "PG001", nombre: "Brownie Sin Gluten", precio: 4000, categoria: "Productos Sin Gluten", imagen: "assets/img/catalogo/sin-gluten/brownie.webp" },
  { id: "PG002", nombre: "Pan Sin Gluten", precio: 3500, categoria: "Productos Sin Gluten", imagen: "assets/img/catalogo/sin-gluten/pan.webp" },
  { id: "PV001", nombre: "Torta Vegana de Chocolate", precio: 50000, categoria: "Productos Vegana", imagen: "assets/img/catalogo/vegano/torta-chocolate.jpg" },
  { id: "PV002", nombre: "Galletas Veganas de Avena", precio: 4500, categoria: "Productos Vegana", imagen: "assets/img/catalogo/vegano/galletas-avena.jpg" },
  { id: "TE001", nombre: "Torta Especial de Cumpleaños", precio: 55000, categoria: "Tortas Especiales", imagen: "assets/img/catalogo/tortas-especiales/torta-cumpleanos.jpg" },
  { id: "TE002", nombre: "Torta Especial de Boda", precio: 60000, categoria: "Tortas Especiales", imagen: "assets/img/catalogo/tortas-especiales/torta-boda.jpg" },
];

localStorage.setItem('catalogoProductos', JSON.stringify(productos));
const catalogo = JSON.parse(localStorage.getItem('catalogoProductos'));
if (!localStorage.getItem('catalogoProductos')) {
    localStorage.setItem('catalogoProductos', JSON.stringify(productos));
}
