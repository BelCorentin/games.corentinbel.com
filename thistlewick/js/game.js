import * as A from "./art.js";
import { CLUES, CLUE_ORDER, TOPICS, NPCS, OBJECTS, INTRO, ENDING } from "./story.js";
import * as LLM from "./llm.js";

const TS = A.TS;
const $ = (s) => document.querySelector(s);
const params = new URLSearchParams(location.search);
const WREN_CTX = "Moss is the 12-year-old twin of Wren. Wren went missing last night after a big storm. Their mum, Ida, died four years ago. You live in Thistlewick, a small farming village.";

// ---------------------------------------------------------------- maps
function grid(w, h, ch) { return Array.from({ length: h }, () => Array(w).fill(ch)); }
function fill(g, x0, y0, x1, y1, ch) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) g[y][x] = ch; }

function buildVillage() {
  const W = 40, H = 32, g = grid(W, H, ".");
  fill(g, 0, 0, W - 1, 0, "T"); fill(g, 0, H - 1, W - 1, H - 1, "T"); fill(g, 0, 0, 0, H - 1, "T"); fill(g, W - 1, 0, W - 1, H - 1, "T");
  // hill: tree line and scattered trees
  for (let x = 1; x < W - 1; x++) if (x < 10 || x > 26 || x % 4 === 0) g[1][x] = "T";
  for (const [x, y] of [[3, 3], [6, 5], [2, 7], [28, 4], [31, 6], [35, 3], [37, 7], [26, 7], [5, 2], [33, 2]]) g[y][x] = "T";
  // the mill road on the hill
  fill(g, 10, 5, 10, 8, "s"); fill(g, 11, 5, 17, 5, "s");
  // stream
  fill(g, 1, 9, W - 2, 10, "~");
  g[9][10] = "="; g[10][10] = "=";      // washed-out bridge
  g[9][33] = "L"; g[10][33] = "L";      // fallen tree
  g[11][33] = "B";                      // brambles hiding it
  for (const [x, y] of [[32, 11], [34, 11], [35, 11], [31, 11], [32, 12], [35, 12]]) g[y][x] = "T";
  // north field
  fill(g, 3, 13, 14, 16, "f");
  fill(g, 2, 12, 15, 12, "F"); fill(g, 2, 17, 15, 17, "F"); fill(g, 2, 12, 2, 17, "|"); fill(g, 15, 12, 15, 17, "|");
  g[12][10] = "s"; g[11][10] = "s"; g[17][8] = ":";
  // paths
  fill(g, 3, 23, 36, 23, ":"); fill(g, 20, 13, 20, 30, ":"); fill(g, 8, 18, 10, 18, ":"); fill(g, 10, 18, 10, 22, ":"); fill(g, 28, 19, 28, 22, ":");
  fill(g, 15, 28, 19, 28, ":"); fill(g, 21, 18, 27, 18, ":");
  // buildings (solid) + doors
  fill(g, 3, 19, 8, 22, "H"); g[22][5] = "D";
  fill(g, 25, 14, 32, 18, "H"); g[18][28] = "D";
  fill(g, 13, 24, 17, 27, "H"); g[27][15] = "D";
  fill(g, 15, 1, 21, 4, "H");             // mill
  // village trees
  for (const [x, y] of [[36, 14], [37, 19], [23, 26], [30, 26], [34, 28], [2, 26], [5, 28], [9, 27], [37, 25], [24, 30], [11, 20], [36, 30], [1, 20]]) g[y][x] = "T";
  return {
    id: "village", w: W, h: H, g,
    houses: [
      { x: 3, y: 19, w: 6, h: 4, roof: ["#d9644a", "#b84c38", "#f08a6a"], windows: [[3, 21], [7, 21]], door: [5, 22] },
      { x: 25, y: 14, w: 8, h: 5, roof: ["#3f8a8a", "#2f6e70", "#5fb0ac"], windows: [[26, 17], [30, 17], [31, 17]], door: [28, 18], lit: true },
      { x: 13, y: 24, w: 5, h: 4, roof: ["#4a6ab0", "#3a5590", "#6a8ad0"], windows: [[13, 26], [17, 26]], door: [15, 27] },
    ],
    mill: { x: 15, y: 1, w: 7, h: 4 },
    doors: { "5,22": { to: "home", x: 5, y: 7, dir: "up" }, "28,18": { to: "inn", x: 7, y: 8, dir: "up" }, "15,27": { locked: "The post house door is locked. Abel is outside, by the path." } },
    objects: [
      { x: 18, y: 20, kind: "well", solid: true, ex: "well" },
      { x: 24, y: 19, kind: "sign", solid: true, ex: "sign_inn" },
      { x: 12, y: 28, kind: "sign", solid: true, ex: "sign_post" },
      { x: 11, y: 6, kind: "sign", solid: true, ex: "sign_mill" },
      { x: 9, y: 21, kind: "barrel", solid: true, ex: "barrel" },
      { x: 10, y: 13, kind: "prints", solid: false, ex: "prints" },
      { x: 10, y: 9, kind: "none", solid: true, ex: "bridge" },
      { x: 10, y: 10, kind: "none", solid: true, ex: "bridge" },
      { x: 33, y: 11, kind: "none", solid: false, ex: "bush" },
      { x: 12, y: 2, kind: "vat", solid: true, ex: null },
      { x: 13, y: 3, kind: "vat", solid: true, ex: null },
      { x: 23, y: 6, kind: "millstone", solid: true, ex: null },
      { x: 24, y: 6, kind: "millstone", solid: true, ex: null },
      { x: 24, y: 7, kind: "millstone_t", solid: true, ex: "millstone" },
    ],
    entities: [
      { id: "dad", kind: "npc", x: 8, y: 18, dir: "down" },
      { id: "abel", kind: "npc", x: 18, y: 28, dir: "down" },
      { id: "bramble", kind: "dog", x: 22, y: 22, dir: "left", wander: [21, 19, 26, 25] },
      { id: "clover", kind: "sheep", blue: true, x: 6, y: 14, dir: "right", wander: [3, 13, 14, 16] },
      { id: "sheep1", kind: "sheep", x: 12, y: 15, dir: "left", wander: [3, 13, 14, 16] },
      { id: "sheep2", kind: "sheep", x: 4, y: 16, dir: "right", wander: [3, 13, 14, 16] },
      { id: "sheep3", kind: "sheep", x: 13, y: 13, dir: "left", wander: [3, 13, 14, 16] },
      { id: "wren", kind: "npc", x: 22, y: 7, dir: "left", look: "wren" },
    ],
  };
}

