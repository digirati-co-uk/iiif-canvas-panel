import { useCallback, useRef, useState, Ref, useLayoutEffect } from 'preact/compat';

export function useSyncedState<T, V = T>(
  propValue: T,
  { parse, defaultValue }: { parse?: (input: T) => V; defaultValue?: V } = {}
): readonly [V, (newValue: T) => void, (newValue: V) => void, Ref<V | undefined>] {
  const ref = useRef<V | undefined>();
  const [prop, _setProp] = useState<V>(() => (parse ? parse(propValue) : propValue) as V);

  const setProp = useCallback((v: T) => {
    let newValue = (parse ? parse(v) : v) as V;
    if (typeof defaultValue !== 'undefined' && typeof newValue === 'undefined') {
      newValue = defaultValue;
    }
    if ((ref.current || prop) !== newValue) {
      _setProp(newValue);
      ref.current = newValue;
    }
  }, []);

  useLayoutEffect(() => {
    setProp(propValue);
  }, [propValue]);

  return [prop, setProp, _setProp, ref] as const;
}
