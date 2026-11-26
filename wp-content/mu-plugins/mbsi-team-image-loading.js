(()=>{
 const tracked=new WeakMap();
 const scan=()=>document.querySelectorAll('.leadership-photo img').forEach(image=>{
  const source=(image.getAttribute('src')||'')+'|'+(image.getAttribute('srcset')||'');
  if(tracked.get(image)===source)return;tracked.set(image,source);
  const frame=image.closest('.leadership-photo');frame.classList.remove('is-image-error');frame.classList.add('is-image-loading');frame.setAttribute('aria-busy','true');
  const finish=failed=>{if(tracked.get(image)!==source)return;frame.classList.remove('is-image-loading');frame.classList.toggle('is-image-error',failed);frame.removeAttribute('aria-busy');};
  const loaded=()=>{if(typeof image.decode==='function')image.decode().then(()=>finish(false)).catch(()=>finish(!image.naturalWidth));else finish(!image.naturalWidth);};
  image.addEventListener('load',loaded,{once:true});image.addEventListener('error',()=>finish(true),{once:true});
  if(image.complete){if(image.naturalWidth)loaded();else finish(true);}
 });
 scan();new MutationObserver(scan).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['src','srcset']});
})();