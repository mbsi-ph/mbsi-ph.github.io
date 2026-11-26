(()=>{
 const hero=document.querySelector('.hero');if(!hero)return;
 const motion=matchMedia('(prefers-reduced-motion: reduce)'),desktop=matchMedia('(min-width: 901px) and (hover: hover)');
 let frame=0,basePositions=[],imageHeight=0;
 const photo=new Image();
 const reset=()=>{hero.style.removeProperty('background-position');hero.removeAttribute('data-parallax-offset');};
 const measure=()=>{
  reset();const style=getComputedStyle(hero);basePositions=style.backgroundPosition.split(',').map(p=>p.trim());
  if(photo.naturalWidth){const r=hero.getBoundingClientRect();imageHeight=photo.naturalHeight*Math.max(r.width/photo.naturalWidth,r.height/photo.naturalHeight);}
  schedule();
 };
 const update=()=>{
  frame=0;
  if(motion.matches||!desktop.matches||document.documentElement.classList.contains('mbsi-brand-splash-pending')){reset();return;}
  const rect=hero.getBoundingClientRect();if(rect.bottom<=0||rect.top>=innerHeight)return;
  const space=Math.max(0,(imageHeight-rect.height)/2-8);
  const shift=Math.min(Math.max(0,window.scrollY)*.18,64,space);
  const positions=basePositions.slice();if(!positions.length)return;
  positions[positions.length-1]='center calc(50% + '+shift.toFixed(2)+'px)';
  hero.style.setProperty('background-position',positions.join(','),'important');hero.dataset.parallaxOffset=shift.toFixed(2);
 };
 function schedule(){if(!frame)frame=requestAnimationFrame(update);}
 const source=getComputedStyle(hero).backgroundImage.match(/url\(["']?(.*?)["']?\)/);
 if(source){photo.onload=measure;photo.src=source[1];}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',measure,{passive:true});addEventListener('load',measure);addEventListener('mbsi:splash-complete',measure);
 motion.addEventListener('change',measure);desktop.addEventListener('change',measure);measure();
})();