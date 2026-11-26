(()=>{
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 const native=CSS.supports('animation-timeline: view()');let observer;
 const rows=[...document.querySelectorAll('.service-feature')].filter(row=>row.querySelector('.service-feature-copy'));
 rows.forEach((row,index)=>{
  row.classList.add('service-cinema');row.style.setProperty('--cinema-shift',index%2?'-36px':'36px');row.style.setProperty('--cinema-tilt',index%2?'5deg':'-5deg');
  // Replace the older reveal system only within these service rows.
  [row,...row.querySelectorAll('.reveal')].forEach(el=>el.classList.remove('reveal','is-visible'));
  const image=[...row.querySelectorAll('.service-feature-media')].find(el=>getComputedStyle(el).display!=='contents');
  if(image)image.classList.add('service-cinema-image');
  row.querySelectorAll('.service-feature-copy h3,.service-feature-copy p,.service-feature-copy .elementor-icon-list-item,.service-feature-copy .elementor-button,.service-feature-copy a.text-link').forEach((el,i)=>{
   el.classList.add('service-cinema-copy');el.style.setProperty('--cinema-start',15+Math.min(i,8)*3+'%');el.style.setProperty('--cinema-end',65+Math.min(i,8)*3+'%');
  });
 });
 if(!native&&!motion.matches&&'IntersectionObserver' in window){
  observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
   if(!entry.isIntersecting)return;const row=entry.target;
   row.querySelector('.service-cinema-image')?.animate([{opacity:.4,transform:'translateY(24px) scale(.96)',clipPath:'inset(6% round 20px)'},{opacity:1,transform:'none',clipPath:'inset(0 round 12px)'}],{duration:850,easing:'cubic-bezier(.2,.7,.3,1)'});
   row.querySelectorAll('.service-cinema-copy').forEach((el,i)=>el.animate([{opacity:.2,translate:'0 18px',filter:'blur(3px)'},{opacity:1,translate:'0 0',filter:'blur(0)'}],{duration:650,delay:Math.min(i,8)*65,easing:'ease-out',fill:'backwards'}));
   observer.unobserve(row);
  }),{threshold:.15});rows.forEach(row=>observer.observe(row));
 }
 motion.addEventListener('change',()=>{if(motion.matches){observer?.disconnect();rows.forEach(row=>row.getAnimations({subtree:true}).forEach(animation=>animation.cancel()));}});
})();