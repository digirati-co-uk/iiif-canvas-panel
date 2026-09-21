<template>
  <div class="container">
    <h3>Manifest thumbs</h3>

    <div v-if="currentCanvas">
      <canvas-panel
        ref="viewer"
        :manifest-id="manifest.current.id"
        :canvas-id="currentCanvas.id"
        height="290"
        style-id="atlas-styles"
      />
    </div>

    <div v-if="manifest.current" class="thumb-list">
      <button
        type="button"
        :aria-label="`Show canvas ${canvas.id}`"
        :aria-pressed="currentCanvas?.id === canvas.id"
        v-bind:key="canvas.id"
        v-for="canvas in manifest.current?.items"
        v-on:click="handlerClick(canvas)"
      >
        <IIIFCanvas v-bind:canvasId="canvas.id">
          <CanvasThumbnail :active="currentCanvas.id === canvas.id" />
        </IIIFCanvas>
      </button>
    </div>
  </div>
</template>

<script>
import IIIFCanvas from "./IIIFCanvas.vue";
import CanvasThumbnail from "./CanvasThumbnail.vue";

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
      if (this.$refs.viewer) {
        this.$refs.viewer.goHome();
      }
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

<style>
.container {
  background: #3e8a6f;
  color: #fff;
}

.container h3 {
  padding: 1em 0;
  text-align: center;
  margin: 0;
}

.thumb-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  padding: 1em;
}

.thumb-list > button ~ button {
  margin-left: 1em;
}
</style>

<style>
.thumb-list > button {
  background: transparent;
  border: 0;
  padding: 0;
}
.thumb-list > button:focus-visible {
  outline: 3px solid white;
  outline-offset: 3px;
}
</style>
