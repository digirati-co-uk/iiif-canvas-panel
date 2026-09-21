import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { chromium } from "playwright";

// Run against the docs dev server: node scripts/check-cookbook.mjs
const { recipes } = JSON.parse(await readFile("src/data/cookbook.json", "utf8"));
assert.equal(new Set(recipes.map((recipe) => recipe.id)).size, recipes.length);
assert(recipes.every((recipe) => recipe.title && recipe.url.startsWith("https://iiif.io/api/cookbook/recipe/")));
assert(recipes.find((recipe) => recipe.id === "0011-book-3-behavior").resources.length >= 2);

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("https://iiif.io/**", (route) => {
    const id = route.request().url();
    if (id.includes("0002-mvm-audio")) return route.fulfill({ status: 503 });
    if (id.includes("0608-mvm-3d")) return route.fulfill({ json: { type: "Annotation" } });
    if (id.includes("0032-collection")) {
      return route.fulfill({
        json: {
          type: "Collection",
          items: [{ id: recipes[0].resources[0], type: "Manifest", label: { en: ["Member manifest"] } }],
        },
      });
    }
    return route.fulfill({
      json: {
        "@context": "http://iiif.io/api/presentation/3/context.json",
        id,
        type: "Manifest",
        items: Array.from({ length: id.includes("0009-book-1") ? 2 : 1 }, (_, index) => {
          const canvas = `${id}/canvas/${index}`;
          return {
            id: canvas,
            type: "Canvas",
            width: 100,
            height: 100,
            items: [
              {
                id: `${canvas}/page`,
                type: "AnnotationPage",
                items: [
                  {
                    id: `${canvas}/annotation`,
                    type: "Annotation",
                    motivation: "painting",
                    target: canvas,
                    body: {
                      id:
                        "data:image/svg+xml," +
                        encodeURIComponent(
                          '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><path fill="red" d="M0 0h100v100H0z"/></svg>',
                        ),
                      type: "Image",
                      format: "image/svg+xml",
                      width: 100,
                      height: 100,
                    },
                  },
                ],
              },
            ],
          };
        }),
      },
    });
  });
  await page.goto(`${process.env.DOCS_URL || "http://127.0.0.1:3000"}/cookbook`);
  await page.waitForFunction(() => !!document.querySelector("canvas-panel")?.getCanvasId?.());
  await page.waitForFunction(() => {
    const canvas = document.querySelector("canvas-panel")?.shadowRoot?.querySelector("canvas");
    return (
      canvas?.width && canvas.getContext("2d").getImageData(canvas.width / 2, canvas.height / 2, 1, 1).data[0] === 255
    );
  });
  await page.getByLabel("Resource", { exact: true }).selectOption({ index: 1 });
  await page.waitForFunction(() => document.querySelector("canvas-panel")?.getManifestId?.().includes("/v4/"));
  const open = async (id) => {
    await page.getByLabel("Search recipes").fill("");
    await page.locator(`nav[aria-label="Cookbook recipes"] a[href="#${id}"]`).click();
  };
  await page.getByLabel("Search recipes").fill("0009");
  assert.equal(await page.locator('nav[aria-label="Cookbook recipes"] a').count(), 1);
  await open("0009-book-1");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByText("View 2 of 2", { exact: true }).waitFor();
  assert(await page.getByRole("button", { name: "Next", exact: true }).isDisabled());
  await page.getByRole("button", { name: "Previous", exact: true }).click();
  await page.getByText("View 1 of 2", { exact: true }).waitFor();
  await page.getByLabel("Panel", { exact: true }).selectOption("canvas-panel");
  await page.getByLabel("Canvas", { exact: true }).selectOption({ index: 1 });
  await page.waitForFunction(() => document.querySelector("canvas-panel")?.getCanvasId?.().endsWith("/canvas/1"));
  await open("0002-mvm-audio");
  await page.getByRole("alert").filter({ hasText: "HTTP 503" }).waitFor();
  await open("0608-mvm-3d");
  await page.getByText("This resource has no renderable", { exact: false }).waitFor();
  await open("0231-transcript-meta-recipe");
  await page.getByText("This recipe publishes no standalone JSON", { exact: false }).waitFor();
  await open("0032-collection");
  await page.getByRole("button", { name: "Member manifest" }).click();
  await page.waitForFunction(() => !!document.querySelector("canvas-panel")?.getCanvasId?.());
  await page.setViewportSize({ width: 390, height: 844 });
  assert(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    "Mobile layout must not overflow",
  );
  assert.deepEqual(errors, []);
  console.log(
    "Passed: catalogue, rendered pixels, variants, search, sequence navigation, panel switching, errors, unsupported resources, collections and mobile layout.",
  );
} finally {
  await browser.close();
}
