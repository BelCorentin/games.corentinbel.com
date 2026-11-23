// Procedural pixel art for Thistlewick. Everything is drawn with fillRect at 16 px per tile.
export const TS = 16;
export const INK = "#2b2233";

const hash = (x, y, s = 0) => {
  let h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

function px(ctx, x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); }

// ---------- ground tiles ----------
const GRASS = ["#86c96f", "#7cc066", "#8fd078"];
export function drawGrass(ctx, X, Y, tx, ty, flowers) {
  px(ctx, X, Y, TS, TS, GRASS[(hash(tx, ty) * 3) | 0]);
  for (let i = 0; i < 3; i++) {
    const r = hash(tx, ty, i + 1);
    if (r < 0.55) {
      const gx = X + ((hash(tx, ty, i + 7) * 14) | 0), gy = Y + ((hash(tx, ty, i + 9) * 13) | 0);
      px(ctx, gx, gy, 1, 2, "#5ea64f"); px(ctx, gx + 2, gy + 1, 1, 2, "#5ea64f");
    }
  }
  if (flowers) {
    const cols = ["#f7f2e6", "#f3c94a", "#ee8fb2", "#b79cf0"];
    for (let i = 0; i < 3; i++) {
      const fx = X + 2 + ((hash(tx, ty, i + 20) * 11) | 0), fy = Y + 2 + ((hash(tx, ty, i + 30) * 11) | 0);
      const c = cols[(hash(tx, ty, i + 40) * 4) | 0];
      px(ctx, fx, fy - 1, 1, 1, c); px(ctx, fx - 1, fy, 3, 1, c); px(ctx, fx, fy + 1, 1, 1, c); px(ctx, fx, fy, 1, 1, "#f3c94a");
    }
  }
}

export function drawPath(ctx, X, Y, tx, ty) {
  px(ctx, X, Y, TS, TS, "#dcbb84");
  for (let i = 0; i < 4; i++) {
    if (hash(tx, ty, i + 50) < 0.6) {
      const gx = X + ((hash(tx, ty, i + 51) * 14) | 0), gy = Y + ((hash(tx, ty, i + 52) * 14) | 0);
      px(ctx, gx, gy, 2, 1, "#c09a62"); px(ctx, gx, gy + 1, 2, 1, "#ead2a4");
    }
  }
}

export function drawField(ctx, X, Y, tx, ty) {
  px(ctx, X, Y, TS, TS, "#a6cf6a");
  for (let r = 0; r < 4; r++) px(ctx, X, Y + r * 4 + 2, TS, 1, "#93bd5b");
  if (hash(tx, ty, 60) < 0.3) { const gx = X + ((hash(tx, ty, 61) * 13) | 0); px(ctx, gx, Y + 5, 1, 3, "#6f9e45"); px(ctx, gx + 1, Y + 4, 1, 2, "#6f9e45"); }
}

export function drawStone(ctx, X, Y, tx, ty) {
  drawGrass(ctx, X, Y, tx, ty, false);
  const o = (hash(tx, ty, 70) * 3) | 0;
  px(ctx, X + 2 + o, Y + 2, 11, 11, INK);
  px(ctx, X + 3 + o, Y + 3, 9, 9, "#b9b3a8");
  px(ctx, X + 4 + o, Y + 4, 4, 2, "#d6d1c7");
}

export function drawWater(ctx, X, Y, tx, ty, t) {
  px(ctx, X, Y, TS, TS, "#4f8fd6");
  const ph = (t * 1.5 + hash(tx, ty, 80) * 6) % 6;
  for (let i = 0; i < 2; i++) {
    const wy = Y + 3 + i * 8, wx = X + (((ph * 3 + i * 7) | 0) % 12);
    px(ctx, wx, wy, 4, 1, "#9cc7f2");
    px(ctx, wx + 1, wy + 1, 2, 1, "#79acea");
  }
}

export function drawBank(ctx, X, Y, tx, ty, t, up) {
  drawWater(ctx, X, Y, tx, ty, t);
  px(ctx, X, up ? Y : Y + 13, TS, 3, "#8a6a45");
  px(ctx, X, up ? Y + 3 : Y + 12, TS, 1, "#c7e3f7");
}

