import { parse } from 'acorn';

export function splitReviewModal(source,locale='pl') {
  const ast=parse(source,{ecmaVersion:'latest',sourceType:'script'});
  let target;
  function visit(node){if(!node || typeof node!=='object')return;if(node.type==='FunctionDeclaration' && node.id.name==='initReviewModal'){target=node;return;}for(const value of Object.values(node)){if(Array.isArray(value))value.forEach(visit);else if(value && typeof value==='object')visit(value);}}
  visit(ast);
  if(!target)return {initial:source,deferred:null};
  const failure={pl:'Nie udało się wczytać formularza. Spróbuj ponownie lub otwórz opinie w Google.',ru:'Не удалось загрузить форму. Попробуйте ещё раз или откройте отзывы в Google.',uk:'Не вдалося завантажити форму. Спробуйте ще раз або відкрийте відгуки в Google.',en:'The review form could not load. Try again or open the reviews in Google.'}[locale];
  const deferred=`window.naserwisReviewModalReady=function(pushMeasurementEvent){${source.slice(target.start,target.end)};initReviewModal();document.getElementById('review-text')?.dispatchEvent(new Event('input'));};`;
  // The carousel, stars and Google action remain ready immediately. Only the
  // private-review editor is fetched when the visitor approaches the reviews.
  const initial=source.slice(0,target.start)+`function initReviewModal(){
    const section=document.querySelector('.reviews'),modal=document.getElementById('review-modal');
    if(!section || !modal)return;
    let pending,ready=false;
    function load(){
      if(pending)return pending;
      pending=new Promise((resolve,reject)=>{
        const script=document.createElement('script');script.src='__REVIEW_MODAL_URL__';
        script.onload=()=>{const status=modal.querySelector('[role="alert"]');if(status?.dataset.editorError){status.textContent='';status.className='';delete status.dataset.editorError;}window.naserwisReviewModalReady(pushMeasurementEvent);delete window.naserwisReviewModalReady;ready=true;resolve();};
        script.onerror=()=>{script.remove();pending=null;const status=modal.querySelector('[role="alert"]');if(status){status.textContent=${JSON.stringify(failure)};status.className='error-message';status.dataset.editorError='true';}reject(new Error('Review editor unavailable'));};
        document.head.appendChild(script);
      });
      return pending;
    }
    function warm(){load().catch(()=>{});}
    if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();warm();}},{rootMargin:'600px'});observer.observe(section);}
    section.addEventListener('pointerover',warm,{once:true});section.addEventListener('focusin',warm,{once:true});
    section.addEventListener('click',event=>{if(event.target.closest('.star-btn'))warm();},true);
    function closePending(){modal.classList.remove('active');document.body.style.overflow='';modal.querySelector('form')?.reset();const button=modal.querySelector('.btn-post');if(button)button.disabled=true;}
    modal.addEventListener('click',event=>{if(!ready && event.target.closest('.btn-cancel,.modal-overlay'))closePending();},true);
    document.addEventListener('keydown',event=>{if(!ready && event.key==='Escape')closePending();});
  }`+source.slice(target.end);
  return {initial,deferred};
}
