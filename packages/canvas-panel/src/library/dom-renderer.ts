import type { ReactNode } from 'react';
import Reconciler from 'react-reconciler';

// Internal HTML/SVG host for the existing shell and overlays. It is not a
// public replacement for React DOM (no hydration, synthetic events or forms API).
const svg = 'http://www.w3.org/2000/svg';
const html = 'http://www.w3.org/1999/xhtml';
const unitless = new Set(['aspectRatio', 'opacity', 'zIndex', 'fontWeight', 'lineHeight', 'flex', 'flexGrow', 'flexShrink', 'order', 'scale', 'fillOpacity', 'strokeOpacity', 'strokeWidth']);
const aliases: Record<string, string> = { className: 'class', htmlFor: 'for', tabIndex: 'tabindex', strokeWidth: 'stroke-width', fillOpacity: 'fill-opacity', strokeOpacity: 'stroke-opacity', textAnchor: 'text-anchor', fontSize: 'font-size', fontFamily: 'font-family', strokeLinecap: 'stroke-linecap', strokeLinejoin: 'stroke-linejoin' };
function update(node: Element, previous: any, next: any) {
  for (const key of new Set([...Object.keys(previous), ...Object.keys(next)])) {
    if (key === 'children' || key === 'ref' || previous[key] === next[key]) continue;
    const value = next[key];
    if (key === 'style') {
      const style = (node as HTMLElement).style;
      for (const name of new Set([...Object.keys(previous.style || {}), ...Object.keys(value || {})])) {
        const item = value?.[name];
        const css = item == null ? '' : typeof item === 'number' && item !== 0 && !unitless.has(name) && !name.startsWith('--') ? `${item}px` : String(item);
        if (name.startsWith('--')) style.setProperty(name, css);
        else (style as any)[name] = css;
      }
    } else if (key === 'dangerouslySetInnerHTML') {
      node.innerHTML = value?.__html ?? '';
    } else if (/^on[A-Z]/.test(key)) {
      const capture = key.endsWith('Capture');
      const event = key.slice(2, capture ? -7 : undefined).toLowerCase().replace('doubleclick', 'dblclick');
      if (previous[key]) node.removeEventListener(event, previous[key], capture);
      if (value) node.addEventListener(event, value, capture);
    } else if (['value', 'checked', 'selected', 'muted'].includes(key)) {
      (node as any)[key] = value ?? (key === 'value' ? '' : false);
    } else {
      const name = aliases[key] || key;
      if (value == null || (value === false && !name.startsWith('aria-') && !name.startsWith('data-'))) node.removeAttribute(name);
      else node.setAttribute(name, value === true && !name.startsWith('aria-') && !name.startsWith('data-') ? '' : String(value));
    }
  }
}
let priority = 0;
const append = (parent: Node, child: Node) => parent.appendChild(child);
const remove = (parent: Node, child: Node) => { if (child.parentNode === parent) parent.removeChild(child); };
const insert = (parent: Node, child: Node, before: Node) => parent.insertBefore(child, before);
const noop = () => {};
const renderer = (Reconciler as any)({
  supportsMutation: true, supportsPersistence: false, supportsHydration: false, isPrimaryRenderer: true,
  getRootHostContext: (root: Element) => root.namespaceURI || html,
  getChildHostContext: (namespace: string, type: string) => type === 'svg' ? svg : type === 'foreignObject' ? html : namespace,
  getPublicInstance: (instance: Node) => instance,
  createInstance(type: string, props: any, root: Node, namespace: string) {
    const doc = root.ownerDocument || document;
    const node = type === 'svg' || namespace === svg ? doc.createElementNS(svg, type) : doc.createElement(type);
    update(node, {}, props);
    return node;
  },
  createTextInstance: (text: string, root: Node) => (root.ownerDocument || document).createTextNode(text),
  appendInitialChild: append, appendChild: append, appendChildToContainer: append,
  removeChild: remove, removeChildFromContainer: remove,
  insertBefore: insert, insertInContainerBefore: insert,
  finalizeInitialChildren: () => false,
  shouldSetTextContent: (_type: string, props: any) => !!props.dangerouslySetInnerHTML,
  resetTextContent: (node: Node) => { node.textContent = ''; },
  commitUpdate: (node: Element, _type: string, previous: any, next: any) => update(node, previous, next),
  commitTextUpdate: (node: Text, _old: string, text: string) => { node.data = text; },
  prepareForCommit: () => null, resetAfterCommit: noop, preparePortalMount: noop,
  clearContainer: (root: Element) => root.replaceChildren(),
  hideInstance: (node: HTMLElement) => { node.style.display = 'none'; },
  unhideInstance: (node: Element, props: any) => update(node, { style: { display: 'none' } }, props),
  hideTextInstance: (node: Text) => { node.data = ''; },
  unhideTextInstance: (node: Text, text: string) => { node.data = text; },
  detachDeletedInstance: noop,
  scheduleTimeout: setTimeout, cancelTimeout: clearTimeout, noTimeout: -1,
  supportsMicrotasks: true, scheduleMicrotask: queueMicrotask,
  getCurrentUpdatePriority: () => priority,
  setCurrentUpdatePriority: (value: number) => { priority = value; },
  resolveUpdatePriority: () => priority || 32,
  maySuspendCommit: () => false, preloadInstance: () => true,
  startSuspendingCommit: noop, suspendInstance: noop, waitForCommitToBeReady: () => null,
  NotPendingTransition: null, resetFormInstance: noop,
  shouldAttemptEagerTransition: () => false, trackSchedulerEvent: noop,
  resolveEventType: () => null, resolveEventTimeStamp: () => -1.1,
});
const roots = new WeakMap<Node, { root: any; revision: number }>();
export function render(children: ReactNode, container: Element | ShadowRoot, callback?: () => void, synchronous = false) {
  let entry = roots.get(container);
  if (!entry) {
    if (children == null) return;
    const report = (error: unknown) => { console.error(error); };
    const root = renderer.createContainer(container, 1, null, false, null, '', report, report, report, null);
    entry = { root, revision: 0 };
    roots.set(container, entry);
  }
  const { root } = entry;
  const revision = ++entry.revision;
  const update = synchronous ? renderer.updateContainerSync : renderer.updateContainer;
  update(children, root, null, () => {
    if (children == null && roots.get(container)?.revision === revision) roots.delete(container);
    callback?.();
  });
  if (synchronous) renderer.flushSyncWork();
}
