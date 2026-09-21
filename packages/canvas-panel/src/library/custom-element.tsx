import { ChoiceEventContext, createChoiceEventChannel } from "../helpers/eventbus";
import { createElement as h, useLayoutEffect, useRef, useSyncExternalStore, type ComponentType } from "react";
import { render } from "./dom-renderer";
import { Vault } from "react-iiif-vault/core";
import { ContextBridge, useContextValues, type ContextValues } from "./context-bridge";

import {
  MediaSlotsContext,
  NativeMediaControlsContext,
  createMediaSlots,
  bindMediaControls,
  type MediaSlots,
} from "./media-slots";

function MediaOutlet({ store, name }: { store: MediaSlots; name: string }) {
  const slots = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  const slot = useRef<HTMLSlotElement>(null);
  const active = slots.some((entry) => entry.slotName === name);
  useLayoutEffect(() => {
    if (!slot.current) return;
    const binding = bindMediaControls(slot.current, () => store.getSnapshot().find((entry) => entry.slotName === name));
    const unsubscribe = store.subscribe(binding.refresh);
    return () => {
      unsubscribe();
      binding.dispose();
    };
  }, [store, name]);
  return h(
    "div",
    { hidden: !active, inert: !active, part: "media-controls" },
    h(
      "slot",
      { name, ref: slot },
      name.startsWith("timeline-controls")
        ? h(
            "div",
            { "data-canvas-panel-bind": "", style: { display: "flex", gap: 12, alignItems: "center", padding: 12 } },
            h(
              "button",
              { type: "button", "data-action": "toggle-play", "data-bind": "play-label", disabled: true },
              "Play",
            ),
            h("input", {
              type: "range",
              min: 0,
              max: 0,
              step: 0.1,
              "aria-label": "Timeline position",
              "data-action": "seek",
              "data-bind": "current-time",
              disabled: true,
            }),
            h("span", { "data-bind": "current-time", "data-format": "time" }, "0:00"),
            h("span", { "aria-hidden": true }, "/"),
            h("span", { "data-bind": "duration", "data-format": "time" }, "--:--"),
          )
        : null,
    ),
  );
}
function MediaOutlets({ store }: { store: MediaSlots }) {
  const slots = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  const names = new Set([
    "video-controls",
    "audio-controls",
    "timeline-controls",
    ...slots.map((entry) => entry.slotName),
  ]);
  return [...names].map((name) => h(MediaOutlet, { key: name, store, name }));
}

const contextEvent = "canvas-panel-context";
const camelCase = (name: string) => name.replace(/-(\w)/g, (_, char: string) => char.toUpperCase());
function ContextSlot(props: any) {
  const values = useContextValues();
  return h("slot", {
    ...props,
    ref: (node: HTMLSlotElement | null) => {
      if (!node) return;
      const listener = (event: Event) => {
        event.stopPropagation();
        (event as CustomEvent).detail.values = values;
      };
      node.addEventListener(contextEvent, listener);
      return () => node.removeEventListener(contextEvent, listener);
    },
  });
}
function ElementContent({ element, Component, values }: any) {
  useLayoutEffect(() => {
    element.ready = true;
    element.dispatchEvent(new CustomEvent("ready"));
  }, [element]);
  return h(
    ContextBridge,
    { values },
    h(
      ChoiceEventContext.Provider,
      { value: element._choices },
      h(
        MediaSlotsContext.Provider,
        { value: element._mediaSlots },
        h(
          NativeMediaControlsContext.Provider,
          { value: element._props["native-controls"] !== "false" },
          h(Component, { ...element._props, children: h(ContextSlot) }),
        ),
        h(MediaOutlets, { store: element._mediaSlots }),
      ),
    ),
  );
}
export default function register(Component: ComponentType<any>, name: string, attributes: string[], options: any = {}) {
  if (customElements.get(name)) return;
  class PanelElement extends HTMLElement {
    static observedAttributes = attributes;
    _props: any = {};
    _root: ShadowRoot | HTMLElement;
    _queued = false;
    _values: ContextValues = [];
    ready = false;
    _explicitVault = false;
    _session = 0;
    _choices = createChoiceEventChannel();
    _mediaSlots = createMediaSlots(this);
    getMediaSlots = this._mediaSlots.getSnapshot;
    subscribeMediaSlots = this._mediaSlots.subscribe;
    constructor() {
      super();
      this._root = options.shadow ? this.attachShadow({ mode: "open" }) : this;
      const supplied = Object.prototype.hasOwnProperty.call(this, "vault") ? (this as any).vault : undefined;
      if (supplied) delete (this as any).vault;
      options.onConstruct?.(this);
      this._props.vault ||= supplied || new Vault();
      this._explicitVault = !!supplied;
    }
    get vault() {
      return this._props.vault;
    }
    set vault(value) {
      if (value === this._props.vault) return;
      this._explicitVault = true;
      this._props.vault = value;
      this._session++;
      this.ready = false;
      this.update();
    }
    _refreshContext() {
      const event = new CustomEvent<{ values: ContextValues }>(contextEvent, {
        detail: { values: [] },
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(event);
      const values = event.detail.values;
      if (values.length === this._values.length && values.every((value: any, i: number) => value === this._values[i]))
        return;
      this._values = values;
      if (!this._explicitVault && values[0]?.vault) this._props.vault = values[0].vault;
      this.update();
    }
    whenReady(callback: () => void) {
      if (this.ready) callback();
      else this.addEventListener("ready", callback, { once: true });
    }
    connectedCallback() {
      for (const { name, value } of Array.from(this.attributes)) {
        this._props[name] = value;
        this._props[camelCase(name)] = value;
      }
      const event = new CustomEvent<{ values: ContextValues }>(contextEvent, {
        detail: { values: [] },
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(event);
      this._values = event.detail.values;
      render(
        h(ElementContent, {
          key: this._session,
          element: this,
          Component,
          values: this._values,
        }),
        this._root,
        undefined,
        true,
      );
    }
    attributeChangedCallback(name: string, _old: string | null, value: string | null) {
      this._props[name] = value ?? undefined;
      this._props[camelCase(name)] = value ?? undefined;
      this.update();
    }
    update() {
      if (this._queued) return;
      this._queued = true;
      queueMicrotask(() => {
        this._queued = false;
        if (this.isConnected)
          render(
            h(ElementContent, {
              key: this._session,
              element: this,
              Component,
              values: this._values,
            }),
            this._root,
          );
      });
    }
    disconnectedCallback() {
      this._session++;
      this.ready = false;
      render(null, this._root);
    }
  }
  for (const name of attributes) {
    Object.defineProperty(PanelElement.prototype, name, {
      get() {
        return this._props[name];
      },
      set(value) {
        if (value == null) this.removeAttribute(name);
        else if (typeof value !== "object") this.setAttribute(name, String(value));
        else {
          this._props[name] = this._props[camelCase(name)] = value;
          this.update();
        }
      },
    });
  }
  options.beforeCreate?.(PanelElement);
  customElements.define(name, PanelElement);
}
