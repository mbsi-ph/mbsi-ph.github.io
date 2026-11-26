(()=>{
 const toggle=document.querySelector('[data-nav-toggle]'),drawer=document.querySelector('.mbsi-mobile-drawer');if(!toggle||!drawer)return;
 const icon=paths=>'<svg viewBox="0 0 24 24" aria-hidden="true">'+paths+'</svg>';
 const icons={home:icon('<path d="m3 10 9-7 9 7v10H4V10M9 21v-8h6v8"/>'),services:icon('<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V3h8v4M3 12h18M10 12v3h4v-3"/>'),menu:icon('<path d="M5 6h14M5 12h14M5 18h14"/>'),resources:icon('<path d="M4 4h6a3 3 0 0 1 3 3v14a4 4 0 0 0-4-3H4zM20 4h-4a3 3 0 0 0-3 3v14a4 4 0 0 1 4-3h3z"/>'),contact:icon('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>')};
 const bar=document.createElement('nav');bar.className='mbsi-mobile-bottom-nav';bar.setAttribute('aria-label','Mobile navigation');
 bar.innerHTML='<a href="/" data-bottom-home>'+icons.home+'<span>Home</span></a><button type="button" data-bottom-section="Services">'+icons.services+'<span>Services</span></button><button type="button" class="mbsi-bottom-menu" aria-controls="mbsi-mobile-menu" aria-expanded="false"><span class="mbsi-bottom-menu-icon">'+icons.menu+'</span><span>Menu</span></button><button type="button" data-bottom-section="Resources">'+icons.resources+'<span>Resources</span></button><a href="/contact-us/">'+icons.contact+'<span>Contact</span></a>';
 document.body.appendChild(bar);let returnFocus;
 const open=(button,section)=>{returnFocus=button;if(!drawer.open)toggle.click();if(section){const trigger=[...drawer.querySelectorAll('[data-dropdown-trigger]')].find(el=>el.textContent.trim()===section);if(trigger&&!trigger.closest('.nav-item').classList.contains('is-active'))trigger.click();trigger?.focus();}};
 bar.querySelectorAll('button').forEach(button=>button.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();open(button,button.dataset.bottomSection);}));
 drawer.addEventListener('close',()=>{if(returnFocus){returnFocus.focus();returnFocus=null;}});
 const sync=()=>{bar.querySelector('.mbsi-bottom-menu').setAttribute('aria-expanded',String(drawer.open));};new MutationObserver(sync).observe(drawer,{attributes:true,attributeFilter:['open']});
 const path=location.pathname.replace(/\/$/,'')||'/';bar.querySelectorAll('a').forEach(link=>{if((new URL(link.href).pathname.replace(/\/$/,'')||'/')===path)link.setAttribute('aria-current','page');});
 if(path.startsWith('/our-services'))bar.querySelector('[data-bottom-section=Services]').classList.add('is-current-section');
 if(/^\/(resources|faqs|news|accounting-compliance-updates|government-deadlines|payroll-guides)/.test(path))bar.querySelector('[data-bottom-section=Resources]').classList.add('is-current-section');
})();