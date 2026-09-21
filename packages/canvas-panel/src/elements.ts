import { defineLayoutElements } from "./web-components/layout-container";
import { defineCanvasPanel } from "./web-components/canvas-panel";
import { defineImageService } from "./web-components/image-service";
import { defineSequencePanel } from "./web-components/sequence-panel";
import { defineMetadataPanel } from "./web-components/metadata-panel";
import { defineRangePanel } from "./web-components/range-panel";

export type { CanvasPanelElement, CanvasPanelEventMap } from "./types/element";

/** Register browser elements once. Safe to import on the server. */
export function defineCustomElements() {
  if (typeof customElements === "undefined") return;
  defineLayoutElements();
  defineCanvasPanel();
  defineImageService();
  defineSequencePanel();
  defineMetadataPanel();
  defineRangePanel();
}
