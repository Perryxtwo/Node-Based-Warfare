import { FACTIONS } from '../content/factions.js';
import { MODES } from '../content/modes.js';
import { button, icon, escape } from './components.js';
const options = (values, selected) => values.map(([v, text]) => `<option value="${v}" ${selected === v ? 'selected' : ''}>${text}</option>`).join('');
export function setupView(config) {
  return `<section class="setup" role="dialog" aria-modal="true" aria-labelledby="setup-title">
    <div class="setup-art"><div class="brand-seal">${icon('crown')}</div><p class="eyebrow">A REALM WITHOUT A RULER</p><h1 id="setup-title">Node Based<br><em>Warfare</em></h1><div class="rule-ornament">◆</div><p>Build your stronghold.<br>Command the frontier.<br>Claim the crown.</p><div class="art-landscape">${icon('mountain')}${icon('keep')}${icon('mountain')}</div><span class="edition">SINGLE PLAYER • FIRST CAMPAIGN</span></div>
    <form id="setup-form" class="setup-options"><header><span class="eyebrow">THE WAR TABLE</span><h2>Shape your campaign</h2><p>Every kingdom begins with a single stronghold.</p></header>
    <div class="section-label"><span>01</span> CHOOSE YOUR VICTORY</div>
    <div class="mode-grid">${Object.entries(MODES).map(([id, m]) => `<label class="choice mode-choice"><input type="radio" name="mode" value="${id}" ${config.mode === id ? 'checked' : ''} data-ui="setup.mode.${id}">${icon(m.icon)}<span><strong>${m.name}</strong><small>${m.description}</small></span></label>`).join('')}</div>
    <div class="section-label"><span>02</span> CHOOSE YOUR PEOPLE</div>
    <div class="faction-grid">${Object.entries(FACTIONS).map(([id, f]) => `<label class="choice faction-choice"><input type="radio" name="faction" value="${id}" ${config.faction === id ? 'checked' : ''} data-ui="setup.faction.${id}">${icon(f.icon)}<strong>${f.name}</strong><small>${f.title}</small></label>`).join('')}</div>
    <p class="faction-note" id="faction-note">${FACTIONS[config.faction].detail}</p>
    <div class="section-label"><span>03</span> SET THE OPPOSITION <select name="botCount" aria-label="Number of rivals" data-ui="setup.bot-count">${options([1, 2, 3, 4].map(n => [String(n), `${n} rival${n > 1 ? 's' : ''}`]), String(config.bots.length))}</select></div>
    <div id="bot-options">${botOptions(config.bots)}</div>
    <div class="setup-bottom"><label>Territories per player<select name="nodes" data-ui="setup.map-size">${options([8, 12, 16].map(n => [String(n), `${n} nodes`]), String(config.nodesPerPlayer))}</select></label><label>Map seed<input name="seed" value="${escape(config.seed)}" maxlength="36" data-ui="setup.seed"></label></div>
    <div class="setup-start">${button('start')}<small>Free for all · Your rivals fight each other, too.</small></div>
    </form></section>`;
}
export function botOptions(bots) {
  return bots.map((b, i) => `<div class="bot-row"><span class="rival-dot" style="--rival:${['#b75446','#7186b5','#b4883e','#9576a5'][i]}"></span><strong>Rival ${i + 1}</strong><select name="botFaction${i}" aria-label="Rival ${i + 1} faction" data-ui="setup.bot.${i}.faction">${options([['random','Random faction'], ...Object.entries(FACTIONS).map(([k,v])=>[k,v.name])],b.faction)}</select><select name="botDifficulty${i}" aria-label="Rival ${i + 1} difficulty" data-ui="setup.bot.${i}.difficulty">${options(['easy','normal','hard','nightmare'].map(d=>[d,d[0].toUpperCase()+d.slice(1)]),b.difficulty)}</select></div>`).join('');
}
