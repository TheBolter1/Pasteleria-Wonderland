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



