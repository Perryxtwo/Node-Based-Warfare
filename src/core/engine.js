import { economyStep } from './economy.js';
import { researchStep } from './spells.js';
import { arrive, checkVictory } from './combat.js';
import { edgeDuration, dispatch } from './routing.js';
import { aiStep } from './ai.js';
/** Pure simulation entry point: no DOM, wall clock, network or storage. */
export function step(g, dt, bots = true) {
  if (g.result) return;
  g.time += dt; economyStep(g, dt);
  for (const w of [...g.waves]) {
    w.elapsed += dt;
    if (w.elapsed + 1e-8 < w.duration) continue;
    const next = g.nodes[w.path[w.leg + 1]];
    if (next.owner !== w.owner || w.leg + 1 === w.path.length - 1) {
      arrive(g, next, w.owner, w.power); g.waves = g.waves.filter(x => x.id !== w.id);
      if (next.owner === w.owner) dispatch(g, next);
    } else { w.elapsed -= w.duration; w.leg++; w.duration = edgeDuration(g, w.path[w.leg], w.path[w.leg + 1]); }
  }
  researchStep(g, dt); checkVictory(g); if (bots && !g.result) aiStep(g);
}
