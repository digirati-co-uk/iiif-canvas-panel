import assert from "node:assert/strict";
import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
try {
  // Real decoded media, with enough duration to test forward and backward seeks.
  const wav = Buffer.alloc(44 + 12 * 16000);
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
  wav.writeUInt32LE(wav.length - 44, 40);
  await page.route(
    /https:\/\/fixtures.iiif.io\/(video\/indiana\/30-minute-clock|audio\/indiana\/mahler-symphony-3)\//,
    (route) => {
      const range = /bytes=(\d+)-(\d*)/.exec(route.request().headers().range || "");
      const start = range ? Number(range[1]) : 0;
      const end = range?.[2] ? Math.min(Number(range[2]), wav.length - 1) : wav.length - 1;
      return route.fulfill({
        status: range ? 206 : 200,
        contentType: "audio/wav",
        body: wav.subarray(start, end + 1),
        headers: {
          "Accept-Ranges": "bytes",
          ...(range ? { "Content-Range": `bytes ${start}-${end}/${wav.length}` } : {}),
        },
      });
    },
  );
  const image = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 270;
    const context = canvas.getContext("2d");
    context.fillStyle = "#2163a7";
    context.fillRect(0, 0, 600, 270);
    return canvas.toDataURL().split(",")[1];
  });
  const service = "https://iiif.io/api/image/3.0/example/reference/36ca0a3370db128ec984b33d71a1543d-100320001004";
  await page.route(`${service}/**`, (route) =>
    route.request().url().endsWith("info.json")
      ? route.fulfill({
          json: {
            "@context": "http://iiif.io/api/image/3/context.json",
            id: service,
            type: "ImageService3",
            protocol: "http://iiif.io/api/image",
            profile: "level1",
            width: 70399,
            height: 31722,
            sizes: [{ width: 600, height: 270 }],
          },
        })
      : route.fulfill({
          contentType: "image/png",
          body: Buffer.from(image, "base64"),
          headers: { "Access-Control-Allow-Origin": "*" },
        }),
  );
  await page.goto(`${process.env.DOCS_URL || "http://127.0.0.1:3000"}/all-sandboxes#timeline-slots`);
  const iframe = page.locator('.docs-example-preview iframe[src$="/timeline-slots/"]');
  await iframe.waitFor();
  const frame = await (await iframe.elementHandle()).contentFrame();
  await frame.waitForFunction(() => document.querySelector("canvas-panel")?.getMediaSlots?.()[0]?.ready);
  const state = () =>
    frame.evaluate(() => {
      const { actions: _actions, ...state } = document.querySelector("canvas-panel").getMediaSlots()[0];
      return state;
    });
  assert.equal((await state()).strategy, "complex-timeline");
  assert.equal((await state()).duration, 12);
  await frame.locator("[data-timeline-text]").filter({ hasText: "Press Play" }).waitFor();
  await frame.evaluate(() => {
    window.timelineActions = document.querySelector("canvas-panel").getMediaSlots()[0].actions;
    window.timelineVideo = document.querySelector("canvas-panel").shadowRoot.querySelector("video");
  });
  await frame.waitForFunction(() => document.querySelector("canvas-panel").getMediaSlots()[0].canSeek);
  await frame.evaluate(() => window.timelineActions.seek(4));
  await frame.waitForFunction(
    () =>
      Number(getComputedStyle(window.timelineVideo.parentElement).opacity) === 1 &&
      Math.abs(window.timelineVideo.currentTime - 2) < 0.1,
  );
  assert.equal(await frame.locator("[data-timeline-text]").count(), 0);
  // Read a screenshot, not the viewer's canvas: remote IIIF images can taint its bitmap.
  let painted = false;
  for (let attempt = 0; attempt < 20 && !painted; attempt++) {
    const screenshot = await frame.locator("canvas").first().screenshot();
    painted = await page.evaluate(async (base64) => {
      const image = new Image();
      image.src = `data:image/png;base64,${base64}`;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0);
      const pixel = context.getImageData(canvas.width / 2, canvas.height / 2, 1, 1).data;
      return pixel[0] === 33 && pixel[1] === 99 && pixel[2] === 167;
    }, screenshot.toString("base64"));
  }
  assert.equal(painted, true, "The timed image must actually paint");
  assert.ok(await frame.locator("video").evaluate((video) => video.getBoundingClientRect().width > 20));
  await frame.locator('[slot="timeline-controls"] [data-action="toggle-play"]').click();
  await frame.waitForFunction(() => document.querySelector("canvas-panel").getMediaSlots()[0].currentTime > 4.1);
  await frame.locator('[slot="timeline-controls"] [data-action="toggle-play"]').click();
  await frame.evaluate(() => window.timelineActions.seek(0));
  await frame.locator("[data-timeline-text]").filter({ hasText: "Press Play" }).waitFor();
  assert.equal(await frame.locator("video").evaluate((video) => video === window.timelineVideo), true);
  await frame.evaluate(() => window.timelineActions.seek(9));
  await frame.locator("[data-timeline-text]").filter({ hasText: "End of sequence" }).waitFor();
  await frame.evaluate(() => window.timelineActions.seek(12));
  await frame.waitForFunction(() => document.querySelector("canvas-panel").getMediaSlots()[0].paused);
  assert.equal(await frame.locator("[data-timeline-text]").count(), 0);

  await frame.evaluate(() => {
    const first = document.querySelector("canvas-panel");
    const second = document.createElement("canvas-panel");
    second.id = "second";
    second.vault = first.vault;
    second.setAttribute("manifest-id", first.getManifestId());
    second.setAttribute("canvas-id", first.getCanvasId());
    document.body.append(second);
    window.second = second;
  });
  await frame.waitForFunction(() => window.second.getMediaSlots()[0]?.canSeek);
  await frame.evaluate(() => window.second.getMediaSlots()[0].actions.seek(4));
  assert.equal((await state()).currentTime, 12);
  assert.equal(await frame.evaluate(() => window.second.getMediaSlots()[0].currentTime), 4);
  await frame.evaluate(() => window.second.remove());
  await frame.waitForFunction(() => window.second.getMediaSlots().length === 0);

  // Removing authored controls reveals usable native slot fallback content.
  await frame.locator('[slot="timeline-controls"]').evaluate((node) => node.remove());
  await frame.locator('slot[name="timeline-controls"] button').click();
  await frame.waitForFunction(() => document.querySelector("canvas-panel").getMediaSlots()[0].paused === false);
  await frame.locator('slot[name="timeline-controls"] button').click();
  await frame.evaluate(() => {
    window.panel = document.querySelector("canvas-panel");
    window.panel.remove();
  });
  await frame.waitForFunction(() => window.panel.getMediaSlots().length === 0);
  await frame.evaluate(() => window.timelineActions.play());
  assert.equal(await frame.evaluate(() => window.timelineVideo.paused), true);
  // The decomposed upstream React viewer and web component consume identical IIIF.
  await page.goto(`${process.env.DOCS_URL || "http://127.0.0.1:3000"}/all-sandboxes#timeline-comparison`);
  const pairedIframe = page.locator('.docs-example-preview iframe[src$="/timeline-comparison/"]');
  await pairedIframe.waitFor();
  const paired = await (await pairedIframe.elementHandle()).contentFrame();
  await paired.waitForFunction(() => document.querySelector("canvas-panel")?.getMediaSlots?.()[0]?.ready);
  const seekReact = async (time) => {
    await paired.locator('#react-viewer input[type="range"]').evaluate((input, value) => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(input, String(value));
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }, time);
    await paired.waitForFunction(
      (time) => Number(document.querySelector("#react-viewer output")?.textContent) === time,
      time,
    );
  };
  const seekWeb = async (time) => {
    await paired.evaluate((time) => document.querySelector("canvas-panel").getMediaSlots()[0].actions.seek(time), time);
    await paired.waitForFunction(
      (time) => document.querySelector("canvas-panel").getMediaSlots()[0].currentTime === time,
      time,
    );
  };
  const paintedBlue = async (viewer) => {
    const screenshot = await paired
      .locator(viewer === "#web-viewer" ? `${viewer} canvas-panel` : `${viewer} canvas`)
      .first()
      .screenshot();
    return page.evaluate(async (base64) => {
      const image = new Image();
      image.src = `data:image/png;base64,${base64}`;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0);
      const pixel = context.getImageData(canvas.width / 2, canvas.height / 2, 1, 1).data;
      return pixel[0] === 33 && pixel[1] === 99 && pixel[2] === 167;
    }, screenshot.toString("base64"));
  };
  for (const sequence of ["images", "videos", "audio"]) {
    await paired.locator("select").selectOption(`https://example.org/iiif/timeline-comparison/${sequence}`);
    await paired.waitForFunction((sequence) => {
      const slot = document.querySelector("canvas-panel")?.getMediaSlots()[0];
      return slot?.canvasId.endsWith(`/${sequence}`) && slot.canSeek;
    }, sequence);
    await paired.locator("#react-viewer button").waitFor();
    assert.equal(await paired.locator('#web-viewer [slot="timeline-controls"] button').textContent(), "Play timeline");
    for (const time of [3, 5, 1, 12]) {
      await seekWeb(time);
      await seekReact(time);
      if (sequence === "images")
        for (const viewer of ["#web-viewer", "#react-viewer"]) {
          const expected = time === 3 || time === 1;
          let matches = false;
          for (let attempt = 0; attempt < 20 && !matches; attempt++) matches = (await paintedBlue(viewer)) === expected;
          assert.equal(matches, true, `${viewer} must ${expected ? "paint" : "remove"} the timed image at ${time}`);
        }
    }
    if (sequence === "videos") {
      await seekWeb(5);
      await seekReact(5);
      await paired.waitForFunction(() => {
        const videos = [...document.querySelector("canvas-panel").shadowRoot.querySelectorAll("video")];
        return (
          videos.length === 2 && Math.abs(videos[0].currentTime - 6) < 0.1 && Math.abs(videos[1].currentTime - 3) < 0.1
        );
      });
      // Media replacement is per annotation and preserves the aggregate clock/actions.
      await paired.evaluate(() => {
        const panel = document.querySelector("canvas-panel");
        window.timelineState = panel.getMediaSlots()[0];
        window.defaultVideo = panel.shadowRoot.querySelector("video");
        const source = panel.getSlots().find((slot) => slot.type === "media");
        window.removeReplacement = panel.registerSlot(source.slotName, ({ resourceId }) => {
          const video = document.createElement("video");
          video.src = resourceId;
          video.preload = "auto";
          return { element: video };
        });
      });
      await paired.waitForFunction(() => window.defaultVideo.hidden);
      await paired.waitForFunction(
        () => Math.abs(document.querySelector("canvas-panel > video").currentTime - 6) < 0.1,
      );
      assert.equal(
        await paired.evaluate(
          () => document.querySelector("canvas-panel").getMediaSlots()[0].actions === window.timelineState.actions,
        ),
        true,
      );
      await paired.evaluate(() => window.removeReplacement());
      await paired.waitForFunction(() => !window.defaultVideo.hidden);
      // Native events and rejected play are reflected by the shared controller.
      await paired.evaluate(() => {
        window.video = document.querySelector("canvas-panel").shadowRoot.querySelector("video");
        window.video.dispatchEvent(new Event("waiting"));
      });
      assert.equal(
        await paired.evaluate(() => document.querySelector("canvas-panel").getMediaSlots()[0].buffering),
        true,
      );
      await paired.evaluate(() => window.video.dispatchEvent(new Event("canplay")));
      assert.equal(
        await paired.evaluate(() => document.querySelector("canvas-panel").getMediaSlots()[0].buffering),
        false,
      );
      await paired.evaluate(async () => {
        window.video.play = () => Promise.reject(new Error("Playback deliberately blocked"));
        await document.querySelector("canvas-panel").getMediaSlots()[0].actions.play();
      });
      await paired.waitForFunction(() =>
        document.querySelector("canvas-panel").getMediaSlots()[0].error?.includes("deliberately blocked"),
      );
      assert.equal(await paired.evaluate(() => document.querySelector("canvas-panel").getMediaSlots()[0].paused), true);
      await paired.evaluate(() => {
        delete window.video.play;
        Object.defineProperty(window.video, "seekable", { configurable: true, value: { length: 0 } });
        window.video.dispatchEvent(new Event("progress"));
      });
      assert.equal(
        await paired.evaluate(() => document.querySelector("canvas-panel").getMediaSlots()[0].canSeek),
        false,
      );
      await paired.evaluate(() => {
        delete window.video.seekable;
        window.video.dispatchEvent(new Event("progress"));
      });
      await paired.waitForFunction(() => document.querySelector("canvas-panel").getMediaSlots()[0].canSeek);
      await paired.evaluate(() => {
        const panel = document.querySelector("canvas-panel");
        window.otherVideo = panel.shadowRoot.querySelectorAll("video")[1];
        panel.vault.dispatch({
          type: "@iiif/MODIFY_ENTITY_FIELD",
          payload: {
            type: "Annotation",
            id: "https://example.org/iiif/timeline-comparison/videos/a1",
            key: "target",
            value: "https://example.org/iiif/timeline-comparison/videos#xywh=320,0,320,360&t=6,12",
          },
        });
      });
      await paired.waitForFunction(() => getComputedStyle(window.otherVideo.parentElement).opacity === "0");
      assert.equal(
        await paired.evaluate(() => document.querySelector("canvas-panel").getMediaSlots()[0].currentTime),
        5,
      );
      assert.equal(
        await paired.evaluate(
          () => document.querySelector("canvas-panel").getMediaSlots()[0].actions === window.timelineState.actions,
        ),
        true,
      );
      // Replace one source, keeping the other native node and the controller intact.
      await paired.evaluate(async () => {
        const panel = document.querySelector("canvas-panel");
        const id = "https://fixtures.iiif.io/video/indiana/30-minute-clock/medium/30-minute-clock.mp4?updated";
        await panel.vault.load(`${id}/annotation`, {
          id: `${id}/annotation`,
          type: "Annotation",
          motivation: "painting",
          target: panel.getCanvasId(),
          body: { id, type: "Video", width: 640, height: 360, duration: 12, format: "video/mp4" },
        });
        const annotation = panel.vault.get("https://example.org/iiif/timeline-comparison/videos/a1");
        const body = structuredClone(annotation.body);
        body[0].source.id = id;
        panel.vault.dispatch({
          type: "@iiif/MODIFY_ENTITY_FIELD",
          payload: {
            type: "Annotation",
            id: annotation.id,
            key: "body",
            value: body,
          },
        });
      });
      await paired.waitForFunction(() =>
        document.querySelector("canvas-panel").shadowRoot.querySelectorAll("video")[1]?.src.endsWith("?updated"),
      );
      assert.equal(
        await paired.evaluate(
          () => document.querySelector("canvas-panel").shadowRoot.querySelector("video") === window.defaultVideo,
        ),
        true,
      );
      assert.equal(await paired.evaluate(() => window.otherVideo.paused), true);
      await paired.waitForFunction(() => document.querySelector("canvas-panel").getMediaSlots()[0].canSeek);
      await seekWeb(7);
      await seekReact(7);
    }
  }
  assert.deepEqual(errors, []);
  console.log(
    "Timeline: shared playback, target placement, forward/backward seeking, final exits, fallback controls and disposal passed.",
  );
} finally {
  await browser.close();
}
