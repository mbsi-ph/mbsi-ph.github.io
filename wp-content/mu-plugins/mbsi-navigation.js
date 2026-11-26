(() => {
 const descriptions={
 'accounting-services':'Bookkeeping, reconciliations and financial records.',
 'payroll-processing':'Payroll calculations, deductions and employee records.',
 'financial-services':'Reports and analysis for informed business decisions.',
 'tax-compliance':'Tax records, filing preparation and compliance coordination.',
 'xero-services':'Cloud accounting setup, training and ongoing support.',
 'about-us':'Our background, values and service standards.',
 'our-team':'Meet our executive and business leadership teams.',
 'contact-us':'Connect with our team for inquiries and support.',
 'payroll-guides':'Practical payroll guidance for Philippine employers.',
 'accounting-compliance-updates':'Accounting insights and compliance updates.',
 'government-deadlines':'Key filing dates and compliance reminders.',
 'faqs':'Answers to common questions about our services.',
 'news':'Company news and business updates.',
 'resources':'Browse our guides, updates and helpful references.'
 };
 const sync=()=>document.querySelectorAll('.site-nav .nav-item').forEach(item=>{
 const trigger=item.querySelector('[data-dropdown-trigger]');
 if(trigger?.textContent.trim()==='Resources')item.classList.add('mbsi-resources-nav');
 item.querySelectorAll('.dropdown-panel a').forEach(link=>{
 const slug=new URL(link.href,location.href).pathname.split('/').filter(Boolean).pop();
 if(!link.dataset.desc&&descriptions[slug])link.dataset.desc=descriptions[slug];
 });
 });
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync);else sync();
 new MutationObserver(sync).observe(document.body,{childList:true,subtree:true});
})();
