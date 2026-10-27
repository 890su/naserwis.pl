import {copy} from './home-service-copy.mjs';
const routes={wifi:'naprawa-wifi/',repair:'naprawa-sieci/',install:'montaz-sieci/',cctv:'serwis-monitoringu/'};
const labels={
 pl:['Orientacyjne ceny','Masz jeszcze pytania?','Zadzwoń lub zostaw zgłoszenie. Ustalimy zakres i możliwy termin.','Zadzwoń','Zostaw zgłoszenie'],
 ru:['Ориентировочные цены','Остались вопросы?','Позвоните или оставьте заявку. Обсудим задачу и возможное время.','Позвонить','Оставить заявку'],
 uk:['Орієнтовні ціни','Залишилися запитання?','Зателефонуйте або залиште заявку. Обговоримо задачу й можливий час.','Зателефонувати','Залишити заявку'],
 en:['Indicative prices','Still have questions?','Call or send an enquiry. We will discuss the job and an available time.','Call us','Send an enquiry']
};
const section=(html,name,block)=>block(html,'section',new RegExp(`<section\\b[^>]*class="[^"]*\\b${name}\\b[^"]*"`));
const billing=c=>`<p class="billing-condition">${c.shortNote}</p><p class="billing-rule">${c.noDouble}</p><p class="billing-project">${c.project}</p><p class="price-disclaimer">${c.disclaimer}</p>`;

// Reconstruct the generator's input model in memory. Published pages contain
// neither these placeholders nor hidden copies of the removed catalogue.
export function restoreCompactHome(html,block){
 const locale=html.match(/<html[^>]*lang="([^"]+)"/)?.[1]||'pl';
 const c=copy[locale],prefix=locale==='pl'?'':`${locale}/`;
 const prices=[[c.short,200],[c.visit,250],[c.next,150]];
 const model=`<section class="services home-billing" id="services"><div class="container"><h2 class="section-title" id="services-title">${c.billing}</h2><div class="price-table" role="table"><div class="price-row header" role="row"><div class="price-service" role="columnheader">${c.rateLabel}</div><div class="price-value" role="columnheader">${c.amountLabel}</div></div>${prices.map(([label,amount])=>`<div class="price-row" role="row"><div class="price-service" role="cell">${label}</div><div class="price-value" role="cell">${c.prefix} ${amount} ${c.currency}</div></div>`).join('')}</div>${billing(c)}</div></section>`;
 html=html.replace(section(html,'home-pricing',block),model);
 const catalog=`<section class="comprehensive-support home-service-catalog" id="available-services"><div class="container"><h2 id="available-services-title">${c.catalog}</h2><div class="home-services-grid">${c.services.map(([type,title,text])=>`<a class="home-service-link" href="/${prefix}${routes[type]}"><div><h3>${title}</h3><p>${text}</p></div></a>`).join('')}</div></div></section>`;
 const placeholders='<section class="problems"></section><section class="packages business-handoff"></section><section class="why-us"></section>';
 html=html.replace(/<section class="reviews"/,catalog+placeholders+'<section class="reviews"');
 return html.replace(' data-concise-home="20261027"','').replace(/<p class="home-audience-note">[\s\S]*?<\/p>/g,'');
}

export function simplifyCompactHome(html,locale,block){
 const c=copy[locale],t=labels[locale];
 const rates=[...section(html,'preview-conditions',block).matchAll(/<p class="preview-rate">[\s\S]*?<\/p>/g)].map(m=>m[0]);
 if(rates.length!==3)throw Error('Homepage requires all three ordered rates');
 const pricing=`<section class="home-pricing preview-conditions" id="services"><div class="container"><h2 class="home-section-heading">${t[0]}</h2><div class="home-pricing-rates">${rates.join('')}</div><div class="home-pricing-notes">${billing(c)}</div></div></section>`;
 html=html.replace(section(html,'home-billing',block),'').replace(section(html,'preview-conditions',block),pricing);
 for(const name of ['home-service-catalog','problems','why-us','business-handoff','how-we-work']){
  if(new RegExp(`<section\\b[^>]*class="[^"]*\\b${name}\\b`).test(html))html=html.replace(section(html,name,block),'');
 }
 const overview=section(html,'preview-overview',block);
 html=html.replace(overview,overview.replace('<section class="preview-overview">',`<section class="preview-overview" id="available-services" aria-label="${c.catalog}">`).replace('<h2>','<h2 id="available-services-title">'));
 html=html.replace(/(<p class="hero-subtitle hero-large-subtitle"[^>]*>[\s\S]*?<\/p>)/,`$1<p class="home-audience-note">${c.audience}</p>`);
 const contact=section(html,'final-cta',block);
 const updated=`<section class="final-cta home-contact-cta" id="contact" aria-labelledby="contact-title"><div class="container home-contact-grid"><div class="home-contact-copy"><h2 id="contact-title">${t[1]}</h2><p>${t[2]}</p></div><div class="preview-actions home-contact-actions"><a class="btn preview-outline" href="tel:+48453327678">${t[3]}</a><a class="btn btn-primary" href="#contact" data-contact-modal>${t[4]}</a></div></div></section>`;
 return html.replace(contact,updated).replace(/<body\b/, '<body data-concise-home="20261027"');
}
