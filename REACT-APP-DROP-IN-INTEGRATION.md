# Drop-in Canvas Panel web components for an existing React application

Assessment: 21 September 2026. Companion to [renderer unification](CANVAS-PANEL-RENDERER-UNIFICATION.md) and the [v2 plan](V2-REVIEW-AND-PLAN.md).

This considers an application that already uses React, React DOM and React IIIF Vault. The recommended examples below describe a **proposed v2 API**; the `/react`, `/elements` and shared scene entrypoints are not all implemented in the current Canvas Panel package.

## Recommendation

Yes. Provide a small React adapter around the actual `<canvas-panel>` element, distributed in the same Canvas Panel package. It should reuse the application's compatible React, React IIIF Vault and Atlas modules, automatically pass through its existing Vault instance, translate React props/events, and render slot content as ordinary React children.

For the application author, the intended integration is one installation and one component import. They should not need to write a ref/effect wrapper, register every custom event, copy a provider tree, configure React aliases, or load a standalone script.

For the package, this is a thin adapter over the same web component used by HTML/Vue/Svelte. Combined with the shared renderer proposal, there is one strategy/image/timeline implementation and two host integrations: the existing React IIIF Vault viewer and the native web-component host.

Having React DOM in the application is fine. Canvas Panel need not import it or create another React DOM root to participate in that application.

## The intended application code

Assuming the application has versions within Canvas Panel's tested peer ranges:

```sh
npm install @digirati/canvas-panel-web-components
```

Under its existing `VaultProvider`, it can render:

```tsx
// Proposed v2 entrypoint. Alias avoids confusion with react-iiif-vault's CanvasPanel.
import { CanvasPanel as CanvasPanelElement } from
  '@digirati/canvas-panel-web-components/react';

export function DocumentViewer({ manifestId, canvasId }) {
  return (
    <CanvasPanelElement
      manifestId={manifestId}
      canvasId={canvasId}
      height={600}
    />
  );
}
```

The adapter reads the current Vault in the application's React tree and assigns that exact object to the element's `vault` property. It installs explicit providers around the internal Atlas scene using that object. It does not create a second Vault just because there is a custom-element boundary.

Use precedence `explicit vault prop → surrounding VaultProvider → one stable fallback Vault per adapter instance`. The last case makes the adapter usable outside an existing provider without silently sharing a process-global store. Reuse existing context exports for this; no new context bridge library is needed. The current `useExistingVault` falls back to `globalVault()`, so it cannot implement this particular fallback policy unchanged.

For applications with multiple Vaults, the override is explicit:

```tsx
<CanvasPanelElement vault={archiveVault} manifestId={manifestId} />
```

The adapter should require `manifestId`/`canvasId` where appropriate rather than implicitly binding to every surrounding resource/navigation context. Sharing a Vault means sharing loaded IIIF resources, not automatically sharing the application's current page or viewer selection.

## What “code-efficient” means here

| Concern | Proposed behavior | Remaining cost |
| --- | --- | --- |
| Application integration | Import and render one typed component | Optional event/slot code for custom UI |
| React runtime | Resolve the application's React and JSX runtime modules | An Atlas renderer root per independent viewer, not another React library |
| React DOM | Already owned by the app; used for the adapter's normal element/children | No new Canvas Panel React DOM root |
| React IIIF Vault | Import existing core/shared scene modules | Additional scene modules only if the app did not already use them |
| Atlas/reconciler | Reuse compatible installed modules | Runtime, scene and event state per viewer |
| IIIF data | Pass the same Vault instance | Independent view state; some helper work and media/image requests can still occur |
| Implementation maintenance | One shared strategy/image/timeline implementation | Thin host-specific DOM presentation and lifecycle code |

Do not promise a zero-byte installation or zero repeated network activity. The web-component shell, native media adapter, slot machinery and element API are additional code. Resource sharing avoids separate Vault caches, but does not automatically deduplicate every image-service request, helper cache or media request.

A shared package version also does not by itself prove identical runtime modules: ESM/CommonJS conditions, duplicate package installations and peer-resolution variants can split the graph. Validate the packed consumer, not just `npm ls`.