export function drawTree(ctx, X, Y, tx, ty) {
  drawGrass(ctx, X, Y, tx, ty, false);
  const dark = hash(tx, ty, 90) < 0.5;
  px(ctx, X + 6, Y + 10, 4, 6, "#7a4e2d"); px(ctx, X + 6, Y + 10, 1, 6, INK); px(ctx, X + 9, Y + 10, 1, 6, INK);
  const c1 = dark ? "#3e8a4b" : "#4b9a52", c2 = dark ? "#5aae5c" : "#68bd63";
  px(ctx, X + 2, Y + 1, 12, 10, INK);
  px(ctx, X + 1, Y + 3, 14, 6, INK);
  px(ctx, X + 3, Y + 2, 10, 8, c1);
  px(ctx, X + 2, Y + 4, 12, 4, c1);
  px(ctx, X + 4, Y + 3, 4, 2, c2); px(ctx, X + 9, Y + 5, 2, 2, c2);
}

export function drawFence(ctx, X, Y, tx, ty, vertical) {
  drawGrass(ctx, X, Y, tx, ty, false);
  if (vertical) { px(ctx, X + 6, Y, 4, TS, INK); px(ctx, X + 7, Y, 2, TS, "#c99a5e"); }
  else {
    px(ctx, X, Y + 5, TS, 3, INK); px(ctx, X, Y + 6, TS, 1, "#c99a5e");
    px(ctx, X, Y + 10, TS, 3, INK); px(ctx, X, Y + 11, TS, 1, "#c99a5e");
    px(ctx, X + 2, Y + 3, 3, 12, INK); px(ctx, X + 3, Y + 4, 1, 10, "#c99a5e");
  }
}

export function drawBush(ctx, X, Y, tx, ty, trampled) {
  drawGrass(ctx, X, Y, tx, ty, false);
  if (trampled) {
    for (let i = 0; i < 4; i++) px(ctx, X + 1 + i * 4, Y + 11 - (i % 2) * 2, 3, 2, "#5b7a3c");
    px(ctx, X + 1, Y + 2, 3, 3, "#5b7a3c"); px(ctx, X + 12, Y + 3, 3, 3, "#5b7a3c");
    return;
  }
  px(ctx, X, Y + 2, TS, 13, INK);
  px(ctx, X + 1, Y + 3, 14, 11, "#4f7f3a");
  for (let i = 0; i < 6; i++) {
    const bx = X + 2 + ((hash(tx, ty, i + 100) * 11) | 0), by = Y + 4 + ((hash(tx, ty, i + 110) * 8) | 0);
    px(ctx, bx, by, 2, 2, i % 2 ? "#3a2440" : "#d8476a");
  }
}

export function drawLog(ctx, X, Y, tx, ty, t) {
  drawWater(ctx, X, Y, tx, ty, t);
  px(ctx, X + 3, Y, 10, TS, INK);
  px(ctx, X + 4, Y, 8, TS, "#8a5a33");
  px(ctx, X + 5, Y, 2, TS, "#a8754a");
}

export function drawBridgeBroken(ctx, X, Y, tx, ty, t, top) {
  drawWater(ctx, X, Y, tx, ty, t);
  px(ctx, X + 1, top ? Y : Y + 8, 3, 8, INK); px(ctx, X + 2, top ? Y : Y + 8, 1, 7, "#7a4e2d");
  px(ctx, X + 12, top ? Y : Y + 8, 3, 8, INK); px(ctx, X + 13, top ? Y : Y + 8, 1, 7, "#7a4e2d");
  px(ctx, X + 4, top ? Y + 2 : Y + 12, 6, 1, "#c99a5e");
}

export function drawFloor(ctx, X, Y, tx, ty) {
  px(ctx, X, Y, TS, TS, "#c58e58");
  px(ctx, X, Y + (tx % 2 ? 0 : 8), TS, 1, "#a8743f");
  px(ctx, X + 15, Y, 1, TS, "#b37d48");
}

export function drawWallIn(ctx, X, Y, tx, ty) {
  px(ctx, X, Y, TS, TS, "#e9d8b4");
  px(ctx, X, Y + 13, TS, 3, "#9b6b3e");
  px(ctx, X + (tx % 3) * 5, Y + 4, 1, 6, "#dcc79e");
}