function buildRoom(id, W, H, door, furniture, entities, exit) {
  const g = grid(W, H, "w");
  fill(g, 1, 2, W - 2, H - 2, "o");
  g[H - 1][door] = "D";
  return { id, w: W, h: H, g, indoor: true, houses: [], objects: furniture, entities, doors: { [`${door},${H - 1}`]: exit } };
}

const MAPS = {
  village: buildVillage(),
  home: buildRoom("home", 11, 9, 5, [
    { x: 2, y: 2, kind: "bed", solid: true, ex: "bed" },
    { x: 4, y: 2, kind: "desk", solid: true, ex: "desk" },
    { x: 8, y: 2, kind: "mybed", solid: true, ex: "mybed" },
    { x: 6, y: 2, kind: "stove", solid: true, ex: "stove" },
    { x: 5, y: 5, kind: "rug", solid: false, ex: null },
    { x: 8, y: 5, kind: "table", solid: true, ex: null },
  ], [], { to: "village", x: 5, y: 23, dir: "down" }),
  inn: buildRoom("inn", 14, 10, 7, [
    { x: 2, y: 3, kind: "counter", solid: true, ex: null, reach: true },
    { x: 3, y: 3, kind: "counter", solid: true, ex: null, reach: true },
    { x: 4, y: 3, kind: "counter", solid: true, ex: null, reach: true },
    { x: 5, y: 3, kind: "counter", solid: true, ex: null, reach: true },
    { x: 11, y: 2, kind: "fire", solid: true, ex: "fire" },
    { x: 3, y: 6, kind: "table", solid: true, ex: null },
    { x: 9, y: 6, kind: "table", solid: true, ex: null },
  ], [
    { id: "marta", kind: "npc", x: 3, y: 2, dir: "down" },
    { id: "tobiah", kind: "npc", x: 10, y: 3, dir: "right" },
  ], { to: "village", x: 28, y: 19, dir: "down" }),
};

// ---------------------------------------------------------------- state
const SAVE_KEY = "thistlewick-save-v1";
let S = freshState();
function freshState() { return { map: "village", x: 8, y: 21, dir: "up", clues: {}, unlocked: {}, told: {}, done: false }; }
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {} }
function loadSave() { try { const s = JSON.parse(localStorage.getItem(SAVE_KEY)); return s && s.map ? s : null; } catch (e) { return null; } }

