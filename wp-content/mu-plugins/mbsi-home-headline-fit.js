(()=>{
 const h=document.querySelector('.hero h1');if(!h)return;
 const media=matchMedia('(min-width:768px)');let queued=false;
 const fit=()=>{queued=false;h.style.removeProperty('font-size');if(!media.matches)return;const width=h.clientWidth-8;let size=parseFloat(getComputedStyle(h).fontSize);const span=h.querySelector('span');const measure=()=>{const range=document.createRange();let widest=0;for(const node of h.childNodes){if(node.nodeType===3&&node.textContent.trim()){range.selectNodeContents(node);widest=Math.max(widest,range.getBoundingClientRect().width);}}if(span){range.selectNodeContents(span);widest=Math.max(widest,range.getBoundingClientRect().width);}return widest;};for(let i=0;i<3;i++){const used=measure();if(used<=width)break;size*=width/used;h.style.setProperty('font-size',size+'px','important');}};
 const schedule=()=>{if(!queued){queued=true;requestAnimationFrame(fit);}};
 new ResizeObserver(schedule).observe(h.parentElement);window.addEventListener('resize',schedule);document.fonts?.ready.then(schedule);schedule();
})();
