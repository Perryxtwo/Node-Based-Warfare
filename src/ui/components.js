import { asset } from './assets.js';
import { BUTTONS } from '../content/ui.js';
export const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export const icon = (id, cls = '') => `<img class="icon ${cls}" src="${escape(asset(id))}" alt="" draggable="false">`;
export const fmt = value => Number.isFinite(value) ? (value >= 1000 ? `${(value / 1000).toFixed(1)}k` : Number(value.toFixed(1)).toString()) : 'MAX';
export const money = value => Number.isFinite(value) ? Number(value.toFixed(3)).toString() : 'MAX';
export function button(id, options = {}) {
  const def = { ...BUTTONS[id], ...options }, style = Object.entries(def.style || {}).map(([k, v]) => `${k}:${v}`).join(';');
  return `<button type="button" data-action="${escape(def.action || id)}" data-ui="${escape(def.ref || id)}" class="${escape(def.className || '')}" ${def.disabled ? 'disabled' : ''} style="${escape(style)}" ${def.title ? `title="${escape(def.title)}"` : ''}>${def.icon ? icon(def.icon) : ''}${escape(def.text || id)}</button>`;
}
export const clock = time => `${String(Math.floor(time / 60)).padStart(2, '0')}:${String(Math.floor(time % 60)).padStart(2, '0')}`;