let map, ents = [], player;
function enterMap(id, x, y, dir) {
  map = MAPS[id]; S.map = id; S.x = x; S.y = y; S.dir = dir;
  ents = map.entities.map((e) => ({ ...e, px: e.x * TS, py: e.y * TS, step: 0, moving: null, timer: 1 + Math.random() * 2 }));
  applyUnlocks();
  player = { x, y, px: x * TS, py: y * TS, dir, step: 0, moving: null, anim: 0 };
  prerender();
  save();
}
function applyUnlocks() {
  if (S.unlocked.crossing && map.id === "village") {
    const dog = ents.find((e) => e.id === "bramble");
    if (dog) { dog.x = 35; dog.y = 8; dog.px = dog.x * TS; dog.py = dog.y * TS; dog.wander = [34, 5, 37, 8]; }
  }
}

// ---------------------------------------------------------------- rendering
const cv = $("#game"), ctx = cv.getContext("2d");
let VW = 320, VH = 200, SCALE = 3;
function resize() {
  SCALE = Math.max(2, Math.round(Math.min(innerWidth / 300, innerHeight / 190)));
  VW = Math.ceil(innerWidth / SCALE); VH = Math.ceil(innerHeight / SCALE);
  cv.width = VW; cv.height = VH; ctx.imageSmoothingEnabled = false;
}
addEventListener("resize", resize); resize();

let layer = document.createElement("canvas"), lctx = layer.getContext("2d");
function tileAt(x, y) { return x < 0 || y < 0 || x >= map.w || y >= map.h ? "T" : map.g[y][x]; }
const hash = (x, y) => { let h = Math.imul(x * 73856093 ^ y * 19349663, 2654435761) >>> 0; return (h % 1000) / 1000; };

function drawTile(c, ch, X, Y, x, y, t) {
  switch (ch) {
    case ".": A.drawGrass(c, X, Y, x, y, hash(x, y) < 0.07); break;
    case ":": A.drawPath(c, X, Y, x, y); break;
    case "f": A.drawField(c, X, Y, x, y); break;
    case "s": A.drawStone(c, X, Y, x, y); break;
    case "T": A.drawTree(c, X, Y, x, y); break;
    case "F": A.drawFence(c, X, Y, x, y, false); break;
    case "|": A.drawFence(c, X, Y, x, y, true); break;
    case "B": A.drawBush(c, X, Y, x, y, !!S.unlocked.crossing); break;
    case "H": A.drawGrass(c, X, Y, x, y, false); break;
    case "D": map.indoor ? A.drawFloor(c, X, Y, x, y) : A.drawPath(c, X, Y, x, y); break;
    case "o": A.drawFloor(c, X, Y, x, y); break;
    case "w": A.drawWallIn(c, X, Y, x, y); break;
    default: A.drawGrass(c, X, Y, x, y, false);
  }
}
const WATERY = new Set(["~", "=", "L"]);
function drawWaterTile(c, ch, X, Y, x, y, t) {
  const up = tileAt(x, y - 1), dn = tileAt(x, y + 1);
  if (ch === "L") A.drawLog(c, X, Y, x, y, t);
  else if (ch === "=") A.drawBridgeBroken(c, X, Y, x, y, t, !WATERY.has(up));
  else if (!WATERY.has(up)) A.drawBank(c, X, Y, x, y, t, true);
  else if (!WATERY.has(dn)) A.drawBank(c, X, Y, x, y, t, false);
  else A.drawWater(c, X, Y, x, y, t);
}

