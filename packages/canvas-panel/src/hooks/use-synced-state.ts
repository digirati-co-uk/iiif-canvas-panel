import { useCallback, useRef, useState, RefObject, useLayoutEffect } from 'react';

export function useSyncedState<T, V = T>(
  propValue: T,
  { parse, defaultValue }: { parse?: (input: T) => V; defaultValue?: V } = {}
): readonly [V, (newValue: T) => void, (newValue: V) => void, RefObject<V | undefined>] {
  const [prop, _setProp] = useState<V>(() => (parse ? parse(propValue) : propValue) as V);
  const ref = useRef<V | undefined>(prop);

  const setProp = useCallback((v: T) => {
    let newValue = (parse ? parse(v) : v) as V;
    if (typeof defaultValue !== 'undefined' && typeof newValue === 'undefined') {
      newValue = defaultValue;
    }
    if (!Object.is(ref.current, newValue)) {
      _setProp(newValue);
      ref.current = newValue;
    }
  }, []);

  useLayoutEffect(() => {
    setProp(propValue);
  }, [propValue]);

  return [prop, setProp, _setProp, ref] as const;
}
