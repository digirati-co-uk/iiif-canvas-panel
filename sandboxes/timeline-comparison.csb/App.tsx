import { createContext, useContext, useState, useSyncExternalStore } from "react";
import { createRoot } from "react-dom/client";
import { CanvasPanel as ReactPanel, CanvasContext, Vault, VaultProvider } from "react-iiif-vault";
import { useComplexTimelineStore } from "react-iiif-vault/canvas-panel/scene";
import { CanvasPanel, useMediaSlots, type MediaSlotSnapshot } from "@digirati/canvas-panel-web-components/react";
import type { CanvasPanelElement } from "@digirati/canvas-panel-web-components";
import manifest from "./manifest.json";
import "./styles.css";

const vault = new Vault();
await vault.load(manifest.id, structuredClone(manifest));
const ControlLabel = createContext("Play");

function Controls({
  time,
  duration,
  paused,
  ready,
  seek,
  toggle,
}: {
  time: number;
  duration: number;
  paused: boolean;
  ready: boolean;
  seek: (time: number) => void;
  toggle: () => void;
}) {
  // This context belongs to the application, including controls projected into a native slot.
  const label = useContext(ControlLabel);
  return (
    <div className="controls">
      <button disabled={!ready} onClick={toggle}>
        {paused ? label : "Pause"}
      </button>
      <input
        aria-label="Timeline position"
        type="range"
        min={0}
        max={duration}
        step={0.1}
        value={time}
        disabled={!ready}
        onChange={(event) => seek(event.currentTarget.valueAsNumber)}
      />
      <output>{time.toFixed(1)}</output>
    </div>
  );
}

function ReactControls() {
  const store = useComplexTimelineStore();
  const state = useSyncExternalStore(store.subscribe, store.getState, store.getState);
  return (
    <Controls
      time={state.primeTime}
      duration={state.duration}
      paused={!state.isPlaying}
      ready={state.isReady}
      seek={state.setTime}
      toggle={state.playPause}
    />
  );
}

function SlotControls({ state }: { state: MediaSlotSnapshot | undefined }) {
  if (!state) return null;
  return (
    <Controls
      time={state.currentTime}
      duration={state.duration || 0}
      paused={state.paused}
      ready={state.ready}
      seek={state.actions.seek}
      toggle={state.actions.togglePlay}
    />
  );
}

function App() {
  const [canvasId, setCanvasId] = useState(manifest.items[0].id);
  const [panel, setPanel] = useState<CanvasPanelElement | null>(null);
  const slots = useMediaSlots(panel);
  return (
    <VaultProvider vault={vault}>
      <ControlLabel.Provider value="Play timeline">
        <label>
          Sequence{" "}
          <select value={canvasId} onChange={(event) => setCanvasId(event.target.value)}>
            {manifest.items.map((canvas) => (
              <option key={canvas.id} value={canvas.id}>
                {canvas.label.en[0]}
              </option>
            ))}
          </select>
        </label>
        <p>Both viewers share a Vault and the upstream scene renderer. Their playback is independent.</p>
        <section id="web-viewer">
          <h2>Canvas Panel web component</h2>
          <CanvasPanel
            ref={setPanel}
            canvasId={canvasId}
            height={280}
            width="100%"
            preset="static"
            renderSlot={(slot) =>
              slot.type === "controls" ? <SlotControls state={slots.find((state) => state.key === slot.key)} /> : null
            }
          />
        </section>
        <section id="react-viewer">
          <h2>React IIIF Vault: decomposed API</h2>
          <CanvasContext canvas={canvasId}>
            <ReactPanel.Viewer key={canvasId} height={280}>
              <ReactPanel.RenderCanvas
                strategies={["images", "media", "complex-timeline"]}
                enableSizes
                enableThumbnail
                renderComplexTimelineControls={() => <ReactControls />}
              />
            </ReactPanel.Viewer>
          </CanvasContext>
        </section>
      </ControlLabel.Provider>
    </VaultProvider>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
