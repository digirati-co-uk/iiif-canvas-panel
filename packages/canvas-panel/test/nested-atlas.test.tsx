// @vitest-environment happy-dom
import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { expect, it, vi } from 'vitest';
import { NestedAtlas } from '../src/components/NestedAtlas/NestedAtlas';

vi.mock('@atlas-viewer/atlas', async () => {
  const { useEffect } = await import('preact/hooks');
  return {
    // Atlas uses onCreated as a dependency of its scene component. A new
    // callback can remount that component even when the runtime is unchanged.
    AtlasAuto: ({ onCreated, children }: { onCreated: (preset: unknown) => void; children: unknown }) => {
      useEffect(() => {
        onCreated({ runtime: { updateNextFrame() {} } });
      }, [onCreated]);
      return children;
    },
    useAtlas: () => null,
  };
});

it('does not recreate the Atlas scene when readiness or display props change', () => {
  const host = document.createElement('div');
  const created = vi.fn();
  try {
    act(() =>
      render(
        <NestedAtlas onCreated={created}>
          <span>Scene</span>
        </NestedAtlas>,
        host
      )
    );
    expect(created).toHaveBeenCalledTimes(1);
    act(() =>
      render(
        <NestedAtlas onCreated={created} className="updated">
          <span>Scene</span>
        </NestedAtlas>,
        host
      )
    );
    expect(created).toHaveBeenCalledTimes(1);
    expect(host.textContent).toBe('Scene');
  } finally {
    act(() => render(null, host));
  }
});
