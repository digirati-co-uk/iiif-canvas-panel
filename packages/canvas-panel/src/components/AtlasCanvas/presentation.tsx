import { createElement as h, useLayoutEffect, useState } from 'react';
import { useAtlas } from '@atlas-viewer/atlas/react';
import { useCanvas, useThumbnail } from 'react-iiif-vault/core';
import type { SceneMediaProps, UnsupportedSceneProps } from 'react-iiif-vault/canvas-panel/scene';
import { DOMContent } from '../../library/DOMContent';
import { RenderVideo } from '../RenderVideo/RenderVideo';
import { RenderAudio } from '../RenderAudio/RenderAudio';
import { SingleImage } from '../../atlas-components';

export function SceneHTML({ children }: { children: any }) {
  const preset = useAtlas();
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  useLayoutEffect(() => {
    const parent = (preset?.canvas || preset?.container)?.parentElement;
    if (!parent) return;
    const node = document.createElement('div');
    parent.append(node);
    setContainer(node);
    return () => { node.remove(); };
  }, [preset]);
  return <DOMContent container={container}>{children}</DOMContent>;
}
export function SceneMedia({ item }: SceneMediaProps) {
  return <SceneHTML>{item.type === 'Sound' ? <RenderAudio media={item} /> : <RenderVideo media={item} />}</SceneHTML>;
}
export function SceneUnsupported({ reason }: UnsupportedSceneProps) {
  const thumbnail = useThumbnail({ maxWidth: 256, maxHeight: 256 });
  const canvas = useCanvas();
  if (canvas && thumbnail?.type === 'fixed') return <SingleImage uri={thumbnail.id} target={{ x: 0, y: 0, width: canvas.width, height: canvas.height }} />;
  throw new Error(reason);
}
