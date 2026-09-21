// @vitest-environment happy-dom
import { act } from 'react';
import { render } from '../src/library/dom-renderer';
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
import { expect, it } from 'vitest';
import { useSyncedState } from '../src/hooks/use-synced-state';

it('exposes the initial value and keeps falsy updates in sync for public getters', async () => {
  const host = document.createElement('div');
  let state!: ReturnType<typeof useSyncedState<number>>;
  function Probe({ value }: { value: number }) {
    state = useSyncedState(value);
    return null;
  }
  try {
    await act(async () => render(<Probe value={90} />, host));
    expect(state[3].current).toBe(90);
    await act(async () => state[1](0));
    expect(state[0]).toBe(0);
    expect(state[3].current).toBe(0);
    await act(async () => state[1](90));
    expect(state[0]).toBe(90);
    expect(state[3].current).toBe(90);
    await act(async () => render(<Probe value={180} />, host));
    expect(state[0]).toBe(180);
    expect(state[3].current).toBe(180);
  } finally {
    await act(async () => render(null, host));
  }
});
