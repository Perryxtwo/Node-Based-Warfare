import { BALANCE as B } from './balance.js';
// Target schemas are shared by UI validation and bot commands.
const spell = (id, faction, name, tier, icon, target, description) => ({ id, faction, name, tier, icon: `spell-${id}`, symbol: icon, target, description, cost: B.spellCosts[tier], seconds: B.spellSeconds[tier] });
export const SPELLS = Object.fromEntries([
  spell('teleport', 'elves', 'Magical Teleportation', 2, 'portal', 'twoOwn', 'Move 50% of one army to another friendly node instantly.'),
  spell('regrowth', 'elves', 'Regrowth', 2, 'leaf', 'own', 'Restore 50% of a friendly node’s maximum base health.'),
  spell('leyline', 'elves', 'Leyline', 3, 'link', 'twoAny', 'Create a permanent connection between two occupied nodes.'),
  spell('illusion', 'elves', 'Illusionary Magic', 4, 'eye', 'allOwn', 'Conceal your selected armies from opponents for 12 seconds.'),
  spell('devastation', 'elves', 'Devastating Magic', 5, 'bolt', 'enemy', 'Remove 50% of an enemy army and its current base health.'),
  spell('mines', 'dwarves', 'Dwarven Mines', 2, 'gold', 'none', 'Gain gold equal to 30% of your treasury.'),
  spell('bastion', 'dwarves', 'Dwarven Bastion', 3, 'keep', 'own', 'Upgrade health and gold. Gain 10 power for each track already maxed.'),
  spell('defense', 'dwarves', 'Dwarven Defense', 4, 'shield', 'own', 'A friendly node ignores damage for 5 seconds.'),
  spell('gear', 'dwarves', 'Dwarven Gear', 5, 'hammer', 'allOwn', 'Add 35% army power to each selected friendly node.'),
  spell('catapult', 'goblins', 'Goblin Catapult', 2, 'sword', 'mixed', 'Deal 25% of a friendly army’s power to it and an enemy node.'),
  spell('treasures', 'goblins', 'Stolen Treasures', 3, 'gold', 'enemy', 'Steal a target’s gold production for 10 seconds.'),
  spell('heat', 'goblins', 'Goblins in Heat', 4, 'flame', 'allOwn', 'Troop production is 40% faster at selected nodes for 10 seconds.'),
].map(s => [s.id, s]));
