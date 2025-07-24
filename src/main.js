import './style.css';
import { navegation,navegationTag} from './router.js';

import { createIcons, icons } from 'lucide';


document.addEventListener('DOMContentLoaded', () => {
  navegation(location.pathname); 
  navegationTag();               
  createIcons({ icons });
});