function prerender() {
  layer.width = map.w * TS; layer.height = map.h * TS;
  lctx.imageSmoothingEnabled = false;
  for (let y = 0; y < map.h; y++) for (let x = 0; x < map.w; x++) {
    const ch = map.g[y][x];
    if (!WATERY.has(ch)) drawTile(lctx, ch, x * TS, y * TS, x, y, 0);
  }
  if (map.indoor) for (let x = 0; x < map.w; x++) { A.drawWindow(lctx, x * TS + 3, 3, map.id === "inn"); x += 3; }
  for (const h of map.houses) {
    A.drawHouse(lctx, h.x * TS, h.y * TS, h.w, h.h, h.roof);
    for (const [wx, wy] of h.windows) A.drawWindow(lctx, wx * TS + 3, wy * TS + 2, h.lit);
    A.drawDoor(lctx, h.door[0] * TS, h.door[1] * TS);
  }
  if (map.mill) A.drawMill(lctx, map.mill.x * TS, map.mill.y * TS, map.mill.w, map.mill.h);
  for (const o of map.objects) {
    const X = o.x * TS, Y = o.y * TS;
    if (o.kind === "well") A.drawWell(lctx, X, Y);
    else if (o.kind === "sign") A.drawSign(lctx, X, Y);
    else if (o.kind === "barrel") A.drawBarrel(lctx, X, Y);
    else if (o.kind === "millstone") A.drawMillstone(lctx, X, Y, false);
    else if (o.kind === "millstone_t") A.drawMillstone(lctx, X, Y, true);
    else if (o.kind === "prints") { for (let i = 0; i < 3; i++) { lctx.fillStyle = "#6f8f3a"; lctx.fillRect(X + 3 + (i % 2) * 6, Y + 13 - i * 5, 3, 4); } }
    else if (["bed", "mybed", "desk", "stove", "counter", "table", "rug"].includes(o.kind)) A.drawFurniture(lctx, X, Y, o.kind, 0);
  }
}

function camera() {
  const cx = player.px + TS / 2 - VW / 2, cy = player.py + TS / 2 - VH / 2;
  const mw = map.w * TS, mh = map.h * TS;
  return [mw <= VW ? (mw - VW) / 2 : Math.max(0, Math.min(mw - VW, cx)), mh <= VH ? (mh - VH) / 2 : Math.max(0, Math.min(mh - VH, cy))];
}

function render(t) {
  ctx.fillStyle = "#1d1824"; ctx.fillRect(0, 0, VW, VH);
  let [cx, cy] = camera(); cx = Math.round(cx); cy = Math.round(cy);
  ctx.drawImage(layer, -cx, -cy);
  const x0 = Math.max(0, Math.floor(cx / TS)), y0 = Math.max(0, Math.floor(cy / TS));
  const x1 = Math.min(map.w - 1, Math.ceil((cx + VW) / TS)), y1 = Math.min(map.h - 1, Math.ceil((cy + VH) / TS));
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const ch = map.g[y][x];
    if (WATERY.has(ch)) drawWaterTile(ctx, ch, x * TS - cx, y * TS - cy, x, y, t);
  }
  for (const o of map.objects) {
    if (o.kind === "vat") A.drawVat(ctx, o.x * TS - cx, o.y * TS - cy, t);
    if (o.kind === "fire") A.drawFurniture(ctx, o.x * TS - cx, o.y * TS - cy, "fire", t);
  }
  const all = [...ents, { self: true, ...player }].sort((a, b) => a.py - b.py);
  for (const e of all) {
    const X = Math.round(e.px - cx), Y = Math.round(e.py - cy);
    if (X < -TS || Y < -TS * 2 || X > VW + TS || Y > VH + TS) continue;
    if (e.self) A.drawChar(ctx, X, Y, A.LOOKS.moss, e.dir, e.moving ? 1 + (Math.floor(e.anim * 8) % 2) : 0, t);
    else if (e.kind === "npc") A.drawChar(ctx, X, Y, A.LOOKS[e.look || e.id], e.dir, e.moving ? 1 + (Math.floor(t * 8) % 2) : 0, t);
    else if (e.kind === "dog") A.drawDog(ctx, X, Y, e.dir, e.moving ? Math.floor(t * 10) : 0, t);
    else if (e.kind === "sheep") A.drawSheep(ctx, X, Y, e.dir, e.moving ? Math.floor(t * 8) : 0, e.blue);
  }
  // a little "!" over people with something new to say
  for (const e of ents) {
    if (e.kind !== "npc" && e.kind !== "dog") continue;
    if (!hasNew(e.id)) continue;
    const X = Math.round(e.px - cx) + 6, Y = Math.round(e.py - cy) - 14 + Math.round(Math.sin(t * 4));
    ctx.fillStyle = A.INK; ctx.fillRect(X - 1, Y - 1, 5, 9); ctx.fillStyle = "#f3c94a"; ctx.fillRect(X, Y, 3, 5); ctx.fillRect(X, Y + 6, 3, 1);
  }
}

