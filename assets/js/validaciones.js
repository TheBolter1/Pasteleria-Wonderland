//Validación Inicio Sesión
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#loginFormulario');
  const email = document.querySelector('#email');
  const password = document.querySelector('#password');

  const showError = (input, msg) => {
    const field = input.closest('.field');
    field.classList.add('error');
    const small = field.querySelector('.error-msg');
    if (small) {
      small.textContent = msg;
      small.hidden = false;
    }
  };

  const clearError = (input) => {
    const field = input.closest('.field');
    field.classList.remove('error');
    const small = field.querySelector('.error-msg');
    if (small) small.hidden = true;
  };

  [email, password].forEach(el => {
    el.addEventListener('input', () => clearError(el));
  });

  form.addEventListener('submit', (e) => {
    let valid = true;
    const emailVal = email.value.trim();
    const passVal  = password.value.trim();

    if (!emailVal) {
      showError(email, 'Ingresa tu correo.');
      valid = false;
    }

    if (!passVal) {
      showError(password, 'Ingresa tu contraseña.');
      valid = false;
    }

    if (!valid) {
      e.preventDefault();
      (emailVal ? password : email).focus();
      return;
    }

  });
});
