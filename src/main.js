import { createGame } from './core/state.js';
import { step } from './core/engine.js';
import { commitRoutes, findPath } from './core/routing.js';
import { upgrade } from './core/economy.js';
import { research, cast, validTargets } from './core/spells.js';
import { totals } from './core/selectors.js';
import { RULES } from './content/balance.js';
import { FACTIONS } from './content/factions.js';
import { SPELLS } from './content/spells.js';
import { ASSETS, asset, saveAsset } from './ui/assets.js';
import { button, icon, escape, fmt, clock } from './ui/components.js';
import { renderInto } from './ui/dom.js';
import { dissolveCard } from './ui/feedback.js';
import { setupView, botOptions } from './ui/setup.js';
import { battlefieldView, terrain } from './ui/battlefield.js';
import { shell, hud, nodePanel, rivals, spellCards, dispatches, upgrades } from './ui/panels.js';

let config = { mode: 'conquest', faction: 'elves', bots: [{ faction: 'dwarves', difficulty: 'normal' }], nodesPerPlayer: 12, seed: 'Alderwatch' };
let g, paused = true, started = false, resultShown = false, toastTimer;
const ui = { selected: new Set(), drafts: {}, focus: null, spell: null, targets: [], preview: null, inspecting: false, routeMode: false, zoom: 1, cx: 0, cy: 0, context: null, terrain: '' };
const $ = selector => document.querySelector(selector);
const modal = $('#modal');
function toast(text) { $('#toast').textContent = text; $('#toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 3000); }
function initialize() {
  g = createGame(config); paused = true; resultShown = false;
  Object.assign(ui, { selected: new Set(), drafts: {}, focus: g.nodes.find(n => n.owner === 0).id, spell: null, targets: [], zoom: 1, cx: g.width / 2, cy: g.height / 2, context: null, terrain: terrain(g) });
  $('#app').innerHTML = shell(g);
  // On a narrow viewport, start near the player's keep at a readable scale.
  const mapWidth = $('#map-wrap').getBoundingClientRect().width;
  if (mapWidth < 800) {
    ui.zoom = Math.min(6, Math.max(1, g.width * .8 / mapWidth));
    ui.cx = Math.max(g.width / ui.zoom / 2, g.nodes[ui.focus].x);
    ui.cy = g.nodes[ui.focus].y;
  }
  refresh();
}
function showSetup() { paused = true; modal.hidden = false; $('#app').inert = true; modal.innerHTML = setupView(config); $('#setup-form input:checked')?.focus(); }
function readSetup() {
  const f = new FormData($('#setup-form'));
  return { mode: f.get('mode'), faction: f.get('faction'), bots: Array.from({length:Number(f.get('botCount'))}, (_,i)=>({faction:f.get(`botFaction${i}`)||'random',difficulty:f.get(`botDifficulty${i}`)||'normal'})), nodesPerPlayer: Number(f.get('nodes')), seed: String(f.get('seed')).trim() || 'Alderwatch' };
}
function closeModal() { $('#app').inert = false; modal.hidden = true; modal.innerHTML = ''; ui.preview = null; }
function dialog(title, body, cls = '') { paused = true; modal.hidden = false; $('#app').inert = true; modal.innerHTML = `<section class="dialog ${cls}" role="dialog" aria-modal="true" aria-label="${escape(title)}"><header><h2>${title}</h2><button data-action="close-modal" aria-label="Close dialog" data-ui="dialog.close">×</button></header>${body}</section>`; modal.querySelector('button')?.focus(); }
function deselect(id) {
  if (!ui.selected.has(id)) return;
  commitRoutes(g, id, ui.drafts[id] || [], 0); ui.selected.delete(id); delete ui.drafts[id];
}
function commitAll() { [...ui.selected].forEach(deselect); ui.context = null; }
function selectNode(id, shift) {
  if (ui.selected.has(id)) { deselect(id); return; }
  if (!shift) commitAll();
  ui.selected.add(id); ui.drafts[id] = [...g.nodes[id].routes];
}
function toggleRecipient(id, clear) {
  if (!ui.selected.size) return;
  let valid = false;
  for (const from of ui.selected) {
    if (clear) { ui.drafts[from] = []; valid = true; continue; }
    if (!findPath(g, from, id, 0)) continue;
    const routes = ui.drafts[from]; ui.drafts[from] = routes.includes(id) ? routes.filter(n=>n!==id) : [...routes,id]; valid=true;
  }
  if (!valid) toast('Reach this node through your own territory first.');
}
function targetNode(id, right, shift) {
  const n=g.nodes[id], s=SPELLS[ui.spell];
  if (shift || n.owner===null || (n.owner===0 ? right : !right)) return;
  if (ui.targets.includes(id)) { ui.targets=ui.targets.filter(i=>i!==id);return; }
  if (['own','twoOwn','allOwn'].includes(s.target)&&n.owner!==0 || s.target==='enemy'&&n.owner===0 || s.target==='none') return;
  if (s.target==='mixed') ui.targets=ui.targets.filter(i=>(g.nodes[i].owner===0)!==(n.owner===0));
  ui.targets.push(id);
  const limit=['twoOwn','twoAny','mixed'].includes(s.target)?2:s.target==='allOwn'?Infinity:1;
  if(ui.targets.length>limit) ui.targets.shift();
}
function nodeClick(e, id, right=false) {
  if (ui.spell) { targetNode(id,right,e.shiftKey);refresh();return; }
  const n=g.nodes[id];
  if (right && ui.selected.size && !ui.selected.has(id) || !right && ui.routeMode && ui.selected.size && !ui.selected.has(id)) toggleRecipient(id,e.shiftKey);
  else if (right && n.owner===0) {
    ui.focus=id; const rect=$('#map-wrap').getBoundingClientRect();
    ui.context={id,x:Math.max(0,Math.min(e.clientX-rect.left+10,rect.width-260)),y:Math.max(0,Math.min(e.clientY-rect.top,rect.height-230))};
  } else if (!right) { ui.focus=id;ui.context=null;if(n.owner===0)selectNode(id,e.shiftKey); }
  refresh();
}
function refresh() {
  for (const id of [...ui.selected]) if(g.nodes[id].owner!==0){ui.selected.delete(id);delete ui.drafts[id];}
  renderInto($('#hud-stats'),hud(g)); $('#game-clock').textContent=clock(g.time);
  const pause=$('[data-action="pause"]'); if(pause)pause.innerHTML=icon('pause')+(paused?'Resume':'Pause');
  renderInto($('#node-panel'),nodePanel(g,ui)); renderInto($('#rivals'),rivals(g)); renderInto($('#spell-cards'),spellCards(g)); renderInto($('#dispatches'),dispatches(g));
  const svg=$('#battlefield'); svg.setAttribute('viewBox',`${ui.cx-g.width/ui.zoom/2} ${ui.cy-g.height/ui.zoom/2} ${g.width/ui.zoom} ${g.height/ui.zoom}`);
  // Parse SVG through an SVG wrapper to retain the correct namespace.
  const wrapper=document.createElement('div');renderInto(wrapper,`<svg xmlns="http://www.w3.org/2000/svg">${battlefieldView(g,ui)}</svg>`);
  renderSvg(svg,wrapper.firstChild);
  $('#pause-banner').hidden=!paused||!started||!modal.hidden;
  if(ui.spell) {
    const s=SPELLS[ui.spell];
    renderInto($('#map-instructions'),`<strong>${s.name}</strong><span>${targetInstruction(s.target)}</span>${button('cast',{disabled:!validTargets(g,0,s.id,ui.targets)})}<button data-action="cancel-spell" data-ui="magic.cancel">Cancel</button>`);
  } else renderInto($('#map-instructions'),`<span><strong>Left click</strong> select</span><span>·</span><span><strong>Shift + click</strong> multi-select</span><span>·</span><span><strong>Right click</strong> route / upgrade</span><span>·</span><span><strong>Enter</strong> commit</span>`);
  const menu=$('#context-menu');menu.hidden=!ui.context;
  if(ui.context){const n=g.nodes[ui.context.id];if(n.owner!==0){ui.context=null;menu.hidden=true;}else{menu.style.left=ui.context.x+'px';menu.style.top=ui.context.y+'px';renderInto(menu,`<div class="section-label">${escape(n.name)}</div>${upgrades(g,n)}`);}}
}
// SVG updates preserve focus and pointer targets just like the HTML reconciler.
function renderSvg(old,fresh){
  for(let i=0;i<fresh.childNodes.length;i++){const n=fresh.childNodes[i],o=old.childNodes[i];if(!o){old.append(n.cloneNode(true));continue;}if(n.nodeName!==o.nodeName){o.replaceWith(n.cloneNode(true));continue;}if(n.nodeType===3){if(o.textContent!==n.textContent)o.textContent=n.textContent;continue;}if(n.nodeType!==1)continue;for(const a of [...o.attributes])if(!n.hasAttribute(a.name))o.removeAttribute(a.name);for(const a of n.attributes)if(o.getAttribute(a.name)!==a.value)o.setAttribute(a.name,a.value);renderSvg(o,n);}while(old.childNodes.length>fresh.childNodes.length)old.lastChild.remove();
}
function targetInstruction(type){return {own:'Left-click a friendly node.',enemy:'Right-click an enemy node.',twoOwn:'Left-click source, then destination.',twoAny:'Choose two occupied nodes: left for yours, right for enemies.',mixed:'Left-click your source; right-click an enemy.',allOwn:'All your nodes selected; left-click to exclude.',none:'Confirm to cast.'}[type];}
function help(){dialog('The field guide',`<p>Grow your economy, raise an army, and send it across the frontier. Your rivals have the same resources and rules.</p><h3>Orders without the clutter</h3><ul><li>Left-click your node to select it. Hold Shift to select more.</li><li>Right-click destinations to toggle routes. Red rings show recipients shared by all selected sources.</li><li>Click empty land, deselect the source, or press Enter to commit. All stationed troops leave immediately; future production follows.</li><li>While editing orders, existing routes keep running. Shift-right-click a recipient clears the drafts.</li><li>Right-click a selected friendly node to open upgrades, or use the permanent command panel.</li><li>On touch devices, select a source, enable tap-to-route, tap destinations, then Commit orders.</li></ul><h3>Gold, steel & spellcraft</h3><p>Gold is earned in independent node cycles. Army power absorbs attacks before walls. Surplus attackers capture a node and inherit its upgrades. Damage stops regeneration and pauses research for five seconds; a troop already being trained still finishes.</p><p>Upgrade barracks to research your faction’s spells. Click a ready card, review it, choose targets, then confirm the cast. Vacant nodes are never spell targets. A barracks can handle one research job at a time.</p><h3>Field controls</h3><p>Space: pause/resume · Enter: commit routes · Escape: cancel spell or commit/deselect · F2: element references. Zoom with +/−/Fit; drag empty land to pan when zoomed.</p><p>Dialogs pause battle. Use Resume when you are ready. WIP balance values are provisional. Refer to <a href="./docs/IMPLEMENTATION_PLAN.md" target="_blank">the implementation plan</a> for decisions.</p>`);}
function artWorkshop(){dialog('Art workshop',`<p>Upload PNG, WebP, JPEG or SVG artwork to replace any sprite. Changes are stored in this browser. For permanent project artwork, replace the matching file in <code>assets/</code> or edit <code>src/ui/assets.js</code>.</p><div class="asset-grid">${Object.keys(ASSETS).map(id=>`<div class="asset-slot">${icon(id)}<strong>${id}</strong><label>Upload image<input type="file" accept="image/png,image/webp,image/jpeg,image/svg+xml" data-asset="${id}" data-ui="art.upload.${id}"></label><button data-action="reset-art:${id}" data-ui="art.reset.${id}">Reset</button></div>`).join('')}</div>`);}
function toggleInspect(){ui.inspecting=!ui.inspecting;document.body.classList.toggle('inspecting',ui.inspecting);$('#reference').hidden=!ui.inspecting;$('#reference').textContent='F2 references · Hover an element, then click to copy its ID.';toast(ui.inspecting?'Reference mode on. Click an element to copy its ID.':'Reference mode off.');}
function action(value){
  const [a,id,key]=value.split(':');
  switch(a){
    case 'start':config=readSetup();closeModal();initialize();started=true;paused=false;toast('Your banner is raised. The frontier awaits.');break;
    case 'pause':paused=!paused;break;
    case 'new':showSetup();break;
    case 'close-modal':closeModal();break;
    case 'routes':commitAll();toast('Orders committed.');break;
    case 'clear':for(const n of ui.selected)ui.drafts[n]=[];break;
    case 'route-mode':ui.routeMode=!ui.routeMode;break;
    case 'upgrade':if(!upgrade(g,Number(id),key,0))toast('This upgrade is unavailable.');break;
    case 'research':if(research(g,0,id))toast(`${SPELLS[id].name} research started.`);else toast('An eligible free barracks and enough gold are required.');break;
    case 'preview':ui.preview=id;{const s=SPELLS[id];modal.hidden=false;$('#app').inert=true;modal.innerHTML=`<section class="dialog spell-preview" role="dialog" aria-modal="true" aria-label="${s.name}"><header><span class="eyebrow">TIER ${s.tier} · ${FACTIONS[s.faction].name.toUpperCase()}</span><button data-action="close-modal" aria-label="Close spell">×</button></header>${icon(s.icon)}<h2>${s.name}</h2><p>${s.description}</p><small>The battle continues while you prepare your spell.</small><button class="primary" data-action="arm:${id}" data-ui="magic.choose-targets">${s.target==='none'?'Cast spell':'Choose targets'}</button></section>`;}break;
    case 'arm':closeModal();commitAll();ui.spell=id;ui.targets=SPELLS[id].target==='allOwn'?g.nodes.filter(n=>n.owner===0).map(n=>n.id):[];if(SPELLS[id].target==='none')action('cast');break;
    case 'cast':if(cast(g,0,ui.spell,ui.targets)){dissolveCard(ui.spell);toast(`${SPELLS[ui.spell].name} cast.`);ui.spell=null;ui.targets=[];}else toast('Choose valid targets first.');break;
    case 'cancel-spell':ui.spell=null;ui.targets=[];break;
    case 'help':help();break;
    case 'art':artWorkshop();break;
    case 'inspect':toggleInspect();break;
    case 'reset-art':try{saveAsset(id,null);ui.terrain=terrain(g);artWorkshop();}catch{toast('Browser storage is unavailable.');}break;
    case 'zoom-in':ui.zoom=Math.min(6,ui.zoom*1.3);break;
    case 'zoom-out':ui.zoom=Math.max(1,ui.zoom/1.3);break;
    case 'zoom-reset':ui.zoom=1;ui.cx=g.width/2;ui.cy=g.height/2;break;
    case 'rematch':closeModal();initialize();started=true;paused=false;break;
  }
  refresh();
}
document.addEventListener('click',e=>{
  if(ui.inspecting && e.target.closest('[data-action]')?.dataset.action !== 'inspect'){const target=e.target.closest('[data-ui]');if(target){e.preventDefault();e.stopPropagation();const ref=target.dataset.ui;navigator.clipboard?.writeText(ref).then(()=>toast(`Copied ${ref}`)).catch(()=>toast(ref));$('#reference').textContent=ref;}return;}
  const control=e.target.closest('[data-action]');if(control){action(control.dataset.action);return;}
  const node=e.target.closest('[data-node]');if(node){nodeClick(e,Number(node.dataset.node));return;}
  if(e.target.closest('#battlefield')&&!dragMoved){if(ui.spell)action('cancel-spell');else commitAll();ui.context=null;refresh();}
});
document.addEventListener('contextmenu',e=>{
  if(!e.target.closest('#map-wrap'))return;e.preventDefault();const node=e.target.closest('[data-node]');if(node)nodeClick(e,Number(node.dataset.node),true);else{commitAll();ui.context=null;if(ui.spell)action('cancel-spell');refresh();}
});
document.addEventListener('change',e=>{
  if(e.target.name==='botCount'){config=readSetup();renderInto($('#bot-options'),botOptions(config.bots));}
  if(e.target.name==='faction')$('#faction-note').textContent=FACTIONS[e.target.value].detail;
  const id=e.target.dataset.asset;if(id){const file=e.target.files[0];if(!file)return;if(file.size>1500000){toast('Choose an image smaller than 1.5 MB.');return;}if(!['image/png','image/webp','image/jpeg','image/svg+xml'].includes(file.type)){toast('Please choose a supported image.');return;}const reader=new FileReader();reader.onload=()=>{try{saveAsset(id,reader.result);ui.terrain=terrain(g);artWorkshop();refresh();toast(`${id} artwork updated.`);}catch{toast('Browser storage is full or unavailable. Try a smaller image.');}};reader.readAsDataURL(file);}
});
document.addEventListener('keydown',e=>{
  if(e.key==='F2'){e.preventDefault();toggleInspect();return;}
  if(e.target.matches('input,select,textarea'))return;
  if(e.key==='Escape'){if(!modal.hidden){if(!$('#setup-form'))closeModal();}else if(ui.spell)action('cancel-spell');else{commitAll();ui.context=null;}refresh();}
  if(!modal.hidden)return;
  if(e.code==='Space'){e.preventDefault();action('pause');}
  if(e.key==='Enter'){e.preventDefault();const n=e.target.closest('[data-node]');if(n)nodeClick(e,Number(n.dataset.node));else action('routes');}
});
document.addEventListener('pointermove',e=>{if(ui.inspecting){const t=e.target.closest('[data-ui]');if(t)$('#reference').textContent=`${t.dataset.ui} · click to copy`;}});
let drag=null,dragMoved=false;
document.addEventListener('pointerdown',e=>{dragMoved=false;if(ui.zoom>1&&e.button===0&&e.target.closest('#battlefield')&&!e.target.closest('[data-node]'))drag={x:e.clientX,y:e.clientY,cx:ui.cx,cy:ui.cy};});
document.addEventListener('pointermove',e=>{if(!drag)return;const rect=$('#battlefield').getBoundingClientRect();if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>4)dragMoved=true;ui.cx=Math.max(0,Math.min(g.width,drag.cx-(e.clientX-drag.x)*g.width/ui.zoom/rect.width));ui.cy=Math.max(0,Math.min(g.height,drag.cy-(e.clientY-drag.y)*g.height/ui.zoom/rect.height));});
document.addEventListener('pointerup',()=>{drag=null;});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&started){paused=true;refresh();}});
let last=performance.now(),accumulator=0,lastRender=0;
function frame(now){
  const dt=Math.min(.25,(now-last)/1000);last=now;
  if(started&&!paused&&!g.result){accumulator+=dt;while(accumulator>=RULES.tick){step(g,RULES.tick);accumulator-=RULES.tick;}}
  else accumulator=0;
  if(now-lastRender>70){refresh();lastRender=now;}
  if(g.result&&!resultShown){resultShown=true;const t=totals(g,0);dialog(g.result==='victory'?'A realm united':'Your banner has fallen',`${icon(g.result==='victory'?'crown':'shield')}<h2>${g.result==='victory'?'Victory':'Defeat'}</h2><p>${g.result==='victory'?'The frontier flies your colors. Your campaign is complete.':'The war is lost. A new strategy awaits at the war table.'}</p><div class="result-stats"><div><strong>${clock(g.time)}</strong><small>CAMPAIGN</small></div><div><strong>${t.nodes}</strong><small>TERRITORIES</small></div><div><strong>${fmt(t.army)}</strong><small>ARMY POWER</small></div></div><button data-action="rematch" class="primary" data-ui="result.rematch">Fight again</button>${button('new')}`,'result');}
  requestAnimationFrame(frame);
}
initialize();showSetup();requestAnimationFrame(frame);
