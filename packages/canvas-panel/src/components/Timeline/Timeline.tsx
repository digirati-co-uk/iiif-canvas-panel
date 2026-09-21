import { targetToPixels } from "../../helpers/target-to-pixels";
import { createElement as h, useContext, useLayoutEffect, useRef, useMemo, useCallback } from "react";
import { getValue } from "@iiif/helpers";
import { useCanvas, useManifest } from "react-iiif-vault/core";
import {
  useComplexTimelineStore,
  type SceneMediaProps,
  type ScenePresentation,
} from "react-iiif-vault/canvas-panel/scene";
import { HTMLPortal } from "../../atlas-components/HTMLPortal";
import { MediaSlotsContext } from "../../library/media-slots";
import { MediaOutlet } from "../NativeMedia/MediaOutlet";
import { SceneHTML } from "../AtlasCanvas/presentation";

/** This bridge subscribes to the upstream clock. It never creates a second player. */
export function TimelineControls() {
  const timeline = useComplexTimelineStore();
  const slots = useContext(MediaSlotsContext);
  const canvas = useCanvas();
  const manifest = useManifest();
  const attachment = useRef<ReturnType<NonNullable<typeof slots>["attachTimeline"]> | null>(null);
  const label = getValue(canvas?.label) || getValue(manifest?.label);
  const summary = getValue(canvas?.summary) || getValue(manifest?.summary);
  useLayoutEffect(() => {
    if (!slots || !canvas) return;
    const binding = slots.attachTimeline(timeline, canvas.id, { label, summary });
    attachment.current = binding;
    return () => {
      binding.dispose();
      attachment.current = null;
    };
  }, [slots, timeline, canvas?.id]);
  useLayoutEffect(() => {
    attachment.current?.setMetadata({ label, summary });
  }, [label, summary]);
  return null;
}

function TimelineMediaElement({ item, visible, controller }: SceneMediaProps) {
  const canvas = useCanvas();
  const attach = useCallback(
    (element: HTMLMediaElement) => controller?.attachMediaElement(item.annotationId, element),
    [controller, item.annotationId],
  );
  const kind = item.type === "Sound" ? "audio" : "video";
  return (
    <MediaOutlet
      kind={kind}
      canvasId={canvas?.id || ""}
      resourceId={item.url}
      annotationId={item.annotationId}
      slotName={`${kind}-${encodeURIComponent(item.annotationId)}`}
      onPlayer={attach}
      style={{
        display: kind === "audio" ? "none" : "block",
        width: "100%",
        height: "100%",
        opacity: visible ? 1 : 0,
        pointerEvents: "none",
      }}
    />
  );
}
export function TimelineMedia(props: SceneMediaProps) {
  const canvas = useCanvas();
  if (props.item.type === "Sound")
    return (
      <SceneHTML>
        <TimelineMediaElement {...props} />
      </SceneHTML>
    );
  const target = timelineTarget(props.item.target, canvas);
  return (
    <HTMLPortal target={target}>
      <TimelineMediaElement {...props} />
    </HTMLPortal>
  );
}

export const TimelineText: NonNullable<ScenePresentation["Text"]> = ({ item }) => {
  const canvas = useCanvas();
  const target = timelineTarget(item.target, canvas);
  const text = getValue(item.text);
  const plainText = useMemo(() => {
    // Parse in an inert template, then render text only: no scripts, styles or embedded resources enter the DOM.
    const template = document.createElement("template");
    template.innerHTML = text;
    return template.content.textContent || "";
  }, [text]);
  return (
    <HTMLPortal target={target}>
      <div
        data-timeline-text={item.annotationId}
        style={{ fontSize: Math.max(12, target.height / 5), whiteSpace: "pre-wrap" }}
      >
        {plainText}
      </div>
    </HTMLPortal>
  );
};

function timelineTarget(value: unknown, canvas?: { width: number; height: number }) {
  type Spatial = { x?: number; y?: number; width?: number; height?: number; unit?: "pixel" | "percent" };
  // Text targets in the current preview are selectors, despite their SupportedTarget type.
  const target = value as { spatial?: Spatial; selector?: { spatial?: Spatial } } | null;
  const spatial = target?.spatial || target?.selector?.spatial;
  const size = { width: canvas?.width || 1, height: canvas?.height || 1 };
  return targetToPixels(
    {
      x: spatial?.x ?? 0,
      y: spatial?.y ?? 0,
      width: spatial?.width ?? size.width,
      height: spatial?.height ?? size.height,
      unit: spatial?.unit || "pixel",
    },
    size,
  );
}
