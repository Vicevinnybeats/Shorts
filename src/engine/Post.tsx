// The skill's post chain (vendor ink / lens blur / grade) in the order the skill measured:
// ink -> lens pre -> lens main -> bloom (emissive only) -> NEUTRAL tone map -> grade.
// CPU budget: no MSAA (the ink pass hides aliasing), bloom on 5 levels. Toggle any pass with `budget`.
import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { getInputProps } from "remotion";
import { EffectComposer } from "@react-three/postprocessing";
import { BlendFunction, BloomEffect, ToneMappingEffect, ToneMappingMode, EffectComposer as PPComposer, EffectPass } from "postprocessing";
import { InkPass } from "../vendor/bridge/ink";
import { LensBlurEffect } from "../vendor/bridge/lensblur";
import { GradeEffect, GRADES, GRADE_STRENGTH, gradeFor } from "../vendor/bridge/grade";

const msaa = () => Number((getInputProps() as { msaa?: number }).msaa ?? 0);
export type PostState = { focus: number; cInf: number; grade: "day" | "golden"; ink?: boolean; lens?: boolean; bloom?: boolean; off?: boolean };

export const usePost = (ink: Partial<ConstructorParameters<typeof InkPass>[2]> = {}) => {
  const { camera, scene } = useThree();
  const fx = useMemo(() => {
    const bloom = new BloomEffect({ blendFunction: BlendFunction.ADD, intensity: 0.6, luminanceThreshold: 1.0, luminanceSmoothing: 0.2, mipmapBlur: true, levels: 5, radius: 0.6 });
    const mip = bloom.mipmapBlurPass;
    const setSize = mip.setSize.bind(mip);
    mip.setSize = (w: number, h: number) => setSize(Math.round((1920 * w) / Math.max(h, 1)) / 2, 960);
    const inkPass = new InkPass(scene, camera as THREE.PerspectiveCamera, ink);
    // the ink pass copies its result back into the composer's buffer with a full-screen quad: it must not touch
    // that buffer's depth, or the lens blur after it would read a flat depth (everything out of focus)
    ["compMat", "copyMat", "maskMat"].forEach((k) => {
      const m = (inkPass as unknown as Record<string, THREE.Material | undefined>)[k];
      if (m) { m.depthWrite = false; m.depthTest = false; }
    });
    return {
      ink: inkPass,
      // CPU budget: one gather pass (the skill runs a 16-tap pre + 64-tap main + 32 near taps); same CoC model
      lens: new LensBlurEffect({ maxCoC: 20, nearScale: 1.2, stage: { taps: 28, spread: 0.96, nearTaps: 10, rot: 0.3 } } as never),
      bloom,
      tone: new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }),
      grade: new GradeEffect(GRADES.day, GRADE_STRENGTH.day),
    };
  }, [camera, scene]);
  useEffect(() => () => fx.ink.dispose(), [fx]);
  return fx;
};

export const PostChain: React.FC<{ fx: ReturnType<typeof usePost>; st: PostState }> = ({ fx, st }) => {
  fx.lens.focus = Math.max(0.05, st.focus);
  fx.lens.cInf = st.cInf;
  gradeFor(fx.grade, st.grade);
  const ink = st.ink !== false, lens = st.lens !== false && st.ink !== false, bloom = st.bloom === true; // bloom: opt-in (≈ +4 s/frame on CPU)
  const ref = useRef<PPComposer>(null);
  // CPU budget: no MSAA, so the composer has no usable depth for the lens blur. The ink pass already renders the
  // world's depth (characters excluded: they take the depth of the ground right behind them), so the lens passes
  // read that instead. Re-pointed every frame because the composer re-wires depth when it (re)builds its passes.
  const inkDepth = (fx.ink as unknown as { rt: THREE.WebGLRenderTarget }).rt.depthTexture;
  ref.current?.passes.forEach((p) => {
    if (p instanceof EffectPass && inkDepth && (p as unknown as { effects: unknown[] }).effects.includes(fx.lens))
      p.setDepthTexture(inkDepth, THREE.BasicDepthPacking);
  });
  // The composer rebuilds its passes whenever its children change, so the element list is memoised on the toggles
  // only (per-frame values go through the effect objects above). cInf 0 makes the lens blur a pass-through.
  const chain = useMemo(() => (
    <EffectComposer ref={ref} multisampling={msaa()}>
      {[
        ink ? <primitive key="ink" object={fx.ink} dispose={null} /> : null,
        lens ? <primitive key="lm" object={fx.lens} dispose={null} /> : null,
        bloom ? <primitive key="bl" object={fx.bloom} dispose={null} /> : null,
        <primitive key="tm" object={fx.tone} dispose={null} />,
        <primitive key="gr" object={fx.grade} dispose={null} />,
      ].filter(Boolean) as React.ReactElement[]}
    </EffectComposer>
  ), [fx, ink, lens, bloom]);
  return st.off ? null : chain;
};
