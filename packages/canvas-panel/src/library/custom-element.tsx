import { ChoiceEventContext, createChoiceEventChannel } from '../helpers/eventbus';
import { createElement as h, useLayoutEffect, type ComponentType } from 'react';
import { render } from './dom-renderer';
import { Vault } from 'react-iiif-vault/core';
import { ContextBridge, useContextValues, type ContextValues } from './context-bridge';

const contextEvent = 'canvas-panel-context';
const camelCase = (name: string) => name.replace(/-(\w)/g, (_, char: string) => char.toUpperCase());
function ContextSlot(props: any) {
  const values = useContextValues();
  return h('slot', { ...props, ref: (node: HTMLSlotElement | null) => {
    if (!node) return;
    const listener = (event: Event) => {
      event.stopPropagation();
      (event as CustomEvent).detail.values = values;
    };
    node.addEventListener(contextEvent, listener);
    return () => node.removeEventListener(contextEvent, listener);
  } });
}
function ElementContent({ element, Component, values }: any) {
  useLayoutEffect(() => {
    element.ready = true;
    element.dispatchEvent(new CustomEvent('ready'));
  }, [element]);
  return h(ContextBridge, { values }, h(ChoiceEventContext.Provider, { value: element._choices }, h(Component, { ...element._props, children: h(ContextSlot) })));
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
    constructor() {
      super();
      this._root = options.shadow ? this.attachShadow({ mode: 'open' }) : this;
      const supplied = Object.prototype.hasOwnProperty.call(this, 'vault') ? (this as any).vault : undefined;
      if (supplied) delete (this as any).vault;
      options.onConstruct?.(this);
      this._props.vault ||= supplied || new Vault();
      this._explicitVault = !!supplied;
    }
    get vault() { return this._props.vault; }
    set vault(value) {
      if (value === this._props.vault) return;
      this._explicitVault = true;
      this._props.vault = value;
      this._session++;
      this.ready = false;
      this.update();
    }
    _refreshContext() {
      const event = new CustomEvent<{ values: ContextValues }>(contextEvent, { detail: { values: [] }, bubbles: true, composed: true });
      this.dispatchEvent(event);
      const values = event.detail.values;
      if (values.length === this._values.length && values.every((value: any, i: number) => value === this._values[i])) return;
      this._values = values;
      if (!this._explicitVault && values[0]?.vault) this._props.vault = values[0].vault;
      this.update();
    }
    whenReady(callback: () => void) {
      if (this.ready) callback();
      else this.addEventListener('ready', callback, { once: true });
    }
    connectedCallback() {
      for (const { name, value } of Array.from(this.attributes)) {
        this._props[name] = value;
        this._props[camelCase(name)] = value;
      }
      const event = new CustomEvent<{ values: ContextValues }>(contextEvent, { detail: { values: [] }, bubbles: true, composed: true });
      this.dispatchEvent(event);
      this._values = event.detail.values;
      render(h(ElementContent, { key: this._session, element: this, Component, values: this._values }), this._root, undefined, true);
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
        if (this.isConnected) render(h(ElementContent, { key: this._session, element: this, Component, values: this._values }), this._root);
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
      get() { return this._props[name]; },
      set(value) {
        if (value == null) this.removeAttribute(name);
        else if (typeof value !== 'object') this.setAttribute(name, String(value));
        else { this._props[name] = this._props[camelCase(name)] = value; this.update(); }
      },
    });
  }
  options.beforeCreate?.(PanelElement);
  customElements.define(name, PanelElement);
}
