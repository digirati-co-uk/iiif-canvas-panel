import { Vault } from "react-iiif-vault";

// The application and the panel share this resource cache.
export const vault = new Vault();
export const manifestId = "https://digirati-co-uk.github.io/wunder.json";

// Two real canvases from the Wunder manifest, used by the navigation controls.
export const ids = [
  "https://digirati-co-uk.github.io/wunder/canvases/2",
  "https://digirati-co-uk.github.io/wunder/canvases/3",
];

export const loadManifest = () => vault.loadManifest(manifestId);
