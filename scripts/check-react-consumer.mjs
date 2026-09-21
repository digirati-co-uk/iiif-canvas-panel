import { wunderUrl, wunderFixture } from "./fixtures/wunder.mjs";
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile, rm, cp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { execFileSync, spawn } from "node:child_process";
import { chromium } from "playwright";

const directory = await mkdtemp(path.join(tmpdir(), "canvas-react-host-"));
let server, browser;
const run = (command, args, cwd = directory) => execFileSync(command, args, { cwd, stdio: "inherit" });
try {
  const library = JSON.parse(await readFile("packages/canvas-panel/package.json", "utf8"));
  run("npm", ["pack", "--ignore-scripts", "--pack-destination", directory], "packages/canvas-panel");
  await writeFile(
    path.join(directory, "package.json"),
    JSON.stringify({
      private: true,
      type: "module",
      dependencies: {
        "@digirati/canvas-panel-web-components": `file:./digirati-canvas-panel-web-components-${library.version}.tgz`,
        react: library.devDependencies.react,
        "react-dom": library.devDependencies["react-dom"],
        "react-iiif-vault": library.dependencies["react-iiif-vault"],
        "@atlas-viewer/atlas": library.dependencies["@atlas-viewer/atlas"],
        vite: library.devDependencies.vite,
        "react-reconciler": library.devDependencies["react-reconciler"],
      },
    }),
  );
  for (const file of ["index.html", "App.tsx", "manifest.ts"])
    await cp(`sandboxes/react-drop-in.csb/${file}`, path.join(directory, file));
  await writeFile(
    path.join(directory, "vite.config.js"),
    'export default { build: { target: "esnext" }, oxc: { jsx: { runtime: "automatic" } } };',
  );
  run("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund"]);
  // Importing public adapter/registration entries must not touch browser globals.
  run("node", [
    "--input-type=module",
    "-e",
    'await import("@digirati/canvas-panel-web-components/elements"); await import("@digirati/canvas-panel-web-components/react");',
  ]);
  run("node", [
    "-e",
    'require("@digirati/canvas-panel-web-components/elements"); require("@digirati/canvas-panel-web-components/react");',
  ]);
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
  });
  for (const production of [false, true]) {
    if (production) run("npm", ["exec", "vite", "build"]);
    server = spawn(
      "npm",
      [
        "exec",
        "vite",
        ...(production ? ["preview"] : []),
        "--",
        "--host",
        "127.0.0.1",
        "--port",
        "5189",
        "--strictPort",
      ],
      { cwd: directory, stdio: "inherit", detached: true },
    );
    const page = await browser.newPage();
    await page.route(wunderUrl, (route) => route.fulfill({ json: wunderFixture }));
    const errors = [];
    page.on("pageerror", (e) => {
      errors.push(e.message);
      console.error(e.message);
    });
    page.on("console", (e) => {
      if (e.type() === "error") {
        errors.push(e.text());
        console.error(e.text());
      }
    });
    await assert.doesNotReject(async () => {
      for (let attempt = 0; attempt < 100; attempt++) {
        try {
          await page.goto("http://127.0.0.1:5189");
          break;
        } catch {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }
      await page.waitForFunction(() => {
        const canvas = document.querySelector("canvas-panel")?.shadowRoot?.querySelector("canvas");
        const pixel = canvas?.getContext("2d")?.getImageData(canvas.width / 2, canvas.height / 2, 1, 1).data;
        return pixel?.[0] === 36 && pixel?.[1] === 99;
      });
    });
    await page.getByRole("status").filter({ hasText: "Using the application Vault" }).waitFor();
    await page.getByRole("checkbox", { name: "Lock navigation" }).check();
    await page.getByRole("button", { name: "Next canvas" }).click();
    assert.equal(
      await page.locator("canvas-panel").evaluate((el) => el.getCanvasId()),
      "https://digirati-co-uk.github.io/wunder/canvases/2",
    );
    await page.getByRole("checkbox", { name: "Lock navigation" }).uncheck();
    await page.getByRole("button", { name: "Next canvas" }).click();
    await page.waitForFunction(() => document.querySelector("canvas-panel").getCanvasId().endsWith("/3"));
    await page.getByRole("button", { name: "React-owned child: 0" }).click();
    await page.getByRole("button", { name: "React-owned child: 1" }).waitFor();
    await page.getByRole("button", { name: "Unmount panel" }).click();
    assert.equal(await page.locator("canvas-panel").count(), 0);
    await page.getByRole("button", { name: "Mount panel" }).click();
    await page.waitForFunction(() => document.querySelector("canvas-panel")?.getCanvasId?.()?.endsWith("/3"));
    assert.deepEqual(errors, []);
    await page.close();
    process.kill(-server.pid, "SIGTERM");
    server = null;
    console.log(`Shared-Vault packed React consumer passed (${production ? "production" : "development"}).`);
  }
} finally {
  if (server) process.kill(-server.pid, "SIGTERM");
  await browser?.close();
  await rm(directory, { recursive: true, force: true });
}