export function drawVoid(ctx, X, Y) { px(ctx, X, Y, TS, TS, "#1d1824"); }

// ---------- structures ----------
export function drawHouse(ctx, X, Y, w, h, roof, wall = "#f3e3c3") {
  // w,h in tiles; the bottom 2 rows are wall, the rest roof.
  const W = w * TS, H = h * TS, wallH = 2 * TS - 2;
  const wy = Y + H - wallH;
  px(ctx, X, wy, W, wallH, INK);
  px(ctx, X + 1, wy, W - 2, wallH - 1, wall);
  for (let i = 0; i < w; i++) px(ctx, X + i * TS + 3, wy + 5, 1, wallH - 8, "#e2cfa8");
  // roof with eaves
  px(ctx, X - 2, Y, W + 4, H - wallH + 3, INK);
  px(ctx, X - 1, Y + 1, W + 2, H - wallH + 1, roof[0]);
  for (let r = Y + 4; r < wy; r += 4) px(ctx, X - 1, r, W + 2, 1, roof[1]);
  px(ctx, X - 1, Y + 1, W + 2, 2, roof[2]);
  // chimney
  px(ctx, X + W - 14, Y - 6, 7, 9, INK); px(ctx, X + W - 13, Y - 5, 5, 7, "#a9524a");
}

export function drawWindow(ctx, X, Y, lit) {
  px(ctx, X, Y, 10, 9, INK);
  px(ctx, X + 1, Y + 1, 8, 7, lit ? "#f8d978" : "#9fc6e8");
  px(ctx, X + 5, Y + 1, 1, 7, INK); px(ctx, X + 1, Y + 4, 8, 1, INK);
  px(ctx, X + 2, Y + 2, 2, 1, "#ffffff");
}

export function drawDoor(ctx, X, Y) {
  px(ctx, X + 3, Y - 2, 10, 18, INK);
  px(ctx, X + 4, Y - 1, 8, 17, "#8a5a33");
  px(ctx, X + 4, Y + 6, 8, 1, "#6b4426");
  px(ctx, X + 10, Y + 8, 1, 2, "#f3c94a");
}

export function drawMill(ctx, X, Y, w, h) {
  const W = w * TS, H = h * TS;
  px(ctx, X, Y + 10, W, H - 10, INK);
  px(ctx, X + 1, Y + 11, W - 2, H - 12, "#b9b0a2");
  for (let r = 0; r < (H - 12) / 5; r++) for (let c = 0; c < W / 8; c++) px(ctx, X + 1 + c * 8 + (r % 2) * 4, Y + 11 + r * 5, 1, 5, "#a39a8c"), px(ctx, X + 1, Y + 15 + r * 5, W - 2, 1, "#a39a8c");
  px(ctx, X - 3, Y, W + 6, 13, INK); px(ctx, X - 2, Y + 1, W + 4, 11, "#5d6f86"); px(ctx, X - 2, Y + 1, W + 4, 2, "#7d90a8");
  // big window and a weathered door
  drawWindow(ctx, X + 8, Y + 22, false); drawWindow(ctx, X + W - 18, Y + 22, false);
  px(ctx, X + W / 2 - 6, Y + H - 20, 12, 20, INK); px(ctx, X + W / 2 - 5, Y + H - 19, 10, 19, "#6b5a48");
}

export function drawVat(ctx, X, Y, t) {
  px(ctx, X, Y + 2, 14, 12, INK);
  px(ctx, X + 1, Y + 3, 12, 10, "#7a5a3a");
  px(ctx, X + 2, Y + 4, 10, 4, "#2f56c8");
  px(ctx, X + 3 + ((t * 2) | 0) % 6, Y + 5, 2, 1, "#6f93ee");
  px(ctx, X + 1, Y + 9, 12, 1, "#5b4229");
}

export function drawMillstone(ctx, X, Y, tilted) {
  if (tilted) { px(ctx, X + 1, Y + 6, 14, 7, INK); px(ctx, X + 2, Y + 7, 12, 5, "#a8a196"); px(ctx, X + 7, Y + 8, 2, 2, INK); return; }
  px(ctx, X + 2, Y + 2, 12, 12, INK); px(ctx, X + 1, Y + 4, 14, 8, INK);
  px(ctx, X + 3, Y + 3, 10, 10, "#a8a196"); px(ctx, X + 2, Y + 5, 12, 6, "#a8a196");
  px(ctx, X + 7, Y + 7, 2, 2, INK); px(ctx, X + 4, Y + 4, 3, 1, "#c8c2b6");
}

