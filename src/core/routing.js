import { neighbors } from './selectors.js';
import { NODE_TYPES } from '../content/node-types.js';
import { RULES } from '../content/balance.js';
export const edgeDuration = (g, a, b) => RULES.edgeSeconds / Math.min(NODE_TYPES[g.nodes[a].type].speed, NODE_TYPES[g.nodes[b].type].speed);
/** Dijkstra: only friendly interior nodes; endpoint may be hostile. */
export function findPath(g, from, to, owner) {
  if (from === to || g.nodes[from]?.owner !== owner || !g.nodes[to]) return null;
  const distance = new Map([[from, 0]]), previous = new Map(), open = new Set([from]);
  while (open.size) {
    const current = [...open].sort((a, b) => distance.get(a) - distance.get(b))[0]; open.delete(current);
    if (current === to) { const path = [to]; while (path[0] !== from) path.unshift(previous.get(path[0])); return path; }
    if (current !== from && g.nodes[current].owner !== owner) continue;
    for (const next of neighbors(g, current)) {
      const d = distance.get(current) + edgeDuration(g, current, next);
      if (d < (distance.get(next) ?? Infinity)) { distance.set(next, d); previous.set(next, current); open.add(next); }
    }
  }
  return null;
}
export function commitRoutes(g, nodeId, recipients, owner) {
  const n = g.nodes[nodeId];
  if (!n || n.owner !== owner) return false;
  n.routes = [...new Set(recipients)].filter(id => findPath(g, nodeId, id, owner));
  dispatch(g, n); return true;
}
/** Integer shares with rotating remainder; fractional spell power stays at home. */
export function dispatch(g, n) {
  const paths = n.routes.map(id => findPath(g, n.id, id, n.owner)).filter(Boolean);
  const power = Math.floor(n.army + 1e-9);
  if (!paths.length || !power) return;
  const base = Math.floor(power / paths.length), remainder = power % paths.length;
  paths.forEach((path, i) => {
    const extra = (i - n.rotation + paths.length) % paths.length < remainder ? 1 : 0;
    const amount = base + extra;
    if (amount) g.waves.push({ id: g.nextWave++, owner: n.owner, power: amount, path, leg: 0, elapsed: 0, duration: edgeDuration(g, path[0], path[1]), created: g.time });
  });
  n.rotation = (n.rotation + remainder) % paths.length; n.army -= power;
}
