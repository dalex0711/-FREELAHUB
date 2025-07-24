import { getUserLogged } from '../../services/storage.js';
import { btnLogout } from '../../services/logout.js';
import { apiRequest } from '../../api/requests.js';
import { createIcons, icons } from 'lucide';
import { validateInputs, emailExists } from '../../services/validations.js';
import { showMessage } from '../../services/message.js';

export async function init() {
  btnLogout();
  createIcons({ icons });

  if (location.search === '') {
    const user = getUserLogged();
    const userDetails = await apiRequest('GET', `profiles?userId=${user.id}`);

    if (userDetails.length === 0) {
      userDetailsForm(user);
    } else {
      document.getElementById('main-header').classList.remove('hidden');
      renderProfile(userDetails[0]);
    }
  }
}

function userDetailsForm(user) {
  const seccion = document.querySelector('#formulario-perfil');
  seccion.classList.remove('hidden');

  const form = document.querySelector('#perfil-form');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const detailData = {
      userId: user.id,
      name: formData.get('name'),
      cellPhone: formData.get('cellPhone'),
      mail: formData.get('mail'),
      city: formData.get('city'),
      institution: formData.get('institution'),
      program: formData.get('program'),
      skills: formData.get('skills')?.split(',').map(h => h.trim()),
      languages: formData.get('languages')?.split(',').map(h => h.trim()),
      descripcion: formData.get('descripcion'),
      cvUrl: formData.get('cvFile')
    };

    // Validaciones
    if (!validateInputs(
      detailData.name,
      detailData.cellPhone,
      detailData.mail,
      detailData.city,
      detailData.institution,
      detailData.program,
      detailData.descripcion,
      detailData.cvUrl
    )) {
      showMessage('Todos los campos de texto son obligatorios.', 'error');
      return;
    }

    if (!Array.isArray(detailData.skills) || detailData.skills.length === 0) {
      showMessage('Debe ingresar al menos una habilidad.', 'error');
      return;
    }

    if (!Array.isArray(detailData.languages) || detailData.languages.length === 0) {
      showMessage('Debe ingresar al menos un idioma.', 'error');
      return;
    }

    if (await emailExists(detailData.mail)) {
      showMessage('El correo ya está registrado.', 'error');
      return;
    }

    // Guardar datos
    await apiRequest('POST', 'profiles', detailData);
    showMessage('Perfil guardado correctamente.', 'success');

    // Ocultar formulario y mostrar perfil
    document.querySelector('#formulario-perfil').classList.add('hidden');
    const savedProfile = await apiRequest('GET', `profiles?userId=${user.id}`);

    if (savedProfile.length > 0) {
      document.getElementById('main-header').classList.remove('hidden');
      renderProfile(savedProfile[0]);
    }
  });
}

function renderProfile(data) {
  const template = document.getElementById('template-container').content.cloneNode(true);

  template.getElementById('avatar').src = `https://ui-avatars.com/api/?name=${data.name}&color=1f2937&background=f3f4f6&size=120`;
  template.getElementById('name').textContent = data.name;
  template.getElementById('cellPhone').textContent = data.cellPhone;
  template.getElementById('mail').textContent = data.mail;
  template.getElementById('city').textContent = data.city;
  template.getElementById('institution').textContent = data.institution;
  template.getElementById('program').textContent = data.program;
  template.getElementById('descripcion').textContent = data.descripcion;

  const skillsT = template.getElementById('skills');
  data.skills.forEach(skill => {
    const li = document.createElement('li');
    li.textContent = skill;
    li.className = 'bg-gray-100 text-gray-700 px-3 py-1 rounded-full';
    skillsT.appendChild(li);
  });

  const languagesT = template.getElementById('languages');
  data.languages.forEach(language => {
    const li = document.createElement('li');
    li.className = 'bg-gray-100 px-3 py-1 rounded-full';
    li.textContent = language;
    languagesT.appendChild(li);
  });

  document.getElementById('profile-container').appendChild(template);
  createIcons({ icons });
}