export function drawWell(ctx, X, Y) {
  px(ctx, X + 1, Y + 6, 14, 10, INK); px(ctx, X + 2, Y + 7, 12, 8, "#a8a196");
  px(ctx, X + 3, Y + 8, 10, 3, "#2a3a5a");
  px(ctx, X + 2, Y - 4, 2, 11, INK); px(ctx, X + 12, Y - 4, 2, 11, INK);
  px(ctx, X, Y - 6, 16, 3, INK); px(ctx, X + 1, Y - 5, 14, 1, "#a9524a");
  // Wren's little shoes
  px(ctx, X - 4, Y + 13, 3, 2, "#d94a3a"); px(ctx, X - 7, Y + 13, 3, 2, "#d94a3a");
}

export function drawSign(ctx, X, Y) {
  px(ctx, X + 7, Y + 8, 2, 8, INK);
  px(ctx, X + 1, Y + 2, 14, 8, INK); px(ctx, X + 2, Y + 3, 12, 6, "#c99a5e");
  px(ctx, X + 4, Y + 5, 8, 1, "#8a5a33"); px(ctx, X + 4, Y + 7, 5, 1, "#8a5a33");
}

export function drawBarrel(ctx, X, Y) {
  px(ctx, X + 3, Y + 3, 10, 13, INK); px(ctx, X + 4, Y + 4, 8, 11, "#9b6b3e");
  px(ctx, X + 4, Y + 6, 8, 1, INK); px(ctx, X + 4, Y + 12, 8, 1, INK); px(ctx, X + 5, Y + 4, 6, 1, "#4f8fd6");
}

export function drawFurniture(ctx, X, Y, kind, t) {
  if (kind === "bed" || kind === "mybed") {
    px(ctx, X + 1, Y - 6, 14, 22, INK); px(ctx, X + 2, Y - 5, 12, 20, kind === "bed" ? "#e87a5a" : "#5a8ae8");
    px(ctx, X + 3, Y - 4, 10, 5, "#f7f2e6"); px(ctx, X + 2, Y + 4, 12, 1, "#ffffff55");
  } else if (kind === "desk") {
    px(ctx, X, Y + 2, 16, 12, INK); px(ctx, X + 1, Y + 3, 14, 4, "#a8754a"); px(ctx, X + 2, Y + 7, 2, 6, "#8a5a33"); px(ctx, X + 12, Y + 7, 2, 6, "#8a5a33");
    px(ctx, X + 4, Y, 7, 4, INK); px(ctx, X + 5, Y + 1, 5, 2, "#c9b37a");
  } else if (kind === "stove") {
    px(ctx, X + 1, Y + 1, 14, 15, INK); px(ctx, X + 2, Y + 2, 12, 13, "#4a4a52"); px(ctx, X + 4, Y + 8, 8, 5, "#2a2a30");
  } else if (kind === "fire") {
    px(ctx, X, Y, 16, 16, INK); px(ctx, X + 1, Y + 1, 14, 15, "#8a8178"); px(ctx, X + 3, Y + 5, 10, 11, "#2a2228");
    const f = Math.sin(t * 9) > 0;
    px(ctx, X + 5, Y + (f ? 9 : 10), 6, 6, "#f08a2a"); px(ctx, X + 6, Y + (f ? 11 : 12), 4, 4, "#f8d24a");
  } else if (kind === "counter") {
    px(ctx, X, Y + 4, 16, 12, INK); px(ctx, X, Y + 5, 16, 3, "#a8754a"); px(ctx, X, Y + 8, 16, 7, "#8a5a33");
  } else if (kind === "table") {
    px(ctx, X + 1, Y + 3, 14, 9, INK); px(ctx, X + 2, Y + 4, 12, 5, "#b9834c"); px(ctx, X + 6, Y + 5, 3, 2, "#f7f2e6");
  } else if (kind === "rug") {
    px(ctx, X, Y + 2, 16, 12, "#b0485a"); px(ctx, X + 2, Y + 4, 12, 8, "#d6a05a");
  }
}

