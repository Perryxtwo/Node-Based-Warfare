import { maxHp, upgradeCost, troopDuration, atPeace } from './selectors.js';
import { UPGRADES } from '../content/upgrades.js';
import { BALANCE as B } from '../content/balance.js';
/** Upgrades change the next cycle, never the snapshot of the active cycle. */
export function upgrade(g, nodeId, key, owner, free = false) {
  const n = g.nodes[nodeId];
  if (!n || n.owner !== owner || !UPGRADES[key]) return false;
  const cost = upgradeCost(g, n, key);
  if (!Number.isFinite(cost) || (!free && g.players[owner].gold + 1e-8 < cost)) return false;
  if (!free) g.players[owner].gold -= cost;
  n.tiers[key]++;
  return true;
}
export function economyStep(g, dt) {
  for (const n of g.nodes) {
    if (n.owner === null) continue;
    n.goldElapsed += dt;
    while (n.goldElapsed + 1e-8 >= n.goldDuration) {
      n.goldElapsed -= n.goldDuration;
      const recipient = n.effects.theft?.until > g.time ? n.effects.theft.owner : n.owner;
      g.players[recipient].gold += 1; n.goldDuration = UPGRADES.gold.values[n.tiers.gold];
    }
    const peaceful = atPeace(g, n);
    if (peaceful) n.hp = Math.min(maxHp(n), n.hp + B.regeneration * dt);
    if (n.tiers.barracks && !n.troopRunning && peaceful) {
      n.troopRunning = true; n.troopElapsed = 0; n.troopDuration = troopDuration(g, n); n.cyclePower = UPGRADES.barracks.values[n.tiers.barracks];
    }
    if (n.troopRunning) {
      n.troopElapsed += dt;
      if (n.troopElapsed + 1e-8 >= n.troopDuration) {
        n.army += n.cyclePower; n.troopElapsed -= n.troopDuration;
        n.troopDuration = troopDuration(g, n); n.cyclePower = UPGRADES.barracks.values[n.tiers.barracks];
        n.troopRunning = peaceful;
      }
    }
  }
}
