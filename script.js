import * as THREE from "three";

// ---------- Pengaturan ----------
const N = 6000; // jumlah partikel (kecilkan ke 3000 kalau laptop berat)
const MODE_NAMES = ["Hati", "Saturnus", "I LOVE YOU", "", "Pelukan", "Nebula", "Bunga", "Memberi bunga & pelukan", "", "Kupu-kupu", "Lubang hitam", "", "Jalan bersama", "Menari berdua"];

// ---------- Scene ----------
const canvas = document.getElementById("scene");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setClearColor(0x05060f);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
camera.position.z = 14;

function resize() {
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
}
addEventListener("resize", resize);
resize();

// Bintang latar
{
  const g = new THREE.BufferGeometry();
  const p = new Float32Array(1200 * 3);
  for (let i = 0; i < p.length; i++) p[i] = (Math.random() - 0.5) * 80;
  g.setAttribute("position", new THREE.BufferAttribute(p, 3));
  scene.add(new THREE.Points(g, new THREE.PointsMaterial({ size: 0.06, color: 0x6a74a8, transparent: true, opacity: 0.7 })));
}

// ---------- Bentuk target ----------
const rnd = (a, b) => a + Math.random() * (b - a);
const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;

function makeShapes() {
  const shapes = [];
  const colors = [];
  const c = new THREE.Color();

  // 0 Hati
  {
    const p = new Float32Array(N * 3), col = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const t = rnd(-Math.PI, Math.PI);
      const s = Math.sqrt(Math.random()); // isi hati, bukan cuma garis
      const x = 16 * Math.sin(t) ** 3;
      const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      p.set([x * 0.2 * s, y * 0.2 * s + 0.3, rnd(-0.7, 0.7) * (1 - s * 0.3)], i * 3);
      c.setHSL(rnd(0.93, 1.0) % 1, 0.9, rnd(0.5, 0.65));
      col.set([c.r, c.g, c.b], i * 3);
    }
    shapes.push(p); colors.push(col);
  }

  // 1 Saturnus (bola + cincin)
  {
    const p = new Float32Array(N * 3), col = new Float32Array(N * 3);
    const nSphere = Math.floor(N * 0.45);
    for (let i = 0; i < N; i++) {
      let x, y, z;
      if (i < nSphere) {
        const u = rnd(-1, 1), a = rnd(0, Math.PI * 2), r = 2 * Math.cbrt(Math.random());
        const s = Math.sqrt(1 - u * u);
        x = r * s * Math.cos(a); y = r * u; z = r * s * Math.sin(a);
        c.setHSL(rnd(0.07, 0.11), 0.9, rnd(0.45, 0.6));
      } else {
        const a = rnd(0, Math.PI * 2), r = rnd(2.8, 5.2);
        x = r * Math.cos(a); y = rnd(-0.06, 0.06); z = r * Math.sin(a);
        c.setHSL(rnd(0.09, 0.14), 0.7, r > 4 ? 0.7 : 0.55);
      }
      // miringkan seluruh planet 25 derajat
      const tilt = 0.44, ct = Math.cos(tilt), st = Math.sin(tilt);
      p.set([x * ct - y * st, x * st + y * ct, z], i * 3);
      col.set([c.r, c.g, c.b], i * 3);
    }
    shapes.push(p); colors.push(col);
  }

  // 2 Teks "I LOVE YOU" (diambil dari piksel canvas)
  {
    const cv = document.createElement("canvas");
    cv.width = 900; cv.height = 240;
    const ctx = cv.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.font = "bold 170px Arial, sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("I LOVE YOU", 450, 125);
    const d = ctx.getImageData(0, 0, 900, 240).data;
    const pts = [];
    for (let y = 0; y < 240; y += 2)
      for (let x = 0; x < 900; x += 2)
        if (d[(y * 900 + x) * 4 + 3] > 128) pts.push([(x - 450) / 70, -(y - 125) / 70]);
    const p = new Float32Array(N * 3), col = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const q = pts[(Math.random() * pts.length) | 0];
      p.set([q[0], q[1], rnd(-0.15, 0.15)], i * 3);
      c.setHSL(rnd(0.5, 0.58), 1, rnd(0.55, 0.7));
      col.set([c.r, c.g, c.b], i * 3);
    }
    shapes.push(p); colors.push(col);
  }

  // 3 (dihapus, nomor dikosongkan)
  shapes.push(null); colors.push(null);

  // 4 Pelukan: diisi adegan di bawah
  shapes.push(new Float32Array(N * 3)); colors.push(new Float32Array(N * 3));

  // 5 Nebula (awan berwarna)
  {
    const p = new Float32Array(N * 3), col = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const R = 4.2;
      p.set([gauss() * R, gauss() * R * 0.7, gauss() * R], i * 3);
      c.setHSL(rnd(0.55, 0.78), 0.85, rnd(0.45, 0.65));
      col.set([c.r, c.g, c.b], i * 3);
    }
    shapes.push(p); colors.push(col);
  }

  // 6 Bunga besar (kelopak, putik, batang, daun)
  {
    const p = new Float32Array(N * 3), col = new Float32Array(N * 3);
    const nCenter = Math.floor(N * 0.085), nPetal = Math.floor(N * 0.66), nStem = Math.floor(N * 0.115), nLeaf = Math.floor(N * 0.115);
    const CY = 1.6, PETALS = 8;
    for (let i = 0; i < N; i++) {
      let x, y, z;
      if (i < nCenter) { // putik: pola spiral bunga matahari
        const k = i / nCenter, a = i * 2.39996, r = 0.62 * Math.sqrt(k);
        x = r * Math.cos(a); y = CY + r * Math.sin(a); z = 0.25 + (1 - k) * 0.1;
        c.setHSL(rnd(0.09, 0.14), 0.95, rnd(0.5, 0.62));
      } else if (i < nCenter + nPetal) { // kelopak
        const k = i - nCenter, pi = k % PETALS, a = (pi / PETALS) * Math.PI * 2 + Math.PI / 2;
        const sLen = Math.sqrt(Math.random()), r = 0.55 + sLen * 1.9;
        const wid = Math.sin(Math.PI * Math.pow(sLen, 0.8)) * 0.62 * rnd(-1, 1);
        x = Math.cos(a) * r - Math.sin(a) * wid; y = CY + Math.sin(a) * r + Math.cos(a) * wid;
        z = sLen * 0.5 - 0.1 + (pi % 2) * 0.12;
        c.setHSL(rnd(0.93, 0.99) % 1, 0.85, 0.5 + sLen * 0.22);
      } else if (i < nCenter + nPetal + nStem) { // batang melengkung
        const u = Math.random();
        y = CY - 0.4 - u * 5.2; x = 0.22 * Math.sin(u * 3.2) + gauss() * 0.04; z = gauss() * 0.04;
        c.setHSL(rnd(0.3, 0.36), 0.7, rnd(0.35, 0.5));
      } else { // dua daun
        const side = i % 2 ? 1 : -1, s0 = Math.random();
        const baseY = side > 0 ? -2.0 : -3.0, ang = side * 0.65;
        const len = s0 * 1.7, wid = Math.sin(Math.PI * s0) * 0.38 * rnd(-1, 1);
        x = 0.1 + Math.sin(ang) * len + Math.cos(ang) * wid;
        y = baseY + Math.cos(ang) * len * 0.5 - Math.sin(ang) * wid * 0.3 * side;
        z = gauss() * 0.05;
        c.setHSL(rnd(0.28, 0.35), 0.75, rnd(0.38, 0.55));
      }
      p.set([x, y - 0.2, z], i * 3);
      col.set([c.r, c.g, c.b], i * 3);
    }
    shapes.push(p); colors.push(col);
  }

  return { shapes, colors };
}

