// Separate entry for the V42 reel (lets the reel be rendered while the main Root is busy): npx remotion render src/v42/reel-entry.tsx V42-Reel-Silent …
import { registerRoot } from "remotion";
import { V42ReelCompositions } from "./Reel";
registerRoot(V42ReelCompositions);