// ---------------------------------------------------------------- movement
const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const held = new Set();
function solidAt(x, y, self) {
  const ch = tileAt(x, y);
  if ("T~=FH|w".includes(ch)) return true;
  if (ch === "B" && !S.unlocked.crossing) return true;
  if (map.objects.some((o) => o.solid && o.x === x && o.y === y)) return true;
  if (ents.some((e) => e !== self && ((e.x === x && e.y === y) || (e.moving && e.moving[0] === x && e.moving[1] === y)))) return true;
  if (self !== player && player && ((player.x === x && player.y === y) || (player.moving && player.moving[0] === x && player.moving[1] === y))) return true;
  return false;
}
function tryMove(e, dir) {
  e.dir = dir;
  const [dx, dy] = DIRS[dir], nx = e.x + dx, ny = e.y + dy;
  if (solidAt(nx, ny, e)) return false;
  if (e !== player && tileAt(nx, ny) === "D") return false;
  e.moving = [nx, ny]; return true;
}
function stepEntity(e, dt, speed) {
  if (!e.moving) return false;
  const tx = e.moving[0] * TS, ty = e.moving[1] * TS, d = speed * TS * dt;
  e.px += Math.sign(tx - e.px) * Math.min(d, Math.abs(tx - e.px));
  e.py += Math.sign(ty - e.py) * Math.min(d, Math.abs(ty - e.py));
  if (e.px === tx && e.py === ty) { e.x = e.moving[0]; e.y = e.moving[1]; e.moving = null; return true; }
  return false;
}

let uiOpen = false;
function update(dt) {
  if (uiOpen) { held.clear(); }
  player.anim += dt;
  const arrived = stepEntity(player, dt, 5.5);
  if (arrived) {
    S.x = player.x; S.y = player.y;
    const door = map.doors[`${player.x},${player.y}`];
    if (door) {
      if (door.locked) { say(null, door.locked); tryMove(player, "up"); }
      else { enterMap(door.to, door.x, door.y, door.dir); return; }
    }
    if (map.id === "village" && player.y <= 8 && !S.seenHill) { S.seenHill = true; toast("You climb onto Hollow Hill. The old mill looms above."); }
  }
  if (!player.moving && !uiOpen) {
    const d = [...held].pop();
    if (d) { if (!tryMove(player, d)) player.dir = d; }
  }
  for (const e of ents) {
    stepEntity(e, dt, e.kind === "dog" ? 4 : 2);
    if (!e.wander || e.moving || e.talking) continue;
    e.timer -= dt;
    if (e.timer <= 0) {
      e.timer = 1 + Math.random() * 3;
      const dirs = Object.keys(DIRS), d = dirs[(Math.random() * 4) | 0], [dx, dy] = DIRS[d];
      const [x0, y0, x1, y1] = e.wander, nx = e.x + dx, ny = e.y + dy;
      if (nx >= x0 && nx <= x1 && ny >= y0 && ny <= y1) tryMove(e, d); else e.dir = d;
    }
  }
}

// ---------------------------------------------------------------- input
const KEYMAP = { ArrowUp: "up", KeyW: "up", ArrowDown: "down", KeyS: "down", ArrowLeft: "left", KeyA: "left", ArrowRight: "right", KeyD: "right" };
addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") { if (e.key === "Escape") closeDialog(); return; }
  if (KEYMAP[e.code] && !uiOpen) { const d = KEYMAP[e.code]; held.delete(d); held.add(d); if (player && !player.moving) player.dir = d; e.preventDefault(); }
  else if (["Space", "Enter", "KeyE"].includes(e.code)) { e.preventDefault(); if (overlayNext()) return; if (dialogOpen) { if (!$("#dlgForm").classList.contains("on")) closeDialog(); } else if (!uiOpen) interact(); }
  else if (e.code === "Escape") { closeDialog(); closeNotebook(); }
  else if (e.code === "KeyN" && !dialogOpen) toggleNotebook();
});
addEventListener("keyup", (e) => { if (KEYMAP[e.code]) held.delete(KEYMAP[e.code]); });
for (const b of document.querySelectorAll("[data-pad]")) {
  const d = b.dataset.pad;
  const on = (ev) => { ev.preventDefault(); if (d === "a") { if (overlayNext()) return; if (dialogOpen) { if (!$("#dlgForm").classList.contains("on")) closeDialog(); } else interact(); } else { held.add(d); if (player && !player.moving && !uiOpen) player.dir = d; } };
  const off = (ev) => { ev.preventDefault(); held.delete(d); };
  b.addEventListener("pointerdown", on); b.addEventListener("pointerup", off); b.addEventListener("pointerleave", off); b.addEventListener("pointercancel", off);
}