// ---------- Adegan dua orang (pelukan, memberi bunga, jalan bersama, menari) ----------
const smooth = (a, b, x) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
const mix2 = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
const elbow2 = (s, h) => [(s[0] + h[0]) / 2, (s[1] + h[1]) / 2 - 0.3];

// x = posisi pinggul, f = arah hadap (1 kanan, -1 kiri), w = fase langkah, amp = besar langkah
// hF/hB = tangan depan/belakang, dy = naik-turun badan, rot = putaran badan (radian)
function makePerson(x, f, lean, w, amp, hF, hB, dy, rot) {
  dy = dy || 0; rot = rot || 0;
  const sh = [x + lean * f, 0.9 + dy];
  return {
    head: [x + lean * f * 1.3, 1.75 + dy], neck: [x + lean * f * 1.1, 1.05 + dy], hip: [x, -1 + dy], sh,
    footL: [x + 0.2 + Math.sin(w) * 0.55 * amp, -3 + Math.max(0, Math.cos(w)) * 0.25 * amp],
    footR: [x - 0.2 - Math.sin(w) * 0.55 * amp, -3 + Math.max(0, -Math.cos(w)) * 0.25 * amp],
    hF, hB, eF: elbow2(sh, hF), eB: elbow2(sh, hB), rot,
  };
}

