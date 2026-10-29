# Trello reference — Node Based Warfare

Read 2026-10-28. Source: https://trello.com/b/UQE9j9Iv/node-based-warfare

## Nodes

### Basics

https://trello.com/c/JPzKWNf2/1-basics

(Section marker; no description.)

### Gold gen

https://trello.com/c/956FY8Po/4-gold-gen

Each node will produce a set amount of gold over x seconds

You can upgrade nodes to reduce the time it takes to produce the set amount of gold (x).

### Node hp

https://trello.com/c/8da3dgn4/5-node-hp

When a nodes hp hits zero the attacker gains control of the node and the node regenerates back to full health. A node has 2 sets of hp.

Base Hp: a nodes base hp depends on the tier of the nodes base hp. This hp depeletes only when there are no troops left on the node. The node hp starts to slowly regenerate when no troops on the node have been killed and no damage has been dealt to the node for 5 seconds. Regeneration stops if either happen before it reaches full hp.

Army Hp: Any troops stationed at the node act as a shield or buffer. If a node with an army is attacked the army will take the damage instead (weakest creatures first and strongest creatures last). The node will only take when the army stationed on the node has been defeated.

### King Node

https://trello.com/c/AEgQSONH/6-king-node

The king node is the node you start with indicated by a golden ring around it.

King nodes start with a tier 1 barracks and are 50% cheaper to upgrade than other nodes.

In Conquest if someone takes over your king node you lose

### Barracks Under Siege

https://trello.com/c/Mzua07uA/13-barracks-under-siege

A node with a barracks can only make troops if it has not taken damage and no army stationed at the node has taken damage for 5 seconds. If a node producing a troop is attacked, the node will halt troop production after the current troop is produced. It will only resume when both conditions have been met for 5 seconds.

A barracks preforming research on a spell will pause the research in proggress, resuming only when the two conditions have been met for 5 seconds.

### Upgrades

https://trello.com/c/mMmEpV6Z/2-upgrades

(Section marker; no description.)

### Upgrade Prices

https://trello.com/c/NOSa29gE/40-upgrade-prices

When upgrades are made (specifically gold and barracks) the upgrades kick in after the node finishes the current cycle. For example, if a node with tier 1 gold is 2 seconds away from making 1 gold, the node will create the gold in 2 seconds then make it’s next gold in 2.5 seconds.

Node upgrades cost gold and increase a stat of the node. The prices of each upgrade are as follows:

Gold Upgrade Cost: 4g - 7g - 15g - 35g

Barracks Upgrade Cost: 3g - 7g - 9g - 17g - 35g

Base Hp Upgrade Cost: 5g - 16g - 20g - 35g

### Gold gen

https://trello.com/c/IDjXsjjt/7-gold-gen

Nodes can be upgraded to produce gold faster. The lowest tier is 1 and the highest tier is 5. Gold production for each tier is as follows:

| T1 - 1g /3 seconds | T2 - 1g /2.5 seconds | T3 - 1g /2 seconds | T4 - 1g / 1.5 seconds | T5 - 1g / 1 second |

### Barracks

https://trello.com/c/WLzhhhPF/8-barracks

Each node is capable of producing troops. Higher tier barracks can produce more power each cycle and gain access to better spell research. Cycles are dependant on when the specific node was first eligble to produce troops. If a node is upgraded to a tier 1 barracks or a vacant node with a barracks is captured it’s cycle starts the moment the node is elligble to make troops. A cycle lasts 2 seconds, troops are produced at the end of the cycle. The lowest tier for barracks is 0 and the highest tier is 5. Only a king node may be upgraded to a tier 5 barracks, all other nodes have a cap at 4. The total power produced each cycle by tier is as follows:

| T1 - 1 power | T2 - 3 power | T3 - 5 power | T4 - 10 power | T5 - 19 power |

### Base Hp

https://trello.com/c/vGkdLYtm/12-base-hp

A node has a set amount of hp. You may upgrade a nodes hp in tiers. The lowest hp tier is 1 and the highest is 5. A node has base hp at each tier equal to the following:

| T1 - 5 hp | T2 - 10 hp | T3 - 20 hp | T4 - 35 hp | T5 - 55 hp |

### Types

https://trello.com/c/oOutcmqO/3-types

Not all nodes are the same. Node types are important to factor in as they can be used to your advantage.

### Regular Node

https://trello.com/c/gHaCt59g/45-regular-node

Regular Joe, no boons or flaws

### Mountains

https://trello.com/c/m1I5RfHW/9-mountains

