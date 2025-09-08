  /* ===== Configuración ===== */
  const KEY = 'pw_contactos';

  /* Elementos (pueden no existir según la página) */
  const formularioContacto = document.getElementById('form-contacto');
  const cuerpoTablaAdmin   = document.getElementById('lista-contactos');

  /* ===== Utilidades ===== */
  const leerContactos    = () => JSON.parse(localStorage.getItem(KEY) || '[]');
  const guardarContactos = (lista) => localStorage.setItem(KEY, JSON.stringify(lista));
  const escaparHTML = (t = '') =>
    t.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  /* Validadores simples */
  const esCorreoValido = (correo) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo);

  const esNumeroOrdenValido = (orden) =>
    orden === '' || /^#?\d{4,}$/.test(orden); // vacío = opcional; o #12345 / 12345

  function validarFormulario(form) {
    const campoNombre  = form.elements['nombre'];
    const campoCorreo   = form.elements['correo'];
    const campoOrden   = form.elements['orden'];   // opcional
    const campoMensaje = form.elements['mensaje'];

    // Limpia mensajes anteriores
    [campoNombre, campoCorreo, campoOrden, campoMensaje].forEach(c => c?.setCustomValidity(''));

    let esValido = true;

    if (!campoNombre.value.trim()) {
      campoNombre.setCustomValidity('Ingresa tu nombre.');
      esValido = false;
    }

    const correo = campoCorreo.value.trim();
    if (!correo || !esCorreoValido(correo)) {
      campoCorreo.setCustomValidity('Correo inválido.');
      esValido = false;
    }

    const orden = (campoOrden?.value || '').trim();
    if (!esNumeroOrdenValido(orden)) {
      campoOrden.setCustomValidity('Usa #12345 o 12345 (mín. 4 dígitos).');
      esValido = false;
    }

    if (campoMensaje.value.trim().length < 5) {
      campoMensaje.setCustomValidity('Escribe un mensaje (mín. 5 caracteres).');
      esValido = false;
    }

    // Activa estilos de Bootstrap para feedback
    form.classList.add('was-validated');

    // Muestra los mensajes nativos del navegador/Bootstrap
    if (!esValido) {
      form.reportValidity?.();
    }
    return esValido;
  }

  
  /* Limpia el error al tipear */
  function engancharLimpiaErrores(form){
    ['nombre','correo','orden','mensaje'].forEach(name=>{
      const el = form.elements[name];
      el?.addEventListener('input', ()=> el.setCustomValidity(''));
    });
  }

  /* ===== 1) Página de contacto: Guardar envío ===== */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-contacto');
  if (!form) return;

  // Evitar doble binding si el script se carga dos veces
  if (form.dataset.bound === '1') return;
  form.dataset.bound = '1';

  const submitBtn = form.querySelector('[type="submit"]');

  // Usamos reportValidity para disparar mensajes nativos
  const isFormValid = () => form.reportValidity();

  // 1) Bloquear CLIC en el botón si el form es inválido (fase de captura)
  submitBtn?.addEventListener('click', (ev) => {
    if (!isFormValid()) {
      ev.preventDefault();
      ev.stopImmediatePropagation(); // bloquea cualquier otro listener del botón
      form.classList.add('was-validated');
    }
  }, true); // ← CAPTURE

  // 2) Bloquear SUBMIT del form si es inválido (fase de captura)
  form.addEventListener('submit', (ev) => {
    if (!isFormValid()) {
      ev.preventDefault();
      ev.stopImmediatePropagation();  // bloquea otros submit handlers
      form.classList.add('was-validated');
      return;
    }

    // Si está OK, hacemos el "submit" manual (guardar + feedback)
    ev.preventDefault();
    ev.stopPropagation();

    const data = {
      motivo:  form.motivo?.value || '',
      nombre:  form.nombre?.value.trim(),
      correo:  form.correo?.value.trim(),
      orden:   form.orden?.value.trim(),
      mensaje: form.mensaje?.value.trim(),
      fechaISO: new Date().toISOString()
    };

    // Guardar en localStorage
    const lista = leerContactos();
    lista.push(data);
    guardarContactos(lista);
  
    showAlert({ type:"success", title:"¡Mensaje enviado!", message:"Te responderemos a la brevedad." });
    form.reset();
    form.classList.remove('was-validated');
  }, true); // ← CAPTURE
});
  /* ===== 2) Admin: Listar mensajes ===== */
  if (cuerpoTablaAdmin) {
    const lista = leerContactos();

    if (!lista.length) {
      cuerpoTablaAdmin.innerHTML =
        `<tr><td colspan="6" class="text-muted text-center">Sin mensajes.</td></tr>`;
    } else {
      cuerpoTablaAdmin.innerHTML = lista.map((c, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${new Date(c.fechaISO || c.fecha).toLocaleString('es-CL')}</td>
          <td>${escaparHTML(c.nombre)}</td>
          <td><a href="mailto:${escaparHTML(c.correo)}">${escaparHTML(c.correo)}</a></td>
          <td>${escaparHTML(c.orden || '')}</td>
          <td style="white-space:pre-wrap;max-width:480px">${escaparHTML(c.mensaje)}</td>
        </tr>
      `).join('');
    }
  }

function showAlert({type="success", title="Listo", message="", duration=3000}) {
  const wrap = document.getElementById("alerts");
  const el = document.createElement("div");
  el.className = `custom-alert soft ${type}`; // usa tus estilos de alerts.css
  el.innerHTML = `
    <div class="d-flex align-items-start gap-2">
      <div>
        <strong>${title}</strong>
        ${message ? `<div class="small" style="opacity:.8">${message}</div>` : ""}
      </div>
      <button type="button" aria-label="Cerrar" class="ms-auto"
              style="background:none;border:0;font-size:1.1rem;opacity:.6;cursor:pointer">&times;</button>
    </div>`;
  const close = () => { el.style.opacity="0"; el.style.transform="translateY(-6px)";
                        setTimeout(()=>el.remove(), 220); };
  el.querySelector("button").addEventListener("click", close);

  el.style.opacity="0"; el.style.transform="translateY(-8px)";
  el.style.transition="opacity .25s ease, transform .25s ease";
  wrap.appendChild(el);
  requestAnimationFrame(()=>{ el.style.opacity="1"; el.style.transform="translateY(0)"; });
  if (duration) setTimeout(close, duration);
}
