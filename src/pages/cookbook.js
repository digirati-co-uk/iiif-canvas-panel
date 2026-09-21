import React, { useEffect, useRef, useState } from "react";
import Layout from "@theme/Layout";
import catalogue from "../data/cookbook.json";

const label = (value, fallback) =>
  typeof value === "string"
    ? value
    : Object.values(value || {})
        .flat()
        .join(" / ") || fallback;

function Panel({ manifest, url, mode }) {
  const host = useRef(null);
  const panel = useRef(null);
  const [position, setPosition] = useState(null);
  const [canvas, setCanvas] = useState(manifest.items[0].id);
  const tag = mode === "auto" ? (manifest.items.length > 1 ? "sequence-panel" : "canvas-panel") : mode;

  useEffect(() => {
    const element = document.createElement(tag);
    panel.current = element;
    setPosition(null);
    const update = () => {
      const sequence = element.sequence;
      if (sequence) setPosition({ index: sequence.currentSequenceIndex, total: sequence.sequence.length });
    };
    element.addEventListener("sequence", update);
    element.addEventListener("sequence-change", update);
    element.setAttribute("manifest-id", url);
    if (tag === "canvas-panel") element.setAttribute("canvas-id", canvas);
    element.setAttribute("preset", "zoom");
    element.setAttribute("height", "520");
    element.setAttribute("text-enabled", "true");
    element.style.display = "block";
    host.current.append(element);
    return () => {
      element.removeEventListener("sequence", update);
      element.removeEventListener("sequence-change", update);
      element.remove();
      panel.current = null;
    };
  }, [url, tag, canvas]);

  return (
    <>
      <div className="cookbook-controls" role="group" aria-label="Viewer controls">
        <code>{tag}</code>
        {tag === "sequence-panel" ? (
          <>
            <button
              disabled={!position || position.index === 0}
              onClick={() => panel.current.sequence.previousCanvas()}
            >
              Previous
            </button>
            <span role="status">
              {position ? `View ${position.index + 1} of ${position.total}` : "Waiting for sequence…"}
            </span>
            <button
              disabled={!position || position.index >= position.total - 1}
              onClick={() => panel.current.sequence.nextCanvas()}
            >
              Next
            </button>
          </>
        ) : (
          <label>
            Canvas{" "}
            <select
              aria-label="Canvas"
              value={canvas}
              onChange={(event) => setCanvas(event.target.value)}
              style={{ maxWidth: "100%" }}
            >
              {manifest.items.map((item, index) => (
                <option key={item.id} value={item.id}>
                  {label(item.label, `Canvas ${index + 1}`)}
                </option>
              ))}
            </select>
          </label>
        )}
        <button onClick={() => panel.current?.zoomIn?.()}>Zoom in</button>
        <button onClick={() => panel.current?.zoomOut?.()}>Zoom out</button>
        <button onClick={() => panel.current?.goHome?.()}>Reset view</button>
      </div>
      <div
        ref={host}
        aria-label="Recipe preview"
        style={{ minHeight: 520, border: "1px solid var(--ifm-color-emphasis-300)" }}
      />
    </>
  );
}

function Resource({ url, mode, onSelect }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    let active = true;
    fetch(url, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((value) => {
        if (active) setData(value);
      })
      .catch((reason) => {
        if (active) setError(reason.name === "AbortError" ? "Request timed out." : reason.message);
      })
      .finally(() => clearTimeout(timeout));
    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [url]);

  if (error) return <p role="alert">Could not load this resource: {error} Select another recipe or reload to retry.</p>;
  if (!data) return <p role="status">Loading resource…</p>;
  if (data.type === "Collection") {
    return (
      <>
        <p>Collections cannot be rendered directly. Choose a member to test:</p>
        <ul>
          {(data.items || []).map((item) => (
            <li key={item.id}>
              <button onClick={() => onSelect(item.id)}>{label(item.label, item.id)}</button>
            </li>
          ))}
        </ul>
      </>
    );
  }
  if (
    data.type !== "Manifest" ||
    !data.items?.length ||
    !data.items.every((item) => item.type === "Canvas" && item.id)
  ) {
    return (
      <p role="status">
        This resource has no renderable Presentation 3/4 manifest canvases. Inspect its JSON and the recipe for the
        expected behavior.
      </p>
    );
  }
  return <Panel manifest={data} url={url} mode={mode} />;
}

