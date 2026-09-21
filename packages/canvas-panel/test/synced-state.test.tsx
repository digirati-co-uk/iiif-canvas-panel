// @vitest-environment happy-dom
import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { expect, it } from 'vitest';
import { useSyncedState } from '../src/hooks/use-synced-state';

it('exposes the initial value and keeps falsy updates in sync for public getters', () => {
  const host = document.createElement('div');
  let state!: ReturnType<typeof useSyncedState<number>>;
  function Probe({ value }: { value: number }) {
    state = useSyncedState(value);
    return null;
  }
  try {
    act(() => render(<Probe value={90} />, host));
    expect(state[3].current).toBe(90);
    act(() => state[1](0));
    expect(state[0]).toBe(0);
    expect(state[3].current).toBe(0);
    act(() => state[1](90));
    expect(state[0]).toBe(90);
    expect(state[3].current).toBe(90);
    act(() => render(<Probe value={180} />, host));
    expect(state[0]).toBe(180);
    expect(state[3].current).toBe(180);
  } finally {
    act(() => render(null, host));
  }
});
