const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const output = ts.transpileModule(fs.readFileSync('src/app/mascot/byte-physics.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } });
const api = {};
vm.runInNewContext(output.outputText, { exports: api });
const bounds = { left: 8, right: 1200, ceiling: -700 };
const start = { x: 400, y: -500, vx: 0, vy: 0, bounced: false };
const drop = api.advanceBody(start, bounds, 1 / 60);
assert(drop.body.y > start.y && drop.body.y < 0, 'Release must accelerate downward without teleporting');
assert(drop.body.vy > 0);
assert.equal(start.y, -500, 'Simulation must not mutate its input');
function simulate(body, hz, duration) {
  let last;
  for (let i = 0; i < duration * hz; i++) { last = api.advanceBody(body, bounds, 1 / hz); body = last.body; }
  return last;
}
const slow = simulate(start, 30, .5).body;
const fast = simulate(start, 120, .5).body;
assert(Math.abs(slow.y - fast.y) < .001, 'Free fall must be independent of display refresh rate');
assert(Math.abs(slow.vy - fast.vy) < .001);
const landed = simulate({ ...start, vx: 450 }, 60, 5);
assert.equal(landed.body.y, 0);
assert.equal(landed.body.vy, 0);
assert.equal(landed.body.vx, 0);
assert(landed.settled, 'The bounce and horizontal inertia must settle');
const wall = api.advanceBody({ ...start, x: 1199, vx: 750 }, bounds, .05);
assert(wall.body.x <= bounds.right && wall.body.vx < 0);
const ceiling = api.advanceBody({ ...start, y: -699, vy: -900 }, bounds, .05);
assert.equal(ceiling.body.y, bounds.ceiling);
assert(ceiling.body.vy >= 0);
const background = api.advanceBody(start, bounds, 100);
assert(background.body.y < 0, 'A delayed background frame must be clamped');
const small = { left: 8, right: 8, ceiling: 0 };
const constrained = api.advanceBody(start, small, .02);
assert.equal(constrained.body.x, 8);
assert.equal(constrained.body.y, 0);
console.log('Byte physics: gravity, refresh rates, damping, walls, ceiling and delayed frames passed.');
