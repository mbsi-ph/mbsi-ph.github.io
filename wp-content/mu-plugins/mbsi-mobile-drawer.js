(()=>{
 const toggle=document.querySelector('[data-nav-toggle]'),nav=document.querySelector('[data-nav]');if(!toggle||!nav)return;
 const mobile=matchMedia('(max-width:1160px)'),placeholder=document.createComment('MBSI desktop navigation');nav.before(placeholder);
 const drawer=document.createElement('dialog');drawer.className='mbsi-mobile-drawer';drawer.id='mbsi-mobile-menu';drawer.setAttribute('aria-label','Main navigation');
 drawer.innerHTML='<div class="mbsi-drawer-heading"><span>Menu</span><button class="mbsi-drawer-close" type="button" aria-label="Close navigation">&times;</button></div>';
 const heading=drawer.querySelector('.mbsi-drawer-heading > span');
 heading.className='mbsi-drawer-brand';
 heading.textContent='';
 const sourceLogo=document.querySelector('.site-header .brand img');
 if(sourceLogo){const logo=sourceLogo.cloneNode(false);logo.removeAttribute('id');logo.removeAttribute('srcset');logo.removeAttribute('sizes');logo.className='mbsi-drawer-logo';logo.src=sourceLogo.getAttribute('data-logo-dark')||sourceLogo.closest('[data-logo-dark]')?.getAttribute('data-logo-dark')||sourceLogo.src;logo.alt='';logo.width=44;logo.height=44;heading.append(logo);}
 const company=document.createElement('span');company.className='mbsi-drawer-company';company.textContent='Millennium Business Services, Inc.';heading.append(company);
 document.body.append(drawer);toggle.setAttribute('aria-controls',drawer.id);
 const close=()=>{if(drawer.open)drawer.close();};
 const sync=()=>{close();if(mobile.matches)drawer.append(nav);else placeholder.after(nav);nav.classList.remove('is-open');toggle.setAttribute('aria-expanded','false');};
 toggle.addEventListener('click',event=>{if(!mobile.matches)return;event.preventDefault();event.stopImmediatePropagation();if(drawer.open){close();return;}nav.classList.add('is-open');toggle.setAttribute('aria-expanded','true');document.documentElement.classList.add('mbsi-drawer-open');drawer.showModal();drawer.querySelector('button').focus();},true);
 drawer.querySelector('.mbsi-drawer-close').addEventListener('click',close);
 drawer.addEventListener('click',event=>{event.stopPropagation();if(event.target===drawer){const r=drawer.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right)close();}if(event.target.closest('a[href]'))close();});
 drawer.addEventListener('close',()=>{nav.classList.remove('is-open');document.documentElement.classList.remove('mbsi-drawer-open');toggle.setAttribute('aria-expanded','false');if(mobile.matches)toggle.focus();});
 nav.querySelectorAll('[data-dropdown-trigger]').forEach(button=>button.addEventListener('click',()=>{requestAnimationFrame(()=>nav.querySelectorAll('[data-dropdown-trigger]').forEach(trigger=>trigger.setAttribute('aria-expanded',String(trigger.closest('.nav-item').classList.contains('is-active')))));}));
 mobile.addEventListener('change',sync);sync();
})();