// ---------- characters ----------
// look: { skin, hair, style: messy|bun|cap|bald|long, top, accent, bottom, shoes, beard, scarf }
export function drawChar(ctx, X, Y, look, dir, step, t = 0) {
  const ox = X, oy = Y - 5;
  const p = (x, y, w, h, c) => px(ctx, ox + x, oy + y, w, h, c);
  // shadow
  ctx.fillStyle = "rgba(30,20,40,0.22)"; ctx.fillRect(X + 3, Y + 14, 10, 2);
  const legA = step % 2 === 1 ? 1 : 0, legB = step % 2 === 1 ? 0 : 1;
  const walking = step > 0;
  // legs
  p(4, 15, 8, 5, INK);
  p(5, 15, 2, 4 - (walking ? legA : 0), look.bottom); p(9, 15, 2, 4 - (walking ? legB : 0), look.bottom);
  p(5, 19 - (walking ? legA : 0), 2, 1, look.shoes); p(9, 19 - (walking ? legB : 0), 2, 1, look.shoes);
  // body
  p(3, 9, 10, 7, INK);
  p(4, 10, 8, 5, look.top);
  if (look.accent) p(4, 12, 8, 1, look.accent);
  if (look.apron && dir !== "up") { p(5, 11, 6, 4, "#f7f2e6"); }
  if (look.bag && dir !== "up") { p(4, 10, 1, 5, "#7a4e2d"); p(10, 13, 3, 3, "#7a4e2d"); }
  // arms
  const sw = walking ? (step % 2 ? 1 : -1) : 0;
  if (dir === "left" || dir === "right") { p(dir === "left" ? 6 : 8, 10 + (sw > 0 ? 1 : 0), 2, 4, look.top); p(dir === "left" ? 6 : 8, 14, 2, 1, look.skin); }
  else { p(2, 10, 2, 4 + (sw > 0 ? 1 : 0), INK); p(12, 10, 2, 4 + (sw < 0 ? 1 : 0), INK); p(2, 10, 1, 3, look.top); p(13, 10, 1, 3, look.top); p(2, 13 + (sw > 0 ? 1 : 0), 2, 1, look.skin); p(12, 13 + (sw < 0 ? 1 : 0), 2, 1, look.skin); }
  if (look.scarf) { p(4, 9, 8, 2, look.scarf); if (dir !== "up") p(9, 11, 2, 3, look.scarf); }
  // head
  p(2, 0, 12, 10, INK); p(1, 2, 14, 6, INK);
  p(3, 1, 10, 8, look.skin); p(2, 3, 12, 4, look.skin);
  // hair
  const H = look.hair;
  if (look.style === "messy") {
    p(2, 0, 12, 3, H); p(1, 2, 2, 3, H); p(13, 2, 2, 3, H); p(4, 3, 2, 1, H); p(8, 3, 3, 1, H);
    p(5, -1, 2, 1, H); p(9, -1, 2, 1, INK); p(10, -2, 1, 1, H);
  } else if (look.style === "bun") {
    p(2, 0, 12, 3, H); p(1, 2, 2, 4, H); p(13, 2, 2, 4, H); p(6, -3, 4, 3, INK); p(7, -2, 2, 2, H);
  } else if (look.style === "cap") {
    p(1, 0, 14, 3, look.cap); p(1, 3, 14, 1, INK); if (dir === "down") p(3, 3, 10, 1, look.capBrim || look.cap);
    p(1, 4, 2, 2, H); p(13, 4, 2, 2, H);
  } else if (look.style === "bald") {
    p(1, 3, 2, 4, H); p(13, 3, 2, 4, H); p(5, 1, 3, 1, "#ffffff55");
  } else if (look.style === "long") {
    p(2, 0, 12, 3, H); p(1, 2, 2, 8, H); p(13, 2, 2, 8, H);
  }
  if (dir === "up") { p(3, 1, 10, 7, look.style === "bald" ? look.skin : (look.style === "cap" ? look.cap : H)); if (look.style === "cap") p(3, 4, 10, 4, H); return; }
  // face
  if (dir === "down") {
    p(5, 5, 1, 2, INK); p(10, 5, 1, 2, INK);
    p(4, 7, 1, 1, "#f0a0a0"); p(11, 7, 1, 1, "#f0a0a0");
  } else {
    const ex = dir === "left" ? 4 : 11;
    p(ex, 5, 1, 2, INK);
    p(dir === "left" ? 1 : 14, 4, 1, 2, look.skin);
    if (look.style !== "bald" && look.style !== "cap") p(dir === "left" ? 12 : 2, 2, 2, 5, H);
  }
  if (look.beard) { p(3, 7, 10, 3, look.beard); p(4, 10, 8, 1, look.beard); if (dir === "down") p(6, 7, 4, 1, INK); }
}

