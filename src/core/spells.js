import { SPELLS } from '../content/spells.js';
import { BALANCE as B } from '../content/balance.js';
import { owned, atPeace, faction, maxHp } from './selectors.js';
import { upgrade } from './economy.js';
import { damage } from './combat.js';
import { event } from './state.js';
export function eligibleLabs(g, p, spell) { return owned(g, p).filter(n => n.tiers.barracks >= spell.tier); }
export function research(g, p, id) {
  const s = SPELLS[id], player = g.players[p];
  if (!s || s.faction !== player.faction || player.hand.includes(id) || player.research.some(j => j.id === id) || player.gold < s.cost) return false;
  const lab = eligibleLabs(g, p, s).find(n => !player.research.some(j => j.node === n.id));
  if (!lab) return false;
  player.gold -= s.cost; player.research.push({ id, node: lab.id, elapsed: 0, duration: s.seconds * faction(g, p).research }); return true;
}
export function researchStep(g, dt) {
  for (const p of g.players) for (const job of [...p.research]) {
    let n = g.nodes[job.node];
    if (n.owner !== p.id || n.tiers.barracks < SPELLS[job.id].tier) {
      n = eligibleLabs(g, p.id, SPELLS[job.id]).find(n => !p.research.some(j => j !== job && j.node === n.id));
      if (!n) { p.research = p.research.filter(j => j !== job); event(g, `${p.name}: ${SPELLS[job.id].name} research lost.`); continue; }
      job.node = n.id;
    }
    if (atPeace(g, n)) job.elapsed += dt;
    if (job.elapsed + 1e-8 >= job.duration) { p.hand.push(job.id); p.research = p.research.filter(j => j !== job); event(g, `${p.name}: ${SPELLS[job.id].name} is ready.`, 'magic'); }
  }
}
export function validTargets(g, p, id, ids) {
  const s = SPELLS[id]; if (!s || new Set(ids).size !== ids.length) return false;
  const ns = ids.map(i => g.nodes[i]);
  if (ns.some(n => !n || n.owner === null)) return false;
  const own = ns.filter(n => n.owner === p).length;
  return ({ none: ids.length === 0, own: ids.length === 1 && own === 1, enemy: ids.length === 1 && own === 0,
    twoOwn: ids.length === 2 && own === 2, twoAny: ids.length === 2, mixed: ids.length === 2 && own === 1,
    allOwn: ids.length > 0 && own === ids.length })[s.target] ?? false;
}
/** Each effect is isolated. New spells supply a definition and one handler. */
export const EFFECTS = {
  teleport(g, p, [a, b]) { const amount = Math.floor(a.army / 2); a.army -= amount; b.army += amount; },
  regrowth(g, p, [n]) { n.hp = Math.min(maxHp(n), n.hp + maxHp(n) / 2); },
  leyline(g, p, [a, b]) { if (!g.edges.some(([x, y]) => x === a.id && y === b.id || x === b.id && y === a.id)) g.edges.push([a.id, b.id]); },
  illusion(g, p, ns) { ns.forEach(n => n.effects.hidden = g.time + B.illusionSeconds); },
  devastation(g, p, [n]) { if (n.effects.shield > g.time) return; n.army /= 2; n.hp /= 2; n.lastDamage = g.time; },
  mines(g, p) { g.players[p].gold *= 1 + B.mineBonus; },
  bastion(g, p, [n]) { for (const key of ['hp', 'gold']) if (!upgrade(g, n.id, key, p, true)) n.army += 10; },
  defense(g, p, [n]) { n.effects.shield = g.time + 5; },
  gear(g, p, ns) { ns.forEach(n => { n.army *= 1 + B.gearBonus; }); },
  catapult(g, p, ns) { const source = ns.find(n => n.owner === p), amount = source.army / 4; ns.forEach(n => damage(g, n, amount)); },
  treasures(g, p, [n]) { n.effects.theft = { owner: p, until: g.time + 10 }; },
  heat(g, p, ns) { ns.forEach(n => n.effects.haste = { factor: B.hasteSpeed, until: g.time + B.hasteSeconds }); },
};
export function cast(g, p, id, ids) {
  if (!g.players[p].hand.includes(id) || !validTargets(g, p, id, ids)) return false;
  EFFECTS[id](g, p, ids.map(i => g.nodes[i])); g.players[p].hand = g.players[p].hand.filter(s => s !== id);
  event(g, `${g.players[p].name} cast ${SPELLS[id].name}.`, 'magic'); return true;
}
