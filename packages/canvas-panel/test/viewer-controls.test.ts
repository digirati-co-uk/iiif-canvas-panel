// @vitest-environment happy-dom
import { expect, it, vi } from "vitest";
import { bindViewerControls } from "../src/library/viewer-controls";

it("binds opted-in overlay controls, follows live rotation and releases reassigned controls", () => {
  const host = document.createElement("div");
  document.body.append(host);
  const slot = document.createElement("slot");
  slot.name = "overlay";
  host.attachShadow({ mode: "open" }).append(slot);
  host.innerHTML = `<div slot="overlay" data-canvas-panel-bind>
    <button data-action="zoom-in" disabled><span>Zoom</span></button>
    <button data-action="rotate-left">Left</button>
    <button data-action="rotate-right">Right</button>
    <button data-action="reset-rotation">Reset</button>
    <input type="range" min="-360" max="360" data-action="set-view-rotation" data-bind="view-rotation">
    <input type="checkbox" data-action="set-touch-rotation" data-bind="touch-rotation">
    <output data-bind="view-rotation"></output>
    <custom-controls><button data-action="zoom-in">Owned</button></custom-controls>
  </div><div slot="overlay"><button data-action="zoom-in">Unbound</button></div>`;
  const api = { zoomIn: vi.fn(), rotateBy: vi.fn(), setViewRotation: vi.fn(), setTouchRotationEnabled: vi.fn() };
  Object.assign(host, api);
  let refresh = () => {};
  const unsubscribe = vi.fn();
  const runtime = {
    viewRotation: 45,
    touchRotationEnabled: true,
    registerHook: (_: string, cb: () => void) => {
      refresh = cb;
      return unsubscribe;
    },
  };
  const dispose = bindViewerControls(slot, runtime as any);
  const root = host.firstElementChild!;
  root.querySelector("span")!.click();
  expect(api.zoomIn).toHaveBeenCalledTimes(1);
  for (const action of ["rotate-left", "rotate-right", "reset-rotation"])
    root.querySelector<HTMLButtonElement>(`[data-action="${action}"]`)!.click();
  expect(api.rotateBy.mock.calls).toEqual([[-90], [90]]);
  expect(api.setViewRotation).toHaveBeenCalledWith(0);
  const range = root.querySelector<HTMLInputElement>('input[type="range"]')!;
  range.value = "125";
  range.dispatchEvent(new Event("input", { bubbles: true }));
  expect(api.setViewRotation).toHaveBeenLastCalledWith(125);
  const checkbox = root.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
  checkbox.click();
  expect(api.setTouchRotationEnabled).toHaveBeenCalledWith(false);
  runtime.viewRotation = -90;
  runtime.touchRotationEnabled = false;
  refresh();
  expect(root.querySelector("output")!.textContent).toBe("-90");
  expect(checkbox.checked).toBe(false);
  root.querySelector<HTMLButtonElement>("custom-controls button")!.click();
  host.lastElementChild!.querySelector("button")!.click();
  expect(api.zoomIn).toHaveBeenCalledTimes(1);
  root.removeAttribute("slot");
  slot.dispatchEvent(new Event("slotchange"));
  root.querySelector("span")!.click();
  expect(api.zoomIn).toHaveBeenCalledTimes(1);
  dispose();
  expect(unsubscribe).toHaveBeenCalledTimes(1);
  host.remove();
});
