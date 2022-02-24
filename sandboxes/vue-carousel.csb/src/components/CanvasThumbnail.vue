<template>
  <div :v-if="thumbnail.current" :class="active ? 'image image--active' : 'image'">
    <img :src="thumbnail.current?.id" alt="thumbnail" />
  </div>
</template>

<script>
import CanvasMixinVue from "../mixins/CanvasMixin.vue";

export default {
  name: "CanvasThumbnail",
  inject: ["vault", "thumbs"],
  mixins: [CanvasMixinVue],
  props: {
    active: Boolean,
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

<style>

.image {
  cursor: pointer;
  border: 2px solid transparent;
  background: rgb(0, 0, 0);
  padding: 2px;
  height: 120px;
  width: 120px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.image--active {
  border-color: red;
}

.image img {
  display: inline-block;
  object-fit: contain;
  flex-shrink: 0;
  width: 100%;
  height: 100%;
}

</style>
