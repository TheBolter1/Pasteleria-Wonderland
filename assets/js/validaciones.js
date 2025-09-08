//Validación Inicio Sesión
const Id_login = (id) => document.getElementById(id);

function mostrarError(inputCampo, mensajeCampo, mensaje) {
  if (!inputCampo || !mensajeCampo) return;
  inputCampo.classList.add("is-invalid");
  mensajeCampo.textContent = mensaje;
}

function limpiarError(inputCampo, mensajeCampo) {
  if (!inputCampo || !mensajeCampo) return;
  inputCampo.classList.remove("is-invalid");
  mensajeCampo.textContent = "";
}

async function esAdmin(correo, contrasena) {
  try {

    const resp = await fetch("assets/json/admin.json", { cache: "no-store" });
    if (!resp.ok) return false;
    const data = await resp.json();

    if (data && typeof data === "object") {
      return data.correo === correo && data.contrasena === contrasena;
    }
    return false;
  } catch (e) {
    console.error("Error leyendo admin.json:", e);
    return false;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const formularioLogin = Id_login("formulario_login");
  const inputCorreo = Id_login("correo");
  const inputContrasena = Id_login("contrasena");

  const errorCorreo = Id_login("errorCorreo");
  const errorContrasena = Id_login("errorContrasena");

  const alertaExito = Id_login("successAlert");

  if (!formularioLogin) return;

  formularioLogin.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    limpiarError(inputCorreo, errorCorreo);
    limpiarError(inputContrasena, errorContrasena);

    const valorCorreo = (inputCorreo?.value || "").trim();
    const valorContrasena = inputContrasena?.value || "";

    let formularioValido = true;

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

    const admin_autorizado = await esAdmin(valorCorreo, valorContrasena);

    if (admin_autorizado) {
      sessionStorage.setItem("rol", "admin");
      if (alertaExito) {
        alertaExito.textContent = "Bienvenido/a, Administrador. Su acceso ha sido validado correctamente. Ya puede comenzar a gestionar el sistema. Le deseamos una jornada productiva.";
        alertaExito.classList.remove("d-none");
      }
      setTimeout(() => {
        window.location.href = "administrador.html";
      }, 500);
    } else {
      mostrarError(inputCorreo, errorCorreo, "Credenciales inválidas.");
      mostrarError(inputContrasena, errorContrasena, "Credenciales inválidas.");
    }
  });
});
