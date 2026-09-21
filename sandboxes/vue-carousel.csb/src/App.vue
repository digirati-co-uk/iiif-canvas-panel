<template>
  <Manifest manifestId="https://iiif.wellcomecollection.org/presentation/b18035723">
    <div>
      <ManifestThumbnailList />
    </div>
  </Manifest>
</template>

<script>
import { globalVault } from "@iiif/helpers/vault";
import Manifest from "./components/Manifest.vue";
import ManifestThumbnailList from "./components/ManifestThumbnailList.vue";
import { createThumbnailHelper } from "@iiif/helpers/thumbnail";

export default {
  name: "App",
  components: {
    Manifest,
    ManifestThumbnailList,
  },
  // Share one Vault and thumbnail helper with the descendant components.
  provide() {
    return {
      vault: this.vault,
      thumbs: this.thumbs,
    };
  },

  data() {
    const vault = globalVault();
    return {
      vault: vault,
      thumbs: createThumbnailHelper(vault),
    };
  },
};
</script>

<style>
:root html,
:root body {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0;
  padding: 0;
}
</style>
