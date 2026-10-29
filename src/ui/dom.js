/** Small DOM reconciler: preserve button/input identity during live stat updates. */
export function renderInto(root, html) {
  const template = document.createElement('template'); template.innerHTML = html;
  reconcile(root, template.content);
}
function reconcile(old, fresh) {
  for (let i = 0; i < fresh.childNodes.length; i++) {
    const next = fresh.childNodes[i], current = old.childNodes[i];
    if (!current) { old.append(next.cloneNode(true)); continue; }
    if (current.nodeType !== next.nodeType || current.nodeName !== next.nodeName) { current.replaceWith(next.cloneNode(true)); continue; }
    if (next.nodeType === 3) { if (current.textContent !== next.textContent) current.textContent = next.textContent; continue; }
    if (next.nodeType !== 1) continue;
    for (const attr of [...current.attributes]) if (!next.hasAttribute(attr.name)) current.removeAttribute(attr.name);
    for (const attr of next.attributes) if (current.getAttribute(attr.name) !== attr.value) current.setAttribute(attr.name, attr.value);
    reconcile(current, next);
  }
  while (old.childNodes.length > fresh.childNodes.length) old.lastChild.remove();
}
