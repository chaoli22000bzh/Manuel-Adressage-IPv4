// Prototype pedagogique Pépette : premiere ligne binaire, octet par octet.
// Moteur IPCalc importe localement, aucun acces reseau.
import { binaryOctets } from './ipv4-engine.js';
const host=document.getElementById('pepette-exercise');
const launch=document.getElementById('launch-training');
if(host&&launch){
 const examples=['10.11.12.13/8','172.16.1.1/16','192.168.1.1/24','10.1.2.3/8','172.16.2.1/16','192.168.0.1/24'];
 const weights=[128,64,32,16,8,4,2,1];
 let example=0,octet=0,bits=Array.from({length:4},()=>Array(8).fill(false)),hint=0,stage='ip',cidrBits=Array(32).fill(false),barPosition=null,barHint=0,barFeedback='',networkBits=Array.from({length:4},()=>Array(8).fill(false)),networkOctet=0,networkHint=0,extraBits={},extraOctet=0,extraHint=0,reviewChecked=[false,false],showCourseHelp=false;
 const el=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n;};
 const button=(label,fn)=>{const b=el('button','pepette-action',label);b.type='button';b.addEventListener('click',fn);return b;};
 function start(){octet=0;hint=0;stage='ip';cidrBits=Array(32).fill(false);barPosition=null;barHint=0;barFeedback='';networkBits=Array.from({length:4},()=>Array(8).fill(false));networkOctet=0;networkHint=0;extraBits={first:Array.from({length:4},()=>Array(8).fill(false)),last:Array.from({length:4},()=>Array(8).fill(false)),broadcast:Array.from({length:4},()=>Array(8).fill(false))};extraOctet=0;extraHint=0;reviewChecked=[false,false];showCourseHelp=false;bits=Array.from({length:4},()=>Array(8).fill(false));host.hidden=false;render();host.scrollIntoView({behavior:'smooth',block:'start'});}
 function render(){
  host.replaceChildren();
  const [ip,cidr]=examples[example].split('/'),octets=ip.split('.').map(Number),expected=binaryOctets(ip);
  const mask=(0xffffffff<<(32-Number(cidr)))>>>0;
  const ipNumber=octets.reduce((n,v)=>((n*256)+v)>>>0,0);
  const networkNumber=(ipNumber&mask)>>>0,broadcastNumber=(networkNumber|(~mask))>>>0;
  const toOctets=n=>[24,16,8,0].map(shift=>(n>>>shift)&255);
  const targets={first:toOctets((networkNumber+1)>>>0),last:toOctets((broadcastNumber-1)>>>0),broadcast:toOctets(broadcastNumber)};
  const kinds=['first','last','broadcast'],labels={first:'1re IP',last:'Dernière IP',broadcast:'Broadcast'};
  const header=el('div','pepette-exercise-header');
  const heading=el('div','pepette-exercise-heading');
  heading.append(el('h3',null,'Tableau en binaire - Avec Pépette'),el('p',null,'Adresse : '+ip+'/'+cidr));
  heading.append(el('p','pepette-progress',stage==='ip'?'Adresse IPv4 - octet '+(octet+1)+' sur 4':stage==='cidr'?'Ligne CIDR - place les bits réseau à 1':stage==='bar'?'Je sépare les bits du réseau et ceux des machines':stage==='network'?'Adresse réseau - octet '+(networkOctet+1)+' sur 4':stage==='first'?'Première IP - octet '+(extraOctet+1)+' sur 4':stage==='last'?'Dernière IP - octet '+(extraOctet+1)+' sur 4':stage==='broadcast'?'Broadcast - octet '+(extraOctet+1)+' sur 4':stage==='review'?'Je contrôle mon travail':'Exercice terminé !'));
  const helpToggle=button(showCourseHelp?'Masquer le coup de patte de Pépette':'Revoir le binaire avec Pépette',()=>{showCourseHelp=!showCourseHelp;render();});
  helpToggle.setAttribute('aria-expanded',String(showCourseHelp));
  header.append(heading,helpToggle);
  host.append(header);
  const courseHelp=el('div','pepette-course-help');
  if(showCourseHelp){
   const original=document.querySelector('#binary-help-panel .binary-help-content');
   if(original){
    const copied=original.cloneNode(true);
    copied.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));
    const originalRows=document.querySelector('#binary-reference-rows');
    const copiedRows=copied.querySelector('.binary-reference tbody');
    if(originalRows&&copiedRows)copiedRows.replaceChildren(...Array.from(originalRows.children).map(row=>row.cloneNode(true)));
    const pepetteIntro=el('div','pepette-course-intro');
    const photo=el('img','pepette-course-photo');
    photo.src='assets/pepette.webp';
    photo.alt='Pépette, la mascotte du manuel';
    photo.loading='lazy';
    pepetteIntro.append(photo,copied);
    courseHelp.append(pepetteIntro);
   }
  }
  if(showCourseHelp)host.append(courseHelp);
  // Un seul tableau : chaque octet contient son en-tête et les lignes successives.
  const table=el('div','pepette-octets pepette-unified-grid');
  octets.forEach((value,i)=>{
   const part=el('section','pepette-octet pepette-unified-octet');
   part.append(el('strong',null,'Octet '+(i+1)+' : '+value));
   const powers=el('div','pepette-bits');
   weights.forEach((w,j)=>{const p=el('span','pepette-power');p.append(document.createTextNode('2'),el('sup',null,String(7-j)));powers.append(p);});
   part.append(powers);
   const vals=el('div','pepette-bits');
   weights.forEach(w=>vals.append(el('span','pepette-weight',String(w))));
   part.append(vals);
   const ipLine=el('div','pepette-unified-line'+(stage==='ip'&&i===octet?' is-active':' is-complete'));
   if(i===0)ipLine.append(el('span','pepette-line-label','IPv4'));
   const ipRow=el('div','pepette-bits');
   weights.forEach((w,j)=>{
    const cell=el('button','pepette-bit'+(bits[i][j]?' is-one':''),bits[i][j]?'1':'');
    cell.type='button';cell.disabled=stage!=='ip'||i!==octet;
    cell.setAttribute('aria-label','IPv4, octet '+(i+1)+', poids '+w+', bit '+(bits[i][j]?'1':'0'));
    cell.setAttribute('aria-pressed',String(bits[i][j]));
    cell.addEventListener('click',()=>{bits[i][j]=!bits[i][j];render();});
    ipRow.append(cell);
   });
   ipLine.append(ipRow);part.append(ipLine);
   if(stage!=='ip'){
    const cidrLine=el('div','pepette-unified-line'+(stage==='cidr'?' is-active':' is-complete'));
    if(i===0)cidrLine.append(el('span','pepette-line-label','CIDR /'+cidr));
    const row=el('div','pepette-bits');
    for(let j=0;j<8;j++){
     const k=i*8+j,cell=el('button','pepette-bit pepette-cidr-bit'+(cidrBits[k]?' is-one':''),cidrBits[k]?'1':'');
     cell.type='button';cell.disabled=stage!=='cidr';cell.dataset.bit=String(k);
     cell.setAttribute('aria-label','Bit CIDR '+(k+1));cell.setAttribute('aria-pressed',String(cidrBits[k]));row.append(cell);
    }
    cidrLine.append(row);
    if(['bar','network','first','last','broadcast','review','finished'].includes(stage)){
     const chosen=barPosition!==null&&Math.floor((barPosition-1)/8)===i;
     if(chosen){
      const bitIndex=(barPosition-1)%8;
      row.children[bitIndex].classList.add('pepette-bar-anchor');
     }
     if(stage==='bar'){
      for(let j=0;j<8;j++){
       const k=i*8+j+1;
       const target=row.children[j];
       target.classList.add('pepette-bar-cell');
       const marker=el('button','pepette-bar-target'+(barPosition===k?' is-selected':''),'');
       marker.type='button';
       marker.setAttribute('aria-label','Placer la barre après le bit '+k);
       marker.title='Après le bit '+k;
       marker.addEventListener('click',()=>{barPosition=k;barFeedback='';render();});
       const wrap=el('span','pepette-bar-slot');
       target.replaceWith(wrap);wrap.append(target,marker);
      }
     }
    }
    part.append(cidrLine);
   }
   if(['network','first','last','broadcast','review','finished'].includes(stage)){
    const networkLine=el('div','pepette-unified-line'+(stage==='network'&&i===networkOctet?' is-active':' is-complete'));
    if(i===0)networkLine.append(el('span','pepette-line-label','Réseau'));
    const networkRow=el('div','pepette-bits');
    weights.forEach((w,j)=>{
     const cell=el('button','pepette-bit'+(networkBits[i][j]?' is-one':''),networkBits[i][j]?'1':'');
     cell.type='button';cell.disabled=stage!=='network'||i!==networkOctet;
     cell.setAttribute('aria-label','Adresse réseau, octet '+(i+1)+', poids '+w);
     cell.setAttribute('aria-pressed',String(networkBits[i][j]));
     cell.addEventListener('click',()=>{networkBits[i][j]=!networkBits[i][j];render();});
     networkRow.append(cell);
    });
    networkLine.append(networkRow);part.append(networkLine);
    if(barPosition!==null&&Math.floor((barPosition-1)/8)===i){
     const bitIndex=(barPosition-1)%8;
     networkRow.children[bitIndex].classList.add('pepette-bar-anchor');
    }
    if(stage==='network'&&i===networkOctet){
     const expectedValue=i<Number(cidr)/8?octets[i]:0;
     const total=weights.reduce((sum,w,j)=>sum+(networkBits[i][j]?w:0),0);
     if(total===expectedValue){
      const next=button(i===3?'Ligne suivante : Première IP':'Octet suivant',()=>{if(i===3){stage='first';extraOctet=0;}else networkOctet++;networkHint=0;render();});
      next.classList.add('pepette-octet-next');part.append(next);
     }
    }
   }
   if(['first','last','broadcast','review','finished'].includes(stage)){
    for(const kind of kinds){
     if(!['review','finished'].includes(stage)&&kinds.indexOf(kind)>kinds.indexOf(stage))break;
     const line=el('div','pepette-unified-line'+(stage===kind&&i===extraOctet?' is-active':' is-complete'));
     if(i===0)line.append(el('span','pepette-line-label',labels[kind]));
     const row=el('div','pepette-bits');
     weights.forEach((w,j)=>{
      const cell=el('button','pepette-bit'+(extraBits[kind][i][j]?' is-one':''),extraBits[kind][i][j]?'1':'');
      cell.type='button';cell.disabled=stage!==kind||i!==extraOctet;
      cell.setAttribute('aria-label',labels[kind]+', octet '+(i+1)+', poids '+w);
      cell.setAttribute('aria-pressed',String(extraBits[kind][i][j]));
      cell.dataset.extraBit=String(j);
      if(stage===kind&&i===extraOctet)cell.addEventListener('click',()=>{if(cell.dataset.dragHandled==='true')return;extraBits[kind][i][j]=!extraBits[kind][i][j];render();});
      row.append(cell);
     });
     if(stage===kind&&i===extraOctet){
      let drag=null;
      const paint=(start,end,value)=>{
       for(let j=Math.min(start,end);j<=Math.max(start,end);j++)extraBits[kind][i][j]=value;
       row.querySelectorAll('[data-extra-bit]').forEach(cell=>{
        const j=Number(cell.dataset.extraBit),on=extraBits[kind][i][j];
        cell.classList.toggle('is-one',on);cell.textContent=on?'1':'';
        cell.setAttribute('aria-pressed',String(on));
       });
      };
      row.addEventListener('pointerdown',e=>{
       const cell=e.target.closest('[data-extra-bit]');
       if(!cell||e.button!==0)return;
       e.preventDefault();
       const start=Number(cell.dataset.extraBit);
       drag={id:e.pointerId,start,last:start,value:!extraBits[kind][i][start],original:extraBits[kind][i].slice()};
       row.setPointerCapture(e.pointerId);
       paint(start,start,drag.value);
      });
      row.addEventListener('pointermove',e=>{
       if(!drag||e.pointerId!==drag.id)return;
       const cell=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-extra-bit]');
       if(!cell||!row.contains(cell))return;
       const end=Number(cell.dataset.extraBit);
       if(end===drag.last)return;
       extraBits[kind][i]=drag.original.slice();
       drag.last=end;paint(drag.start,end,drag.value);
      });
      row.addEventListener('pointerup',e=>{if(drag&&e.pointerId===drag.id){drag=null;render();}});
      row.addEventListener('pointercancel',e=>{if(drag&&e.pointerId===drag.id){extraBits[kind][i]=drag.original;drag=null;render();}});
     }
     line.append(row);part.append(line);
     if(barPosition!==null&&Math.floor((barPosition-1)/8)===i)row.children[(barPosition-1)%8].classList.add('pepette-bar-anchor');
     if(stage===kind&&i===extraOctet){
      const value=weights.reduce((n,w,j)=>n+(extraBits[kind][i][j]?w:0),0);
      if(value===targets[kind][i]){
       const next=button(i===3?(kind==='first'?'Ligne suivante : Dernière IP':kind==='last'?'Ligne suivante : Broadcast':'Contrôler mon tableau'):'Octet suivant',()=>{
        if(i<3)extraOctet++;
        else{stage=kind==='first'?'last':kind==='last'?'broadcast':'review';extraOctet=0;extraHint=0;}
        render();
       });
       next.classList.add('pepette-octet-next');part.append(next);
      }
     }
    }
   }
   if(stage==='ip'&&i===octet){
    const sum=weights.reduce((total,w,j)=>total+(bits[i][j]?w:0),0);
    if(sum===value){
     const next=button(i===3?'Ligne suivante : CIDR':'Octet suivant',()=>{
      if(i===3)stage='cidr';else octet++;
      hint=0;render();
     });
     next.classList.add('pepette-octet-next');
     part.append(next);
    }
   }
   table.append(part);
  });
  host.append(table);
  if(stage!=='ip'){
   const cidrTable=table;
   if(stage==='bar'){
    const guidance=el('div','pepette-bar-guidance');
    guidance.append(el('p',null,'Place la barre CIDR.'));
    guidance.append(el('p',null,'Clique après le dernier 1 bleu.'));
    host.append(guidance);
    if(barPosition!==null)host.append(el('p','pepette-total','Barre placée après le bit '+barPosition+'.'));
    host.append(button('Vérifier la barre',()=>{
     if(barPosition===Number(cidr)){stage='network';networkOctet=0;networkHint=0;barFeedback='';}
     else barFeedback=barPosition===null?'Place d’abord la barre entre deux bits.':'Ce n’est pas encore la bonne séparation. Essaie de nouveau.';
     render();
    }));
    host.append(button('Un indice',()=>{barHint=Math.min(3,barHint+1);render();}));
    if(barFeedback)host.append(el('p','pepette-hint',barFeedback));
    if(barHint){
     const full=Number(cidr)%8===0,oct=Math.floor(Number(cidr)/8),remaining=Number(cidr)%8;
     const msg=barHint===1?'Les cases bleues montrent les bits du réseau.'
      :barHint===2?'Place la barre après la dernière case bleue.'
      :full?'Pour /'+cidr+', clique à droite du dernier 1 de l’octet '+oct+'.'
       :'Pour /'+cidr+', clique après le '+remaining+'e bit de l’octet '+(oct+1)+'.';
     host.append(el('p','pepette-hint',msg));
    }
   }else if(stage==='network'){
    const target=networkOctet<Number(cidr)/8?octets[networkOctet]:0;
    const sum=weights.reduce((n,w,j)=>n+(networkBits[networkOctet][j]?w:0),0);
    host.append(el('p','pepette-total','Total de mes bits à 1 : '+sum+' / '+target));
    if(sum===target)host.append(el('p','pepette-success','Bravo ! Cet octet est correct.'));
    else{
     host.append(el('p','pepette-guidance','Si IPv4 et CIDR ont tous les deux un 1, clique dans la case Réseau. Sinon, laisse 0.'));
     host.append(button('Un indice',()=>{networkHint=Math.min(3,networkHint+1);render();}));
     if(networkHint){
      const values=weights.filter((w,j)=>bits[networkOctet][j]&&cidrBits[networkOctet*8+j]);
      const msg=networkHint===1?'Regarde les deux cases au-dessus : IPv4 et CIDR.'
       :networkHint===2?'Si les deux cases contiennent 1, clique dans la case Réseau juste en dessous. Sinon, ne clique pas.'
       :'Pour cet octet, clique sous : '+(values.length?values.join(' et '):'aucun nombre, laisse les cases vides')+'.';
      host.append(el('p','pepette-hint',msg));
     }
    }
   }else if(kinds.includes(stage)){
    const target=targets[stage][extraOctet],sum=weights.reduce((n,w,j)=>n+(extraBits[stage][extraOctet][j]?w:0),0);
    const instructions={first:'Recopie les bits du réseau. Dans la partie hôte, laisse tous les bits à 0, sauf le dernier bit du quatrième octet : mets-le à 1.',last:'Recopie les bits du réseau. Dans la partie hôte, mets des 1, sauf le dernier bit : laisse 0.',broadcast:'Recopie les bits du réseau. Dans la partie hôte, mets tous les bits à 1.'};
    host.append(el('p','pepette-total','Total de mes bits à 1 : '+sum+' / '+target));
    if(sum===target)host.append(el('p','pepette-success','Bravo ! Cet octet est correct.'));
    else{
     host.append(el('p','pepette-guidance',instructions[stage]));
     host.append(button('Un indice',()=>{extraHint=Math.min(3,extraHint+1);render();}));
     if(extraHint){
      const values=weights.filter(w=>(target&w)!==0);
      host.append(el('p','pepette-hint',extraHint===1?'La barre rouge sépare le réseau et les hôtes.':extraHint===2?instructions[stage]:'Pour cet octet, clique sous : '+(values.length?values.join(' et '):'aucun nombre, laisse les cases vides')+'.'));
     }
    }
   }else if(stage==='review'){
    host.append(el('p','pepette-success','Les six lignes sont remplies. Vérifie ton tableau avec les deux astuces de Pépette.'));
    const tips=[
     ['Astuce n° 1 : Je n’oublie pas les 1 !','Pour la dernière IP adressable, les bits hôtes sont à 1, sauf le dernier à 0. Pour le broadcast, tous les bits hôtes sont à 1.'],
     ['Astuce n° 2 : Je vérifie les deux derniers bits','Réseau : 00. Première IP : 01. Dernière IP : 10. Broadcast : 11.']
    ];
    tips.forEach(([title,detail],i)=>{
     const card=el('div','pepette-review-tip'),photo=el('img','pepette-review-photo');
     photo.src='assets/pepette.webp';photo.alt='Pépette';photo.loading='lazy';
     card.append(photo,el('strong',null,title),el('p',null,detail));
     const label=el('label','pepette-review-check'),check=el('input');
     check.type='checkbox';check.checked=reviewChecked[i];check.addEventListener('change',()=>{reviewChecked[i]=check.checked;render();});
     label.append(check,document.createTextNode(' J’ai vérifié mon tableau avec cette astuce.'));
     card.append(label);host.append(card);
    });
    const validate=button('Valider mon exercice',()=>{stage='finished';render();});
    validate.disabled=!reviewChecked.every(Boolean);host.append(validate);
   }else if(stage==='finished'){
    host.append(el('p','pepette-success','Bravo ! Tu as terminé et vérifié ton tableau en binaire.'));
    host.append(button('Nouvelle adresse',()=>{example=(example+1)%examples.length;start();}));
    host.append(button('Revenir aux choix',()=>{host.hidden=true;document.querySelector('.training-setup')?.scrollIntoView({behavior:'smooth'});}));
   }else if(stage==='cidr'){
    let drag=null;
    const paint=(start,end,value)=>{
     for(let k=Math.min(start,end);k<=Math.max(start,end);k++)cidrBits[k]=value;
     cidrTable.querySelectorAll('.pepette-cidr-bit').forEach(cell=>{const k=Number(cell.dataset.bit);cell.classList.toggle('is-one',cidrBits[k]);cell.textContent=cidrBits[k]?'1':'';cell.setAttribute('aria-pressed',String(cidrBits[k]));});
    };
    cidrTable.addEventListener('pointerdown',e=>{
     const cell=e.target.closest('.pepette-cidr-bit');if(!cell||e.button!==0)return;
     e.preventDefault();const start=Number(cell.dataset.bit);
     drag={id:e.pointerId,start,last:start,value:!cidrBits[start],original:cidrBits.slice()};
     cidrTable.setPointerCapture(e.pointerId);paint(start,start,drag.value);
    });
    cidrTable.addEventListener('pointermove',e=>{
     if(!drag||e.pointerId!==drag.id)return;
     const cell=document.elementFromPoint(e.clientX,e.clientY)?.closest('.pepette-cidr-bit');
     if(!cell||!cidrTable.contains(cell))return;
     const end=Number(cell.dataset.bit);if(end===drag.last)return;
     cidrBits=drag.original.slice();drag.last=end;paint(drag.start,end,drag.value);
    });
    cidrTable.addEventListener('pointerup',e=>{if(drag&&e.pointerId===drag.id){drag=null;render();}});
    cidrTable.addEventListener('pointercancel',e=>{if(drag&&e.pointerId===drag.id){cidrBits=drag.original;drag=null;render();}});
    const count=cidrBits.filter(Boolean).length,correct=cidrBits.every((v,k)=>v===(k<Number(cidr)));
    host.append(el('p','pepette-total','Bits réseau à 1 : '+count+' / '+cidr));
    if(correct){host.append(el('p','pepette-success','Bravo ! Tu as placé les '+cidr+' bits réseau.'));host.append(button('Placer la barre CIDR',()=>{stage='bar';barPosition=null;barHint=0;barFeedback='';render();}));}
    else{
     host.append(el('p','pepette-guidance','Clique sur les cases ou maintiens le clic et glisse pour remplir plusieurs bits. Un second clic retire un 1.'));
     host.append(button('Un indice',()=>{hint=Math.min(hint+1,3);render();}));
     if(hint)host.append(el('p','pepette-hint',hint===1?'Le /'+cidr+' indique le nombre de bits réseau à 1.':hint===2?'Commence à gauche, au premier bit, et avance vers la droite.':'Les '+cidr+' premiers bits sont à 1, les autres restent à 0.'));
    }
   }else{
    host.append(el('p','pepette-success','Bravo ! Tu as terminé ton tableau.'));
    host.append(button('Nouvelle adresse',()=>{example=(example+1)%examples.length;start();}));
    host.append(button('Revenir aux choix',()=>{host.hidden=true;document.querySelector('.training-setup')?.scrollIntoView({behavior:'smooth'});}));
   }
   return;
  }
  const sum=weights.reduce((total,w,j)=>total+(bits[octet][j]?w:0),0);
  const ok=sum===octets[octet];
  host.append(el('p','pepette-total','Total de mes bits à 1 : '+sum+' / '+octets[octet]));
  if(ok){
   host.append(el('p','pepette-success','Bravo ! Tu as trouvé '+octets[octet]+'.'));

  }else{
   host.append(el('p','pepette-guidance','Clique sur les cases pour placer les 1. Les cases vides valent 0.'));
   host.append(button('Un indice',()=>{hint=Math.min(hint+1,3);render();}));
   if(hint){
    const target=octets[octet];
    const remaining=target-sum;
    const available=weights.filter((w,j)=>!bits[octet][j]&&w<=remaining);
    const next=available[0];
    const message=hint===1
     ?(remaining>0?'Tu as deja obtenu '+sum+'. Il te manque '+remaining+' pour atteindre '+target+'.':'Tu as obtenu '+sum+', soit '+(-remaining)+' de trop. Retire un ou plusieurs bits a 1.')
     :hint===2
     ?(remaining>0&&next?'Parmi les colonnes encore vides, cherche une valeur qui ne depasse pas '+remaining+'.':remaining>0?'Il faut revoir les bits selectionnes : aucune colonne vide ne convient pour le moment.':'Regarde les colonnes selectionnees et retire celles qui ne conviennent pas.')
     :'Pour '+target+', la decomposition attendue est : '+(weights.filter((w,j)=>expected[octet][j]==='1').join(' + ')||'aucun bit a 1')+'. Compare-la avec tes cases.';
    host.append(el('p','pepette-hint',message));
   }
  }
 }
 launch.addEventListener('click',()=>{const topic=document.querySelector('[data-training-topic][aria-pressed="true"]')?.dataset.trainingTopic;const level=document.querySelector('[data-training-difficulty][aria-pressed="true"]')?.dataset.trainingDifficulty;if(topic==='binaire'&&level==='1')start();});
}
