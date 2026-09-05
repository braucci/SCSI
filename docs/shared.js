/* Shared catalogue, validation, resource URLs and ministerial archive. */
(function () {
  'use strict';
  const scriptURL = document.currentScript.src;
  const raw = window.CORSO_CATALOG;
  function fail(message) {
    const report = document.createElement('p');
    report.className = 'catalog-error';report.setAttribute('role','alert');
    report.textContent = 'Il catalogo non può essere caricato: '+message;
    (document.body || document.documentElement).prepend(report);
    throw new Error(message);
  }
  if (!raw || !Array.isArray(raw.records) || !Array.isArray(raw.sections) || !raw.areas) fail('controlla la sintassi di catalog.js.');
  const baseURL = new URL(raw.site.resourceBase || './', scriptURL);
  function url(path) {
    try {const result=new URL(path,baseURL);return ['https:','http:'].includes(result.protocol) || (result.protocol==='file:'&&baseURL.protocol==='file:') ? result.href : null;}catch{return null;}
  }
  const permitted = new Set(['EM','STRONG','B','I','SUB','SUP','BR','CODE','KBD','U','SPAN']);
  function richHTML(value) {
    const container = document.createElement('template');container.innerHTML=String(value||'');
    const clean = document.createElement('div');
    function copy(source,target) {
      source.childNodes.forEach(child=>{
        if(child.nodeType===3){target.append(document.createTextNode(child.textContent));return;}
        if(child.nodeType!==1)return;
        if(['SCRIPT','STYLE','IFRAME','OBJECT'].includes(child.tagName))return;
        if(permitted.has(child.tagName)){const tag=document.createElement(child.tagName.toLowerCase());copy(child,tag);target.append(tag);}else copy(child,target);
      });
    }
    copy(container.content,clean);return {html:clean.innerHTML,text:clean.textContent.replace(/\s+/g,' ').trim()};
  }
  const seen = new Set(),sectionIDs = new Set(raw.sections.map(s=>s.id));
  const records = raw.records.map((item,index)=>{
    const name='scheda '+(index+1);
    if(!item.id || seen.has(item.id))fail(name+': id mancante o duplicato.');seen.add(item.id);
    if(!item.title || !sectionIDs.has(item.section) || !raw.areas[item.area])fail(name+': titolo, sezione o area non validi.');
    if(item.section==='slide' && ![3,4,5].includes(item.year))fail(name+': per le slide indica year: 3, 4 o 5.');
    if(!Array.isArray(item.links)||!item.links.length)fail(name+': manca il collegamento al documento.');
    const description=richHTML(item.description),byline=richHTML(item.byline);
    return {...item,code:item.code||'',meta:item.meta||'',description:description.text,descriptionHtml:description.html,bylineHtml:byline.html,
      links:item.links.map(link=>{const resolved=url(link.url);if(!resolved)fail(name+': collegamento non valido.');return {...link,url:resolved};})};
  });
  const normalize = value=>String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  function search(query) {const terms=normalize(query).split(/\s+/).filter(Boolean);return records.filter(r=>terms.every(t=>normalize([r.title,r.description,r.meta,r.code,raw.areas[r.area]].join(' ')).includes(t)));}
  function bySection(section) {return records.filter(r=>r.section===section);}
  function byArea(area) {return records.filter(r=>r.section==='supporto'&&r.area===area);}
  function classicTarget(item) {
    if(item.section==='slide')return '#'+{3:'slide-terzo',4:'slide-quarto',5:'slide-quinto'}[item.year]+' > .grid';
    return '#'+item.section+' > '+(item.featured?'.grid-feat':'.grid');
  }
  const ministerial = new Map();
  const cfg=raw.ministeriali;
  const api='https://api.github.com/repos/'+cfg.repository+'/contents/'+cfg.directory;
  const archive='https://github.com/'+cfg.repository+'/tree/'+cfg.branch+'/'+cfg.directory;
  const publicDir=cfg.publicDirectory||cfg.directory.split('/').pop();
  function fileURL(year,name){return url(publicDir+'/'+encodeURIComponent(year)+'/'+encodeURIComponent(name));}
  for(const file of cfg.snapshot||[]) {
    const path=file.path.slice(cfg.directory.length+1),parts=path.split('/');
    if(parts.length!==2 || !/^\d{4}-\d{4}$/.test(parts[0]) || !/\.pdf$/i.test(parts[1]))continue;
    const [year,name]=parts;if(!ministerial.has(year))ministerial.set(year,[]);
    ministerial.get(year).push({name,size:file.size,url:fileURL(year,name)});
  }
  const pending = new Map();
  async function fetchList(path) {
    if(pending.has(path))return pending.get(path);
    const request=(async()=>{
      const response=await fetch(api+path+'?ref='+encodeURIComponent(cfg.branch),{headers:{Accept:'application/vnd.github+json'},signal:AbortSignal.timeout(12000)});
      if(!response.ok)throw new Error('HTTP '+response.status);
      const items=await response.json();if(!Array.isArray(items))throw new Error('Elenco non valido');return items;
    })();
    pending.set(path,request);
    try{return await request;}catch(error){pending.delete(path);throw error;}
  }
  async function refreshYears() {
    const items=await fetchList('');
    for(const item of items)if(item.type==='dir'&&/^\d{4}-\d{4}$/.test(item.name)&&!ministerial.has(item.name))ministerial.set(item.name,[]);
    return [...ministerial.keys()].sort().reverse();
  }
  async function refreshYear(year) {
    if(!/^\d{4}-\d{4}$/.test(year))throw new Error('Anno non valido');
    const items=await fetchList('/'+encodeURIComponent(year));
    const files=items.filter(x=>x.type==='file'&&/\.pdf$/i.test(x.name)).map(x=>({name:x.name,size:x.size,url:fileURL(year,x.name)})).sort((a,b)=>a.name.localeCompare(b.name));
    ministerial.set(year,files);return files;
  }
  window.Corso={raw,records,sections:raw.sections,areas:raw.areas,url,search,bySection,byArea,classicTarget,baseURL:baseURL.href,richHTML,
    ministeriali:{map:ministerial,archive,refreshYears,refreshYear}};
})();
