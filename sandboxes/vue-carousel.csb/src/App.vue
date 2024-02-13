<template>
  <Manifest
    manifestId="https://data.getty.edu/museum/api/iiif/826/manifest.json"
  >
    <div>
      <ManifestThumbnailList />
    </div>
  </Manifest>
</template>

<script>
import Manifest from "./components/Manifest";
import ManifestThumbnailList from "./components/ManifestThumbnailList";
import { createThumbnailHelper, globalVault } from "@iiif/helpers";

export default {
  name: "App",
  components: {
    Manifest,
    ManifestThumbnailList,
  },
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
