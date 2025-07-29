// src/pages/home/home.js
import { createIcons, icons } from 'lucide';
import { btnLogout } from '../../services/logout.js';

export function init() {
  btnLogout();
  setupNav();
  createIcons({ icons });
}

function setupNav() {
  // Toggle del menú móvil
  document.getElementById('menu-toggle')?.addEventListener('click', () => {
    document.getElementById('mobile-menu')?.classList.toggle('hidden');
  });

  // Marcar navegación activa
  const currentPath = location.pathname;
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    }
  });

  // Efecto de scroll en el header
  window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 10) {
      header.classList.add('bg-white', 'shadow-md');
      header.classList.remove('bg-white/80');
    } else {
      header.classList.add('bg-white/80');
      header.classList.remove('bg-white', 'shadow-md');
    }
  });
}
