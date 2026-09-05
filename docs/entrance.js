'use strict';
if(window.Corso){
  document.getElementById('record-count').textContent=Corso.records.length+' schede nel catalogo condiviso';
  const hash=location.hash.slice(1);
  if([...Corso.sections.map(s=>s.id),'ministeriali','licenza','slide-terzo','slide-quarto','slide-quinto'].includes(hash))location.replace('classico.html#'+hash);
}
