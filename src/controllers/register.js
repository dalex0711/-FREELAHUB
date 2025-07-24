import { emailExists, validateInputs, validatePassword, hashPass } from '../services/validations.js';
import { apiRequest } from '../api/requests.js';
import { navegation } from '../router.js';
import{showMessage} from '../services/message.js'


// Initialize register form behavior
export function init() {

  //Checkbox to show password
  const passwordInput = document.getElementById('password');
  const togglePasswordCheckbox = document.getElementById('show-password');

    togglePasswordCheckbox.addEventListener('change', () => {
        passwordInput.type = togglePasswordCheckbox.checked ? 'text' : 'password';
    });

  // form
  const registerForm = document.querySelector('#register-form');

  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = document.querySelector('#name').value;
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;

    const inputsValidator = validateInputs(name, email, password);
    const passwordValidator = validatePassword(password);

    // Validate empty fields
    if (!inputsValidator) {
      showMessage('Por favor, rellene todos los campos.', 'error');
      return;
    }

    // Validate password strength
    if (!passwordValidator) {
        showMessage('La contraseña debe incluir al menos una letra mayúscula.', 'error');
      return;
    }

    // Check if email already exists
    if (await emailExists(email)) {
      showMessage('El correo electrónico ya está registrado', 'error');
      return;
    }

    // Register new user
    const hashedPassword = hashPass(password);
    showMessage('La cuenta ha sido creada exitosamente.','success')
    await apiRequest('POST', 'users', {
      name,
      email,
      password: hashedPassword,
      rol: 'student'
    });

    // Redirect to login after successful registration
    navegation('/login');
  });
}