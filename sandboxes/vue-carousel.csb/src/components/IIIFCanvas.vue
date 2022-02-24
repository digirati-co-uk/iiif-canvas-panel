<script>
export default {
  name: "IIIFCanvas",
  inject: ["vault", "manifest"],
  props: {
    canvasId: String,
  },
  provide() {
    return {
      canvas: this.context,
    };
  },
  beforeMount() {
    this.setCanvasFromManifest(this.manifest.current);
  },
  data() {
    return {
      context: {
        current: null,
      },
    };
  },
  methods: {
    setCanvasFromManifest() {
      if (!this.manifest.current) {
        return undefined;
      }
      this.context.current = this.vault.get({
        id: this.canvasId,
        type: "Canvas",
      });
    },
  },
  watch: {
    canvasId: {
      handler() {
        this.setCanvasFromManifest();
      },
    },
    "manifest.current": {
      handler() {
        this.setCanvasFromManifest();
      },
    },
  },
  setup(props, { slots }) {
    return () => slots.default();
  },
};
</script>