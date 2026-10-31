import { asset } from './assets.js';
import { maxHp } from '../core/selectors.js';
import { NODE_TYPES } from '../content/node-types.js';
import { random } from '../core/random.js';
import { fmt, escape } from './components.js';
const img = (id, x, y, width, height = width) => `<image href="${escape(asset(id))}" x="${x}" y="${y}" width="${width}" height="${height}"/>`;
export function terrain(g) {
  const rng = random(g.config.seed + 'land'); let trees = '';
  for (let i = 0; i < 240; i++) {
    const x = rng() * g.width, y = rng() * g.height;
    if (g.nodes.some(n => Math.hypot(n.x - x, n.y - y) < 65)) continue;
    const s = .5 + rng() * .8;
    trees += `<path transform="translate(${x} ${y}) scale(${s})" d="M0 0l-7 13h4l-7 9h8v5h4v-5h8l-7-9h4z"/>`;
  }
  return `<g class="landscape" aria-hidden="true"><path class="contour" d="M0 80Q${g.width/3} -70 ${g.width/2} 80T${g.width} 60M0 ${g.height-30}Q${g.width/2} ${g.height-130} ${g.width} ${g.height-10}"/><g class="trees">${trees}</g><text class="region-label" x="${g.width*.52}" y="30" text-anchor="middle">THE BORDERLANDS</text><text class="region-label" x="${g.width*.52}" y="${g.height-10}" text-anchor="middle">THE OLD KINGDOM</text><g class="compass" transform="translate(${g.width-40} ${g.height-55})"><path d="M0-24L5 0 0 24-5 0zM-20 0L0-4 20 0 0 4z"/><text y="-30" text-anchor="middle">N</text></g></g>`;
}
export function battlefieldView(g, ui) {
  const selected = [...ui.selected], common = selected.length ? g.nodes[selected[0]].routes.filter(r => selected.every(s => g.nodes[s].routes.some(other => other.to === r.to))).map(r => r.to) : [];
  return `<g id="land">${ui.terrain}</g><g class="roads">${g.edges.map(([a,b])=>`<line x1="${g.nodes[a].x}" y1="${g.nodes[a].y}" x2="${g.nodes[b].x}" y2="${g.nodes[b].y}"/>`).join('')}</g>
  <g class="order-lines">${selected.flatMap(id => g.nodes[id].routes.map(r=>`<path d="M${g.nodes[id].x} ${g.nodes[id].y}L${g.nodes[r.to].x} ${g.nodes[r.to].y}"/>`)).join('')}</g>
  <g>${g.nodes.map(n => {
    const color = n.owner === null ? '#92917a' : g.players[n.owner].color, picked = ui.selected.has(n.id), target = ui.targets.includes(n.id), hidden = n.owner !== 0 && n.effects.hidden > g.time;
    return `<g class="map-node ${picked ? 'selected' : ''} ${common.includes(n.id) ? 'recipient' : ''} ${target ? 'spell-target' : ''} ${ui.dragOrder?.to===n.id ? 'drop-target' : ''}" transform="translate(${n.x} ${n.y})" data-node="${n.id}" data-ui="map.node.${n.label}" tabindex="0" role="button" aria-label="${escape(n.name)}, ${n.owner === null ? 'vacant' : g.players[n.owner].name}, ${hidden ? 'hidden' : fmt(n.army)} army, ${fmt(n.hp)} health" style="--owner:${color}">
    <title>${n.label} · ${n.name} · ${NODE_TYPES[n.type].name}\nArmy ${hidden ? '?' : fmt(n.army)} · HP ${fmt(n.hp)} / ${fmt(maxHp(n))}\n${n.owner === 0 ? 'Left: select and upgrade. Drag: send once. Right: toggle recipient.' : 'Drop troops here, or right-click to toggle recipient.'}</title>
    <circle class="node-shadow" r="32" cy="3"/><circle class="king-ring" r="37" ${n.king === null ? 'visibility="hidden"' : ''}/><circle class="selection-ring" r="41"/><circle class="target-ring" r="44"/><circle class="node-disc" r="29"/>
    ${img(n.king !== null ? 'crown' : NODE_TYPES[n.type].icon, -20,-24,40)}
    <rect class="army-badge" x="-23" y="14" width="46" height="24" rx="9"/><text class="army-number" text-anchor="middle" y="31" data-ui="map.node.${n.label}.army">${hidden ? '?' : fmt(n.army)}</text>
    <path class="hp-track" d="M-22 43H22"/><path class="hp-fill" d="M-22 43H${-22+44*n.hp/maxHp(n)}"/>
    <text class="node-name" text-anchor="middle" y="59">${escape(n.name)}</text><text class="node-id" text-anchor="middle" y="73">${n.label}${n.king !== null ? ' · KING' : ''}</text>
    ${n.effects.shield > g.time ? '<circle class="shield-ring" r="33"/>' : ''}
    ${g.time-n.lastDamage < 5 && n.owner !== null ? '<text class="siege-label" y="-47" text-anchor="middle">UNDER SIEGE</text>' : ''}
    </g>`;
  }).join('')}</g><g class="armies" aria-hidden="true">${g.waves.map(w=>{
    const a=g.nodes[w.path[w.leg]],b=g.nodes[w.path[w.leg+1]],t=Math.min(1,w.elapsed/w.duration),x=a.x+(b.x-a.x)*t,y=a.y+(b.y-a.y)*t;
    return `<g transform="translate(${x} ${y})"><circle r="13" fill="${g.players[w.owner].color}" stroke="#f0e6ca" stroke-width="2"/>${img('troop',-9,-13,18)}<text y="23" text-anchor="middle">${fmt(w.power)}</text></g>`;
  }).join('')}</g><g class="drag-order" aria-hidden="true">${ui.dragOrder?`<path d="M${g.nodes[ui.dragOrder.from].x} ${g.nodes[ui.dragOrder.from].y}L${ui.dragOrder.x} ${ui.dragOrder.y}"/><text x="${ui.dragOrder.x+15}" y="${ui.dragOrder.y-15}">${ui.percent}%</text>`:''}</g>`;
}
