import {
  CanvasContext as _CanvasContext,
  StrategyActions,
  useRange,
  useSimpleViewer,
  useVisibleCanvases,
} from 'react-iiif-vault';
import { AtlasCanvas } from './AtlasCanvas/AtlasCanvas';
import { SizeParameter } from '../helpers/size-parameter';
import { h } from 'preact';
import { Fragment, useEffect, useRef } from 'preact/compat';
import { useRegisterPublicApi } from '../hooks/use-register-public-api';
import { choiceEventChannel } from 'src/helpers/eventbus';

const CanvasContext = _CanvasContext as any;

interface RenderAllCanvasesProps {
  highlight?: any | undefined;
  virtualSizes: SizeParameter[];
  highlightCssClass?: string;
  debug?: boolean;
  annoMode?: boolean;
  defaultChoices?: Array<{ id: string; opacity?: number }>;
  onCreated?: any;
  isStatic?: boolean;
  textSelectionEnabled?: boolean;
  children?: any;
  margin?: number;
  disableThumbnail?: boolean;
  skipSizes?: boolean;
}

export function RenderAllCanvases(props: RenderAllCanvasesProps) {
  const canvases = useVisibleCanvases();
  const sequence = useSimpleViewer();
  const range = useRange();
  const hasSequence = useRef(false);
  const webComponent = useRef<HTMLElement>();

  useRegisterPublicApi(
    (el) => {
      webComponent.current = el;
      (el as any).sequence = sequence;

      if (!hasSequence.current) {
        hasSequence.current = true;
        el.dispatchEvent(new CustomEvent('sequence', { detail: sequence }));
      }

      return {} as any;
    },
    [sequence]
  );

  useEffect(() => {
    if (webComponent.current) {
      choiceEventChannel.emit('onResetSeen');
      webComponent.current.dispatchEvent(
        new CustomEvent('sequence-change', {
          detail: {
            index: sequence.currentSequenceIndex,
            total: sequence.sequence.length,
          },
        })
      );
    }
  }, [sequence.currentSequenceIndex, range]);

  let acc = 0;
  const canvasComponents = canvases.map((canvas, i) => {
    const x = acc;
    acc += canvas.width + (props.margin || 0);

    return (
      <CanvasContext key={canvas.id} canvas={canvas.id}>
        <AtlasCanvas key={canvas.id} {...props} x={x} />
      </CanvasContext>
    );
  });

  return <Fragment>{canvasComponents}</Fragment>;
}
