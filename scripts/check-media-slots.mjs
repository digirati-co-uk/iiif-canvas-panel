import assert from "node:assert/strict";
import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const manifestUrl = "https://iiif.io/api/cookbook/recipe/0003-mvm-video/manifest.json";
const canvasId = "https://iiif.io/api/cookbook/recipe/0003-mvm-video/canvas";
const mediaUrl = "https://fixtures.iiif.io/video/indiana/lunchroom_manners/high/lunchroom_manners_1024kb.mp4";
try {
  // Record a tiny actual video locally: playback tests need neither external streaming nor mocked play().
  const bytes = await page.evaluate(async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 160;
    canvas.height = 90;
    const context = canvas.getContext("2d");
    const stream = canvas.captureStream(10);
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    const chunks = [];
    recorder.ondataavailable = (event) => chunks.push(event.data);
    const result = new Promise((resolve) => {
      recorder.onstop = async () => resolve(Array.from(new Uint8Array(await new Blob(chunks).arrayBuffer())));
    });
    recorder.start();
    let count = 0;
    const timer = setInterval(() => {
      context.fillStyle = count++ % 2 ? "blue" : "orange";
      context.fillRect(0, 0, 160, 90);
    }, 100);
    await new Promise((resolve) => setTimeout(resolve, 1600));
    clearInterval(timer);
    recorder.stop();
    for (const track of stream.getTracks()) track.stop();
    return result;
  });
  await page.route(manifestUrl, (route) =>
    route.fulfill({
      json: {
        id: manifestUrl,
        type: "Manifest",
        label: { en: ["Video controls test"] },
        items: [
          {
            id: canvasId,
            type: "Canvas",
            width: 480,
            height: 360,
            duration: 2,
            items: [
              {
                id: `${canvasId}/page`,
                type: "AnnotationPage",
                items: [
                  {
                    id: `${canvasId}/annotation`,
                    type: "Annotation",
                    motivation: "painting",
                    target: canvasId,
                    body: { id: mediaUrl, type: "Video", format: "video/webm", width: 480, height: 360, duration: 2 },
                  },
                ],
              },
            ],
          },
        ],
      },
    }),
  );
  // A short PCM WAV also exercises the audio renderer and strategy transition.
  const wav = Buffer.alloc(44 + 16000);
  wav.write("RIFF", 0);
  wav.writeUInt32LE(wav.length - 8, 4);
  wav.write("WAVEfmt ", 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(8000, 24);
  wav.writeUInt32LE(16000, 28);
  wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(16, 34);
  wav.write("data", 36);
  wav.writeUInt32LE(16000, 40);
  await page.route("https://example.org/test.wav", (route) => route.fulfill({ contentType: "audio/wav", body: wav }));
  const audioResource = "https://fixtures.iiif.io/audio/indiana/mahler-symphony-3/CD1/medium/128Kbps.mp4";
  await page.route(audioResource, (route) => route.fulfill({ contentType: "audio/wav", body: wav }));
  await page.route(mediaUrl, (route) => route.fulfill({ contentType: "video/webm", body: Buffer.from(bytes) }));
  await page.goto(`${process.env.DOCS_URL || "http://127.0.0.1:3000"}/all-sandboxes#media-slots`);
  const iframe = page.locator('.docs-example-preview iframe[src$="/media-slots/"]');
  await iframe.waitFor();
  const frame = await (await iframe.elementHandle()).contentFrame();
  await frame.waitForFunction(() => document.querySelector("canvas-panel")?.getMediaSlots?.()[0]?.ready);
  assert.equal(
    await frame.locator('slot[name="video-controls"]').evaluate((slot) => slot.assignedElements().length),
    1,
  );
  const play = frame.locator('[data-action="toggle-play"]');
  await play.click();
  await frame.waitForFunction(() => document.querySelector("canvas-panel").getMediaSlots()[0].paused === false);
  await play.click();
  await frame.waitForFunction(() => document.querySelector("canvas-panel").getMediaSlots()[0].paused);
  await frame.locator('[data-action="toggle-mute"]').click();
  await frame.waitForFunction(
    () => document.querySelector('[data-action="toggle-mute"]').getAttribute("aria-pressed") === "true",
  );
  assert.equal(await frame.locator("video").evaluate((video) => video.controls), false);
  await frame.evaluate(() => {
    window.originalPlayer = document.querySelector("#panel").shadowRoot.querySelector("video");
    document.querySelector("#panel").removeAttribute("native-controls");
  });
  await frame.waitForFunction(() => window.originalPlayer.controls);
  await frame.evaluate(() => document.querySelector("#panel").setAttribute("native-controls", "false"));
  await frame.waitForFunction(() => !window.originalPlayer.controls);
  assert.equal(
    await frame.evaluate(
      () => document.querySelector("#panel").shadowRoot.querySelector("video") === window.originalPlayer,
    ),
    true,
  );

  await frame.evaluate(() => {
    const panel = document.querySelector("canvas-panel");
    window.originalControls = panel.firstElementChild;
    window.originalSlot = panel.shadowRoot.querySelector('slot[name="video-controls"]');
    window.oldActions = panel.getMediaSlots()[0].actions;
    const second = panel.cloneNode(true);
    second.id = "second";
    panel.after(second);
  });
  await frame.waitForFunction(() => document.querySelector("#second").getMediaSlots?.()[0]?.ready);
  assert.equal(await frame.evaluate(() => document.querySelector("#second").getMediaSlots()[0].muted), false);
  await frame.evaluate(() => {
    window.originalControls.slot = "unused";
  });
  await frame.waitForFunction(() => window.originalSlot.assignedElements().length === 0);
  await frame.evaluate(() => {
    window.originalControls.querySelector('[data-action="toggle-mute"]').click();
  });
  assert.equal(await frame.evaluate(() => document.querySelector("#panel").getMediaSlots()[0].muted), true);
  await frame.evaluate(() => {
    window.originalControls.slot = "video-controls";
  });
  await frame.waitForFunction(() => window.originalSlot.assignedElements().length === 1);
  await frame.locator('#panel [data-action="toggle-mute"]').click();
  await frame.waitForFunction(() => document.querySelector("#panel").getMediaSlots()[0].muted === false);

  await frame.evaluate(async () => {
    const panel = document.querySelector("#second");
    const id = "https://example.org/audio-canvas";
    await panel.vault.load(id, {
      id,
      type: "Canvas",
      width: 480,
      height: 360,
      duration: 1,
      items: [
        {
          id: `${id}/page`,
          type: "AnnotationPage",
          items: [
            {
              id: `${id}/annotation`,
              type: "Annotation",
              motivation: "painting",
              target: id,
              body: { id: "https://example.org/test.wav", type: "Sound", format: "audio/wav", duration: 1 },
            },
          ],
        },
      ],
    });
    panel.firstElementChild.slot = "audio-controls";
    panel.setCanvas(id);
  });
  await frame.waitForFunction(
    () =>
      document.querySelector("#second").getMediaSlots()[0]?.mediaType === "audio" &&
      document.querySelector("#second").getMediaSlots()[0]?.ready,
  );
  assert.equal(await frame.locator("#second audio").count(), 1);
  assert.equal(await frame.locator("#second audio").evaluate((audio) => audio.controls), false);
  assert.equal(await frame.locator("#second video").count(), 0);
  await frame.locator('#second [data-action="toggle-play"]').click();
  await frame.waitForFunction(() => document.querySelector("#second").getMediaSlots()[0].paused === false);
  await frame.locator('#second [data-action="toggle-play"]').click();

  await frame.evaluate(() => {
    window.panel = document.querySelector("#panel");
    window.player = window.panel.shadowRoot.querySelector("video");
    window.panel.remove();
  });
  await frame.waitForFunction(() => window.panel.getMediaSlots().length === 0);
  await frame.evaluate(() => window.oldActions.play());
  assert.equal(await frame.evaluate(() => window.player.paused), true);
  await frame.evaluate(() => document.body.append(window.panel));
  await frame.waitForFunction(() => window.panel.getMediaSlots()[0]?.ready);
  assert.equal(await frame.evaluate(() => window.panel.firstElementChild === window.originalControls), true);
  await page.goto(`${process.env.DOCS_URL || "http://127.0.0.1:3000"}/all-sandboxes#audio-slots`);
  const audioIframe = page.locator('.docs-example-preview iframe[src$="/audio-slots/"]');
  await audioIframe.waitFor();
  const audioFrame = await (await audioIframe.elementHandle()).contentFrame();
  await audioFrame.waitForFunction(() => document.querySelector("canvas-panel")?.getMediaSlots?.()[0]?.ready);
  assert.equal(await audioFrame.locator("audio").evaluate((audio) => audio.controls), false);
  assert.equal(await audioFrame.locator('[data-bind="label"]').textContent(), "Symphony No. 3");
  assert.equal(
    await audioFrame.locator('[data-bind="summary"]').textContent(),
    "Gustav Mahler. A recording from the IIIF cookbook’s audio example.",
  );
  assert.equal(
    await audioFrame.locator('slot[name="audio-controls"]').evaluate((slot) => slot.assignedElements().length),
    1,
  );
  await audioFrame.locator('[data-action="toggle-play"]').click();
  await audioFrame.waitForFunction(() => document.querySelector(".player").dataset.playing === "true");
  await audioFrame.locator('[data-action="toggle-play"]').click();
  await audioFrame.waitForFunction(() => document.querySelector(".player").dataset.playing === "false");
  await audioFrame.locator('[data-action="toggle-mute"]').click();
  await audioFrame.waitForFunction(
    () => document.querySelector('button[data-action="toggle-mute"]').getAttribute("aria-pressed") === "true",
  );
  await audioFrame.locator("#volume").press("ArrowLeft");
  await audioFrame.waitForFunction(() => document.querySelector("canvas-panel").getMediaSlots()[0].volume < 1);
  await audioFrame.locator("#seek").press("ArrowRight");
  await audioFrame.waitForFunction(() => document.querySelector("canvas-panel").getMediaSlots()[0].currentTime > 0);
  assert.deepEqual(errors, []);
  console.log(
    "Media slots: real browser playback, native fallback, independent panels, reassignment and reconnect passed.",
  );
} finally {
  await browser.close();
}