export function drawDog(ctx, X, Y, dir, step, t) {
  const flip = dir === "left";
  const p = (x, y, w, h, c) => px(ctx, X + (flip ? 16 - x - w : x), Y + y, w, h, c);
  ctx.fillStyle = "rgba(30,20,40,0.22)"; ctx.fillRect(X + 2, Y + 14, 12, 2);
  const s = step % 2;
  p(2, 6, 11, 7, INK); p(3, 7, 9, 5, "#8d8b92");
  p(3 + s, 12, 2, 3, INK); p(9 - s, 12, 2, 3, INK);
  p(10, 2, 6, 7, INK); p(11, 3, 4, 5, "#8d8b92"); p(14, 5, 2, 2, INK);
  p(10, 1, 2, 4, "#3e6fe0"); p(14, 1, 2, 3, "#6a6870");
  p(12, 4, 1, 1, INK);
  const wag = Math.sin(t * 14) > 0 ? -1 : 0;
  p(0, 5 + wag, 3, 2, INK);
}

export function drawSheep(ctx, X, Y, dir, step, blue) {
  const flip = dir === "left";
  const p = (x, y, w, h, c) => px(ctx, X + (flip ? 16 - x - w : x), Y + y, w, h, c);
  ctx.fillStyle = "rgba(30,20,40,0.22)"; ctx.fillRect(X + 2, Y + 14, 12, 2);
  const wool = blue ? "#5b8fe8" : "#f4f1ea", wool2 = blue ? "#3f70d0" : "#dcd6ca";
  const s = step % 2;
  p(4 + s, 12, 2, 3, INK); p(9 - s, 12, 2, 3, INK);
  p(1, 4, 13, 9, INK); p(2, 3, 10, 2, INK);
  p(2, 5, 11, 7, wool); p(3, 4, 8, 2, wool); p(4, 6, 2, 2, wool2); p(8, 8, 3, 2, wool2);
  p(11, 4, 5, 6, INK); p(12, 5, 3, 4, "#3a3040"); p(13, 6, 1, 1, "#ffffff");
}

export const LOOKS = {
  moss:   { skin: "#f2c9a0", hair: "#4a2f22", style: "messy", top: "#4f8f5a", accent: "#3d7548", bottom: "#7a5a3a", shoes: "#3a2a20" },
  wren:   { skin: "#f2c9a0", hair: "#4a2f22", style: "long", top: "#f2c230", bottom: "#2f2f38", shoes: "#2f2f38", scarf: "#d94a3a" },
  dad:    { skin: "#e8b88e", hair: "#9a9a9a", style: "cap", cap: "#3f5e3a", top: "#8a5a35", accent: "#6e4527", bottom: "#4a4a5a", shoes: "#2a2228", beard: "#a8a8a8" },
  marta:  { skin: "#f4cfaa", hair: "#c4502e", style: "bun", top: "#8a3a4a", bottom: "#8a3a4a", shoes: "#3a2a20", apron: true },
  tobiah: { skin: "#eac4a0", hair: "#f2f2f2", style: "bald", top: "#6a4a8a", accent: "#e8c95a", bottom: "#4a3a2a", shoes: "#2a2228", beard: "#f2f2f2" },
  abel:   { skin: "#f0c49c", hair: "#2f2a28", style: "cap", cap: "#2a4080", capBrim: "#1f3060", top: "#3a5aa0", accent: "#f3c94a", bottom: "#2a3a70", shoes: "#2a2228", bag: true },
};
