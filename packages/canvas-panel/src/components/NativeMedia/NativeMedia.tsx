import { createElement as h, useContext, useLayoutEffect, useRef, useCallback } from "react";
import { getValue } from "@iiif/helpers";
import { useCanvas, useManifest, type SingleAudio, type SingleVideo } from "react-iiif-vault/core";
import { MediaSlotsContext, NativeMediaControlsContext, type MediaSlots } from "../../library/media-slots";
import { MediaOutlet } from "./MediaOutlet";
import { RegisterPublicApi } from "../../hooks/use-register-public-api";

/** Browser media owns playback; slots and the legacy API share that same attachment. */
export function NativeMedia({ media, kind }: { media: SingleAudio | SingleVideo; kind: "audio" | "video" }) {
  const element = useRef<HTMLMediaElement>(null);
  const nativeControls = useContext(NativeMediaControlsContext);
  const store = useContext(MediaSlotsContext);
  const register = useContext(RegisterPublicApi);
  const canvas = useCanvas();
  const manifest = useManifest();
  const attachmentRef = useRef<ReturnType<MediaSlots["attach"]> | null>(null);
  const label = getValue(canvas?.label) || getValue(manifest?.label);
  const summary = getValue(canvas?.summary) || getValue(manifest?.summary);

  const metadata = useRef({ label, summary });
  metadata.current = { label, summary };
  const attach = useCallback(
    (player: HTMLMediaElement, resume = false) => {
      if (!store) return;
      element.current = player;
      const attachment = store.attach(player, canvas?.id || "", media.url, kind, metadata.current);
      attachmentRef.current = attachment;
      const actions = attachment.actions;
      if (resume) void actions.play();
      let host: any;
      let progress: HTMLElement | null = null;
      const updateProgress = () => {
        if (progress)
          progress.style.width = `${Number.isFinite(player.duration) && player.duration > 0 ? (player.currentTime / player.duration) * 100 : 0}%`;
      };
      const legacy = {
        ...actions,
        playPause: actions.togglePlay,
        setVolume: (volume: number) => {
          if (!Number.isFinite(volume) || volume < 0 || volume > 100) return;
          actions.unmute();
          actions.setVolume(volume / 100);
        },
        setDurationPercent: (percent: number) => actions.seek(percent * player.duration),
        setTime: (time: number | ((time: number) => number)) =>
          actions.seek(typeof time === "function" ? time(player.currentTime) : time),
      };
      register?.((el) => {
        host = el;
        host.mediaActions = legacy;
        host.mediaElement = element;
        host.setMediaProgressElement = (node: HTMLElement) => {
          progress = node;
          updateProgress();
        };
        host.dispatchEvent(new Event("media-displayed"));
        host.dispatchEvent(new Event(`${kind}-displayed`));
        return {};
      });
      player.addEventListener("timeupdate", updateProgress);
      return () => {
        attachment.dispose();
        attachmentRef.current = null;
        player.removeEventListener("timeupdate", updateProgress);
        if (host?.mediaActions === legacy) {
          delete host.mediaActions;
          delete host.mediaElement;
          delete host.setMediaProgressElement;
        }
      };
    },
    [store, register, canvas?.id, media.url, kind],
  );

  // Metadata updates must not replace the attachment or interrupt playback.
  useLayoutEffect(() => {
    attachmentRef.current?.setMetadata({ label, summary });
  }, [label, summary]);

  return h(
    "div",
    {
      className: `${kind}-container`,
      part: `${kind}-container`,
      style: {
        position: "absolute",
        inset: 0,
        zIndex: 13,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#000",
        pointerEvents: "auto",
      },
    },
    h(MediaOutlet, {
      kind,
      canvasId: canvas?.id || "",
      resourceId: media.url,
      annotationId: media.annotationId,
      slotName: kind,
      onPlayer: attach,
      nativeControls,
      style: { width: "100%", maxHeight: "100%" },
    }),
  );
}
