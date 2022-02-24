<script>
export default {
  name: "CanvasMixin",
  inject: ["canvas"],
  data() {
    return {
      canvas: this.canvas,
    };
  },
};
</script>