function interact() {
  if (player.moving) return;
  const [dx, dy] = DIRS[player.dir];
  let fx = player.x + dx, fy = player.y + dy;
  let obj = map.objects.find((o) => o.x === fx && o.y === fy);
  if (obj && obj.reach) { fx += dx; fy += dy; obj = map.objects.find((o) => o.x === fx && o.y === fy); }
  const ent = ents.find((e) => e.x === fx && e.y === fy);
  if (ent) {
    if (ent.kind === "sheep") return say(null, OBJECTS[ent.blue ? "clover" : "sheep"].text);
    const back = { up: "down", down: "up", left: "right", right: "left" };
    ent.dir = back[player.dir];
    if (ent.id === "wren") return startEnding();
    return openDialog(ent.id);
  }
  if (obj && obj.ex) return examine(obj.ex);
}

function examine(key) {
  const o = OBJECTS[key];
  if (o.gives && S.clues[o.gives] && OBJECTS[`${key}_again`]) return say(null, OBJECTS[`${key}_again`].text);
  say(null, o.text);
  if (o.gives) addClue(o.gives);
}

// ---------------------------------------------------------------- clues
function addClue(id) {
  if (S.clues[id]) return;
  S.clues[id] = Date.now();
  toast(`📓 New clue: ${CLUES[id].title}`);
  updateHud(); save();
}
function hasNew(npcId) {
  const n = NPCS[npcId]; if (!n || !n.facts) return false;
  return n.facts.some((f) => available(f) && ((f.gives && !S.clues[f.gives]) || (f.unlock && !S.unlocked[f.unlock])));
}
function available(f) {
  if (f.requires && !f.requires.every((c) => S.clues[c])) return false;
  if (f.requiresAny && !f.requiresAny.some((c) => S.clues[c])) return false;
  return true;
}
function hint() {
  const c = S.clues;
  if (S.unlocked.crossing) return "Bramble showed you a fallen tree across the stream, east, behind the brambles. Cross it and climb to the mill.";
  if (c.bridge) return "Abel says the stray dog always gets across. Find Bramble and ask him to show you the way.";
  if (c.mill || c.prints) return "The mill road crosses the stream. Abel walks every road in the village. Ask him about it.";
  if (c.sheep || c.letter) return "Blue... where would anything turn blue around here? Marta at the inn knows the village's history.";
  if (!c.shoes) return "Dad is by the field gate. And something by the well caught your eye this morning.";
  return "Dad was out with the sheep at dawn. Ask him if anything seemed odd. Wren's room might hold something too.";
}

// ---------------------------------------------------------------- dialogue
let dialogOpen = false, current = null, history = {}, typing = null;
function say(name, text) {
  openPanel(name, false);
  addLine(name ? "them" : "narr", text, true);
}
function openPanel(name, conversational) {
  dialogOpen = true; uiOpen = true;
  $("#dlg").classList.add("on");
  $("#dlgName").textContent = name || "";
  $("#dlgName").style.display = name ? "" : "none";
  $("#dlgLog").innerHTML = "";
  $("#dlgForm").classList.toggle("on", conversational);
  $("#dlgChips").classList.toggle("on", conversational);
  $("#dlgHint").textContent = conversational ? (LLM.ready() ? "Type anything, or pick a topic." : "Pick a topic, or type a question (key words matter).") : "Space / tap to close";
}
function addLine(who, text, animate) {
  const div = document.createElement("div");
  div.className = `line ${who}`;
  $("#dlgLog").appendChild(div);
  if (!animate || matchMedia("(prefers-reduced-motion: reduce)").matches) { div.textContent = text; scrollLog(); return; }
  let i = 0; clearInterval(typing);
  typing = setInterval(() => { i += 2; div.textContent = text.slice(0, i); scrollLog(); if (i >= text.length) clearInterval(typing); }, 22);
  div.onclick = () => { clearInterval(typing); div.textContent = text; };
}
function scrollLog() { const l = $("#dlgLog"); l.scrollTop = l.scrollHeight; }

function openDialog(id) {
  const n = NPCS[id]; current = id;
  const e = ents.find((x) => x.id === id); if (e) e.talking = true;
  openPanel(n.name, true);
  history[id] = history[id] || [];
  const first = !S.told[id];
  S.told[id] = S.told[id] || [];
  addLine("them", first ? n.greet : pick(n.idle), true);
  renderChips();
  setTimeout(() => $("#dlgIn").focus({ preventScroll: true }), 50);
}
function closeDialog() {
  if (!dialogOpen) return;
  dialogOpen = false; uiOpen = false; current = null; clearInterval(typing);
  $("#dlg").classList.remove("on");
  for (const e of ents) e.talking = false;
  $("#dlgIn").blur();
}
function renderChips() {
  const box = $("#dlgChips"); box.innerHTML = "";
  for (const t of TOPICS) {
    if (t.after && !t.after.some((c) => S.clues[c])) continue;
    const b = document.createElement("button"); b.type = "button"; b.textContent = t.label;
    b.onclick = () => ask(t.say);
    box.appendChild(b);
  }
}
const pick = (a) => a[(Math.random() * a.length) | 0];

