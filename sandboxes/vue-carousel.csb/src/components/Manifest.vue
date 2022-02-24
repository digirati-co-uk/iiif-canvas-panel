<script>
export default {
  name: "Manifest",
  inject: ["vault"],
  props: {
    manifestId: String,
  },
  provide() {
    return {
      manifest: this.context,
    };
  },
  data() {
    return {
      context: {
        current: null,
      },
    };
  },
  created() {
    this.vault.loadManifest(this.manifestId).then((manifest) => {
      this.context.current = manifest;
    });
  },
  setup(props, { slots }) {
    return () => slots.default();
  },
};
</script>
