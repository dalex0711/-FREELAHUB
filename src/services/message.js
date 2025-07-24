import Swal from 'sweetalert2';

export function showMessage(sms,type){

 
switch (type) {

  case 'error':
    Swal.fire({
    icon: "error",
    title: sms,
    text: "Intente de nuevo!",
    
    });
      break;
  
  case 'success':
    Swal.fire({
    
    icon: "success",
    title: sms,
    showConfirmButton: false,
    timer: 1500
    });
    break;

  case 'logout': 
   Swal.fire({
    title: '<span style="font-weight: 600; color: #1e293b;">Sesión finalizada</span>',
    html: `
      <div style="font-size: 1rem; color: #334155;">
        Gracias por usar <strong>FreelaHub</strong>.<br>
        Nos vemos pronto <span style="font-size: 1.5rem;">🫡</span>
      </div>
    `,
    background: '#ffffff',
    timer: 3000,
    timerProgressBar: true,
    showConfirmButton: false,
    customClass: {
      popup: 'border border-slate-300 shadow-md rounded-xl',
    },
  });break;
}
}