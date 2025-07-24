// src/pages/home/home.js
import { createIcons, icons } from 'lucide';
import { apiRequest } from '../../api/requests.js';
import { getUserLogged } from '../../services/storage.js';
import {btnLogout} from '../../services/logout.js'

createIcons({ icons });
btnLogout();
let allOffers = []; // Global para filtrar

export async function init() {
  setupNav();
  await loadVacancies();

  document.getElementById('view-applications-desktop')?.addEventListener('click', async (e) => {
    e.preventDefault();
    await loadApplicationsOnly();
    setTimeout(() => {
      scrollToWithOffset(document.getElementById('offers'));
    }, 100);
  });

  document.getElementById('view-applications-mobile')?.addEventListener('click', async (e) => {
    e.preventDefault();
    await loadApplicationsOnly();
    setTimeout(() => {
      scrollToWithOffset(document.getElementById('offers'));
    }, 100);
  });

  document.getElementById('offer-search')?.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    filterOffers(searchTerm);
  });
}

function scrollToWithOffset(element) {
  if (!element) return;
  const header = document.querySelector('header');
  const headerHeight = header ? header.offsetHeight : 0;
  const y = element.getBoundingClientRect().top + window.pageYOffset - headerHeight - 10;
  window.scrollTo({ top: y, behavior: 'smooth' });
}

function setupNav() {
  document.getElementById('menu-toggle')?.addEventListener('click', () => {
    document.getElementById('mobile-menu')?.classList.toggle('hidden');
  });

  const currentPath = location.pathname;
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    }
  });

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

async function loadVacancies() {
  const title = document.getElementById('offers-title');
  const subtitle = document.getElementById('offers-subtitle');
  if (title) title.textContent = 'Ofertas disponibles para ti';
  if (subtitle) subtitle.textContent = 'Postúlate a proyectos reales publicados por empresas y aliados.';

  document.querySelector('#extra-content')?.classList?.remove('hidden');

  const user = getUserLogged();
  const userId = user?.id;
  if (!userId) return;

  const container = document.querySelector('#offers');
  const template = document.querySelector('#job-card-template');
  container.classList.remove('hidden');
  container.innerHTML = '';

  try {
    const [offers, applications] = await Promise.all([
      apiRequest('GET', 'vacancy'),
      apiRequest('GET', `applications?userId=${userId}`)
    ]);

    allOffers = offers.map((offer) => {
      const isApplied = applications.some(app => String(app.vacancyId) === String(offer.id));
      return { ...offer, applied: isApplied };
    });

    filterOffers('');

  } catch (err) {
    console.error('Error cargando vacantes:', err);
  }
}

function filterOffers(query) {
  const container = document.querySelector('#offers');
  const template = document.querySelector('#job-card-template');
  const user = getUserLogged();
  const userId = user?.id;
  container.innerHTML = '';

  const filtered = allOffers.filter((offer) => {
    const text = `
      ${offer.projectName}
      ${offer.projectDescription}
      ${offer.jobType}
      ${offer.jobModality}
    `.toLowerCase();
    return text.includes(query);
  });

  if (filtered.length === 0) {
    const msg = document.createElement('p');
    msg.textContent = 'No se encontraron ofertas.';
    msg.className = 'text-slate-500 text-center py-6';
    container.appendChild(msg);
    return;
  }

  filtered.forEach((offer) => {
    const clone = template.content.cloneNode(true);
    const vacancyId = offer.id;

    clone.querySelector('.job-title').textContent = offer.projectName || 'Sin nombre';
    clone.querySelector('.job-subinfo').innerHTML = `
      <i data-lucide="briefcase" class="w-4 h-4 text-slate-400"></i>
      ${offer.jobType || 'Tipo desconocido'} • ${offer.jobModality || 'Presencial'}
    `;
    clone.querySelector('.job-description').textContent = offer.projectDescription || 'Sin descripción';

    const skillsContainer = clone.querySelector('.job-skills');
    (offer.skillsRequired || []).forEach((skill, i) => {
      const level = offer.levelRequired?.[i] || 'N/A';
      const li = document.createElement('li');
      li.className = 'flex items-center gap-1 px-2 py-1 text-xs bg-slate-100 text-slate-700 border border-slate-300 rounded-full shadow-sm';
      li.innerHTML = `<i data-lucide="laptop" class="w-3 h-3 text-slate-500"></i>
                      <span class="capitalize">${skill}</span>
                      <span class="ml-1 text-[10px] text-slate-500 font-medium">(${level})</span>`;
      skillsContainer.appendChild(li);
    });

    const applyBtn = clone.querySelector('.btn-apply');
    applyBtn.dataset.vacancyId = vacancyId;
    updateButtonVisual(applyBtn, offer.applied);

    applyBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const isCurrentlyApplied = applyBtn.classList.contains('applied');

      if (isCurrentlyApplied) {
        try {
          const apps = await apiRequest('GET', `applications?userId=${userId}&vacancyId=${vacancyId}`);
          const match = apps.find(app => String(app.vacancyId) === String(vacancyId));
          if (match) {
            await apiRequest('DELETE', `applications/${match.id}`);
            updateButtonVisual(applyBtn, false);
          }
        } catch (err) {
          console.error('Error al despostularse:', err);
        }
      } else {
        try {
          await apiRequest('POST', 'applications', {
            userId: Number(userId),
            vacancyId: Number(vacancyId)
          });
          updateButtonVisual(applyBtn, true);
        } catch (err) {
          console.error('Error al postularse:', err);
        }
      }
    });

    container.appendChild(clone);
  });

  createIcons({ icons });
}