Buff: Node hp is increased by (WIP) %

Debuff: Troops move (WIP) % slower when moving to or from a mountain

### River

https://trello.com/c/6igWmF6c/10-river

Debuff: Troops move slower by (WIP) % when moving to or from a river

### Graveyard [ARCHIVED]

https://trello.com/c/fJLr9nC9/11-graveyard

Troops entering this territory to capture it have a 25% chance of dying

## Factions

### Elves

https://trello.com/c/8uaTy8ie/14-elves

The elvish playstyle focuses on getting spells early and using them for planned attacks surprising opponents. However due to their pridful nature everything they do is a little more expensive.

Spell research: (WIP) % faster
Price of upgrades: (WIP) % higher

### Dwarves

https://trello.com/c/4l4FxZDB/15-dwarves

Dwarves are powerful foes, all sturdy and hardy they are stronger than most. Above all else they have tamed dragons to fight at their side. However, their calosul army takes longer to build.

Troop production speed: (WIP) % slower
Barracks Tiers - All nodes controled by dwarves can be upgraded to tier 5 barracks, not just the king nodes.

### Goblins

https://trello.com/c/NTxZNEXn/16-goblins

Goblins have plenty of bodies to go around. They produce troops a lot faster but they struggle coming up with powerful spells.

No tier 5 spell
Spell research: (WIP) % slower
Troop production speed: (WIP) % faster

## Spells

### Elves

https://trello.com/c/MfEijP4x/20-elves

Elves use their spells to take their opponents by surprise, or trick them into thinking the battle is in their favor.

### Magical Teleportation T2

https://trello.com/c/O8dfZL9h/26-magical-teleportation-t2

Move 50% of your power from one node you control to another instantly.

### Regrowth T2

https://trello.com/c/pd92LHwj/28-regrowth-t2

Heal target node you control for 50% of it’s hp

### Leyline T3

https://trello.com/c/qurp47Nw/29-leyline-t3

Create a segment between two target nodes

### Illusionary Magic T4

https://trello.com/c/tPEYuxLp/27-illusionary-magic-t4

Hide the power of all your nodes for (WIP) seconds.

### Devastating Magic T5

https://trello.com/c/xUOj1Ae7/30-devastating-magic-t5

Deal 50% to both army and node hp of a target node you don’t control

### Dwarves

https://trello.com/c/i7GjSKMG/21-dwarves

Dwarves take longer to create their army, but their magic helps them defend against intruders until the dragons hatch.

### Dwarven Mines T2

https://trello.com/c/FimR6hOx/31-dwarven-mines-t2

Gain (WIP) % of your current gold

### Dwarven Bastion T3

https://trello.com/c/rrGiiyQU/32-dwarven-bastion-t3

Target node you control upgrades its base hp and gold gen if possible. For each that is not possible add 10 power.

### Dwarven Defense T4

https://trello.com/c/uVjmqtKI/33-dwarven-defense-t4

Target node you control does not take damage for the next 5 seconds

### Dwarven Gear T5

https://trello.com/c/frxemVjk/34-dwarven-gear-t5

All nodes you control get extra power equal to (WIP) % of it’s current power

### Goblins

https://trello.com/c/TcTkE8YP/22-goblins

Goblins are not to good at thinking of spells. These were the best ideas they could come up with

### Goblin Catapult T2

https://trello.com/c/l3sRmD3U/35-goblin-catapult-t2

Choose one node you control and one node you do not control. Deal 25% of the power of the node you control to both nodes.

### Stolen Treasures T3

https://trello.com/c/JbAz4wUo/36-stolen-treasures-t3

Select a target node you don’t control. For the next 10 seconds all gold produced by that node goes to you instead.

### Goblins in Heat T4

https://trello.com/c/oxabpNQx/37-goblins-in-heat-t4

Increase your troop production speed by (WIP) % for (WIP) seconds

## Gamemodes

### Conquest

https://trello.com/c/8fTxXuQZ/23-conquest

The player must capture all other king nodes to win. If their king node is captured they lose.

### Domination

https://trello.com/c/A0kwQu7h/24-domination

The player must be gain control of all nodes on the map to win. They lose if they control zero nodes.

### Multiplayer [ARCHIVED]

https://trello.com/c/8L23JPru/25-multiplayer

(Section marker; no description.)

## General Information

### Selection Screen

https://trello.com/c/cTzrQa81/43-selection-screen

