(()=>{
 const root=document.documentElement,key='mbsi-theme';
 const icons={moon:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20.8 13.1A8.8 8.8 0 0 1 10.9 3.2a9 9 0 1 0 9.9 9.9Z"/></svg>',sun:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4m0-14.2-1.4 1.4M6.3 17.7l-1.4 1.4"/></svg>'};
 const drawer=document.querySelector('.mbsi-mobile-drawer');
 if(drawer){
  const row=document.createElement('div');row.className='mbsi-theme-menu';
  const label=document.createElement('span');label.textContent='Appearance';row.append(label);
  const button=document.createElement('button');button.type='button';button.dataset.mbsiThemeToggle='';button.className='mbsi-theme-menu-toggle';
  button.innerHTML='<span data-mbsi-theme-icon aria-hidden="true"></span><span data-mbsi-theme-label>Dark mode</span>';
  row.append(button);drawer.insertBefore(row,drawer.querySelector('.site-nav'));
 }
 const buttons=[...document.querySelectorAll('[data-mbsi-theme-toggle]')];
 const apply=(theme,persist=false)=>{
  const dark=theme==='dark';root.dataset.mbsiTheme=dark?'dark':'light';window.mbsiSyncBrandLogos?.();
  buttons.forEach(button=>{
   button.setAttribute('aria-pressed',String(dark));
   button.setAttribute('aria-label',dark?'Switch to light mode':'Switch to dark mode');
   button.title=dark?'Switch to light mode':'Switch to dark mode';
   button.querySelector('[data-mbsi-theme-icon]').innerHTML=dark?icons.sun:icons.moon;
   const label=button.querySelector('[data-mbsi-theme-label]');if(label)label.textContent=dark?'Light mode':'Dark mode';
  });
  if(persist)try{localStorage.setItem(key,dark?'dark':'light');}catch{}
 };
  let switching=false;
 const switchTheme=async event=>{
  if(switching)return;
  const theme=root.dataset.mbsiTheme==='dark'?'light':'dark';
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){apply(theme,true);return;}
  const rect=event.currentTarget.getBoundingClientRect();
  const x=event.detail?event.clientX:rect.left+rect.width/2;
  const y=event.detail?event.clientY:rect.top+rect.height/2;
  const radius=Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y));
  const ripple=()=>{const ring=document.createElement('span');ring.className='mbsi-theme-ripple';ring.setAttribute('aria-hidden','true');ring.style.setProperty('--ripple-x',x+'px');ring.style.setProperty('--ripple-y',y+'px');document.body.append(ring);ring.addEventListener('animationend',()=>ring.remove(),{once:true});setTimeout(()=>ring.remove(),900);};
  if(!document.startViewTransition){apply(theme,true);ripple();return;}
  switching=true;
  try{
   const transition=document.startViewTransition(()=>apply(theme,true));
   await transition.ready;
   ripple();
   await root.animate({clipPath:[`circle(0px at ${x}px ${y}px)`,`circle(${radius}px at ${x}px ${y}px)`]},{duration:700,easing:'cubic-bezier(.16,.7,.25,1)',pseudoElement:'::view-transition-new(root)'}).finished;
   await transition.finished;
  }catch{apply(theme,true);}finally{switching=false;}
 };
 buttons.forEach(button=>button.addEventListener('click',switchTheme));
 window.addEventListener('storage',event=>{if(event.key===key)apply(event.newValue==='dark'?'dark':'light');});
 apply(root.dataset.mbsiTheme==='dark'?'dark':'light');
})();
