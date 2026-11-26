(() => {
 const root=document.documentElement,overlay=document.querySelector('.mbsi-page-loading');
 if(!overlay)return;
 const labels=['Loading your page…','Getting things ready…','Preparing your next page…','Just a moment…','Bringing everything together…'];
 const label=overlay.querySelector('.mbsi-page-loading-content > span:last-child');
 let lastLabel=-1;
 const randomLabel=()=>{let index=Math.floor(Math.random()*labels.length);if(index===lastLabel)index=(index+1+Math.floor(Math.random()*(labels.length-1)))%labels.length;lastLabel=index;if(label)label.textContent=labels[index];};
 const carriedLabel=root.dataset.mbsiLoadingLabel;
 if(label&&labels.includes(carriedLabel)){label.textContent=carriedLabel;lastLabel=labels.indexOf(carriedLabel);}else randomLabel();
 const key='mbsiPendingNavigation';let timer;
 const hide=()=>{clearTimeout(timer);root.classList.remove('mbsi-page-loading-active');overlay.setAttribute('aria-hidden','true');try{sessionStorage.removeItem(key);}catch{}};
 const show=url=>{
  randomLabel();
  root.classList.add('mbsi-page-loading-active');overlay.setAttribute('aria-hidden','false');
  try{sessionStorage.setItem(key,JSON.stringify({time:Date.now(),target:url.pathname+url.search,label:label?.textContent}));}catch{}
  clearTimeout(timer);timer=setTimeout(hide,10000);
 };
 window.addEventListener('click',event=>{
  if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const link=event.target.closest?.('a[href]');if(!link||link.matches('[data-mbsi-privacy-open],.mbsi-privacy-modal-trigger,[aria-haspopup=dialog]')||link.hasAttribute('download')||(link.target&&link.target!=='_self')||link.getAttribute('aria-disabled')==='true')return;
  const url=new URL(link.href,location.href);
  if(!/^https?:$/.test(url.protocol)||url.origin!==location.origin||/\/(wp-admin|wp-login\.php|wp-json|wp-content|wp-includes)(\/|$)/.test(url.pathname))return;
  if(url.pathname===location.pathname&&url.search===location.search)return;
  queueMicrotask(()=>{if(!event.defaultPrevented)show(url);});
 });
 window.addEventListener('pageshow',hide);
 const ready=()=>{
  const fonts=document.fonts?.ready||Promise.resolve();
  Promise.race([fonts,new Promise(resolve=>setTimeout(resolve,1200))]).then(()=>requestAnimationFrame(()=>requestAnimationFrame(hide)));
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
 timer=setTimeout(hide,10000);
})();