// Sutradara: tiap fungsi mengembalikan pose kedua orang untuk waktu t
function directorGive(t) { // memberi bunga lalu berpelukan (siklus 15 detik)
  const tt = t % 15;
  const walk = smooth(0, 3.2, tt), stepIn = smooth(7.8, 9.5, tt), hug = smooth(9.0, 10.5, tt);
  const AX = mix2([-6 + 4.6 * walk, 0], [-0.62, 0], stepIn)[0], BX = mix2([6 - 4.8 * walk, 0], [0.62, 0], stepIn)[0];
  const moving = tt < 3.2 || (tt > 7.8 && tt < 9.5), amp = moving ? 1 : 0, w = tt * 7, sw = Math.sin(w) * 0.35 * amp;

  let hA = mix2([AX + 0.25 + sw, -0.2], [AX + 1.15, 0.55], smooth(3.4, 4.6, tt));
  hA = mix2(hA, [AX + 0.25, -0.2], smooth(6.4, 7.4, tt));
  hA = mix2(hA, [BX + 0.4, 0.35], hug);
  const hAb = mix2([AX - 0.25 - sw, -0.2], [BX + 0.4, -0.2], hug);
  const A = makePerson(AX, 1, 0.1 + 0.12 * smooth(3.2, 4.4, tt) + 0.1 * hug, w, amp, hA, hAb);

  let hB = mix2([BX - 0.25 - sw, -0.2], [-0.25, 0.5], smooth(5.0, 6.2, tt));
  hB = mix2(hB, [BX - 0.3, 0.2], smooth(6.6, 7.6, tt));
  hB = mix2(hB, [AX - 0.4, 0.35], hug);
  const hBb = mix2([BX + 0.25 + sw, -0.2], [AX - 0.4, -0.2], hug);
  const B = makePerson(BX, -1, 0.08 + 0.1 * hug, w + 1, amp, hB, hBb);

  const holder = tt < 6.3 ? hA : hB;
  return {
    A, B, hearts: { t0: 10.4, cx: (AX + BX) / 2, gap: 0.35 }, tt,
    flower: { base: holder, tip: [holder[0] + 0.12, holder[1] + 0.95], bloom: [holder[0] + 0.12, holder[1] + 1.05] },
  };
}

function directorHug(t) { // berlari saling mendekat lalu berpelukan erat (siklus 12 detik)
  const tt = t % 12, run = smooth(0, 2.8, tt), open = smooth(1.3, 2.4, tt), wrap = smooth(2.8, 4.0, tt);
  const AX = -6 + 5.38 * run, BX = 6 - 5.38 * run, moving = tt < 2.8, amp = moving ? 1 : 0, w = tt * 9, sw = Math.sin(w) * 0.45 * amp;
  const rock = Math.sin(t * 1.6) * 0.1 * wrap;

  let aF = mix2([AX + 0.25 + sw, -0.2], [AX + 1.1, 0.6], open); aF = mix2(aF, [BX + 0.4, 0.35], wrap);
  let aB = mix2([AX - 0.25 - sw, -0.2], [AX + 0.9, 0.2], open); aB = mix2(aB, [BX + 0.4, -0.2], wrap);
  let bF = mix2([BX - 0.25 - sw, -0.2], [BX - 1.1, 0.6], open); bF = mix2(bF, [AX - 0.4, 0.35], wrap);
  let bB = mix2([BX + 0.25 + sw, -0.2], [BX - 0.9, 0.2], open); bB = mix2(bB, [AX - 0.4, -0.2], wrap);
  const A = makePerson(AX + rock, 1, 0.1 + 0.18 * wrap, w, amp, aF, aB);
  const B = makePerson(BX + rock, -1, 0.1 + 0.15 * wrap, w + 1, amp, bF, bB);
  return { A, B, hearts: { t0: 4.2, cx: (AX + BX) / 2, gap: 0.35, period: 7 }, tt };
}

