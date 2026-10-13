// Prototype pedagogique Pépette : premiere ligne binaire, octet par octet.
// Moteur IPCalc importe localement, aucun acces reseau.
import { binaryOctets } from './ipv4-engine.js';
const host=document.getElementById('pepette-exercise');
const launch=document.getElementById('launch-training');
if(host&&launch){
 const examples=['10.11.12.13/8','172.16.1.1/16','192.168.1.1/24','10.1.2.3/8','172.16.2.1/16','192.168.0.1/24'];
 const weights=[128,64,32,16,8,4,2,1];
 let example=0,octet=0,bits=Array.from({length:4},()=>Array(8).fill(false)),hint=0,done=false,showCourseHelp=false;
 const el=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n;};
 const button=(label,fn)=>{const b=el('button','pepette-action',label);b.type='button';b.addEventListener('click',fn);return b;};
 function start(){octet=0;hint=0;done=false;showCourseHelp=false;bits=Array.from({length:4},()=>Array(8).fill(false));host.hidden=false;render();host.scrollIntoView({behavior:'smooth',block:'start'});}
 function render(){
  host.replaceChildren();
  const [ip,cidr]=examples[example].split('/'),octets=ip.split('.').map(Number),expected=binaryOctets(ip);
  const header=el('div','pepette-exercise-header');
  const heading=el('div','pepette-exercise-heading');
  heading.append(el('h3',null,'Tableau en binaire - Avec Pépette'),el('p',null,'Adresse : '+ip+'/'+cidr));
  heading.append(el('p','pepette-progress',done?'Première ligne terminée !':'Adresse IPv4 - octet '+(octet+1)+' sur 4'));
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
  const table=el('div','pepette-octets');
  octets.forEach((value,i)=>{
   const part=el('section','pepette-octet'+(i===octet&&!done?' is-active':''));
   part.append(el('strong',null,'Octet '+(i+1)+' : '+value));
   const powerRow=el('div','pepette-bits');
   weights.forEach((w,j)=>{const power=el('span','pepette-power');power.append(document.createTextNode('2'));const sup=el('sup',null,String(7-j));power.append(sup);powerRow.append(power);});
   part.append(powerRow);
   const weightRow=el('div','pepette-bits');
   weights.forEach(w=>weightRow.append(el('span','pepette-weight',String(w))));
   part.append(weightRow);
   const row=el('div','pepette-bits');
   weights.forEach((w,j)=>{
    const cell=el('button','pepette-bit'+(bits[i][j]?' is-one':''),bits[i][j]?'1':'');
    cell.type='button';cell.disabled=done||i!==octet;
    cell.setAttribute('aria-label','Octet '+(i+1)+', poids '+w+', bit '+(bits[i][j]?'1':'0'));
    cell.setAttribute('aria-pressed',String(bits[i][j]));
    cell.addEventListener('click',()=>{bits[i][j]=!bits[i][j];render();});
    row.append(cell);
   });
   part.append(row);table.append(part);
  });
  host.append(table);
  if(done){
   host.append(el('p','pepette-success','Bravo ! Tu as converti les quatre octets en binaire.'));
   host.append(button('Nouvelle adresse',()=>{example=(example+1)%examples.length;start();}));
   host.append(button('Revenir aux choix',()=>{host.hidden=true;document.querySelector('.training-setup')?.scrollIntoView({behavior:'smooth'});}));
   return;
  }
  const sum=weights.reduce((total,w,j)=>total+(bits[octet][j]?w:0),0);
  const ok=sum===octets[octet];
  host.append(el('p','pepette-total','Total de mes bits à 1 : '+sum+' / '+octets[octet]));
  if(ok){
   host.append(el('p','pepette-success','Bravo ! Tu as trouvé '+octets[octet]+'.'));
   host.append(button(octet===3?'Terminer la ligne':'Octet suivant',()=>{if(octet===3)done=true;else octet++;hint=0;render();}));
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
