<template>
  <div :v-if="thumbnail.current">
    <img :src="thumbnail.current?.id" />
  </div>
</template>

<script>
import CanvasMixinVue from "../mixins/CanvasMixin.vue";

export default {
  name: "CanvasThumbnail",
  inject: ["vault", "thumbs"],
  mixins: [CanvasMixinVue],
  props: {
    manifestId: String,
  },
  provide() {
    return {
      manifest: this.context,
    };
  },
  methods: {
    setThumbnail(canvas) {
      this.thumbs
        .getBestThumbnailAtSize(canvas, {
          height: 256,
          width: 256,
        })
        .then(({ best }) => {
          this.thumbnail.current = best;
        });
    },
  },
  beforeMount() {
    this.setThumbnail(this.canvas.current);
  },
  watch: {
    canvas: {
      handler() {
        this.setThumbnail(this.canvas.current);
      },
    },
  },
  data() {
    return {
      thumbnail: {
        current: null,
      },
    };
  },
};
</script>
