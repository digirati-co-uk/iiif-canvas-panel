import { createElement as h, forwardRef, useLayoutEffect, useRef, useState } from 'react';
import { Box, useAfterFrame, useRuntime } from '@atlas-viewer/atlas/react';
import { Box as BoxComponent } from '.';
import { DOMContent } from '../library/DOMContent';

export const HTMLPortal = forwardRef<Box, {
  backgroundColor?: string; interactive?: boolean; relative?: boolean; children?: any; style?: any;
  target?: { x: number; y: number; width: number; height: number };
}>(({ children, relative, ...props }, forwarded) => {
  const runtime = useRuntime();
  const box = useRef<Box | null>(null);
  const relativeElement = useRef<HTMLDivElement>(null);
  const [container, setContainer] = useState<Element | null>(null);
  useLayoutEffect(() => {
    const instance = box.current;
    if (!instance) return;
    const created = () => setContainer(instance.__host.element);
    if (instance.__host) created();
    else instance.__onCreate = created;
    if (typeof forwarded === 'function') forwarded(instance);
    else if (forwarded) forwarded.current = instance;
    return () => {
      instance.__onCreate = undefined;
      if (typeof forwarded === 'function') forwarded(null);
      else if (forwarded) forwarded.current = null;
    };
  }, [forwarded]);
  useAfterFrame(() => {
    if (relative && relativeElement.current && runtime) {
      const scale = runtime.getScaleFactor();
      Object.assign(relativeElement.current.style, { transformOrigin: '0 0', transform: `scale(${1 / scale})`, width: `${scale * 100}%`, height: `${scale * 100}%` });
    }
  }, [relative]);
  return <>
    <BoxComponent html ref={box} {...props} />
    <DOMContent container={container}>{relative ? <div ref={relativeElement}>{children}</div> : children}</DOMContent>
  </>;
});