1. When the game loads up the player chooses a gamemode
2. After choosing a gamemode the player chooses the amount of bots to play against (1-4). If there are 2 or more it is a free for all, bots are not on the same team
3. After choosing number of bots the player chooses a faction for each bot (elves, dwarves, goblins, or random) and a difficulty (easy, normal, hard, nightmare)
4. After choosing the bot options the player may choose the size of the map (nodes per player)
5. Once all of these are done a play button will appear, pressing this will start the game.

### Bots and Difficulties

https://trello.com/c/yyHr1o8s/44-bots-and-difficulties

**Easy:** This bot should not be a push over but not particularly hard to beat. It should use basic strategies and spells but it should have a decent delay between choices and focus more on building itself up rather than attacking the others. It should not multi task and only do one thing at a time.

**Normal:** This bot should play into the strengths of it’s faction, use good stgrategies and be pretty responsive to what others are doing. It should be able to multi task and decide when it is better to attack vs build itself up. To beat this bot in a 1v1 the player should need to use the factions weakness against them or a good strategy.

**Hard:** This bot should do everything the normal bot does but better. Less delay, more multi tasking, and stronger strategy. In addition to this it should understand the players chosen faction and use their weakness against them. This bot should be difficult to beat.

**Nightmare:** This is the final boss persae. The bot should have very minimal delay and have peak multi tasking. It should think several steps ahead so that when it’s done with one thing its already moving onto another. It should use the best strategies around and use opponents weaknesses against them. This bot should be extremely difficult to beat and should require a lot of skill and some luck to win against.

### Map Generation

https://trello.com/c/5zwGqEcr/38-map-generation

The map should generate in a semi random fashion but in a fair way. King nodes should be generally far away from one another in the context of map size. Each king node should be connected to a minimum of 2 other nodes. Each regular node must be connected to a minimum of 1 other node. Each node can only be connected to a maximum of 4 other nodes.

Maps should be generated fairly but not symetrically and perfectly even. No one player should have an unfair advantage from the start but it’s ok if one player starts with a slight advantage.

For every 8 regular nodes there should be a minimum of 1 special node and a maximum of 2 special nodes.

King nodes start with a Tier 1 gold and barracks, and a Tier 2 base hp. When creating regular nodes, they have a 25% chance of recieving a random upgrade up to 2 times to either gold or base hp. In addition, nodes have a 25% chance of having a tier 1 barracks. Otherwise each vacant node starts with tier 1 gold, tier 1 base hp, and tier 0 barracks.

### Vacant Nodes

https://trello.com/c/NZiW7VoB/39-vacant-nodes

Vacant Nodes have 0 base hp and are given a army power, that does not increase, based on how many upgrades it has and how far away it is from the nearest king node.

The closer a vacant node is to a king node the lower it’s initial army power will be. The further away the node is from the nearest king node the higehr the initial army power will be. If a vacant node spawns with upgrades its inital army power will also be higher.

To capture a vacant node a player or bot must defeat the army on the node, then they gain control of it. Vacant nodes do not generate troops or gold for themselves nor do they regenerate. Once captured a node cannot go back to being vacant.

### Selecting and Upgrading Nodes

https://trello.com/c/xvn7Mm6v/41-selecting-and-upgrading-nodes

It is extremely important that the games ui is as easy and simple as possible. Games will come down to which user can click fast and think faster. The last thing we need is a user losing becuase they didn’t click through the ui menu fast enough.

Clicking anywhere (left or right) that has no ui automatically close any menus open and deselects anything you have selected. Left clicking on a selected node that you control deselects it. Right clicking on a selected node you don’t control deselects it.

Left clicking on a node you control will select it. A player may select more nodes by holding down shift while clicking. If shift is not being held down when left clicking on a node you control all nodes are deselected and the latest node you left clicked on is selected. Selected nodes get a thin blue ring around them indicating that they are selected.

Right clicking on a node you control will bring up a small neat menu to the right of the node with an option to upgrade the tier of the gold, barracks, or base hp, along with the price of each. If a node has maxed out a upgrade it will instead say MAX. Clicking on an option that pops up upgrades the node.

### Spells: Research and Casting

https://trello.com/c/rKi6DBxf/46-spells-research-and-casting

Spells can be researched for a certain amount of gold each. Spells have tiers, to research a spell of a specific tier you must have a barracks of that tier. Once a spell is finished researching the player recieves a “spell card”. A player cannot start research on a spell if they have that spell in thier hand.

To cast a spell the player must left click on the spell, which will bring it to the middle of the screen, and then left click it one more time to cast it. Once cast the effects happen as written.

