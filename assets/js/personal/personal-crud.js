// ==== CRUD PERSONAL (crear, leer, editar, eliminar) ====
(function(){
  // Helpers y almacenamiento (nombres tal como los vienes usando)
  const fun   = s => document.querySelector(s);
  const KEY   = "personal_json";
  const read  = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
  const write = (arr) => localStorage.setItem(KEY, JSON.stringify(arr));
  const rut_Id = (pers) => `${String(pers.rut).trim()}-${String(pers.dv).trim().toLowerCase()}`;

  // --------- RENDER TABLA ---------
  function renderizarTablaPersonal(){
    const tbody = fun("#personal-tabla tbody");
    if (!tbody) return;

    const filas = read().map(pers => `
      <tr>
        <td>${rut_Id(pers)}</td>
        <td>${pers.nombres}</td>
        <td>${pers.apellido1} ${pers.apellido2}</td>
        <td>${pers.cargo}</td>
        <td>${pers.correo}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-primary" data-edit="${rut_Id(pers)}">Editar</button>
          <button class="btn btn-sm btn-outline-danger"  data-del="${rut_Id(pers)}">Eliminar</button>
        </td>
      </tr>
    `).join("");

    tbody.innerHTML = filas || `<tr><td colspan="6" class="text-center text-muted">Sin personal</td></tr>`;
  }

  // --------- CREAR (form: #nuevo-personal-form) ---------
  function crearPersonalDesdeFormulario(){
    const formulario = fun("#nuevo-personal-form");
    if (!formulario) return;

    formulario.addEventListener("submit", (ev)=>{
      ev.preventDefault();

      const pers = Object.fromEntries(new FormData(formulario).entries());
      pers.rut = String(pers.rut).trim();
      pers.dv  = String(pers.dv).trim();

      const msg = validarPersonalBasico(pers);
      if (msg) { alert(msg); return; }

      const lista = read();
      if (lista.some(x => rut_Id(x) === rut_Id(pers))) {
        alert("Ese RUT ya existe.");
        return;
      }

      lista.push(pers);
      write(lista);
      alert("Trabajador creado.");
      formulario.reset();
      renderizarTablaPersonal();
    });
  }

  // --------- EDITAR (abrir y precargar) ---------
  function abrirEdicion(id){
    const persona = read().find(x => rut_Id(x) === id);
    if (!persona) { alert("No se encontró el registro."); return; }

    const form = fun("#editar-personal-form");
    if (!form) return;

    form.dataset.id                = id;             // a quién estamos editando
    form.rut.value                 = persona.rut;    // RUT/DV son solo lectura en el HTML
    form.dv.value                  = persona.dv;
    form.nombres.value             = persona.nombres || "";
    form.apellido1.value           = persona.apellido1 || "";
    form.apellido2.value           = persona.apellido2 || "";
    form.fecha_nacimiento.value    = persona.fecha_nacimiento || "";
    form.correo.value              = persona.correo || "";
    form.telefono.value            = persona.telefono || "";
    form.direccion.value           = persona.direccion || "";
    form.cargo.value               = persona.cargo || "";
  }

  // --------- EDITAR (guardar) ---------
  function enlazarSubmitEdicion(){
    const form = fun("#editar-personal-form");
    if (!form) return;

    form.addEventListener("submit", (ev)=>{
      ev.preventDefault();

      const id = form.dataset.id;
      if (!id) { alert("No hay registro seleccionado."); return; }

      const datos = Object.fromEntries(new FormData(form).entries());

      const msg = validarPersonalBasico(datos);
      if (msg) { alert(msg); return; }

      const lista = read();
      const i = lista.findIndex(x => rut_Id(x) === id);
      if (i === -1) { alert("No se pudo actualizar."); return; }

      // No permitir cambiar RUT/DV
      const { rut, dv } = lista[i];
      lista[i] = { ...lista[i], ...datos, rut, dv };

      write(lista);
      alert("Cambios guardados.");
      renderizarTablaPersonal();
    });
  }

  // --------- ELIMINAR ---------
  function deletePersonalById(id) {
    const lista = read();
    const nuevaLista = lista.filter(pers => rut_Id(pers) !== id);
    write(nuevaLista);
    return nuevaLista.length < lista.length; // true si borró algo
  }

  // --------- BOTONES EN TABLA (editar / eliminar) ---------
  function enlazarBotonesTabla(){
    const tbody = fun("#personal-tabla tbody");
    if (!tbody) return;

    tbody.addEventListener("click", (e)=>{
      const editId = e.target?.dataset?.edit;
      const delId  = e.target?.dataset?.del;

      if (editId) abrirEdicion(editId);

      if (delId) {
        if (confirm("¿Eliminar trabajador " + delId + "?")) {
          const ok = deletePersonalById(delId);
          if (ok) renderizarTablaPersonal();
        }
      }
    });
  }

  // --------- INICIALIZACIÓN ---------
  window.addEventListener("DOMContentLoaded", ()=>{
    renderizarTablaPersonal();
    crearPersonalDesdeFormulario();
    enlazarBotonesTabla();
    enlazarSubmitEdicion();
  });

  // Opcional: exponer la función de borrado si la necesitas en otro script
  window.deletePersonalById = deletePersonalById;

})();


function dvModulo11(rutStr){
  const rut = String(rutStr).trim();
  let suma = 0, mul = 2;
  for (let i = rut.length - 1; i >= 0; i--){
    const d = parseInt(rut[i], 10);
    if (Number.isNaN(d)) return null;
    suma += d * mul;
    mul = (mul === 7) ? 2 : mul + 1;
  }
  const resto = 11 - (suma % 11);
  return (resto === 11) ? "0" : (resto === 10) ? "K" : String(resto);
}

// --- VALIDACIÓN BÁSICA PARA PERSONAL (con módulo 11)
function validarPersonalBasico(pers){
  const rut = String(pers.rut || "").trim();
  const dv  = String(pers.dv  || "").trim().toUpperCase();

  // mínimos obligatorios
  if(!/^\d{1,8}$/.test(rut))  return "RUT debe tener 1–8 dígitos.";
  if(!/^[0-9K]$/.test(dv))    return "DV inválido (0-9 o K).";

  // módulo 11
  const dvCalc = dvModulo11(rut);
  if(!dvCalc || dv !== dvCalc) return "RUT/DV no coincide (módulo 11).";

  if(!pers.nombres || pers.nombres.trim().length < 2)   return "Nombres: mínimo 2 letras.";
  if(!pers.apellido1 || pers.apellido1.trim().length < 2) return "Apellido paterno obligatorio.";
  if(!pers.correo || !pers.correo.includes("@"))        return "Correo inválido.";
  if(!pers.cargo || pers.cargo.trim().length < 2)       return "Cargo obligatorio.";

  // opcionales simples
  if(pers.telefono && pers.telefono.replace(/\D+/g,"").length < 9)
    return "Teléfono demasiado corto.";

  return ""; // todo bien
}