function directorWalk(t) { // berjalan berdampingan sambil bergandengan tangan
  const w = t * 5.5, sw = Math.sin(w) * 0.4, bob = Math.abs(Math.sin(w)) * 0.08;
  const AX = -0.8, BX = 0.8, hold = [0, -0.35];
  const A = makePerson(AX, 1, 0.06, w, 1, hold, [AX - 0.25 - sw, -0.2], bob);
  const B = makePerson(BX, 1, 0.06, w + 0.8, 1, [BX + 0.25 + sw, -0.2], hold, bob);
  return { A, B, hearts: { t0: 1, cx: 0, gap: 0.5, period: 7 }, scroll: -t * 2.4, tt: t };
}

function directorDance(t) { // dansa pelan, lalu si pink berputar di bawah tangan pasangannya
  const p = t % 8, sway = Math.sin(t * 1.6) * 0.25, AX = -0.7 + sway, BX = 0.7 + sway, mid = (AX + BX) / 2;
  const raise = smooth(3.2, 4.0, p) * (1 - smooth(6.4, 7.2, p)), spin = smooth(3.8, 6.2, p);
  const clasp = [mid, 0.5 + raise * 1.0], w = t * 3.5;
  const A = makePerson(AX, 1, 0.1 * Math.sin(t * 1.6), w, 0.35, clasp, [BX - 0.35, 0.0], 0.03 * Math.sin(t * 3.2));
  const B = makePerson(BX, -1, -0.1 * Math.sin(t * 1.6), w + 1, 0.35, mix2([BX + 0.1, 0.0], [BX + 0.4, 0.2], raise), clasp, 0.03 * Math.sin(t * 3.2), Math.PI * 2 * spin);
  return { A, B, hearts: { t0: 1, cx: mid, gap: 0.6, period: 9 }, tt: t };
}