function tokens(s) { return (s.toLowerCase().match(/[a-z']+/g) || []).map((w) => w.replace(/'s$/, "")); }
function kwHit(tok, kw) { return tok === kw || tok === kw + "s" || tok + "s" === kw || (kw.length >= 4 && tok.startsWith(kw)); }
function matchFact(n, text) {
  const toks = tokens(text);
  let best = null;
  n.facts.forEach((f, i) => {
    let score = 0;
    for (const kw of f.keywords) if (toks.some((t) => kwHit(t, kw))) score += 1;
    if (!score) return;
    const avail = available(f), fresh = (f.gives && !S.clues[f.gives]) || (f.unlock && !S.unlocked[f.unlock]);
    const rank = score * 10 + (avail ? 5 : 0) + (avail && fresh ? 3 : 0) - i * 0.01;
    if (!best || rank > best.rank) best = { f, rank, avail };
  });
  return best;
}

let thinking = false;
async function ask(text) {
  if (!current || thinking) return;
  text = text.trim(); if (!text) return;
  const id = current, n = NPCS[id];
  addLine("you", text, false);
  history[id].push({ who: "you", text });
  const m = matchFact(n, text);
  let reply = null, reveal = null;
  if (m && m.avail) {
    const told = S.told[id].includes(m.f.id);
    if (!told || (m.f.gives && !S.clues[m.f.gives]) || (m.f.unlock && !S.unlocked[m.f.unlock]) || !LLM.ready()) { reply = m.f.line; reveal = m.f; }
  } else if (m && m.f.locked) reply = m.f.locked;
  if (!reply) {
    if (LLM.ready()) {
      thinking = true; const dots = document.createElement("div"); dots.className = "line them thinking"; dots.textContent = "…"; $("#dlgLog").appendChild(dots); scrollLog();
      const known = [n.greet, ...n.facts.filter((f) => S.told[id].includes(f.id)).map((f) => f.line)].filter(Boolean);
      reply = await LLM.smallTalk({ persona: n.persona, context: WREN_CTX, known, history: history[id], player: text, dog: !!n.dog });
      dots.remove(); thinking = false;
      if (current !== id) return;
    }
    if (!reply) reply = pick(n.idle);
  }
  addLine("them", reply, true);
  history[id].push({ who: "them", text: reply });
  if (reveal) {
    if (!S.told[id].includes(reveal.id)) S.told[id].push(reveal.id);
    if (reveal.gives) addClue(reveal.gives);
    if (reveal.unlock && !S.unlocked[reveal.unlock]) { S.unlocked[reveal.unlock] = true; applyUnlocks(); prerender(); toast("A way across the stream! East, behind the brambles."); }
    renderChips(); save();
  }
}
$("#dlgForm").addEventListener("submit", (e) => { e.preventDefault(); const v = $("#dlgIn").value; $("#dlgIn").value = ""; ask(v); });
$("#dlgClose").addEventListener("click", closeDialog);
$("#dlg").addEventListener("click", (e) => { if (!$("#dlgForm").classList.contains("on") && e.target.closest("#dlgLog")) closeDialog(); });

// ---------------------------------------------------------------- notebook, toast, HUD
function toggleNotebook() { $("#notebook").classList.contains("on") ? closeNotebook() : openNotebook(); }
function openNotebook() {
  uiOpen = true; $("#notebook").classList.add("on");
  const list = $("#nbList"); list.innerHTML = "";
  for (const id of CLUE_ORDER) {
    const li = document.createElement("li");
    if (S.clues[id]) { li.innerHTML = `<b></b><span></span>`; li.querySelector("b").textContent = CLUES[id].title; li.querySelector("span").textContent = CLUES[id].text; }
    else { li.className = "unknown"; li.textContent = "? ? ?"; }
    list.appendChild(li);
  }
  $("#nbHint").textContent = hint();
}
function closeNotebook() { if (!$("#notebook").classList.contains("on")) return; $("#notebook").classList.remove("on"); uiOpen = dialogOpen; }
$("#nbBtn").addEventListener("click", toggleNotebook);
$("#nbClose").addEventListener("click", closeNotebook);
function updateHud() { $("#nbBtn").textContent = `📓 Notebook ${Object.keys(S.clues).length}/${CLUE_ORDER.length}`; }
let toastT;
function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("on"), 3200); }

