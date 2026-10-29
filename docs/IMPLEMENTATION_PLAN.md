# Node Based Warfare — implementation plan

Reference: the complete five-list, 45-card Trello board, including archived Graveyard and Multiplayer. `TRELLO_REFERENCE.md` preserves every description and card URL. Follow `AGENTS.md`.

## Experience and visual mockup

Build a single-player real-time strategy game with a readable battlefield, immediate orders, and restrained fantasy. Parchment land, pine-green command panels, warm brass outlines, crimson opponents, and illustrated keeps convey medieval magical war without a dark or occult aesthetic.

```text
┌ crest / NODE BASED WARFARE ── gold · army · territories ─ time · pause ┐
│ COMMAND PANEL     │ THE FRONTIER                          objective │
│ selected keep     │        ○────○       ○────♛                      │
│ army / hp / rates │       /     │───────│     │                      │
│ upgrade gold      │  ♛───○──────○       ○────○                      │
│ upgrade barracks  │       \     │       │                            │
│ upgrade ramparts  │        ○────○───────○                            │
│ routes + commit  │              selected = blue / recipient = red   │
│ opponents        │ spell research + hand + cast preview             │
└ help / art / IDs ┴ click to select · right click recipient · deselect┘
```

Opening setup: Conquest/Domination, player faction, 1–4 independent bots with individual faction/difficulty, nodes per player, reproducible map seed, then Start. The background previews the game. The game screen has permanent upgrades as a fast-access alternative to the specified right-click menu. F2 exposes stable element references; every node has a visible N-number.

## Build order and module contracts

1. **Content registries** (`src/content/`): independent definitions for stats, upgrades, node types, factions, spells, modes, and provisional balance. Definitions reference stable IDs and effect handlers. UI reads the registries instead of repeating numbers.
2. **State and map** (`src/core/map.js`, `state.js`): seeded, connected maps with degree 2–4, distant kings, slight spatial irregularity, special-node quota, upgraded neutral guards, per-node independent cycle state. Simulation state is serializable; rendering owns no game rules.
3. **Simulation** (`src/core/`): fixed 50ms ticks, gold cycle snapshots, troop cycle snapshots, siege grace period, HP regeneration, army-first combat, capture, research, movement, and victory. Gold remains fractional to preserve exact king discounts. Incoming attacks need surplus power to capture, following the newer Army Damage card.
4. **Orders** (`routing.js`): shortest traversable path through friendly nodes with an enemy/neutral endpoint; 1.34s per ordinary edge. Edit recipient drafts while committed routes continue, then commit on deselection. Rotate integer remainders fairly. Dispatch existing and future troops. In-flight armies fight at a newly hostile intermediate node instead of passing through it.
5. **Magic** (`spells.js`): all 12 named spells, barracks-tier requirements, gold cost, research queue, siege pause, cancellation/reassignment when barracks are captured, one copy per hand, preview/target/confirm flow, neutral exclusion, timed effects, and target validation shared by player and bots.
6. **Bots** (`ai.js`): same economic and command API as the player. Difficulty changes decision delay, action budget, caution, targeting, defensive response, and spell use. No resource cheats. First draft uses scored heuristics; true multi-step adversarial search is a later AI milestone.
7. **Presentation** (`src/ui/`, `styles/`): HTML controls and accessible SVG battlefield, one animation loop for moving armies, throttled panel updates, reusable buttons from `ui.js`, CSS geometry/color/font tokens. No framework or runtime dependency is needed for this bounded graph game. Keyboard, pointer and touch alternative route controls.
8. **Art and annotation** (`assets/`, `assets.js`): replace named SVG/PNG/WebP paths in the manifest or upload a replacement in the in-game Art workshop. Artwork has no connection to rules. Separate fonts for army, health, gold, rates, tiers and time. Stable `data-ui` references with F2 inspection and copyable labels.
9. **Validation and delivery**: Node's built-in tests for graph invariants, timing, routing, combat, economy, all spell handlers, siege, victory, and long bot matches; browser interaction and layout checks. Local launch via `npm start`; no build or account required. Document limitations and balance assumptions before any separate publishing decision.

## Explicit draft decisions (not final Trello balance)

All WIP values live in `src/content/balance.js`: mountain +40% HP / 25% slower travel; river 30% slower travel; elves 25% faster research / 15% cost increase; dwarves 20% slower production; goblins 25% faster production / 25% slower research. Spell prices/times by tier, starting 12 gold and 8 army, regeneration 1 HP/sec, neutral guard formula, illusion 12s, mines +30%, gear +35%, goblin haste +40% for 10s are draft tuning.

Latest capture card supersedes earlier full healing: preserve upgrades, set HP to 3 × HP tier, reset production timers, wait five seconds for regeneration/troops. A tie reduces defense to zero but does not transfer ownership until a later positive attack. Higher barracks qualify for lower-tier research; one active research job per barracks. Research can move to another eligible barracks if its host is lost, otherwise cancels without refund.

Conquest: losing an original king eliminates that participant. Their surviving territory and armies transfer to the captor (provisional elimination rule); all original kings must ultimately be controlled by the winner. Domination follows the board's stricter all-nodes rule, including neutrals. Archived graveyard and multiplayer are documented but inactive. Combat uses aggregate power as specified in the later Army Damage card; individual creature rosters/dragons are a future art/content expansion.

## Future growth

Add a faction entry with production/research/cost modifiers and spell IDs. Add a spell definition with its targeting schema and effect handler. Add node types with HP/travel modifiers. New stats need a definition plus the corresponding system consumer. New upgrade tracks add a definition, apply handler and state field. Add buttons through the UI registry and layout tokens. Future campaigns, save files, creature compositions, audio assets and deeper AI can be separate modules without changing the current rendering contract.
