import { FACTIONS } from '../content/factions.js';
import { MODES } from '../content/modes.js';
import { UPGRADES } from '../content/upgrades.js';
import { SPELLS } from '../content/spells.js';
import { NODE_TYPES } from '../content/node-types.js';
import { STATS } from '../content/stats.js';
import { SEND_PERCENTAGES } from '../content/balance.js';
import { totals, maxHp, upgradeCost, atPeace } from '../core/selectors.js';
import { eligibleLabs } from '../core/spells.js';
import { icon, button, fmt, money, escape, clock } from './components.js';
export function shell(g) {
  return `<header class="hud"><div class="wordmark">${icon('crown')}<div>NODE BASED<span>WARFARE</span></div></div><div id="hud-stats" class="hud-stats"></div><div class="hud-controls"><span id="game-clock" class="stat-time">00:00</span>${button('pause')}${button('new')}</div></header>
  <main class="game-layout"><aside class="sidebar"><div class="side-header"><span class="eyebrow">YOUR KINGDOM</span><strong>${FACTIONS[g.players[0].faction].title}</strong></div><section id="node-panel"></section><section id="rivals" class="rivals"></section><section id="dispatches" class="dispatches"></section><nav class="tools">${button('help')}${button('art')}${button('inspect')}</nav></aside>
  <section class="war-table"><div class="map-heading"><div><span class="eyebrow">THE FRONTIER</span><h2>${MODES[g.config.mode].name}</h2></div><p>${MODES[g.config.mode].goal}</p><div id="send-meter" class="send-meter" data-ui="orders.percentage"></div><div class="zoom"><button data-action="zoom-out" data-ui="map.zoom.out" aria-label="Zoom out">−</button><button data-action="zoom-reset" data-ui="map.zoom.reset">Fit</button><button data-action="zoom-in" data-ui="map.zoom.in" aria-label="Zoom in">+</button></div></div>
  <div id="map-wrap" class="map-wrap"><svg id="battlefield" xmlns="http://www.w3.org/2000/svg" aria-label="Battlefield" viewBox="0 0 ${g.width} ${g.height}"></svg><section id="upgrade-menu" class="upgrade-menu" aria-label="Selected node upgrades" data-ui="node.upgrades" hidden></section><div id="pause-banner" hidden>THE BATTLE IS PAUSED</div></div>
  <div class="map-instructions" id="map-instructions"></div><section class="spell-dock"><div class="deck-heading"><span>${icon('book')} THE SPELLBOOK</span><small>Research. Prepare. Turn the tide.</small></div><div id="spell-cards" class="spell-cards"></div></section></section></main>`;
}
export function sendMeter(percent) {
  return `<span class="meter-label">ARMY TO SEND</span><div class="meter-notches" role="group" aria-label="Percentage of army to send">${SEND_PERCENTAGES.map(p=>`<button data-action="send-percent:${p}" data-ui="orders.percentage.${p}" aria-pressed="${p===percent}" title="Send ${p}% · Mouse wheel or ↑ / ↓">${p}%</button>`).join('')}</div>`;
}
export function hud(g) {
  const t = totals(g,0);
  return `<div data-ui="hud.gold">${icon('gold')}<span><strong class="stat-gold">${fmt(g.players[0].gold)}</strong><small>GOLD <em>+${t.goldRate.toFixed(1)}/s</em></small></span></div><div data-ui="hud.army">${icon('sword')}<span><strong class="stat-army">${fmt(t.army)}</strong><small>ARMY POWER</small></span></div><div data-ui="hud.territories">${icon('banner')}<span><strong>${t.nodes}<i> / ${g.nodes.length}</i></strong><small>TERRITORIES</small></span></div>`;
}
export function upgrades(g, n) {
  return Object.entries(UPGRADES).map(([id, u]) => {
    const price = upgradeCost(g,n,id), max = !Number.isFinite(price);
    return `<button class="upgrade" data-action="upgrade:${n.id}:${id}" data-ui="node.upgrade.${id}" ${max || price>g.players[0].gold ? 'disabled' : ''}>${icon(u.icon)}<span><strong>${u.label} <em class="stat-tier">T${n.tiers[id]}${max?'':' → '+(n.tiers[id]+1)}</em></strong><small>${u.subtitle}</small></span><b class="stat-gold">${max?'MAX':money(price)+' g'}</b></button>`;
  }).join('');
}
export function nodePanel(g, ui) {
  const n = g.nodes[ui.focus];
  if (!n) return `<div class="empty-panel">${icon('banner')}<h2>Your next move</h2><p>Select a stronghold to inspect its army, strengthen its walls, or send troops to the frontier.</p></div>`;
  return `<div class="node-summary"><span class="eyebrow">${n.label} · ${n.king!==null?'KING NODE':NODE_TYPES[n.type].name.toUpperCase()}</span><h2>${escape(n.name)}</h2><p>${n.owner === null?'Unclaimed territory':g.players[n.owner].name+' · '+FACTIONS[g.players[n.owner].faction].name}</p><div class="node-stats"><div data-ui="node.stat.army">${icon(STATS.army.icon)}<strong class="${STATS.army.className}">${n.owner!==0&&n.effects.hidden>g.time?'?':fmt(n.army)}</strong><small>ARMY POWER</small></div><div data-ui="node.stat.hp">${icon(STATS.hp.icon)}<strong class="${STATS.hp.className}">${fmt(n.hp)}<i> / ${fmt(maxHp(n))}</i></strong><small>BASE HEALTH</small></div></div><div class="production-line"><span class="stat-gold">${icon('gold')} 1 / ${UPGRADES.gold.values[n.tiers.gold]}s</span><span class="stat-rate">${icon('sword')} ${UPGRADES.barracks.values[n.tiers.barracks]} / ${fmt(n.troopDuration)}s</span></div><small class="terrain-note">${NODE_TYPES[n.type].description}${!atPeace(g,n)?' · Under siege':''}</small></div>
  ${n.owner===0?`<div class="orders"><div class="section-label">MARCHING ORDERS <span>${ui.selected.size} selected</span></div>${n.routes.length?`<ol class="recipient-list">${n.routes.map(r=>`<li><span>${g.nodes[r.to].label}</span><strong>${r.percent}%</strong></li>`).join('')}</ol>`:'<p>No recipients. Your army holds here.</p>'}${button('clear',{disabled:!ui.selected.size})}<small>Drag to send once. Right-click to toggle a recipient at the current %. Orders continue when deselected.</small><button data-action="route-mode" data-ui="orders.touch" aria-pressed="${ui.routeMode}">${ui.routeMode?'Exit':'Enable'} tap-to-route mode</button></div>`:'<div class="orders"><p>Drag from your stronghold to send once, or select it and right-click this node to add a recurring recipient.</p></div>'}`;
}
export function rivals(g) {
  return `<div class="section-label">THE RIVAL BANNERS</div>${g.players.slice(1).map(p=>`<div class="rival-row"><span class="rival-dot" style="--rival:${p.color}"></span><div><strong>${FACTIONS[p.faction].name}</strong><small>${p.alive ? p.difficulty : 'Defeated'}</small></div><b>${totals(g,p.id).nodes}<small> NODES</small></b></div>`).join('')}`;
}
export function spellCards(g) {
  const p=g.players[0];
  return Object.values(SPELLS).filter(s=>s.faction===p.faction).map(s=>{
    const job=p.research.find(j=>j.id===s.id),ready=p.hand.includes(s.id), labs=eligibleLabs(g,0,s),busy=labs.every(n=>p.research.some(j=>j.node===n.id));
    const status=ready?'READY TO CAST':job?`${atPeace(g,g.nodes[job.node])?'RESEARCHING':'SIEGE PAUSED'} · ${Math.floor(job.elapsed/job.duration*100)}%`:!labs.length?`REQUIRES T${s.tier} BARRACKS`:busy?'BARRACKS BUSY':`${s.cost} GOLD · ${fmt(s.seconds*FACTIONS[p.faction].research)}s`;
    return `<button class="spell-card ${ready?'ready':''}" data-action="${ready?'preview':'research'}:${s.id}" data-ui="spell.${s.id}" ${!ready&&(job||!labs.length||busy||p.gold<s.cost)?'disabled':''} title="${escape(s.description)}"><div class="spell-art">${icon(s.icon)}<span class="stat-tier">${s.tier}</span></div><div><strong>${s.name}</strong><small>${status}</small></div>${job?`<span class="research-fill" style="width:${job.elapsed/job.duration*100}%"></span>`:''}</button>`;
  }).join('');
}
export function dispatches(g) { return `<div class="section-label">FIELD DISPATCHES</div>${g.log.slice(0,3).map(e=>`<p><time>${clock(e.time)}</time> ${escape(e.text)}</p>`).join('')||'<p>The realm holds its breath.</p>'}`; }
