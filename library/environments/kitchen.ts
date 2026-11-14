// Library environment: a kitchen at insect scale (1 unit = 1 mm). Painted tile floor with dark grout seams,
// butter-yellow wall, wooden skirting board with a crack (an ant nest entrance), table legs, cabinets far away.
// Every surface uses the skill's two-tone world shading and hand-painted canvas textures; nothing is downloaded.
import * as THREE from "three";
import { ctex, rep, jit } from "../../src/vendor/bridge/paint";
import { twoTone } from "../../src/vendor/bridge/shade";

const lam = (o: THREE.MeshLambertMaterialParameters) => twoTone(new THREE.MeshLambertMaterial(o));
export const TILE = 300;

/** 2x2 tiles per texture (600 mm), cream ceramic with soft painted mottling and dark seams painted in. */
const tiles = () => ctex("kitchenTiles", 1024, 1024, (g, r) => {
  const n = 2, s = 1024 / n, grout = 9;
  g.fillStyle = "#5b4a3f"; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const base = jit(r, (i + j) % 2 ? "#efe2c8" : "#e9d8b8", 0.04, 3, 0.1);
    const x = i * s + grout / 2, y = j * s + grout / 2, w = s - grout;
    g.fillStyle = base; g.fillRect(x, y, w, w);
    for (let k = 0; k < 90; k++) { // painted mottling
      g.fillStyle = jit(r, base, 0.06, 4, 0.2) + "55";
      const rr = 8 + r() * 40; g.beginPath(); g.ellipse(x + r() * w, y + r() * w, rr, rr * (0.4 + r() * 0.6), r() * 3, 0, 7); g.fill();
    }
    const gr = g.createLinearGradient(x, y, x + w, y + w); // glaze sheen
    gr.addColorStop(0, "rgba(255,255,255,0.18)"); gr.addColorStop(0.5, "rgba(255,255,255,0)"); gr.addColorStop(1, "rgba(120,90,60,0.10)");
    g.fillStyle = gr; g.fillRect(x, y, w, w);
    g.strokeStyle = "rgba(60,40,30,0.35)"; g.lineWidth = 3; g.strokeRect(x + 2, y + 2, w - 4, w - 4); // bevel seam
  }
  for (let k = 0; k < 40; k++) { g.fillStyle = "rgba(90,70,55,0.35)"; g.fillRect(r() * 1024, r() * 1024, 2 + r() * 3, 2 + r() * 3); } // grit
});

const wall = () => ctex("kitchenWall", 512, 512, (g, r) => {
  g.fillStyle = "#f2d98e"; g.fillRect(0, 0, 512, 512);
  for (let k = 0; k < 160; k++) { g.fillStyle = jit(r, "#f2d98e", 0.05, 4, 0.2) + "40"; g.fillRect(r() * 512, r() * 512, 20 + r() * 60, 4 + r() * 10); }
});

const wood = () => ctex("skirtingWood", 1024, 256, (g, r) => {
  g.fillStyle = "#9b5f36"; g.fillRect(0, 0, 1024, 256);
  for (let k = 0; k < 60; k++) {
    g.strokeStyle = jit(r, "#7d4626", 0.15, 5, 0.2); g.lineWidth = 1 + r() * 3;
    const y = r() * 256; g.beginPath(); g.moveTo(0, y);
    for (let x = 0; x <= 1024; x += 64) g.lineTo(x, y + Math.sin(x / 90 + k) * 6 + (r() - 0.5) * 4);
    g.stroke();
  }
  g.fillStyle = "rgba(255,230,190,0.25)"; g.fillRect(0, 0, 1024, 26); // lit top edge
});

const cabinet = () => ctex("cabinetDoor", 512, 768, (g, r) => {
  g.fillStyle = "#7fb6a6"; g.fillRect(0, 0, 512, 768);
  g.fillStyle = "#6ea392"; g.fillRect(48, 48, 416, 672);
  g.strokeStyle = "#3d5f56"; g.lineWidth = 10; g.strokeRect(48, 48, 416, 672);
  g.fillStyle = "#d9c38a"; g.beginPath(); g.ellipse(420, 384, 14, 46, 0, 0, 7); g.fill();
  for (let k = 0; k < 80; k++) { g.fillStyle = jit(r, "#6ea392", 0.06, 4, 0.2) + "40"; g.fillRect(r() * 512, r() * 768, 30 + r() * 80, 3); }
});

const crumbTex = () => ctex("crumb", 256, 256, (g, r) => {
  g.fillStyle = "#c98a3e"; g.fillRect(0, 0, 256, 256);
  for (let k = 0; k < 140; k++) { g.fillStyle = jit(r, k % 3 ? "#e3b26a" : "#9a5a24", 0.12, 6, 0.2); g.beginPath(); g.arc(r() * 256, r() * 256, 3 + r() * 9, 0, 7); g.fill(); }
});

