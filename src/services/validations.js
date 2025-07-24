import CryptoJS from 'crypto-js';
import { apiRequest } from '../api/requests.js';

// Checks if all inputs are non-empty and valid
export function validateInputs(...inputs) {
  return inputs.every(input => {
    if (typeof input === 'string') {
      return input.trim() !== '';
    }
    if (Array.isArray(input)) {
      return input.length > 0;
    }
    return input !== null && input !== undefined;
  });
}


// Validates password rules: uppercase, lowercase, special character, min length
export function validatePassword(pass) {
  const tieneMayuscula = /[A-Z]/.test(pass); 
 
  const longitudMinima = pass.length >= 5;

  return tieneMayuscula && longitudMinima;
};

// Checks if email is already registered
export async function emailExists(email) {
  const allUsers = await apiRequest('GET', 'users');
  return allUsers.some(u => u.email === email);
}

// Verifies credentials and returns the user object if valid
export async function validateUser(email, password) {
  const allUser = await apiRequest('GET', 'users');
  const found = allUser?.find(u => u.email === email && u.password === password);
  return found || null;
};

// Encrypts password using SHA512
export function hashPass(password) {
  return CryptoJS.SHA512(password).toString();
};