function buildPeopleScene(director, hasFlower) {
  const pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
  const part = new Uint8Array(N), u = new Float32Array(N), jit = new Float32Array(N * 3);
  const c = new THREE.Color();
  const nP = Math.floor(N * 0.36), nF = Math.floor(N * 0.1);
  const startB = nP, startF = nP * 2, startH = nP * 2 + nF;
  const nH = N - startH, HEARTS = 10, perHeart = Math.floor(nH / HEARTS);
  const HUE = [0.55, 0.92]; // orang A biru, orang B pink
  // part: 0 kepala, 1 badan, 2 kaki kiri, 3 kaki kanan, 4 lengan depan, 5 lengan belakang,
  //       6 batang bunga, 7 kuntum, 8 hati, 9 tanah

  for (let i = 0; i < N; i++) {
    if (i < startF) {
      const who = i < startB ? 0 : 1, k = (i - who * nP) / nP;
      if (k < 0.18) { part[i] = 0;
        const v = new THREE.Vector3(gauss(), gauss(), gauss()).normalize().multiplyScalar(0.45 * Math.cbrt(Math.random()));
        jit.set([v.x, v.y, v.z], i * 3); c.setHSL(HUE[who], 0.7, rnd(0.65, 0.8));
      } else {
        part[i] = k < 0.41 ? 1 : k < 0.54 ? 2 : k < 0.67 ? 3 : k < 0.835 ? 4 : 5;
        u[i] = Math.random();
        const w = part[i] === 1 ? 0.16 : 0.07;
        jit.set([gauss() * w, gauss() * w * 0.4, gauss() * w], i * 3);
        c.setHSL(HUE[who], 0.85, rnd(0.5, 0.65));
      }
    } else if (i < startH) {
      const k = (i - startF) / nF;
      if (!hasFlower) { part[i] = 9; u[i] = Math.random(); jit.set([0, gauss() * 0.03, gauss() * 0.6], i * 3); c.setHSL(0.62, 0.5, rnd(0.25, 0.45)); }
      else if (k < 0.55) { part[i] = 6; u[i] = Math.random(); jit.set([gauss() * 0.03, 0, gauss() * 0.03], i * 3); c.setHSL(rnd(0.3, 0.36), 0.75, 0.45); }
      else { part[i] = 7; u[i] = rnd(0, Math.PI * 2); jit[i * 3] = Math.sqrt(Math.random());
        c.setHSL(jit[i * 3] < 0.3 ? 0.12 : rnd(0.94, 0.99) % 1, 0.9, 0.6); }
    } else {
      part[i] = 8; u[i] = rnd(-Math.PI, Math.PI); jit[i * 3] = Math.sqrt(Math.random());
      c.setHSL(rnd(0.94, 1.0) % 1, 0.95, rnd(0.6, 0.72));
    }
    col.set([c.r, c.g, c.b], i * 3);
  }

  const lerp2 = (p, q, k) => [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k];

  function update(t) {
    const d = director(t), A = d.A, B = d.B, fl = d.flower, hr = d.hearts, scroll = d.scroll || 0;
    for (let i = 0; i < N; i++) {
      const pt = part[i], uu = u[i], jx = jit[i * 3], jy = jit[i * 3 + 1], jz = jit[i * 3 + 2];
      let x, y, z = jz;
      if (pt <= 5) {
        const P = i < startB ? A : B;
        let q;
        if (pt === 0) q = [P.head[0] + jx, P.head[1] + jy];
        else if (pt === 1) q = lerp2(P.neck, P.hip, uu);
        else if (pt === 2) q = lerp2(P.hip, P.footL, uu);
        else if (pt === 3) q = lerp2(P.hip, P.footR, uu);
        else {
          const sh = P.sh, e = pt === 4 ? P.eF : P.eB, h = pt === 4 ? P.hF : P.hB;
          q = uu < 0.5 ? lerp2(sh, e, uu * 2) : lerp2(e, h, (uu - 0.5) * 2);
        }
        x = q[0] + (pt === 0 ? 0 : jx); y = q[1] + (pt === 0 ? 0 : jy);
        z += i < startB ? 0.12 : -0.12;
        if (P.rot && pt !== 5) { // putar badan pada sumbu tegak (lengan yang menggandeng tetap di tempat)
          const dx = x - P.hip[0];
          x = P.hip[0] + dx * Math.cos(P.rot); z += dx * Math.sin(P.rot);
        }
      } else if (pt === 6) {
        const q = lerp2(fl.base, fl.tip, uu); x = q[0] + jx; y = q[1]; z = jz;
      } else if (pt === 7) {
        const r = 0.3 * (0.65 + 0.35 * Math.abs(Math.cos(2.5 * uu))) * jx;
        x = fl.bloom[0] + r * Math.cos(uu); y = fl.bloom[1] + r * Math.sin(uu); z = 0.05 * jx;
      } else if (pt === 9) { // tanah (bergeser saat berjalan)
        x = (((uu * 20 + scroll) % 20) + 20) % 20 - 10; y = -3.15 + jy; z = jz;
      } else { // hati-hati kecil yang melayang naik
        const hi = Math.min(HEARTS - 1, Math.floor((i - startH) / perHeart));
        let local = d.tt - hr.t0 - hi * hr.gap;
        if (hr.period) local = ((local % hr.period) + hr.period) % hr.period;
        let sz = 0, hx = hr.cx, hy = 0.3;
        if (local > 0 && local < 3.8) {
          sz = Math.min(1, local * 2) * (1 - smooth(3.1, 3.8, local));
          hx = hr.cx + Math.sin(hi * 2.3 + local * 1.3) * (0.7 + (hi % 3) * 0.3);
          hy = 1.2 + local * 1.05;
        }
        const sc = 0.034 * sz * (0.65 + 0.35 * ((hi % 3) / 2)) * jx;
        x = hx + sc * 16 * Math.sin(uu) ** 3;
        y = hy + sc * (13 * Math.cos(uu) - 5 * Math.cos(2 * uu) - 2 * Math.cos(3 * uu) - Math.cos(4 * uu));
        z = 0.1;
      }
      pos[i * 3] = x; pos[i * 3 + 1] = y - 0.3; pos[i * 3 + 2] = z;
    }
  }
  update(0);
  return { pos, col, update };
}

