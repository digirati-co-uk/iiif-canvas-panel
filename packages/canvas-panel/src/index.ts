import { defineCustomElements } from "./elements";

defineCustomElements();

export { defineCustomElements } from "./elements";
export * from "./helpers/annotation-display";
export type { CanvasPanelElement, CanvasPanelEventMap } from "./types/element";

export type { MediaSlotSnapshot, MediaActions } from "./library/media-slots";

export type { PanelSlot, SlotFactory } from "./library/slots";
