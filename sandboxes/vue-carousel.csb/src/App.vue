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
import { globalVault } from "@iiif/vault";
import Manifest from "./components/Manifest";
import ManifestThumbnailList from "./components/ManifestThumbnailList";
import { createThumbnailHelper } from "@iiif/vault-helpers";

export default {
  name: "App",
  components: {
    // HelloWorld: HelloWorldVue,
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
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
