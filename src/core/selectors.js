import { FACTIONS } from '../content/factions.js';
import { NODE_TYPES } from '../content/node-types.js';
import { UPGRADES } from '../content/upgrades.js';
import { RULES } from '../content/balance.js';
export const owned = (g, p) => g.nodes.filter(n => n.owner === p);
export const faction = (g, p) => FACTIONS[g.players[p].faction];
export const maxHp = n => UPGRADES.hp.values[n.tiers.hp] * NODE_TYPES[n.type].hp;
export const atPeace = (g, n) => g.time - n.lastDamage >= RULES.peaceSeconds - 1e-8;
export const neighbors = (g, id) => g.edges.flatMap(([a, b]) => a === id ? [b] : b === id ? [a] : []);
export const troopDuration = (g, n) => RULES.troopSeconds * faction(g, n.owner).production / (n.effects.haste?.until > g.time ? n.effects.haste.factor : 1);
export const maxTier = (g, n, key) => key === 'barracks' ? (n.king !== null ? 5 : faction(g, n.owner).maxBarracks) : UPGRADES[key].max;
export function upgradeCost(g, n, key) {
  const def = UPGRADES[key];
  if (n.owner === null || n.tiers[key] >= maxTier(g, n, key)) return Infinity;
  return def.costs[n.tiers[key] - def.min] * faction(g, n.owner).cost * (n.king !== null ? .5 : 1);
}
export function totals(g, p) {
  const ns = owned(g, p);
  return { nodes: ns.length, army: ns.reduce((a, n) => a + n.army, 0) + g.waves.filter(w => w.owner === p).reduce((a, w) => a + w.power, 0), goldRate: ns.reduce((a, n) => a + 1 / UPGRADES.gold.values[n.tiers.gold], 0) };
}
