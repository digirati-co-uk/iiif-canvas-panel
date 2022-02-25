<template>
  <main id="app">
    <canvas-panel :manifest-id="manifestId" :canvas-id="canvasId"></canvas-panel>
  </main>
</template>

<script>
import { ref } from "vue";
export default {
  name: "App",
  setup() {
    const manifestId = ref("https://digirati-co-uk.github.io/wunder.json");
    const canvasId = ref("https://digirati-co-uk.github.io/wunder/canvases/0");
    return { manifestId, canvasId };
  }
};
</script>
