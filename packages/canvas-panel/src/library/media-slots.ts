import type { ComplexTimelineController } from "react-iiif-vault/canvas-panel/scene";
import { createContext } from "react";

export type MediaActions = {
  play(): Promise<void>;
  pause(): void;
  togglePlay(): Promise<void>;
  mute(): void;
  unmute(): void;
  toggleMute(): void;
  seek(seconds: number): void;
  setVolume(volume: number): void;
};
export type MediaMetadata = { label: string; summary: string };
export type MediaSlotSnapshot = Readonly<
  MediaMetadata & {
    key: string;
    slotName: string;
    canvasId: string;
    resourceId: string;
    strategy: "media" | "complex-timeline";
    mediaType: "audio" | "video" | "timeline";
    ready: boolean;
    canSeek: boolean;
    currentTime: number;
    duration: number | null;
    paused: boolean;
    muted: boolean;
    volume: number;
    buffering: boolean;
    error: string | null;
    actions: Readonly<MediaActions>;
  }
>;

/** One registry per element; media identity is an attachment, never just a resource URL. */
export function createMediaSlots(host: HTMLElement) {
  let sequence = 0;
  let snapshot: readonly MediaSlotSnapshot[] = Object.freeze([]);
  const listeners = new Set<() => void>();
  const publish = (next: readonly MediaSlotSnapshot[]) => {
    snapshot = Object.freeze(next);
    for (const listener of listeners) listener();
  };
  return {
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    attachTimeline(timeline: ComplexTimelineController["store"], canvasId: string, metadata: MediaMetadata) {
      const key = `timeline-${++sequence}`;
      const slotName = snapshot.some((entry) => entry.slotName === "timeline-controls")
        ? `timeline-controls-${sequence}`
        : "timeline-controls";
      let active = true;
      const actions: Readonly<MediaActions> = Object.freeze({
        async play() {
          if (active) timeline.getState().play();
        },
        pause() {
          if (active) timeline.getState().pause();
        },
        async togglePlay() {
          if (active) timeline.getState().playPause();
        },
        mute() {
          if (active) timeline.getState().mute();
        },
        unmute() {
          if (active) timeline.getState().unmute();
        },
        toggleMute() {
          if (active) timeline.getState().toggleMute();
        },
        seek(seconds: number) {
          const state = timeline.getState();
          if (
            active &&
            state.isReady &&
            !state.unseekableMedia.length &&
            Number.isFinite(seconds) &&
            seconds >= 0 &&
            seconds <= state.duration
          )
            state.setTime(seconds);
        },
        setVolume(volume: number) {
          if (active && Number.isFinite(volume) && volume >= 0 && volume <= 1)
            timeline.getState().setVolume(volume * 100);
        },
      });
      const update = () => {
        if (!active) return;
        const state = timeline.getState();
        const next: MediaSlotSnapshot = Object.freeze({
          ...metadata,
          key,
          slotName,
          canvasId,
          resourceId: canvasId,
          strategy: "complex-timeline",
          mediaType: "timeline",
          ready: state.isReady,
          canSeek: state.isReady && !state.unseekableMedia.length,
          // Publish controls at 10 Hz; the upstream controller retains its full-resolution clock.
          currentTime: Math.floor(state.primeTime * 10) / 10,
          duration: Number.isFinite(state.duration) ? state.duration : null,
          paused: !state.isPlaying,
          muted: state.isMuted,
          volume: state.volume / 100,
          buffering: state.isBuffering,
          error: state.playbackError ? String(state.playbackError) : null,
          actions,
        });
        const previous = snapshot.find((entry) => entry.key === key);
        if (
          previous &&
          Object.keys(next).every(
            (field) => next[field as keyof MediaSlotSnapshot] === previous[field as keyof MediaSlotSnapshot],
          )
        )
          return;
        publish(previous ? snapshot.map((entry) => (entry.key === key ? next : entry)) : [...snapshot, next]);
      };
      const unsubscribe = timeline.subscribe(update);
      update();
      return {
        setMetadata(next: MediaMetadata) {
          metadata = { ...next };
          update();
        },
        dispose() {
          active = false;
          unsubscribe();
          publish(snapshot.filter((entry) => entry.key !== key));
        },
      };
    },
    attach(
      player: HTMLMediaElement,
      canvasId: string,
      resourceId: string,
      mediaType: "audio" | "video",
      metadata: MediaMetadata = { label: "", summary: "" },
    ) {
      const key = `media-${++sequence}`;
      const primary = `${mediaType}-controls`;
      const slotName = snapshot.some((entry) => entry.slotName === primary) ? `${primary}-${sequence}` : primary;
      let active = true;
      let buffering = false;
      let error: string | null = null;
      const update = () => {
        if (!active) return;
        const next: MediaSlotSnapshot = Object.freeze({
          ...metadata,
          key,
          slotName,
          canvasId,
          resourceId,
          strategy: "media",
          mediaType,
          ready: player.readyState >= 1,
          canSeek: player.seekable.length > 0,
          currentTime: player.currentTime,
          duration: Number.isFinite(player.duration) ? player.duration : null,
          paused: player.paused,
          muted: player.muted,
          volume: player.volume,
          buffering,
          error,
          actions,
        });
        const previous = snapshot.find((entry) => entry.key === key);
        if (
          previous &&
          Object.keys(next).every(
            (field) => next[field as keyof MediaSlotSnapshot] === previous[field as keyof MediaSlotSnapshot],
          )
        )
          return;
        publish(previous ? snapshot.map((entry) => (entry.key === key ? next : entry)) : [...snapshot, next]);
      };
      const actions: Readonly<MediaActions> = Object.freeze({
        async play() {
          if (!active) return;
          error = null;
          try {
            await player.play();
          } catch (cause) {
            if (!active) return;
            error = cause instanceof Error ? cause.message : String(cause);
            host.dispatchEvent(new CustomEvent("media-action-error", { detail: { key, action: "play", error } }));
          }
          update();
        },
        pause() {
          if (active) player.pause();
        },
        async togglePlay() {
          if (!active) return;
          if (player.paused) await actions.play();
          else actions.pause();
        },
        mute() {
          if (active) player.muted = true;
        },
        unmute() {
          if (active) player.muted = false;
        },
        toggleMute() {
          if (active) player.muted = !player.muted;
        },
        seek(seconds: number) {
          if (!active || !Number.isFinite(seconds)) return;
          for (let i = 0; i < player.seekable.length; i++) {
            if (seconds >= player.seekable.start(i) && seconds <= player.seekable.end(i)) {
              player.currentTime = seconds;
              update();
              return;
            }
          }
        },
        setVolume(volume: number) {
          if (active && Number.isFinite(volume) && volume >= 0 && volume <= 1) player.volume = volume;
        },
      });
      const events = [
        "loadedmetadata",
        "durationchange",
        "timeupdate",
        "play",
        "pause",
        "ended",
        "volumechange",
        "waiting",
        "playing",
        "canplay",
        "error",
        "emptied",
        "seeking",
        "seeked",
        "progress",
      ];
      const onEvent = (event: Event) => {
        if (event.type === "waiting") buffering = true;
        if (["playing", "canplay", "pause", "ended", "emptied"].includes(event.type)) buffering = false;
        if (event.type === "error") error = player.error?.message || "Unable to load media";
        update();
      };
      for (const name of events) player.addEventListener(name, onEvent);
      update();
      return {
        key,
        actions,
        setMetadata(next: MediaMetadata) {
          metadata = { ...next };
          update();
        },
        dispose() {
          active = false;
          for (const name of events) player.removeEventListener(name, onEvent);
          player.pause();
          publish(snapshot.filter((entry) => entry.key !== key));
        },
      };
    },
  };
}
export type MediaSlots = ReturnType<typeof createMediaSlots>;
export const NativeMediaControlsContext = createContext(true);
export const MediaSlotsContext = createContext<MediaSlots | null>(null);

