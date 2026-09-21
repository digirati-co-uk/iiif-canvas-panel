import { StrictMode, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { VaultProvider } from "react-iiif-vault";
import { CanvasPanel } from "@digirati/canvas-panel-web-components/react";
import type { CanvasPanelElement } from "@digirati/canvas-panel-web-components/elements";
import { vault, ids, loadManifest } from "./manifest";

function App() {
  const panel = useRef<CanvasPanelElement>(null);

  // React owns navigation; the panel requests changes through onCanvasChange.
  const [canvasId, setCanvasId] = useState(ids[0]);
  const [mounted, setMounted] = useState(true);
  const [locked, setLocked] = useState(false);
  const [shared, setShared] = useState(false);
  const [clicks, setClicks] = useState(0);

  return (
    <VaultProvider vault={vault}>
      <p>
        <a href="https://digirati-co-uk.github.io/wunder.json" target="_blank" rel="noreferrer">
          View IIIF manifest
        </a>
        . The Wunder manifest is loaded into the application's Vault before the panel mounts.
      </p>
      <button onClick={() => panel.current?.setCanvas(canvasId === ids[0] ? ids[1] : ids[0])}>Next canvas</button>{" "}
      <label>
        <input type="checkbox" checked={locked} onChange={(event) => setLocked(event.target.checked)} /> Lock navigation
      </label>{" "}
      <button onClick={() => setMounted((value) => !value)}>{mounted ? "Unmount" : "Mount"} panel</button>
      <p role="status">{shared ? "Using the application Vault" : "Waiting for panel"}</p>
      {/* The adapter reads the Vault from the surrounding provider. */}
      {mounted && (
        <CanvasPanel
          ref={panel}
          canvasId={canvasId}
          width="100%"
          height={360}
          onReady={(element) => setShared(element.vault === vault)}
          onCanvasChange={({ canvasId: next }) => {
            // Ignoring the request keeps the controlled canvas unchanged.
            if (!locked && next) setCanvasId(next);
          }}
        >
          {/* This child stays in the application's React tree. */}
          <button onClick={() => setClicks((value) => value + 1)}>React-owned child: {clicks}</button>
        </CanvasPanel>
      )}
    </VaultProvider>
  );
}

// Start React once the application Vault contains the manifest.
loadManifest().then(() =>
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  ),
);
