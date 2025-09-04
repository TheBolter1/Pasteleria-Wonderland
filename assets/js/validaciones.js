//Validación Inicio Sesión
const Id_login = (id) => document.getElementById(id);

// Pone el error en el campo y muestra el texto debajo
function mostrarError(inputCampo, mensajeCampo, mensaje) {
  if (!inputCampo || !mensajeCampo) return;
  inputCampo.classList.add("is-invalid");
  mensajeCampo.textContent = mensaje;
}

// Limpia el error de un solo campo
function limpiarError(inputCampo, mensajeCampo) {
  if (!inputCampo || !mensajeCampo) return;
  inputCampo.classList.remove("is-invalid");
  mensajeCampo.textContent = "";
}

document.addEventListener("DOMContentLoaded", () => {
  const formularioLogin = Id_login("formulario_login");
  const inputCorreo = Id_login("correo");
  const inputContrasena = Id_login("contrasena");

  // **Usar los mismos IDs que están en el HTML**
  const errorCorreo = Id_login("errorCorreo");
  const errorContrasena = Id_login("errorContrasena");

  const alertaExito = Id_login("successAlert");

  if (!formularioLogin) return; // por si acaso

  formularioLogin.addEventListener("submit", (evento) => {
    evento.preventDefault();

    // 1) limpiar errores previos
    limpiarError(inputCorreo, errorCorreo);
    limpiarError(inputContrasena, errorContrasena);

    // 2) tomar valores
    const valorCorreo = (inputCorreo?.value || "").trim();
    const valorContrasena = inputContrasena?.value || "";

    let formularioValido = true;

    // 3) validaciones simples
    if (!valorCorreo) {
      mostrarError(inputCorreo, errorCorreo, "Ingresa tu correo.");
      formularioValido = false;
    } else if (!valorCorreo.includes("@") || !valorCorreo.includes(".")) {
      mostrarError(inputCorreo, errorCorreo, "Correo inválido.");
      formularioValido = false;
    }

    if (!valorContrasena) {
      mostrarError(inputContrasena, errorContrasena, "Ingresa tu contraseña.");
      formularioValido = false;
    } else if (valorContrasena.length < 6) {
      mostrarError(inputContrasena, errorContrasena, "Mínimo 6 caracteres.");
      formularioValido = false;
    }

    if (!formularioValido) return;

    // 4) mostrar mensaje de éxito
    if (alertaExito) {
      alertaExito.textContent = "¡Inicio de sesión exitoso!";
      alertaExito.classList.remove("d-none");
      setTimeout(() => alertaExito.classList.add("d-none"), 3000);
    }

    formularioLogin.reset();
  });
});
