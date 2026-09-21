# One scene, two hosts

The decomposed React IIIF Vault viewer and the Canvas Panel React adapter share a Vault and the upstream scene renderer.
Each owns its playback controller. The web component's controls are mounted by `renderSlot`, subscribe through
`useMediaSlots`, and read an application React context to demonstrate that projection preserves framework ownership.

The local manifest forks IIIF cookbook 0489's real image and clock-video resources and cookbook 0002's Mahler audio. It
provides an image-only sequence with a gap, two overlapping uses of the same video with distinct source offsets, and
sequential audio. Local annotation/canvas identifiers distinguish these teaching fixtures from the originals.

The browser check substitutes small decoded media for repeatable tests; this visible example always uses the real URLs.