const clickActions = {
  play: "play",
  pause: "pause",
  "toggle-play": "togglePlay",
  mute: "mute",
  unmute: "unmute",
  "toggle-mute": "toggleMute",
} as const;

/** Bind only explicitly opted-in, directly assigned HTML. Framework-owned controls need no opt-in. */
export function bindMediaControls(slot: HTMLSlotElement, getState: () => MediaSlotSnapshot | undefined) {
  let roots: Element[] = [];
  const scrubbing = new Set<Element>();
  const owns = (root: Element, node: Element) => {
    for (let current: Element | null = node; current && current !== root; current = current.parentElement) {
      if (current.tagName.includes("-")) return false;
    }
    return root.contains(node) && !root.tagName.includes("-");
  };
  const controls = (root: Element) =>
    [root, ...root.querySelectorAll("[data-action], [data-bind]")].filter((node) => owns(root, node));
  const format = (value: number | null) =>
    value === null ? "--:--" : `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, "0")}`;
  const refresh = () => {
    const state = getState();
    for (const root of roots)
      for (const node of controls(root)) {
        const action = node.getAttribute("data-action");
        if (node instanceof HTMLButtonElement || node instanceof HTMLInputElement)
          node.disabled = !state?.ready || (action === "seek" && (!state.canSeek || state.duration === null));
        if (action === "toggle-mute") node.setAttribute("aria-pressed", String(state?.muted ?? false));
        if (action === "seek" && node instanceof HTMLInputElement) node.max = String(state?.duration ?? 0);
        const binding = node.getAttribute("data-bind");
        let value: number | string | null | undefined;
        if (binding === "label") value = state?.label ?? "";
        if (binding === "summary") value = state?.summary ?? "";
        if (binding === "current-time") value = state?.currentTime ?? 0;
        if (binding === "duration") value = state?.duration ?? null;
        if (binding === "volume") value = state?.volume ?? 1;
        if (binding === "play-label") value = state?.paused === false ? "Pause" : "Play";
        if (value === undefined) continue;
        const text =
          node.getAttribute("data-format") === "time" && typeof value !== "string"
            ? format(value)
            : String(value ?? "");
        if (node instanceof HTMLInputElement) {
          if (!scrubbing.has(node)) node.value = text;
        } else if (!node.children.length) node.textContent = text;
      }
  };
  const onEvent = (event: Event) => {
    if (event.defaultPrevented || !(event.target instanceof Element)) return;
    const root = event.currentTarget as Element;
    const node = event.target.closest("[data-action]");
    if (!node || !owns(root, node) || (node instanceof HTMLButtonElement && node.disabled)) return;
    const state = getState();
    if (!state?.ready) return;
    const action = node.getAttribute("data-action")!;
    if (event.type === "click" && node instanceof HTMLButtonElement && Object.hasOwn(clickActions, action)) {
      void state.actions[clickActions[action as keyof typeof clickActions]]();
    }
    if (node instanceof HTMLInputElement && node.type === "range") {
      if (action === "seek" && event.type === "input") scrubbing.add(node);
      if (action === "seek" && event.type === "change") {
        scrubbing.delete(node);
        state.actions.seek(node.valueAsNumber);
      }
      if (event.type === "focusout") scrubbing.delete(node);
      if (action === "set-volume" && event.type === "input") state.actions.setVolume(node.valueAsNumber);
    }
    refresh();
  };
  const events = ["click", "input", "change", "focusout"];
  const remove = () => {
    for (const root of roots) {
      for (const name of events) root.removeEventListener(name, onEvent);
      for (const node of controls(root)) {
        if (node.hasAttribute("data-action") && (node instanceof HTMLButtonElement || node instanceof HTMLInputElement))
          node.disabled = true;
      }
    }
    scrubbing.clear();
  };
  const assign = () => {
    remove();
    const assigned = slot.assignedElements();
    roots = (assigned.length ? assigned : [...slot.children]).filter((root) =>
      root.hasAttribute("data-canvas-panel-bind"),
    );
    for (const root of roots) for (const name of events) root.addEventListener(name, onEvent);
    refresh();
  };
  slot.addEventListener("slotchange", assign);
  assign();
  return {
    refresh,
    dispose() {
      remove();
      slot.removeEventListener("slotchange", assign);
    },
  };
}
