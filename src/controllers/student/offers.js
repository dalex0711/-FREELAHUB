import { createIcons, icons } from 'lucide';
import { apiRequest } from '../../api/requests.js';
import { getUserLogged } from '../../services/storage.js';

let allOffers = [];

export async function init() {
  await loadVacancies();

  // Buscador
  document.getElementById('offer-search')?.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    filterOffers(searchTerm);
  });

  // Botón "Aplicaciones"
  document.getElementById('view-applications-desktop')?.addEventListener('click', (e) => {
    e.preventDefault();
    const title = document.getElementById('offers-title');
    const subtitle = document.getElementById('offers-subtitle');

    if (title) title.textContent = 'Tus aplicaciones';
    if (subtitle) subtitle.textContent = 'Estas son las vacantes a las que te postulaste.';

    filterOffers('__applied__');
  });
}

async function loadVacancies() {
  const title = document.getElementById('offers-title');
  const subtitle = document.getElementById('offers-subtitle');
  if (title) title.textContent = 'Ofertas disponibles para ti';
  if (subtitle) subtitle.textContent = 'Postúlate a proyectos reales publicados por empresas y aliados.';

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

    // Debug opcional
    // console.log('Vacantes:', offers);
    // console.log('Aplicaciones del usuario:', applications);

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
    if (query === '__applied__') {
      return offer.applied === true;
    }

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

      try {
        if (isCurrentlyApplied) {
          const apps = await apiRequest('GET', `applications?userId=${userId}&vacancyId=${vacancyId}`);
          const match = apps.find(app => String(app.vacancyId) === String(vacancyId));
          if (match) {
            await apiRequest('DELETE', `applications/${match.id}`);
            offer.applied = false;
            updateButtonVisual(applyBtn, false);
          }
        } else {
          await apiRequest('POST', 'applications', {
            userId: Number(userId),
            vacancyId: Number(vacancyId)
          });
          offer.applied = true;
          updateButtonVisual(applyBtn, true);
        }

        // Refrescar lista si estamos viendo solo aplicaciones
        const title = document.getElementById('offers-title');
        if (title?.textContent === 'Tus aplicaciones') {
          filterOffers('__applied__');
        }

      } catch (err) {
        console.error('Error al (des)postularse:', err);
      }
    });

    container.appendChild(clone);
  });

  createIcons({ icons });
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
