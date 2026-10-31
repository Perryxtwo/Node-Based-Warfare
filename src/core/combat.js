import { maxHp, owned, troopDuration } from './selectors.js';
import { RULES } from '../content/balance.js';
import { UPGRADES } from '../content/upgrades.js';
import { event } from './state.js';
export function damage(g, n, amount) {
  if (amount <= 0 || n.effects.shield > g.time) return 0;
  n.lastDamage = g.time;
  const shield = Math.min(n.army, amount); n.army -= shield; amount -= shield;
  const wall = Math.min(n.hp, amount); n.hp -= wall; amount -= wall;
  return amount;
}
export function capture(g, n, owner, army) {
  const previous = n.owner;
  n.owner = owner; n.army = army; n.hp = Math.min(maxHp(n), RULES.captureHpPerTier * n.tiers.hp);
  n.routes = []; n.routeCursor = 0; n.effects = {}; n.lastDamage = g.time; n.goldElapsed = 0; n.troopElapsed = 0;
  n.goldDuration = UPGRADES.gold.values[n.tiers.gold]; n.troopDuration = troopDuration(g, n);
  n.cyclePower = UPGRADES.barracks.values[n.tiers.barracks]; n.troopRunning = false;
  g.captures++; event(g, `${g.players[owner].name} captured ${n.name}.`, 'capture');
  if (g.config.mode === 'conquest' && n.king !== null && n.king !== owner && g.players[n.king].alive) {
    const loser = n.king; g.players[loser].alive = false; g.players[loser].research = []; g.players[loser].hand = [];
    for (const territory of owned(g, loser)) capture(g, territory, owner, territory.army);
    for (const wave of g.waves) if (wave.owner === loser) wave.owner = owner;
    event(g, `${g.players[loser].name} lost their crown.`, 'crown');
  }
  return previous;
}
export function arrive(g, n, owner, power) {
  if (n.owner === owner) { n.army += power; return; }
  const remaining = damage(g, n, power);
  if (remaining > 1e-8) capture(g, n, owner, remaining);
}
export function checkVictory(g) {
  if (g.result) return;
  if (g.config.mode === 'conquest') {
    if (!g.players[0].alive) g.result = 'defeat';
    else if (g.nodes.filter(n => n.king !== null).every(n => n.owner === 0)) g.result = 'victory';
  } else {
    for (const p of g.players) if (!owned(g, p.id).length) {
      p.alive = false;
      p.research = [];
      p.hand = [];
      g.waves = g.waves.filter(w => w.owner !== p.id);
    }
    if (!g.players[0].alive) g.result = 'defeat';
    else if (g.nodes.every(n => n.owner === 0)) g.result = 'victory';
  }
}
