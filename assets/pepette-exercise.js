// Prototype pedagogique Pépette : premiere ligne binaire, octet par octet.
// Moteur IPCalc importe localement, aucun acces reseau.
import { binaryOctets } from './ipv4-engine.js';
const host=document.getElementById('pepette-exercise');
const launch=document.getElementById('launch-training');
if(host&&launch){
 const examples=['10.11.12.13/8','172.16.1.1/16','192.168.1.1/24','10.1.2.3/8','172.16.2.1/16','192.168.0.1/24'];
 const weights=[128,64,32,16,8,4,2,1];
 let example=0,octet=0,bits=Array.from({length:4},()=>Array(8).fill(false)),hint=0,stage='ip',cidrBits=Array(32).fill(false),barPosition=null,barHint=0,barFeedback='',showCourseHelp=false;
 const el=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n;};
 const button=(label,fn)=>{const b=el('button','pepette-action',label);b.type='button';b.addEventListener('click',fn);return b;};
 function start(){octet=0;hint=0;stage='ip';cidrBits=Array(32).fill(false);barPosition=null;barHint=0;barFeedback='';showCourseHelp=false;bits=Array.from({length:4},()=>Array(8).fill(false));host.hidden=false;render();host.scrollIntoView({behavior:'smooth',block:'start'});}
 function render(){
  host.replaceChildren();
  const [ip,cidr]=examples[example].split('/'),octets=ip.split('.').map(Number),expected=binaryOctets(ip);
  const header=el('div','pepette-exercise-header');
  const heading=el('div','pepette-exercise-heading');
  heading.append(el('h3',null,'Tableau en binaire - Avec Pépette'),el('p',null,'Adresse : '+ip+'/'+cidr));
  heading.append(el('p','pepette-progress',stage==='ip'?'Adresse IPv4 - octet '+(octet+1)+' sur 4':stage==='cidr'?'Ligne CIDR - place les bits réseau à 1':stage==='bar'?'Je sépare les bits du réseau et ceux des machines':'Lignes IPv4, CIDR et barre terminées !'));
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
    if(stage==='bar'||stage==='finished'){
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
     if(barPosition===Number(cidr)){stage='finished';barFeedback='';}
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
    host.append(el('p','pepette-success','Bravo ! Tu as placé la barre CIDR au bon endroit.'));
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
