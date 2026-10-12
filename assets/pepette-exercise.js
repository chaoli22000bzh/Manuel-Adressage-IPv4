// Prototype pedagogique Pépette : premiere ligne binaire, octet par octet.
// Moteur IPCalc importe localement, aucun acces reseau.
import { binaryOctets } from './ipv4-engine.js';
const host=document.getElementById('pepette-exercise');
const launch=document.getElementById('launch-training');
if(host&&launch){
 const examples=['192.168.1.1','192.168.0.1'];
 const weights=[128,64,32,16,8,4,2,1];
 let example=0,octet=0,bits=Array.from({length:4},()=>Array(8).fill(false)),hint=0,done=false;
 const el=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n;};
 const button=(label,fn)=>{const b=el('button','pepette-action',label);b.type='button';b.addEventListener('click',fn);return b;};
 function start(){octet=0;hint=0;done=false;bits=Array.from({length:4},()=>Array(8).fill(false));host.hidden=false;render();host.scrollIntoView({behavior:'smooth',block:'start'});}
 function render(){
  host.replaceChildren();
  const ip=examples[example],octets=ip.split('.').map(Number),expected=binaryOctets(ip);
  host.append(el('h3',null,'Tableau en binaire - Avec Pépette'),el('p',null,'Adresse : '+ip+'/24'));
  host.append(el('p','pepette-progress',done?'Première ligne terminée !':'Adresse IPv4 - octet '+(octet+1)+' sur 4'));
  const table=el('div','pepette-octets');
  octets.forEach((value,i)=>{
   const part=el('section','pepette-octet'+(i===octet&&!done?' is-active':''));
   part.append(el('strong',null,'Octet '+(i+1)+' : '+value));
   const weightRow=el('div','pepette-bits');
   weights.forEach(w=>weightRow.append(el('span','pepette-weight',String(w))));
   part.append(weightRow);
   const row=el('div','pepette-bits');
   weights.forEach((w,j)=>{
    const cell=el('button','pepette-bit'+(bits[i][j]?' is-one':''),bits[i][j]?'1':'');
    cell.type='button';cell.disabled=done||i!==octet;
    cell.setAttribute('aria-label','Octet '+(i+1)+', poids '+w+', bit '+(bits[i][j]?'1':'0'));
    cell.setAttribute('aria-pressed',String(bits[i][j]));
    cell.addEventListener('click',()=>{bits[i][j]=!bits[i][j];hint=0;render();});
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
    const message=hint===1?'Commence par la plus grande colonne qui ne depasse pas '+target+'.':hint===2?'Les valeurs selectionnees donnent '+sum+'. Cherche comment atteindre '+target+'.':'Les colonnes a utiliser sont : '+weights.filter(w=>{const idx=weights.indexOf(w);return expected[octet][idx]==='1';}).join(' + ')+'.';
    host.append(el('p','pepette-hint',message));
   }
  }
 }
 launch.addEventListener('click',()=>{const topic=document.querySelector('[data-training-topic][aria-pressed="true"]')?.dataset.trainingTopic;const level=document.querySelector('[data-training-difficulty][aria-pressed="true"]')?.dataset.trainingDifficulty;if(topic==='binaire'&&level==='1')start();});
}
