import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { chromium } from "playwright";

const base = "http://canvas-panel.test";
const intro = await readFile("docs/intro.md", "utf8");
const states = [
  ...intro.split("Content states can be used to point at any part of a Canvas:")[1].matchAll(/iiif-content="([^"]+)"/g),
].map((match) => match[1]);
assert.equal(states.length, 3);
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
});
try {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route(`${base}/index.iife.js`, (route) =>
    route.fulfill({ path: "packages/canvas-panel/dist/index.iife.js", contentType: "text/javascript" }),
  );
  await page.route(`${base}/content-state-check`, (route) =>
    route.fulfill({
      contentType: "text/html",
      body: '<script src="/index.iife.js"></script><main style="width:600px"></main>',
    }),
  );
  await page.goto(`${base}/content-state-check`);
  await page.waitForFunction(() => !!customElements.get("canvas-panel"));
  // Keep the docs' exact encoded states, with a local image so this check needs no remote services.
  await page.route("https://digirati-co-uk.github.io/wunder.json", (route) => {
    const id = "https://digirati-co-uk.github.io/wunder/canvases/0";
    return route.fulfill({
      json: {
        id: "https://digirati-co-uk.github.io/wunder.json",
        type: "Manifest",
        items: [
          {
            id,
            type: "Canvas",
            width: 3000,
            height: 4000,
            items: [
              {
                id: `${id}/page`,
                type: "AnnotationPage",
                items: [
                  {
                    id: `${id}/painting`,
                    type: "Annotation",
                    motivation: "painting",
                    target: id,
                    body: {
                      id:
                        "data:image/svg+xml," +
                        encodeURIComponent(
                          '<svg xmlns="http://www.w3.org/2000/svg" width="3000" height="4000"><rect width="3000" height="4000" fill="orange"/></svg>',
                        ),
                      type: "Image",
                      format: "image/svg+xml",
                      width: 3000,
                      height: 4000,
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    });
  });
  await page.evaluate((states) => {
    for (const state of states) {
      const panel = document.createElement("canvas-panel");
      panel.setAttribute("preset", "responsive");
      panel.setAttribute("iiif-content", state);
      document.querySelector("main").append(panel);
    }
  }, states);
  for (const width of [600, 420]) {
    await page.locator("main").evaluate((main, width) => (main.style.width = `${width}px`), width);
    for (const [index, state] of states.entries()) {
      const decoded = JSON.parse(decodeURIComponent(Buffer.from(state, "base64url").toString()));
      const [x, y, w, h] = decoded.id.split("xywh=")[1].split(",").map(Number);
      await page.waitForFunction(
        ({ index, x, y, w, h, width }) => {
          const panel = document.querySelectorAll("canvas-panel")[index];
          const position = panel.getPosition?.();
          const container = panel.shadowRoot?.querySelector(".atlas-container");
          const image = panel.shadowRoot?.querySelector("img");
          const tolerance = (2 * w) / width; // Allow two screen pixels of Atlas viewport rounding.
          return (
            image?.complete &&
            image.naturalWidth > 0 &&
            position &&
            Math.abs(position.x - x) < tolerance &&
            Math.abs(position.y - y) < tolerance &&
            Math.abs(position.width - w) < tolerance &&
            Math.abs(position.height - h) < tolerance &&
            container.clientWidth === width &&
            Math.abs(container.clientHeight - (width * h) / w) < 2
          );
        },
        { index, x, y, w, h, width },
        { timeout: 10000 },
      );
    }
  }
  assert.deepEqual(errors, []);
  console.log("Passed: all three docs content-state crops and responsive resizing.");
} finally {
  await browser.close();
}
