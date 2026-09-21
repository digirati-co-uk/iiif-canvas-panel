import type { DetailedHTMLProps, HTMLAttributes } from "react";
import type { CanvasPanelElement } from "@digirati/canvas-panel-web-components";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "canvas-panel": DetailedHTMLProps<HTMLAttributes<CanvasPanelElement>, CanvasPanelElement> & {
        "manifest-id"?: string;
        "canvas-id"?: string;
        "iiif-content"?: string;
        region?: string;
      };
    }
  }
}
