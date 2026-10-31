import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame } from '../src/core/state.js';
import { step } from '../src/core/engine.js';
import { neighbors, maxHp, upgradeCost, owned } from '../src/core/selectors.js';
import { commitRoutes, findPath, sendOnce } from '../src/core/routing.js';
import { damage, arrive, capture, checkVictory } from '../src/core/combat.js';
import { upgrade } from '../src/core/economy.js';
import { research, cast, validTargets } from '../src/core/spells.js';
import { SPELLS } from '../src/content/spells.js';
const config = { mode:'conquest', faction:'elves', bots:[{faction:'dwarves',difficulty:'normal'}], nodesPerPlayer:12, seed:'Alderwatch' };
const game = changes => createGame({...config,...changes});
const king = g => g.nodes.find(n=>n.king===0);
function advance(g,seconds,bots=false){for(let i=0;i<Math.round(seconds/.05);i++)step(g,.05,bots);}
function labGame(faction='elves') {const g=game({faction});g.players[0].gold=1000;king(g).tiers.barracks=5;return g;}

test('all supported map sizes/seeds are connected, bounded and correctly populated',()=>{
  for(let p=2;p<=5;p++)for(const size of [8,12,16])for(let seed=0;seed<12;seed++){
    const g=game({bots:Array.from({length:p-1},()=>({faction:'random',difficulty:'normal'})),nodesPerPlayer:size,seed});
    assert.equal(g.nodes.length,p*size);assert.equal(g.nodes.filter(n=>n.king!==null).length,p);
    const seen=new Set([0]),q=[0];while(q.length)for(const n of neighbors(g,q.shift()))if(!seen.has(n)){seen.add(n);q.push(n);}
    assert.equal(seen.size,g.nodes.length);
    for(const n of g.nodes){const degree=neighbors(g,n.id).length;assert(degree>= (n.king!==null?2:1)&&degree<=4,`${p}/${size}/${seed} degree ${degree}`);}
    const special=g.nodes.filter(n=>n.type!=='regular').length,regular=g.nodes.filter(n=>n.king===null&&n.type==='regular').length;
    assert(special>=Math.floor(regular/8)&&special<=Math.max(2,2*Math.ceil(regular/8)));
  }
});
test('map is deterministic',()=>assert.deepEqual(game(),game()));
test('vacant nodes never earn, train or regenerate',()=>{const g=game(),n=g.nodes.find(n=>n.owner===null),army=n.army;advance(g,30);assert.equal(n.army,army);assert.equal(n.hp,0);});
test('gold upgrades wait until current cycle finishes; king price exact',()=>{const g=game(),n=king(g);advance(g,1);const cost=upgradeCost(g,n,'gold');assert.equal(cost,2.3);assert(upgrade(g,n.id,'gold',0));const balance=g.players[0].gold;advance(g,3.95);assert.equal(g.players[0].gold,balance);advance(g,.05);assert.equal(g.players[0].gold,balance+1);advance(g,4.5);assert.equal(g.players[0].gold,balance+2);});
test('gold tiers produce one gold every 5, 4.5, 4, 3.5 and 3 seconds',()=>{
  for(const [tier,seconds] of [[1,5],[2,4.5],[3,4],[4,3.5],[5,3]]){
    const g=game(),n=king(g);n.tiers.gold=tier;
    advance(g,5);const balance=g.players[0].gold;
    advance(g,seconds-.05);assert.equal(g.players[0].gold,balance,`T${tier} must not pay early`);
    advance(g,.05);assert.equal(g.players[0].gold,balance+1,`T${tier} pays at ${seconds}s`);
  }
});
test('barracks upgrade finishes old five-second power cycle first',()=>{const g=game(),n=king(g);advance(g,1);assert(upgrade(g,n.id,'barracks',0));advance(g,3.95);assert.equal(n.army,8);advance(g,.05);assert.equal(n.army,9);advance(g,5);assert.equal(n.army,12);});
test('king discount and dwarf tier five exception',()=>{const g=labGame('dwarves'),n=g.nodes.find(n=>n.owner===null);capture(g,n,0,5);n.tiers.barracks=4;assert(upgrade(g,n.id,'barracks',0));g.players[0].faction='elves';n.tiers.barracks=4;assert.equal(upgrade(g,n.id,'barracks',0),false);});
test('combat consumes army then HP; exact tie does not capture',()=>{const g=game(),n=g.nodes.find(n=>n.owner===null);n.army=5;n.hp=3;arrive(g,n,0,8);assert.equal(n.owner,null);assert.equal(n.army,0);assert.equal(n.hp,0);arrive(g,n,0,2);assert.equal(n.owner,0);assert.equal(n.army,2);assert.equal(n.hp,Math.min(maxHp(n),3*n.tiers.hp));});
test('capture retains tiers and restarts production',()=>{const g=game(),n=g.nodes.find(n=>n.owner===null);n.tiers={gold:3,barracks:2,hp:4};n.goldElapsed=1.2;capture(g,n,0,7);assert.deepEqual(n.tiers,{gold:3,barracks:2,hp:4});assert.equal(n.hp,12);assert.equal(n.goldElapsed,0);assert.equal(n.troopRunning,false);advance(g,9.9);assert.equal(n.army,7);advance(g,.1);assert.equal(n.army,10);});
test('siege finishes in-flight troop then halts; research pauses immediately',()=>{const g=labGame(),n=king(g);n.tiers.barracks=2;research(g,0,'regrowth');advance(g,1);damage(g,n,1);advance(g,3.95);assert.equal(n.army,7);const elapsed=g.players[0].research[0].elapsed;advance(g,.05);assert.equal(n.army,8);advance(g,.9);assert.equal(n.army,8);assert.equal(g.players[0].research[0].elapsed,elapsed);advance(g,.2);assert(g.players[0].research[0].elapsed>elapsed);});
test('shortest paths cannot pass through hostile nodes',()=>{const g=game(),n=king(g),near=neighbors(g,n.id)[0];const far=neighbors(g,near).find(i=>i!==n.id&&!neighbors(g,n.id).includes(i));assert.equal(findPath(g,n.id,far,0),null);capture(g,g.nodes[near],0,1);assert(findPath(g,n.id,far,0));});
test('one ordinary edge takes five seconds, never arrives early',()=>{const g=game(),n=king(g),dest=g.nodes[neighbors(g,n.id)[0]];dest.type='regular';dest.army=0;n.army=8;sendOnce(g,n.id,dest.id,100,0);advance(g,4.95);assert.equal(dest.owner,null);advance(g,.05);assert.equal(dest.owner,0);});
test('captured intermediate node intercepts an army',()=>{const g=game(),n=king(g),middle=g.nodes[neighbors(g,n.id)[0]],end=g.nodes[neighbors(g,middle.id).find(i=>i!==n.id&&!neighbors(g,n.id).includes(i))];capture(g,middle,0,0);middle.type='regular';n.tiers.barracks=0;n.troopRunning=false;sendOnce(g,n.id,end.id,100,0);middle.owner=1;middle.army=100;advance(g,5);assert.equal(g.waves.length,0);assert.equal(end.owner,null);});
test('research cannot duplicate queued or held cards, consumes gold, and completes',()=>{const g=labGame();assert(research(g,0,'regrowth'));assert.equal(research(g,0,'regrowth'),false);advance(g,7.5);assert(g.players[0].hand.includes('regrowth'));assert.equal(research(g,0,'regrowth'),false);assert(cast(g,0,'regrowth',[king(g).id]));assert(research(g,0,'regrowth'));});
test('capture cancels research if no eligible laboratory remains',()=>{const g=labGame();research(g,0,'regrowth');g.nodes.find(n=>n.king===0).owner=1;advance(g,.05);assert.equal(g.players[0].research.length,0);});
test('neutral and duplicate spell targets are forbidden',()=>{const g=labGame(),n=g.nodes.find(n=>n.owner===null);assert.equal(validTargets(g,0,'devastation',[n.id]),false);assert.equal(validTargets(g,0,'teleport',[king(g).id,king(g).id]),false);});
test('all 12 spell effects apply their specified outcomes',()=>{
  for(const s of Object.values(SPELLS)){
    const g=labGame(s.faction),a=king(g),b=g.nodes.find(n=>n.owner===null),enemy=g.nodes.find(n=>n.owner===1);capture(g,b,0,20);a.army=100;a.hp=2;enemy.army=80;enemy.hp=10;g.players[0].hand=[s.id];
    const targets={none:[],own:[a.id],enemy:[enemy.id],twoOwn:[a.id,b.id],twoAny:[a.id,enemy.id],mixed:[a.id,enemy.id],allOwn:[a.id,b.id]}[s.target];
    const beforeEdges=g.edges.length;assert(cast(g,0,s.id,targets),s.id);assert.equal(g.players[0].hand.length,0);
    switch(s.id){case'teleport':assert.equal(a.army,50);assert.equal(b.army,70);break;case'regrowth':assert.equal(a.hp,7);break;case'leyline':assert.equal(g.edges.length,beforeEdges+1);break;case'illusion':assert.equal(a.effects.hidden,12);break;case'devastation':assert.equal(enemy.army,40);assert.equal(enemy.hp,5);break;case'mines':assert.equal(g.players[0].gold,1300);break;case'bastion':assert.equal(a.tiers.gold,2);assert.equal(a.tiers.hp,3);break;case'defense':damage(g,a,900);assert.equal(a.hp,2);assert.equal(a.army,100);break;case'gear':assert.equal(a.army,135);break;case'catapult':assert.equal(a.army,75);assert.equal(enemy.army,55);break;case'treasures':assert.equal(enemy.effects.theft.owner,0);break;case'heat':assert.equal(a.effects.haste.factor,1.4);break;}
  }
});
test('Conquest king loss and Domination all-node victory',()=>{let g=game();capture(g,g.nodes.find(n=>n.king===1),0,3);checkVictory(g);assert.equal(g.result,'victory');g=game();capture(g,king(g),1,3);checkVictory(g);assert.equal(g.result,'defeat');g=game({mode:'domination'});g.nodes.filter(n=>n.owner===1).forEach(n=>n.owner=0);checkVictory(g);assert.equal(g.result,null);g.nodes.forEach(n=>n.owner=0);checkVictory(g);assert.equal(g.result,'victory');});
test('long matches preserve finite, nonnegative state; bots expand and defeat idle player',()=>{
  for(const difficulty of ['easy','normal','hard','nightmare']){
    const g=game({bots:[{faction:'goblins',difficulty}],seed:'campaign-'+difficulty});advance(g,600,true);
    for(const p of g.players)assert(Number.isFinite(p.gold)&&p.gold>=0);
    for(const n of g.nodes){assert(Number.isFinite(n.army)&&n.army>=0);assert(n.hp>=0&&n.hp<=maxHp(n)+1e-8);}
    assert(g.captures>1,`${difficulty} should expand`);
    if(difficulty==='nightmare')assert.equal(g.result,'defeat');
  }
});
test('Domination elimination removes pending armies and research',()=>{
  const g=game({mode:'domination'}),enemy=g.nodes.find(n=>n.owner===1);
  g.players[1].research=[{id:'mines',node:enemy.id,elapsed:0,duration:10}];
  g.waves.push({owner:1,power:5});enemy.owner=0;checkVictory(g);
  assert.equal(g.players[1].alive,false);assert.equal(g.players[1].research.length,0);
  assert.equal(g.waves.length,0);
});
