# Extension and UI reference guide

## Dependency boundaries

Content → simulation → UI. `src/core` has no DOM dependencies. `src/main.js` owns the interaction state and fixed-step loop. The renderer consumes game state but cannot change it. Tests can construct games and call `step` with no browser.

The loop accumulates elapsed foreground time into 50 ms ticks. It caps long frame gaps and pauses when the document is hidden. Render updates are bounded to approximately 14 frames per second; armies are aggregated by dispatch rather than creating a DOM object for every power point. Graph searches are on demand, over at most 80 initial nodes. Node controls retain DOM identity during updates so live production does not interrupt clicks.

## Adding content

- **Faction:** add a keyed definition in `factions.js`, including production, research and cost multipliers, max ordinary barracks tier, and icon. Setup automatically lists it. Spell definitions reference its key. Add optional AI priorities in `ai.js`.
- **Node type:** add a definition in `node-types.js`, then include it in the generator's special-node selection. HP and travel systems read its modifiers. New types with active behavior should receive their own system hook.
- **Spell:** add a definition in `spells.js` with a stable ID, faction, tier, icon, cost, seconds and target schema. Add its effect under the same key in `core/spells.js`. Existing targeting schemas, research UI, and hand rendering work automatically. A new target schema must extend `validTargets`, UI targeting and AI targeting together.
- **Stat or upgrade:** add the data definition, a state field if needed, and the corresponding simulation consumer/apply handler. The upgrade panel enumerates the registry. Gold/barracks upgrades intentionally apply only after the active cycle finishes.
- **Button:** add a definition in `content/ui.js`, use `button(id)` in the relevant component, then handle the action in `main.js`. Set `style` for CSS property overrides, `className` for shared styling, `icon` for manifest art, and `ref` for a stable annotation ID. Layout positions belong to the named component's CSS block.
- **Sprite:** replace `assets/<name>.svg`, point `ASSETS` to any supported image path, or use Art workshop. Add new manifest IDs for new content. Keep art independent of simulation.
- **Font:** edit the appropriate `--font-army`, `--font-hp`, `--font-gold`, `--font-rate`, `--font-tier`, or `--font-time` token. Add a local `@font-face` for a downloaded font. All numeric text uses tabular numerals where appropriate.

## Stable reference vocabulary

| Reference | Meaning |
|---|---|
| `setup.start`, `setup.mode.*`, `setup.faction.*` | Campaign setup |
| `setup.bot-count`, `setup.bot.<index>.faction`, `setup.bot.<index>.difficulty` | Rival configuration |
| `setup.map-size`, `setup.seed` | Map inputs |
| `hud.gold`, `hud.army`, `hud.territories`, `hud.pause`, `hud.new` | Top bar |
| `map.node.N01`, `map.node.N01.army` | Node and army number |
| `map.zoom.in`, `map.zoom.out`, `map.zoom.reset` | View controls |
| `node.stat.army`, `node.stat.hp` | Inspector stats |
| `node.upgrade.gold`, `.barracks`, `.hp` | Upgrade components |
| `orders.commit`, `orders.clear`, `orders.touch` | Army orders |
| `spell.<spell-id>` | Research/hand card |
| `magic.choose-targets`, `magic.cast`, `magic.cancel` | Spell controls |
| `tools.guide`, `tools.art`, `tools.inspect` | Utilities |
| `art.upload.<asset-id>`, `art.reset.<asset-id>` | Asset replacements |
| `result.rematch` | Restart completed campaign |

## Resolving remaining design gaps

Balance values labeled WIP in Trello are not final design decisions. Review them through playtesting. Research uses the highest available eligible tiers, with one job per node. Leyline is allowed to add a fifth edge: the four-edge cap is applied to generated maps, not magic. Terrain speed penalties use the slower endpoint once. A fractional amount of army power created by a spell stays at its source until it accumulates to a whole point; routes divide integer power fairly. Neutral guard strength is based on graph-like distance and starting upgrades.

On Conquest elimination, remaining territory and moving armies transfer to the captor. This is an explicit draft rule because Trello does not describe the aftermath of losing a king. Domination requires every node including neutrals, following its Trello card. A destructive spell does not capture territory; capture requires an arriving army with surplus power. These decisions should be revisited if the board changes.
