import { generateMap } from './map.js';
import { random } from './random.js';
import { FACTIONS, PLAYER_COLORS } from '../content/factions.js';
import { BALANCE as B } from '../content/balance.js';
export function createGame(config) {
  const rng = random(config.seed), factions = Object.keys(FACTIONS);
  const players = [{ faction: config.faction, difficulty: null }, ...config.bots].map((p, id) => ({
    ...p, id, faction: p.faction === 'random' ? factions[Math.floor(rng() * factions.length)] : p.faction,
    name: id ? `Rival ${id}` : 'You', color: PLAYER_COLORS[id], gold: B.startingGold, hand: [], research: [], alive: true, nextThink: 4,
  }));
  const game = { ...generateMap(players.length, config.nodesPerPlayer, config.seed), config, players, time: 0, waves: [], nextWave: 1, log: [], result: null, captures: 0 };
  for (const n of game.nodes) if (n.owner !== null) n.troopDuration *= FACTIONS[players[n.owner].faction].production;
  return game;
}
export function event(game, text, kind = 'info') { game.log.unshift({ time: game.time, text, kind }); game.log.length = Math.min(30, game.log.length); }
