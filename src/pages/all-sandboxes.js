import React, { useEffect, useState } from "react";
import Layout from "@theme/Layout";
import { Sandbox } from "@site/Sandbox";

const ctx = require.context("../../sandboxes", true, /package\.json$/);
const ctxL = require.context("../../sandboxes", true, /_load\.ts$/);
const ctxR = require.context("../../sandboxes", true, /README\.md$/);
const allSandboxes = ctx.keys().map((key) => {
  const found = ctxL
    .keys()
    .find((r) => r.startsWith(key.slice(0, -1 * "/package.json".length)));
  const readMe = ctxR
    .keys()
    .find((r) => r.startsWith(key.slice(0, -1 * "/package.json".length)));

  return {
    pkg: ctx(key),
    key,
    loader: found ? ctxL(found) : null,
    readMe: readMe ? ctxR(readMe) : null,
  };
});

function getCurrent() {
  if (typeof window !== "undefined") {
    return window.location.hash.slice(1);
  }

  return "";
}

export default function AllSandboxes() {
  const [current, _setCurrent] = useState(getCurrent);
  const sandbox = allSandboxes.find((t) => t.pkg.name === current);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("hashchange", () => {
        window.scrollTo({ top: 0 });

        _setCurrent(getCurrent());
      });
    }
  }, []);

  const ReadMe = sandbox?.readMe?.default;

  return (
    <Layout
      title={`All sandboxes`}
      description="Description will go into a meta tag in <head />"
    >
      <div
        style={{
          display: "flex",
          maxWidth: 1600,
          margin: "0 auto",
          padding: "1em",
        }}
      >
        <div style={{ marginRight: "1em" }}>
          <h3>All sandboxes</h3>
          <ul
            style={{
              margin: 0,
              padding: 0,
              maxHeight: 820,
              overflow: "auto",
            }}
          >
            {allSandboxes.map((sandbox, i) => (
              <li
                key={i}
                style={{
                  margin: 0,
                  listStyle: "none",
                  padding: 5,
                  borderRadius: 5,
                  cursor: "pointer",
                  background: sandbox.pkg.name === current ? "#F2F2F2" : "",
                  color: sandbox.pkg.name === current ? "#DB6263" : "",
                }}
              >
                <a href={`#${sandbox.pkg.name}`}>
                  {sandbox.pkg.description || sandbox.pkg.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <main style={{ flex: 1, minWidth: 0 }}>
          {sandbox ? (
            sandbox.loader ? (
              <div key={current} id={current}>
                {ReadMe ? (
                  <ReadMe />
                ) : (
                  <h1>{sandbox.pkg.description || sandbox.pkg.name}</h1>
                )}
                <Sandbox project={sandbox.loader.default} />
              </div>
            ) : (
              <div>
                Invalid sandbox, missing <code>./_load.ts</code>
              </div>
            )
          ) : (
            <div>Choose sandbox</div>
          )}
        </main>
      </div>
    </Layout>
  );
}
