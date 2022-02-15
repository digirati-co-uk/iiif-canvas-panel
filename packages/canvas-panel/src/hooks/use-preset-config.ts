import { useLayoutEffect, useState } from 'preact/compat';
import { resolveConfig } from '../helpers/resolve-config';

export function usePresetConfig<T>(preset?: string) {
  const [_isReady, setIsReady] = useState(false);
  const [internalConfig, setInternalConfig] = useState<{ __loaded?: true } & Partial<T>>({});
  const isConfigBlocking = preset && !internalConfig.__loaded;
  const isReady = (!preset || internalConfig.__loaded) && _isReady;

  useLayoutEffect(() => {
    const cleanUp: Array<() => void> = [];
    if (preset) {
      resolveConfig(preset)
        .then((inlineConfig) => {
          if (inlineConfig) {
            const { media, ...conf } = inlineConfig;
            // Media queries.

            const queries = Object.keys(media || {});
            const queryList = queries.map((query) => ({ query, mql: window.matchMedia(query) }));
            const getValue = () => {
              if (!queryList.length || !media) {
                return { __loaded: true, ...conf };
              }
              const active = queryList.filter(({ mql }) => mql.matches);

              return {
                __loaded: true,
                ...conf,
                ...(active.reduce((acc, next) => {
                  return Object.assign(acc, media[next.query]);
                }, {}) as any),
              };
            };

            for (const query of queries) {
              const mql = window.matchMedia(query);
              const listener = () => {
                setInternalConfig(getValue());
              };
              mql.addEventListener('change', listener);
              cleanUp.push(() => {
                mql.removeEventListener('change', listener);
              });
            }

            setInternalConfig(getValue());
          } else {
            setInternalConfig({ __loaded: true } as any);
          }
        })
        .catch(() => {
          setInternalConfig({ __loaded: true } as any);
        });
    }
    return () => {
      cleanUp.forEach((cb) => cb());
    };
  }, [isReady, preset]);

  return {
    internalConfig,
    isReady,
    isConfigBlocking,
    setIsReady,
  };
}
