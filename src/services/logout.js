import { logoutUser } from '../services/storage.js';
import { navegation } from '../router.js';
import{showMessage} from '../services/message.js'

// Sets up logout button functionality
export function btnLogout() {
  const logOutBtn = document.querySelector('.log-out-btn');
  if (!logOutBtn) return;

  logOutBtn.addEventListener('click', () => {
    logoutUser(); 
    showMessage('Hasta pronto!', 'logout');
    navegation('/'); 
  });
}