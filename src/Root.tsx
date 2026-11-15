import "./index.css";
import "./fonts";
import { Composition } from "remotion";
import { LAUNCH_DEMO_FRAMES, LaunchReelDemo } from "./styles/launch-reel/Demo";
import { DEMO_FRAMES, PaperBlueprintDemo } from "./styles/paper-blueprint/Demo";
import { LightSwarmDemo, SWARM_DEMO_FRAMES } from "./styles/light-swarm";
import { DOC_DEMO_FRAMES, DocumentaryDemo, DocumentaryWorlds, WORLD_LOOKS } from "./styles/documentary";
import { STARTER_FRAMES, StarterVideo } from "./styles/documentary/starter/Video";
import { HOLO_FPS, HOLO_FRAMES, HOLO_LOOK, HoloVideo } from "./styles/hologram-hud";
import { ATOMIC_FPS, ATOMIC_FRAMES, ATOMIC_LOOK, AtomicVideo } from "./styles/atomic-age";
import { REEL_FPS, REEL_FRAMES, REEL_LOOK, ReelVideo } from "./styles/test-reel";
import { STICK_FPS, STICK_FRAMES, StickVideo } from "./styles/stick-toon";
import { SAT_FPS, SAT_FRAMES, SatelliteVideo } from "./styles/satellite-explainer";
import { COSMIC_FPS, COSMIC_FRAMES, COSMIC_LOOK, CosmicVideo } from "./styles/cosmic-web";
import { FLAP_FPS, FLAP_FRAMES, FLAP_LOOK, FlapVideo } from "./styles/split-flap";
import { LIGHTLOGO_FPS, LIGHTLOGO_FRAMES, LIGHTLOGO_LOOK, LightLogoVideo } from "./styles/light-logo";
import { DESK_FPS, DESK_FRAMES, DESK_LOOK, DeskVideo } from "./styles/studio-desk";
import { ArtMotionCompositions } from "./styles/art-motion";
import { V02 } from "./v02/Video";
import { V03 } from "./v03/Video";
import { V04 } from "./v04/Video";
import { V05 } from "./v05/Video";
import { V06 } from "./v06/Video";
import { V06Cover } from "./v06/Cover";
import { V07 } from "./v07/Video";
import { V08 } from "./v08/Video";
import { V09 } from "./v09/Video";
import { V10Rig } from "./v10/RigTest";
import { V10 } from "./v10/Video";
import { V11 } from "./v11/Video";
import { V12 } from "./v12/Video";
import { V30 } from "./v30/Video";
import { V31 } from "./v31/Video";
import { V33 } from "./v33/Video";
import { V36 } from "./v36/Video";
import { V40 } from "./v40/Video";
import { Cover5Comp } from "./v40/Covers";
import { Covers34 } from "./v36/Covers";
import { V34 } from "./v34/Video";
import { V35 } from "./v35/Video";
import { Covers } from "./v31/Covers";
import { V32 } from "./v32/Video";
import { V13 } from "./v13/Video";
import { V18 } from "./v18/Video";
import { V15 } from "./v15/Video";
import { V17 } from "./v17/Video";
import { V16 } from "./v16/Video";
import { V19 } from "./v19/Video";
import { V20 } from "./v20/Video";
import { V21 } from "./v21/Video";
import { V22 } from "./v22/Video";
import { V23 } from "./v23/Video";
import { V24 } from "./v24/Video";
import { V25 } from "./v25/Video";
import { V26 } from "./v26/Video";
import { V27 } from "./v27/Video";
import { V28 } from "./v28/Video";
import { V28Teaser } from "./v28/Teaser";
import { V29 } from "./v29/Video";
import { V37 } from "./v37/Video";
import { V37Cover } from "./v37/Cover";
import { V38 } from "./v38/Video";
import { V38Cover } from "./v38/Cover";
import { V39 } from "./v39/Video";
import { V41 } from "./v41/Video";
import { V42Compositions } from "./v42/Video";
import { V42ReelCompositions } from "./v42/Reel";
import { V43Compositions } from "./v43/Video";
import { V43CoverComposition } from "./v43/Cover";
import { V44Compositions } from "./v44/Video";
import { V45Compositions } from "./v45/Video";
import { V46Compositions } from "./v46/Video";
import { V47Compositions } from "./v47/Video";
import { V48Compositions } from "./v48/Video";
import { V49Compositions } from "./v49/Video";
import { V51Compositions } from "./v51/Video";
import { V52Compositions } from "./v52/Video";
import { V53Compositions } from "./v53/Video";
import { V54Compositions } from "./v54/Video";
import { V14 } from "./v14/Video";
import { FootageReelComps } from "./footage-starter/FootageReel";