async function loadApplicationsOnly() {
  const title = document.getElementById('offers-title');
  const subtitle = document.getElementById('offers-subtitle');
  if (title) title.textContent = 'Tus postulaciones';
  if (subtitle) subtitle.textContent = 'Estas son las vacantes a las que te has postulado.';

  document.querySelector('#extra-content')?.classList?.add('hidden');

  const user = getUserLogged();
  const userId = user?.id;
  if (!userId) return;

  const container = document.querySelector('#offers');
  const template = document.querySelector('#job-card-template');
  container.classList.remove('hidden');
  container.innerHTML = '';

  try {
    const [offers, applications] = await Promise.all([
      apiRequest('GET', 'vacancy'),
      apiRequest('GET', `applications?userId=${userId}`)
    ]);

    const appliedIds = applications.map(app => String(app.vacancyId));
    const appliedOffers = offers.filter(offer => appliedIds.includes(String(offer.id)));

    if (appliedOffers.length === 0) {
      const msg = document.createElement('p');
      msg.textContent = 'Aún no te has postulado a ninguna vacante.';
      msg.className = 'text-slate-500 text-center py-6';
      container.appendChild(msg);
      return;
    }

    appliedOffers.forEach(offer => {
      const clone = template.content.cloneNode(true);
      const vacancyId = offer.id;

      clone.querySelector('.job-title').textContent = offer.projectName || 'Sin nombre';
      clone.querySelector('.job-subinfo').innerHTML = `
        <i data-lucide="briefcase" class="w-4 h-4 text-slate-400"></i>
        ${offer.jobType || 'Tipo desconocido'} • ${offer.jobModality || 'Presencial'}
      `;
      clone.querySelector('.job-description').textContent = offer.projectDescription || 'Sin descripción';

      const skillsContainer = clone.querySelector('.job-skills');
      (offer.skillsRequired || []).forEach((skill, i) => {
        const level = offer.levelRequired?.[i] || 'N/A';
        const li = document.createElement('li');
        li.className = 'flex items-center gap-1 px-2 py-1 text-xs bg-slate-100 text-slate-700 border border-slate-300 rounded-full shadow-sm';
        li.innerHTML = `<i data-lucide="laptop" class="w-3 h-3 text-slate-500"></i>
                        <span class="capitalize">${skill}</span>
                        <span class="ml-1 text-[10px] text-slate-500 font-medium">(${level})</span>`;
        skillsContainer.appendChild(li);
      });

      const applyBtn = clone.querySelector('.btn-apply');
      applyBtn.dataset.vacancyId = vacancyId;
      updateButtonVisual(applyBtn, true);

      applyBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
          const apps = await apiRequest('GET', `applications?userId=${userId}&vacancyId=${vacancyId}`);
          const match = apps.find(app => String(app.vacancyId) === String(vacancyId));
          if (match) {
            await apiRequest('DELETE', `applications/${match.id}`);
            updateButtonVisual(applyBtn, false);
            applyBtn.closest('article')?.remove();
          }
        } catch (err) {
          console.error('Error al despostularse:', err);
        }
      });

      container.appendChild(clone);
    });

    createIcons({ icons });
  } catch (err) {
    console.error('Error cargando aplicaciones:', err);
  }
}

function updateButtonVisual(button, applied) {
  if (applied) {
    button.innerHTML = `<i data-lucide="check" class="w-4 h-4"></i> Postulado ✓`;
    button.className = `
      btn-apply applied
      flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md transition
      bg-slate-50 text-slate-500 border border-slate-300 hover:bg-slate-100
    `;
  } else {
    button.innerHTML = `<i data-lucide="send" class="w-4 h-4"></i> Postularme`;
    button.className = `
      btn-apply
      flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md transition
      bg-slate-100 text-slate-800 hover:bg-slate-200
    `;
  }

  createIcons({ icons });
}
