import { createElement as h, useEffect, useState } from 'react';
import { useAtlas } from '@atlas-viewer/atlas/react';
import { Box } from '.';

// Existing selection gesture, attached to the native viewport rather than the
// optional Atlas DOM/editor entrypoint.
export function DrawBox({ onCreate }: { onCreate: (region: any) => void }) {
  const preset = useAtlas();
  const [region, setRegion] = useState<any>(null);
  useEffect(() => {
    const element: HTMLElement | undefined = preset?.canvas || preset?.container;
    if (!preset || !element) return;
    const runtime = preset.runtime;
    let start: { x: number; y: number } | null = null;
    let current: any;
    const position = (event: MouseEvent) => {
      const bounds = element.getBoundingClientRect();
      const point = runtime.viewerToWorld(event.clientX - bounds.left, event.clientY - bounds.top);
      return { x: Math.round(point.x), y: Math.round(point.y) };
    };
    const down = (event: MouseEvent) => { if (runtime.mode === 'sketch') start = position(event); };
    const move = (event: MouseEvent) => {
      if (!start) return;
      const point = position(event);
      current = { x: Math.min(start.x, point.x), y: Math.min(start.y, point.y), width: Math.abs(point.x - start.x), height: Math.abs(point.y - start.y) };
      setRegion(current);
    };
    const up = (event: MouseEvent) => {
      if (!start) return;
      move(event);
      if (current?.width && current?.height) onCreate(current);
      start = null;
      current = null;
      setRegion(null);
    };
    element.addEventListener('mousedown', down);
    element.addEventListener('mousemove', move);
    element.addEventListener('mouseup', up);
    return () => {
      element.removeEventListener('mousedown', down);
      element.removeEventListener('mousemove', move);
      element.removeEventListener('mouseup', up);
    };
  }, [preset, onCreate]);
  return region ? <Box target={region} style={{ border: '2px solid red' }} /> : null;
}
