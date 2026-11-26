(() => {
 const baseline=1440;
 const layer=document.createElement('style');layer.id='mbsi-wide-screen-scaling';document.head.append(layer);
 const scaleLengths=(value,factor)=>value.replace(/(-?\d*\.?\d+)(px|rem)\b/g,(_,n,unit)=>(Number(n)*factor).toFixed(4).replace(/\.?0+$/,'')+unit);
 const serialize=(rules,factor,baseUrl)=>Array.from(rules).map(rule=>{
  if(rule.selectorText&&rule.style){
   if(/#wpadminbar|\.elementor-element-overlay|\.elementor-editor-element-settings/.test(rule.selectorText))return '';
   const declarations=Array.from(rule.style).map(prop=>{
    const value=rule.style.getPropertyValue(prop);
    // Preserve URLs/data images and intrinsic image backgrounds.
    if(/url\(/i.test(value)){const resolved=value.replace(/url\(\s*(['"]?)(.*?)\1\s*\)/g,(_,quote,url)=>'url('+JSON.stringify(new URL(url,baseUrl).href)+')');return prop+':'+resolved+(rule.style.getPropertyPriority(prop)?'!important':'')+';';}
    return prop+':'+scaleLengths(value,factor)+(rule.style.getPropertyPriority(prop)?'!important':'')+';';
   }).join('');
   return rule.selectorText+'{'+declarations+'}';
  }
  if(rule.cssRules&&/^@(media|supports|layer|container)\b/.test(rule.cssText))return rule.cssText.slice(0,rule.cssText.indexOf('{')+1)+serialize(rule.cssRules,factor,baseUrl)+'}';
  return '';
 }).join('\n');
 let queued;
 const rebuild=()=>{
  const factor=window.innerWidth/baseline;
  if(factor<=1){layer.textContent='';document.documentElement.dataset.mbsiDesktopScale='1';return;}
  const sheets=Array.from(document.styleSheets).filter(sheet=>sheet.ownerNode!==layer&&((sheet.href&&/\/wp-content\/(themes\/mbsi|plugins\/mbsi-core|uploads\/elementor|mu-plugins)\//.test(sheet.href))||(!sheet.href&&sheet.ownerNode?.id==='mbsi-published-reference-styles')));
  layer.textContent=sheets.map(sheet=>{try{return serialize(sheet.cssRules,factor,sheet.href||document.baseURI);}catch{return '';}}).join('\n');
  document.documentElement.dataset.mbsiDesktopScale=factor.toFixed(3);
 };
 const schedule=()=>{clearTimeout(queued);queued=setTimeout(rebuild,100);};
 window.addEventListener('resize',schedule);window.addEventListener('load',schedule);
 document.querySelectorAll('link[rel=stylesheet]').forEach(link=>link.addEventListener('load',schedule));
 new MutationObserver(mutations=>{if(mutations.some(m=>m.target!==layer&&!layer.contains(m.target)))schedule();}).observe(document.head,{childList:true,subtree:true});
 rebuild();
})();
