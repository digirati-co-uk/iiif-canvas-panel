import { Atlas, AtlasAuto, AtlasContext, AtlasProps, useAtlas } from '@atlas-viewer/atlas';
import { Fragment, h } from 'preact';
import { createContext, useContext, useEffect, useState } from 'preact/compat';
import { AtlasDisplayOptions } from '../ViewCanvas/ViewCanvas.types';

const InAtlasContext = createContext(false);

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

  if (nested || inAtlas) {
    return (
      <>
        {onCreated ? <OnCreated onCreated={onCreated} /> : null}
        {children}
      </>
    );
  }
  
  console.log('bg', props.background);

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
