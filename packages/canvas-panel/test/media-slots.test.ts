// @vitest-environment happy-dom
import { expect, it, vi } from "vitest";
import { bindMediaControls, createMediaSlots } from "../src/library/media-slots";

it("scopes attachments, validates actions and ignores rejected playback after disposal", async () => {
  const host = document.createElement("div");
  const store = createMediaSlots(host);
  const other = createMediaSlots(document.createElement("div"));
  const video = document.createElement("video");
  Object.defineProperties(video, {
    readyState: { value: 1 },
    duration: { value: 20 },
    seekable: { value: { length: 1, start: () => 2, end: () => 15 } },
  });
  video.pause = vi.fn();
  const first = store.attach(video, "canvas", "resource", "video");
  const second = store.attach(document.createElement("video"), "canvas", "resource", "video");
  expect(store.getSnapshot().map((slot) => slot.slotName)).toEqual(["video-controls", "video-controls-2"]);
  expect(other.getSnapshot()).toEqual([]);
  first.setMetadata({ label: "Updated title", summary: "A summary" });
  expect(store.getSnapshot()[0].label).toBe("Updated title");
  expect(store.getSnapshot()[0].actions).toBe(first.actions);
  const initial = store.getSnapshot();
  video.dispatchEvent(new Event("timeupdate"));
  expect(store.getSnapshot()).toBe(initial);
  first.actions.seek(NaN);
  first.actions.seek(19);
  expect(video.currentTime).toBe(0);
  first.actions.seek(5);
  expect(video.currentTime).toBe(5);
  first.actions.setVolume(2);
  expect(video.volume).toBe(1);
  first.actions.setVolume(0.5);
  expect(video.volume).toBe(0.5);
  const error = vi.fn();
  host.addEventListener("media-action-error", error);
  video.play = vi.fn().mockRejectedValue(new Error("Playback blocked"));
  await first.actions.play();
  expect(store.getSnapshot()[0].error).toBe("Playback blocked");
  expect(error).toHaveBeenCalledTimes(1);
  let reject!: (error: Error) => void;
  video.play = () =>
    new Promise((_resolve, failure) => {
      reject = failure;
    });
  const pending = first.actions.play();
  first.dispose();
  reject(new Error("Stale failure"));
  await pending;
  expect(error).toHaveBeenCalledTimes(1);
  expect(store.getSnapshot()).toHaveLength(1);
  first.actions.seek(10);
  expect(video.currentTime).toBe(5);
  second.dispose();
  expect(store.getSnapshot()).toEqual([]);
});

it("binds only opted-in roots, respects cancellation and releases replaced controls", () => {
  const root = document.createElement("div");
  root.setAttribute("data-canvas-panel-bind", "");
  root.innerHTML = `<button data-action="play">Play</button><span data-bind="duration" data-format="time"></span><h1 data-bind="label"></h1><p data-bind="summary"></p><canvas-panel><button data-action="play">Nested</button></canvas-panel>`;
  const slot = document.createElement("slot");
  let assigned = [root];
  slot.assignedElements = () => assigned;
  const play = vi.fn();
  let state: any = { ready: true, duration: null, label: "Title", summary: "<em>Plain text</em>", actions: { play } };
  const binding = bindMediaControls(slot, () => state);
  expect(root.querySelector("span")!.textContent).toBe("--:--");
  expect(root.querySelector("h1")!.textContent).toBe("Title");
  expect(root.querySelector("p")!.textContent).toBe("<em>Plain text</em>");
  expect(root.querySelector("em")).toBeNull();
  const button = root.querySelector("button")!;
  button.click();
  expect(play).toHaveBeenCalledTimes(1);
  root.querySelector("canvas-panel button")!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  expect(play).toHaveBeenCalledTimes(1);
  button.addEventListener("click", (event) => event.preventDefault(), { once: true });
  button.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  expect(play).toHaveBeenCalledTimes(1);
  state = undefined;
  binding.refresh();
  expect(button.disabled).toBe(true);
  assigned = [];
  slot.dispatchEvent(new Event("slotchange"));
  button.disabled = false;
  button.click();
  expect(play).toHaveBeenCalledTimes(1);
  binding.dispose();
});