const { shapes, colors } = makeShapes();
const people = buildPeopleScene(directorGive, true);          // mode 7
const hugScene = buildPeopleScene(directorHug, false);        // mode 4
const walkScene = buildPeopleScene(directorWalk, false);      // mode 12
const danceScene = buildPeopleScene(directorDance, false);    // mode 13
shapes[4] = hugScene.pos; colors[4] = hugScene.col;
shapes.push(people.pos);
colors.push(people.col);
const dyn = buildDynamic();
for (const m of [9, 10]) { shapes[m] = dyn.M[m].pos; colors[m] = dyn.M[m].col; dyn.update(m, 0); }
shapes[12] = walkScene.pos; colors[12] = walkScene.col;
shapes[13] = danceScene.pos; colors[13] = danceScene.col;
const sceneModes = { 4: hugScene, 7: people, 12: walkScene, 13: danceScene };

// ---------- Mode animasi tambahan (9 kupu-kupu, 10 lubang hitam) ----------
function buildDynamic() {
  const c = new THREE.Color();
  const mk = () => ({ pos: new Float32Array(N * 3), col: new Float32Array(N * 3) });
  const M = [null, null, null, null, null, null, null, null, null, mk(), mk()];
  const fract = (x) => x - Math.floor(x);
  const put = (m, i, h, sat, l, k) => {
    c.setHSL(((h % 1) + 1) % 1, sat, l);
    const a = M[m].col, kk = k === undefined ? 1 : k;
    a[i * 3] = c.r * kk; a[i * 3 + 1] = c.g * kk; a[i * 3 + 2] = c.b * kk;
  };
  const upd = {};

  // 9: Kupu-kupu (kurva kupu-kupu, sayapnya mengepak)
  {
    const bx = new Float32Array(N), by = new Float32Array(N), kind = new Uint8Array(N);
    const nBody = Math.floor(N * 0.06), nAnt = Math.floor(N * 0.02);
    for (let i = 0; i < N; i++) {
      if (i < nBody) { kind[i] = 1; bx[i] = gauss() * 0.05; by[i] = rnd(-1.9, 1.6); put(9, i, 0.1, 0.8, 0.35); }
      else if (i < nBody + nAnt) {
        kind[i] = 1; const side = i % 2 ? 1 : -1, u = Math.random();
        bx[i] = side * 1.1 * Math.pow(u, 1.3); by[i] = 1.6 + 1.7 * u; put(9, i, 0.12, 0.8, 0.55);
      } else {
        const th = rnd(0, 24 * Math.PI), r = Math.exp(Math.sin(th)) - 2 * Math.cos(4 * th) + Math.pow(Math.sin((2 * th - Math.PI) / 24), 5);
        const s = Math.sqrt(Math.random()) * 0.85;
        bx[i] = Math.sin(th) * r * s; by[i] = Math.cos(th) * r * s;
        const dist = Math.hypot(bx[i], by[i]);
        if (Math.random() < 0.05) put(9, i, 0.1, 0.2, 0.95); else put(9, i, 0.09 - dist * 0.07, 0.95, 0.55);
      }
    }
    upd[9] = (t) => {
      const flap = 0.3 + 0.7 * Math.abs(Math.cos(t * 3.2)), bob = Math.sin(t * 1.7) * 0.3, P9 = M[9].pos;
      for (let i = 0; i < N; i++) {
        const x = bx[i], j = i * 3;
        if (kind[i]) { P9[j] = x; P9[j + 1] = by[i] + bob; P9[j + 2] = 0; }
        else { P9[j] = x * flap; P9[j + 1] = by[i] + bob; P9[j + 2] = Math.abs(x) * (1 - flap) * 0.6; }
      }
    };
  }

  // 10: Lubang hitam (cakram, cincin foton, semburan)
  {
    const nDisc = Math.floor(N * 0.8), nRing = Math.floor(N * 0.1);
    const a0 = new Float32Array(N), ph = new Float32Array(N), gy = new Float32Array(N), kind = new Uint8Array(N);
    for (let i = 0; i < N; i++) {
      a0[i] = rnd(0, Math.PI * 2); ph[i] = Math.random(); gy[i] = gauss(); kind[i] = i < nDisc ? 0 : i < nDisc + nRing ? 1 : 2;
    }
    const ct = Math.cos(0.55), st = Math.sin(0.55);
    upd[10] = (t) => {
      const P = M[10].pos, C = M[10].col;
      for (let i = 0; i < N; i++) {
        let x, y, z, j = i * 3;
        if (kind[i] === 0) {
          const rr = 6.2 - ((ph[i] + t * 0.09) % 1) * 4.8, ang = a0[i] + 5.5 / Math.sqrt(rr);
          x = rr * Math.cos(ang); z = rr * Math.sin(ang); y = gy[i] * 0.04 * rr;
          const f = (rr - 1.4) / 4.8;
          if (f < 0.15) c.setHSL(0.58, 0.6, 0.85); else c.setHSL(0.11 - (f - 0.15) * 0.12, 0.95, 0.62 - f * 0.25);
        } else if (kind[i] === 1) {
          const ang = a0[i] + t * 2.5, rr = 1.3 + gy[i] * 0.03;
          x = rr * Math.cos(ang); z = rr * Math.sin(ang); y = gy[i] * 0.03; c.setHSL(0.58, 0.4, 0.92);
        } else {
          const uu = (ph[i] + t * 0.45) % 1, sgn = i % 2 ? 1 : -1, rr = gy[i] * (0.08 + uu * 0.25);
          y = sgn * (1.4 + uu * 4.5); x = rr * Math.cos(a0[i]); z = rr * Math.sin(a0[i]); c.setHSL(0.6, 0.9, 0.65 - uu * 0.3);
        }
        P[j] = x; P[j + 1] = y * ct - z * st; P[j + 2] = y * st + z * ct;
        C[j] = c.r; C[j + 1] = c.g; C[j + 2] = c.b;
      }
    };
  }

  return { M, update: (m, t) => upd[m](t) };
}

