import type { CanvasPanelElement, CanvasPanelEventMap } from "@digirati/canvas-panel-web-components";
import "@digirati/canvas-panel-web-components/dist/index.css";
import React, { useLayoutEffect, useRef, useState } from "react";
import "./styles.css";
import "@digirati/canvas-panel-web-components";

export default function App() {
  const viewer = useRef<CanvasPanelElement>(null);
  const [choice, setChoice] =
    useState<Extract<CanvasPanelEventMap["choice"]["detail"]["choice"], { type: "single-choice" }>>();

  // Keep at least one painting choice visible.
  const disabledChoice = choice ? choice.items.filter((i) => i.selected).length === 1 : false;

  // Listen for the element's choice data, then remove the listener on unmount.
  useLayoutEffect(() => {
    const element = viewer.current;
    if (!element) return;

    const onChoice = (event: CanvasPanelEventMap["choice"]) => {
      if (event.detail.choice.type === "single-choice") setChoice(event.detail.choice);
    };

    element.addEventListener("choice", onChoice);
    return () => element.removeEventListener("choice", onChoice);
  }, []);

  return (
    <div className="App">
      {choice
        ? choice.items.map((item, idx) => {
            return (
              <div key={item.id}>
                <input
                  type="checkbox"
                  aria-label={`Show ${item.label?.en?.join(" ") || item.id}`}
                  disabled={disabledChoice && item.selected}
                  onChange={(e) => {
                    if (idx !== 0 && disabledChoice) {
                      // Select the first (default) choice when another choice is made.
                      viewer.current?.makeChoice(choice.items[0].id, {
                        deselectOthers: false,
                      });
                    }

                    viewer.current?.makeChoice(item.id, {
                      deselect: item.selected,
                      deselectOthers: false,
                    });
                  }}
                  checked={item.selected}
                />

                <strong>{item.label?.en?.join("") || item.id}</strong>
                <input
                  type="range"
                  aria-label={`Opacity for ${item.label?.en?.join(" ") || item.id}`}
                  min={0}
                  max={100}
                  defaultValue={100}
                  onChange={(e) => {
                    viewer.current?.applyStyles(item.id, {
                      opacity: Number(e.target.value) / 100,
                    });
                  }}
                />
              </div>
            );
          })
        : null}

      <canvas-panel
        ref={viewer}
        manifest-id="https://iiif.io/api/cookbook/recipe/0033-choice/manifest.json"
        canvas-id="https://iiif.io/api/cookbook/recipe/0033-choice/canvas/p1"
        region="837,913,771,334"
      />
    </div>
  );
}
