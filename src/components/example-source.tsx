import React, { useEffect, useMemo, useRef, useState } from "react";

type TypeInfo = { text: string; docs: string; left: number; top: number };

export function ExampleSource({ file, source, html }: { file: string; source: string; html: string }) {
  const [info, setInfo] = useState<TypeInfo | null>(null);
  const [copyStatus, setCopyStatus] = useState("");
  const [wrap, setWrap] = useState(false);
  // Keep the source DOM (and its scroll/focus) intact when the popup changes.
  const highlightedHtml = useMemo(() => ({ __html: html }), [html]);
  const activeToken = useRef<HTMLElement | null>(null);
  function close() {
    activeToken.current = null;
    setInfo(null);
  }
  useEffect(() => {
    const dismiss = (event: Event) => {
      if (activeToken.current && !(event.target instanceof Element && event.target.closest(".docs-example-type")))
        inspect(activeToken.current);
    };
    const outside = (event: PointerEvent) => {
      if (!(event.target instanceof Element && event.target.closest(".twoslash-hover, .docs-example-type"))) close();
    };
    window.addEventListener("pointerdown", outside);
    window.addEventListener("scroll", dismiss, true);
    window.addEventListener("resize", dismiss);
    return () => {
      window.removeEventListener("pointerdown", outside);
      window.removeEventListener("scroll", dismiss, true);
      window.removeEventListener("resize", dismiss);
    };
  }, []);
  function inspect(target: EventTarget) {
    const token = target instanceof Element ? target.closest<HTMLElement>(".twoslash-hover") : null;
    if (!token) return;
    activeToken.current = token;
    const rect = token.getBoundingClientRect();
    setInfo({
      text: token.dataset.type || "",
      docs: token.dataset.docs || "",
      left: Math.max(8, Math.min(rect.left, window.innerWidth - Math.min(560, window.innerWidth - 16) - 8)),
      top: rect.bottom + 224 < window.innerHeight ? rect.bottom + 6 : Math.max(8, rect.top - 224),
    });
  }
  return (
    <div
      className={`docs-example-code${wrap ? " docs-example-code--wrap" : ""}`}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) close();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") close();
        if ((event.key === "Enter" || event.key === " ") && (event.target as Element).closest(".twoslash-hover")) {
          event.preventDefault();
          inspect(event.target);
        }
      }}
    >
      <div className="docs-example-code-toolbar">
        <span>{file}</span>
        <button type="button" aria-pressed={wrap} onClick={() => setWrap(!wrap)}>
          Wrap lines
        </button>
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(source);
              setCopyStatus("Copied");
            } catch {
              setCopyStatus("Could not copy. Select the code to copy it.");
            }
          }}
        >
          Copy code
        </button>
        <span role="status">{copyStatus}</span>
      </div>
      {html.includes("twoslash-hover") && (
        <p className="docs-example-type-hint">Hover, focus or tap an underlined name for its type.</p>
      )}
      <div
        onMouseOver={(event) => inspect(event.target)}
        onFocus={(event) => inspect(event.target)}
        onClick={(event) => inspect(event.target)}
        dangerouslySetInnerHTML={highlightedHtml}
      />
      {info && (
        <div className="docs-example-type" role="tooltip" style={{ left: info.left, top: info.top }}>
          <button type="button" aria-label="Close type information" onClick={close}>
            ×
          </button>
          <pre>{info.text}</pre>
          {info.docs && <p>{info.docs}</p>}
        </div>
      )}
    </div>
  );
}