## Package contract for reuse

Use the module build in React applications. Reserve the self-contained script for plain script consumers.

| Entry | Contract |
| --- | --- |
| `/react` | Thin React wrapper; uses core context and element APIs; safe module evaluation during SSR |
| `/elements` | Explicit, idempotent custom-element registration plus element types; browser DOM construction deferred until registration |
| Module scene/runtime dependencies | External React, React IIIF Vault and Atlas dependencies resolved by the app's bundler |
| Self-contained script | Bundles the runtime for standalone use; deliberately not the deduplicated React-app route |
| React-global script | Separate deployment mode from the v2 plan; unnecessary for a normal bundled React application |

Declare React, React IIIF Vault and Atlas as compatible peers for the shared module distribution, with development dependencies for package builds/tests. Keep reconciler compatibility aligned with the Atlas release actually tested; do not allow a broad React range that its host configuration cannot support. If Canvas Panel imports the reconciler directly, it must account for that dependency explicitly too.

The installed previews currently align with React 19.2/reconciler 0.33. Older React or older React IIIF Vault applications may need an upgrade. “Already installed” is not sufficient if their versions lack the new entrypoints or use an incompatible reconciler. Peer warnings should identify this clearly; do not solve it by bundling a private second React or asking users to force dependency resolutions.

Externalize dependency subpaths as well as package roots, including `react/jsx-runtime`, `react-iiif-vault/core`, the proposed scene entry, and `@atlas-viewer/atlas/react`. Build the legacy React IIIF Vault renderer and new scene entry from the same source modules so consumers do not download separate copies of the renderer merely because they use different exports.

No manual `window.React`, Vite aliases or application `resolve.dedupe` workaround should be necessary for the supported packed installation. Such workarounds can hide a packaging defect.

## The React wrapper's responsibilities

Keep the wrapper small, but put the tricky lifecycle work in the package rather than making every application repeat it:

1. Register elements on the client, once. Importing the adapter on a server must not evaluate an unguarded `class extends HTMLElement` or read `window`.
2. Forward the actual element through `ref`. Expose its normal public API, not another parallel viewer controller.
3. Assign object-valued properties such as `vault` and choices as properties. Translate scalar props into the element's established attributes/properties.
4. Subscribe to custom events and remove listeners on replacement/unmount. Present typed callbacks such as `onCanvasChange`; define whether they receive event detail or the full event consistently. The recommendation is typed detail.
5. Subscribe to slot/snapshot state only when needed, with stable snapshots and a stable server snapshot. Do not rerender the app on every Atlas animation frame.
6. Render active custom controls as ordinary light-DOM children assigned to native slots. The element owns its shadow DOM; React owns those children.

