// @vitest-environment happy-dom
import { act } from "react";
import { expect, it, vi } from "vitest";
import { render } from "../src/library/dom-renderer";
import { useGenericAtlasProps } from "../src/hooks/use-generic-atlas-props";
import type { GenericAtlasComponent } from "../src/types/generic-atlas-component";

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
it("passes camera options and exposes live rotation controls independently of object rotation", async () => {
  const host = document.createElement("div");
  let api: any;
  let state: ReturnType<typeof useGenericAtlasProps>;
  const runtime = {
    id: "rotation-test",
    viewRotation: 0,
    target: [1, 0, 0, 100, 100],
    getZoomedPosition: () => [1, 0, 0, 100, 100],
    getScaleFactor: () => 1,
    touchRotationEnabled: true,
    setTouchRotationEnabled: vi.fn(function (this: any, enabled: boolean) {
      this.touchRotationEnabled = enabled;
    }),
    world: { rotateBy: vi.fn() },
  };
  function Harness(props: GenericAtlasComponent) {
    state = useGenericAtlasProps({
      ...props,
      clickToEnableZoom: false,
      __registerPublicApi: (register) => {
        api = register(host);
      },
    });
    return null;
  }
  try {
    await act(async () =>
      render(<Harness rotation={30} viewRotation="45" enableTouchRotation={false} touchRotationSnap="0" />, host),
    );
    expect(state!.atlasProps.viewRotation).toBe(45);
    expect((state!.atlasProps.renderPreset as any)[1].controllerConfig.touchRotationSnap).toBe(0);
    await act(async () => state!.atlasProps.onCreated!({ runtime } as any));
    expect(runtime.touchRotationEnabled).toBe(false);
    api.rotateBy();
    api.rotateBy(-45, { x: 10, y: 20 }, true);
    expect(runtime.world.rotateBy.mock.calls).toEqual([
      [90, undefined, false],
      [-45, { x: 10, y: 20 }, true],
    ]);
    api.setViewRotation(90);
    expect(host.getAttribute("view-rotation")).toBe("90");
    expect(api.getViewRotation()).toBe(90);
    runtime.viewRotation = 135; // A gesture changes the live camera angle.
    expect(api.getViewRotation()).toBe(135);
    expect(api.getRotation()).toBe(30);
    expect(() => api.setViewRotation(NaN)).toThrow(RangeError);
    api.setTouchRotationEnabled(true);
    expect(api.getTouchRotationEnabled()).toBe(true);
    expect(host.getAttribute("enable-touch-rotation")).toBe("true");
    await act(async () =>
      render(<Harness viewRotation={0} enableTouchRotation="false" touchRotationSnap={15} />, host),
    );
    expect(state!.atlasProps.viewRotation).toBe(0);
    expect((state!.atlasProps.renderPreset as any)[1].controllerConfig.touchRotationSnap).toBe(15);
  } finally {
    await act(async () => render(null, host));
  }
});
