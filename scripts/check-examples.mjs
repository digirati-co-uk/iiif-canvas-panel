import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { chromium, webkit } from 'playwright';

const base = process.env.DOCS_URL || 'http://127.0.0.1:3000';
const browserType = process.env.EXAMPLE_BROWSER === 'webkit' ? webkit : chromium;
const browser = await browserType.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const canvasId = 'https://digirati-co-uk.github.io/wunder/canvases/2';
  await page.route('https://digirati-co-uk.github.io/wunder.json', (route) => route.fulfill({ json: {
    id: 'https://digirati-co-uk.github.io/wunder.json', type: 'Manifest', items: [{
      id: canvasId, type: 'Canvas', width: 960, height: 640, items: [{
        id: `${canvasId}/page`, type: 'AnnotationPage', items: [{
          id: `${canvasId}/painting`, type: 'Annotation', motivation: 'painting', target: canvasId,
          body: { id: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="960" height="640"><rect width="960" height="640" fill="#2463a7"/></svg>'), type: 'Image', format: 'image/svg+xml', width: 960, height: 640 },
        }],
      }],
    }],
  } }));
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  // Source is in the generated HTML, even without JavaScript or the preview service.
  const html = await (await page.request.get(`${base}/docs/intro`)).text();
  assert(html.includes('src/index.ts') && html.includes('loadManifest'));
  async function open(id) {
    await page.goto(`${base}/all-sandboxes#${id}`);
    const iframe = page.locator(`.docs-example-preview iframe[src$="/${id}.html"]`);
    await iframe.scrollIntoViewIfNeeded();
    const frame = await (await iframe.elementHandle()).contentFrame();
    await frame.waitForFunction(() => document.querySelector('canvas-panel')?.getCanvasId?.(), null, { timeout: 60000 });
    if (id === 'intro-script') await frame.waitForFunction(() => {
      const canvas = document.querySelector('canvas-panel').shadowRoot.querySelector('canvas');
      const pixel = canvas?.getContext('2d')?.getImageData(canvas.width / 2, canvas.height / 2, 1, 1).data;
      return pixel && pixel[0] === 36 && pixel[1] === 99 && pixel[2] === 167;
    });
    return frame;
  }
  let frame = await open('intro-script');
  assert.equal(await page.locator('.docs-example-source pre').count(), 1);
  await page.locator('.docs-example-files button', { hasText: 'index.html' }).click();
  assert((await page.locator('.docs-example-source pre').textContent()).includes('<canvas-panel'));
  await page.getByRole('button', { name: 'Reset preview' }).click();
  await page.locator('.docs-example-preview iframe').waitFor();
  const resetFrame = await (await page.locator('.docs-example-preview iframe').elementHandle()).contentFrame();
  await resetFrame.waitForFunction(() => document.querySelector('canvas-panel')?.getCanvasId?.());
  await resetFrame.locator('canvas-panel canvas').waitFor();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: `/tmp/canvas-example-${browserType.name()}-desktop.png`, fullPage: true });
  const lightBackground = await page.locator('.docs-example-header').evaluate((element) => getComputedStyle(element).backgroundColor);
  await page.getByRole('button', { name: /Switch between dark and light mode/ }).click();
  await page.waitForFunction((background) => getComputedStyle(document.querySelector('.docs-example-header')).backgroundColor !== background, lightBackground);
  await page.screenshot({ path: `/tmp/canvas-example-${browserType.name()}-dark.png`, fullPage: true });

  frame = await open('react-choices-example');
  const checkbox = frame.locator('input[type=checkbox]').nth(1);
  await checkbox.waitFor({ timeout: 60000 });
  const checked = await checkbox.isChecked();
  await checkbox.click();
  await frame.waitForFunction((expected) => document.querySelectorAll('input[type=checkbox]')[1].checked === expected, !checked);
  assert.equal(await frame.locator('canvas-panel').count(), 1);

  frame = await open('vue-3-carousel');
  const before = await frame.locator('canvas-panel').evaluate((panel) => panel.getCanvasId());
  await frame.locator('.thumb-list button').nth(1).click();
  await frame.waitForFunction((id) => document.querySelector('canvas-panel').getCanvasId() !== id, before);

  await page.setViewportSize({ width: 390, height: 844 });
  await open('intro-script');
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Mobile example overflows horizontally');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: `/tmp/canvas-example-${browserType.name()}-mobile.png`, fullPage: true });
  const link = page.getByRole('link', { name: 'Open in StackBlitz' });
  assert((await link.getAttribute('href')).includes('example-editor?id=intro-script'));
  const supportsInline = browserType === chromium && await page.evaluate(() => window.crossOriginIsolated);
  assert.equal(await page.getByRole('button', { name: 'Edit here' }).count(), supportsInline ? 1 : 0);

  // A failed project fetch leaves a recoverable launcher instead of a blank tab.
  let failures = 0;
  await page.route('**/examples/projects/intro-script.json', (route) => { failures++; return route.fulfill({ status: 503, body: 'Unavailable' }); });
  await page.goto(`${base}/example-editor?id=intro-script`);
  await page.getByRole('alert').waitFor();
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await page.waitForFunction(() => document.querySelector('[role="alert"]')?.textContent.includes('503'));
  assert.equal(failures, 2);

  const catalog = JSON.parse(await readFile('.docs-examples/catalog.json', 'utf8'));
  for (const example of catalog.examples) {
    const response = await page.request.get(`${base}/examples/${example.id}.html`);
    assert.equal(response.status(), 200, example.id);
  }
  assert.deepEqual(errors, []);
  console.log(`Example previews, interactions, source, reset, mobile layout and export links passed (${browserType.name()}).`);
} finally { await browser.close(); }