// Every video = one <Composition>. The style demos below are the reference films / starter templates (see STYLES.md).
// They play silent: the films’ narration, music and effects are not shipped — each style’s pipeline/ folder says how to make yours.
// For each video of yours, register three: the film (with audio, for the Studio), "-Silent" (to render, then mux the
// mix) and "-Look" (a list of still times, to check frames cheaply before a full render).
export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* vertical narrated styles — demo = the reference film itself (silent) */}
      <Composition id="Style-HologramHUD" component={HoloVideo} durationInFrames={HOLO_FRAMES} fps={HOLO_FPS} width={1080} height={1920} />
      <Composition id="Style-HologramHUD-Look" component={HoloVideo} durationInFrames={HOLO_LOOK.length} fps={HOLO_FPS} width={1080} height={1920} defaultProps={{ times: HOLO_LOOK }} />
      <Composition id="Style-AtomicAge" component={AtomicVideo} durationInFrames={ATOMIC_FRAMES} fps={ATOMIC_FPS} width={1080} height={1920} />
      <Composition id="Style-AtomicAge-Look" component={AtomicVideo} durationInFrames={ATOMIC_LOOK.length} fps={ATOMIC_FPS} width={1080} height={1920} defaultProps={{ times: ATOMIC_LOOK }} />
      <Composition id="Style-TestReel" component={ReelVideo} durationInFrames={REEL_FRAMES} fps={REEL_FPS} width={1080} height={1920} />
      <Composition id="Style-TestReel-Look" component={ReelVideo} durationInFrames={REEL_LOOK.length} fps={REEL_FPS} width={1080} height={1920} defaultProps={{ times: REEL_LOOK }} />
      <Composition id="Style-Satellite" component={SatelliteVideo} durationInFrames={SAT_FRAMES} fps={SAT_FPS} width={1080} height={1920} />
      <Composition id="Style-StickToon" component={StickVideo} durationInFrames={STICK_FRAMES} fps={STICK_FPS} width={1080} height={1920} />
      <Composition id="Style-LaunchReel" component={LaunchReelDemo} durationInFrames={LAUNCH_DEMO_FRAMES} fps={30} width={1080} height={1920} />
      {/* Studio Desk: the course reel; your footage goes in demo/lib.ts → MEDIA (empty slots show placeholders) */}
      <Composition id="Style-StudioDesk" component={DeskVideo} durationInFrames={DESK_FRAMES} fps={DESK_FPS} width={1080} height={1920} />
      <Composition id="Style-StudioDesk-Look" component={DeskVideo} durationInFrames={DESK_LOOK.length} fps={DESK_FPS} width={1080} height={1920} defaultProps={{ times: DESK_LOOK }} />
      {/* horizontal */}
      <Composition id="Style-PaperBlueprint" component={PaperBlueprintDemo} durationInFrames={DEMO_FRAMES} fps={30} width={1920} height={1080} />
      {/* two-voice documentary (Canvas 2D): Starter = template for any topic · Worlds = 8 ready places · Documentary = reference-content demo */}
      <Composition id="Style-Documentary-Starter" component={StarterVideo} durationInFrames={STARTER_FRAMES} fps={30} width={1920} height={1080} />
      <Composition id="Style-Documentary-Worlds" component={DocumentaryWorlds} durationInFrames={WORLD_LOOKS} fps={30} width={1920} height={1080} />
      <Composition id="Style-Documentary" component={DocumentaryDemo} durationInFrames={DOC_DEMO_FRAMES} fps={30} width={1920} height={1080} />
      {/* 3D: render with --gl=angle --concurrency=1 (cosmic-web also --timeout=300000; build its data first: node tools/v18-web.mjs && node tools/v18-zel.mjs) */}
      <Composition id="Style-LightSwarm" component={LightSwarmDemo} durationInFrames={SWARM_DEMO_FRAMES} fps={30} width={1920} height={1080} />
      <Composition id="Style-CosmicWeb" component={CosmicVideo} durationInFrames={COSMIC_FRAMES} fps={COSMIC_FPS} width={1920} height={1080} />
      <Composition id="Style-CosmicWeb-Look" component={CosmicVideo} durationInFrames={COSMIC_LOOK.length} fps={COSMIC_FPS} width={1920} height={1080} defaultProps={{ stills: true }} />
      {/* 3D on the beat: a split-flap board (countdowns, launches) and a logo written in light (brand intros). For a 4K master register the same component at 3840×2160. */}
      <Composition id="Style-SplitFlap" component={FlapVideo} durationInFrames={FLAP_FRAMES} fps={FLAP_FPS} width={1920} height={1080} />
      <Composition id="Style-SplitFlap-Look" component={FlapVideo} durationInFrames={FLAP_LOOK.length} fps={FLAP_FPS} width={1920} height={1080} defaultProps={{ times: FLAP_LOOK }} />
      <Composition id="Style-LightLogo" component={LightLogoVideo} durationInFrames={LIGHTLOGO_FRAMES} fps={LIGHTLOGO_FPS} width={1920} height={1080} />
      <Composition id="Style-LightLogo-Look" component={LightLogoVideo} durationInFrames={LIGHTLOGO_LOOK.length} fps={LIGHTLOGO_FPS} width={1920} height={1080} defaultProps={{ times: LIGHTLOGO_LOOK }} />
      {/* v2 · Art Motion: 36 moving-painting styles (Art-<Style>) + 9 explainer grammars (Explainer-<Style>) + Art-Story / Art-Poem / Art-Journey.
          Card: styles/art-motion.md. Your video: cp src/art-starter/StoryVideo.tsx src/v01/Video.tsx → import { V01 } from "./v01/Video"; <V01 /> */}
      <ArtMotionCompositions />
      <FootageReelComps />
      <V02 />
      <V03 />
      <V04 />
      <V05 />
      <V06 />
      <V06Cover />
      <V07 />
      <V08 />
      <V09 />
      <V10Rig />
      <V10 />
      <V11 />
      <V12 />
      <V13 />
      <V18 />
      <V15 />
      <V17 />
      <V16 />
      <V19 />
      <V20 />
      <V21 />
      <V22 />
      <V23 />
      <V24 />
      <V25 />
      <V26 />
      <V27 />
      <V28 />
      <V28Teaser />
      <V29 />
      <V30 />
      <V31 />
      <V33 />
      <V36 />
      <V40 />
      <Cover5Comp />
      <Covers34 />
      <V34 />
      <V35 />
      <Covers />
      <V32 />
      <V14 />
      <V37 />
      <V37Cover />
      <V38 />
      <V38Cover />
      <V39 />
      <V41 />
      <V42Compositions />
      <V42ReelCompositions />
      <V43Compositions />
      <V43CoverComposition />
      <V44Compositions />
      <V45Compositions />
      <V46Compositions />
      <V47Compositions />
      <V48Compositions />
      <V49Compositions />
      <V51Compositions />
      <V52Compositions />
      <V53Compositions />
      <V54Compositions />
      {/* your videos: <Composition id="V01" component={Video01} durationInFrames={…} fps={30} width={1080} height={1920} /> */}
    </>
  );
};