/** lumpy rock-like crumb, radius ~size */
export const crumb = (size: number, seed: number) => {
  const geo = new THREE.IcosahedronGeometry(size, 1);
  const pos = geo.attributes.position; let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < pos.count; i++) pos.setXYZ(i, pos.getX(i) * (0.75 + rnd() * 0.5), pos.getY(i) * (0.55 + rnd() * 0.35), pos.getZ(i) * (0.75 + rnd() * 0.5));
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, lam({ map: crumbTex(), flatShading: true }));
  m.castShadow = m.receiveShadow = true;
  return m;
};

/** sugar crystal: a bright faceted cube; emissive above 1.0 so the bloom pass makes it glitter */
export const sugar = (size: number, glow = 1.6) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(size, size * 0.9, size * 1.05),
    new THREE.MeshLambertMaterial({ color: "#ffffff", emissive: new THREE.Color("#fff4e0"), emissiveIntensity: glow }));
  m.castShadow = true;
  return m;
};

export type Kitchen = { root: THREE.Group; tableLegs: THREE.Mesh[]; crack: THREE.Vector3 };

/** Builds the room. The nest crack sits at the origin in the skirting board; the room opens toward +z. */
export const buildKitchen = (): Kitchen => {
  const root = new THREE.Group();
  const floorT = rep(tiles(), 12, 12);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(7200, 7200), lam({ map: floorT }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 3000); floor.receiveShadow = true;
  // tile seams at multiples of 300: shift the texture so a seam crosses z = 300, 600 ...
  floorT.offset.set(0.25, 0.5);
  root.add(floor);

  const wallM = new THREE.Mesh(new THREE.PlaneGeometry(7200, 2400), lam({ map: rep(wall(), 8, 3) }));
  wallM.position.set(0, 1200, -40); wallM.receiveShadow = true; root.add(wallM);

  const skirt = new THREE.Mesh(new THREE.BoxGeometry(7200, 110, 22), lam({ map: rep(wood(), 7, 1) }));
  skirt.position.set(0, 55, -29); skirt.castShadow = skirt.receiveShadow = true; root.add(skirt);
  // the crack: a dark notch in the board (the nest entrance)
  const crack = new THREE.Mesh(new THREE.BoxGeometry(9, 7, 4), new THREE.MeshBasicMaterial({ color: "#120a08" }));
  crack.position.set(0, 3.5, -17.5); root.add(crack);

  // table: four legs and a top far overhead
  const legM = lam({ map: rep(wood(), 1, 6), color: "#f0d2a8" });
  const tableLegs = [[95, 760], [95, 1660], [1095, 760], [1095, 1660]].map(([x, z]) => {
    const l = new THREE.Mesh(new THREE.CylinderGeometry(20, 24, 740, 20), legM);
    l.position.set(x, 370, z); l.castShadow = l.receiveShadow = true; root.add(l); return l;
  });
  const top = new THREE.Mesh(new THREE.BoxGeometry(1300, 32, 1100), lam({ map: rep(wood(), 2, 2), color: "#f4d6ae" }));
  top.position.set(595, 756, 1210); top.castShadow = true; root.add(top);

  // far cabinets + counter (blurred, fogged: sets the room scale)
  const doorM = lam({ map: cabinet() });
  for (let i = -5; i <= 5; i++) {
    const c = new THREE.Mesh(new THREE.BoxGeometry(590, 880, 580), [lam({ color: "#6ea392" }), lam({ color: "#6ea392" }), lam({ color: "#e9e2d2" }), lam({ color: "#6ea392" }), lam({ color: "#6ea392" }), doorM]);
    c.position.set(i * 600, 440, 3600); c.rotation.y = Math.PI; c.receiveShadow = true; root.add(c);
  }
  const counter = new THREE.Mesh(new THREE.BoxGeometry(6600, 40, 640), lam({ color: "#e9e2d2" }));
  counter.position.set(0, 900, 3600); root.add(counter);
  const fridge = new THREE.Mesh(new THREE.BoxGeometry(700, 1800, 650), lam({ color: "#f4f2ec" }));
  fridge.position.set(-2400, 900, 2600); root.add(fridge);

  // scattered crumbs (the boulder field), fixed seeds so every render tab builds the same room
  [[14, 228, 6], [-32, 260, 3], [40, 410, 4], [-60, 520, 2.5], [25, 980, 3.5], [-18, 1320, 2], [70, 1200, 5]].forEach(([x, z, s], i) => {
    const c = crumb(s, 11 + i * 7); c.position.set(x, s * 0.45, z); c.rotation.y = i; root.add(c);
  });
  return { root, tableLegs, crack: new THREE.Vector3(0, 0, -14) };
};
