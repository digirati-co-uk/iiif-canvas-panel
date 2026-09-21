import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { chromium } from "playwright";

const base = process.env.DOCS_URL || "http://127.0.0.1:3000";
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
});
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
try {
  await page.goto(`${base}/docs/installation`);
  await page.waitForFunction(() => !!customElements.get("canvas-panel"));
  assert.equal(await page.locator(".alert [role=tablist]").count(), 0, "Admonition must end before the tabs");
  const served = await (await page.request.get(`${base}/index.iife.js`)).text();
  assert.equal(served, await readFile("packages/canvas-panel/dist/index.iife.js", "utf8"));
  assert.equal(await page.getByRole("tab", { name: "Script tag" }).count(), 1);
  await page.getByRole("tab", { name: "Package / workspace" }).click();
  assert(await page.getByText("The shared-React ESM entry", { exact: false }).isVisible());

  // Exercise the actual bundled runtime inside Docusaurus's separate React tree.
  await page.evaluate(async () => {
    const id = "https://example.org/docs-check/canvas";
    const image =
      "data:image/svg+xml," +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="960" height="640"><rect width="960" height="640" fill="#2463a7"/><rect x="320" y="160" width="320" height="320" fill="#f69a35"/></svg>',
      );
    const panel = document.createElement("canvas-panel");
    panel.id = "docs-check";
    panel.setAttribute("width", "480");
    document.querySelector("main").prepend(panel);
    await panel.vault.load(id, {
      id,
      type: "Canvas",
      width: 960,
      height: 640,
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
                id: image,
                type: "Image",
                width: 960,
                height: 640,
                format: "image/svg+xml",
              },
            },
          ],
        },
      ],
    });
    panel.setCanvas(id);
  });
  await page.waitForFunction(() => {
    const canvas = document.querySelector("#docs-check").shadowRoot.querySelector("canvas");
    if (!canvas?.width) return false;
    const pixel = canvas.getContext("2d").getImageData(canvas.width / 2, canvas.height / 2, 1, 1).data;
    return pixel[0] === 246 && pixel[1] === 154 && pixel[2] === 53;
  });
  const dimensions = () =>
    page.evaluate(() => {
      const canvas = document.querySelector("#docs-check").shadowRoot.querySelector("canvas");
      return [canvas.clientWidth, canvas.clientHeight];
    });
  assert.deepEqual(await dimensions(), [480, 512], "Default viewport height must remain 512px");
  await page.evaluate(() => {
    const panel = document.querySelector("#docs-check");
    panel.setAttribute("height", "240");
    panel.setAttribute("width", "360");
  });
  await page.waitForFunction(() => {
    const canvas = document.querySelector("#docs-check").shadowRoot.querySelector("canvas");
    return canvas.clientWidth === 360 && canvas.clientHeight === 240;
  });
  const home = await page.evaluate(() => document.querySelector("#docs-check").getPosition());
  await page.evaluate(() => document.querySelector("#docs-check").zoomIn());
  await page.waitForFunction((width) => document.querySelector("#docs-check").getPosition().width < width, home.width);
  await page.evaluate(() => document.querySelector("#docs-check").goHome());
  await page.waitForFunction(
    (width) => Math.abs(document.querySelector("#docs-check").getPosition().width - width) <= 1,
    home.width,
  );
  await page.evaluate(async () => {
    const panel = document.querySelector("#docs-check");
    const id = "https://example.org/docs-check/highlight";
    await panel.vault.load(id, {
      id,
      type: "Annotation",
      motivation: "highlighting",
      target: `${panel.getCanvasId()}#xywh=320,160,320,320`,
    });
    const highlight = panel.createAnnotationDisplay(id);
    highlight.className = "docs-check-highlight";
    panel.annotations.add(highlight);
    window.docsCheckHighlight = highlight;
  });
  const highlight = page.locator("#docs-check .docs-check-highlight");
  await highlight.waitFor();
  await page.evaluate(() =>
    window.docsCheckHighlight.applyStyle({
      borderWidth: "2px",
      borderStyle: "solid",
      borderColor: "green",
      ":hover": { borderColor: "orange" },
    }),
  );
  const waitForBorder = (color) =>
    page.waitForFunction((color) => {
      const highlight = document.querySelector("#docs-check").shadowRoot.querySelector(".docs-check-highlight");
      return getComputedStyle(highlight).borderColor === color;
    }, color);
  await waitForBorder("rgb(0, 128, 0)");
  // Highlights let pointer movement reach the Atlas canvas for hit testing.
  await page.locator("#docs-check .atlas-container").scrollIntoViewIfNeeded();
  const bounds = await highlight.boundingBox();
  const canvasBounds = await page.locator("#docs-check canvas").boundingBox();
  // Move into the visible intersection without scrolling the clipped overlay itself.
  await page.mouse.move(
    (Math.max(bounds.x, canvasBounds.x) + Math.min(bounds.x + bounds.width, canvasBounds.x + canvasBounds.width)) / 2,
    (Math.max(bounds.y, canvasBounds.y) + Math.min(bounds.y + bounds.height, canvasBounds.y + canvasBounds.height)) / 2,
  );
  await waitForBorder("rgb(255, 165, 0)");
  await page.locator("#docs-check canvas").hover({ position: { x: 1, y: 1 } });
  await waitForBorder("rgb(0, 128, 0)");

  async function checkStaticImage(width, height) {
    await page.waitForFunction(
      ([width, height]) => {
        const shadow = document.querySelector("#docs-check").shadowRoot;
        const container = shadow.querySelector(".atlas-static-container");
        const overlay = shadow.querySelector(".atlas-overlay");
        const image = container?.querySelector("img");
        return (
          container?.clientWidth === width &&
          container.clientHeight === height &&
          overlay?.clientWidth === width &&
          overlay.clientHeight === height &&
          image?.complete &&
          image.naturalWidth > 0
        );
      },
      [width, height],
    );
    // Read the browser screenshot: loaded images can still be clipped to zero height.
    const screenshot = await page.locator("#docs-check .atlas-container").screenshot();
    const pixel = await page.evaluate(async (base64) => {
      const image = new Image();
      image.src = `data:image/png;base64,${base64}`;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, Math.floor(image.width / 2), Math.floor(image.height / 2), 1, 1, 0, 0, 1, 1);
      return [...ctx.getImageData(0, 0, 1, 1).data];
    }, screenshot.toString("base64"));
    assert.deepEqual(pixel, [246, 154, 53, 255], "Static image must actually be visible");
  }
  await page.evaluate(() => document.querySelector("#docs-check").setAttribute("preset", "static"));
  await checkStaticImage(360, 240);
  await page.evaluate(() => document.querySelector("#docs-check").setAttribute("height", "300"));
  await checkStaticImage(360, 300);
  await page.evaluate(() => {
    const panel = document.querySelector("#docs-check");
    panel.removeAttribute("height");
    panel.setAttribute("preset", "responsive");
  });
  await page.waitForFunction(() => {
    const panel = document.querySelector("#docs-check");
    const container = panel.shadowRoot.querySelector(".atlas-container");
    return container?.clientWidth === 360 && container.clientHeight === 240 && !!panel.shadowRoot.querySelector("img");
  });
  await checkStaticImage(360, 240);
  await page.evaluate(async () => {
    const panel = document.querySelector("#docs-check");
    const id = "https://example.org/docs-check/choice";
    const first =
      "data:image/svg+xml," +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="960" height="640"><rect width="960" height="640" fill="blue"/></svg>',
      );
    const second =
      "data:image/svg+xml," +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="960" height="640"><rect width="960" height="640" fill="red"/></svg>',
      );
    panel.dataset.secondChoice = second;
    panel.addEventListener("choice", (event) => {
      panel.dataset.selection = event.detail.choice.items
        .filter((item) => item.selected)
        .map((item) => item.id)
        .join("|");
    });
    await panel.vault.load(id, {
      id,
      type: "Canvas",
      width: 960,
      height: 640,
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
                type: "Choice",
                items: [first, second].map((id, i) => ({
                  id,
                  type: "Image",
                  width: 960,
                  height: 640,
                  format: "image/svg+xml",
                  label: { en: [`Choice ${i}`] },
                })),
              },
            },
          ],
        },
      ],
    });
    panel.setCanvas(id);
  });
  await page.waitForFunction(() => !!document.querySelector("#docs-check").dataset.selection);
  await page.evaluate(() => {
    const panel = document.querySelector("#docs-check");
    panel.makeChoice(panel.dataset.secondChoice, { deselectOthers: true });
  });
  await page.waitForFunction(() => {
    const panel = document.querySelector("#docs-check");
    return panel.dataset.selection === panel.dataset.secondChoice;
  });
  if (process.argv.includes("--demos")) {
    async function sandbox(name, tag = "canvas-panel") {
      await page.goto(`${base}/all-sandboxes#${name}`);
      const iframe = page.locator(`iframe[src$="/${name}/"]`);
      await iframe.scrollIntoViewIfNeeded();
      const frame = await (await iframe.elementHandle()).contentFrame();
      assert(frame, `Missing preview for ${name}`);
      await frame.waitForFunction((tag) => {
        const element = document.querySelector(tag);
        return !!(element?.getCanvasId?.() || element?.sequence);
      }, tag);
      return frame;
    }
    let frame = await sandbox("react-choices-example");
    await frame.locator("input[type=checkbox]").nth(1).click();
    await frame.waitForFunction(() => document.querySelectorAll("input[type=checkbox]")[1].checked);

    frame = await sandbox("vue-3-carousel");
    const before = await frame.evaluate(() => document.querySelector("canvas-panel").getCanvasId());
    await frame.locator(".thumb-list img").nth(1).click();
    await frame.waitForFunction((before) => document.querySelector("canvas-panel").getCanvasId() !== before, before);

    frame = await sandbox("sequence-panel", "sequence-panel");
    const initial = await frame.evaluate(() => document.querySelector("sequence-panel").sequence.currentSequenceIndex);
    await frame.locator("#next").click();
    await frame.waitForFunction(
      (initial) => document.querySelector("sequence-panel").sequence.currentSequenceIndex > initial,
      initial,
    );
    await frame.locator("#prev").click();
    await frame.waitForFunction(
      (initial) => document.querySelector("sequence-panel").sequence.currentSequenceIndex === initial,
      initial,
    );

    await page.goto(`${base}/demos/simplest-viewer.html`);
    await page.locator("#th img").nth(1).click();
    await page.waitForFunction(
      () =>
        document.querySelector("#cp").getCanvasId() ===
        document.querySelectorAll("#th img")[1].getAttribute("data-uri"),
    );
    console.log("Passed: React choices, Vue thumbnails, sequence previous/next, standalone thumbnail navigation.");
  }
  assert.deepEqual(errors, []);
  console.log(
    "Passed: local bundle, docs tabs, rendering, static/responsive screenshot pixels and dimensions, highlight hover entry/exit, zoom/home and choice-change events.",
  );
} finally {
  await browser.close();
}
