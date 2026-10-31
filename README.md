# Outback Idle

An Australian-themed idle RPG, built step by step while learning HTML, CSS and JavaScript.

## Current status

Planning repository. No playable game has been implemented yet. Outback Idle is a working title.

## Core idea

Learn skills, unlock related trades and craft better equipment. Mining supplies ore, smelting produces bars, and tool and weapon crafting turn those bars into useful gear. Better tools support further gathering progression. Combat will be added later.

## Australian direction

An original bush workshop setting with eucalyptus greens, charcoal panels, sandstone highlights and rusty red earth. Proposed resources and locations include copper and iron deposits, river gums, ironbark woodland and outback mining country. These are design ideas rather than final game rules.

The supplied Melvor Idle screenshot is layout inspiration: a skill sidebar, top-level XP summary, activity cards, visible requirements and progress bars. Create original styling and artwork rather than reusing Melvor assets or branding.

## First playable scope

- Mining: copper takes 5 seconds per ore; iron takes 7 seconds per ore.
- One active action at a time. Clicking the active activity stops it; selecting another switches activities and resets the action progress.
- Inventory and skill XP, with clearly displayed unlock requirements.
- Smelting recipes that consume ore and produce bars.
- Tool crafting, followed by weapon crafting.
- A craftable pickaxe that improves gathering.
- Local saving; reliable elapsed-time and offline progression in a later milestone.

## Learning roadmap

1. Build the HTML layout and Australian colour palette.
2. Add mining data, start/stop controls and a single active timer.
3. Display action progress, inventory, XP and levels.
4. Add smelting and validate recipe ingredients before consuming them.
5. Add crafting, equipment and skill unlocks.
6. Save and restore progress, then introduce elapsed-time processing and capped offline rewards.
7. Balance the gathering/crafting loop and expand Australian resources.
8. Design combat around the crafted equipment.

Keep each step small, understandable and playable before adding the next system.

## Planned file structure

- `index.html`: interface structure.
- `style.css`: layout, colours and responsive styling.
- `game.js`: initial state, action timing and interface updates.

Start with plain browser JavaScript and no framework or build tools. Separate data and game logic into additional files as the project grows.
