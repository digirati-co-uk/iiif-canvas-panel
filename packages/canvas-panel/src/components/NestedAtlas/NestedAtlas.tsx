import { Atlas, AtlasAuto, AtlasContext, AtlasProps, useAtlas } from '@atlas-viewer/atlas';
import { Fragment, h } from 'preact';
import { createContext, useCallback, useContext, useEffect, useState } from 'preact/compat';
import { AtlasDisplayOptions } from '../ViewCanvas/ViewCanvas.types';

const InAtlasContext = createContext(false);

// atlas wraps AtlasAuto in React.memo() for its normal React consumers. That
// wrapper is a plain object ({ $$typeof: Symbol(react.memo), type, compare }),
// not a function or string — the only two vnode.type shapes preact's h()
// understands. Passed straight through, preact falls back to treating the
// wrapper object itself as a DOM tag name and throws
// (`Failed to execute 'createElementNS' ... invalid character '['`).
// React.memo's wrapper always exposes the unmemoized inner component as
// `.type`; rendering that directly is functionally identical, just without
// the memo layer's re-render shortcut.
const AtlasAutoComponent: typeof AtlasAuto = (AtlasAuto as any).type || AtlasAuto;

function OnCreated(props: { onCreated: any }) {
  const atlas = useAtlas();

  useEffect(() => {
    if (atlas) {
      props.onCreated(atlas);
    }
  }, [atlas]);

  return null;
}

export function NestedAtlas({
  children,
  onCreated,
  responsive,
  viewport,
  nested,
  ...props
}: AtlasDisplayOptions & { children: any; nested?: boolean }) {
  const [isCreated, setIsCreated] = useState(false);
  const inAtlas = useContext(InAtlasContext);

  // atlas's own <Canvas> wrapper (rendered internally by AtlasAuto/Atlas) is
  // built with `useCallback(fn, [preset, handleCreated, interactionMode])` —
  // "handleCreated" is *this* onCreated prop. A fresh inline arrow function
  // here on every render gives that useCallback a new dependency every time,
  // which produces a brand new <Canvas> function identity — and a new
  // component identity at that tree position means Preact fully unmounts and
  // remounts everything inside it (every SingleImage/WorldObject wrapper),
  // whose mount effect calls this same onCreated again, which sets state,
  // triggering the next render: an infinite mount/unmount loop that never
  // lets a single frame's image tiles finish loading before being torn down
  // again, so nothing ever paints. Memoizing this callback is what makes
  // atlas's <Canvas> identity — and therefore the whole subtree — stable
  // across renders.
  const handleAtlasCreated = useCallback(
    (rt: any) => {
      setIsCreated(true);
      if (onCreated) {
        rt.runtime.updateNextFrame();
        return onCreated(rt);
      }
    },
    [onCreated]
  );

  if (nested || inAtlas) {
    return (
      <>
        {onCreated ? <OnCreated onCreated={onCreated} /> : null}
        {children}
      </>
    );
  }

  return (
    <InAtlasContext.Provider value={true}>
      <AtlasAutoComponent
        {...props}
        onCreated={handleAtlasCreated}
        unstable_noReconciler
      >
        <InAtlasContext.Provider value={true}>{isCreated ? children : null}</InAtlasContext.Provider>
      </AtlasAutoComponent>
    </InAtlasContext.Provider>
  );
}
