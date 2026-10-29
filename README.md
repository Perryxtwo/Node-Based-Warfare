# Node Based Warfare

A browser-based, single-player fantasy strategy game. Built from the **Node Based Warfare** Trello board and the project `AGENTS.md`.

## Play locally

**Easiest:** open `dist/index.html` in a browser. This standalone build includes all code, styles and artwork and works without a server. Rebuild it after source edits with `npm run build`.

Requires Node.js 20 or newer. No packages or build are required.

```sh
npm start
```

Open **http://127.0.0.1:4173**. Keep the terminal running while playing. The server binds only to your own computer. For static hosting, upload `dist/index.html`, or upload the modular source files with the same directory structure.

```sh
npm test
```

## How to play

Choose Conquest or Domination, your faction, 1–4 independent rivals, their factions/difficulties, a map size and seed. Left-click your node; Shift-click for multiple sources. Right-click recipients. Click empty ground or press Enter to commit. Existing troops leave immediately and future troops follow. Right-click a selected friendly node for upgrades, or use the command panel. Space pauses. Zoom and drag empty land to pan. Touch players can use the tap-to-route mode and Commit orders.

Upgrade barracks to unlock spell research. Ready cards open a preview; choose targets and confirm. Left-click friendly spell targets and right-click enemy spell targets. Vacant nodes cannot be targeted. Field guide and Art workshop pause the match; Resume continues it. Reloading starts a fresh campaign; match saving is not included yet.

## Change the game

| Change | File |
|---|---|
| WIP balance, faction modifiers, starting resources, spell prices/times | `src/content/balance.js` |
| Gold, barracks and HP tiers/costs | `src/content/upgrades.js` |
| Factions and their limits | `src/content/factions.js` |
| Node terrain | `src/content/node-types.js` |
| Spell definitions and targeting | `src/content/spells.js` |
| Individual spell effects | `src/core/spells.js` (`EFFECTS`) |
| Bot decision cadence and tactical behavior | `src/core/ai.js` |
| UI button text, classes, style overrides and references | `src/content/ui.js` |
| Numeric fonts, colors, panel widths, button shape/size | `styles/tokens.css` |
| Screen layout and component styling | `styles/game.css` |
| Sprites and icon paths | `src/ui/assets.js`, `assets/` |

**F2 / UI references:** hover any annotated element to see its stable ID; click to copy it. Example requests: “Make `node.upgrade.gold` wider” or “Change `spell.regrowth` artwork.” Node identifiers such as `map.node.N09` remain stable within a seeded map. Dynamic repeated controls share a semantic component ID where they represent the same action.

**Artwork:** replace the named files, point the manifest at downloaded images, or upload via Art workshop. Browser uploads are local to that browser and limited to 1.5 MB each; storage capacity may limit the total. Use the same visual silhouette and transparent backgrounds for node art. The manifest also covers troops, gold and spell icons. No remote fonts or image services are required.

## Documentation and scope

- [Implementation plan and visual mockup](docs/IMPLEMENTATION_PLAN.md)
- [Complete board reference, including archived cards](docs/TRELLO_REFERENCE.md)
- [Source snapshot](docs/trello-snapshot.json)
- [UI reference and extension guide](docs/EXTENDING.md)
- [Verification record](docs/VERIFICATION.md)

This is a playable first draft. WIP balance is explicitly provisional. Bots use tactical heuristics; advanced multi-step Nightmare planning is future work. Combat uses aggregate army power, following the newer Army Damage card. Individual creature rosters, dragon illustrations, sound, saved matches, and multiplayer are not implemented. The archived graveyard idea is inactive. The game is developed locally; no hosting deployment or GitHub push is implied by the local files.
