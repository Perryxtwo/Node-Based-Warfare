import { BALANCE as B } from './balance.js';
export const FACTIONS = {
  elves: { name: 'Elves', title: 'The Verdant Court', icon: 'leaf', color: '#447f6b', description: 'Swift spellcraft. Precise strikes. Victory through foresight.', detail: 'Research 25% faster · Upgrades cost 15% more', production: 1, research: B.elfResearch, cost: B.elfCost, maxBarracks: 4 },
  dwarves: { name: 'Dwarves', title: 'The Iron Covenant', icon: 'hammer', color: '#ae8050', description: 'Unyielding strongholds. Patient ambition. An army worth waiting for.', detail: 'Tier 5 barracks anywhere · Troops take 20% longer', production: B.dwarfProduction, research: 1, cost: 1, maxBarracks: 5 },
  goblins: { name: 'Goblins', title: 'The Ragged Horde', icon: 'flame', color: '#8b9555', description: 'Relentless numbers. Stolen fortunes. Never a quiet frontier.', detail: 'Troops take 25% less time · Research takes 25% longer', production: B.goblinProduction, research: B.goblinResearch, cost: 1, maxBarracks: 4 },
};
export const PLAYER_COLORS = ['#3f8475', '#b75446', '#7186b5', '#b4883e', '#9576a5'];
