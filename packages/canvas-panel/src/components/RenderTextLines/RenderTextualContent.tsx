import type { Annotation } from "@iiif/parser/presentation-3/types";
import { useVault, VaultProvider } from "react-iiif-vault/core";
import { createElement as h } from "react";
import { HTMLPortal } from "../../atlas-components/HTMLPortal";
import { RenderTextFragment } from "./RenderTextFragment";

export function RenderTextualContent({
  annotation,
  textSelectionEnabled,
}: {
  annotation: Annotation;
  textSelectionEnabled?: boolean;
}) {
  const vault = useVault();

  if (!annotation?.motivation?.includes("supplementing") || !annotation.body) {
    return null;
  }

  return (
    <HTMLPortal
      target={{ ...(annotation.target as any).selector.spatial, x: 0, y: 0 }}
      interactive={textSelectionEnabled}
    >
      <VaultProvider vault={vault}>
        <svg
          height={(annotation.target as any).selector.spatial.height}
          width={(annotation.target as any).selector.spatial.width}
          style={{ userSelect: textSelectionEnabled ? "text" : undefined }}
        >
          <RenderTextFragment annotationId={annotation.id} interactive={textSelectionEnabled} relative />
        </svg>
      </VaultProvider>
    </HTMLPortal>
  );
}
