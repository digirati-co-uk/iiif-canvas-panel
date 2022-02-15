import { FC, useMemo } from 'preact/compat';
import { HTMLPortal } from './HTMLPortal';
import { useResizeWorldItem } from '@atlas-viewer/atlas';
import { WorldObject } from '.';
import { Fragment, h } from 'preact';

export const ResizeWorldItem: FC<
  JSX.IntrinsicElements['worldObject'] & {
    handleSize?: number;
    resizable?: boolean;
    onSave: (pos: Partial<{ x: number; y: number; width: number; height: number }>) => void;
  }
> = ({ handleSize = 9, resizable, onSave, children, ...props }) => {
  const { portalRef, mode, mouseEvent, isEditing } = useResizeWorldItem(
    { x: props.x || 0, y: props.y || 0, width: props.width, height: props.height },
    onSave
  );

  const translate = useMemo(() => mouseEvent('translate'), [mouseEvent]);
  const east = useMemo(() => mouseEvent('east'), [mouseEvent]);
  const west = useMemo(() => mouseEvent('west'), [mouseEvent]);
  const south = useMemo(() => mouseEvent('south'), [mouseEvent]);
  const north = useMemo(() => mouseEvent('north'), [mouseEvent]);
  const southEast = useMemo(() => mouseEvent('south-east'), [mouseEvent]);
  const southWest = useMemo(() => mouseEvent('south-west'), [mouseEvent]);
  const northEast = useMemo(() => mouseEvent('north-east'), [mouseEvent]);
  const northWest = useMemo(() => mouseEvent('north-west'), [mouseEvent]);

  return (
    <>
      <WorldObject {...props}>
        {children}
        <HTMLPortal
          ref={portalRef}
          target={{ x: 0, y: 0, height: props.height, width: props.width }}
          relative
          interactive={false}
        >
          {mode === 'sketch' && resizable ? (
            <Fragment>
              <div
                onMouseDown={translate}
                onTouchStart={translate}
                style={{
                  display: 'block',
                  width: '100%',
                  height: '100%',
                  border: '1px dashed #999',
                  boxSizing: 'border-box',
                  pointerEvents: isEditing ? 'none' : mode === 'sketch' ? 'initial' : 'none',
                }}
              />

              <div
                title="east"
                onTouchStart={east}
                onMouseDown={east}
                style={{
                  cursor: 'e-resize',
                  position: 'absolute',
                  background: '#fff',
                  height: handleSize * 2,
                  width: handleSize,
                  right: 0,
                  top: '50%',
                  transform: `translate(${handleSize / 2}px, -${handleSize}px)`,
                  zIndex: 999,
                  boxShadow: '0px 2px 3px 0 rgba(0,0,0,0.5)',
                  border: '1px solid #999',
                  pointerEvents: isEditing ? 'none' : mode === 'sketch' ? 'initial' : 'none',
                }}
              />

              <div
                title="west"
                onMouseDown={west}
                style={{
                  cursor: 'w-resize',
                  position: 'absolute',
                  background: '#fff',
                  height: handleSize * 2,
                  width: handleSize,
                  left: 0,
                  top: '50%',
                  transform: `translate(-${handleSize / 2}px, -${handleSize}px)`,
                  zIndex: 999,
                  boxShadow: '0px 2px 3px 0 rgba(0,0,0,0.5)',
                  border: '1px solid #999',
                  pointerEvents: isEditing ? 'none' : mode === 'sketch' ? 'initial' : 'none',
                }}
              />

              <div
                title="north"
                onMouseDown={north}
                style={{
                  cursor: 'n-resize',
                  position: 'absolute',
                  background: '#fff',
                  height: handleSize,
                  width: handleSize * 2,
                  left: '50%',
                  top: 0,
                  transform: `translate(-${handleSize}px, -${handleSize / 2}px)`,
                  zIndex: 999,
                  boxShadow: '0px 2px 3px 0 rgba(0,0,0,0.5)',
                  border: '1px solid rgba(0,0,0,.5)',
                  pointerEvents: isEditing ? 'none' : mode === 'sketch' ? 'initial' : 'none',
                }}
              />

              <div
                title="south"
                onMouseDown={south}
                style={{
                  cursor: 's-resize',
                  position: 'absolute',
                  background: '#fff',
                  height: handleSize,
                  width: handleSize * 2,
                  left: '50%',
                  bottom: 0,
                  transform: `translate(-${handleSize}px, ${handleSize / 2}px)`,
                  zIndex: 999,
                  boxShadow: '0px 2px 3px 0 rgba(0,0,0,0.5)',
                  border: '1px solid #999',
                  pointerEvents: isEditing ? 'none' : mode === 'sketch' ? 'initial' : 'none',
                }}
              />

              <div
                title="north-east"
                onMouseDown={northEast}
                style={{
                  cursor: 'ne-resize',
                  position: 'absolute',
                  background: '#fff',
                  height: handleSize,
                  width: handleSize,
                  right: 0,
                  top: 0,
                  transform: `translate(${handleSize / 2}px, -${handleSize / 2}px)`,
                  zIndex: 999,
                  boxShadow: '0px 2px 3px 0 rgba(0,0,0,0.5)',
                  border: '1px solid #999',
                  pointerEvents: isEditing ? 'none' : mode === 'sketch' ? 'initial' : 'none',
                }}
              />

              <div
                title="south-east"
                onMouseDown={southEast}
                style={{
                  cursor: 'se-resize',
                  position: 'absolute',
                  background: '#fff',
                  height: handleSize,
                  width: handleSize,
                  bottom: 0,
                  right: 0,
                  transform: `translate(${handleSize / 2}px, ${handleSize / 2}px)`,
                  zIndex: 999,
                  boxShadow: '0px 2px 3px 0 rgba(0,0,0,0.5)',
                  border: '1px solid #999',
                  pointerEvents: isEditing ? 'none' : mode === 'sketch' ? 'initial' : 'none',
                }}
              />

              <div
                title="south-west"
                onMouseDown={southWest}
                style={{
                  cursor: 'sw-resize',
                  position: 'absolute',
                  background: '#fff',
                  height: handleSize,
                  width: handleSize,
                  bottom: 0,
                  left: 0,
                  transform: `translate(-${handleSize / 2}px, ${handleSize / 2}px)`,
                  zIndex: 999,
                  boxShadow: '0px 2px 3px 0 rgba(0,0,0,0.5)',
                  border: '1px solid #999',
                  pointerEvents: isEditing ? 'none' : mode === 'sketch' ? 'initial' : 'none',
                }}
              />

              <div
                title="north-west"
                onMouseDown={northWest}
                style={{
                  cursor: 'nw-resize',
                  position: 'absolute',
                  background: '#fff',
                  height: handleSize,
                  width: handleSize,
                  top: 0,
                  left: 0,
                  transform: `translate(-${handleSize / 2}px, -${handleSize / 2}px)`,
                  zIndex: 999,
                  boxShadow: '0px 2px 3px 0 rgba(0,0,0,0.5)',
                  border: '1px solid #999',
                  pointerEvents: isEditing ? 'none' : mode === 'sketch' ? 'initial' : 'none',
                }}
              />
            </Fragment>
          ) : null}
        </HTMLPortal>
      </WorldObject>
    </>
  );
};
