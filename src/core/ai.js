import { owned, neighbors, maxHp } from './selectors.js';
import { commitRoutes, findPath } from './routing.js';
import { upgrade } from './economy.js';
import { SPELLS } from '../content/spells.js';
import { research, cast } from './spells.js';
export const DIFFICULTIES = {
  easy: { interval: 5, actions: 1, caution: 1.6, foresight: 0 },
  normal: { interval: 2.8, actions: 2, caution: 1.25, foresight: 1 },
  hard: { interval: 1.5, actions: 3, caution: 1.1, foresight: 2 },
  nightmare: { interval: .65, actions: 4, caution: 1.02, foresight: 3 },
};
// Illusions change observations, never the underlying combat state.
const observed = (g, n) => n.effects.hidden > g.time ? 12 : n.army;
function spellTargets(g, p, s, ns) {
  const foes = g.nodes.filter(n => n.owner !== null && n.owner !== p.id).sort((a, b) => observed(g, b) - observed(g, a));
  const strong = [...ns].sort((a, b) => b.army - a.army);
  const hurt = [...ns].sort((a, b) => a.hp / maxHp(a) - b.hp / maxHp(b));
  switch (s.target) {
    case 'none': return [];
    case 'own': return [(s.id === 'regrowth' || s.id === 'defense' ? hurt : strong)[0]?.id];
    case 'enemy': return [foes[0]?.id];
    case 'allOwn': return ns.map(n => n.id);
    case 'twoOwn': return strong.slice(0, 2).map(n => n.id);
    case 'twoAny': return [strong[0]?.id, foes[0]?.id];
    case 'mixed': return [strong[0]?.id, foes[0]?.id];
  }
}
function act(g, p, d) {
  const ns = owned(g, p.id); if (!ns.length) return false;
  for (const id of p.hand) if (cast(g, p.id, id, spellTargets(g, p, SPELLS[id], ns))) return true;
  const king = ns.find(n => n.king === p.id) || ns[0];
  const incoming = g.waves.filter(w => w.owner !== p.id && g.nodes[w.path.at(-1)].owner === p.id);
  if (d.foresight && incoming.length) {
    const target = g.nodes[incoming[0].path.at(-1)];
    const donor = ns.filter(n => n !== target && n.army > 4 && findPath(g, n.id, target.id, p.id)).sort((a, b) => b.army - a.army)[0];
    if (donor && !donor.routes.includes(target.id)) return commitRoutes(g, donor.id, [target.id], p.id);
  }
  const frontier = g.nodes.filter(n => n.owner !== p.id && neighbors(g, n.id).some(i => g.nodes[i].owner === p.id));
  const force = ns.reduce((a, n) => a + n.army, 0);
  const targets = frontier.map(n => ({ n, cost: observed(g, n) + n.hp,
    score: observed(g, n) + n.hp - (n.king !== null ? d.foresight * 8 : 0) - (n.owner !== null && g.players[n.owner].faction === 'dwarves' ? d.foresight * 2 : 0),
  })).sort((a, b) => a.score - b.score);
  const target = targets.find(t => force > t.cost * d.caution + 2);
  if (target) {
    const donor = [...ns].sort((a, b) => b.army - a.army).find(n => n.army >= 2 && !n.routes.includes(target.n.id) && findPath(g, n.id, target.n.id, p.id));
    if (donor) return commitRoutes(g, donor.id, [target.n.id], p.id);
  }
  // Faction biases are explicit and editable, not hidden resource bonuses.
  const order = p.faction === 'goblins' ? ['barracks', 'gold', 'hp'] : p.faction === 'elves' ? ['gold', 'barracks', 'hp'] : ['barracks', 'hp', 'gold'];
  if (p.faction === 'elves' || g.time > 35) for (const s of Object.values(SPELLS).filter(s => s.faction === p.faction)) if (research(g, p.id, s.id)) return true;
  for (const key of order) {
    const candidates = [king, ...ns.filter(n => n !== king).sort((a, b) => a.tiers[key] - b.tiers[key])];
    for (const n of candidates) if (upgrade(g, n.id, key, p.id)) return true;
  }
  return false;
}
export function aiStep(g) {
  for (const p of g.players.slice(1)) {
    if (!p.alive || p.nextThink > g.time) continue;
    const d = DIFFICULTIES[p.difficulty]; p.nextThink = g.time + d.interval;
    for (let i = 0; i < d.actions; i++) if (!act(g, p, d)) break;
  }
}