// ---------------------------------------------------------------- story overlays (intro / ending)
let overlay = null;
function showOverlay(lines, onDone) {
  overlay = { lines, i: 0, onDone }; uiOpen = true;
  $("#story").classList.add("on"); $("#storyText").textContent = lines[0];
}
function overlayNext() {
  if (!overlay) return false;
  overlay.i++;
  if (overlay.i >= overlay.lines.length) { const d = overlay.onDone; overlay = null; $("#story").classList.remove("on"); uiOpen = false; d?.(); }
  else $("#storyText").textContent = overlay.lines[overlay.i];
  return true;
}
$("#story").addEventListener("click", overlayNext);
function startEnding() {
  S.done = true; save();
  showOverlay(ENDING(S.clues), () => { $("#title").classList.add("on"); $("#titleSub").textContent = "Thank you for playing. Wren is home."; uiOpen = true; });
}

// ---------------------------------------------------------------- title + voices
function startGame(fresh) {
  if (fresh) { S = freshState(); history = {}; }
  $("#title").classList.remove("on"); uiOpen = false;
  enterMap(S.map, S.x, S.y, S.dir); updateHud();
  if (fresh) showOverlay(INTRO, () => toast("Arrows / WASD to walk · Space to talk · N for your notebook"));
}
$("#btnNew").addEventListener("click", () => startGame(true));
$("#btnContinue").addEventListener("click", () => { const s = loadSave(); if (s) { S = s; startGame(false); } });
if (!loadSave() || loadSave().done) $("#btnContinue").style.display = "none";

const sel = $("#modelSel");
for (const m of LLM.MODELS) { const o = document.createElement("option"); o.value = m.id; o.textContent = m.label; sel.appendChild(o); }
function voicesStatus(txt, cls) { for (const el of document.querySelectorAll(".voiceStatus")) { el.textContent = txt; el.className = `voiceStatus ${cls || ""}`; } }
if (!LLM.hasWebGPU()) { voicesStatus("This browser has no WebGPU, so villagers use their written lines. (Chrome or Edge on desktop works.)", "off"); $("#btnVoices").disabled = true; }
else voicesStatus("Villagers use their written lines. Wake them to chat freely.");
$("#btnVoices").addEventListener("click", async () => {
  $("#btnVoices").disabled = true; sel.disabled = true;
  voicesStatus("Waking the villagers… 0%", "busy");
  try {
    const id = await LLM.load(sel.value, (p, text) => { voicesStatus(`Waking the villagers… ${Math.round(p * 100)}%`, "busy"); $("#voiceBar").style.width = `${p * 100}%`; });
    voicesStatus(`Villagers are awake (${id}). Type anything to them.`, "on");
    $("#hudVoices").textContent = "🗣 Voices on";
  } catch (e) {
    console.error(e);
    voicesStatus(`Could not wake them (${e.message}). Written lines still work.`, "off");
    $("#btnVoices").disabled = false; sel.disabled = false;
  }
});
$("#hudVoices").addEventListener("click", () => { $("#voicesPanel").classList.toggle("on"); });
$("#voicesClose").addEventListener("click", () => $("#voicesPanel").classList.remove("on"));

// ---------------------------------------------------------------- loop
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (map) { update(dt); render(now / 1000); }
  requestAnimationFrame(frame);
}
// debug: ?start&pos=village,10,12&clues=all
if (params.has("start")) {
  S = freshState();
  if (params.get("pos")) { const [m, x, y] = params.get("pos").split(","); S.map = m; S.x = +x; S.y = +y; }
  if (params.get("clues") === "all") for (const c of CLUE_ORDER) S.clues[c] = 1;
  if (params.has("crossing")) S.unlocked.crossing = true;
  $("#title").classList.remove("on"); enterMap(S.map, S.x, S.y, "up"); updateHud();
} else { uiOpen = true; enterMap("village", 18, 22, "up"); }
requestAnimationFrame(frame);
window.__tw = { ask: (t) => ask(t), open: (id) => openDialog(id), get state() { return S; }, get player() { return player; }, get ents() { return ents.map(e => [e.id, e.x, e.y]); } };
