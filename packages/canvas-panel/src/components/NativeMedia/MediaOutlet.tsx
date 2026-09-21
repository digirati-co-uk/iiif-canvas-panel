import { useContext, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { SlotsContext } from "../../library/slots";

/** The fallback remains attached until an authored native player can actually play. */
export function MediaOutlet({
  kind,
  canvasId,
  resourceId,
  annotationId,
  slotName,
  onPlayer,
  style,
  nativeControls = false,
}: {
  kind: "audio" | "video";
  canvasId: string;
  resourceId: string;
  annotationId: string;
  slotName: string;
  onPlayer: (player: HTMLMediaElement, resume?: boolean) => (() => void) | undefined;
  style?: CSSProperties;
  nativeControls?: boolean;
}) {
  const slots = useContext(SlotsContext);
  const slot = useRef<HTMLSlotElement>(null);
  const fallback = useRef<HTMLMediaElement>(null);
  const [replacement, setReplacement] = useState(false);
  useLayoutEffect(() => {
    const outlet = slot.current!;
    const defaultPlayer = fallback.current!;
    setReplacement(false);
    let player = defaultPlayer;
    let cleanup = onPlayer(player);
    let failedPlayer: HTMLMediaElement | undefined;
    let releaseCandidate: (() => void) | undefined;
    const select = (next: HTMLMediaElement) => {
      if (next === player) return;
      const resume = !player.paused;
      const time = player.currentTime;
      next.volume = player.volume;
      next.muted = player.muted;
      for (let i = 0; i < next.seekable.length; i++) {
        if (time >= next.seekable.start(i) && time <= next.seekable.end(i)) {
          next.currentTime = time;
          break;
        }
      }
      cleanup?.();
      player.pause();
      player = next;
      setReplacement(next !== defaultPlayer);
      cleanup = onPlayer(next, resume);
    };
    const assign = () => {
      releaseCandidate?.();
      const candidates = outlet
        .assignedElements()
        .flatMap((root) =>
          root instanceof HTMLMediaElement ? [root] : [...root.querySelectorAll("[data-canvas-panel-media]")],
        )
        .filter(
          (node): node is HTMLMediaElement =>
            node instanceof HTMLMediaElement &&
            node.localName === kind &&
            node.closest("canvas-panel") === (outlet.getRootNode() as ShadowRoot).host,
        );
      const candidate = candidates.length === 1 ? candidates[0] : undefined;
      if (!candidate) {
        select(defaultPlayer);
        return;
      }
      const ready = () => {
        if (candidate !== failedPlayer && candidate.readyState >= 2 && !candidate.error) select(candidate);
      };
      const recovered = () => {
        failedPlayer = undefined;
        ready();
      };
      const failed = () => {
        failedPlayer = candidate;
        select(defaultPlayer);
      };
      candidate.addEventListener("loadeddata", recovered);
      candidate.addEventListener("canplay", recovered);
      candidate.addEventListener("error", failed);
      candidate.addEventListener("emptied", failed);
      if (candidate !== player) select(defaultPlayer);
      ready();
      releaseCandidate = () => {
        candidate.removeEventListener("loadeddata", recovered);
        candidate.removeEventListener("canplay", recovered);
        candidate.removeEventListener("error", failed);
        candidate.removeEventListener("emptied", failed);
      };
    };
    outlet.addEventListener("slotchange", assign);
    const observer = new MutationObserver(assign);
    const host = (outlet.getRootNode() as ShadowRoot).host;
    observer.observe(host, { childList: true, subtree: true });
    const name = slots?.getSnapshot().some((slot) => slot.slotName === slotName)
      ? `${slotName}-${encodeURIComponent(canvasId)}-${encodeURIComponent(annotationId)}`
      : slotName;
    outlet.name = name;
    const unmount = slots?.mount(outlet, {
      key: `${canvasId}:${annotationId}:${resourceId}`,
      slotName: name,
      type: "media",
      canvasId,
      resourceId,
      annotationId,
      mediaType: kind,
    });
    assign();
    return () => {
      observer.disconnect();
      outlet.removeEventListener("slotchange", assign);
      releaseCandidate?.();
      cleanup?.();
      player.pause();
      unmount?.();
    };
  }, [slots, kind, canvasId, resourceId, annotationId, slotName, onPlayer]);
  const Tag = kind;
  return (
    <div style={style} data-timeline-item={annotationId}>
      <Tag
        ref={fallback as any}
        src={resourceId}
        preload="auto"
        controls={nativeControls}
        hidden={replacement}
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
      />
      <div hidden={!replacement} inert={!replacement} style={{ width: "100%", height: "100%" }}>
        <slot ref={slot} name={slotName} />
      </div>
    </div>
  );
}