React supports dashed custom-element tags, property assignment for properties present on the element, and custom-event listeners. A package wrapper still adds value for types, registration, Vault propagation and a consistent API. See the official [React custom-element documentation](https://react.dev/reference/react-dom/components#custom-html-elements).

The element must support property assignment before upgrade, and configuration arriving just after connection. In particular, it must not permanently initialize with a fallback Vault before the wrapper can supply the application's Vault. Treat connection/configuration as one reconciled initialization step; attach listeners before emitting initial readiness events. The exact scheduling belongs in the element implementation and needs a browser test.

For SSR, render a stable custom-element shell and any deterministic starter children. Register and configure after client mount; do not render the Atlas scene on the server. A framework with React Server Components will use the adapter from a client component. Client-only rendering may be offered as a convenience, but is not proof that import/hydration works.

Changing the `vault` prop should deliberately dispose and recreate the resource/scene session with the new Vault. Ordinary canvas/manifest/size changes should update the existing element. Neither operation should remount framework-owned controls unnecessarily.

## Controlled navigation and events

A React app will commonly want its router or viewer state to own the canvas ID:

```tsx
// Proposed v2 event callback receives typed detail.
<CanvasPanelElement
  manifestId={manifestId}
  canvasId={canvasId}
  onCanvasChange={({ canvasId: next }) => setCanvasId(next)}
/>
```

Define `canvasId` as controlled when supplied: user navigation reports a requested new value, and the application commits it through the prop. Offer `defaultCanvasId` for uncontrolled use. Do not let React props and imperative methods silently compete as two authoritative states.

The wrapper may need a controlled-mode option in the element controller so it can report a navigation request before committing it; name that internal seam during implementation. Preserve legacy DOM `canvas-change` behavior for direct element consumers through a compatibility adapter. This is a proposed contract, not a claim that today's `canvas-change` event already provides request/commit semantics or this detail shape.

Avoid echo loops: prop updates should not emit an endless stream of identical callbacks, and a parent declining a navigation request must leave the controlled viewer consistent. Test sequences and choices as well as a single canvas.

## Custom controls keep the application's React context

With the proposed slots API:

```tsx
<CanvasPanelElement
  manifestId={manifestId}
  slots={{
    'video-controls': context => <AppVideoControls panel={context} />,
    'timeline-controls': context => <AppTimelineControls panel={context} />,
  }}
/>
```

The wrapper renders each active slot instance under the original React tree, assigning its generated native slot name. A theme, router or application context therefore remains available to `AppVideoControls`. The callback receives panel state/actions because the component does not automatically inherit contexts from the separate Atlas root.

These render callbacks are normal callbacks: hooks belong inside `AppVideoControls`, not directly inside the callback body. Controls should remain mounted across ordinary snapshot updates and only reset when their documented slot identity changes.

Existing React IIIF Vault controls that depend on its `MediaPlayerProvider` or `ComplexTimelineProvider` cannot simply be moved into a native slot and expected to find those providers. Initially use the supplied slot actions/snapshot. If direct reuse of those existing controls is required, add a small opt-in adapter that provides the **same** controller/store through the relevant context. Do not create a second player or clock to satisfy a hook.

Simple starter HTML and `data-action="play"` can still work as slotted children. A React component with its own click handler should not also opt into the same declarative action, or it may trigger playback twice.

## Should this version use the application's React DOM internally?

It could, but that is not the recommended default. A second `createRoot` inside the element would still require context propagation, adds another lifecycle boundary, and makes the web-component implementation differ from the standalone native host. It also works against the v2 requirement that Canvas Panel's own runtime graph exclude React DOM.

Portals can preserve context for React-owned content, but are unnecessary for the initial adapter: native slots already let the application's React tree own its controls. Do not introduce a separate “React DOM enabled” Canvas Panel renderer unless a concrete unsupported UI requirement justifies it.

For an application that wants arbitrary React children inside the scene, the full editor, or all of React IIIF Vault's existing viewer APIs, its decomposed React Canvas Panel remains the better API. The web-component adapter is an easy addition for applications that want the element contract, native slots and cross-framework consistency. It need not replace every existing React viewer.

## Current state versus required work

Today, the package root registers elements as an import side effect. The element has a `vault` property and its internal component uses a Vault provider, but that is not yet the proposed tested React adapter contract. The current browser bundle embeds the transitional Preact runtime; module exports have not established the final shared-React consumer path.

Relevant sources: [element implementation](packages/canvas-panel/src/web-components/canvas-panel.tsx), [current package entry](packages/canvas-panel/src/index.ts), [browser bundling](packages/canvas-panel/tsdown.umd.ts), [upstream Vault context](../react-iiif-vault-compat/src/context/VaultContext.tsx).

Implementation order:

1. Complete the shared scene/native host migration described in the unification assessment.
2. Establish external dependency packaging and explicit element registration.
3. Add the typed `/react` adapter, automatic Vault propagation and lifecycle/event tests.
4. Add slot rendering and optional compatibility providers for existing media controls only when needed.
5. Publish and test a packed preview in a normal React/Vite application already using React IIIF Vault's own viewer on the same page.

That consumer test should verify one resolved React and shared upstream module instances, the exact same supplied Vault, independent viewer state, props/events, slots with host context, StrictMode cleanup, unmount/reconnect and production bundling. Include an SSR import/hydration check and a bundle graph report showing incremental code. Measure size before quoting a saving.

The resulting application integration can be genuinely small: install the package, import its React wrapper, render it under the existing provider. The work belongs in the shared renderer and package boundaries so each application does not have to solve those problems again.
