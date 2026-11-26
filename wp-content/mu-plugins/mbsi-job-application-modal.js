(() => {
 let opener;
 const application=()=>document.querySelector('.career-application-dialog');
 document.addEventListener('click',event=>{
  const button=event.target.closest('[data-job-application-open],.career-general-button .elementor-button');
  const dialog=application();if(!dialog)return;
  if(button){event.preventDefault();opener=button;if(!dialog.open)dialog.showModal();document.documentElement.classList.add('career-dialog-open');return;}
  if(event.target.closest('[data-job-application-close]')){dialog.close();return;}
  if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}
 });
 document.addEventListener('close',event=>{if(event.target.matches('.career-application-dialog')){document.documentElement.classList.remove('career-dialog-open');opener?.focus();}},true);
 function feedback(){const dialog=application();if(!dialog)return;if(new URLSearchParams(location.search).get('mbsi_application')!=='success'&&dialog.querySelector('.mbsi-form-notice:not([hidden]),.mbsi-form-success,.mbsi-form-error,[role="alert"]')){if(!dialog.open)dialog.showModal();document.documentElement.classList.add('career-dialog-open');}}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',feedback);else feedback();
})();