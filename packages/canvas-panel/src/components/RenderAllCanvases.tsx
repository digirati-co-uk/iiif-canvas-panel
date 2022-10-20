import {
  CanvasContext as _CanvasContext,
  ChoiceDescription,
  StrategyActions,
  useSimpleViewer,
  useVisibleCanvases,
} from 'react-iiif-vault';
import { AtlasCanvas } from './AtlasCanvas/AtlasCanvas';
import { SizeParameter } from '../helpers/size-parameter';
import { h } from 'preact';
import { Fragment, useEffect, useRef } from 'preact/compat';
import { useRegisterPublicApi } from '../hooks/use-register-public-api';

const CanvasContext = _CanvasContext as any;

interface RenderAllCanvasesProps {
  highlight?: any | undefined;
  virtualSizes: SizeParameter[];
  highlightCssClass?: string;
  debug?: boolean;
  annoMode?: boolean;
  onChoiceChange?: (choice?: ChoiceDescription) => void;
  defaultChoices?: Array<{ id: string; opacity?: number }>;
  onCreated?: any;
  registerActions?: (actions: StrategyActions) => void;
  isStatic?: boolean;
  textSelectionEnabled?: boolean;
  children?: any;
  margin?: number;
}

export function RenderAllCanvases(props: RenderAllCanvasesProps) {
  const canvases = useVisibleCanvases();
  const sequence = useSimpleViewer();
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
      webComponent.current.dispatchEvent(
        new CustomEvent('sequence-change', {
          detail: {
            index: sequence.currentSequenceIndex,
            total: sequence.sequence.length,
          },
        })
      );
    }
  }, [sequence.currentSequenceIndex]);

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
