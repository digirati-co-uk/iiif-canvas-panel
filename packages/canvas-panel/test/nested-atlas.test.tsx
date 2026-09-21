// @vitest-environment happy-dom
import { act } from 'react';
import { expect, it, vi } from 'vitest';
import { render } from '../src/library/dom-renderer';
import { NestedAtlas } from '../src/components/NestedAtlas/NestedAtlas';
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
const dispose = vi.fn();
const resize = vi.fn();
const created = vi.fn(() => ({
  runtime: {
    world: { addLayoutSubscriber: () => () => {} },
    resize,
    setOptions() {},
    goHome() {},
    setHomePosition() {},
    updateNextFrame() {},
  },
  unmount: dispose,
}));
vi.mock('@atlas-viewer/atlas/react', async () => {
  const { createContext } = await import('react');
  return {
    AtlasContext: createContext(null),
    BoundsContext: createContext(null),
    ModeContext: createContext('explore'),
    defaultPreset: (...args: any[]) => created(...args),
    staticPreset: (...args: any[]) => created(...args),
    ReactAtlas: {
      render() {},
      unmountComponentAtNode(_runtime: any, cb: any) {
        cb();
      },
    },
  };
});
it('retains the runtime across host updates and disposes it on disconnect', async () => {
  const host = document.createElement('div');
  const original = globalThis.ResizeObserver;
  globalThis.ResizeObserver = class {
    observe() {}
    disconnect() {}
  } as any;
  const rect = {
    width: 480,
    height: 320,
    toJSON: () => ({ width: 480, height: 320 }),
  };
  const bounds = vi
    .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    .mockReturnValue(rect as any);
  try {
    await act(async () =>
      render(
        <NestedAtlas width={480} height={320}>
          {null}
        </NestedAtlas>,
        host,
      ),
    );
    await act(async () =>
      render(
        <NestedAtlas width={360} height={240} className="updated">
          {null}
        </NestedAtlas>,
        host,
      ),
    );
    expect(created).toHaveBeenCalledTimes(1);
    expect(host.querySelector('.updated')).not.toBeNull();
    await act(async () => render(null, host));
    expect(dispose).toHaveBeenCalledTimes(1);
  } finally {
    bounds.mockRestore();
    globalThis.ResizeObserver = original;
  }
});
