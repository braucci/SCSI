/* Populate the original classic layout before its interaction script starts. */
(function(){
  'use strict';
  const corso=window.Corso;if(!corso)return;
  const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
  const yearID={3:'slide-terzo',4:'slide-quarto',5:'slide-quinto'};
  for(const item of corso.records){
    const section=document.getElementById(item.section);if(!section)continue;
    let parent=item.section==='slide'?document.getElementById(yearID[item.year]):section;
    let grid=document.querySelector(corso.classicTarget(item));
    if(!grid){grid=el('div',item.featured?'grid-feat':'grid');parent.append(grid);}
    const card=el('article','card'+(item.featured?' feat':'')+(item.section==='slide'?' feat card--slide':'')+(item.translation?' card--trad':''));
    card.dataset.area=item.area;card.dataset.documentId=item.id;card.tabIndex=-1;
    if(item.section==='slide')card.append(el('span','slide-badge','Slide di lezione'));
    if(item.translation)card.append(el('span','trad-badge','Traduzione e lettura guidata'));
    const top=el('div','card-top');top.append(el('span','code',item.code),el('span','meta',item.meta));card.append(top,el('h3','',item.title));
    if(item.bylineHtml){const line=el('p','byline');line.innerHTML=item.bylineHtml;card.append(line);}
    const desc=el('p','desc');desc.innerHTML=item.descriptionHtml;card.append(desc);
    const links=el('div','card-links');
    item.links.forEach((link,index)=>{const a=el('a','open'+(index?' sub':''),link.label||'Apri documento');a.href=link.url;a.target='_blank';a.rel='noopener noreferrer';a.append(el('span','arr',' →'));links.append(a);});
    card.append(links);grid.append(card);
  }
  for(const section of corso.sections){
    const head=document.querySelector('#'+section.id+' > .sec-head');
    if(head){const tag=head.querySelector('.tag');if(tag)tag.textContent=corso.bySection(section.id).length+' documenti';}
  }
  for(const [year,id] of Object.entries(yearID)){
    const label=document.querySelector('#'+id+' .subsec-state');
    if(label)label.textContent=corso.records.filter(r=>r.section==='slide'&&r.year===Number(year)).length+' presentazioni';
  }
  const stats=document.querySelectorAll('.hero .stat b');
  if(stats[0])stats[0].textContent=corso.bySection('prove').length;
  if(stats[1])stats[1].textContent=corso.bySection('supporto').length;
  const labels=document.querySelectorAll('.hero .stat span');if(labels[1])labels[1].textContent='Materiali di supporto';
  const examYears=corso.bySection('prove').flatMap(r=>(r.code+' '+r.title).match(/\b20\d{2}\b/g)||[]).map(Number);
  if(stats[2]&&examYears.length)stats[2].textContent=Math.min(...examYears)+'–'+String(Math.max(...examYears)).slice(-2);
  const chips=document.getElementById('chips');chips.replaceChildren();
  for(const [key,name] of [['all','Tutti'],...Object.entries(corso.areas)]){
    if(key!=='all'&&!corso.records.some(r=>r.area===key))continue;
    const chip=el('button','chip',name);chip.type='button';chip.dataset.area=key;chip.setAttribute('aria-pressed',String(key==='all'));chips.append(chip);
  }
  const min=corso.ministeriali,yearSelect=document.getElementById('minAnno'),fileSelect=document.getElementById('minFile'),download=document.getElementById('minDl'),status=document.getElementById('minStatus');
  let generation=0;
  function label(name){return name.replace(/\.pdf$/i,'').replace(/^\d{4}-\d{4}_ITCT_/i,'').replace(/_/g,' ');}
  function option(text,value){const o=el('option','',text);o.value=value;return o;}
  function reset(){fileSelect.replaceChildren(option('— prima scegli l’anno —',''));fileSelect.disabled=true;download.href='#';download.setAttribute('aria-disabled','true');download.removeAttribute('download');}
  function years(){const value=yearSelect.value;yearSelect.replaceChildren(option('— scegli l’anno —',''));[...min.map.keys()].sort().reverse().forEach(y=>yearSelect.append(option(y,y)));yearSelect.value=value;yearSelect.disabled=false;}
  function files(year){const list=min.map.get(year)||[];fileSelect.replaceChildren(option(list.length?'— scegli la sessione —':'Nessun PDF disponibile',''));list.forEach(f=>fileSelect.append(option(label(f.name),f.name)));fileSelect.disabled=!list.length;}
  function fallback(year){status.replaceChildren(document.createTextNode('Aggiornamento non riuscito. L’elenco salvato resta consultabile. '));const a=el('a','','Apri archivio originale ↗');a.href=min.archive+(year?'/'+year:'');a.target='_blank';a.rel='noopener noreferrer';status.append(a);}
  reset();years();status.textContent=min.map.size+' anni scolastici nell’elenco salvato.';
  yearSelect.addEventListener('change',async()=>{
    const year=yearSelect.value,ticket=++generation;reset();if(!year)return;files(year);status.textContent='Aggiornamento dell’anno '+year+'…';
    try{await min.refreshYear(year);if(ticket!==generation)return;files(year);status.textContent=(min.map.get(year)||[]).length+' prove per '+year+'.';}catch{if(ticket===generation)fallback(year);}
  });
  fileSelect.addEventListener('change',()=>{const file=(min.map.get(yearSelect.value)||[]).find(f=>f.name===fileSelect.value);if(!file){download.href='#';download.setAttribute('aria-disabled','true');return;}download.href=file.url;download.download=file.name;download.setAttribute('aria-disabled','false');status.textContent='Pronto: '+label(file.name)+'.';});
  download.addEventListener('click',event=>{if(download.getAttribute('aria-disabled')==='true')event.preventDefault();});
  let started=false;
  const update=()=>{if(started)return;started=true;min.refreshYears().then(()=>{years();if(!yearSelect.value)status.textContent=min.map.size+' anni scolastici · elenco aggiornato.';}).catch(()=>{if(!yearSelect.value)fallback('');});};
  if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){update();observer.disconnect();}},{rootMargin:'400px'});observer.observe(document.getElementById('ministeriali'));}else update();
})();
