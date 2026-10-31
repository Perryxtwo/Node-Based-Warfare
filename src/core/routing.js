import { neighbors } from './selectors.js';
import { NODE_TYPES } from '../content/node-types.js';
import { RULES, SEND_PERCENTAGES } from '../content/balance.js';
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
  if (!n || n.owner !== owner || owner === null || g.result) return false;
  const previous = n.routes, cursor = n.routeCursor;
  const nextInOrder = [...previous.slice(cursor), ...previous.slice(0, cursor)].map(r => r.to);
  const routes = [];
  for (const recipient of recipients) {
    const { to, percent = 100 } = typeof recipient === 'number' ? { to: recipient } : recipient;
    if (!SEND_PERCENTAGES.includes(percent) || routes.some(r => r.to === to)) continue;
    const existing = previous.find(r => r.to === to);
    if (!existing && !findPath(g, nodeId, to, owner)) continue;
    routes.push({ to, percent, nextSend: existing?.percent === percent ? existing.nextSend : g.time + RULES.orderDelay });
  }
  n.routes = routes;
  const next = nextInOrder.find(to => routes.some(r => r.to === to));
  n.routeCursor = Math.max(0, routes.findIndex(r => r.to === next));
  return true;
}
function send(g, n, path, percent) {
  const power = Math.floor(n.army * percent / 100);
  if (power < 1) return false;
  g.waves.push({ id: g.nextWave++, owner: n.owner, power, path, leg: 0, elapsed: 0, duration: edgeDuration(g, path[0], path[1]), created: g.time });
  n.army -= power;
  return true;
}
/** A manual send leaves recurring orders, percentages and clocks untouched. */
export function sendOnce(g, nodeId, to, percent, owner) {
  const n = g.nodes[nodeId];
  if (!n || n.owner !== owner || owner === null || g.result || !SEND_PERCENTAGES.includes(percent)) return false;
  const path = findPath(g, nodeId, to, owner);
  return path ? send(g, n, path, percent) : false;
}
/** Recipients take turns, using the army available at that instant. Zero holds the turn. */
export function ordersStep(g) {
  for (const n of g.nodes) {
    if (n.owner === null) continue;
    for (let checked = 0; checked < n.routes.length; checked++) {
      const route = n.routes[n.routeCursor];
      if (g.time + 1e-8 < route.nextSend) { n.routeCursor = (n.routeCursor + 1) % n.routes.length; continue; }
      const path = findPath(g, n.id, route.to, n.owner);
      // Temporarily unreachable recipients keep their order, but cannot block reachable ones.
      if (!path) { n.routeCursor = (n.routeCursor + 1) % n.routes.length; continue; }
      if (!send(g, n, path, route.percent)) break;
      route.nextSend = g.time + RULES.sendSeconds;
      n.routeCursor = (n.routeCursor + 1) % n.routes.length;
    }
  }
}
