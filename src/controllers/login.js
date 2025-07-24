import { validateInputs, validateUser, hashPass } from "../services/validations";
import { dataEncoding, getUser } from "../services/storage";
import { navegation } from '../router.js';
import{showMessage} from '../services/message.js'

// Initialize login form logic
export function init() {

    const passwordInput = document.getElementById('password');
    const togglePasswordCheckbox = document.getElementById('show-password');

    togglePasswordCheckbox.addEventListener('change', () => {
        passwordInput.type = togglePasswordCheckbox.checked ? 'text' : 'password';
    });

    
    const loginForm = document.querySelector('#login-form');

    // Handle form submission
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Get input values
        const email = document.querySelector('#email').value;
        const password = document.querySelector('#password').value;

        // Validate empty fields
        const validatedInputs = validateInputs(email, password);
        if (!validatedInputs) {
            showMessage('Por favor, rellene todos los campos.', 'error');
            return;
        }

        // Hash password and validate user
        const hashedPassword = hashPass(password); 
        const user = await validateUser(email, hashedPassword);

        // Handle invalid credentials
        if (!user) {
            showMessage('Credenciales no válidas','error')
            return;
        }

        // Save user session and redirect based on role
        const fullUser = await getUser(email);
        dataEncoding(fullUser);

        showMessage('Inicio de sesión exitoso!', 'success');
        
        let redirectTo;

            switch (fullUser.rol) {
            case 'admin':
                redirectTo = '/admin';
                break;
            case 'company':
                redirectTo = '/company';
                break;
            case 'student':
                redirectTo = '/student';
                break;
            default:
                redirectTo = '/';
            }

        navegation(redirectTo);
    });
}
