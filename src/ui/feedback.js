/** Short-lived cast animation. A visual copy cannot receive input or retain IDs. */
export function dissolveCard(id) {
  const card = document.querySelector(`[data-ui="spell.${id}"]`);
  if (!card) return;
  const rect = card.getBoundingClientRect(), ghost = card.cloneNode(true);
  ghost.removeAttribute('data-action'); ghost.removeAttribute('data-ui');
  ghost.setAttribute('aria-hidden', 'true'); ghost.tabIndex = -1;
  ghost.classList.add('cast-echo');
  Object.assign(ghost.style, { left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px` });
  document.body.append(ghost); setTimeout(() => ghost.remove(), 520);
}
