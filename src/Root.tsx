// Composition registry. "SkillReference" is the skill's own demo short, rendered only by the health check
// to prove the look engine runs on the runner; it is never published. Episodes register here from Phase 4.
import React from "react";
import { Composition } from "remotion";
import { BridgeShort, BRIDGE_FRAMES } from "./vendor/bridge/Bridge";
import { HealthCard, HEALTH_FRAMES, HEALTH_DEFAULT, healthMetadata } from "./health/HealthCard";
import { Episodes } from "./episodes.generated";
import { Stick3DTest } from "./tests/Stick3DTest";

export const Root: React.FC = () => (
  <>
    <Composition id="SkillReference" component={BridgeShort} durationInFrames={BRIDGE_FRAMES} fps={30} width={1080} height={1920} />
    <Episodes />
    <Composition id="Stick3DTest" component={Stick3DTest} durationInFrames={90} fps={30} width={1080} height={1920} />
    <Composition id="HealthCard" component={HealthCard} defaultProps={HEALTH_DEFAULT} calculateMetadata={healthMetadata} durationInFrames={HEALTH_FRAMES} fps={30} width={1080} height={1920} />
  </>
);