// ---------- Partikel ----------
const geo = new THREE.BufferGeometry();
const pos = new Float32Array(shapes[5]);
const col = new Float32Array(colors[5]);
geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
geo.setAttribute("color", new THREE.BufferAttribute(col, 3));

const dot = document.createElement("canvas"); // titik bulat lembut
dot.width = dot.height = 64;
{
  const x = dot.getContext("2d");
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.4, "rgba(255,255,255,.6)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
}
const mat = new THREE.PointsMaterial({
  size: 0.14, map: new THREE.CanvasTexture(dot), vertexColors: true,
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
});
const points = new THREE.Points(geo, mat);
const group = new THREE.Group();
group.add(points);
scene.add(group);

// ---------- State ----------
let mode = 5;
let target = { x: 0, y: 0, s: 1 };
let spin = 0.003;
let sceneStart = 0;
const ACTIVE = [0, 1, 2, 4, 5, 6, 7, 9, 10, 12, 13]; // mode yang dipakai (sesuai urutan daftar)
const guideItems = [...document.querySelectorAll(".guide li")];
const modeName = document.getElementById("modeName");

function setMode(m) {
  mode = m;
  if (sceneModes[m]) sceneStart = clock.getElapsedTime();
  modeName.textContent = MODE_NAMES[m];
  guideItems.forEach((li) => li.classList.toggle("on", +li.dataset.mode === m));
}
setMode(5);
guideItems.forEach((li) => li.addEventListener("click", () => setMode(+li.dataset.mode)));

addEventListener("keydown", (e) => {
  if (e.key >= "1" && e.key <= "9") setMode(ACTIVE[+e.key - 1]);   // angka = urutan daftar di layar
  if (e.key === "0") setMode(ACTIVE[9]);
  const at = ACTIVE.indexOf(mode);
  if (e.key === "ArrowRight") setMode(ACTIVE[(at + 1) % ACTIVE.length]);
  if (e.key === "ArrowLeft") setMode(ACTIVE[(at + ACTIVE.length - 1) % ACTIVE.length]);
});

// ---------- Animasi ----------
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  if (sceneModes[mode]) sceneModes[mode].update(t - sceneStart);
  else if (mode === 9 || mode === 10) dyn.update(mode, t);
  const tp = shapes[mode], tc = colors[mode];
  const kp = (mode === 4 || mode >= 7) ? 0.22 : 0.06, kc = (mode === 9 || mode === 10) ? 0.25 : 0.06;

  for (let i = 0; i < N * 3; i++) {
    pos[i] += (tp[i] - pos[i]) * kp;
    col[i] += (tc[i] - col[i]) * kc;
  }
  geo.attributes.position.needsUpdate = true;
  geo.attributes.color.needsUpdate = true;

  // teks harus tetap menghadap depan, bentuk lain berputar
  const still = [2, 4, 7, 9, 10, 12, 13].includes(mode);
  const wantSpin = still ? 0 : mode === 5 ? 0.002 : 0.006;
  spin += (wantSpin - spin) * 0.05;
  if (still) {
    const ry = mode === 2 ? 0 : Math.sin(t * 0.4) * 0.3; // adegan sedikit bergoyang agar terasa 3D
    group.rotation.y += (ry - group.rotation.y) * 0.08;
  } else group.rotation.y += spin;

  const pulse = mode === 0 ? 1 + Math.sin(t * 4) * 0.04 : 1; // hati berdetak
  group.position.x += (target.x - group.position.x) * 0.15;
  group.position.y += (target.y - group.position.y) * 0.15;
  const s = group.scale.x + (target.s * pulse - group.scale.x) * 0.15;
  group.scale.setScalar(s);

  renderer.render(scene, camera);
}
animate();

