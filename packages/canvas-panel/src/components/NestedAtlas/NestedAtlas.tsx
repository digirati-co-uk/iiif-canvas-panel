import { AtlasAuto, useAtlas } from '@atlas-viewer/atlas';
import { createContext, useContext, useEffect, useState } from 'preact/compat';
import { AtlasDisplayOptions } from '../ViewCanvas/ViewCanvas.types';

const InAtlasContext = createContext(false);

function OnCreated(props: { onCreated: any }): null {
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
      <AtlasAuto
        {...props}
        onCreated={(rt) => {
          setIsCreated(true);
          if (onCreated) {
            rt.runtime.updateNextFrame();
            return onCreated(rt);
          }
        }}
        unstable_noReconciler
      >
        <InAtlasContext.Provider value={true}>{isCreated ? children : null}</InAtlasContext.Provider>
      </AtlasAuto>
    </InAtlasContext.Provider>
  );
}
