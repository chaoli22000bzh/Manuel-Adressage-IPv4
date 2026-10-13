// Prototype pedagogique Pépette : premiere ligne binaire, octet par octet.
// Moteur IPCalc importe localement, aucun acces reseau.
import { binaryOctets } from './ipv4-engine.js';
const host=document.getElementById('pepette-exercise');
const launch=document.getElementById('launch-training');
if(host&&launch){
 const examples=['10.11.12.13/8','172.16.1.1/16','192.168.1.1/24','10.1.2.3/8','172.16.2.1/16','192.168.0.1/24'];
 const weights=[128,64,32,16,8,4,2,1];
 let example=0,octet=0,bits=Array.from({length:4},()=>Array(8).fill(false)),hint=0,stage='ip',cidrBits=Array(32).fill(false),barPosition=null,barHint=0,barFeedback='',networkBits=Array.from({length:4},()=>Array(8).fill(false)),networkOctet=0,networkHint=0,extraBits={},extraOctet=0,extraHint=0,reviewShown=[false,false],showCourseHelp=false;
 const el=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n;};
 const button=(label,fn)=>{const b=el('button','pepette-action',label);b.type='button';b.addEventListener('click',fn);return b;};
 function start(){octet=0;hint=0;stage='ip';cidrBits=Array(32).fill(false);barPosition=null;barHint=0;barFeedback='';networkBits=Array.from({length:4},()=>Array(8).fill(false));networkOctet=0;networkHint=0;extraBits={first:Array.from({length:4},()=>Array(8).fill(false)),last:Array.from({length:4},()=>Array(8).fill(false)),broadcast:Array.from({length:4},()=>Array(8).fill(false))};extraOctet=0;extraHint=0;reviewShown=[false,false];showCourseHelp=false;bits=Array.from({length:4},()=>Array(8).fill(false));host.hidden=false;render();host.scrollIntoView({behavior:'smooth',block:'start'});}
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
  heading.append(el('p','pepette-progress',stage==='ip'?'Adresse IPv4 - octet '+(octet+1)+' sur 4':stage==='cidr'?'Ligne CIDR /'+cidr:stage==='bar'?'Je sépare les bits du réseau et ceux des machines':stage==='network'?'Adresse réseau - octet '+(networkOctet+1)+' sur 4':stage==='first'?'Première IP - octet '+(extraOctet+1)+' sur 4':stage==='last'?'Dernière IP - octet '+(extraOctet+1)+' sur 4':stage==='broadcast'?'Broadcast - octet '+(extraOctet+1)+' sur 4':stage==='review'?'Je contrôle mon travail':'Exercice terminé !'));
  // Consigne stable, visible avant le tableau a chaque octet.
  const instructions={
   ip:['Complète la ligne IPv4.','Transforme l’octet '+(octet+1)+' ('+octets[octet]+') en binaire.'],
   cidr:['Complète la ligne CIDR /'+cidr+'.','Place les '+cidr+' premiers bits à 1, en partant de la gauche.'],
   bar:['Place la barre CIDR.','Clique juste après le dernier 1 de la ligne CIDR.'],
   network:['Complète la ligne Réseau.','Compare IPv4 et CIDR : si les deux bits sont à 1, clique dans la case Réseau en dessous. Sinon, laisse 0.'],
   first:['Complète la ligne Première IP adressable.','Garde les bits du réseau. Dans la partie hôte, laisse des 0, sauf le dernier bit du quatrième octet : mets 1.'],
   last:['Complète la ligne Dernière IP adressable.','Garde les bits du réseau. Dans la partie hôte, mets des 1, sauf le dernier bit du quatrième octet : laisse 0.'],
   broadcast:['Complète la ligne Broadcast.','Garde les bits du réseau. Dans la partie hôte, mets tous les bits à 1.'],
   review:['Vérifie ton tableau.','Utilise les deux astuces de Pépette avant de valider.'],
   finished:['Exercice terminé !','']
  };
  const instruction=el('div','pepette-step-instruction');
  instruction.append(el('strong',null,instructions[stage][0]));
  instructions[stage][1].split(/(?<=\.)\s+/).filter(Boolean).forEach(sentence=>instruction.append(el('p',null,sentence)));
  heading.append(instruction);
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
   const ipLine=el('div','pepette-unified-line'+(stage==='ip'?(i===octet?' is-active':' is-current-row'):' is-complete'));
   if(i===0)ipLine.append(el('span','pepette-line-label'+(stage==='ip'?' is-current-label':''),'IPv4'));
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
    const cidrLine=el('div','pepette-unified-line'+(stage==='cidr'?(i===0?' is-active':' is-current-row'):' is-complete'));
    if(i===0)cidrLine.append(el('span','pepette-line-label'+(stage==='cidr'||stage==='bar'?' is-current-label':''),'CIDR /'+cidr));
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
    const networkLine=el('div','pepette-unified-line'+(stage==='network'?(i===networkOctet?' is-active':' is-current-row'):' is-complete'));
    if(i===0)networkLine.append(el('span','pepette-line-label'+(stage==='network'?' is-current-label':''),'Réseau'));
    const networkRow=el('div','pepette-bits');
    weights.forEach((w,j)=>{
     const cell=el('button','pepette-bit'+(networkBits[i][j]?' is-one':''),networkBits[i][j]?'1':'');
     cell.type='button';cell.disabled=stage!=='network'||i!==networkOctet;
     cell.setAttribute('aria-label','Adresse réseau, octet '+(i+1)+', poids '+w);
     cell.setAttribute('aria-pressed',String(networkBits[i][j]));
     cell.addEventListener('click',()=>{networkBits[i][j]=!networkBits[i][j];render();});
     if(stage==='review'&&reviewShown[1]&&i===3&&j>=6)cell.classList.add('pepette-review-two');
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
     const line=el('div','pepette-unified-line'+(stage===kind?(i===extraOctet?' is-active':' is-current-row'):' is-complete'));
     if(i===0)line.append(el('span','pepette-line-label'+(stage===kind?' is-current-label':''),labels[kind]));
     const row=el('div','pepette-bits');
     weights.forEach((w,j)=>{
      const cell=el('button','pepette-bit'+(extraBits[kind][i][j]?' is-one':''),extraBits[kind][i][j]?'1':'');
      cell.type='button';cell.disabled=stage!==kind||i!==extraOctet;
      cell.setAttribute('aria-label',labels[kind]+', octet '+(i+1)+', poids '+w);
      cell.setAttribute('aria-pressed',String(extraBits[kind][i][j]));
      cell.dataset.extraBit=String(j);
      if(stage===kind&&i===extraOctet)cell.addEventListener('click',()=>{if(cell.dataset.dragHandled==='true')return;extraBits[kind][i][j]=!extraBits[kind][i][j];render();});
      if(stage==='review'&&reviewShown[0]&&(kind==='last'||kind==='broadcast')&&i*8+j>=Number(cidr))cell.classList.add('pepette-review-one');
      if(stage==='review'&&reviewShown[1]&&i===3&&j>=6)cell.classList.add('pepette-review-two');
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
    if(sum===target)host.append(el('p','pepette-success','Bravo ! Cet octet est correct.'));
    else{
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
    if(sum===target)host.append(el('p','pepette-success','Bravo ! Cet octet est correct.'));
    else{
     host.append(button('Un indice',()=>{extraHint=Math.min(3,extraHint+1);render();}));
     if(extraHint){
      const values=weights.filter(w=>(target&w)!==0);
      host.append(el('p','pepette-hint',extraHint===1?'La barre rouge sépare le réseau et les hôtes.':extraHint===2?instructions[stage]:'Pour cet octet, clique sous : '+(values.length?values.join(' et '):'aucun nombre, laisse les cases vides')+'.'));
     }
    }
   }else if(stage==='review'){
    host.append(el('p','pepette-success','Les six lignes sont remplies. Vérifie ton tableau avec les deux astuces de Pépette.'));
    const tips=[
     ['Astuce n° 1 : Je n’oublie pas les 1 !','Observe les bits hôtes, après le CIDR, sur les lignes Dernière IP et Broadcast.','Astuce 1'],
     ['Astuce n° 2 : Je vérifie les deux derniers bits','Compare les deux dernières cases du quatrième octet : Réseau 00, Première IP 01, Dernière IP 10, Broadcast 11.','Astuce 2']
    ];
    const tipsGrid=el('div','pepette-review-grid');
    tips.forEach(([title,detail,name],i)=>{
     const card=el('div','pepette-review-tip'),photo=el('img','pepette-review-photo');
     photo.src='assets/pepette.webp';photo.alt='Pépette';photo.loading='lazy';
     card.append(photo,el('strong',null,title),el('p',null,detail));
     const toggle=button((reviewShown[i]?'Masquer ':'Afficher ')+name,()=>{reviewShown[i]=!reviewShown[i];render();});
     toggle.setAttribute('aria-pressed',String(reviewShown[i]));
     card.append(toggle);tipsGrid.append(card);
    });
    host.append(tipsGrid);
    host.append(el('p','pepette-hint','Les couleurs montrent les cases à vérifier directement dans ton tableau.'));
    host.append(button('Valider mon exercice',()=>{stage='finished';render();}));
   }else if(stage==='finished'){
    host.append(el('p','pepette-success','Bravo ! Tu as terminé et vérifié ton tableau en binaire.'));
    host.append(button('Nouvelle adresse',()=>{example=(example+1)%examples.length;start();}));
    host.append(button('Nouveau test',()=>{host.hidden=true;document.querySelector('.training-setup')?.scrollIntoView({behavior:'smooth'});}));
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

 // Niveau 3 : travail autonome, tableau entier et correction finale non modifiable.
 const challengePrefixes=[2,3,4,5,6,11,12,13,14,19,20,21,22,27,28,29,30];
 let challengeAddress='',challengeBits={},challengeBar=null,challengeLocked=false,challengeResult=null;
 const challengeRows=['ip','cidr','network','first','last','broadcast'];
 const challengeNames={ip:'IPv4',cidr:'CIDR',network:'Réseau',first:'1re IP',last:'Dernière IP',broadcast:'Broadcast'};
 const challengeEmpty=()=>Array(32).fill(false);
 function newChallenge(){
  const count=n=>n.toString(2).split('1').length-1;
  const pools=[[],[],[],[]];
  for(let v=1;v<=255;v++){
   if(count(v)<4||count(v)>7)continue;
   if(v<=223)pools[0].push(v);
   for(let j=1;j<4;j++)pools[j].push(v);
  }
  let octs;
  do{octs=pools.map(p=>p[Math.floor(Math.random()*p.length)]);}while(new Set(octs).size!==4||octs[0]>=224);
  const prefix=challengePrefixes[Math.floor(Math.random()*challengePrefixes.length)];
  challengeAddress=octs.join('.')+'/'+prefix;
  challengeBits=Object.fromEntries(challengeRows.map(k=>[k,challengeEmpty()]));
  challengeBar=null;challengeLocked=false;challengeResult=null;
  stage='challenge';host.hidden=false;renderChallenge();
  host.scrollIntoView({behavior:'smooth',block:'start'});
 }
 function challengeExpected(){
  const [ip,p]=challengeAddress.split('/'),prefix=Number(p),octs=ip.split('.').map(Number);
  const address=octs.reduce((n,v)=>((n*256)+v)>>>0,0);
  const mask=(0xffffffff<<(32-prefix))>>>0;
  const network=(address&mask)>>>0,broadcast=(network|(~mask))>>>0;
  const bits=n=>Array.from({length:32},(_,i)=>Boolean((n>>>(31-i))&1));
  return {ip:bits(address),cidr:bits(mask),network:bits(network),first:bits((network+1)>>>0),last:bits((broadcast-1)>>>0),broadcast:bits(broadcast)};
 }
 function renderChallenge(){
  host.replaceChildren();
  const [ip,prefixText]=challengeAddress.split('/'),prefix=Number(prefixText),octs=ip.split('.').map(Number),expected=challengeExpected();
  const header=el('div','pepette-exercise-header'),heading=el('div','pepette-exercise-heading');
  heading.append(el('h3',null,'Tableau en binaire - Je relève le défi'),el('p',null,'Adresse : '+challengeAddress));
  const instruction=el('div','pepette-step-instruction');
  instruction.append(el('strong',null,challengeLocked?'Correction de ton tableau.':'Complète les six lignes du tableau.'));
  instruction.append(el('p',null,challengeLocked?'Tes réponses sont figées. Les erreurs sont indiquées en rouge.':'Tu peux travailler dans l’ordre que tu veux. Une case vide représente un bit à 0.'));
  instruction.append(el('p',null,challengeLocked?'':'Place aussi la barre CIDR. Vérifie tout ton travail à la fin.'));
  heading.append(instruction);header.append(heading);host.append(header);
  const table=el('div','pepette-octets pepette-unified-grid pepette-challenge-grid');
  for(let i=0;i<4;i++){
   const part=el('section','pepette-octet pepette-unified-octet');
   part.append(el('strong',null,'Octet '+(i+1)+' : '+octs[i]));
   const powers=el('div','pepette-bits');weights.forEach((w,j)=>{const p=el('span','pepette-power');p.append(document.createTextNode('2'),el('sup',null,String(7-j)));powers.append(p);});part.append(powers);
   const vals=el('div','pepette-bits');weights.forEach(w=>vals.append(el('span','pepette-weight',String(w))));part.append(vals);
   for(const kind of challengeRows){
    const line=el('div','pepette-unified-line is-current-row');
    if(i===0)line.append(el('span','pepette-line-label',challengeNames[kind]+(kind==='cidr'?' /'+prefix:'')));
    const row=el('div','pepette-bits');
    for(let j=0;j<8;j++){
     const index=i*8+j,on=challengeBits[kind][index],correct=expected[kind][index];
     const cell=el('button','pepette-bit'+(on?' is-one':''),on?'1':'');
     cell.type='button';cell.disabled=challengeLocked;
     cell.setAttribute('aria-label',challengeNames[kind]+', octet '+(i+1)+', bit '+(j+1)+', '+(on?'1':'0'));
     cell.setAttribute('aria-pressed',String(on));
     if(challengeLocked&&on!==correct){cell.classList.add('challenge-error');cell.textContent=on?'1':'0';cell.setAttribute('aria-label',challengeNames[kind]+', bit '+(index+1)+', réponse '+(on?'1':'0')+', attendu '+(correct?'1':'0'));}
     if(challengeLocked&&on===correct)cell.classList.add('challenge-correct');
     cell.dataset.challengeRow=kind;cell.dataset.challengeIndex=String(index);
     if(!challengeLocked)cell.addEventListener('click',e=>{if(e.detail!==0)return;challengeBits[kind][index]=!challengeBits[kind][index];renderChallenge();});
     if(challengeBar!==null&&challengeBar===index+1&&kind!=='ip')cell.classList.add('pepette-bar-anchor');
     row.append(cell);
    }
    line.append(row);part.append(line);
   }
   table.append(part);
  }
  host.append(table);
  if(!challengeLocked){
   // Peinture au passage : horizontal entre octets et vertical entre lignes.
   let drag=null;
   const cellAt=(x,y)=>document.elementFromPoint(x,y)?.closest('[data-challenge-row][data-challenge-index]');
   const mark=(cell)=>{
    if(!drag||!cell||!table.contains(cell))return;
    const kind=cell.dataset.challengeRow,index=Number(cell.dataset.challengeIndex);
    if(!challengeRows.includes(kind)||!Number.isInteger(index)||index<0||index>31)return;
    const key=kind+':'+index;
    if(drag.visited.has(key))return;
    drag.visited.add(key);
    challengeBits[kind][index]=drag.value;
    cell.classList.toggle('is-one',drag.value);
    cell.textContent=drag.value?'1':'';
    cell.setAttribute('aria-pressed',String(drag.value));
   };
   const trace=(x1,y1,x2,y2)=>{
    const steps=Math.max(1,Math.ceil(Math.hypot(x2-x1,y2-y1)/5));
    for(let n=0;n<=steps;n++){
     const t=n/steps;
     mark(cellAt(x1+(x2-x1)*t,y1+(y2-y1)*t));
    }
   };
   table.addEventListener('pointerdown',e=>{
    const cell=e.target.closest('[data-challenge-row][data-challenge-index]');
    if(!cell||e.button!==0)return;
    e.preventDefault();
    const kind=cell.dataset.challengeRow,index=Number(cell.dataset.challengeIndex);
    drag={id:e.pointerId,value:!challengeBits[kind][index],visited:new Set(),x:e.clientX,y:e.clientY};
    table.setPointerCapture(e.pointerId);
    mark(cell);
   });
   table.addEventListener('pointermove',e=>{
    if(!drag||e.pointerId!==drag.id)return;
    trace(drag.x,drag.y,e.clientX,e.clientY);
    drag.x=e.clientX;drag.y=e.clientY;
   });
   table.addEventListener('pointerup',e=>{
    if(!drag||e.pointerId!==drag.id)return;
    trace(drag.x,drag.y,e.clientX,e.clientY);
    drag=null;renderChallenge();
   });
   table.addEventListener('pointercancel',e=>{
    if(!drag||e.pointerId!==drag.id)return;
    drag=null;renderChallenge();
   });
   const bar=el('div','pepette-challenge-bar');
   bar.append(el('strong',null,'Barre CIDR : '+(challengeBar===null?'non placée':'après le bit '+challengeBar)));
   bar.append(el('p',null,'Place la barre CIDR : clique sur le numéro du bit situé juste à gauche de la barre.'));
   const choices=el('div','pepette-challenge-positions');
   for(let n=1;n<=32;n++){
    const b=button(String(n),()=>{challengeBar=n;renderChallenge();});
    if(challengeBar===n)b.classList.add('is-selected');
    b.setAttribute('aria-pressed',String(challengeBar===n));
    choices.append(b);
   }
   bar.append(choices);host.append(bar);
   const verify=button('Vérifier mon tableau',()=>{
    const missing=challengeBar===null;
    if(missing){host.querySelector('.pepette-challenge-bar')?.scrollIntoView({behavior:'smooth',block:'center'});return;}
    const errors=challengeRows.reduce((n,k)=>n+challengeBits[k].filter((v,i)=>v!==expected[k][i]).length,0);
    challengeResult={errors,barCorrect:challengeBar===prefix};
    challengeLocked=true;renderChallenge();
   });
   host.append(verify);
  }else{
   const message=challengeResult.errors===0&&challengeResult.barCorrect?'Bravo ! Ton tableau est entièrement correct.':'Résultat : '+challengeResult.errors+' bit(s) incorrect(s). '+(challengeResult.barCorrect?'Barre CIDR correcte.':'Barre CIDR incorrecte : position attendue '+prefix+'.');
   host.append(el('p',challengeResult.errors===0&&challengeResult.barCorrect?'pepette-success':'pepette-hint',message));

   host.append(button('Nouvelle adresse',newChallenge));
   host.append(button('Nouveau test',()=>{host.hidden=true;document.querySelector('.training-setup')?.scrollIntoView({behavior:'smooth'});}));
  }
 }

 launch.addEventListener('click',()=>{const topic=document.querySelector('[data-training-topic][aria-pressed="true"]')?.dataset.trainingTopic;const level=document.querySelector('[data-training-difficulty][aria-pressed="true"]')?.dataset.trainingDifficulty;if(topic==='binaire'&&level==='1')start();else if(topic==='binaire'&&level==='3')newChallenge();});
}