function Recipe({ recipe }) {
  const [url, setUrl] = useState(recipe.resources[0] || "");
  const [mode, setMode] = useState("auto");
  const resources = [...new Set([...recipe.resources, ...(url ? [url] : [])])];
  return (
    <>
      <h2>{recipe.title}</h2>
      <p>
        <a href={recipe.url}>Read the official recipe</a>
        {url && (
          <>
            {" "}
            · <a href={url}>Open JSON resource</a>
          </>
        )}
      </p>
      <div className="cookbook-controls">
        {!!resources.length && (
          <label>
            Resource{" "}
            <select
              aria-label="Resource"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              style={{ maxWidth: "100%" }}
            >
              {resources.map((resource) => (
                <option key={resource} value={resource}>
                  {resource.split("/").slice(-2).join("/")}
                </option>
              ))}
            </select>
          </label>
        )}
        <label>
          Panel{" "}
          <select aria-label="Panel" value={mode} onChange={(event) => setMode(event.target.value)}>
            <option value="auto">Automatic</option>
            <option value="canvas-panel">Canvas panel</option>
            <option value="sequence-panel">Sequence panel</option>
          </select>
        </label>
      </div>
      {url ? (
        <Resource key={url} url={url} mode={mode} onSelect={setUrl} />
      ) : (
        <p>
          This recipe publishes no standalone JSON example. Follow the official recipe for its linked examples and
          manual steps.
        </p>
      )}
    </>
  );
}

export default function Cookbook() {
  const [current, setCurrent] = useState(catalogue.recipes[0].id);
  const [search, setSearch] = useState("");
  useEffect(() => {
    const update = () => setCurrent(window.location.hash.slice(1) || catalogue.recipes[0].id);
    update();
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  const filtered = catalogue.recipes.filter((recipe) =>
    `${recipe.id} ${recipe.title}`.toLowerCase().includes(search.toLowerCase()),
  );
  const selected = catalogue.recipes.find((recipe) => recipe.id === current);
  return (
    <Layout
      title="Cookbook"
      description="Manually smoke-test the official IIIF Cookbook with Canvas Panel and Sequence Panel."
    >
      <div className="docs-example-gallery">
        <aside aria-label="Find a recipe">
          <h1>Cookbook</h1>
          <label>
            Search recipes
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} />
          </label>
          <p>
            {filtered.length} of {catalogue.recipes.length} recipes
          </p>
          <nav aria-label="Cookbook recipes">
            <ul>
              {filtered.map((recipe) => (
                <li key={recipe.id}>
                  <a href={`#${recipe.id}`} aria-current={current === recipe.id ? "page" : undefined}>
                    {recipe.title}
                  </a>
                </li>
              ))}
            </ul>
            {!filtered.length && <p>No matching recipes.</p>}
          </nav>
        </aside>
        <main>
          <p>
            Manual smoke tests using the <a href={catalogue.source}>official IIIF Cookbook</a>. Automatic mode uses
            Canvas Panel for one canvas and Sequence Panel for multiple canvases. Only the selected resource is loaded.
          </p>
          <p>
            Rendering is not a support verdict. Compare with the recipe’s expected behavior; metadata, annotations,
            navigation, audio/video, 3D, and other features may be missing or unsupported.
          </p>
          {selected ? (
            <Recipe key={selected.id} recipe={selected} />
          ) : (
            <p>Recipe not found. Choose one from the list.</p>
          )}
        </main>
      </div>
    </Layout>
  );
}
