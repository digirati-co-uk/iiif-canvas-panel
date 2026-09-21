import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { chromium, webkit } from "playwright";

const base = process.env.DOCS_URL || "http://127.0.0.1:3000";
const browserType = process.env.EXAMPLE_BROWSER === "webkit" ? webkit : chromium;
const browser = await browserType.launch({ headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
  });
  const flexManifest = "https://iiif.io/api/cookbook/recipe/0036-composition-from-multiple-images/manifest.json";
  await page.route(
    (url) => url.href === "https://digirati-co-uk.github.io/wunder.json" || url.href === flexManifest,
    (route) => {
      const manifestId = route.request().url();
      const canvasId =
        manifestId === flexManifest
          ? manifestId.replace("manifest.json", "canvas/p1")
          : "https://digirati-co-uk.github.io/wunder/canvases/2";
      return route.fulfill({
        json: {
          id: manifestId,
          type: "Manifest",
          items: [
            {
              id: canvasId,
              type: "Canvas",
              width: 960,
              height: 640,
              items: [
                {
                  id: `${canvasId}/page`,
                  type: "AnnotationPage",
                  items: [
                    {
                      id: `${canvasId}/painting`,
                      type: "Annotation",
                      motivation: "painting",
                      target: canvasId,
                      body: {
                        id:
                          "data:image/svg+xml," +
                          encodeURIComponent(
                            '<svg xmlns="http://www.w3.org/2000/svg" width="960" height="640"><rect width="960" height="640" fill="#2463a7"/></svg>',
                          ),
                        type: "Image",
                        format: "image/svg+xml",
                        width: 960,
                        height: 640,
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      });
    },
  );
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  // Source is in the generated HTML, even without JavaScript or the preview service.
  const html = await (await page.request.get(`${base}/docs/intro`)).text();
  assert(html.includes("src/index.ts") && html.includes("loadManifest"));
  async function open(id) {
    await page.goto(`${base}/all-sandboxes#${id}`);
    const iframe = page.locator(`.docs-example-preview iframe[src$="/${id}/"]`);
    await iframe.scrollIntoViewIfNeeded();
    const frame = await (await iframe.elementHandle()).contentFrame();
    assert(
      await page
        .locator(".docs-example-gallery")
        .evaluate(
          (element) =>
            Math.abs(element.getBoundingClientRect().width - element.parentElement.getBoundingClientRect().width) < 1,
        ),
      `${id}: gallery must fill the available width`,
    );
    await frame.waitForFunction(() => document.querySelector("canvas-panel")?.getCanvasId?.(), null, {
      timeout: 60000,
    });
    assert.equal(new URL(frame.url()).pathname, new URL(`${base}/examples/${id}/`).pathname);
    if (id === "intro-script" || id === "flexbox")
      await frame.waitForFunction(() => {
        const canvas = document.querySelector("canvas-panel").shadowRoot.querySelector("canvas");
        const pixel = canvas?.getContext("2d")?.getImageData(canvas.width / 2, canvas.height / 2, 1, 1).data;
        return pixel && pixel[0] === 36 && pixel[1] === 99 && pixel[2] === 167;
      });
    return frame;
  }
  let frame = await open("intro-script");
  assert.equal(await page.locator(".docs-example-source pre").count(), 1);
  const originalSource = await readFile("sandboxes/00-intro/intro-script.csb/src/index.ts", "utf8");
  assert.equal(await page.locator(".shiki code").textContent(), originalSource);
  await page.evaluate(() =>
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (text) => {
          window.__copiedExample = text;
        },
      },
    }),
  );
  await page.getByRole("button", { name: "Copy code", exact: true }).click();
  assert.equal(await page.evaluate(() => window.__copiedExample), originalSource);
  const method = page.locator('.twoslash-hover[data-type*="CanvasPanelElement.setCanvas"]').first();
  await method.focus();
  await page.getByRole("tooltip").waitFor();
  assert((await page.getByRole("tooltip").textContent()).includes("setCanvas(id: string): void"));
  await page.keyboard.press("Escape");
  assert.equal(await page.getByRole("tooltip").count(), 0);
  await method.hover();
  await page.getByRole("tooltip").waitFor();
  await page.getByRole("button", { name: "Close type information" }).click();
  await page.getByRole("button", { name: "Wrap lines" }).click();
  assert.equal(await page.locator(".shiki").evaluate((element) => getComputedStyle(element).whiteSpace), "pre-wrap");
  await page.getByRole("button", { name: "Wrap lines" }).click();
  await page.locator(".docs-example-files button", { hasText: "index.html" }).click();
  assert((await page.locator(".docs-example-source pre").textContent()).includes("<canvas-panel"));
  await page.getByRole("button", { name: "Reset preview" }).click();
  await page.locator(".docs-example-preview iframe").waitFor();
  const resetFrame = await (await page.locator(".docs-example-preview iframe").elementHandle()).contentFrame();
  await resetFrame.waitForFunction(() => document.querySelector("canvas-panel")?.getCanvasId?.());
  await resetFrame.locator("canvas-panel canvas").waitFor();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: `/tmp/canvas-example-${browserType.name()}-desktop.png`,
    fullPage: true,
  });
  const lightBackground = await page
    .locator(".docs-example-header")
    .evaluate((element) => getComputedStyle(element).backgroundColor);
  await page.getByRole("button", { name: /Switch between dark and light mode/ }).click();
  await page.waitForFunction(
    (background) => getComputedStyle(document.querySelector(".docs-example-header")).backgroundColor !== background,
    lightBackground,
  );
  await page.screenshot({
    path: `/tmp/canvas-example-${browserType.name()}-dark.png`,
    fullPage: true,
  });

  frame = await open("flexbox");
  for (const size of [
    { width: 600, height: 450 },
    { width: 360, height: 300 },
  ]) {
    await frame.locator(".resize").evaluate((element, size) => {
      element.style.boxSizing = "border-box";
      element.style.flex = "none";
      element.style.width = `${size.width}px`;
      element.style.height = `${size.height}px`;
    }, size);
    await frame.waitForFunction(({ width, height }) => {
      const panel = document.querySelector("canvas-panel");
      const canvas = panel.shadowRoot.querySelector("canvas");
      const rect = canvas.getBoundingClientRect();
      const pixel = canvas.getContext("2d").getImageData(canvas.width / 2, canvas.height / 2, 1, 1).data;
      return (
        rect.width === width - 60 &&
        rect.height === height - 60 &&
        pixel[0] === 36 &&
        pixel[1] === 99 &&
        pixel[2] === 167
      );
    }, size);
  }

  frame = await open("react-choices-example");
  const reactSource = page.locator(".shiki");
  await reactSource.scrollIntoViewIfNeeded();
  await reactSource.evaluate((element) => {
    element.scrollTop = 250;
    window.__sourceBeforeHover = element;
  });
  await page.locator(".twoslash-hover").filter({ hasText: "onChoice" }).last().hover();
  await page.getByRole("tooltip").waitFor();
  assert(
    await reactSource.evaluate((element) => element === window.__sourceBeforeHover && element.scrollTop === 250),
    "Opening type information replaces or scrolls the source",
  );
  await page.getByRole("button", { name: "Close type information" }).click();
  assert.equal(await reactSource.evaluate((element) => element.scrollTop), 250);
  const checkbox = frame.locator("input[type=checkbox]").nth(1);
  await checkbox.waitFor({ timeout: 60000 });
  const checked = await checkbox.isChecked();
  await checkbox.click();
  await frame.waitForFunction(
    (expected) => document.querySelectorAll("input[type=checkbox]")[1].checked === expected,
    !checked,
  );
  assert.equal(await frame.locator("canvas-panel").count(), 1);

  frame = await open("vue-3-carousel");
  const before = await frame.locator("canvas-panel").evaluate((panel) => panel.getCanvasId());
  await frame.locator(".thumb-list button").nth(1).click();
  await frame.waitForFunction((id) => document.querySelector("canvas-panel").getCanvasId() !== id, before);

  await page.setViewportSize({ width: 390, height: 844 });
  await open("intro-script");
  assert(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    "Mobile example overflows horizontally",
  );
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: `/tmp/canvas-example-${browserType.name()}-mobile.png`,
    fullPage: true,
  });
  const link = page.getByRole("link", { name: "Open in StackBlitz" });
  await page.locator('.twoslash-hover[data-type*="CanvasPanelElement.setCanvas"]').first().click();
  const popupBounds = await page.getByRole("tooltip").boundingBox();
  assert(popupBounds.x >= 0 && popupBounds.x + popupBounds.width <= 390, "Type information overflows on mobile");
  await page.getByRole("button", { name: "Close type information" }).click();
  assert((await link.getAttribute("href")).includes("example-editor?id=intro-script"));
  const supportsInline = browserType === chromium && (await page.evaluate(() => window.crossOriginIsolated));
  assert.equal(await page.getByRole("button", { name: "Edit here" }).count(), supportsInline ? 1 : 0);

  // A failed project fetch leaves a recoverable launcher instead of a blank tab.
  let failures = 0;
  await page.route("**/examples/projects/intro-script.json", (route) => {
    failures++;
    return route.fulfill({ status: 503, body: "Unavailable" });
  });
  await page.goto(`${base}/example-editor?id=intro-script`);
  await page.getByRole("alert").waitFor();
  await page.getByRole("button", { name: "Retry", exact: true }).click();
  await page.waitForFunction(() => document.querySelector('[role="alert"]')?.textContent.includes("503"));
  assert.equal(failures, 2);

  const catalog = JSON.parse(await readFile(".docs-examples/catalog.json", "utf8"));
  const assets = new Set();
  for (const example of catalog.examples) {
    const url = `${base}/examples/${example.id}/`;
    const response = await page.request.get(url);
    assert.equal(response.status(), 200, example.id);
    const html = await response.text();
    assert(html.includes("reportExampleError"), `${example.id}: expected a preview, not the docs 404 fallback`);
    for (const [, asset] of html.matchAll(/(?:src|href)="(\.\.\/assets\/[^"\s]+)"/g)) {
      assets.add(new URL(asset, url).href);
    }
  }
  assert(assets.size > 0, "Preview assets must be checked");
  for (const asset of assets) {
    assert.equal((await page.request.get(asset)).status(), 200, asset);
  }
  assert.deepEqual(errors, []);
  console.log(
    `Example previews, interactions, source, reset, mobile layout and export links passed (${browserType.name()}).`,
  );
} finally {
  await browser.close();
}
