import type { Runtime } from "@atlas-viewer/atlas/react";
import type { CanvasPanelElement } from "../types/element";

/** Opt-in HTML controls in the viewport overlay; framework-owned roots remain untouched. */
export function bindViewerControls(slot: HTMLSlotElement, runtime: Runtime) {
  const host = (slot.getRootNode() as ShadowRoot).host as CanvasPanelElement;
  let roots: Element[] = [];
  const owns = (root: Element, node: Element) => {
    for (let current: Element | null = node; current; current = current.parentElement) {
      if (current.tagName.includes("-")) return false;
      if (current === root) return true;
    }
    return false;
  };
  const controls = (root: Element) =>
    [root, ...root.querySelectorAll("[data-action], [data-bind]")].filter((node) => owns(root, node));
  const buttons = {
    "zoom-in": () => host.zoomIn(),
    "zoom-out": () => host.zoomOut(),
    "go-home": () => host.goHome(),
    "rotate-left": () => host.rotateBy(-90),
    "rotate-right": () => host.rotateBy(90),
    "reset-rotation": () => host.setViewRotation(0),
  };
  const isAction = (action: string) =>
    Object.hasOwn(buttons, action) || action === "set-view-rotation" || action === "set-touch-rotation";
  const refresh = () => {
    for (const root of roots)
      for (const node of controls(root)) {
        const action = node.getAttribute("data-action") || "";
        if (isAction(action) && (node instanceof HTMLButtonElement || node instanceof HTMLInputElement))
          node.disabled = false;
        const binding = node.getAttribute("data-bind");
        if (binding === "touch-rotation" && node instanceof HTMLInputElement && node.type === "checkbox") {
          node.checked = runtime.touchRotationEnabled;
        }
        if (binding === "view-rotation") {
          const value = String(Math.round(runtime.viewRotation * 10) / 10);
          if (node instanceof HTMLInputElement) {
            if (node !== node.ownerDocument.activeElement && node.value !== value) node.value = value;
          } else if (!node.children.length && node.textContent !== value) node.textContent = value;
        }
      }
  };
  const onEvent = (event: Event) => {
    if (event.defaultPrevented || !(event.target instanceof Element)) return;
    const root = event.currentTarget as Element;
    const node = event.target.closest("[data-action]");
    if (!node || !owns(root, node)) return;
    if (!(node instanceof HTMLButtonElement || node instanceof HTMLInputElement) || node.disabled) return;
    const action = node.getAttribute("data-action") || "";
    if (action === "set-touch-rotation" && event.type !== "change") return;
    if (event.type === "click" && node instanceof HTMLButtonElement && Object.hasOwn(buttons, action)) {
      event.preventDefault();
      buttons[action as keyof typeof buttons]();
    }
    if (node instanceof HTMLInputElement) {
      if (event.type === "input" && action === "set-view-rotation" && Number.isFinite(node.valueAsNumber))
        host.setViewRotation(node.valueAsNumber);
      if (event.type === "change" && action === "set-touch-rotation" && node.type === "checkbox")
        host.setTouchRotationEnabled(node.checked);
    }
    refresh();
  };
  const stopGesture = (event: Event) => event.stopPropagation();
  const events = ["click", "input", "change", "focusout"];
  const gestures = ["pointerdown", "mousedown", "touchstart", "wheel"];
  const remove = () => {
    for (const root of roots) {
      for (const event of events) root.removeEventListener(event, onEvent);
      for (const event of gestures) root.removeEventListener(event, stopGesture);
      for (const node of controls(root)) {
        if (
          isAction(node.getAttribute("data-action") || "") &&
          (node instanceof HTMLButtonElement || node instanceof HTMLInputElement)
        )
          node.disabled = true;
      }
    }
  };
  const assign = () => {
    remove();
    roots = slot.assignedElements().filter((root) => root.hasAttribute("data-canvas-panel-bind"));
    for (const root of roots) {
      for (const event of events) root.addEventListener(event, onEvent);
      for (const event of gestures) root.addEventListener(event, stopGesture);
    }
    refresh();
  };
  slot.addEventListener("slotchange", assign);
  const unsubscribe = runtime.registerHook("useAfterFrame", refresh);
  assign();
  return () => {
    unsubscribe();
    remove();
    slot.removeEventListener("slotchange", assign);
  };
}