A spell may use keywords such as ‘target node’, ‘you control’, and ‘you don’t control'. To select or deselect a node you control you must left click on it (left click on selected node to deselect). To select or deselect a node you don’t control you must right click on it (right click on a selected node you doint control to deselect). Once an acceptable amount of nodes are selected a ‘cast’ button will appear. Pressing it will confirm the targets and cast the spell.

When selecting spell targets the user cannot hold down shift when left clicking on their own. If the spell calls for several targets of nods they control selecting a second node they control does not deselect the first. If a spell calls for 3 target nodes you control and you select a fourth, the first node you selected is deselected and the fourth is selected. If you choose a fifth, the second is deselected and the fifth is selected etc. The same applies for target nodes you don’t control. Vacant nodes cannot be the target of spells and are never valid targets.

Spells that target all nodes you control, dont control, or all nodes in general, will highlight all valid targets and have the cast button ready. However the player can deselect any nodes they does not want to be affected.

Once a spell is cast the card disentagrates and disapears. By consequence, the player is now allowed to start the research of the spell once again.

### Troop Movement

https://trello.com/c/J4TI5088/42-troop-movement

Nodes with barracks constantly produce troops/army power. You can automatically move this power to other nodes you control or to attack nodes you don’t control.

First you must select a node or several nodes via left click or left click + shift respectively. Once a node or several nodes are selected you may then right click on another node to mark it as a recipiant. When you selected a node, all recipiant nodes of the selected node have a thin red ring around them. If several nodes are selected, only recipiants that all selected nodes have in common are indicated via the thin red ring. To unselect a node as a recipiant, simply right click on them again. To unselect all recipiants of a node, right click on any recipiant of the selected node while holding shift.

Nodes can have an unlimited amount of recipiants. Recipients recieve army power from the node evenly. If there are 2 recipiant nodes and the supplier node produces 10 power each cycle, the supplier node will send 5 power to each recipiant node each cycle. If there is an undivisable number of power (without a remainder) the supplier node alternates.
For example, if a supplier node creates 5 power each cycle and has 3 recipiant nodes (a, b, and c), the first cycle will send 2 to a and b, and only 1 to c. The second cycle will send 2 to b and c, and only 1 to a, and the third cycle will send 2 to c and a, and only 1 to b.

Recipients are not saved and existing troops are not distributed until the supplier node is unselected. Once unselected, recipient nodes are saved. If reselected current prosseccess do not pause, prosseccesses update only on the unselection of nodes.

Attacking nodes you don’t control functions exactly the same way. However, you can only send troops to nodes that are connected to a node you already control, and troops always take the shortest path to arrive at the recipiant node. Troops take exactly 1.34 seconds to move from one node to another connected node. This means that to travel from one node to a node 3 nodes away it would take roughly 4 seconds.

Consider this: you send army power to one node from 3 different nodes all 1 node away. However you send troops from node a to node d, then .3 seconds later you do the same for node b, then .3 seconds later you do the same for node c. The troops from node a will arrive .3 seconds before node b’s troops, and .6 seconds before node c’s troops.

All troops are sent immediatly to recipiant nodes. This means if there is 60 army power at a node, the second recipant nodes are selected and confirmed all 60 leave. If the node has a barracks, the second that army power is made it is sent off to recipient nodes.

### Army Damage

https://trello.com/c/WMzfOtoP/47-army-damage

Army damage is very simple. Nodes have two different health stats, army power and base hp. Army power is the first to go down when under attack, base hp only goes down if the node takes damage while it’s army power is at zero.

When army power moves to a node that army does not control, you subtract the army power of the smaller army from the bigger army. If the smaller army was the army coming in then nothing happens, the attack is blocked. If the smaller army was the army of the node then the node takes any army power it could not block as damage to its base hp. If the base hp reaches 0 and there is still left over unblocked army power, the attacking army gains control of the node and any remaining army power becomes the new army power of the node.

### Node Control Switches

https://trello.com/c/42uoaSfY/48-node-control-switches

When an army wins control of a node they did not control the nodes keeps all upgrades it had under the control of the other army. It’s base hp is set to 3*(Base hp Tier). If base hp tier was 5 the hp is set to 15. The node will then regenerate and produce troops as usual as long as regeneration/troop production criteria are met.

Gold generation and troop cycles restart and reset on capture. If a node with tier 1 gold upgrade was 1.5 seocnds away from making gold for the other army, on capture it is reset back to 0 seconds and will take 3 seconds to make gold.

If spell research was being preformed (for example T4 spell) for the other army before capture and this was their only Tier 4, the spell research is canceled.

