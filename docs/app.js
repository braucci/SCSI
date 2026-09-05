'use strict';
const catalog = {...window.Corso.raw,records:window.Corso.records};
const records = catalog.records;
const PAGE = 5;
const ARCHIVE = window.Corso.ministeriali.archive;
const SOURCE = window.Corso.baseURL;
const areaNames = window.Corso.areas;
const screen = document.getElementById('screen');
const lcd = document.getElementById('lcd');
const notice = document.getElementById('notice');
let powered = true, soundEnabled = false, audioContext, downloading = false;
let state = {kind:'home', title:'Menu principale', selected:0};
let stack = [];
let ministerial = window.Corso.ministeriali.map;
let ministerialStatus = 'Archivio disponibile';
let didRefresh = false;

function node(tag, className, text) { const el = document.createElement(tag); if(className) el.className=className; if(text!==undefined) el.textContent=text; return el; }
function message(text) { notice.textContent=text; }
function normalize(value) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(); }
function isPdf(url) { return /\.pdf(?:$|[?#])/i.test(url); }
function safeURL(url) { return window.Corso.url(url); }
function labelFile(name) { return name.replace(/\.pdf$/i,'').replace(/^\d{4}-\d{4}_ITCT_/i,'').replace(/_/g,' ').toLowerCase().replace(/^./,c=>c.toUpperCase()); }
function fileRecord(year,file) { return {title:labelFile(file.name),code:year,meta:'Prova ministeriale · PDF'+(file.size?' · '+(file.size/1048576).toFixed(1)+' MB':''),description:'Traccia ufficiale del Ministero per l’anno scolastico '+year+'. Documento originale conservato nell’archivio del corso.',links:[{label:'Apri il PDF',url:file.url}]}; }
function currentRows() {
  if(state.kind==='home') {
    const rows=window.Corso.sections.map(section=>({label:section.label,count:countSection(section.id),run:()=>section.id==='supporto'?push({kind:'areas',title:section.label}):section.id==='slide'?push({kind:'slide-years',title:section.label}):listSection(section.id,section.label)}));
    rows.splice(1,0,{label:'Prove ministeriali',count:ministerial.size+' anni',run:()=>{push({kind:'years',title:'Prove ministeriali'});refreshYears();}});
    rows.push({label:'Cerca nell’archivio',count:'⌕',run:search},{label:'Licenza e note',count:'i',run:()=>push({kind:'reader',title:'Licenza e note',text:catalog.license,page:0})});return rows;
  }
  if(state.kind==='slide-years')return [3,4,5].map(year=>({label:{3:'Terzo anno',4:'Quarto anno',5:'Quinto anno'}[year],count:records.filter(r=>r.section==='slide'&&r.year===year).length,run:()=>push({kind:'list',title:'Slide · '+year+'º anno',items:records.filter(r=>r.section==='slide'&&r.year===year)})}));
  if(state.kind==='areas') return Object.entries(areaNames).map(([key,label])=>({label,count:records.filter(r=>r.section==='supporto'&&r.area===key).length,run:()=>push({kind:'list',title:label,items:records.filter(r=>r.section==='supporto'&&r.area===key)})})).filter(x=>x.count);
  if(state.kind==='list' || state.kind==='search') {
    const items=state.kind==='search'?searchResults():state.items;
    return items.map(item=>({label:item.title,count:isPdf(item.links[0]?.url||'')?'PDF':'↗',run:()=>push({kind:'detail',title:item.title,item})}));
  }
  if(state.kind==='years') return [...ministerial.keys()].sort().reverse().map(year=>({label:year,count:ministerial.get(year).length,run:()=>{push({kind:'year',title:year,year});refreshYear(year);}}));
  if(state.kind==='year') return (ministerial.get(state.year)||[]).map(file=>({label:labelFile(file.name),count:'PDF',run:()=>push({kind:'detail',item:fileRecord(state.year,file),title:labelFile(file.name)})}));
  if(state.kind==='detail') {
    const item=state.item, rows=[];
    for(const link of item.links) {
      rows.push({label:link.label||'Apri documento',count:'↗',run:()=>openLink(link.url)});
      if(isPdf(link.url)) rows.push({label:item.links.filter(x=>isPdf(x.url)).length>1?'Scarica: '+link.label.replace(/^Apri\s+(il|la|le)\s+/i,''):'Scarica il PDF',count:'↓',run:()=>download(link.url)});
    }
    rows.push({label:'Leggi la scheda completa',count:'i',run:()=>push({kind:'reader',title:'Scheda della lezione',text:item.title+'\n\n'+item.meta+'\n\n'+item.description,page:0})});
    return rows;
  }
  return [];
}
function countSection(section) {return records.filter(r=>r.section===section).length;}
function listSection(section,title) {push({kind:'list',title,items:records.filter(r=>r.section===section)});}
function searchResults() {return (state.query||'').trim()?window.Corso.search(state.query):[];}
function push(next) {stack.push({...state});state={selected:0,...next};render();}
function back() {if(stack.length){state=stack.pop();render();}else{message('Sei nel menu principale.');}}
function home() {stack=[];state={kind:'home',title:'Menu principale',selected:0};render();}
function search() {if(state.kind!=='search')push({kind:'search',title:'Cerca una lezione',query:''});const input=screen.querySelector('input');input?.focus();}
function pageText(text,limit=300) {
  const words=text.split(/(\s+)/),pages=[];let page='';
  for(const word of words){if(page.length+word.length>limit&&page.trim()){pages.push(page.trim());page='';}page+=word;}
  if(page.trim())pages.push(page.trim());return pages.length?pages:['Nessuna descrizione disponibile.'];
}
function render() {
  screen.replaceChildren();
  const top=node('div','screen-top');top.append(node('span','',state.kind==='home'?'COSTRUZIONI AERONAUTICHE':state.kind==='detail'?state.item.code||'DOCUMENTO':'AERO POCKET'),node('b','','▰▰▰'));screen.append(top);
  if(state.kind==='reader') {renderReader();return;}
  const title=node('h1','screen-heading'+(state.kind==='detail'?' detail-title':''),state.title);title.title=state.title;screen.append(title);
  if(state.kind==='home')screen.append(node('p','screen-sub',records.length+' schede · Prof. B. Raucci'));
  if(state.kind==='detail')screen.append(node('p','detail-meta',state.item.meta));
  if(state.kind==='search') {
    const form=node('form','search-box');form.setAttribute('role','search');
    const input=node('input');input.type='search';input.placeholder='es. longherone';input.value=state.query||'';input.autocomplete='off';input.setAttribute('aria-label','Cerca per titolo, argomento o parola chiave');
    input.addEventListener('input',()=>{state.query=input.value;state.selected=0;renderRows();});
    input.addEventListener('keydown',event=>{if(event.key==='ArrowDown'){event.preventDefault();input.blur();renderRows();screen.querySelector('.selected')?.focus();}});
    form.addEventListener('submit',event=>{event.preventDefault();input.blur();activate();});form.append(input);screen.append(form);
  }
  if(state.kind==='years')screen.append(node('p','screen-sub',ministerialStatus));
  renderRows();
}
function renderRows() {
  screen.querySelector('.menu-list')?.remove();screen.querySelector('.empty')?.remove();screen.querySelector('.screen-bottom')?.remove();
  const rows=currentRows();state.selected=Math.max(0,Math.min(state.selected,rows.length-1));
  const page=Math.floor(state.selected/PAGE),pages=Math.max(1,Math.ceil(rows.length/PAGE));
  if(rows.length) {
    const list=node('ul','menu-list'+(state.kind==='detail'?' detail-list':''));list.setAttribute('aria-label',state.title);
    rows.slice(page*PAGE,(page+1)*PAGE).forEach((row,offset)=>{
      const index=page*PAGE+offset,li=node('li'),button=node('button','menu-row'+(index===state.selected?' selected':''));
      button.type='button';button.setAttribute('aria-label',row.label);button.title=row.label;
      if(index===state.selected)button.setAttribute('aria-current','true');
      button.append(node('span','row-name',row.label));if(row.count!==undefined)button.append(node('span','row-count',String(row.count)));
      button.addEventListener('click',()=>{state.selected=index;beep('a');row.run();});
      button.addEventListener('focus',()=>{state.selected=index;list.querySelectorAll('.menu-row').forEach(el=>{el.classList.toggle('selected',el===button);if(el===button)el.setAttribute('aria-current','true');else el.removeAttribute('aria-current');});});
      li.append(button);list.append(li);
    });
    screen.append(list);
    const selected=list.querySelector('.selected');if(selected)list.scrollTop=Math.max(0,selected.offsetTop-list.offsetTop-list.clientHeight+selected.clientHeight);
  } else screen.append(node('div','empty',state.kind==='search'?(state.query?'Nessun risultato. Prova un’altra parola.':'Titolo, argomento o anno: cerca fra tutte le schede.'):state.kind==='years'?'Elenco non disponibile. Riprova dal menu.':'Nessun documento presente.'));
  const footer=node('div','screen-bottom');
  const left=node('button','','◀');left.type='button';left.setAttribute('aria-label','Pagina precedente');left.disabled=page===0;left.onclick=()=>handle('left');
  const right=node('button','','▶');right.type='button';right.setAttribute('aria-label','Pagina successiva');right.disabled=page>=pages-1;right.onclick=()=>handle('right');
  footer.append(left,node('span','',state.kind==='search'?rows.length+' risultati': 'A apri · B indietro'),node('span','',(page+1)+'/'+pages),right);screen.append(footer);
}
function renderReader() {
  const pages=pageText(state.text);state.page=Math.max(0,Math.min(state.page||0,pages.length-1));
  screen.append(node('h1','screen-heading',state.title),node('p','reader',pages[state.page]));
  const footer=node('div','screen-bottom'),prev=node('button','','◀'),next=node('button','','▶');
  prev.setAttribute('aria-label','Pagina precedente');next.setAttribute('aria-label','Pagina successiva');prev.disabled=state.page===0;next.disabled=state.page===pages.length-1;
  prev.onclick=()=>handle('left');next.onclick=()=>handle('right');footer.append(prev,node('span','','B indietro'),node('span','',(state.page+1)+'/'+pages.length),next);screen.append(footer);
}
function activate() {currentRows()[state.selected]?.run();}
function handle(key) {
  if(!powered){if(key==='start')togglePower();return;}
  beep(key);pulseButton(key);
  if(key==='start'){home();return;}if(key==='select'){search();return;}if(key==='b'){back();return;}
  if(state.kind==='reader') {
    const reader=screen.querySelector('.reader');
    if(key==='down'&&reader.scrollTop+reader.clientHeight<reader.scrollHeight-2){reader.scrollTop+=45;return;}
    if(key==='up'&&reader.scrollTop>0){reader.scrollTop-=45;return;}
    state.page+=(['right','down','a'].includes(key)?1:-1);render();return;
  }
  if(key==='a'){activate();return;}
  const length=currentRows().length;if(!length)return;
  if(key==='up')state.selected=Math.max(0,state.selected-1);
  if(key==='down')state.selected=Math.min(length-1,state.selected+1);
  if(key==='left')state.selected=Math.max(0,state.selected-PAGE);
  if(key==='right')state.selected=Math.min(length-1,state.selected+PAGE);
  renderRows();
}
function pulseButton(key) {const el=document.querySelector('[data-key="'+key+'"]');if(el){el.classList.add('pressed');setTimeout(()=>el.classList.remove('pressed'),110);}}
function openLink(url) {const safe=safeURL(url);if(!safe){message('Collegamento non valido.');return;}const a=node('a');a.href=safe;a.target='_blank';a.rel='noopener noreferrer';a.click();message('Documento aperto in una nuova scheda.');}
async function download(url) {
  if(downloading){message('Il download è già in preparazione.');return;}
  const safe=safeURL(url);if(!safe)return;downloading=true;message('Preparazione del PDF…');
  try {
    const response=await fetch(safe,{signal:AbortSignal.timeout(45000)});
    if(!response.ok)throw new Error('HTTP '+response.status);
    const blob=await response.blob();
    if(blob.type.includes('text/html'))throw new Error('Il collegamento non contiene un PDF');
    const object=URL.createObjectURL(blob),a=node('a');a.href=object;a.download=decodeURIComponent(new URL(safe).pathname.split('/').pop());document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(object),60000);
    message('PDF pronto. Su iPhone puoi salvarlo in File dal menu Condividi.');
  }catch(error){message('Download diretto non disponibile. Usa «Apri» nella scheda per visualizzare e salvare il PDF.');}
  finally{downloading=false;}
}
async function refreshYears() {
  if(didRefresh)return;didRefresh=true;
  try{await window.Corso.ministeriali.refreshYears();ministerialStatus='Elenco aggiornato · '+ministerial.size+' anni';}
  catch{ministerialStatus='Elenco salvato · aggiornamento non riuscito';didRefresh=false;}
  if(state.kind==='years')render();
}
async function refreshYear(year) {
  try{await window.Corso.ministeriali.refreshYear(year);if(state.kind==='year'&&state.year===year)render();}
  catch{if(!(ministerial.get(year)||[]).length){message('Impossibile aggiornare questo anno. Puoi consultare l’archivio originale.');if(state.kind==='year'&&state.year===year){state={kind:'detail',selected:0,title:year,item:{title:year,code:'MINISTERIALI',meta:'Elenco temporaneamente non disponibile',description:'Consulta i documenti originali nell’archivio del corso.',links:[{label:'Apri archivio originale',url:ARCHIVE+'/'+year}]}};render();}}}
}
function beep(key) {
  if(!soundEnabled)return;
  try {audioContext??=new(window.AudioContext||window.webkitAudioContext)();if(audioContext.state==='suspended')audioContext.resume();const osc=audioContext.createOscillator(),gain=audioContext.createGain();osc.type='square';osc.frequency.value=key==='b'?240:key==='a'?640:420;gain.gain.setValueAtTime(.018,audioContext.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+.055);osc.connect(gain);gain.connect(audioContext.destination);osc.start();osc.stop(audioContext.currentTime+.06);}catch{}
}
function togglePower() {powered=!powered;lcd.classList.toggle('off',!powered);const power=document.getElementById('power');power.setAttribute('aria-pressed',String(powered));power.setAttribute('aria-label',powered?'Spegni la console':'Accendi la console');lcd.setAttribute('aria-hidden',String(!powered));lcd.inert=!powered;message(powered?'Console accesa.':'Console spenta. Premi START o l’interruttore per accenderla.');if(powered)beep('a');}
document.querySelectorAll('[data-key]').forEach(button=>button.addEventListener('click',()=>handle(button.dataset.key)));
document.getElementById('power').addEventListener('click',togglePower);
document.getElementById('sound').addEventListener('click',event=>{soundEnabled=!soundEnabled;event.currentTarget.setAttribute('aria-pressed',String(soundEnabled));event.currentTarget.setAttribute('aria-label',soundEnabled?'Disattiva i suoni':'Attiva i suoni');event.currentTarget.querySelector('span').textContent=soundEnabled?'ON':'OFF';beep('a');});
document.addEventListener('keydown',event=>{
  if(event.ctrlKey||event.metaKey||event.altKey||event.target.matches('input,textarea,[contenteditable="true"]'))return;
  const key={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',Enter:'a',Escape:'b',Backspace:'b',a:'a',A:'a',b:'b',B:'b',s:'start',S:'start','/':'select'}[event.key];
  if(!key)return;
  if(event.key==='Enter'&&event.target.closest('button,a'))return;
  event.preventDefault();handle(key);
});
render();
