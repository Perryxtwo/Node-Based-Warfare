# NBW Itinerary

This file records proposed game changes before implementation. Incomplete changes stay on the to-do list and in the dated change record. Completed changes move to the completed list, ordered from oldest to newest. When gameplay or UI importance is not specified, record it as **None** or assume **Low**; use higher importance only when explicitly stated.

## To-Do List — Ranked by Importance

1. **Overhaul the UI so the map fills the screen** — Remove the left sidebar and bottom spell sidebar.  
   `Gameplay: Low · UI: Medium-high`
2. **Prepare the game for future expansion** — Prime the game for faction generals, troop types, and a campaign once the core game is in a good place.  
   `Gameplay: Low · UI: None`

## Change Record — Grouped by Date Added

### 2026-10-29

- **Slow down the game pace** *(Completed 2026-10-31; Gameplay: Extreme · UI: None)*  
  Gold tiers now take 5 / 4.5 / 4 / 3.5 / 3 seconds per gold. Troop production and ordinary edge travel use a 5-second base; existing modifiers apply. The user playtested the updated game and approved committing these changes on 2026-10-31.
- **Improve the controls** *(Completed 2026-10-31; Gameplay: High · UI: None)*  
  Added percentage drag sends, automatic recurring requests and upgrades on selection. Bots use the same request delays. The user playtested the controls, reported that they feel much better, and approved committing them on 2026-10-31. Touch behavior remains unverified.
- **Overhaul the UI so the map fills the screen** *(Incomplete; Gameplay: Low · UI: Medium-high)*  
  Remove the left sidebar and bottom spell sidebar.
- **Prepare the game for future expansion** *(Incomplete; Gameplay: Low · UI: None)*  
  Prime the game for faction generals, troop types, a campaign, etc., once the core game is in a good place.

## Completed Changes — Oldest to Newest

- **2026-10-31 — Slow down the game pace** — Updated gold tier timings and base troop production/travel to the requested values. Core simulation behavior is unchanged; all 21 automated tests pass.
- **2026-10-31 — Improve the controls** — Added the 25/50/75/100% meter (mouse wheel, arrows and clickable notches), one-time drag sends, and a right-side upgrade menu on selection. Recurring recipients save their selected percentage, first request after 1 second and request again 3 seconds after successful sends. Requests take turns, round down and wait on zero; percentages above 100% total are allowed. No visible send countdowns. Preserved right-click toggles, Shift multi-select/clear and tap-to-route. All 32 simulation tests pass. The game was launched in the in-app browser, and the user playtested and approved committing the update. Touch behavior remains unverified.
