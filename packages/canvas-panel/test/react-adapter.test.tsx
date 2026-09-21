// @vitest-environment happy-dom
import { act, createRef, StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { expect, it, vi } from "vitest";
import { Vault, VaultProvider } from "react-iiif-vault/core";
import { CanvasPanel } from "../src/react";
import type { CanvasPanelElement } from "../src/elements";

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
it("shares the host Vault, preserves children, and requests controlled navigation", async () => {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const vault = new Vault();
  const ref = createRef<CanvasPanelElement>();
  const change = vi.fn();
  const ready = vi.fn();
  expect(
    renderToString(
      <CanvasPanel>
        <button slot="overlay">Control</button>
      </CanvasPanel>,
    ),
  ).toContain("canvas-panel");
  try {
    await act(async () =>
      root.render(
        <StrictMode>
          <VaultProvider vault={vault}>
            <CanvasPanel
              ref={ref}
              canvasId=""
              viewRotation={45}
              enableTouchRotation={false}
              touchRotationSnap={0}
              onCanvasChange={change}
              onReady={ready}
            >
              <button slot="overlay">Control</button>
            </CanvasPanel>
          </VaultProvider>
        </StrictMode>,
      ),
    );
    expect(ref.current?.vault).toBe(vault);
    expect(ref.current?.getAttribute("view-rotation")).toBe("45");
    expect(ref.current?.getAttribute("enable-touch-rotation")).toBe("false");
    expect(ref.current?.getAttribute("touch-rotation-snap")).toBe("0");
    expect(ready).toHaveBeenCalledWith(ref.current);
    const child = host.querySelector("button");
    const originalCanvas = ref.current?.getCanvasId();
    await act(async () => ref.current!.setCanvas("https://example.org/requested"));
    expect(change).toHaveBeenCalledWith({ canvasId: "https://example.org/requested" });
    expect(ref.current?.getCanvasId()).toBe(originalCanvas);
    expect(host.querySelector("button")).toBe(child);
  } finally {
    await act(async () => root.unmount());
    host.remove();
  }
});

it("hydrates the server shell without replacing application-owned children", async () => {
  const host = document.createElement("div");
  const vault = new Vault();
  const ref = createRef<CanvasPanelElement>();
  const tree = (
    <StrictMode>
      <VaultProvider vault={vault}>
        <CanvasPanel ref={ref}>
          <button>Starter control</button>
        </CanvasPanel>
      </VaultProvider>
    </StrictMode>
  );
  host.innerHTML = renderToString(tree);
  const child = host.querySelector("button");
  document.body.append(host);
  const errors: unknown[] = [];
  let root: ReturnType<typeof hydrateRoot>;
  await act(async () => {
    root = hydrateRoot(host, tree, { onRecoverableError: (error) => errors.push(error) });
  });
  try {
    expect(errors).toEqual([]);
    expect(ref.current?.vault).toBe(vault);
    expect(host.querySelector("button")).toBe(child);
  } finally {
    await act(async () => root.unmount());
    host.remove();
  }
});
