// Blender-made props (.glb, built headless by .github/workflows/blender-models.yml from blender/models/*.py) in the
// Stick3D look: every mesh gets the engine's toon material (same 3-step ramp, colours + emissive from the model) and
// thick ink outlines, so the props sit with the puppets and the box props. Files live in library/models (saved for
// reuse) and are served through public/models -> ../library/models with staticFile. A missing file falls back to
// `fallback` (old box props), so renders never fail before a model exists.
import React, { useMemo, useState, useEffect } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { staticFile, delayRender, continueRender } from "remotion";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { INK } from "./toon";
import { V3 } from "./kit";

const ramp = (() => { const d = new Uint8Array([90, 170, 255]); const t = new THREE.DataTexture(d, 3, 1, THREE.RedFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
const pending = new Map<string, Promise<THREE.Object3D | null>>();
const done = new Map<string, THREE.Object3D | null>();

/** loads models/<name>.glb once (delayRender until ready); null if it does not exist */
export const useGlb = (name: string): THREE.Object3D | null => {
  const url = staticFile(`models/${name}.glb`);
  const [obj, setObj] = useState<THREE.Object3D | null>(done.get(url) ?? null);
  const [handle] = useState(() => (done.has(url) ? null : delayRender(`glb ${name}`, { timeoutInMilliseconds: 60000 })));
  useEffect(() => {
    if (handle === null) return;
    let p = pending.get(url);
    if (!p) {
      p = fetch(url).then((r) => (r.ok ? r.arrayBuffer() : null)).then((buf) => buf && buf.byteLength > 100
        ? new Promise<THREE.Object3D | null>((res) => new GLTFLoader().parse(buf, "", (g) => res(g.scene), () => res(null)))
        : null).catch(() => null);
      pending.set(url, p);
    }
    p.then((o) => { done.set(url, o); setObj(o); continueRender(handle); });
  }, [handle, url]);
  return obj;
};

/** a Blender prop in toon style with ink outlines; `fallback` renders while/if the model is missing */
export const Glb: React.FC<{ name: string; p?: V3; rot?: V3; s?: number | V3; line?: number; fallback?: React.ReactNode; tint?: number }> = ({ name, p = [0, 0, 0], rot = [0, 0, 0], s = 1, line = 3, fallback = null }) => {
  const src = useGlb(name);
  const { size } = useThree();
  const obj = useMemo(() => {
    if (!src) return null;
    const root = src.clone(true);
    const lm = new LineMaterial({ color: new THREE.Color(INK).getHex(), linewidth: line, resolution: new THREE.Vector2(size.width, size.height) });
    const meshes: THREE.Mesh[] = [];
    root.traverse((o) => { if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh); });
    for (const m of meshes) {
      const old = m.material as THREE.MeshStandardMaterial;
      const em = old.emissive && (old.emissive.r + old.emissive.g + old.emissive.b) > 0.01;
      m.material = em
        ? new THREE.MeshBasicMaterial({ color: old.emissive.clone().multiplyScalar(1.0), toneMapped: false })
        : new THREE.MeshToonMaterial({ color: old.color ?? new THREE.Color("#888"), gradientMap: ramp });
      const eg = new LineSegmentsGeometry(); eg.setPositions(new THREE.EdgesGeometry(m.geometry, 35).attributes.position.array as Float32Array);
      m.add(new LineSegments2(eg, lm));
    }
    return root;
  }, [src, size, line]);
  if (!obj) return <>{fallback}</>;
  const sc: V3 = typeof s === "number" ? [s, s, s] : s;
  return <primitive object={obj} position={p} rotation={rot} scale={sc} />;
};
