import { createIcons, icons } from 'lucide';

export function init() {
   createIcons({ icons });
    document.addEventListener('click', function (event) {
        const elemento = event.target.closest('[data-link]');
        if (!elemento) return;

        const href = elemento.getAttribute('href') || elemento.getAttribute('data-link');
        if (!href) return;

        // Solo intercepta anchors internos en la home
        if (href.startsWith('#')) {
            event.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
}