import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame } from '../src/core/state.js';
import { step } from '../src/core/engine.js';
import { capture, arrive } from '../src/core/combat.js';
import { commitRoutes, sendOnce, ordersStep } from '../src/core/routing.js';
import { EFFECTS } from '../src/core/spells.js';

function fixture() {
  const g = createGame({mode:'domination', faction:'elves', bots:[{faction:'goblins',difficulty:'normal'}], nodesPerPlayer:12, seed:'orders'});
  // An isolated four-node star avoids combat and returning armies while testing the clocks.
  const [source, ...targets] = g.nodes.filter(n => n.king === null).slice(0, 4);
  for (const n of [source, ...targets]) {
    capture(g, n, 0, 0); n.type = 'regular'; n.tiers.barracks = 0; n.troopRunning = false;
  }
  g.edges = targets.map(n => [source.id, n.id]);
  source.army = 100;
  return {g, source, targets};
}
function advance(g, seconds) { for (let i=0; i<Math.round(seconds/.05); i++) step(g, .05, false); }
const sent = g => g.waves.map(w => ({to:w.path.at(-1), power:w.power}));

test('one-time sends use the current army, round down, and leave recurring orders alone',()=>{
  const {g,source,targets:[a,b]}=fixture();source.army=11.5;
  commitRoutes(g,source.id,[{to:a.id,percent:75}],0);
  const routes=structuredClone(source.routes);
  assert(sendOnce(g,source.id,b.id,25,0));
  assert.deepEqual(sent(g),[{to:b.id,power:2}]);assert.equal(source.army,9.5);
  assert.deepEqual(source.routes,routes);
  commitRoutes(g,source.id,[],0);g.waves=[];advance(g,10);
  assert.equal(g.waves.length,0);assert.equal(source.army,9.5);
});
test('one-time sends reject invalid targets, foreign sources and amounts below one',()=>{
  const {g,source,targets:[a]}=fixture();source.army=3;
  assert.equal(sendOnce(g,source.id,a.id,25,0),false);
  assert.equal(sendOnce(g,source.id,source.id,100,0),false);
  assert.equal(sendOnce(g,source.id,a.id,100,1),false);
  assert.equal(sendOnce(g,source.id,a.id,30,0),false);
  g.edges=[];assert.equal(sendOnce(g,source.id,a.id,100,0),false);
  assert.equal(source.army,3);assert.equal(g.waves.length,0);assert.deepEqual(source.routes,[]);
});
test('first recurring send waits one second; repeats wait three seconds',()=>{
  const {g,source,targets:[a]}=fixture();
  commitRoutes(g,source.id,[{to:a.id,percent:50}],0);
  advance(g,.95);assert.equal(g.waves.length,0);assert.equal(source.army,100);
  advance(g,.05);assert.deepEqual(sent(g),[{to:a.id,power:50}]);
  advance(g,2.95);assert.equal(g.waves.length,1);
  advance(g,.05);assert.deepEqual(sent(g),[{to:a.id,power:50},{to:a.id,power:25}]);
});
test('percentages may exceed 100% in total; each request uses the remaining army in order',()=>{
  const {g,source,targets:[a,b,c]}=fixture();
  commitRoutes(g,source.id,[{to:a.id,percent:50},{to:b.id,percent:75},{to:c.id,percent:25}],0);
  advance(g,1);
  assert.deepEqual(sent(g),[{to:a.id,power:50},{to:b.id,power:37},{to:c.id,power:3}]);
  assert.equal(source.army,10);
});
test('100%, 100%, 50% waits for production in order without skipping a zero request',()=>{
  const {g,source,targets:[a,b,c]}=fixture();source.army=8;
  source.tiers.barracks=1;source.troopRunning=true;source.troopDuration=5;source.troopElapsed=0;source.cyclePower=1;
  const history=[];
  const tickTo = time => {
    while(g.time+.001<time){
      step(g,.05,false);
      for(const w of g.waves)if(!history.some(h=>h.id===w.id))history.push({id:w.id,to:w.path.at(-1),power:w.power,time:w.created});
    }
  };
  commitRoutes(g,source.id,[{to:a.id,percent:100},{to:b.id,percent:100},{to:c.id,percent:50}],0);
  tickTo(1);assert.deepEqual(history.map(h=>[h.to,h.power]),[[a.id,8]]);
  tickTo(5);assert.deepEqual(history.map(h=>[h.to,h.power]),[[a.id,8],[b.id,1]]);
  tickTo(10);assert.equal(history.length,2);assert.equal(source.army,1);
  tickTo(15);assert.deepEqual(history.map(h=>[h.to,h.power]),[[a.id,8],[b.id,1],[c.id,1],[a.id,1]]);
  assert(Math.abs(history[0].time-1)<1e-8);assert(Math.abs(history[1].time-5)<1e-8);
});
test('a zero request retries as soon as its percentage becomes a whole point',()=>{
  const {g,source,targets:[a,b]}=fixture();source.army=1;
  commitRoutes(g,source.id,[{to:a.id,percent:25},{to:b.id,percent:100}],0);
  advance(g,1);assert.equal(g.waves.length,0);assert.equal(source.routeCursor,0);
  source.army=3.99;advance(g,.05);assert.equal(g.waves.length,0);
  source.army=4;advance(g,.05);
  assert.deepEqual(sent(g),[{to:a.id,power:1},{to:b.id,power:3}]);
});
test('editing recipients preserves existing percentages, order and clocks',()=>{
  const {g,source,targets:[a,b,c]}=fixture();
  commitRoutes(g,source.id,[{to:a.id,percent:50},{to:b.id,percent:25}],0);
  advance(g,.5);
  commitRoutes(g,source.id,[...source.routes,{to:c.id,percent:75}],0);
  assert.deepEqual(source.routes.map(r=>[r.to,r.percent,r.nextSend]),[[a.id,50,1],[b.id,25,1],[c.id,75,1.5]]);
  advance(g,.5);assert.deepEqual(sent(g),[{to:a.id,power:50},{to:b.id,power:12}]);
  advance(g,.5);assert.deepEqual(sent(g).at(-1),{to:c.id,power:28});
  commitRoutes(g,source.id,source.routes.filter(r=>r.to!==b.id),0);
  assert.deepEqual(source.routes.map(r=>r.to),[a.id,c.id]);
  commitRoutes(g,source.id,[],0);g.waves=[];advance(g,5);assert.equal(g.waves.length,0);
});
test('removing the waiting recipient advances to the next survivor; re-adding puts it last',()=>{
  const {g,source,targets:[a,b,c]}=fixture();
  commitRoutes(g,source.id,[a.id,b.id,c.id],0);advance(g,1);
  assert.equal(source.routes[source.routeCursor].to,b.id);
  commitRoutes(g,source.id,source.routes.filter(r=>r.to!==b.id),0);
  assert.equal(source.routes[source.routeCursor].to,c.id);
  commitRoutes(g,source.id,[...source.routes,{to:b.id,percent:50}],0);
  assert.deepEqual(source.routes.map(r=>r.to),[a.id,c.id,b.id]);
});
test('capture clears pending orders and no old order can spend the new owner army',()=>{
  const {g,source,targets:[a]}=fixture();
  commitRoutes(g,source.id,[a.id],0);capture(g,source,1,20);
  advance(g,4);assert.deepEqual(source.routes,[]);assert.equal(source.routeCursor,0);
  assert.equal(g.waves.length,0);assert.equal(source.army,20);
});
test('production, reinforcements and spells do not bypass recurring cooldowns',()=>{
  const {g,source,targets:[a,b]}=fixture();
  commitRoutes(g,source.id,[a.id],0);advance(g,1);assert.equal(g.waves.length,1);
  arrive(g,source,0,20);EFFECTS.gear(g,0,[source]);b.army=10;EFFECTS.teleport(g,0,[b,source]);
  assert.equal(g.waves.length,1);assert.equal(source.army,32);
  source.tiers.barracks=1;source.troopRunning=true;source.troopDuration=5;source.troopElapsed=4.95;source.cyclePower=1;
  advance(g,.05);assert.equal(g.waves.length,1);assert.equal(source.army,33);
  advance(g,2.95);assert.equal(g.waves.length,2);assert.equal(source.army,0);
});
test('unreachable recipients do not block other orders and resume when a path returns',()=>{
  const {g,source,targets:[a,b]}=fixture();
  commitRoutes(g,source.id,[{to:a.id,percent:50},{to:b.id,percent:50}],0);
  g.edges=g.edges.filter(edge=>!edge.includes(a.id));advance(g,1);
  assert.deepEqual(sent(g),[{to:b.id,power:50}]);
  g.edges.push([source.id,a.id]);advance(g,.05);
  assert.deepEqual(sent(g).at(-1),{to:a.id,power:25});
});
test('bot orders use the same initial delay and repeat clock',()=>{
  const {g,source,targets:[a]}=fixture();capture(g,source,1,10);
  commitRoutes(g,source.id,[a.id],1);advance(g,.95);assert.equal(g.waves.length,0);
  advance(g,.05);assert.equal(g.waves.length,1);assert.equal(g.waves[0].owner,1);
  source.army=8;advance(g,2.95);assert.equal(g.waves.length,1);
  advance(g,.05);assert.equal(g.waves.length,2);
});