// ---------- Kamera + MediaPipe ----------
const video = document.getElementById("cam");
const status = document.getElementById("status");
const startBtn = document.getElementById("startBtn");

startBtn.addEventListener("click", async () => {
  startBtn.disabled = true;
  status.style.color = "";
  status.textContent = "Memuat model tangan, tunggu sebentar...";
  try {
    const { HandLandmarker, FilesetResolver } = await import(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs"
    );
    const fileset = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
    );
    const landmarker = await HandLandmarker.createFromOptions(fileset, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
      },
      runningMode: "VIDEO",
      numHands: 1,
    });

    const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
    video.srcObject = stream;
    await video.play();
    video.style.display = "block";
    document.getElementById("start").style.display = "none";
    document.getElementById("hud").hidden = false;
    trackLoop(landmarker);
  } catch (err) {
    console.error(err);
    status.style.color = "";
    status.textContent = "Gagal: " + (err.message || err) +
      ". Pastikan kamera diizinkan dan halaman dibuka lewat localhost (Live Server).";
    startBtn.disabled = false;
  }
});

const d2 = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

function readGesture(lm) {
  // jari terangkat jika ujungnya lebih tinggi (y lebih kecil) dari sendi PIP
  const up = [[8, 6], [12, 10], [16, 14], [20, 18]].map(([t, p]) => lm[t].y < lm[p].y);
  const count = up.filter(Boolean).length;
  const palm = d2(lm[0], lm[9]);
  const thumbOut = d2(lm[4], lm[17]) > palm * 1.15;

  if (count === 0) return thumbOut ? 6 : 0;          // jempol -> bunga, kepal -> hati
  if (count === 1 && up[0]) return thumbOut ? 4 : 1; // jempol+telunjuk -> pelukan, telunjuk -> Saturnus
  if (count === 1 && up[3]) return thumbOut ? 13 : 7;// jempol+kelingking -> menari, kelingking -> memberi bunga
  if (count === 2 && up[0] && up[1]) return 2;       // telunjuk+tengah (peace) -> I LOVE YOU
  if (count === 2 && up[0] && up[3]) return 9;       // telunjuk+kelingking -> kupu-kupu
  if (count === 2 && up[2] && up[3]) return 12;      // manis+kelingking -> jalan bersama
  if (count === 4) return thumbOut ? 5 : 10;         // 5 jari -> nebula, 4 jari -> lubang hitam
  return -1;                                         // gestur lain (jari tengah sendiri, dll) diabaikan
}

let candidate = -1, streak = 0, lastTime = -1;
function trackLoop(landmarker) {
  function loop() {
    requestAnimationFrame(loop);
    if (video.readyState < 2 || video.currentTime === lastTime) return;
    lastTime = video.currentTime;
    const res = landmarker.detectForVideo(video, performance.now());
    if (res.landmarks && res.landmarks.length) {
      const lm = res.landmarks[0];
      const g = readGesture(lm);
      // gestur harus stabil 5 frame supaya tidak berkedip; gestur tak dikenal (-1) diabaikan
      if (g === candidate) streak++; else { candidate = g; streak = 1; }
      if (g >= 0 && streak === 5 && g !== mode) setMode(g);

      const palm = d2(lm[0], lm[9]);
      target.x = (lm[9].x - 0.5) * -14;
      target.y = (0.5 - lm[9].y) * 9;
      target.s = Math.min(1.8, Math.max(0.6, palm * 6)); // dekatkan tangan = lebih besar
    } else {
      target.x *= 0.95; target.y *= 0.95; target.s += (1 - target.s) * 0.05;
    }
  }
  loop();
}
