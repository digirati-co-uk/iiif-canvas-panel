import { h } from 'preact';
import * as Atlas from '@atlas-viewer/atlas';
import {
  createContext,
  FC,
  forwardRef,
  memo,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  Ref,
} from 'preact/compat';
import { useAtlas, World, activateEvents, applyProps } from '@atlas-viewer/atlas';

const ParentContext = createContext<any>(null);

type BaseAtlasProps = {
  id?: string;
  ref?: any;
  key?: string | number;

  // @todo events
  onClick?: (e: any) => void;
};

export function createAtlasWrapper<T = any, C = any>({
  displayName,
  component: Component,
  customConstructor,
}: {
  customConstructor?: (props: any) => any;
  component: any;
  displayName: string;
}): FC<BaseAtlasProps & T & { ref?: Ref<C | undefined> }> {
  const WrappedComponent = forwardRef<C>(function WrappedComponent({ children, ...props }: any, fwdRef) {
    const [instance, setInstance] = useState<any>();
    const atlas = useAtlas();
    const _parent = useContext(ParentContext);
    const prevProps = useRef(props);

    useEffect(() => {
      if (atlas && atlas.runtime) {
        setInstance(customConstructor ? customConstructor(props) : new Component());
      }
      return () => {
        // no-op
      };
    }, []);

    useEffect(() => {
      if (atlas && atlas.runtime && instance) {
        const runtime = atlas.runtime;
        const world = atlas.runtime.world;
        const parent: World = (_parent || world) as any;

        parent.appendChild(instance);

        if (fwdRef) {
          if (typeof fwdRef === 'function') {
            (fwdRef as any)(instance);
          } else {
            (fwdRef as any).current = instance;
          }
        }

        if (instance instanceof Atlas.World) {
          runtime.world = instance;
        }

        if (!(instance instanceof Atlas.WorldObject)) {
          runtime.pendingUpdate = true;
          if (runtime.world) {
            if (runtime.world.needsRecalculate) {
              runtime.world.recalculateWorldSize();
              runtime.world.triggerRepaint();
            }
          }
        }

        const _removeFrom = parent;
        const _toRemove = instance;

        return () => {
          if (_toRemove) {
            _removeFrom.removeChild(_toRemove);
            runtime.pendingUpdate = true;
            if (runtime.world) {
              if (runtime.world.needsRecalculate) {
                runtime.world.recalculateWorldSize();
                runtime.world.triggerRepaint();
              }
            }
          }
        };
      }

      return () => {
        // no-op;
      };
    }, [instance, atlas?.runtime]);

    useEffect(() => {
      if (instance && atlas && atlas.runtime) {
        activateEvents(atlas.runtime.world, props);
        applyProps(instance as any, prevProps.current, props);
        prevProps.current = props;
        atlas.runtime.pendingUpdate = true;
        if (atlas.runtime.world) {
          atlas.runtime.world.needsRecalculate = true;
          if (atlas.runtime.world.needsRecalculate) {
            atlas.runtime.world.recalculateWorldSize();
            atlas.runtime.world.triggerRepaint();
          }
        }
      }
    }, [instance, props]);

    if (!instance) {
      return null;
    }

    return <ParentContext.Provider value={instance}>{children}</ParentContext.Provider>;
  });

  WrappedComponent.displayName = displayName;

  return memo(WrappedComponent as any);
}
