# Verification — first draft

## Controls update — 2026-10-31

`npm test`: **32 passed, 0 failed**. New coverage checks one-time sends, saved percentages, whole-point rounding, the first 1-second delay, 3-second repeat cooldowns, totals above 100%, ordered waiting on zero (including the user’s 100% / 100% / 50% example), recipient edits/removal, capture cleanup, blocked paths, and identical bot timing. Production, arrivals, teleportation and gear no longer trigger immediate recurring dispatches; tests confirm that they respect the new scheduler. Existing combat, economy, spell, victory and long-bot-match checks pass.

The initial browser verification attempt was blocked by a local-server timeout and unavailable Chrome access. The local server was subsequently launched outside the sandbox, and the updated game loaded successfully in the visible in-app browser. The user then playtested the game, reported that it feels much better, and approved committing the changes on 2026-10-31. This is user playtest feedback, not an automated check of every control; touch behavior remains unverified. The older browser checks below apply to the original controls.

All source JavaScript passed `node --check`. UI render checks passed for all four notches, the selected notch, saved recipient percentages, upgrade controls, drag feedback, and absence of commit/countdown controls. `npm run build` successfully rebuilt `dist/index.html` with 26 modules and 33 embedded images (approximately 111 KB).

## Timing update — 2026-10-31

`npm test`: **21 passed, 0 failed** after changing gold tiers to 5 / 4.5 / 4 / 3.5 / 3 seconds, base troop production to 5 seconds, and ordinary edge travel to 5 seconds. Timing checks cover all five gold tiers, the initial production cycle, deferred upgrades, capture/siege behavior, travel without early arrival, and intermediate interception. The existing long bot matches also pass. Faction, spell and terrain modifiers remain in effect. The browser checks below describe the earlier draft; the new pacing still needs human playtesting.

## Reference coverage

Read all five lists and all 45 cards, including two archived cards. Retrieved each card's full details. All card comment/checklist arrays were empty with no pagination remaining. Checked attachments individually on every card: none. Board custom fields: none. Six unnamed labels are unused. No additional design content was found in these fields. The description snapshot is preserved in `trello-snapshot.json`; linked readable text is in `TRELLO_REFERENCE.md`.

## Automated checks

`npm test`: **20 passed, 0 failed**. Map coverage spans 144 combinations of player count, map size and seed. Tests cover connectivity, degree constraints, special nodes, determinism, neutral inactivity, deferred gold and barracks upgrades, king pricing, dwarf tier limits, army-first combat, ties, capture timers, siege/research pause, shortest friendly paths, rotating remainders, 1.34-second travel, intermediate interception, research/card exclusivity, research cancellation, neutral exclusion, all 12 spell effects, both victory modes, and ten-minute simulated bot matches at all four difficulties.

All source JavaScript passed `node --check`. `npm run build` produces a single HTML file with 26 bundled modules and 33 embedded SVG images, approximately 104 KB, with no third-party runtime dependencies.

## Browser checks

Verified in the in-app Chromium browser using the local HTTP preview. Created a campaign, upgraded barracks, selected a source, right-clicked a recipient, committed the route, resumed, and observed Foxglove change ownership while future troops continued arriving. Observed rival expansion. Started Regrowth research, observed the card become ready, opened its preview, chose a valid target, cast, and confirmed the card returned to the research state. No browser errors were reported during these checks.

Loaded the standalone HTML build over HTTP successfully. Checked campaign setup and battlefield at the default sidebar viewport, 390×844 and 1440×900. Narrow viewports now start zoomed near the player's keep for readable nodes. Reset temporary viewport overrides after the review. `preview.png` shows the desktop battlefield.

Direct navigation to `file:` URLs is prohibited by the browser automation policy, so direct-file opening was not browser-automated. The standalone build embeds its JS, CSS and artwork and uses a classic script; it is prepared for manual opening in a browser. The user can also run `npm start` for the verified HTTP path.

## Review still needed

Balance and fun require human playtesting. Every WIP tuning value is provisional. AI is a tactical first draft, not the full multi-step Nightmare planner described in the board. No quantified CPU/memory performance benchmark has been completed. Art upload storage limits and clipboard behavior depend on the browser; the upload flow was implemented but not exercised with a user file. Creature-specific armies, dragon art, audio and match persistence remain future expansions. See the implementation plan for rule conflicts and explicit interpretations.
