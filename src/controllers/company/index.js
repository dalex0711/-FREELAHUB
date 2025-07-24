import { apiRequest } from '../../api/requests.js';
import {btnLogout} from '../../services/logout.js'

const hideButton = document.querySelectorAll('.hideButton');
const hideButton2 = document.querySelectorAll('.hideButton2');

const dashboardCompany = document.getElementById('dashboardCompany');
const newRequirement = document.getElementById('newRequirement');
const editVacancy = document.getElementById('editVacancy');

newRequirement.style.display = 'none';
editVacancy.style.display = 'none';

hideButton.forEach(element => {
  element.addEventListener('click', () => {
    hideSection();
  });
});
hideButton2.forEach(element => {
  element.addEventListener('click', () => {
    editSection();
  });
});

let edit = true;
function editSection() {
  if (edit) {
    dashboardCompany.style.display = 'none';
    editVacancy.style.display = 'block';
    edit = false;
  } else {
    dashboardCompany.style.display = 'block';
    editVacancy.style.display = 'none';
    edit = true;
  }
}

let on = true;
function hideSection() {
  if (on) {
    dashboardCompany.style.display = 'none';
    newRequirement.style.display = 'block';
    on = false;
  } else {
    dashboardCompany.style.display = 'block';
    newRequirement.style.display = 'none';
    on = true;
  }
}

const form = document.getElementById('form');
const requirementName = document.getElementById('requirementName');
const projectDescription = document.getElementById('projectDescription');
const jobType = document.getElementById('jobType');
const jobModality = document.getElementById('jobModality');
const addSkillButton = document.getElementById('addSkill');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const skills = document.querySelectorAll('.skillsRequired');
  const levels = document.querySelectorAll('.levelRequired');

  const skillData = [];
  const skillLevel = [];

  skills.forEach((skill, index) => {
    const skillValue = skill.value.trim();
    const levelValue = levels[index]?.value.trim();

    if (skillValue && levelValue) {
      skillData.push(skillValue);
      skillLevel.push(levelValue);
    }
  });

  const data = {
    projectName: requirementName.value,
    projectDescription: projectDescription.value,
    jobType: jobType.value,
    jobModality: jobModality.value,
    skillsRequired: skillData,
    levelRequired: skillLevel,
  };

  await apiRequest('POST', 'vacancy', data);
  await slotVancancy();
  form.reset(); // Limpia el formulario después del envío
});

addSkillButton.addEventListener('click', () => {
  addSkill();
});

function addSkill() {
  const container = document.getElementById('skills-container');
  const div = document.createElement('div');
  div.className = 'flex space-x-4';
  div.innerHTML = `
    <div class="flex items-center space-x-2 w-full mb-2">
      <select required class="skillsRequired flex-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
        <option value="">Selecciona una tecnología</option>
        <option value="javascript">JavaScript</option>
        <option value="python">Python</option>
        <option value="react">React</option>
        <option value="nodejs">Node.js</option>
        <option value="typescript">TypeScript</option>
        <option value="java">Java</option>
        <option value="docker">Docker</option>
        <option value="kubernetes">Kubernetes</option>
        <option value="devops">DevOps</option>
        <option value="postgresql">PostgreSQL</option>
        <option value="mysql">MySQL</option>
        <option value="android">Android</option>
        <option value="flutter">Flutter</option>
        <option value="security">Cybersecurity</option>
      </select>

      <select required class="levelRequired w-1/3 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
        <option value="">Nivel</option>
        <option value="beginner">Principiante</option>
        <option value="intermediate">Intermedio</option>
        <option value="advanced">Avanzado</option>
      </select>

      <button type="button" class="ml-2 inline-flex items-center px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full hover:bg-red-200 focus:outline-none" onclick="this.parentElement.remove()" title="Eliminar">✕</button>
    </div>
  `;
  container.appendChild(div);
}

async function slotVancancy() {
  const table = document.getElementById('table');
  table.innerHTML = ''; // Limpia la tabla antes de volver a renderizar

  const data = await apiRequest('GET', 'vacancy', null);

  for (let i = 0; i < data.length; i++) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="px-6 py-4">${data[i].projectName}</td>
      <td class="px-6 py-4">${data[i].skillsRequired.join(', ')}</td>
      <td class="px-6 py-4">2</td>
      <td class="px-6 py-4 space-x-2">
        <button class="view-button text-indigo-600 hover:underline" data-id="${data[i].id}">Ver</button>
        <button class="delete-button text-red-500 hover:underline" data-id="${data[i].id}">Eliminar</button>
      </td>
    `;
    table.appendChild(tr);
  }
}

slotVancancy();

// Manejo de botones de acción
document.addEventListener('click', async (e) => {
  const target = e.target;

  // Ver vacante
  if (target.classList.contains('view-button')) {
    const id = target.dataset.id;
    const vacancy = await apiRequest('GET', `vacancy/${id}`);
    editSection(); // Muestra sección de edición
    console.log(vacancy); // Puedes rellenar los campos aquí si lo deseas
  }

  // Eliminar vacante
  if (target.classList.contains('delete-button')) {
    const id = target.dataset.id;
    const confirmDelete = confirm("¿Deseas eliminar esta vacante?");
    if (!confirmDelete) return;

    try {
      await apiRequest('DELETE', `vacancy/${id}`);
      const row = target.closest('tr');
      if (row) row.remove();
      console.log(`Vacante ${id} eliminada.`);
    } catch (error) {
      console.error('Error al eliminar la vacante:', error);
    }
  }
});
export async function init() {
  
  btnLogout();
}