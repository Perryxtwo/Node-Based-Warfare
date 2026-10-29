import { random } from './random.js';
import { BALANCE as B } from '../content/balance.js';
import { UPGRADES } from '../content/upgrades.js';
const names = ['Alderwatch', 'Briar Hollow', 'Stoneford', 'Thornfield', 'Ashen Mill', 'Oakrest', 'Windmere', 'Highfell', 'Greybridge', 'Foxglove', 'Ember Hill', 'Westhaven', 'Dawnreach', 'Ironwood', 'Mossgate', 'Redbrook', 'Kingsfall', 'Silverfen', 'Rookwell', 'Fallowmere'];
/** Irregular grid guarantees connected, readable, bounded-degree maps. */
export function generateMap(players, perPlayer, seed) {
  const rng = random(seed), count = players * perPlayer;
  const rows = count <= 24 ? 3 : count <= 48 ? 4 : 5, cols = Math.ceil(count / rows);
  const nodes = Array.from({ length: count }, (_, i) => ({
    id: i, label: `N${String(i + 1).padStart(2, '0')}`, name: names[i % names.length],
    x: 100 + (i % cols) * 170 + (rng() - .5) * 35, y: 110 + Math.floor(i / cols) * 160 + (rng() - .5) * 38,
    type: 'regular', owner: null, king: null, tiers: { gold: 1, barracks: 0, hp: 1 }, hp: 0, army: 0,
    routes: [], rotation: 0, goldElapsed: 0, goldDuration: 3, troopElapsed: 0, troopDuration: 2,
    cyclePower: 1, troopRunning: false, lastDamage: -100, effects: {},
  }));
  const edges = [];
  for (let i = 0; i < count; i++) {
    if (i % cols < cols - 1 && i + 1 < count) edges.push([i, i + 1]);
    if (i + cols < count) edges.push([i, i + cols]);
  }
  // A short final row is linked back horizontally; its endpoints still have degree >= 2.
  if (count % cols === 1) edges.push([count - 1, count - 2]);
  const kings = [Math.floor(rows / 2) * cols];
  while (kings.length < players) {
    const candidates = nodes.filter(n => !kings.includes(n.id));
    candidates.sort((a, b) => Math.min(...kings.map(k => Math.hypot(nodes[k].x - b.x, nodes[k].y - b.y))) - Math.min(...kings.map(k => Math.hypot(nodes[k].x - a.x, nodes[k].y - a.y))));
    kings.push(candidates[0].id);
  }
  const neutral = nodes.filter(n => !kings.includes(n.id));
  const shuffled = [...neutral].sort(() => rng() - .5);
  const specials = Math.max(1, Math.floor(neutral.length / 8));
  for (let i = 0; i < specials; i++) shuffled[i].type = i % 2 ? 'river' : 'mountain';
  for (const n of neutral) {
    for (let i = 0; i < 2; i++) if (rng() < .25) n.tiers[rng() < .5 ? 'gold' : 'hp']++;
    if (rng() < .25) n.tiers.barracks = 1;
    const distance = Math.min(...kings.map(k => Math.abs(k % cols - n.id % cols) + Math.abs(Math.floor(k / cols) - Math.floor(n.id / cols))));
    n.army = B.neutralBase + distance * B.neutralDistance + (n.tiers.gold + n.tiers.hp + n.tiers.barracks - 2) * B.neutralUpgrade;
  }
  kings.forEach((id, p) => Object.assign(nodes[id], { owner: p, king: p, name: ['Verdant Keep', 'Ironhold', 'Redwatch', 'Amber Crown', 'Violet Bastion'][p], tiers: { gold: 1, barracks: 1, hp: 2 }, hp: UPGRADES.hp.values[2], army: B.startingArmy, troopRunning: true }));
  return { nodes, edges, width: 200 + (cols - 1) * 170, height: 220 + (rows - 1) * 160 };
}
