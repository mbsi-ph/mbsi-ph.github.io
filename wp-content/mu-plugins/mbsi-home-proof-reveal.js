(()=>{
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 const cards=[...document.querySelectorAll('.proof-section .proof-grid > div')];
 if(motion.matches||!('IntersectionObserver' in window))return;
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{const card=entry.target;if(entry.isIntersecting){card.classList.remove('benefit-reveal-exiting');card.classList.add('benefit-reveal-shown');}else if(card.classList.contains('benefit-reveal-shown')&&!card.contains(document.activeElement)){card.classList.add('benefit-reveal-exiting');card.classList.remove('benefit-reveal-shown');}}),{threshold:.08});
 cards.forEach((card,index)=>{card.style.setProperty('--benefit-delay',index*140+'ms');card.classList.add('benefit-reveal-pending');observer.observe(card);card.addEventListener('focusin',()=>{card.style.setProperty('--benefit-delay','0ms');card.classList.add('benefit-reveal-shown');});});
 motion.addEventListener('change',()=>{if(motion.matches){observer.disconnect();cards.forEach(card=>card.classList.add('benefit-reveal-shown'));}});
})();