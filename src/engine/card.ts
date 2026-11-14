// 2D characters in the 3D world (the skill's core look): a Canvas2D drawing on a camera-facing plane, lit by the
// scene through the skill's card shader (cardshade.ts), on the NOINK layer (cards carry their own plum ink), with a
// soft contact blob under the feet. Drawings are cached per pose key, so a pose is drawn once per render tab.
import * as THREE from "three";
import { Pen } from "../vendor/bridge/toon";
import { NOINK } from "../vendor/bridge/ink";
import { cardShade, blobMaterial } from "../vendor/bridge/cardshade";

export type Draw = (p: Pen, g: CanvasRenderingContext2D) => void;

const blobTex = (() => {
  let t: THREE.Texture | null = null;
  return () => {
    if (t) return t;
    const c = document.createElement("canvas"); c.width = c.height = 128;
    const g = c.getContext("2d")!;
    const gr = g.createRadialGradient(64, 64, 4, 64, 64, 62);
    gr.addColorStop(0, "rgb(150,128,110)"); gr.addColorStop(0.5, "rgb(205,192,178)"); gr.addColorStop(1, "rgb(255,255,255)");
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };
})();

export class Card {
  readonly root = new THREE.Group();
  readonly mesh: THREE.Mesh;
  readonly blob: THREE.Mesh;
  private mat: THREE.MeshLambertMaterial;
  private static shared = new Map<string, THREE.CanvasTexture>();
  private cache: Map<string, THREE.CanvasTexture>;
  private key = "";
  private family: string;
  /** w x h world units; the drawing canvas is cw x ch px with the feet at (cw/2, footY) */
  constructor(readonly w: number, readonly h: number, readonly cw = 1000, readonly ch = 600, readonly footY = 575, blobW = 0.8, family = "") {
    // cards of one family (e.g. every ant) share drawings: a crowd costs no more canvases than one character
    this.cache = family ? Card.shared : new Map();
    this.family = family;
    this.mat = cardShade(new THREE.MeshLambertMaterial({ transparent: false, alphaTest: 0.5, side: THREE.DoubleSide }));
    const geo = new THREE.PlaneGeometry(w, h);
    geo.translate(0, h / 2 - h * (1 - footY / ch), 0);
    this.mesh = new THREE.Mesh(geo, this.mat);
    this.mesh.layers.set(NOINK);
    this.mesh.castShadow = true;
    this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, alphaTest: 0.5 });
    this.blob = new THREE.Mesh(new THREE.PlaneGeometry(w * blobW, w * blobW * 0.32), blobMaterial(blobTex()));
    this.blob.rotation.x = -Math.PI / 2;
    this.blob.position.y = 0.01;
    this.blob.layers.set(NOINK);
    this.root.add(this.blob, this.mesh);
  }
  /** Draws (or reuses) the pose `key`. */
  pose(key: string, draw: Draw) {
    if (key === this.key) return;
    const k = this.family + "/" + key;
    let t = this.cache.get(k);
    if (!t) {
      const c = document.createElement("canvas"); c.width = this.cw; c.height = this.ch;
      const g = c.getContext("2d")!;
      g.lineCap = "round"; g.lineJoin = "round";
      draw(new Pen(g), g);
      t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
      this.cache.set(k, t);
    }
    const first = !this.mat.map;   // swapping one texture for another needs no shader recompile
    this.mat.map = t; (this.mesh.customDepthMaterial as THREE.MeshDepthMaterial).map = t;
    if (first) { this.mat.needsUpdate = true; (this.mesh.customDepthMaterial as THREE.Material).needsUpdate = true; }
    this.key = key;
  }
  /** Cylindrical billboard: stands upright, turns to the camera; `facing` +1/-1 mirrors for walk direction. */
  place(pos: THREE.Vector3, cam: THREE.Camera, heading: number, scale = 1, lift = 0) {
    this.root.position.copy(pos);
    const dx = cam.position.x - pos.x, dz = cam.position.z - pos.z;
    const yaw = Math.atan2(dx, dz);
    this.mesh.rotation.set(0, yaw, 0);
    this.mesh.position.y = lift;
    // walking direction relative to the camera's right vector decides left/right facing
    const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
    const dir = new THREE.Vector3(Math.sin(heading), 0, Math.cos(heading));
    const s = dir.dot(right) >= 0 ? 1 : -1;
    this.mesh.scale.set(s * scale, scale, scale);
    this.blob.rotation.z = -yaw;
    this.blob.scale.setScalar(scale);
  }
}
