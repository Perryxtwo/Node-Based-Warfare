import { SPELLS } from '../content/spells.js';
/** Replace a path here, replace a file in /assets, or upload through Art workshop. */
export const ASSETS = Object.fromEntries(['keep','crown','leaf','hammer','flame','sword','shield','gold','mountain','river','portal','link','eye','bolt','banner','book','hourglass','image','pause','arrow','troop'].map(id => [id, `./assets/${id}.svg`]));
for (const s of Object.values(SPELLS)) ASSETS[s.icon] = `./assets/${s.icon}.svg`;
let custom = {};
try { custom = JSON.parse(localStorage.getItem('nbw.art.v1') || '{}'); } catch { /* Storage may be disabled. */ }
export const asset = id => custom[id] || globalThis.NBW_EMBEDDED_ASSETS?.[id] || ASSETS[id] || ASSETS.keep;
export function saveAsset(id, data) {
  const next = { ...custom, [id]: data };
  if (!data) delete next[id];
  localStorage.setItem('nbw.art.v1', JSON.stringify(next)); custom = next;
}
