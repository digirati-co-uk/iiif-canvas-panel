import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
  headless: true,
});
try {
  for (const deviceScaleFactor of [1, 2]) {
    const page = await browser.newPage({
      viewport: { width: 1000, height: 900 },
      deviceScaleFactor,
    });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(
      `${process.env.DOCS_URL || 'http://127.0.0.1:3000'}/docs/installation`,
    );
    await page.waitForFunction(() => customElements.get('canvas-panel'));
    await page.setContent(
      '<style>body{margin:0} #spacer{height:200px} canvas-panel{display:block;margin-left:80px} footer{height:2000px}</style><div id="spacer"></div><main></main><footer></footer>',
    );
    await page.evaluate(async () => {
      const id = 'https://example.org/zoom/canvas';
      const p = document.createElement('canvas-panel');
      p.id = 'check';
      p.setAttribute('width', '600');
      p.setAttribute('height', '400');
      p.setAttribute('require-meta-key-for-wheel-zoom', 'false');
      document.querySelector('main').append(p);
      await p.vault.load(id, {
        id,
        type: 'Canvas',
        width: 1200,
        height: 800,
        items: [
          {
            id: id + '/page',
            type: 'AnnotationPage',
            items: [
              {
                id: id + '/painting',
                type: 'Annotation',
                motivation: 'painting',
                target: id,
                body: {
                  id:
                    'data:image/svg+xml,' +
                    encodeURIComponent(
                      '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="1200" height="800" fill="orange"/></svg>',
                    ),
                  type: 'Image',
                  width: 1200,
                  height: 800,
                },
              },
            ],
          },
        ],
      });
      p.setCanvas(id);
    });
    await page.waitForFunction(
      () =>
        document.querySelector('#check').shadowRoot.querySelector('canvas')
          ?.width ===
        600 * devicePixelRatio,
    );
    await page.evaluate(() =>
      document.querySelector('#check').withAtlas((rt) => (window.rt = rt)),
    );
    await page.waitForFunction(() => window.rt?.world.width === 1200);
    await page.evaluate(() => document.querySelector('#check').zoomIn());
    await page.waitForTimeout(600);
    await page.evaluate(() => {
      document.querySelector('#spacer').style.height = '380px';
      window.scrollTo(0, 190);
    });
    const canvas = page.locator('#check canvas');
    const box = await canvas.boundingBox();
    const local = { x: box.width * 0.55, y: box.height * 0.6 };
    const widthBefore = await page.evaluate(() => window.rt.width);
    const before = await page.evaluate(
      (p) => window.rt.viewerToWorld(p.x, p.y),
      local,
    );
    await page.mouse.move(box.x + local.x, box.y + local.y);
    await page.mouse.wheel(0, -160);
    await page.waitForTimeout(1000);
    const after = await page.evaluate(
      (p) => window.rt.viewerToWorld(p.x, p.y),
      local,
    );
    assert(
      (await page.evaluate(() => window.rt.width)) < widthBefore,
      'Wheel must actually zoom',
    );
    assert(
      Math.hypot(after.x - before.x, after.y - before.y) < 2,
      'Pointer zoom moved the target',
    );
    for (const preset of ['responsive', 'static']) {
      await page.evaluate(
        (preset) =>
          document.querySelector('#check').setAttribute('preset', preset),
        preset,
      );
      await page.waitForFunction(() =>
        document
          .querySelector('#check')
          .shadowRoot.querySelector('.atlas-static-image'),
      );
      const surface = page.locator('#check .atlas-static-container');
      assert.equal(
        await surface.evaluate((el) => getComputedStyle(el).touchAction),
        'auto',
      );
      const bounds = await surface.boundingBox();
      const scrollBefore = await page.evaluate(() => scrollY);
      await page.mouse.move(
        bounds.x + bounds.width / 2,
        bounds.y + bounds.height / 2,
      );
      await page.mouse.wheel(0, 100);
      await page.waitForFunction((before) => scrollY > before, scrollBefore);
    }
    assert.deepEqual(errors, []);
    await page.close();
  }
} finally {
  await browser.close();
}
console.log(
  'Passed: calibrated pointer zoom and native scrolling in responsive/static presets at 1x and 2x pixel density.',
);
