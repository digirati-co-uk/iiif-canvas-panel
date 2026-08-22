const path = require("path");

module.exports = {
  stories: [
    "../src/**/*.stories.@(js|jsx|ts|tsx)",
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-webpack5-compiler-babel",
  ],
  framework: {
    name: "@storybook/react-webpack5",
    options: {},
  },
  core: {
    disableTelemetry: true,
  },
  typescript: { reactDocgen: false },
  webpackFinal: async (config) => {
    // @atlas-viewer/atlas is linked in via `link:../atlas` (a sibling checkout,
    // for testing an in-progress atlas branch). Its dist/index.js physically
    // lives inside that separate checkout, which has its own independent,
    // separately-versioned node_modules (installed by atlas's own pnpm
    // workspace), so Node's resolution for its bare imports ("react",
    // "@iiif/helpers/thumbnail", etc.) finds atlas's own copies — a different
    // major/minor than this workspace's — instead of the ones canvas-panel
    // actually renders with.
    //
    // require("webpack") from here would resolve via a normal node_modules
    // walk-up and find webpack 4.47.0 (pulled in by Docusaurus, hoisted
    // higher in the tree) instead of the 5.75.0 this builder actually runs —
    // a different major version's Plugin classes aren't interchangeable.
    // Resolve webpack relative to the framework package storybook itself
    // uses, so this is guaranteed to be the exact same instance/version.
    const webpack = require(
      require.resolve("webpack", {
        paths: [require.resolve("@storybook/react-webpack5")],
      })
    );

    // canvas-panel's own directory. Redirecting through it (rather than a
    // pre-resolved absolute path from Node's own require.resolve) makes
    // webpack apply its *own* mainFields/exports resolution for a bare
    // specifier — the same one canvas-panel's own imports get. Node's
    // require.resolve() and webpack's resolver can pick *different* builds
    // of the same package for the same bare specifier (e.g. preact's CJS
    // "main" vs ESM "module" build) — two physically different files
    // implementing the same library, each with its own module-scoped
    // state, is the exact "two live copies" hazard this whole thing exists
    // to avoid, just one level more subtle than "two different packages".
    const canvasPanelDir = path.dirname(
      require.resolve("@digirati/canvas-panel-web-components/package.json")
    );
    const resolveLikeCanvasPanel = (request) =>
      require.resolve(request, { paths: [canvasPanelDir] });

    // canvas-panel renders entirely on preact/compat (its own components
    // import "React" and all hooks from "preact/compat", never "react").
    // Everything canvas-panel actually renders through — the linked atlas
    // branch, react-iiif-vault, and *their* transitive dependencies
    // (react-error-boundary, react-lazy-load-image-component, zustand,
    // use-sync-external-store, ...) — is genuine React code that calls
    // real React's hook implementation internally. Calling real React's
    // hooks while preact's reconciler is the one actually driving the
    // render (no real React render pass ever starts) throws "Invalid hook
    // call: ... you might have more than one copy of React".
    //
    // Enumerating every transitive dependency that needs redirecting is a
    // losing game — react-iiif-vault alone pulls in half a dozen, and atlas
    // pulls in its own set. Instead, redirect "react"'s bare imports
    // *everywhere in this bundle* to preact/compat, except the two places
    // that must stay on real React: Storybook's own manager/preview
    // machinery (@storybook/*, storybook/*), and this project's own story
    // files, which Storybook's real-React renderer mounts directly. Every
    // other module reached from here is, transitively, part of the
    // preact-rendered <canvas-panel> tree.
    const needsRealReact = (context) =>
      /[\\/]node_modules[\\/](@storybook|storybook)[\\/]/.test(context) ||
      /[\\/]src[\\/]stories$/.test(context) ||
      // Real react-dom's own react-dom/client.js internally does
      // `require('react-dom')` to get at its createRoot. That request's
      // context is react-dom's own package directory — caught by the
      // blanket rule below just like any other module, it would get
      // redirected to preact/compat too, leaving *real* react-dom/client
      // (used by Storybook's own react-dom-shim, matched above, to mount
      // the story) calling `.createRoot` on preact/compat instead of on
      // itself. A package never needs to be redirected away from its own
      // internal cross-references.
      /[\\/]node_modules[\\/]\.pnpm[\\/](react|react-dom)@/.test(context);

    const preactAliases = {
      react: "preact/compat",
      "react-dom": "preact/compat",
      // atlas's HTMLPortal/DevTools overlay rendering mounts an isolated
      // root via createRoot() from "react-dom/client". Redirecting that to
      // preact/compat's own "client" shim (same createRoot/render/unmount
      // API) keeps that portal's root and the content passed to it (also
      // built with preact/compat's createElement, via this same redirect)
      // on the same preact instance, rather than a real-React root fed
      // elements that were actually built by preact's h().
      "react-dom/client": "preact/compat/client",
      "react/jsx-runtime": "preact/jsx-runtime",
    };
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /^react(-dom)?(\/(jsx-runtime|client))?$|^react-reconciler$/,
        (resource) => {
          if (needsRealReact(resource.context)) return;
          if (resource.request === "react-reconciler") {
            // Not swapped for a preact equivalent (there isn't one) — it
            // stays real, but must still be *this workspace's* real
            // react-reconciler@0.29.2 (paired with our React 18), not
            // atlas's own react-reconciler@0.33.0 (paired with React 19
            // internals). unstable_noReconciler mode (how canvas-panel
            // renders atlas) never actually runs it, but atlas calls
            // `Reconciler_(hostConfig)` and `reconciler.injectIntoDevTools()`
            // unconditionally as a module-load side effect, so it still has
            // to load cleanly.
            resource.request = resolveLikeCanvasPanel("react-reconciler");
          } else if (preactAliases[resource.request]) {
            resource.request = resolveLikeCanvasPanel(preactAliases[resource.request]);
          }
        }
      )
    );

    // @iiif/helpers's "exports" map doesn't expose "./thumbnail" the same
    // way when reached from atlas's directory as it does from this
    // workspace's own resolution — same "two copies" story as above, for
    // atlas's one direct @iiif/helpers import.
    config.module.rules.unshift({
      test: /[\\/]atlas[\\/]dist[\\/]/,
      resolve: {
        alias: {
          "@iiif/helpers/thumbnail$": resolveLikeCanvasPanel("@iiif/helpers/thumbnail"),
        },
      },
    });

    return config;
  },
};
