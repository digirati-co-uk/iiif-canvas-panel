import { createElement as h, useLayoutEffect, useRef } from 'react';
import { render } from './dom-renderer';
import { ContextBridge, useContextValues } from './context-bridge';

export function DOMContent({
  container,
  children,
}: {
  container: Element | null;
  children: any;
}) {
  const values = useContextValues();
  const live = useRef(values);
  live.current = values;
  useLayoutEffect(() => {
    if (!container) return;
    const context = (event: Event) => {
      event.stopPropagation();
      (event as CustomEvent).detail.values = live.current;
    };
    container.addEventListener('canvas-panel-context', context);
    return () => {
      container.removeEventListener('canvas-panel-context', context);
      render(null, container);
    };
  }, [container]);
  useLayoutEffect(() => {
    if (container)
      render(
        <ContextBridge values={values}>{children}</ContextBridge>,
        container,
        () => {
          for (const slot of Array.from(container.querySelectorAll('slot'))) {
            for (const node of slot.assignedElements({ flatten: true })) {
              (node as any)._refreshContext?.();
              for (const child of Array.from(node.querySelectorAll('*')))
                (child as any)._refreshContext?.();
            }
          }
        },
      );
  });
  return null;
}
