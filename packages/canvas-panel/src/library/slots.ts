import { createContext } from "react";
import type { MediaSlotSnapshot } from "./media-slots";

/** Descriptors identify an outlet instance, including repeated uses of the same resource. */
export type PanelSlot = Readonly<{
  key: string;
  slotName: string;
  type: "controls" | "media" | "status" | "overlay";
  canvasId?: string;
  resourceId?: string;
  annotationId?: string;
  mediaType?: "audio" | "video" | "timeline";
  getMediaState?: () => MediaSlotSnapshot | undefined;
}>;
export type SlotFactory = (slot: PanelSlot) => { element: HTMLElement; dispose?: () => void };

/** Authored nodes belong to their framework. Only template/factory nodes are owned here. */
export function createSlots(host: HTMLElement) {
  const factories = new Map<string, SlotFactory>();
  const mounts = new Set<() => void>();
  const listeners = new Set<() => void>();
  let snapshot: readonly PanelSlot[] = Object.freeze([]);
  const publish = (next: readonly PanelSlot[]) => {
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
    register(name: string, factory: SlotFactory) {
      if (factories.has(name)) throw new Error(`A factory is already registered for ${name}`);
      factories.set(name, factory);
      for (const refresh of mounts) refresh();
      return () => {
        if (factories.get(name) !== factory) return;
        factories.delete(name);
        for (const refresh of mounts) refresh();
      };
    },
    mount(outlet: HTMLSlotElement, descriptor: PanelSlot) {
      const slot = Object.freeze(descriptor);
      outlet.name = slot.slotName;
      let owned: ReturnType<SlotFactory> | undefined;
      let owner: SlotFactory | HTMLTemplateElement | undefined;
      let conflict = "";
      const report = (message: string) => {
        if (conflict === message) return;
        conflict = message;
        host.dispatchEvent(new CustomEvent("slot-error", { detail: { slotName: slot.slotName, message } }));
      };
      const remove = () => {
        const previous = owned;
        owned = undefined;
        owner = undefined;
        if (previous) {
          // Move focus to the viewer before removing a focused control.
          if (previous.element.contains(host.ownerDocument.activeElement)) {
            if (!host.hasAttribute("tabindex")) host.tabIndex = -1;
            host.focus();
          }
          try {
            previous.dispose?.();
          } catch (error) {
            report(String(error));
          } finally {
            previous.element.remove();
          }
        }
      };
      const refresh = () => {
        const authored = [...host.children].filter(
          (node) => node !== owned?.element && node.getAttribute("slot") === slot.slotName,
        );
        const templates = [...host.children].filter(
          (node): node is HTMLTemplateElement =>
            node instanceof HTMLTemplateElement && node.dataset.canvasPanelSlot === slot.slotName,
        );
        const factory = factories.get(slot.slotName);
        if ((authored.length && (factory || templates.length)) || (factory && templates.length) || templates.length > 1)
          report("Conflicting slot owners: authored content takes priority; otherwise choose one template or factory.");
        else conflict = "";
        const next =
          authored.length || (factory && templates.length) || templates.length > 1
            ? undefined
            : factory || templates[0];
        if (owner === next) return;
        remove();
        if (!next) return;
        owner = next;
        try {
          const result =
            typeof next === "function"
              ? next(slot)
              : { element: next.content.firstElementChild?.cloneNode(true) as HTMLElement };
          if (
            !(result?.element instanceof HTMLElement) ||
            result.element.parentNode ||
            (next instanceof HTMLTemplateElement && next.content.childElementCount !== 1)
          )
            throw new Error("A slot template/factory must produce one detached HTML root.");
          result.element.slot = slot.slotName;
          owned = result;
          host.append(result.element);
        } catch (error) {
          report(error instanceof Error ? error.message : String(error));
        }
      };
      const observer = new MutationObserver(refresh);
      observer.observe(host, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["slot", "data-canvas-panel-slot"],
      });
      mounts.add(refresh);
      publish([...snapshot, slot]);
      refresh();
      return () => {
        observer.disconnect();
        mounts.delete(refresh);
        remove();
        publish(snapshot.filter((entry) => entry !== slot));
      };
    },
  };
}
export const SlotsContext = createContext<ReturnType<typeof createSlots> | null>(null);
