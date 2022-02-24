<template>
  <h3>Manifest thumbs</h3>

  <div v-if="currentCanvas">
    <canvas-panel
      :manifest-id="manifest.current.id"
      :canvas-id="currentCanvas.id"
    />
  </div>

  <div v-if="manifest.current">
    <div
      v-bind:key="canvas.id"
      v-for="canvas in manifest.current?.items"
      v-on:click="handlerClick(canvas)"
    >
      <IIIFCanvas v-bind:canvasId="canvas.id">
        <CanvasThumbnail />
      </IIIFCanvas>
    </div>
  </div>
</template>

<script>
import IIIFCanvas from "./IIIFCanvas";
import CanvasThumbnail from "./CanvasThumbnail";

export default {
  name: "ManifestThumbnailList",
  inject: ["vault", "manifest"],
  components: {
    IIIFCanvas,
    CanvasThumbnail,
  },
  props: {},
  data() {
    return {
      currentCanvas: null,
      manifest: this.manifest,
    };
  },

  methods: {
    handlerClick(canvas) {
      this.currentCanvas = canvas;
    },
  },

  watch: {
    "manifest.current": {
      handler() {
        if (this.manifest.current && !this.currentCanvas) {
          this.currentCanvas = this.manifest.current.items[0];
        }
      },
    },
  },
};
</script>
